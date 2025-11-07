import { AdminTypeView } from "@/views/admin-type-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function AdminTypesPage() {
  return (
    <DashboardLayout>
      <AdminTypeView />
    </DashboardLayout>
  );
}

