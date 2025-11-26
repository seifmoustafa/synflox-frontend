import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SubscriptionEditView } from "@/views/subscription-edit-view";

interface SubscriptionEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SubscriptionEditPage({ params }: SubscriptionEditPageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <SubscriptionEditView subscriptionId={id} />
    </DashboardLayout>
  );
}
