import { CompanyView } from "@/views/company-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function CompaniesPage() {
  return (
    <DashboardLayout>
      <CompanyView />
    </DashboardLayout>
  );
}

