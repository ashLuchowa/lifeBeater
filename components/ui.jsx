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

// Round icon button used by the top bar controls (day nav, year nav, sign out).
export const navArrowBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 34,
  height: 34,
  borderRadius: "50%",
  border: "0px solid #14150f",
  background: "transparent",
  cursor: "pointer",
  flex: "none",
};

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

// Confirmation modal for a destructive delete. Undo (where the page has one)
// covers a change of mind after the fact; this catches the mis-click before
// it happens — the two are meant to back each other up, not replace one
// another. Shared by the ledger and the assets/liabilities page so a "delete
// this?" prompt looks and behaves the same everywhere.
export function ConfirmDialog({ title, body, confirmLabel = "Delete", onCancel, onConfirm }) {
  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(20,21,15,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "5vh 16px",
      }}
    >
      <div style={{ width: "min(360px, 100%)", background: "#fff", borderRadius: 18, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 800 }}>{title}</div>
        {body && <div style={{ fontSize: 11.5, fontWeight: 600, color: "#8a8f83", lineHeight: 1.5 }}>{body}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" onClick={onCancel} style={confirmBtnGhost}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} style={confirmBtnDanger}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const confirmBtnGhost = {
  padding: "7px 13px",
  borderRadius: 999,
  border: "1px solid #d7ddcf",
  background: "#fff",
  fontSize: 12,
  fontWeight: 700,
  fontFamily: "inherit",
  color: "#14150f",
  cursor: "pointer",
};

const confirmBtnDanger = {
  padding: "7px 15px",
  borderRadius: 999,
  border: "1px solid #dd6f74",
  background: "#dd6f74",
  color: "#fff",
  fontSize: 12,
  fontWeight: 700,
  fontFamily: "inherit",
  cursor: "pointer",
};
