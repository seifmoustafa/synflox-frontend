import { AnalyticsView } from "@/components/app_views/analytics-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

interface CompanyAnalyticsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CompanyAnalyticsPage({ params }: CompanyAnalyticsPageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <AnalyticsView companyId={id} />
    </DashboardLayout>
  );
}

