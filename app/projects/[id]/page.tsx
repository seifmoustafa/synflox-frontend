import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProjectDetailView } from "@/views/project-detail-view";

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <ProjectDetailView projectId={id} />
    </DashboardLayout>
  );
}
