import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";
import { navArrowBtn } from "./ui";
import { adjacentYear, fyLabel } from "@/lib/ledger";

// Financial-year navigation for the ledger's top bar. No snapshot data and no
// client state — the chosen year lives in the URL (?fy=2025-26), so the page
// stays a server component and the arrows are plain links.
export default function YearNav({ fy }) {
  return (
    <>
      <YearArrow fy={adjacentYear(fy, -1)} label="Previous financial year">
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

      <YearArrow fy={adjacentYear(fy, 1)} label="Next financial year">
        <ArrowRightIcon />
      </YearArrow>
    </>
  );
}

// Dimmed and inert at the ends of the range, matching the day nav's next arrow.
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
