import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SubscriptionPlanDetailView } from "@/components/app_views/subscription-plan-detail-view";

interface SubscriptionPlanDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SubscriptionPlanDetailPage({ params }: SubscriptionPlanDetailPageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <SubscriptionPlanDetailView planId={id} />
    </DashboardLayout>
  );
}


