"use client";

import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";
import { useDashboardData } from "./DashboardData";
import DatePicker from "./DatePicker";
import { navArrowBtn } from "./ui";
import { formatLong } from "@/lib/snapshots";

// Day-by-day snapshot navigation for the dashboard's top bar. Calls
// useDashboardData, so it may only be mounted inside a DashboardDataProvider.
export default function DayNav() {
  const {
    selectedDate,
    mounted,
    isToday,
    canGoNext,
    canGoPrev,
    earliestDate,
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
    <>
      <button
        type="button"
        style={{
          ...navArrowBtn,
          cursor: canGoPrev ? "pointer" : "not-allowed",
          opacity: canGoPrev ? 1 : 0.3,
        }}
        onClick={goToPrevDay}
        disabled={!canGoPrev}
        aria-label="Previous day"
      >
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
            minDate={earliestDate}
            marked={snapshotDates}
            onSelect={goToDate}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </div>

      <button
        type="button"
        style={{
          ...navArrowBtn,
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
    </>
  );
}
