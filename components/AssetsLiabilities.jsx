"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useDashboardData } from "./DashboardData";
import { TitlePill } from "./ui";
import { formatMoney } from "@/lib/money";
import { ensurePortfolio, ledgersFromPortfolio, portfolioTotals } from "@/lib/portfolio";

// Read-only summary of the portfolio records. Editing moved to
// /assets-liabilities, which owns the detail (holdings, rates, fees) — the card
// derives its rows from the same records so the two cannot disagree.
export default function AssetsLiabilities() {
  const { data } = useDashboardData();

  const portfolio = useMemo(() => ensurePortfolio(data), [data]);
  const ledgers = useMemo(() => ledgersFromPortfolio(portfolio), [portfolio]);
  const totals = useMemo(() => portfolioTotals(portfolio), [portfolio]);

  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/assets-liabilities" style={{ display: "flex", alignItems: "center", gap: 9 }} aria-label="Open assets and liabilities detail">
          <TitlePill size="lg">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              Assets &amp; Liabilities
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </span>
          </TitlePill>
        </Link>
      </div>

      <div className="assets-grid">
        {ledgers.map((l, li) => (
          <div key={l.label} style={{ borderRadius: 14, padding: 12, background: l.bg, display: "flex", flexDirection: "column", gap: 9, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, flexWrap: "wrap", rowGap: 4 }}>
              <div style={{ padding: "5px 9px", borderRadius: 8, background: "#fff", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", flex: "none" }}>
                {l.label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
                {formatMoney(li === 0 ? totals.assets : totals.liabilities)}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {l.items.map((it, ii) => (
                <div key={it.name + ii} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 9, padding: "5px 9px" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: l.bar, flex: "none", display: "block" }} />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 10.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {it.name}
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>{it.value}</span>
                </div>
              ))}
              {l.items.length === 0 && (
                <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.5, padding: "4px 2px" }}>No items</div>
              )}
            </div>
          </div>
        ))}

        {/* Square (height tracks its own width) and pinned to the top of its
            grid row, so the Net Worth panel keeps a steady shape instead of
            stretching with however many rows the Assets and Liabilities lists
            happen to have. Below 1280px it spans full width, where the CSS
            drops the aspect ratio. */}
        <div className="networth-card" style={{ borderRadius: 14, padding: 13, background: "#14150f", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 10, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ padding: "5px 9px", borderRadius: 8, background: "rgba(255,255,255,0.12)", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
              Net Worth
            </div>
          </div>
          <div className="networth-value">{formatMoney(totals.net)}</div>
          <div style={{ display: "flex", height: 6, borderRadius: 999, overflow: "hidden", background: "rgba(255,255,255,0.16)" }}>
            <div style={{ width: totals.assetShare + "%", background: "#c9e88a" }} />
            <div style={{ width: 100 - totals.assetShare + "%", background: "#dd6f74" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
