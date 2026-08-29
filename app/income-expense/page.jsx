import { AuthProvider } from "@/components/AuthProvider";
import AppShell from "@/components/AppShell";
import TopBar from "@/components/TopBar";
import YearNav from "@/components/YearNav";
import { LedgerHead, LedgerRow, LedgerSection, LedgerScroller, LedgerGap } from "@/components/LedgerTable";
import { DotsButton } from "@/components/ui";
import {
  months,
  ledgerFor,
  isFinancialYear,
  latestFinancialYear,
  columnTotals,
  sum,
  cellAmount,
  signedAmount,
  share,
} from "@/lib/ledger";

export const metadata = { title: "Income / Expense" };

export default function IncomeExpensePage({ searchParams }) {
  // The chosen financial year lives in the URL; anything unrecognised falls
  // back to the most recent year rather than rendering an empty ledger.
  const requested = searchParams?.fy;
  const fy = isFinancialYear(requested) ? requested : latestFinancialYear;
  const { fixedCost, variableCost, mainIncome, sideIncome, otherIncome } = ledgerFor(fy);

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
  const netMax = Math.max(...netCols.map(Math.abs));
  const net = incomeTotal - expenseTotal;

  const summary = [
    { label: "Total Income", value: "$" + cellAmount(incomeTotal), note: "Main, side and other", bg: "#dff1e4", fg: "#14150f", chip: "#fff", dot: "#4a9c68" },
    { label: "Total Expenses", value: "$" + cellAmount(expenseTotal), note: "Fixed and variable", bg: "#fbd9da", fg: "#14150f", chip: "#fff", dot: "#dd6f74" },
    { label: "Net Position", value: signedAmount(net), note: ((net / incomeTotal) * 100).toFixed(1) + "% of income", bg: "#14150f", fg: "#fff", chip: "rgba(255,255,255,0.12)", dot: "#e0a92a" },
    { label: "Avg Monthly Net", value: signedAmount(net / 12), note: "Across 12 months", bg: "#fbecc4", fg: "#14150f", chip: "#fff", dot: "#e0a92a" },
  ];

  return (
    <AuthProvider>
      <AppShell>
        <main className="dashboard-main">
          <div className="dashboard-panel">
            <TopBar>
              <YearNav fy={fy} />
            </TopBar>

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
                  <DotsButton size={31} />
                </div>
              </header>

              <LedgerScroller>
                <LedgerHead label="Fixed cost" />
                {fixedCost.map((r) => (
                  <LedgerRow key={r.label} label={r.label} values={r.values} family="warm" pct={share(sum(r.values), expenseTotal)} />
                ))}
                <LedgerRow label="Fixed Total" values={fixedCols} family="warm" pct={share(sum(fixedCols), expenseTotal)} emphasis="strong" />

                <LedgerGap />
                <LedgerSection label="Variable cost" />
                {variableCost.map((r) => (
                  <LedgerRow key={r.label} label={r.label} values={r.values} family="warm" pct={share(sum(r.values), expenseTotal)} />
                ))}
                <LedgerRow label="Variable Total" values={variableCols} family="warm" pct={share(sum(variableCols), expenseTotal)} emphasis="strong" />
                <LedgerRow label="Fixed + Variable" values={expenseCols} family="warm" pct="100%" emphasis="dark" />
              </LedgerScroller>
            </section>

            <section className="ledger-card">
              <header className="ledger-card-head">
                <div className="ledger-title">Income</div>
                <DotsButton size={31} />
              </header>

              <LedgerScroller>
                <LedgerHead label="Main income" />
                {mainIncome.map((r) => (
                  <LedgerRow key={"main-" + r.label} label={r.label} values={r.values} family="cool" pct={share(sum(r.values), incomeTotal)} />
                ))}
                <LedgerRow label="Main Total" values={mainCols} family="cool" pct={share(sum(mainCols), incomeTotal)} emphasis="strong" />

                <LedgerGap />
                <LedgerSection label="Side income (gross)" />
                {sideIncome.map((r) => (
                  <LedgerRow key={"side-" + r.label} label={r.label} values={r.values} family="cool" pct={share(sum(r.values), incomeTotal)} />
                ))}
                <LedgerRow label="Side Total" values={sideCols} family="cool" pct={share(sum(sideCols), incomeTotal)} emphasis="strong" />

                <LedgerGap />
                <LedgerSection label="Other income (net)" />
                {otherIncome.map((r) => (
                  <LedgerRow key={"other-" + r.label} label={r.label} values={r.values} family="cool" pct={share(sum(r.values), incomeTotal)} />
                ))}
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
          </div>
        </main>
      </AppShell>
    </AuthProvider>
  );
}
