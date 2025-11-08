import { NotificationsView } from "@/components/app_views/notifications-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function NotificationsPage() {
  return (
    <DashboardLayout>
      <NotificationsView />
    </DashboardLayout>
  );
}

