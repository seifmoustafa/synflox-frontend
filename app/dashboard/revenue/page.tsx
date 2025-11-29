import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RevenueView } from "@/views/dashboard/revenue-view";

export default function RevenueDashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <RevenueView />
      </div>
    </DashboardLayout>
  );
}
