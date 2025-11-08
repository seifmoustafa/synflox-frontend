import { MetricsView } from "@/components/app_views/metrics-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function MetricsPage() {
  return (
    <DashboardLayout>
      <MetricsView />
    </DashboardLayout>
  );
}

