import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProjectView } from "@/views/project-view";

export default function ProjectsPage() {
  return (
    <DashboardLayout>
      <ProjectView />
    </DashboardLayout>
  );
}
