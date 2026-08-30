"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { seedData } from "@/lib/data";
import {
  EARLIEST_WEEK,
  addWeeks,
  clampWeek,
  resolveForDate,
  thisWeek,
  todayStr,
  weekEnd,
} from "@/lib/snapshots";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./AuthProvider";

const DashboardDataContext = createContext(null);

// Snapshots are per week, keyed by the week's Monday. A week without a row
// inherits the newest week on or before it, so a quiet stretch costs nothing.
export function DashboardDataProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [supabase] = useState(() => createClient());

  const [snapshots, setSnapshots] = useState({});
  // Empty until loaded so server render and first client render agree (seed data).
  const [selectedWeek, setSelectedWeek] = useState("");
  const [currentWeek, setCurrentWeek] = useState("");
  const [today, setToday] = useState("");
  // +1 = moved forward in time, -1 = moved back. Drives the page transition.
  const [direction, setDirection] = useState(1);

  const selectedRef = useRef("");
  useEffect(() => {
    selectedRef.current = selectedWeek;
  }, [selectedWeek]);

  // Point the transition the right way, then move.
  const goTo = useCallback((target) => {
    const cur = selectedRef.current;
    if (cur && target) setDirection(target < cur ? -1 : 1);
    setSelectedWeek(target);
  }, []);

  // Load every saved week for this user, then land on the present one.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from("snapshots").select("week_start, data").eq("user_id", userId);
      if (cancelled) return;

      let map = {};
      if (error) {
        console.error("Failed to load snapshots", error);
      } else {
        for (const row of data) map[row.week_start] = row.data;
      }

      // Guarantee the current week has its own row, carrying forward whatever
      // was true as of the last saved week — so every week you actually open
      // the app ends up with a real snapshot for later charting.
      const w = thisWeek();
      if (!(w in map)) {
        const carried = resolveForDate(map, w, seedData).data;
        map = { ...map, [w]: carried };
        supabase
          .from("snapshots")
          .upsert(
            { user_id: userId, week_start: w, data: carried, updated_at: new Date().toISOString() },
            { onConflict: "user_id,week_start" },
          )
          .then(({ error }) => {
            if (error) console.error("Failed to seed this week's snapshot", error);
          });
      }

      setSnapshots(map);
      setToday(todayStr());
      setCurrentWeek(w);
      setSelectedWeek(w);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  const { data, source } = useMemo(
    () => resolveForDate(snapshots, selectedWeek, seedData),
    [snapshots, selectedWeek],
  );

  // Nor back past the first week there is anything to show.
  const goToPrevWeek = useCallback(() => {
    setDirection(-1);
    setSelectedWeek((w) => {
      if (!w) return thisWeek();
      const prev = addWeeks(w, -1);
      return prev < EARLIEST_WEEK ? w : prev;
    });
  }, []);

  // Can't look into the future — next week hasn't happened yet.
  const goToNextWeek = useCallback(() => {
    setDirection(1);
    setSelectedWeek((w) => {
      const cur = thisWeek();
      const n = w ? addWeeks(w, 1) : cur;
      return n > cur ? cur : n;
    });
  }, []);

  // Any day the calendar hands back snaps to the week that contains it.
  const goToDate = useCallback((s) => goTo(clampWeek(s, thisWeek())), [goTo]);

  const goToThisWeek = useCallback(() => goTo(thisWeek()), [goTo]);

  // Save a snapshot for the selected week. `updater` may be the next snapshot
  // object, or a function receiving a deep copy of the currently effective data.
  const updateData = useCallback(
    (updater) => {
      if (!selectedWeek || !userId) return;
      setSnapshots((prev) => {
        const current = resolveForDate(prev, selectedWeek, seedData).data;
        const nextWeek =
          typeof updater === "function"
            ? updater(JSON.parse(JSON.stringify(current)))
            : updater;
        const next = { ...prev, [selectedWeek]: nextWeek };

        supabase
          .from("snapshots")
          .upsert(
            { user_id: userId, week_start: selectedWeek, data: nextWeek, updated_at: new Date().toISOString() },
            { onConflict: "user_id,week_start" },
          )
          .then(({ error }) => {
            if (error) console.error("Failed to save snapshot", error);
          });

        return next;
      });
    },
    [selectedWeek, userId, supabase],
  );

  const value = useMemo(
    () => ({
      data,
      source, // which snapshot week the data came from (null = seed)
      selectedWeek,
      selectedWeekEnd: selectedWeek ? weekEnd(selectedWeek) : "",
      currentWeek,
      today, // the real calendar day, for the calendar's "today" ring
      direction,
      mounted: selectedWeek !== "",
      isCurrentWeek: selectedWeek !== "" && selectedWeek === currentWeek,
      canGoNext: selectedWeek !== "" && selectedWeek < currentWeek,
      canGoPrev: selectedWeek !== "" && selectedWeek > EARLIEST_WEEK,
      earliestWeek: EARLIEST_WEEK,
      snapshotWeeks: Object.keys(snapshots),
      hasSnapshot: (s) => Object.prototype.hasOwnProperty.call(snapshots, s),
      goToPrevWeek,
      goToNextWeek,
      goToDate,
      goToThisWeek,
      updateData,
    }),
    [data, source, selectedWeek, currentWeek, today, direction, snapshots, goToPrevWeek, goToNextWeek, goToDate, goToThisWeek, updateData],
  );

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) throw new Error("useDashboardData must be used within a DashboardDataProvider");
  return ctx;
}
