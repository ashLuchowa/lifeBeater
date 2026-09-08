"use client";

import { useState } from "react";
import { fromStr, toStr, weekStart } from "@/lib/snapshots";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";

// Monday-first, matching the app's Monday-to-Sunday week (see lib/snapshots.js).
const DOW = ["M", "T", "W", "T", "F", "S", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function DatePicker({ value, initialMonth, today, minDate, allowFuture = false, weekMode = false, onSelect, onClose }) {
  // Opens on the selected day, else on the month the caller cares about (a
  // ledger cell opens on its own month), else on the real today.
  const anchor = value ? fromStr(value) : initialMonth ? fromStr(initialMonth) : new Date();
  const [view, setView] = useState({ y: anchor.getFullYear(), m: anchor.getMonth() });
  // Day string currently under the cursor, for the hover highlight. In week mode
  // the highlight covers the whole week that day belongs to.
  const [hovered, setHovered] = useState(null);
  const hoverKey = hovered == null ? null : weekMode ? weekStart(hovered) : hovered;

  // Weekday of the 1st, counted from Monday (0 = Mon … 6 = Sun).
  const startDow = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();

  // Fill the grid with real days: the trailing days of the previous month lead
  // in, then this month, then the leading days of the next month finish the last
  // week. Out-of-month cells are dimmed but still selectable.
  const cells = [];
  const prevMonthDays = new Date(view.y, view.m, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ y: view.y, m: view.m - 1, d: prevMonthDays - i, outside: true });
  }
  for (let d = 1; d <= daysInMonth; d++) cells.push({ y: view.y, m: view.m, d, outside: false });
  for (let d = 1; cells.length % 7 !== 0; d++) {
    cells.push({ y: view.y, m: view.m + 1, d, outside: true });
  }

  const shiftMonth = (delta) =>
    setView((v) => {
      const nd = new Date(v.y, v.m + delta, 1);
      return { y: nd.getFullYear(), m: nd.getMonth() };
    });

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
      <div className="nav-popover nav-popover--cal">
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
          {cells.map((c, i) => {
            const s = toStr(new Date(c.y, c.m, c.d));
            // In week mode the value is a Monday, so every day of that week reads
            // as selected.
            const key = weekMode ? weekStart(s) : s;
            const isSelected = key === value;
            const isToday = s === today;
            // Range limits apply per week in week mode (picking any day of a week
            // picks that week), so a future day inside the current week is fine —
            // only whole weeks past this one or before minDate are out of range.
            const bound = weekMode ? key : s;
            const futureLimit = weekMode && today ? weekStart(today) : today;
            const isFuture = !allowFuture && today && bound > futureLimit;
            const blocked = isFuture || (minDate && bound < minDate);
            const isHovered = !blocked && !isSelected && hoverKey === key;
            return (
              <button
                key={i}
                type="button"
                disabled={blocked}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered((h) => (h === s ? null : h))}
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
                  background: isSelected ? "#14150f" : isHovered ? "#ecefe6" : "transparent",
                  color: isSelected ? "#fff" : c.outside ? "#b3b7a9" : "#14150f",
                  opacity: blocked ? 0.28 : 1,
                  transition: "background 0.12s ease",
                }}
              >
                {c.d}
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
