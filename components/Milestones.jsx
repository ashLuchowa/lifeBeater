"use client";

import { useDashboardData } from "./DashboardData";
import { CardHeader } from "./ui";

export default function Milestones() {
  const { data } = useDashboardData();
  const { milestones } = data;
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 7, minHeight: 0, overflow: "hidden" }}>
      <CardHeader title="Milestones" />
      {milestones.map((m) => (
        <div key={m.name} style={{ display: "flex", flexDirection: "column", gap: 6, background: "#f6faf2", border: "1px solid #eaf0e2", borderRadius: 12, padding: "8px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ flex: 1, minWidth: 0, fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {m.name}
            </span>
            <span style={{ fontSize: 9.5, fontWeight: 700, whiteSpace: "nowrap", flex: "none" }}>{m.progress}</span>
          </div>
          <div style={{ height: 4, borderRadius: 999, background: "#e6ecdc", overflow: "hidden" }}>
            <div style={{ width: m.progress, height: "100%", borderRadius: 999, background: "#e0a92a" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
