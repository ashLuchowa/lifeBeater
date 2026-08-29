"use client";

import { Fragment, useEffect, useState } from "react";
import { LedgerHead, LedgerRow, LedgerSection, LedgerScroller, LedgerGap, LedgerAddRow } from "./LedgerTable";
import { useLedger } from "./LedgerData";
import CellEditor from "./CellEditor";
import {
  months,
  columnTotals,
  sum,
  cellAmount,
  signedAmount,
  share,
  isOtherIncome,
} from "@/lib/ledger";

// Everything below is derived from the five editable groups — nothing here is
// stored. Edit a cell and the totals, shares, summary cards and monthly net all
// fall out of the same numbers.
export default function LedgerBoard({ fy }) {
  const {
    ledger, loading, saving, error,
    setValue, setLabel, addRow, removeRow,
    setIncomeValue, setSourceLabel, addSource, removeSource,
    undo, redo, canUndo, canRedo,
    setCellTotal, addEntry, setEntry, removeEntry,
  } = useLedger(fy);

  // Which cell is open in the breakdown modal: { loc, month, label } or null.
  // Only the address is held — the row itself is read live out of the ledger on
  // every render, so the modal reflects each edit instead of a stale snapshot.
  const [openCell, setOpenCell] = useState(null);

  // Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z, but only outside a field — inside one the
  // browser undoes the text you are typing, which is what you would expect.
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z") return;
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);
  const { fixedCost, variableCost, incomeSources } = ledger;

  const fixedCols = columnTotals(fixedCost);
  const variableCols = columnTotals(variableCost);
  const expenseCols = months.map((_, i) => fixedCols[i] + variableCols[i]);
  const expenseTotal = sum(expenseCols);

  // Each source totals its own four weeks; income is the sum across sources.
  const sourceCols = incomeSources.map((src) => columnTotals(src.rows));
  const incomeCols = months.map((_, i) => sum(sourceCols.map((c) => c[i])));
  const incomeTotal = sum(incomeCols);

  const loc = openCell?.loc;
  const openRow = !loc
    ? null
    : loc.source !== undefined
      ? ledger.incomeSources[loc.source]?.rows[loc.row] ?? null
      : ledger[loc.group]?.[loc.row] ?? null;

  const netCols = months.map((_, i) => incomeCols[i] - expenseCols[i]);
  const netMax = Math.max(1, ...netCols.map(Math.abs));
  const net = incomeTotal - expenseTotal;

  const pctOfIncome = incomeTotal > 0 ? ((net / incomeTotal) * 100).toFixed(1) + "% of income" : "No income recorded";

  const summary = [
    { label: "Total Income", value: "$" + cellAmount(incomeTotal), note: "Main, side and other", bg: "#dff1e4", fg: "#14150f", chip: "#fff", dot: "#4a9c68" },
    { label: "Total Expenses", value: "$" + cellAmount(expenseTotal), note: "Fixed and variable", bg: "#fbd9da", fg: "#14150f", chip: "#fff", dot: "#dd6f74" },
    { label: "Net Position", value: signedAmount(net), note: pctOfIncome, bg: "#14150f", fg: "#fff", chip: "rgba(255,255,255,0.12)", dot: "#e0a92a" },
    { label: "Avg Monthly Net", value: signedAmount(net / 12), note: "Across 12 months", bg: "#fbecc4", fg: "#14150f", chip: "#fff", dot: "#e0a92a" },
  ];

  // Wires one group's rows up to the editing actions. `detail` decides how a
  // cell is edited: fixed costs are single recurring amounts, so they are typed
  // straight into the grid; everything else opens the breakdown modal.
  const editable = (key, family, whole, detail = true) => (row, i) => ({
    key: key + "-" + i,
    label: row.label,
    values: row.values,
    entries: row.entries,
    family,
    pct: share(sum(row.values), whole),
    onSetValue: detail ? undefined : (month, value) => setValue(key, i, month, value),
    onOpenCell: detail
      ? (month) => setOpenCell({ loc: { group: key, row: i }, month, label: row.label })
      : undefined,
    onSetLabel: (label) => setLabel(key, i, label),
    onRemove: () => removeRow(key, i),
  });

  const fixedRows = fixedCost.map(editable("fixedCost", "warm", expenseTotal, false));
  const variableRows = variableCost.map(editable("variableCost", "warm", expenseTotal));

  return (
    <>
      <div className="ledger-summary">
        {summary.map((s) => (
          <div key={s.label} className="ledger-summary-card" style={{ background: s.bg, color: s.fg }}>
            <div className="ledger-summary-top">
              <span className="ledger-summary-chip" style={{ background: s.chip }}>{s.label}</span>
              <span className="ledger-dot" style={{ background: s.dot }} />
            </div>
            <div>
              <div className="ledger-summary-value">{s.value}</div>
              <div className="ledger-summary-note">{s.note}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ledger-toolbar">
        <SaveState loading={loading} saving={saving} error={error} />
        <div className="ledger-toolbar-actions">
          <button type="button" className="ledger-btn" onClick={undo} disabled={!canUndo}>
            Undo
          </button>
          <button type="button" className="ledger-btn" onClick={redo} disabled={!canRedo}>
            Redo
          </button>
        </div>
      </div>

      <section className="ledger-card">
        <header className="ledger-card-head">
          <div className="ledger-title">Expenses</div>
          <span className="ledger-hint">Scroll for months →</span>
        </header>

        <LedgerScroller>
          <LedgerHead label="Fixed cost" />
          {fixedRows.map((r) => <LedgerRow key={r.key} {...r} />)}
          <LedgerAddRow onClick={() => addRow("fixedCost")}>Add fixed cost</LedgerAddRow>
          <LedgerRow label="Fixed Total" values={fixedCols} family="warm" pct={share(sum(fixedCols), expenseTotal)} emphasis="strong" />

          <LedgerGap />
          <LedgerSection label="Variable cost" />
          {variableRows.map((r) => <LedgerRow key={r.key} {...r} />)}
          <LedgerAddRow onClick={() => addRow("variableCost")}>Add variable cost</LedgerAddRow>
          <LedgerRow label="Variable Total" values={variableCols} family="warm" pct={share(sum(variableCols), expenseTotal)} emphasis="strong" />
          <LedgerRow label="Fixed + Variable" values={expenseCols} family="warm" pct="100%" emphasis="dark" />
        </LedgerScroller>
      </section>

      <section className="ledger-card">
        <header className="ledger-card-head">
          <div className="ledger-title">Income</div>
          <span className="ledger-hint">Scroll for months →</span>
        </header>

        <LedgerScroller>
          <LedgerHead label="Source" />

          {incomeSources.map((src, si) => (
            <Fragment key={si}>
              {si > 0 && <LedgerGap />}
              <LedgerSection
                label={src.label}
                placeholder="Income source"
                onSetLabel={isOtherIncome(src) ? undefined : (label) => setSourceLabel(si, label)}
                onRemove={isOtherIncome(src) ? undefined : () => removeSource(si)}
              />
              {src.rows.map((row, ri) => (
                <LedgerRow
                  key={ri}
                  label={row.label}
                  values={row.values}
                  entries={row.entries}
                  family="cool"
                  pct={share(sum(row.values), incomeTotal)}
                  onSetValue={
                    isOtherIncome(src)
                      ? undefined
                      : (month, value) => setIncomeValue(si, ri, month, value)
                  }
                  onOpenCell={
                    isOtherIncome(src)
                      ? (month) =>
                          setOpenCell({ loc: { source: si, row: ri }, month, label: src.label + " · " + row.label })
                      : undefined
                  }
                />
              ))}
              <LedgerRow
                label={(src.label || "Source") + " Total"}
                values={sourceCols[si]}
                family="cool"
                pct={share(sum(sourceCols[si]), incomeTotal)}
                emphasis="strong"
              />
            </Fragment>
          ))}

          <LedgerAddRow onClick={addSource}>Add income source</LedgerAddRow>
          <LedgerRow label="All Income" values={incomeCols} family="cool" pct="100%" emphasis="dark" />
        </LedgerScroller>
      </section>

      <section className="ledger-card">
        <header className="ledger-card-head">
          <div className="ledger-title ledger-title--sm">Monthly Net</div>
          <span className="ledger-hint">Income − Expense</span>
        </header>
        <div className="ledger-net-grid">
          {months.map((m, i) => (
            <div key={m} className="ledger-net-card" style={{ background: netCols[i] < 0 ? "#fbd9da" : "#dff1e4" }}>
              <div className="ledger-net-month">{m}</div>
              <div className="ledger-net-value">{signedAmount(netCols[i])}</div>
              <div className="ledger-net-track">
                <div
                  className="ledger-net-bar"
                  style={{
                    width: Math.round((Math.abs(netCols[i]) / netMax) * 100) + "%",
                    background: netCols[i] < 0 ? "#dd6f74" : "#4a9c68",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
      {openCell && openRow && (
        <CellEditor
          fy={fy}
          rowLabel={openCell.label}
          row={openRow}
          month={openCell.month}
          onSetTotal={(v) => setCellTotal(openCell.loc, openCell.month, v)}
          onAddEntry={() => addEntry(openCell.loc, openCell.month)}
          onSetEntry={(i, field, v) => setEntry(openCell.loc, openCell.month, i, field, v)}
          onRemoveEntry={(i) => removeEntry(openCell.loc, openCell.month, i)}
          onClose={() => setOpenCell(null)}
        />
      )}
    </>
  );
}

function SaveState({ loading, saving, error }) {
  if (error) return <span className="ledger-hint" style={{ background: "#fbd9da", color: "#8f3b40" }}>Not saved</span>;
  if (loading) return <span className="ledger-hint">Loading…</span>;
  if (saving) return <span className="ledger-hint">Saving…</span>;
  return <span className="ledger-hint">Saved</span>;
}
