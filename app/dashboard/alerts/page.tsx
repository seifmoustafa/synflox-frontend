import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AlertsView } from "@/views/dashboard/alerts-view";

export default function AlertsDashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <AlertsView />
      </div>
    </DashboardLayout>
  );
}
