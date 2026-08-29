"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { EXPENSE_GROUPS, blankRow, blankSource, carryForward, normaliseLedger } from "@/lib/ledger";

// How many steps back you can go. Each entry is a whole ledger document, which
// is a few KB, so this is cheap.
const HISTORY_LIMIT = 50;

// One ledger per user per financial year, in the `ledgers` table (see
// supabase/ledgers.sql). No day dimension and no snapshot inheritance — a year
// you have never edited simply falls back to the seed figures in lib/ledger.js.
export function useLedger(fy) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [supabase] = useState(() => createClient());

  const [ledger, setLedger] = useState(() => normaliseLedger(null, fy));
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const persist = useCallback(
    (next) => {
      if (!userId) return;
      setSaving(true);
      supabase
        .from("ledgers")
        .upsert(
          { user_id: userId, fy, data: next, updated_at: new Date().toISOString() },
          { onConflict: "user_id,fy" },
        )
        .then(({ error }) => {
          setSaving(false);
          if (error) {
            console.error("Failed to save ledger", error);
            setError(error.message);
          } else {
            setError(null);
          }
        });
    },
    [supabase, userId, fy],
  );

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("ledgers")
        .select("data")
        .eq("user_id", userId)
        .eq("fy", fy)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.error("Failed to load ledger", error);
        setError(error.message);
      }

      let next = data?.data;

      // No row for this year yet: inherit from the newest year you have saved
      // before it — categories and income sources, plus the fixed-cost figures,
      // which recur. fy strings sort chronologically, so "newest before" is just
      // an ordered limit 1. Nothing is written until you actually edit.
      if (!next) {
        const { data: prior } = await supabase
          .from("ledgers")
          .select("data")
          .eq("user_id", userId)
          .lt("fy", fy)
          .order("fy", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (cancelled) return;
        if (prior?.data) next = carryForward(normaliseLedger(prior.data, fy));
      }

      // A fresh load is not an edit: it starts a new history, it does not
      // become a step you can undo back past.
      setLedger(normaliseLedger(next, fy));
      setPast([]);
      setFuture([]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId, fy]);

  // Optimistic: the grid updates immediately, the write follows. Every edit
  // sends the whole ledger, the way snapshots do — these are small documents.
  const commit = useCallback(
    (next) => {
      setPast((p) => [...p, ledger].slice(-HISTORY_LIMIT));
      setFuture([]);
      setLedger(next);
      persist(next);
    },
    [ledger, persist],
  );

  const edit = useCallback(
    (fn) => commit(fn(JSON.parse(JSON.stringify(ledger)))),
    [ledger, commit],
  );

  const undo = useCallback(() => {
    if (!past.length) return;
    const restored = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [ledger, ...f].slice(0, HISTORY_LIMIT));
    setLedger(restored);
    persist(restored);
  }, [past, ledger, persist]);

  const redo = useCallback(() => {
    if (!future.length) return;
    const restored = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, ledger].slice(-HISTORY_LIMIT));
    setLedger(restored);
    persist(restored);
  }, [future, ledger, persist]);

  const actions = useMemo(
    () => ({
      // Expenses: item rows inside a fixed group.
      setValue: (group, row, month, value) =>
        edit((d) => {
          d[group][row].values[month] = value;
          return d;
        }),
      setLabel: (group, row, label) =>
        edit((d) => {
          d[group][row].label = label;
          return d;
        }),
      addRow: (group) =>
        edit((d) => {
          d[group].push(blankRow());
          return d;
        }),
      removeRow: (group, row) =>
        edit((d) => {
          d[group].splice(row, 1);
          return d;
        }),

      // Income: sources you add and rename; their week rows are fixed.
      setIncomeValue: (source, row, month, value) =>
        edit((d) => {
          d.incomeSources[source].rows[row].values[month] = value;
          return d;
        }),
      setSourceLabel: (source, label) =>
        edit((d) => {
          d.incomeSources[source].label = label;
          return d;
        }),
      addSource: () =>
        edit((d) => {
          d.incomeSources.push(blankSource());
          return d;
        }),
      removeSource: (source) =>
        edit((d) => {
          d.incomeSources.splice(source, 1);
          return d;
        }),
    }),
    [edit],
  );

  return {
    ledger,
    loading,
    saving,
    error,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    ...actions,
  };
}

export { EXPENSE_GROUPS };
