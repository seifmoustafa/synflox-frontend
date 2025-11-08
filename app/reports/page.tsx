import { ReportView } from "@/views/report-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function ReportsPage() {
  return (
    <DashboardLayout>
      <ReportView />
    </DashboardLayout>
  );
}

