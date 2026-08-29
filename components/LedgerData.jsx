"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import {
  EXPENSE_GROUPS,
  blankEntry,
  blankRow,
  blankSource,
  carryForward,
  entriesTotal,
  isOtherIncome,
  normaliseLedger,
  sortEntries,
  todayInLedgerMonth,
} from "@/lib/ledger";

// Cells are addressed the same way whether they live in an expense group or an
// income source, so the breakdown actions below need only one code path.
// loc is { group, row } for expenses, { source, row } for income.
const rowAt = (d, loc) =>
  loc.source !== undefined ? d.incomeSources[loc.source].rows[loc.row] : d[loc.group][loc.row];

// A month showing a breakdown is always the sum of its lines. Deleting the last
// line leaves the figure standing — it just becomes typeable again.
const syncCell = (row, month) => {
  if (row.entries[month].length) row.values[month] = entriesTotal(row.entries[month]);
};

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

  // Mirrors the ledger state, but updated synchronously rather than at the next
  // render. Two edits can land in one event batch — clicking "+ Add line" or
  // "Done" while a field is focused fires that field's blur and the click
  // together — and reading the state captured by this render would leave the
  // second edit built on a stale copy, silently discarding the first.
  const ledgerRef = useRef(null);
  if (ledgerRef.current === null) ledgerRef.current = ledger;

  const applyLedger = useCallback((next) => {
    ledgerRef.current = next;
    setLedger(next);
  }, []);

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
      applyLedger(normaliseLedger(next, fy));
      setPast([]);
      setFuture([]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId, fy, applyLedger]);

  // Optimistic: the grid updates immediately, the write follows. Every edit
  // sends the whole ledger, the way snapshots do — these are small documents.
  const commit = useCallback(
    (next) => {
      setPast((p) => [...p, ledgerRef.current].slice(-HISTORY_LIMIT));
      setFuture([]);
      applyLedger(next);
      persist(next);
    },
    [applyLedger, persist],
  );

  // Always builds on the newest ledger, not the one this render captured.
  const edit = useCallback(
    (fn) => commit(fn(JSON.parse(JSON.stringify(ledgerRef.current)))),
    [commit],
  );

  const undo = useCallback(() => {
    if (!past.length) return;
    const restored = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [ledgerRef.current, ...f].slice(0, HISTORY_LIMIT));
    applyLedger(restored);
    persist(restored);
  }, [past, applyLedger, persist]);

  const redo = useCallback(() => {
    if (!future.length) return;
    const restored = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, ledgerRef.current].slice(-HISTORY_LIMIT));
    applyLedger(restored);
    persist(restored);
  }, [future, applyLedger, persist]);

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
          if (isOtherIncome(d.incomeSources[source])) return d;
          d.incomeSources[source].label = label;
          return d;
        }),
      // New sources go above the pinned "other income" one, which stays last.
      addSource: () =>
        edit((d) => {
          d.incomeSources.splice(d.incomeSources.length - 1, 0, blankSource());
          return d;
        }),
      removeSource: (source) =>
        edit((d) => {
          if (isOtherIncome(d.incomeSources[source])) return d;
          d.incomeSources.splice(source, 1);
          return d;
        }),

      // Per-cell breakdown, shared by expense and income cells via `loc`.
      setCellTotal: (loc, month, value) =>
        edit((d) => {
          rowAt(d, loc).values[month] = value;
          return d;
        }),
      // A new line starts on today when the cell is the current month, so the
      // common case — recording something as it happens — needs no picking.
      addEntry: (loc, month) =>
        edit((d) => {
          const row = rowAt(d, loc);
          row.entries[month].push(blankEntry(todayInLedgerMonth(fy, month)));
          row.entries[month] = sortEntries(row.entries[month]);
          syncCell(row, month);
          return d;
        }),
      setEntry: (loc, month, index, field, value) =>
        edit((d) => {
          const row = rowAt(d, loc);
          row.entries[month][index][field] = value;
          // Reorder only when the day changes — picking a day is a deliberate
          // act, whereas re-sorting mid-sentence would move the row you are
          // typing in out from under the cursor.
          if (field === "day") row.entries[month] = sortEntries(row.entries[month]);
          syncCell(row, month);
          return d;
        }),
      removeEntry: (loc, month, index) =>
        edit((d) => {
          const row = rowAt(d, loc);
          row.entries[month].splice(index, 1);
          syncCell(row, month);
          return d;
        }),
    }),
    [edit, fy],
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
