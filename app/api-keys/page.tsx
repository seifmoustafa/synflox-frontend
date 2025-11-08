import { ApiKeyView } from "@/views/api-key-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function ApiKeysPage() {
  return (
    <DashboardLayout>
      <ApiKeyView />
    </DashboardLayout>
  );
}

