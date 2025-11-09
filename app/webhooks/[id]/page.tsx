import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { WebhookDetailView } from "@/views/webhook-detail-view";

interface WebhookDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WebhookDetailPage({ params }: WebhookDetailPageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <WebhookDetailView webhookId={id} />
    </DashboardLayout>
  );
}


