import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PlanEditView } from "@/views/plan-edit-view";

/**
 * Plan Edit Page
 * Route: /plans/[id]/edit
 */
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanEditPage({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <PlanEditView planId={id} />
    </DashboardLayout>
  );
}
