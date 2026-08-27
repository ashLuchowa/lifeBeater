"use client";

import { useDashboardData } from "./DashboardData";
import { DotsIcon } from "./icons";

export default function ProfileCard() {
  const { data } = useDashboardData();
  const { profile } = data;
  return (
    <div style={{ background: "#14150f", color: "#fff", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 13 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0b323", flex: "none", overflow: "hidden" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {profile.name}
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 600, opacity: 0.6, marginTop: 2 }}>{profile.meta}</div>
        </div>
        <span style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <DotsIcon color="#fff" />
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.55 }}>
          Achievements
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {profile.badges.map((b) => (
            <span
              key={b.label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.1)",
                fontSize: 9.5,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: b.dot, display: "block" }} />
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
