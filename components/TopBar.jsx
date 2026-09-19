"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOutIcon, MenuIcon } from "./icons";
import { useAuth } from "./AuthProvider";
import { navArrowBtn } from "./ui";

// The bar knows about auth and which nav link is active — nothing else. Each
// page passes its own controls as `children`: the dashboard passes <DayNav />,
// which is snapshot-backed, and the ledger passes <YearNav />, which is not.
// That keeps the DashboardDataProvider requirement with the pages that have one.
export default function TopBar({ children }) {
  const { signOut } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const onLedger = pathname === "/income-expense";
  const onPortfolio = pathname === "/assets-liabilities";
  const onHome = !onLedger && !onPortfolio;

  // Close the menu when the route it navigated to has arrived.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // One definition of the three destinations, rendered twice: inline on a wide
  // screen, inside the hamburger below it. CSS decides which is visible, so
  // there is no resize listener and both server and client render the same.
  const links = (
    <>
      <Link href="/" className={onHome ? "topbar-link topbar-link--active" : "topbar-link"}>
        Home
      </Link>
      <Link href="/assets-liabilities" className={onPortfolio ? "topbar-link topbar-link--active" : "topbar-link"}>
        Assets &amp; Liabilities
      </Link>
      <Link href="/income-expense" className={onLedger ? "topbar-link topbar-link--active" : "topbar-link"}>
        Income / Expense
      </Link>
    </>
  );

  return (
    <div className="topbar">

      <nav className="topbar-nav">{links}</nav>

      <div className="topbar-menu">
        <button
          type="button"
          style={navArrowBtn}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <MenuIcon />
        </button>

        {menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
            <nav className="nav-popover nav-popover--menu">
              <div className="topbar-menu-list" onClick={() => setMenuOpen(false)}>
                {links}
              </div>
            </nav>
          </>
        )}
      </div>

      <div className="topbar-actions">{children}</div>

      <button
        type="button"
        className="topbar-signout"
        style={navArrowBtn}
        onClick={signOut}
        aria-label="Sign out"
      >
        <LogOutIcon />
      </button>

    </div>
  );
}
