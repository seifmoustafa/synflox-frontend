import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CompaniesView } from "@/views/dashboard/companies-view";

export default function CompaniesDashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <CompaniesView />
      </div>
    </DashboardLayout>
  );
}
