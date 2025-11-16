"use client";

import { cn } from "@/lib/utils";
import { GenericChart } from "@/components/charts/generic-chart";
import { Dashboard } from "@/domain/models/dashboard.model";

interface AdminsTabProps {
  dashboard: Dashboard;
  t: (key: string) => string;
  isRTL: boolean;
}

export function AdminsTab({ dashboard, t, isRTL }: AdminsTabProps) {
  const { admins } = dashboard;

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Types Doughnut */}
        <GenericChart
          title={t("dashboard.adminTypes")}
          description={t("dashboard.adminTypeDistribution")}
          type="doughnut"
          data={{
            labels: Object.keys(admins.byType),
            datasets: [{
              data: Object.values(admins.byType),
              backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(251, 146, 60, 0.7)', 'rgba(139, 92, 246, 0.7)'],
              borderColor: ['#3b82f6', '#10b981', '#fb923c', '#8b5cf6'],
              borderWidth: 2,
            }]
          }}
          height={300}
        />

        {/* Admin Activity Bar Chart */}
        <GenericChart
          title={t("dashboard.adminActivity")}
          description={t("dashboard.adminGrowth")}
          type="bar"
          data={{
            labels: [t("dashboard.today"), t("dashboard.thisWeek"), t("dashboard.thisMonth")],
            datasets: [{
              label: t("dashboard.admins"),
              data: [admins.createdToday, admins.createdThisWeek, admins.createdThisMonth],
              backgroundColor: 'rgba(16, 185, 129, 0.7)',
              borderColor: '#10b981',
              borderWidth: 2,
            }]
          }}
          height={300}
        />
      </div>

      {/* Active vs Inactive Chart */}
      <GenericChart
        title={t("dashboard.adminStatus")}
        description={t("dashboard.activeVsInactive")}
        type="pie"
        data={{
          labels: [t("dashboard.active"), t("dashboard.inactive")],
          datasets: [{
            data: [admins.active, admins.inactive],
            backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(239, 68, 68, 0.7)'],
            borderColor: ['#10b981', '#ef4444'],
            borderWidth: 2,
          }]
        }}
        height={250}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border bg-card shadow-lg">
          <h3 className={cn("text-xl font-bold mb-4", isRTL && "text-right")}>{t("dashboard.adminStats")}</h3>
          <div className="space-y-3">
            <div className={cn("flex items-center justify-between pb-3 border-b", isRTL && "flex-row-reverse")}>
              <span className="text-muted-foreground">{t("dashboard.total")}</span>
              <span className="text-2xl font-bold">{admins.total}</span>
            </div>
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t("dashboard.active")}</span>
              <span className="font-medium text-green-500">{admins.active}</span>
            </div>
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t("dashboard.inactive")}</span>
              <span className="font-medium text-red-500">{admins.inactive}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-card shadow-lg">
          <h3 className={cn("text-xl font-bold mb-4", isRTL && "text-right")}>{t("dashboard.adminTypes")}</h3>
          <div className="space-y-2">
            {Object.entries(admins.byType).map(([type, count]) => (
              <div key={type} className={cn("flex items-center justify-between py-2 border-b last:border-0", isRTL && "flex-row-reverse")}>
                <span className="text-sm font-medium">{type}</span>
                <span className="text-lg font-bold text-primary">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-card shadow-lg">
          <h3 className={cn("text-xl font-bold mb-4", isRTL && "text-right")}>{t("dashboard.growth")}</h3>
          <div className="space-y-4">
            <div>
              <p className={cn("text-sm text-muted-foreground mb-1", isRTL && "text-right")}>{t("dashboard.today")}</p>
              <p className="text-2xl font-bold">+{admins.createdToday}</p>
            </div>
            <div>
              <p className={cn("text-sm text-muted-foreground mb-1", isRTL && "text-right")}>{t("dashboard.thisWeek")}</p>
              <p className="text-2xl font-bold">+{admins.createdThisWeek}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
