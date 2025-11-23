import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PlanDetailsView } from "@/views/plan-details-view";

/**
 * Plan Details Page
 * Route: /plans/[id]
 */
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanDetailsPage({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <DashboardLayout>
      <PlanDetailsView planId={id} />
    </DashboardLayout>
  );
}
