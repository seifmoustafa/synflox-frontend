"use client";

import { cn } from "@/lib/utils";
import { GenericChart } from "@/components/charts/generic-chart";
import { Dashboard } from "@/domain/models/dashboard.model";

interface CompaniesTabProps {
  dashboard: Dashboard;
  t: (key: string) => string;
  isRTL: boolean;
}

export function CompaniesTab({ dashboard, t, isRTL }: CompaniesTabProps) {
  const { companies } = dashboard;

  // Company Status Chart
  const companyStatusChartData = {
    labels: [t("dashboard.activeCompanies"), t("dashboard.suspendedCompanies"), t("dashboard.expiredCompanies")],
    datasets: [{
      data: [companies.activeLicense, companies.suspendedLicense, companies.expiredLicense],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderColor: ['#059669', '#d97706', '#dc2626'],
      borderWidth: 2,
    }]
  };

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Status Doughnut */}
        <GenericChart
          title={t("dashboard.charts.companyStatus")}
          description={t("dashboard.charts.companyStatusDesc")}
          type="doughnut"
          data={companyStatusChartData}
          height={300}
        />

        {/* Growth Bar Chart */}
        <GenericChart
          title={t("dashboard.growth")}
          description={t("dashboard.charts.growthTrendsDesc")}
          type="bar"
          data={{
            labels: [t("dashboard.today"), t("dashboard.thisWeek"), t("dashboard.thisMonth")],
            datasets: [{
              label: t("dashboard.companies"),
              data: [companies.createdToday, companies.createdThisWeek, companies.createdThisMonth],
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              borderColor: '#3b82f6',
              borderWidth: 2,
            }]
          }}
          height={300}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl border bg-card shadow-lg">
          <h3 className={cn("text-xl font-bold mb-4", isRTL && "text-right")}>{t("dashboard.companyBreakdown")}</h3>
          <div className="space-y-3">
            <div className={cn("flex items-center justify-between pb-3 border-b", )}>
              <span className="text-muted-foreground">{t("dashboard.total")}</span>
              <span className="text-2xl font-bold">{companies.total}</span>
            </div>
            <div className={cn("flex items-center justify-between", )}>
              <span className="text-sm">{t("dashboard.activeCompanies")}</span>
              <span className="font-medium text-green-500">{companies.activeLicense}</span>
            </div>
            <div className={cn("flex items-center justify-between", )}>
              <span className="text-sm">{t("dashboard.suspendedCompanies")}</span>
              <span className="font-medium text-orange-500">{companies.suspendedLicense}</span>
            </div>
            <div className={cn("flex items-center justify-between", )}>
              <span className="text-sm">{t("dashboard.expiredCompanies")}</span>
              <span className="font-medium text-red-500">{companies.expiredLicense}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-card shadow-lg">
          <h3 className={cn("text-xl font-bold mb-4", isRTL && "text-right")}>{t("dashboard.growth")}</h3>
          <div className="space-y-4">
            <div>
              <p className={cn("text-sm text-muted-foreground mb-1", isRTL && "text-right")}>{t("dashboard.today")}</p>
              <p className="text-3xl font-bold text-primary">+{companies.createdToday}</p>
            </div>
            <div>
              <p className={cn("text-sm text-muted-foreground mb-1", isRTL && "text-right")}>{t("dashboard.thisWeek")}</p>
              <p className="text-2xl font-bold">+{companies.createdThisWeek}</p>
            </div>
            <div>
              <p className={cn("text-sm text-muted-foreground mb-1", isRTL && "text-right")}>{t("dashboard.thisMonth")}</p>
              <p className="text-2xl font-bold">+{companies.createdThisMonth}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
