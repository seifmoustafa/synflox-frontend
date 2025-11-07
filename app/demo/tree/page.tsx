import { TreeNodeView } from "@/views/tree-node-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function TreeNodePage() {
  return (
    <DashboardLayout>
      <TreeNodeView />
    </DashboardLayout>
  );
}