"use client";

import { useDashboardData } from "./DashboardData";
import { CardHeader } from "./ui";

export default function BillsCard() {
  const { data } = useDashboardData();
  const { bills } = data;
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 9, minWidth: 0 }}>
      <CardHeader title="Upcoming Bills" />
      {bills.map((b) => (
        <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 9, background: "#f6faf2", border: "1px solid #eaf0e2", borderRadius: 11, padding: "10px 12px" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#e0a92a", flex: "none", display: "block" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.name}</div>
            <div style={{ fontSize: 9.5, fontWeight: 600, color: "#8a8f83", marginTop: 1, whiteSpace: "nowrap" }}>{b.due}</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", flex: "none" }}>{b.amount}</span>
        </div>
      ))}
    </div>
  );
}
