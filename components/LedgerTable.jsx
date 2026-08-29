"use client";

import { useRef, useState } from "react";
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

const parseAmount = (v) => {
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

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

// A band across the grid. With `onSetLabel` it becomes an income source header:
// renameable, and deletable when there is more than one source.
export function LedgerSection({ label, placeholder, onSetLabel, onRemove }) {
  return (
    <div className={onSetLabel ? "ledger-row ledger-row--editable" : "ledger-row"}>
      <div className="ledger-cell ledger-cell--label ledger-section">
        {onSetLabel ? (
          <LabelInput
            className="ledger-label-input ledger-label-input--section"
            value={label}
            placeholder={placeholder}
            onCommit={onSetLabel}
          />
        ) : (
          label
        )}
        {onRemove && (
          <button type="button" className="ledger-row-del" onClick={onRemove} aria-label={"Delete " + (label || "source")}>
            &times;
          </button>
        )}
      </div>
    </div>
  );
}

function LabelInput({ value, placeholder, className, onCommit }) {
  const [draft, setDraft] = useState(null);
  const draftRef = useRef(null);

  const set = (v) => {
    draftRef.current = v;
    setDraft(v);
  };

  return (
    <input
      className={className}
      value={draft ?? value}
      placeholder={placeholder}
      onChange={(e) => set(e.target.value)}
      onBlur={() => {
        if (draftRef.current !== null && draftRef.current !== value) onCommit(draftRef.current);
        set(null);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          set(null);
          e.currentTarget.blur();
        }
      }}
    />
  );
}

// A number cell you can type into. Shows the formatted value at rest and the
// raw number while focused, so you are never editing an em dash or a comma.
function CellInput({ value, onCommit, style }) {
  const [draft, setDraft] = useState(null);
  const draftRef = useRef(null);

  const set = (v) => {
    draftRef.current = v;
    setDraft(v);
  };

  return (
    <input
      className="ledger-cell ledger-cell--input"
      style={style}
      inputMode="decimal"
      value={draft ?? cellAmount(value)}
      onFocus={(e) => {
        set(value === 0 ? "" : String(value));
        requestAnimationFrame(() => e.target.select());
      }}
      onChange={(e) => set(e.target.value)}
      onBlur={() => {
        if (draftRef.current !== null) onCommit(parseAmount(draftRef.current));
        set(null);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          set(null); // discard, then let blur find nothing to commit
          e.currentTarget.blur();
        }
      }}
    />
  );
}

// Values and label are independently editable. Expense rows get both plus a
// delete; income week rows get `onSetValue` only, so Week 1–4 stay fixed.
// Derived rows (totals, Fixed + Variable, …) get none and render as plain text.
export function LedgerRow({ label, values, family, pct, emphasis, onSetValue, onSetLabel, onRemove }) {
  const max = Math.max(1, ...values);
  const total = sum(values);
  const dark = emphasis === "dark";
  const strong = emphasis === "strong";
  const accent = family === "warm" ? "#fbd9da" : "#dff1e4";
  const totalTint = family === "warm" ? "#fbecc4" : "#dff1e4";
  const editableValues = Boolean(onSetValue);

  const base = {
    borderRadius: emphasis ? 10 : 9,
    fontWeight: emphasis ? 800 : 600,
  };

  return (
    <div className={editableValues ? "ledger-row ledger-row--editable" : "ledger-row"}>
      <div
        className="ledger-cell ledger-cell--label"
        style={{
          ...base,
          background: dark ? "#14150f" : strong ? accent : "#f6faf2",
          color: dark ? "#fff" : "#14150f",
        }}
      >
        {onSetLabel ? (
          <LabelInput
            className="ledger-label-input"
            value={label}
            placeholder="Item name"
            onCommit={onSetLabel}
          />
        ) : (
          label
        )}
        {onRemove && (
          <button type="button" className="ledger-row-del" onClick={onRemove} aria-label={"Delete " + (label || "row")}>
            &times;
          </button>
        )}
      </div>

      {values.map((v, i) => {
        const shade = cellShade(v, max, family);
        const style = {
          ...base,
          background: dark ? "#14150f" : shade.background,
          color: dark ? "#fff" : shade.color,
        };
        return editableValues ? (
          <CellInput key={i} value={v} style={style} onCommit={(n) => onSetValue(i, n)} />
        ) : (
          <div key={i} className="ledger-cell" style={style}>
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

// Full-width dashed button that sits under a group's rows.
export function LedgerAddRow({ onClick, children }) {
  return (
    <div className="ledger-row">
      <button type="button" className="ledger-add-row" onClick={onClick}>
        + {children}
      </button>
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
