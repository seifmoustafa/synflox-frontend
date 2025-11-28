import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { OverviewView } from "@/views/dashboard/overview-view";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <OverviewView />
      </div>
    </DashboardLayout>
  );
}
