"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, LedgerIcon, BarsIcon, LogOutIcon } from "./icons";
import { useAuth } from "./AuthProvider";
import { navArrowBtn } from "./ui";

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

const navActive = { ...navBase, padding: "7px 15px", background: "#14150f", color: "#fff" };

// The bar knows about auth and which nav link is active — nothing else. Each
// page passes its own controls as `children`: the dashboard passes <DayNav />,
// which is snapshot-backed, and the ledger passes <YearNav />, which is not.
// That keeps the DashboardDataProvider requirement with the pages that have one.
export default function TopBar({ children }) {
  const { signOut } = useAuth();
  const pathname = usePathname();

  const onLedger = pathname === "/income-expense";

  return (
    <div className="topbar">

      <nav className="topbar-nav">
        <Link href="/" style={onLedger ? navBase : navActive}>
          <HomeIcon color={onLedger ? "#14150f" : "#fff"} />
          Home
        </Link>
        <div style={navBase}>
          <LedgerIcon />
          Assets &amp; Liabilities
        </div>
        <Link href="/income-expense" style={onLedger ? navActive : navBase}>
          <BarsIcon color={onLedger ? "#fff" : "#14150f"} />
          Income / Expense
        </Link>
      </nav>

      <div className="topbar-actions">
        {children}

        <button type="button" style={navArrowBtn} onClick={signOut} aria-label="Sign out">
          <LogOutIcon />
        </button>
      </div>

    </div>
  );
}
