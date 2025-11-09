import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardView } from "@/views/dashboard-view";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardView />
    </DashboardLayout>
  );
}
