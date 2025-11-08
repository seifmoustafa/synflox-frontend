import { SubscriptionPlanView } from "@/views/subscription-plan-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function SubscriptionPlansPage() {
  return (
    <DashboardLayout>
      <SubscriptionPlanView />
    </DashboardLayout>
  );
}

