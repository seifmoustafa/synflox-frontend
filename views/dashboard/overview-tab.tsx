"use client";

import { cn } from "@/lib/utils";
import { Building2, CreditCard, Users, TrendingUp } from "lucide-react";
import { GenericChart } from "@/components/charts/generic-chart";
import { ChartData } from "chart.js";
import { Dashboard } from "@/domain/models/dashboard.model";

interface OverviewTabProps {
  dashboard: Dashboard;
  t: (key: string) => string;
  isRTL: boolean;
  hasAnim: boolean;
}

export function OverviewTab({ dashboard, t, isRTL, hasAnim }: OverviewTabProps) {
  const { overview, companies, subscriptions, admins, alerts, recentActivity } = dashboard;

  // Chart data
  const companyStatusChartData: ChartData<'doughnut'> = {
    labels: [t("dashboard.activeCompanies"), t("dashboard.suspendedCompanies"), t("dashboard.expiredCompanies")],
    datasets: [{
      data: [companies.activeLicense, companies.suspendedLicense, companies.expiredLicense],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderColor: ['#059669', '#d97706', '#dc2626'],
      borderWidth: 2,
    }]
  };

  const subscriptionStatusChartData: ChartData<'pie'> = {
    labels: [t("dashboard.activeSubscriptions"), t("dashboard.trialSubscriptions"), t("dashboard.expiredSubscriptions"), t("dashboard.suspendedCompanies")],
    datasets: [{
      data: [subscriptions.active, subscriptions.trial, subscriptions.expired, subscriptions.suspended],
      backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#f59e0b'],
      borderColor: ['#059669', '#2563eb', '#dc2626', '#d97706'],
      borderWidth: 2,
    }]
  };

  const growthChartData: ChartData<'line'> = {
    labels: [t("dashboard.today"), t("dashboard.thisWeek"), t("dashboard.thisMonth")],
    datasets: [
      {
        label: t("dashboard.companies"),
        data: [companies.createdToday, companies.createdThisWeek, companies.createdThisMonth],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: t("dashboard.subscriptions"),
        data: [subscriptions.createdToday, subscriptions.createdThisWeek, subscriptions.createdThisMonth],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
      // {
      //   label: t("dashboard.admins"),
      //   data: [admins.createdToday, admins.createdThisWeek, admins.createdThisMonth],
      //   borderColor: '#10b981',
      //   backgroundColor: 'rgba(16, 185, 129, 0.1)',
      //   tension: 0.4,
      // }
    ]
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards - 4 CARDS INCLUDING ALERTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Companies Card */}
        <div className={cn(
          "relative group overflow-hidden",
          hasAnim && "animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
        )}>
          <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient bg-[length:200%_200%]" />
          <div className={cn("relative p-6 rounded-2xl border bg-card shadow-lg group-hover:shadow-xl transition-shadow duration-300")}>
            <div className={cn("flex items-start justify-between", )}>
              <div className={cn("space-y-2", isRTL && "text-right")}>
                <p className="text-sm font-medium text-muted-foreground">{t("dashboard.companies")}</p>
                <h3 className="text-3xl font-bold tracking-tight">{overview.totalCompanies.toLocaleString()}</h3>
                <p className="text-sm text-green-500 font-medium">
                  {overview.activeCompanies} {t("dashboard.activeSubscriptions_plural")}
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform duration-300"
              )}>
                <Building2 className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions Card */}
        <div className={cn(
          "relative group overflow-hidden",
          hasAnim && "animate-in fade-in-0 slide-in-from-bottom-2 duration-300 animation-delay-100"
        )}>
          <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient bg-[length:200%_200%]" />
          <div className={cn("relative p-6 rounded-2xl border bg-card shadow-lg group-hover:shadow-xl transition-shadow duration-300")}>
            <div className={cn("flex items-start justify-between", )}>
              <div className={cn("space-y-2", isRTL && "text-right")}>
                <p className="text-sm font-medium text-muted-foreground">{t("dashboard.subscriptions")}</p>
                <h3 className="text-3xl font-bold tracking-tight">{overview.totalSubscriptions.toLocaleString()}</h3>
                <p className="text-sm text-green-500 font-medium">
                  {overview.activeSubscriptions} {t("dashboard.active")}
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform duration-300"
              )}>
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Admins Card */}
        <div className={cn(
          "relative group overflow-hidden",
          hasAnim && "animate-in fade-in-0 slide-in-from-bottom-2 duration-300 animation-delay-200"
        )}>
          <div className="absolute -inset-[1px] bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient bg-[length:200%_200%]" />
          <div className={cn("relative p-6 rounded-2xl border bg-card shadow-lg group-hover:shadow-xl transition-shadow duration-300")}>
            <div className={cn("flex items-start justify-between", )}>
              <div className={cn("space-y-2", isRTL && "text-right")}>
                <p className="text-sm font-medium text-muted-foreground">{t("dashboard.admins")}</p>
                <h3 className="text-3xl font-bold tracking-tight">{overview.totalAdmins.toLocaleString()}</h3>
                <p className="text-sm text-green-500 font-medium">
                  {overview.activeAdmins} {t("dashboard.active")}
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-xl bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform duration-300"
              )}>
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts as Statistics Card */}
        <div className={cn(
          "relative group overflow-hidden",
          hasAnim && "animate-in fade-in-0 slide-in-from-bottom-2 duration-300 animation-delay-300"
        )}>
          {alerts.hasCriticalAlerts && (
            <div className="absolute -inset-[1px] bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient bg-[length:200%_200%]" />
          )}
          <div className={cn("relative p-6 rounded-2xl border bg-card shadow-lg group-hover:shadow-xl transition-shadow duration-300")}>
            <div className={cn("flex items-start justify-between", )}>
              <div className={cn("space-y-2", isRTL && "text-right")}>
                <p className="text-sm font-medium text-muted-foreground">{t("dashboard.systemAlerts")}</p>
                <h3 className="text-3xl font-bold tracking-tight">{alerts.totalAlerts.toLocaleString()}</h3>
                <div className="space-y-1">
                  {alerts.hasCriticalAlerts && (
                    <div className={cn("flex items-center gap-2 text-sm", )}>
                      <span className="text-red-500 font-medium">{alerts.subscriptionsExpiringToday + alerts.companiesWithExpiredLicense} {t("dashboard.critical")}</span>
                    </div>
                  )}
                  {alerts.hasWarnings && (
                    <div className={cn("flex items-center gap-2 text-sm", )}>
                      <span className="text-orange-500 font-medium">{alerts.subscriptionsExpiringThisWeek + alerts.companiesWithSuspendedLicense} {t("dashboard.warnings")}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className={cn(
                "p-3 rounded-xl group-hover:scale-110 transition-transform duration-300",
                alerts.hasCriticalAlerts ? "bg-red-500/10 text-red-500" : alerts.hasWarnings ? "bg-orange-500/10 text-orange-500" : "bg-green-500/10 text-green-500"
              )}>
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Status Doughnut */}
        <GenericChart
          title={t("dashboard.charts.companyStatus")}
          description={t("dashboard.charts.companyStatusDesc")}
          type="doughnut"
          data={companyStatusChartData}
          height={300}
          className={cn(hasAnim && "animate-in fade-in-0 slide-in-from-left-4 duration-500")}
        />

        {/* Subscription Status Pie */}
        <GenericChart
          title={t("dashboard.charts.subscriptionStatus")}
          description={t("dashboard.charts.subscriptionStatusDesc")}
          type="pie"
          data={subscriptionStatusChartData}
          height={300}
          className={cn(hasAnim && "animate-in fade-in-0 slide-in-from-right-4 duration-500")}
        />
      </div>

      {/* Growth Trends Line Chart */}
      <GenericChart
        title={t("dashboard.charts.growthTrends")}
        description={t("dashboard.charts.growthTrendsDesc")}
        type="line"
        data={growthChartData}
        height={250}
        className={cn(hasAnim && "animate-in fade-in-0 slide-in-from-bottom-4 duration-500")}
      />
    </div>
  );
}
