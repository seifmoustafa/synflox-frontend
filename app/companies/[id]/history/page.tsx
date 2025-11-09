import { SubscriptionHistoryView } from "@/views/subscription-history-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

interface CompanyHistoryPageProps {
  params: {
    id: string;
  };
}

export default async function CompanyHistoryPage({ params }: CompanyHistoryPageProps) {
  return (
    <DashboardLayout>
      <SubscriptionHistoryView companyId={params.id} />
    </DashboardLayout>
  );
}

