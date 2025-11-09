import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ApiKeyDetailView } from "@/components/app_views/api-key-detail-view";

interface ApiKeyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ApiKeyDetailPage({ params }: ApiKeyDetailPageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <ApiKeyDetailView apiKeyId={id} />
    </DashboardLayout>
  );
}


