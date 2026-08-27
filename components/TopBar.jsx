"use client";

import { useState } from "react";
import { HomeIcon, LedgerIcon, BarsIcon, ArrowLeftIcon, ArrowRightIcon } from "./icons";
import { useDashboardData } from "./DashboardData";
import DatePicker from "./DatePicker";
import { formatLong } from "@/lib/snapshots";

const navBase = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  padding: "7px 14px",
  borderRadius: 999,
  fontSize: 13.5,
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const arrowBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 34,
  height: 34,
  borderRadius: "50%",
  border: "0px solid #14150f",
  background: "transparent",
  cursor: "pointer",
  flex: "none",
};

export default function TopBar() {
  const {
    selectedDate,
    mounted,
    isToday,
    canGoNext,
    snapshotDates,
    today,
    goToPrevDay,
    goToNextDay,
    goToDate,
    goToToday,
  } = useDashboardData();
  const [pickerOpen, setPickerOpen] = useState(false);

  const dateLabel = mounted ? formatLong(selectedDate) : "…";

  return (
    <div className="topbar">

      <nav className="topbar-nav">
        <div style={{ ...navBase, padding: "7px 15px", background: "#14150f", color: "#fff" }}>
          <HomeIcon color="#fff" />
          Home
        </div>
        <div style={navBase}>
          <LedgerIcon />
          Assets &amp; Liabilities
        </div>
        <div style={navBase}>
          <BarsIcon />
          Income / Expense
        </div>
      </nav>

      <div className="topbar-actions">
        <button type="button" style={arrowBtn} onClick={goToPrevDay} aria-label="Previous day">
          <ArrowLeftIcon />
        </button>

        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            style={{
              padding: "16px 24px",
              borderRadius: 999,
              background: "#fff",
              border: "0px solid #14150f",
              fontSize: 17,
              fontWeight: 700,
              color: "#000000",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {dateLabel}
          </button>
          {pickerOpen && mounted && (
            <DatePicker
              value={selectedDate}
              today={today}
              marked={snapshotDates}
              onSelect={goToDate}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </div>

        <button
          type="button"
          style={{
            ...arrowBtn,
            cursor: canGoNext ? "pointer" : "not-allowed",
            opacity: canGoNext ? 1 : 0.3,
          }}
          onClick={goToNextDay}
          disabled={!canGoNext}
          aria-label="Next day"
        >
          <ArrowRightIcon />
        </button>

        <button
          type="button"
          onClick={goToToday}
          style={{
            padding: "8px 17px",
            borderRadius: 999,
            background: isToday ? "#14150f" : "transparent",
            color: isToday ? "#fff" : "#14150f",
            border: "2px solid #14150f",
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >
          Today
        </button>
      </div>

    </div>
  );
}
