import { months, sum, cellAmount } from "@/lib/ledger";

// Heat-map tint mirrors the spreadsheet: red family for costs, green for income.
const tint = (family, alpha) =>
  family === "warm"
    ? `rgba(221,111,116,${(alpha * 0.42).toFixed(3)})`
    : `rgba(74,156,104,${(alpha * 0.42).toFixed(3)})`;

function cellShade(value, max, family) {
  if (value === 0) return { background: "#f6faf2", color: "#b3bba9" };
  const ratio = Math.min(1, value / max);
  return { background: tint(family, 0.12 + ratio * 0.72), color: "#14150f" };
}

export function LedgerHead({ label }) {
  return (
    <div className="ledger-row">
      <div className="ledger-cell ledger-cell--label ledger-head">{label}</div>
      {months.map((m) => (
        <div key={m} className="ledger-head ledger-head--month">
          {m}
        </div>
      ))}
      <div className="ledger-head ledger-head--month">Total</div>
      <div className="ledger-head ledger-head--month">%</div>
    </div>
  );
}

export function LedgerSection({ label }) {
  return (
    <div className="ledger-row">
      <div className="ledger-cell ledger-cell--label ledger-section">{label}</div>
    </div>
  );
}

export function LedgerRow({ label, values, family, pct, emphasis }) {
  const max = Math.max(1, ...values);
  const total = sum(values);
  const dark = emphasis === "dark";
  const strong = emphasis === "strong";
  const accent = family === "warm" ? "#fbd9da" : "#dff1e4";
  const totalTint = family === "warm" ? "#fbecc4" : "#dff1e4";

  const base = {
    borderRadius: emphasis ? 10 : 9,
    fontWeight: emphasis ? 800 : 600,
  };

  return (
    <div className="ledger-row">
      <div
        className="ledger-cell ledger-cell--label"
        style={{
          ...base,
          background: dark ? "#14150f" : strong ? accent : "#f6faf2",
          color: dark ? "#fff" : "#14150f",
        }}
      >
        {label}
      </div>

      {values.map((v, i) => {
        const shade = cellShade(v, max, family);
        return (
          <div
            key={i}
            className="ledger-cell"
            style={{
              ...base,
              background: dark ? "#14150f" : shade.background,
              color: dark ? "#fff" : shade.color,
            }}
          >
            {cellAmount(v)}
          </div>
        );
      })}

      <div
        className="ledger-cell ledger-cell--total"
        style={{
          ...base,
          fontWeight: 800,
          background: dark ? "#14150f" : strong ? accent : totalTint,
          color: dark ? "#fff" : "#14150f",
        }}
      >
        {"$" + cellAmount(total)}
      </div>

      <div
        className="ledger-cell ledger-cell--pct"
        style={{ ...base, background: dark ? "#e6ebdd" : strong ? accent : "#f6faf2" }}
      >
        {pct}
      </div>
    </div>
  );
}

export function LedgerScroller({ children }) {
  return (
    <div className="ledger-scroller">
      <div className="ledger-grid">{children}</div>
    </div>
  );
}

export const LedgerGap = () => <div className="ledger-gap" />;
