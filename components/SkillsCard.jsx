import { skillGroups } from "@/lib/data";
import { CardHeader } from "./ui";

export default function SkillsCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 10, minWidth: 0, minHeight: 0 }}>
      <CardHeader title="Skills" large />
      <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1, minHeight: 0 }}>
        {skillGroups.map((g) => (
          <div key={g.category} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8a8f83" }}>
              {g.category}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignContent: "flex-start", gap: 7 }}>
              {g.items.map((name) => (
                <div key={name} style={{ display: "inline-flex", alignItems: "center", border: "1px solid #eaf0e2", background: "#f6faf2", borderRadius: 11, padding: "8px 11px", width: "auto", flex: "0 0 auto" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap" }}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
