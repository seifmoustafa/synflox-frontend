import { WebhookView } from "@/views/webhook-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function WebhooksPage() {
  return (
    <DashboardLayout>
      <WebhookView />
    </DashboardLayout>
  );
}

