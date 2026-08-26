import { DotsIcon } from "./icons";

export function TitlePill({ children, size = "sm" }) {
  const large = size === "lg";
  return (
    <div
      style={{
        padding: large ? "9px 20px" : "8px 15px",
        borderRadius: 999,
        background: "#14150f",
        color: "#fff",
        fontSize: large ? 14 : 12.5,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
}

export function DotsButton({ size = 26 }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "1px solid #e4e7de",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      <DotsIcon />
    </span>
  );
}

export function Card({ children, style }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, large }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <TitlePill size={large ? "lg" : "sm"}>{title}</TitlePill>
      <DotsButton size={large ? 31 : 26} />
    </div>
  );
}
