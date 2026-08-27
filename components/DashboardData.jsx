"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { seedData } from "@/lib/data";
import { addDays, loadAll, resolveForDate, saveAll, todayStr } from "@/lib/snapshots";

const DashboardDataContext = createContext(null);

export function DashboardDataProvider({ children }) {
  const [snapshots, setSnapshots] = useState({});
  // Empty until mounted so server render and first client render agree (seed data).
  const [selectedDate, setSelectedDate] = useState("");
  const [today, setToday] = useState("");
  // +1 = moved forward in time, -1 = moved back. Drives the page transition.
  const [direction, setDirection] = useState(1);

  const selectedDateRef = useRef("");
  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  // Point the transition the right way, then move.
  const goTo = useCallback((target) => {
    const cur = selectedDateRef.current;
    if (cur && target) setDirection(target < cur ? -1 : 1);
    setSelectedDate(target);
  }, []);

  useEffect(() => {
    setSnapshots(loadAll());
    const t = todayStr();
    setToday(t);
    setSelectedDate(t); // always land on the real present day
  }, []);

  const { data, source } = useMemo(
    () => resolveForDate(snapshots, selectedDate, seedData),
    [snapshots, selectedDate],
  );

  const goToPrevDay = useCallback(() => {
    setDirection(-1);
    setSelectedDate((d) => (d ? addDays(d, -1) : todayStr()));
  }, []);

  // Can't look into the future — the next day doesn't exist yet.
  const goToNextDay = useCallback(() => {
    setDirection(1);
    setSelectedDate((d) => {
      const t = todayStr();
      const n = d ? addDays(d, 1) : t;
      return n > t ? t : n;
    });
  }, []);

  const goToDate = useCallback(
    (s) => {
      const t = todayStr();
      goTo(s > t ? t : s);
    },
    [goTo],
  );

  const goToToday = useCallback(() => goTo(todayStr()), [goTo]);

  // Save a snapshot for the selected day. `updater` may be the next snapshot
  // object, or a function receiving a deep copy of the currently effective data.
  const updateData = useCallback(
    (updater) => {
      if (!selectedDate) return;
      setSnapshots((prev) => {
        const current = resolveForDate(prev, selectedDate, seedData).data;
        const nextDay =
          typeof updater === "function"
            ? updater(JSON.parse(JSON.stringify(current)))
            : updater;
        const next = { ...prev, [selectedDate]: nextDay };
        saveAll(next);
        return next;
      });
    },
    [selectedDate],
  );

  const value = useMemo(
    () => ({
      data,
      source, // which snapshot date the data came from (null = seed)
      selectedDate,
      today,
      direction,
      mounted: selectedDate !== "",
      isToday: selectedDate !== "" && selectedDate === today,
      canGoNext: selectedDate !== "" && selectedDate < today,
      snapshotDates: Object.keys(snapshots),
      hasSnapshot: (s) => Object.prototype.hasOwnProperty.call(snapshots, s),
      goToPrevDay,
      goToNextDay,
      goToDate,
      goToToday,
      updateData,
    }),
    [data, source, selectedDate, today, direction, snapshots, goToPrevDay, goToNextDay, goToDate, goToToday, updateData],
  );

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) throw new Error("useDashboardData must be used within a DashboardDataProvider");
  return ctx;
}
