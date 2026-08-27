import { AuthProvider } from "@/components/AuthProvider";
import AppShell from "@/components/AppShell";
import { DashboardDataProvider } from "@/components/DashboardData";
import DayTransition from "@/components/DayTransition";
import ComingSoon from "@/components/ComingSoon";
import TopBar from "@/components/TopBar";
import ProfileCard from "@/components/ProfileCard";
import Milestones from "@/components/Milestones";
import CashflowChart from "@/components/CashflowChart";
import AssetsLiabilities from "@/components/AssetsLiabilities";
import HealthCard from "@/components/HealthCard";
import SkillsCard from "@/components/SkillsCard";
import BillsCard from "@/components/BillsCard";
import NotesCard from "@/components/NotesCard";

export default function Page() {
  return (
    <AuthProvider>
      <AppShell>
        <main className="dashboard-main">
          <DashboardDataProvider>
            <div className="dashboard-panel">
              <TopBar />

              <DayTransition>
                <div className="dashboard-body">
                  <div className="dashboard-col">
                    <ProfileCard />
                    <ComingSoon fill><Milestones /></ComingSoon>
                    <ComingSoon><CashflowChart /></ComingSoon>
                  </div>

                  <div className="dashboard-col">
                    <AssetsLiabilities />
                    <div className="health-skills-grid">
                      <ComingSoon fill><HealthCard /></ComingSoon>
                      <ComingSoon fill><SkillsCard /></ComingSoon>
                    </div>
                  </div>

                  <div className="dashboard-col dashboard-col--right">
                    <ComingSoon><BillsCard /></ComingSoon>
                    <ComingSoon fill><NotesCard /></ComingSoon>
                  </div>
                </div>
              </DayTransition>
            </div>
          </DashboardDataProvider>
        </main>
      </AppShell>
    </AuthProvider>
  );
}
