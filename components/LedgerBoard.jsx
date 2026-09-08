"use client";

import { Fragment, useEffect, useRef, useState } from "react";
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
  weekRangeLabel,
} from "@/lib/ledger";

// Everything below is derived from the five editable groups — nothing here is
// stored. Edit a cell and the totals, shares, summary cards and monthly net all
// fall out of the same numbers.
export default function LedgerBoard({ fy }) {
  const {
    ledger, saving, error,
    setValue, setLabel, addRow, removeRow,
    setIncomeValue, setSourceLabel, addSource, removeSource,
    undo, redo, canUndo, canRedo,
    seedFirstEntry, addEntry, setEntry, removeEntry,
  } = useLedger(fy);

  // Which cell is open in the breakdown modal: { loc, month, label, family } or
  // null. Only the address is held — the row itself is read live out of the
  // ledger on every render, so the modal reflects each edit instead of a stale
  // snapshot. `family` ("warm" cost / "cool" income) carries the grid's own
  // colour language into the modal.
  const [openCell, setOpenCell] = useState(null);

  // Open the breakdown modal for a cell. If the cell still holds a plain typed
  // figure (no lines), fold that figure into its first line on the way in, so
  // everything in the modal is line-based and nothing has to be re-keyed.
  const openBreakdown = (loc, month, label, family) => {
    const row =
      loc.source !== undefined
        ? ledger.incomeSources[loc.source]?.rows[loc.row]
        : ledger[loc.group]?.[loc.row];
    if (row && !row.entries?.[month]?.length && row.values[month]) {
      seedFirstEntry(loc, month);
    }
    setOpenCell({ loc, month, label, family });
  };

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

  // `light` cards box their figure in white — the same "figure on white, inside
  // the colour" idiom as an Assets & Liabilities item row. Net Position is
  // already dark, so its figure sits directly on it, same as the Net Worth
  // card on the dashboard.
  // "Bus driving, Uber (gross) and Other income" — built from whatever income
  // sources actually exist, so renaming or deleting one updates this on its own
  // instead of a caption that drifts from the real sources.
  const sourceLabels = incomeSources.map((s) => s.label.trim()).filter(Boolean);
  const incomeNote =
    sourceLabels.length === 0
      ? "No income sources yet"
      : sourceLabels.length === 1
        ? sourceLabels[0]
        : `${sourceLabels.slice(0, -1).join(", ")} and ${sourceLabels[sourceLabels.length - 1]}`;

  const summary = [
    { label: "Total Income", value: "$" + cellAmount(incomeTotal), note: incomeNote, bg: "#dff1e4", fg: "#14150f", chip: "#fff", dot: "#4a9c68", light: true },
    { label: "Total Expenses", value: "$" + cellAmount(expenseTotal), note: "Fixed and variable", bg: "#fbd9da", fg: "#14150f", chip: "#fff", dot: "#dd6f74", light: true },
    { label: "Net Position", value: signedAmount(net), note: pctOfIncome, bg: "#14150f", fg: "#fff", chip: "rgba(255,255,255,0.12)", dot: "#e0a92a" },
    { label: "Avg Monthly Net", value: signedAmount(net / 12), note: "Across 12 months", bg: "#fbecc4", fg: "#14150f", chip: "#fff", dot: "#e0a92a", light: true },
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
      ? (month) => openBreakdown({ group: key, row: i }, month, row.label, "warm")
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
            <div className={s.light ? "ledger-summary-figure" : undefined}>
              <div className="ledger-summary-value">{s.value}</div>
              <div className="ledger-summary-note">{s.note}</div>
            </div>
          </div>
        ))}
      </div>

      <SavedToast saving={saving} error={error} />

      <div className="ledger-toolbar">
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
        </header>

        <LedgerScroller>
          <LedgerHead label="Source" />

          {incomeSources.map((src, si) =>
            // Other income is a single row per month, not a section of weeks:
            // its lines carry their own day, so a week dimension adds nothing.
            isOtherIncome(src) ? (
              <Fragment key={si}>
                <LedgerGap />
                <LedgerRow
                  label={src.label}
                  values={src.rows[0].values}
                  entries={src.rows[0].entries}
                  family="cool"
                  pct={share(sum(src.rows[0].values), incomeTotal)}
                  emphasis="strong"
                  onOpenCell={(month) => openBreakdown({ source: si, row: 0 }, month, src.label, "cool")}
                />
              </Fragment>
            ) : (
              <Fragment key={si}>
                {si > 0 && <LedgerGap />}
                <LedgerSection
                  label={src.label}
                  placeholder="Income source"
                  onSetLabel={(label) => setSourceLabel(si, label)}
                  onRemove={() => removeSource(si)}
                />
                {src.rows.map((row, ri) => (
                  <LedgerRow
                    key={ri}
                    label={row.label}
                    values={row.values}
                    entries={row.entries}
                    family="cool"
                    pct={share(sum(row.values), incomeTotal)}
                    cellTitle={(month) => weekRangeLabel(fy, month, ri)}
                    onSetValue={(month, value) => setIncomeValue(si, ri, month, value)}
                  />
                ))}
                {/* Just "Total" — the source's own name is already the section
                    header right above these rows, so repeating it here only
                    eats into the label column's fixed width for nothing. */}
                <LedgerRow
                  label="Total"
                  values={sourceCols[si]}
                  family="cool"
                  pct={share(sum(sourceCols[si]), incomeTotal)}
                  emphasis="strong"
                />
              </Fragment>
            ),
          )}

          <LedgerGap />
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
              <span className="ledger-net-month">{m}</span>
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
          family={openCell.family}
          row={openRow}
          month={openCell.month}
          onAddEntry={() => addEntry(openCell.loc, openCell.month)}
          onSetEntry={(i, field, v) => setEntry(openCell.loc, openCell.month, i, field, v)}
          onRemoveEntry={(i) => removeEntry(openCell.loc, openCell.month, i)}
          onClose={() => setOpenCell(null)}
        />
      )}
    </>
  );
}

// The toolbar's old permanent "Saved"/"Saving…" label is gone — this is the
// only save feedback now. Pops up bottom-right on the trailing edge of a save
// (saving going true -> false) and fades itself back out a few seconds later;
// stays silent on the initial load and on every render in between. A failed
// save reads "Not saved" in the error colour and lingers longer, since that
// one is worth actually noticing.
function SavedToast({ saving, error }) {
  const [state, setState] = useState(null); // null | "saved" | "error"
  const wasSaving = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (wasSaving.current && !saving) {
      setState(error ? "error" : "saved");
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setState(null), error ? 3200 : 1800);
    }
    wasSaving.current = saving;
  }, [saving, error]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const isError = state === "error";
  const className =
    "save-toast" + (state ? " save-toast--visible" : "") + (isError ? " save-toast--error" : "");
  return <div className={className}>{isError ? "Not saved" : "Saved"}</div>;
}
