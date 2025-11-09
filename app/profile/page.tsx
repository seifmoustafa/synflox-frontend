import { ProfileView } from "@/components/app_views/profile-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function ProfilePage() {
  return (
    <DashboardLayout>
      <ProfileView />
    </DashboardLayout>
  );
}
