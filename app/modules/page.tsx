import { ModuleView } from "@/views/module-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function ModulesPage() {
  return (
    <DashboardLayout>
      <ModuleView />
    </DashboardLayout>
  );
}

