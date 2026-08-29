import { AuthProvider } from "@/components/AuthProvider";
import AppShell from "@/components/AppShell";
import TopBar from "@/components/TopBar";
import YearNav from "@/components/YearNav";
import LedgerBoard from "@/components/LedgerBoard";
import { isFinancialYear, defaultFinancialYear } from "@/lib/ledger";

export const metadata = { title: "Income / Expense" };

export default function IncomeExpensePage({ searchParams }) {
  // The chosen financial year lives in the URL; anything malformed falls back
  // to the year that actually has figures rather than rendering an empty grid.
  const requested = searchParams?.fy;
  const fy = isFinancialYear(requested) ? requested : defaultFinancialYear;

  return (
    <AuthProvider>
      <AppShell>
        <main className="dashboard-main">
          <div className="dashboard-panel">
            <TopBar>
              <YearNav fy={fy} />
            </TopBar>

            <LedgerBoard fy={fy} />
          </div>
        </main>
      </AppShell>
    </AuthProvider>
  );
}
