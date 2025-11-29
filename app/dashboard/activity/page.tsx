import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ActivityView } from "@/views/dashboard/activity-view";

export default function ActivityDashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <ActivityView />
      </div>
    </DashboardLayout>
  );
}
