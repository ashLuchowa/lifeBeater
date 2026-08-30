"use client";

import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";
import { useDashboardData } from "./DashboardData";
import DatePicker from "./DatePicker";
import { navArrowBtn } from "./ui";
import { formatWeek, weekStart } from "@/lib/snapshots";

// Day-by-day snapshot navigation for the dashboard's top bar. Calls
// useDashboardData, so it may only be mounted inside a DashboardDataProvider.
export default function DayNav() {
  const {
    selectedWeek,
    mounted,
    isCurrentWeek,
    canGoNext,
    canGoPrev,
    earliestWeek,
    snapshotWeeks,
    today,
    goToPrevWeek,
    goToNextWeek,
    goToDate,
    goToThisWeek,
  } = useDashboardData();
  const [pickerOpen, setPickerOpen] = useState(false);

  const dateLabel = mounted ? formatWeek(selectedWeek) : "…";

  return (
    <>
      <button
        type="button"
        style={{
          ...navArrowBtn,
          cursor: canGoPrev ? "pointer" : "not-allowed",
          opacity: canGoPrev ? 1 : 0.3,
        }}
        onClick={goToPrevWeek}
        disabled={!canGoPrev}
        aria-label="Previous week"
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
            value={selectedWeek}
            today={today}
            minDate={earliestWeek}
            weekMode
            marked={snapshotWeeks}
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
        onClick={goToNextWeek}
        disabled={!canGoNext}
        aria-label="Next week"
      >
        <ArrowRightIcon />
      </button>

      <button
        type="button"
        onClick={goToThisWeek}
        style={{
          padding: "8px 17px",
          borderRadius: 999,
          background: isCurrentWeek ? "#14150f" : "transparent",
          color: isCurrentWeek ? "#fff" : "#14150f",
          border: "2px solid #14150f",
          fontSize: 13,
          fontWeight: 700,
          whiteSpace: "nowrap",
          cursor: "pointer",
        }}
      >
        This week
      </button>
    </>
  );
}
