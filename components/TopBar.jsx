import { HomeIcon, LedgerIcon, BarsIcon, SearchIcon } from "./icons";

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
        <div style={{ width: 31, height: 31, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <SearchIcon />
        </div>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#f0b323", border: "2.5px solid #fff", overflow: "hidden", flex: "none" }} />
      </div>
    </div>
  );
}
