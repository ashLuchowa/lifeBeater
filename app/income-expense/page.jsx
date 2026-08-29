import { AuthProvider } from "@/components/AuthProvider";
import AppShell from "@/components/AppShell";
import TopBar from "@/components/TopBar";
import YearNav from "@/components/YearNav";
import LedgerBoard from "@/components/LedgerBoard";
import { isFinancialYear, currentFinancialYear } from "@/lib/ledger";

export const metadata = { title: "Income / Expense" };

export default function IncomeExpensePage({ searchParams }) {
  // Decide once, here, what "now" is, and hand it down — the nav needs it for
  // the This FY button and the year window, and computing it separately in the
  // browser could disagree with the server across a 1 July boundary.
  const currentFy = currentFinancialYear();
  const requested = searchParams?.fy;
  const fy = isFinancialYear(requested) ? requested : currentFy;

  return (
    <AuthProvider>
      <AppShell>
        <main className="dashboard-main">
          <div className="dashboard-panel">
            <TopBar>
              <YearNav fy={fy} currentFy={currentFy} />
            </TopBar>

            <LedgerBoard fy={fy} />
          </div>
        </main>
      </AppShell>
    </AuthProvider>
  );
}
