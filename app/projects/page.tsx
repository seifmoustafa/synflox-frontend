import { ProjectView } from "@/views/project-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function ProjectsPage() {
  return (
    <DashboardLayout>
      <ProjectView />
    </DashboardLayout>
  );
}

