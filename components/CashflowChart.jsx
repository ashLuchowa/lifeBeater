"use client";

import { useDashboardData } from "./DashboardData";
import { CardHeader } from "./ui";

const legendDot = (color) => ({ width: 7, height: 7, borderRadius: 2, background: color, display: "block" });

export default function CashflowChart() {
  const { data } = useDashboardData();
  const { cashflow } = data;
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 9, minWidth: 0, minHeight: 0, height: 189 }}>
      <CardHeader title="Income / Expense" />

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 7, flex: 1, minHeight: 0, minWidth: 0 }}>
        {cashflow.map((c) => (
          <div key={c.month} style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 5 }}>
            <div style={{ width: "38%", flex: 1, minHeight: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3 }}>
              <div style={{ width: "44%", height: c.inH, borderRadius: "4px 4px 2px 2px", background: "#FFD25B" }} />
              <div style={{ width: "44%", height: c.exH, borderRadius: "4px 4px 2px 2px", background: "#FF777B" }} />
            </div>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: "#8a8f83" }}>{c.month}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.6 }}>Last 6 Months</span>
        <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 9, fontWeight: 700 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={legendDot("#e0a92a")} />
            Income
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={legendDot("#dd6f74")} />
            Expense
          </span>
        </span>
      </div>
    </div>
  );
}
