import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ModuleDetailView } from "@/views/module-detail-view";

interface ModuleDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ModuleDetailPage({ params }: ModuleDetailPageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <ModuleDetailView moduleId={id} />
    </DashboardLayout>
  );
}
