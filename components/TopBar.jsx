import { HomeIcon, LedgerIcon, BarsIcon, ArrowLeftIcon, ArrowRightIcon } from "./icons";

const navBase = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  padding: "7px 14px",
  borderRadius: 999,
  fontSize: 13.5,
  fontWeight: 600,
  whiteSpace: "nowrap",
};

export default function TopBar() {
  return (
    <div className="topbar">

      <nav className="topbar-nav">
        <div style={{ ...navBase, padding: "7px 15px", background: "#14150f", color: "#fff" }}>
          <HomeIcon color="#fff" />
          Home
        </div>
        <div style={navBase}>
          <LedgerIcon />
          Assets &amp; Liabilities
        </div>
        <div style={navBase}>
          <BarsIcon />
          Income / Expense
        </div>
      </nav>

      <div className="topbar-actions">
        <ArrowLeftIcon />
        <div style={{ padding: "16px 24px", borderRadius: 999, background: "#fff", fontSize: 17, fontWeight: 700, color: "#000000", whiteSpace: "nowrap" }}>
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
