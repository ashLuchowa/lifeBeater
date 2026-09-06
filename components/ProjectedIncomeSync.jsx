"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { currentFinancialYear, projectedYearIncome } from "@/lib/ledger";
import { useAuth } from "./AuthProvider";
import { useDashboardData } from "./DashboardData";

// Renders nothing. Its job is to keep `data.projectedIncome` on the *current*
// week's snapshot in step with the live Income / Expense ledger, so every week
// you open the app records the estimate that was true at the time. Older weeks
// keep whatever was stored then — the number is meant to be a weekly history.
export default function ProjectedIncomeSync() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [supabase] = useState(() => createClient());
  const { data, isCurrentWeek, updateData } = useDashboardData();

  const [ledger, setLedger] = useState({ loaded: false, data: null });

  // Pull the current financial year's ledger once.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data: row, error } = await supabase
        .from("ledgers")
        .select("data")
        .eq("user_id", userId)
        .eq("fy", currentFinancialYear())
        .maybeSingle();
      if (cancelled) return;
      if (error) console.error("Failed to load ledger for projected income", error);
      setLedger({ loaded: true, data: error ? null : row?.data ?? null });
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  // When viewing the current week, write the fresh estimate — and which FY it is
  // for — onto its snapshot if either has drifted. Comparing rounded values
  // keeps this from looping.
  useEffect(() => {
    if (!ledger.loaded || !isCurrentWeek) return;
    const fy = currentFinancialYear();
    const estimate = Math.round(projectedYearIncome(ledger.data, fy));
    if (Math.round(data.projectedIncome ?? 0) === estimate && data.projectedIncomeFy === fy) return;
    updateData((d) => {
      d.projectedIncome = estimate;
      d.projectedIncomeFy = fy;
      return d;
    });
  }, [ledger, isCurrentWeek, data.projectedIncome, data.projectedIncomeFy, updateData]);

  return null;
}
