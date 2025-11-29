import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SubscriptionsView } from "@/views/dashboard/subscriptions-view";

export default function SubscriptionsDashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <SubscriptionsView />
      </div>
    </DashboardLayout>
  );
}
