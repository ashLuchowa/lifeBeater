import { AuthProvider } from "@/components/AuthProvider";
import AppShell from "@/components/AppShell";
import { DashboardDataProvider } from "@/components/DashboardData";
import DayTransition from "@/components/DayTransition";
import TopBar from "@/components/TopBar";
import DayNav from "@/components/DayNav";
import PortfolioBoard from "@/components/PortfolioBoard";

export const metadata = { title: "Assets & Liabilities" };

// The drill-down behind the dashboard's Assets & Liabilities card. Same weekly
// snapshot as the dashboard — DayNav here moves both.
export default function AssetsLiabilitiesPage() {
  return (
    <AuthProvider>
      <AppShell>
        <main className="dashboard-main">
          <DashboardDataProvider>
            <div className="dashboard-panel">
              <TopBar>
                <DayNav />
              </TopBar>

              <DayTransition>
                <PortfolioBoard />
              </DayTransition>
            </div>
          </DashboardDataProvider>
        </main>
      </AppShell>
    </AuthProvider>
  );
}
