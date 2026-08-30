"use client";

import { useState } from "react";
import { fromStr, toStr } from "@/lib/snapshots";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function DatePicker({ value, initialMonth, today, minDate, marked = [], allowFuture = false, onSelect, onClose }) {
  // Opens on the selected day, else on the month the caller cares about (a
  // ledger cell opens on its own month), else on the real today.
  const anchor = value ? fromStr(value) : initialMonth ? fromStr(initialMonth) : new Date();
  const [view, setView] = useState({ y: anchor.getFullYear(), m: anchor.getMonth() });
  const markedSet = new Set(marked);

  const startDow = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const shiftMonth = (delta) =>
    setView((v) => {
      const nd = new Date(v.y, v.m + delta, 1);
      return { y: nd.getFullYear(), m: nd.getMonth() };
    });

  const cellStr = (d) => toStr(new Date(view.y, view.m, d));

  // Don't let the view page into months that are entirely in the future,
  // unless the caller is picking a future date (bill due dates).
  const now = today ? fromStr(today) : new Date();
  const atCurrentMonth = view.y === now.getFullYear() && view.m === now.getMonth();
  const afterCurrentMonth = view.y > now.getFullYear() || (view.y === now.getFullYear() && view.m > now.getMonth());
  const nextMonthDisabled = !allowFuture && (atCurrentMonth || afterCurrentMonth);

  // Same idea at the other end: nothing exists before minDate, so do not page
  // into months that are entirely behind it.
  const min = minDate ? fromStr(minDate) : null;
  const prevMonthDisabled =
    !!min &&
    (view.y < min.getFullYear() ||
      (view.y === min.getFullYear() && view.m <= min.getMonth()));

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
      <div
        style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          zIndex: 50,
          width: 258,
          background: "#fff",
          border: "1px solid #e4e7de",
          borderRadius: 16,
          boxShadow: "0 14px 34px rgba(0,0,0,0.16)",
          padding: 14,
          color: "#14150f",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <IconButton onClick={() => shiftMonth(-1)} label="Previous month" disabled={prevMonthDisabled}>
            <ArrowLeftIcon size={16} />
          </IconButton>
          <div style={{ fontSize: 12.5, fontWeight: 700 }}>
            {MONTHS[view.m]} {view.y}
          </div>
          <IconButton onClick={() => shiftMonth(1)} label="Next month" disabled={nextMonthDisabled}>
            <ArrowRightIcon size={16} />
          </IconButton>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
          {DOW.map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: "#8a8f83", padding: "2px 0" }}>
              {d}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const s = cellStr(d);
            const isSelected = s === value;
            const isToday = s === today;
            const isFuture = !allowFuture && today && s > today;
            const blocked = isFuture || (minDate && s < minDate);
            return (
              <button
                key={i}
                type="button"
                disabled={blocked}
                onClick={() => {
                  onSelect(s);
                  onClose();
                }}
                style={{
                  position: "relative",
                  height: 30,
                  border: isToday && !isSelected ? "1px solid #14150f" : "1px solid transparent",
                  borderRadius: 9,
                  cursor: blocked ? "not-allowed" : "pointer",
                  fontSize: 11.5,
                  fontWeight: 700,
                  background: isSelected ? "#14150f" : "transparent",
                  color: isSelected ? "#fff" : "#14150f",
                  opacity: blocked ? 0.28 : 1,
                }}
              >
                {d}
                {markedSet.has(s) && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 3,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: isSelected ? "#fff" : "#e0a92a",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function IconButton({ children, onClick, label, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      style={{
        width: 26,
        height: 26,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #e4e7de",
        borderRadius: "50%",
        background: "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.3 : 1,
      }}
    >
      {children}
    </button>
  );
}
