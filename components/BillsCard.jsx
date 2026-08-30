"use client";

import { useEffect, useState } from "react";
import { useDashboardData } from "./DashboardData";
import { TitlePill } from "./ui";
import { PencilIcon, PlusIcon } from "./icons";
import { formatMoney, parseMoney } from "@/lib/money";
import { formatShort } from "@/lib/snapshots";
import DatePicker from "./DatePicker";

const clone = (o) => JSON.parse(JSON.stringify(o));

// Bills are stored as { name, dueDate, due, amount }. `dueDate` is the picked
// YYYY-MM-DD; `due` is the "Due 1 Sep" label derived from it, kept so the card
// render and pre-picker snapshots (which only ever had `due`) both still work.
const blankBill = () => ({ name: "", dueDate: "", due: "", amount: "" });

const dueLabel = (dueDate) => (dueDate ? `Due ${formatShort(dueDate)}` : "");

// Soonest first. Bills with no picked date (pre-picker rows, or ones you have
// not dated yet) sink to the bottom, keeping their order among themselves —
// Array#sort is stable, so equal keys never shuffle.
const sortBills = (list) =>
  [...list].sort((a, b) => {
    const ad = a.dueDate || "";
    const bd = b.dueDate || "";
    if (!ad || !bd) return ad ? -1 : bd ? 1 : 0;
    return ad < bd ? -1 : ad > bd ? 1 : 0;
  });

export default function BillsCard() {
  const { data, selectedWeek, selectedWeekEnd, today, updateData } = useDashboardData();
  const { bills } = data;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  // Abandon an in-progress edit if the week changes underneath us.
  useEffect(() => {
    setEditing(false);
    setDraft(null);
  }, [selectedWeek]);

  // Lock body scroll while the editor modal is open.
  useEffect(() => {
    if (!editing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [editing]);

  const startEdit = () => {
    // Older snapshots may predate a field; coerce so every input stays controlled.
    setDraft({
      bills: sortBills(clone(bills)).map((b) => ({
        name: b.name ?? "",
        dueDate: b.dueDate ?? "",
        due: b.due ?? "",
        amount: b.amount ?? "",
      })),
    });
    setEditing(true);
  };
  const cancel = () => {
    setEditing(false);
    setDraft(null);
  };
  const save = () => {
    // Tidy on the way out: trim the text fields, normalise amounts to the same
    // display format the ledger uses, and drop rows left completely blank.
    const next = draft.bills
      .map((b) => ({
        name: b.name.trim(),
        dueDate: b.dueDate,
        // Fall back to any pre-picker text if this bill has no picked date yet.
        due: b.dueDate ? dueLabel(b.dueDate) : b.due.trim(),
        amount: b.amount.trim() ? formatMoney(parseMoney(b.amount)) : "",
      }))
      .filter((b) => b.name || b.amount);
    updateData((d) => {
      d.bills = sortBills(next);
      return d;
    });
    setEditing(false);
    setDraft(null);
  };

  const setBill = (i, field, val) =>
    setDraft((dr) => {
      const n = clone(dr);
      n.bills[i][field] = val;
      return n;
    });
  const addBill = () =>
    setDraft((dr) => {
      const n = clone(dr);
      n.bills.push(blankBill());
      return n;
    });
  const removeBill = (i) =>
    setDraft((dr) => {
      const n = clone(dr);
      n.bills.splice(i, 1);
      return n;
    });

  return (
    <>
      <div style={{ background: "#fff", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 9, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <TitlePill size="sm">Upcoming Bills</TitlePill>
          <button
            type="button"
            onClick={startEdit}
            aria-label="Edit upcoming bills"
            style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid #e4e7de", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", cursor: "pointer" }}
          >
            <PencilIcon />
          </button>
        </div>

        {sortBills(bills).map((b, i) => {
          // Urgency as of the week being viewed, not the real today — every other
          // card shows what was true in its own week, so this one should too.
          // Overdue means it fell due before this week began; soon means it falls
          // due somewhere inside it. Keys are YYYY-MM-DD, so string ordering is
          // date ordering.
          const dated = b.dueDate && selectedWeek;
          const pastDue = dated && b.dueDate < selectedWeek;
          const dueSoon = dated && !pastDue && b.dueDate <= selectedWeekEnd;
          const dueText = pastDue ? dueLabel(b.dueDate) : dueSoon ? `Soon ${formatShort(b.dueDate)}` : b.due;
          // Amber, but darkened from the #e0a92a dot: at 9.5px on #f6faf2 the raw
          // dot colour reads fainter than the muted text it is meant to outrank.
          const dueColor = pastDue ? "#dd6f74" : dueSoon ? "#a8791a" : "#8a8f83";
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, background: "#f6faf2", border: "1px solid #eaf0e2", borderRadius: 11, padding: "10px 12px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#e0a92a", flex: "none", display: "block" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.name}</div>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: dueColor, marginTop: 1, whiteSpace: "nowrap" }}>
                  {dueText}
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", flex: "none" }}>{b.amount}</span>
            </div>
          );
        })}

        {bills.length === 0 && (
          <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.5, padding: "4px 2px" }}>No bills</div>
        )}
      </div>

      {editing && draft && (
        <Editor
          draft={draft}
          today={today}
          onSetBill={setBill}
          onAddBill={addBill}
          onRemoveBill={removeBill}
          onCancel={cancel}
          onSave={save}
        />
      )}
    </>
  );
}

function Editor({ draft, today, onSetBill, onAddBill, onRemoveBill, onCancel, onSave }) {
  // Index of the row whose calendar is open, or null. Only one at a time.
  const [pickerFor, setPickerFor] = useState(null);

  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
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
          width: "min(560px, 100%)",
          background: "#fff",
          borderRadius: 18,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <TitlePill size="lg">Edit Upcoming Bills</TitlePill>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" onClick={onCancel} style={btnGhost}>
              Cancel
            </button>
            <button type="button" onClick={onSave} style={btnSolid}>
              Save
            </button>
          </div>
        </div>

        <div style={{ borderRadius: 14, padding: 12, background: "#f6faf2", border: "1px solid #eaf0e2", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {draft.bills.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", borderRadius: 9, padding: "5px 6px 5px 9px" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#e0a92a", flex: "none" }} />
                <input
                  value={b.name}
                  placeholder="Name"
                  onChange={(e) => onSetBill(i, "name", e.target.value)}
                  style={{ ...inp, flex: 1, minWidth: 0, fontWeight: 700 }}
                />
                <div style={{ position: "relative", flex: "none" }}>
                  <button
                    type="button"
                    onClick={() => setPickerFor(pickerFor === i ? null : i)}
                    style={{ ...inp, width: 104, textAlign: "left", cursor: "pointer", color: b.dueDate || b.due ? "#8a8f83" : "#b3b8ac" }}
                  >
                    {dueLabel(b.dueDate) || b.due || "Due date"}
                  </button>
                  {pickerFor === i && (
                    <DatePicker
                      value={b.dueDate}
                      today={today}
                      allowFuture
                      onSelect={(s) => onSetBill(i, "dueDate", s)}
                      onClose={() => setPickerFor(null)}
                    />
                  )}
                </div>
                <input
                  value={b.amount}
                  placeholder="$0"
                  inputMode="decimal"
                  onChange={(e) => onSetBill(i, "amount", e.target.value)}
                  onBlur={(e) => e.target.value.trim() && onSetBill(i, "amount", formatMoney(parseMoney(e.target.value)))}
                  style={{ ...inp, width: 88, flex: "none", textAlign: "right", fontWeight: 700 }}
                />
                <button type="button" onClick={() => onRemoveBill(i)} aria-label="Delete bill" style={delBtn}>
                  &times;
                </button>
              </div>
            ))}
            {draft.bills.length === 0 && (
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.5, padding: "2px 2px" }}>No bills yet</div>
            )}
          </div>

          <button type="button" onClick={onAddBill} style={addBtn}>
            <PlusIcon size={12} />
            Add bill
          </button>
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

const btnGhost = {
  padding: "7px 13px",
  borderRadius: 999,
  border: "1px solid #d7ddcf",
  background: "#fff",
  fontSize: 12,
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
