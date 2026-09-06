"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { CardHeader } from "./ui";
import { ledgerMonthOf, ledgerMonthlyTotals } from "@/lib/ledger";

const CAL_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// How many trailing calendar months the card covers. The fixed card height
// below is sized to give this many bar rows some breathing room.
const WINDOW = 4;

const INCOME = "#e0a92a";
const EXPENSE = "#dd6f74";

const money = (n) => "$" + Math.round(n).toLocaleString("en-NZ");

const legendDot = (color) => ({ width: 7, height: 7, borderRadius: 2, background: color, display: "block" });

// One month: income bar over expense bar, both scaled to the window's peak.
function MonthRow({ label, income, expense, max }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 24, flex: "none", fontSize: 8.5, fontWeight: 700, color: "#8a8f83" }}>{label}</div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        <Bar value={income} max={max} color="#FFD25B" />
        <Bar value={expense} max={max} color="#FF777B" />
      </div>
      <div style={{ width: 50, flex: "none", textAlign: "right", display: "flex", flexDirection: "column", gap: 3, fontSize: 8.5, fontWeight: 700 }}>
        <span style={{ color: INCOME }}>{money(income)}</span>
        <span style={{ color: EXPENSE }}>{money(expense)}</span>
      </div>
    </div>
  );
}

function Bar({ value, max, color }) {
  const pct = value <= 0 ? 0 : Math.max(3, Math.round((value / max) * 100));
  return (
    <div style={{ height: 7, borderRadius: 3, background: "#f0f1ec", overflow: "hidden" }}>
      <div style={{ width: pct + "%", height: "100%", borderRadius: 3, background: color }} />
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

  // The trailing WINDOW calendar months, oldest first, each tagged with the
  // financial year and column index it maps to.
  const windowMonths = useMemo(() => {
    const now = new Date();
    return Array.from({ length: WINDOW }, (_, k) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (WINDOW - 1 - k), 1);
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
      <div style={{ background: "#fff", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 9, minWidth: 0, minHeight: 0, height: 224 }}>
        <CardHeader title="Income / Expense" />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 15, flex: 1, minHeight: 0 }}>
          {rows.map((r) => (
            <MonthRow key={r.label} {...r} max={max} />
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
