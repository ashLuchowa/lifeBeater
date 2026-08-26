import TopBar from "@/components/TopBar";
import TitleRow from "@/components/TitleRow";
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
    <main className="dashboard-main">
      <div className="dashboard-panel">
        <TopBar />
        <TitleRow />

        <div className="dashboard-body">
          <div className="dashboard-col">
            <ProfileCard />
            <Milestones />
            <CashflowChart />
          </div>

          <div className="dashboard-col">
            <AssetsLiabilities />
            <div className="health-skills-grid">
              <HealthCard />
              <SkillsCard />
            </div>
          </div>

          <div className="dashboard-col dashboard-col--right">
            <BillsCard />
            <NotesCard />
          </div>
        </div>
      </div>
    </main>
  );
}
