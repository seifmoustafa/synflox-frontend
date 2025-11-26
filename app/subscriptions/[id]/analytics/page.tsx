import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SubscriptionAnalyticsView } from "@/views/subscription-analytics-view";

interface SubscriptionAnalyticsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SubscriptionAnalyticsPage({ params }: SubscriptionAnalyticsPageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <SubscriptionAnalyticsView subscriptionId={id} />
    </DashboardLayout>
  );
}
