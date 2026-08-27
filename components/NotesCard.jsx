"use client";

import { useDashboardData } from "./DashboardData";
import { CardHeader } from "./ui";
import { CheckIcon } from "./icons";

export default function NotesCard() {
  const { data } = useDashboardData();
  const { notes } = data;
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0, minHeight: 0, overflow: "hidden" }}>
      <CardHeader title="Notes" />
      {notes.map((n) => (
        <div key={n.text} style={{ display: "flex", alignItems: "flex-start", gap: 9, background: "#f6faf2", border: "1px solid #eaf0e2", borderRadius: 11, padding: "10px 12px" }}>
          {n.done ? (
            <span style={{ width: 15, height: 15, borderRadius: 5, background: "#14150f", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", marginTop: 1 }}>
              <CheckIcon />
            </span>
          ) : (
            <span style={{ width: 15, height: 15, borderRadius: 5, border: "1.5px solid #c8d2bd", background: "#fff", flex: "none", display: "block", marginTop: 1 }} />
          )}
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1.35,
              textWrap: "pretty",
              opacity: n.done ? 0.5 : 1,
              textDecoration: n.done ? "line-through" : "none",
            }}
          >
            {n.text}
          </span>
        </div>
      ))}
    </div>
  );
}
