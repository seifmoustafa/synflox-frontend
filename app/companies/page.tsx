import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CompanyView } from "@/views/company-view";

export default function CompaniesPage() {
  return (
    <DashboardLayout>
      <CompanyView />
    </DashboardLayout>
  );
}
