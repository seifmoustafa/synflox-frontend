import { ProfileDemoView } from "@/components/app_views/profile-demo-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function ProfilePage() {
  return (
    <DashboardLayout>
      <ProfileDemoView />
    </DashboardLayout>
  );
}
