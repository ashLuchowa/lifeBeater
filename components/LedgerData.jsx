"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { GROUPS, blankRow, ledgerFor, normaliseLedger } from "@/lib/ledger";

// One ledger per user per financial year, in the `ledgers` table (see
// supabase/ledgers.sql). No day dimension and no snapshot inheritance — a year
// you have never edited simply falls back to the seed figures in lib/ledger.js.
export function useLedger(fy) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [supabase] = useState(() => createClient());

  const [ledger, setLedger] = useState(() => ledgerFor(fy));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Guards a race: switching year mid-request must not let the older response
  // overwrite the newer year's data.
  const wantedRef = useRef(fy);
  wantedRef.current = fy;

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

      if (cancelled || wantedRef.current !== fy) return;
      if (error) {
        console.error("Failed to load ledger", error);
        setError(error.message);
      }
      setLedger(normaliseLedger(data?.data, fy));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId, fy]);

  // Optimistic: the grid updates immediately, the write follows. Every edit
  // sends the whole ledger, the way snapshots do — these are small documents.
  const save = useCallback(
    (next) => {
      setLedger(next);
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

  const edit = useCallback(
    (fn) => save(fn(JSON.parse(JSON.stringify(ledger)))),
    [ledger, save],
  );

  const actions = useMemo(
    () => ({
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
    }),
    [edit],
  );

  return { ledger, loading, saving, error, ...actions };
}

export { GROUPS };
