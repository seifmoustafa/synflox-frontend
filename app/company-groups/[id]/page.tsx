import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CompanyGroupDetailView } from "@/components/app_views/company-group-detail-view";

interface CompanyGroupDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CompanyGroupDetailPage({ params }: CompanyGroupDetailPageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <CompanyGroupDetailView groupId={id} />
    </DashboardLayout>
  );
}


