import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Welcome to SYNFLOX</h1>
        <p className="text-muted-foreground">Dashboard is being redesigned with accurate business insights.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border bg-card">
            <h3 className="font-semibold mb-2">🏢 Companies</h3>
            <p className="text-sm text-muted-foreground">Manage your companies</p>
          </div>
          <div className="p-6 rounded-xl border bg-card">
            <h3 className="font-semibold mb-2">📋 Subscriptions</h3>
            <p className="text-sm text-muted-foreground">Manage subscriptions</p>
          </div>
          <div className="p-6 rounded-xl border bg-card">
            <h3 className="font-semibold mb-2">👥 Admins</h3>
            <p className="text-sm text-muted-foreground">Manage administrators</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
