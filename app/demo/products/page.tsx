import { ProductView } from "@/views/product-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function ProductPage() {
  return (
    <DashboardLayout>
      <ProductView />
    </DashboardLayout>
  );
}