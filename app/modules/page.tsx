import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ModuleView } from "@/views/module-view";

export default function ModulesPage() {
  return (
    <DashboardLayout>
      <ModuleView />
    </DashboardLayout>
  );
}
