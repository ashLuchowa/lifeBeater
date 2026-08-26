import { ArrowLeftIcon, ArrowRightIcon } from "./icons";

export default function TitleRow() {
  return (
    <div className="title-row">
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 23, fontWeight: 700, letterSpacing: "-0.02em" }}>Home</span>
      </div>
      <div className="title-row-controls">
        <ArrowLeftIcon />
        <div style={{ padding: "8px 17px", borderRadius: 999, background: "#fff", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
          24 August, 2026
        </div>
        <ArrowRightIcon />
        <div style={{ padding: "8px 17px", borderRadius: 999, background: "#14150f", color: "#fff", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
          Today
        </div>
      </div>
    </div>
  );
}
