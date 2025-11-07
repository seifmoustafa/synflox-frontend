import { DashboardLayout } from "@/components/layout/dashboard-layout";
import NotAuthorizedView from "@/components/app_views/not-authorized-view";

export default function NotAuthorizedPage() {
  return (
    <DashboardLayout>
      <NotAuthorizedView />
    </DashboardLayout>
  );
}
