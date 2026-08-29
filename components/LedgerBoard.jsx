"use client";

import { LedgerHead, LedgerRow, LedgerSection, LedgerScroller, LedgerGap, LedgerAddRow } from "./LedgerTable";
import { useLedger } from "./LedgerData";
import {
  months,
  columnTotals,
  sum,
  cellAmount,
  signedAmount,
  share,
} from "@/lib/ledger";

// Everything below is derived from the five editable groups — nothing here is
// stored. Edit a cell and the totals, shares, summary cards and monthly net all
// fall out of the same numbers.
export default function LedgerBoard({ fy }) {
  const { ledger, loading, saving, error, setValue, setLabel, addRow, removeRow } = useLedger(fy);
  const { fixedCost, variableCost, mainIncome, sideIncome, otherIncome } = ledger;

  const fixedCols = columnTotals(fixedCost);
  const variableCols = columnTotals(variableCost);
  const expenseCols = months.map((_, i) => fixedCols[i] + variableCols[i]);
  const expenseTotal = sum(expenseCols);

  const mainCols = columnTotals(mainIncome);
  const sideCols = columnTotals(sideIncome);
  const otherCols = columnTotals(otherIncome);
  const incomeCols = months.map((_, i) => mainCols[i] + sideCols[i] + otherCols[i]);
  const incomeTotal = sum(incomeCols);

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

  // Wires one group's rows up to the editing actions.
  const editable = (key, family, whole) => (row, i) => ({
    key: key + "-" + i,
    label: row.label,
    values: row.values,
    family,
    pct: share(sum(row.values), whole),
    onSetValue: (month, value) => setValue(key, i, month, value),
    onSetLabel: (label) => setLabel(key, i, label),
    onRemove: () => removeRow(key, i),
  });

  const fixedRows = fixedCost.map(editable("fixedCost", "warm", expenseTotal));
  const variableRows = variableCost.map(editable("variableCost", "warm", expenseTotal));
  const mainRows = mainIncome.map(editable("mainIncome", "cool", incomeTotal));
  const sideRows = sideIncome.map(editable("sideIncome", "cool", incomeTotal));
  const otherRows = otherIncome.map(editable("otherIncome", "cool", incomeTotal));

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

      <section className="ledger-card">
        <header className="ledger-card-head">
          <div className="ledger-title">Expenses</div>
          <div className="ledger-card-actions">
            <span className="ledger-hint">Scroll for months →</span>
            <SaveState loading={loading} saving={saving} error={error} />
          </div>
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
          <SaveState loading={loading} saving={saving} error={error} />
        </header>

        <LedgerScroller>
          <LedgerHead label="Main income" />
          {mainRows.map((r) => <LedgerRow key={r.key} {...r} />)}
          <LedgerAddRow onClick={() => addRow("mainIncome")}>Add main income</LedgerAddRow>
          <LedgerRow label="Main Total" values={mainCols} family="cool" pct={share(sum(mainCols), incomeTotal)} emphasis="strong" />

          <LedgerGap />
          <LedgerSection label="Side income (gross)" />
          {sideRows.map((r) => <LedgerRow key={r.key} {...r} />)}
          <LedgerAddRow onClick={() => addRow("sideIncome")}>Add side income</LedgerAddRow>
          <LedgerRow label="Side Total" values={sideCols} family="cool" pct={share(sum(sideCols), incomeTotal)} emphasis="strong" />

          <LedgerGap />
          <LedgerSection label="Other income (net)" />
          {otherRows.map((r) => <LedgerRow key={r.key} {...r} />)}
          <LedgerAddRow onClick={() => addRow("otherIncome")}>Add other income</LedgerAddRow>
          <LedgerRow label="Other Total" values={otherCols} family="cool" pct={share(sum(otherCols), incomeTotal)} emphasis="strong" />
          <LedgerRow label="Main + Side + Other" values={incomeCols} family="cool" pct="100%" emphasis="dark" />
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
    </>
  );
}

function SaveState({ loading, saving, error }) {
  if (error) return <span className="ledger-hint" style={{ background: "#fbd9da", color: "#8f3b40" }}>Not saved</span>;
  if (loading) return <span className="ledger-hint">Loading…</span>;
  if (saving) return <span className="ledger-hint">Saving…</span>;
  return <span className="ledger-hint">Saved</span>;
}
