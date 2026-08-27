"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { seedData } from "@/lib/data";
import { addDays, loadAll, resolveForDate, saveAll, todayStr } from "@/lib/snapshots";

const DashboardDataContext = createContext(null);

export function DashboardDataProvider({ children }) {
  const [snapshots, setSnapshots] = useState({});
  // Empty until mounted so server render and first client render agree (seed data).
  const [selectedDate, setSelectedDate] = useState("");
  const [today, setToday] = useState("");

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
    setSelectedDate((d) => (d ? addDays(d, -1) : todayStr()));
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate((d) => (d ? addDays(d, 1) : todayStr()));
  }, []);

  const goToDate = useCallback((s) => setSelectedDate(s), []);

  const goToToday = useCallback(() => setSelectedDate(todayStr()), []);

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
      mounted: selectedDate !== "",
      isToday: selectedDate !== "" && selectedDate === today,
      snapshotDates: Object.keys(snapshots),
      hasSnapshot: (s) => Object.prototype.hasOwnProperty.call(snapshots, s),
      goToPrevDay,
      goToNextDay,
      goToDate,
      goToToday,
      updateData,
    }),
    [data, source, selectedDate, today, snapshots, goToPrevDay, goToNextDay, goToDate, goToToday, updateData],
  );

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) throw new Error("useDashboardData must be used within a DashboardDataProvider");
  return ctx;
}
