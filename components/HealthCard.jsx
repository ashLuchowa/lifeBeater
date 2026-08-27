"use client";

import { useDashboardData } from "./DashboardData";
import { CardHeader } from "./ui";

export default function HealthCard() {
  const { data } = useDashboardData();
  const { health } = data;
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 10, minWidth: 0, minHeight: 0 }}>
      <CardHeader title="Health" large />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 8, flex: 1, minHeight: 0 }}>
        {health.map((h) => (
          <div key={h.label} style={{ borderRadius: 12, padding: "10px 11px", background: h.bg, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 6, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
              <span style={{ padding: "4px 8px", borderRadius: 7, background: "#fff", fontSize: 9, fontWeight: 700, whiteSpace: "nowrap" }}>{h.label}</span>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: h.dot, flex: "none", display: "block" }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>{h.value}</div>
              <div style={{ fontSize: 9.5, fontWeight: 600, opacity: 0.62, marginTop: 1 }}>{h.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
