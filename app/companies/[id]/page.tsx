import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CompanyDetailsView } from "@/views/company-details-view";

interface CompanyDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CompanyDetailsPage({ params }: CompanyDetailsPageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <CompanyDetailsView companyId={id} />
    </DashboardLayout>
  );
}
