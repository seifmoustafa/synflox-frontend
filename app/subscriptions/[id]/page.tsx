import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SubscriptionDetailsView } from "@/views/subscription-details-view";

interface SubscriptionDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SubscriptionDetailsPage({ params }: SubscriptionDetailsPageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <SubscriptionDetailsView subscriptionId={id} />
    </DashboardLayout>
  );
}
