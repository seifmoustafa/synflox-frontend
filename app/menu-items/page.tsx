import { MenuItemView } from "@/views/menu-item-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function MenuItemsPage() {
  return (
    <DashboardLayout>
      <MenuItemView />
    </DashboardLayout>
  );
}

