import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CompanyDetailView } from "@/components/app_views/company-detail-view";

interface CompanyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <CompanyDetailView companyId={id} />
    </DashboardLayout>
  );
}

