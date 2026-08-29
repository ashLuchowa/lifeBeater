"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon } from "./icons";
import { navArrowBtn } from "./ui";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { financialYearOptions, fyLabel, maxFinancialYear, minFinancialYear, shiftFinancialYear } from "@/lib/ledger";

// Financial-year navigation for the ledger's top bar. The chosen year lives in
// the URL (?fy=2025-26), so the arrows and the picker are plain links.
//
// Years are not a registered list: stepping into a year you have never opened
// gives you a ledger carrying your categories (and fixed costs) forward, and it
// becomes real the moment you type in it. The arrows walk the same window the
// picker lists, so neither can reach a year the other will not offer.
export default function YearNav({ fy }) {
  const next = shiftFinancialYear(fy, 1);
  const prev = shiftFinancialYear(fy, -1);
  const canGoNext = next <= maxFinancialYear();
  const canGoPrev = prev >= minFinancialYear();

  return (
    <>
      <YearArrow fy={canGoPrev ? prev : null} label="Previous financial year">
        <ArrowLeftIcon />
      </YearArrow>

      <div
        style={{
          padding: "16px 24px",
          borderRadius: 999,
          background: "#fff",
          fontSize: 17,
          fontWeight: 700,
          color: "#000000",
          whiteSpace: "nowrap",
        }}
      >
        {fyLabel(fy)}
      </div>

      <YearArrow fy={canGoNext ? next : null} label="Next financial year">
        <ArrowRightIcon />
      </YearArrow>

      <YearPicker fy={fy} />
    </>
  );
}

function YearPicker({ fy }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [supabase] = useState(() => createClient());
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(null);

  // Which years already have figures — fetched once, the first time you look.
  useEffect(() => {
    if (!open || saved || !userId) return;
    let cancelled = false;
    supabase
      .from("ledgers")
      .select("fy")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (cancelled || error) return;
        setSaved(new Set(data.map((r) => r.fy)));
      });
    return () => {
      cancelled = true;
    };
  }, [open, saved, userId, supabase]);

  const options = financialYearOptions();

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Choose or start a financial year"
        style={navArrowBtn}
      >
        <PlusIcon />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              zIndex: 50,
              width: 208,
              background: "#fff",
              border: "1px solid #e4e7de",
              borderRadius: 16,
              boxShadow: "0 14px 34px rgba(0,0,0,0.16)",
              padding: 10,
              color: "#14150f",
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8a8f83", padding: "2px 6px 6px" }}>
              Financial year
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {options.map((y) => {
                const selected = y === fy;
                // `saved` is null until the lookup lands; treat unknown as neutral
                // rather than flashing every year as "New".
                const isNew = saved ? !saved.has(y) : false;
                return (
                  <Link
                    key={y}
                    href={`/income-expense?fy=${y}`}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      padding: "7px 9px",
                      borderRadius: 9,
                      fontSize: 11.5,
                      fontWeight: 700,
                      background: selected ? "#14150f" : "transparent",
                      color: selected ? "#fff" : "#14150f",
                    }}
                  >
                    {fyLabel(y)}
                    {isNew && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: selected ? "rgba(255,255,255,0.7)" : "#8a8f83" }}>
                        New
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Dimmed and inert at the end of the range, matching the day nav's next arrow.
function YearArrow({ fy, label, children }) {
  if (!fy) {
    return (
      <span style={{ ...navArrowBtn, cursor: "not-allowed", opacity: 0.3 }} aria-hidden="true">
        {children}
      </span>
    );
  }
  return (
    <Link href={`/income-expense?fy=${fy}`} style={navArrowBtn} aria-label={label}>
      {children}
    </Link>
  );
}
