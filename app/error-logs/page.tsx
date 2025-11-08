import { ErrorLogView } from "@/views/error-log-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function ErrorLogsPage() {
  return (
    <DashboardLayout>
      <ErrorLogView />
    </DashboardLayout>
  );
}

