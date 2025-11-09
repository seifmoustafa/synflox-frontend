import { AnalyticsView } from "@/views/analytics-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function AnalyticsPage() {
  return (
    <DashboardLayout>
      <AnalyticsView />
    </DashboardLayout>
  );
}

