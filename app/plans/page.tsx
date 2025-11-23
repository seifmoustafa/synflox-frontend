import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SubscriptionPlanView } from "@/views/subscription-plan-view";

/**
 * Subscription Plans Management Page
 * Route: /plans
 */
export default function PlansPage() {
  return (
    <DashboardLayout>
      <SubscriptionPlanView />
    </DashboardLayout>
  );
}
