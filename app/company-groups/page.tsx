import { CompanyGroupView } from "@/views/company-group-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function CompanyGroupsPage() {
  return (
    <DashboardLayout>
      <CompanyGroupView />
    </DashboardLayout>
  );
}

