import { LoginAttemptView } from "@/views/login-attempt-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function LoginAttemptsPage() {
  return (
    <DashboardLayout>
      <LoginAttemptView />
    </DashboardLayout>
  );
}

