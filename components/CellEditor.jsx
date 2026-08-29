"use client";

import { useEffect, useRef, useState } from "react";
import { TitlePill } from "./ui";
import { PlusIcon } from "./icons";
import { cellAmount, entriesTotal, months } from "@/lib/ledger";

const parseAmount = (v) => {
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

// Draft locally, commit on blur — one save and one undo step per edit, rather
// than one per keystroke.
function Field({ value, placeholder, onCommit, format, parse, style, inputMode }) {
  const [draft, setDraft] = useState(null);
  const draftRef = useRef(null);

  const set = (v) => {
    draftRef.current = v;
    setDraft(v);
  };

  return (
    <input
      value={draft ?? (format ? format(value) : value)}
      placeholder={placeholder}
      inputMode={inputMode}
      style={style}
      onFocus={() => set(parse ? (value === 0 ? "" : String(value)) : value)}
      onChange={(e) => set(e.target.value)}
      onBlur={() => {
        if (draftRef.current !== null) {
          const out = parse ? parse(draftRef.current) : draftRef.current;
          if (out !== value) onCommit(out);
        }
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

// The breakdown behind one month of one row: the individual purchases that make
// up the figure. The grid only ever shows the total — this is where the detail
// lives, so the table stays readable.
export default function CellEditor({ rowLabel, row, month, onSetTotal, onAddEntry, onSetEntry, onRemoveEntry, onClose }) {
  const entries = row.entries?.[month] ?? [];
  const hasLines = entries.length > 0;
  const total = hasLines ? entriesTotal(entries) : row.values[month];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(20,21,15,0.45)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "5vh 16px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          background: "#fff",
          borderRadius: 18,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <TitlePill size="lg">
            {(rowLabel || "Item") + " · " + months[month]}
          </TitlePill>
          <button type="button" onClick={onClose} style={btnSolid}>
            Done
          </button>
        </div>

        <div style={{ borderRadius: 14, padding: 12, background: "#f6faf2", border: "1px solid #eaf0e2", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {entries.map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", borderRadius: 9, padding: "5px 6px 5px 9px" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#8a8f83", flex: "none" }} />
                <Field
                  value={e.date}
                  placeholder="1 Jan"
                  onCommit={(v) => onSetEntry(i, "date", v)}
                  style={{ ...inp, width: 78, flex: "none" }}
                />
                <Field
                  value={e.note}
                  placeholder="Coles"
                  onCommit={(v) => onSetEntry(i, "note", v)}
                  style={{ ...inp, flex: 1, minWidth: 0 }}
                />
                <Field
                  value={e.amount}
                  placeholder="$0"
                  inputMode="decimal"
                  format={cellAmount}
                  parse={parseAmount}
                  onCommit={(v) => onSetEntry(i, "amount", v)}
                  style={{ ...inp, width: 88, flex: "none", textAlign: "right", fontWeight: 700 }}
                />
                <button type="button" onClick={() => onRemoveEntry(i)} aria-label="Delete line" style={delBtn}>
                  &times;
                </button>
              </div>
            ))}

            {!hasLines && (
              <div style={{ fontSize: 10.5, fontWeight: 600, color: "#8a8f83", lineHeight: 1.45, padding: "2px 2px" }}>
                No breakdown for this month. Type the amount below, or add lines and
                the total will be worked out from them.
              </div>
            )}
          </div>

          <button type="button" onClick={onAddEntry} style={addBtn}>
            <PlusIcon size={12} />
            Add line
          </button>
        </div>

        <div style={{ borderRadius: 14, padding: 13, background: "#14150f", color: "#fff", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ padding: "5px 9px", borderRadius: 8, background: "rgba(255,255,255,0.12)", fontSize: 10, fontWeight: 700 }}>
              {months[month]} total
            </div>
            {hasLines ? (
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em" }}>{"$" + cellAmount(total)}</div>
            ) : (
              <Field
                value={row.values[month]}
                placeholder="$0"
                inputMode="decimal"
                format={cellAmount}
                parse={parseAmount}
                onCommit={onSetTotal}
                style={{
                  width: 140,
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 9,
                  padding: "6px 10px",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  fontFamily: "inherit",
                  fontSize: 18,
                  fontWeight: 800,
                  textAlign: "right",
                  outline: "none",
                }}
              />
            )}
          </div>
          <div style={{ fontSize: 9.5, fontWeight: 500, opacity: 0.66 }}>
            {hasLines
              ? "Worked out from the lines above · saved as you go"
              : "Typed directly · add a line to break it down"}
          </div>
        </div>
      </div>
    </div>
  );
}

const inp = {
  border: "1px solid #e4e7de",
  borderRadius: 7,
  padding: "6px 8px",
  fontSize: 11,
  fontWeight: 600,
  fontFamily: "inherit",
  color: "#14150f",
  background: "#fff",
  outline: "none",
  minWidth: 0,
};

const delBtn = {
  width: 24,
  height: 24,
  flex: "none",
  borderRadius: 6,
  border: "1px solid #eaded9",
  background: "#fff",
  color: "#dd6f74",
  fontSize: 16,
  lineHeight: 1,
  cursor: "pointer",
};

const addBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  padding: "8px 10px",
  borderRadius: 9,
  border: "1px dashed rgba(20,21,15,0.35)",
  background: "rgba(255,255,255,0.4)",
  fontSize: 11,
  fontWeight: 700,
  fontFamily: "inherit",
  color: "#14150f",
  cursor: "pointer",
};

const btnSolid = {
  padding: "7px 15px",
  borderRadius: 999,
  border: "1px solid #14150f",
  background: "#14150f",
  color: "#fff",
  fontSize: 12,
  fontWeight: 700,
  fontFamily: "inherit",
  cursor: "pointer",
};
