import { AdminView } from "@/views/admin-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function AdminsPage() {
  return (
    <DashboardLayout>
      <AdminView />
    </DashboardLayout>
  );
}

