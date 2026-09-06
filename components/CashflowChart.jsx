"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { TitlePill } from "./ui";
import { ledgerMonthOf, ledgerMonthlyTotals } from "@/lib/ledger";

const CAL_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// How many trailing calendar months the card covers. The fixed card height
// below is sized to hold this many month chips.
const WINDOW = 4;

const INCOME = "#e0a92a";
const EXPENSE = "#dd6f74";

const money = (n) => "$" + Math.round(n).toLocaleString("en-NZ");

const legendDot = (color) => ({ width: 7, height: 7, borderRadius: 2, background: color, display: "block" });

// One month, styled to match a Milestones chip: pale panel, hairline border,
// a label/figures row above a pair of thin tracks (income over expense), both
// scaled to the window's peak.
function MonthChip({ label, income, expense, max }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "#f6faf2", border: "1px solid #eaf0e2", borderRadius: 12, padding: "8px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {label}
        </span>
        <span style={{ display: "flex", gap: 8, fontSize: 9.5, fontWeight: 700, whiteSpace: "nowrap", flex: "none" }}>
          <span style={{ color: INCOME }}>{money(income)}</span>
          <span style={{ color: EXPENSE }}>{money(expense)}</span>
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Track value={income} max={max} color={INCOME} />
        <Track value={expense} max={max} color={EXPENSE} />
      </div>
    </div>
  );
}

function Track({ value, max, color }) {
  const pct = value <= 0 ? 0 : Math.max(3, Math.round((value / max) * 100));
  return (
    <div style={{ height: 6, borderRadius: 999, background: "#e6ecdc", overflow: "hidden" }}>
      <div style={{ width: pct + "%", height: "100%", borderRadius: 999, background: color }} />
    </div>
  );
}

// Pulls the real income/expense figures from the Income / Expense ledger (the
// `ledgers` table, one row per financial year) rather than the weekly snapshot.
// The trailing window can straddle 1 July, so up to two financial years load.
export default function CashflowChart() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [supabase] = useState(() => createClient());
  const [ledgers, setLedgers] = useState(null); // { [fy]: rawData } once loaded

  // The trailing WINDOW calendar months, newest first (running month on top),
  // each tagged with the financial year and column index it maps to.
  const windowMonths = useMemo(() => {
    const now = new Date();
    return Array.from({ length: WINDOW }, (_, k) => {
      const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
      return { label: CAL_MONTHS[d.getMonth()], ...ledgerMonthOf(d) };
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const fys = [...new Set(windowMonths.map((m) => m.fy))];
    (async () => {
      const { data, error } = await supabase
        .from("ledgers")
        .select("fy, data")
        .eq("user_id", userId)
        .in("fy", fys);
      if (cancelled) return;
      const map = {};
      if (error) console.error("Failed to load ledgers for cashflow", error);
      else for (const row of data) map[row.fy] = row.data;
      setLedgers(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId, windowMonths]);

  const rows = useMemo(() => {
    const totals = {};
    for (const { fy } of windowMonths) {
      if (!totals[fy]) totals[fy] = ledgerMonthlyTotals(ledgers?.[fy] ?? null, fy);
    }
    return windowMonths.map((m) => ({
      label: m.label,
      income: totals[m.fy].income[m.monthIndex],
      expense: totals[m.fy].expense[m.monthIndex],
    }));
  }, [ledgers, windowMonths]);

  const max = Math.max(1, ...rows.flatMap((r) => [r.income, r.expense]));

  return (
    <Link href="/income-expense" className="card-link" aria-label="Open the Income / Expense page">
      <div style={{ background: "#fff", borderRadius: 18, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 7, minWidth: 0, minHeight: 0, overflow: "hidden", height: 324 }}>
        <div style={{ display: "flex" }}>
          <TitlePill size="sm">Income / Expense</TitlePill>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1, minHeight: 0 }}>
          {rows.map((r) => (
            <MonthChip key={r.label} {...r} max={max} />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.6 }}>Last {WINDOW} Months</span>
          <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 9, fontWeight: 700 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={legendDot(INCOME)} />
              Income
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={legendDot(EXPENSE)} />
              Expense
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
