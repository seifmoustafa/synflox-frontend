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
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold tracking-tight">{overview.totalCompanies.toLocaleString()}</h3>
                  <span className={cn("text-lg font-bold", dashboard.trends.companies.trendColor)}>
                    {dashboard.trends.companies.trendIcon}
                  </span>
                </div>
                <p className="text-sm text-green-500 font-medium">
                  {overview.activeCompanies} {t("dashboard.activeSubscriptions_plural")}
                </p>
                <p className={cn("text-xs font-medium", dashboard.trends.companies.trendColor)}>
                  {dashboard.trends.companies.changeSign}{dashboard.trends.companies.changePercent.toFixed(1)}% {t("dashboard.trends.vsLastMonth")}
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
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold tracking-tight">{overview.totalSubscriptions.toLocaleString()}</h3>
                  <span className={cn("text-lg font-bold", dashboard.trends.subscriptions.trendColor)}>
                    {dashboard.trends.subscriptions.trendIcon}
                  </span>
                </div>
                <p className="text-sm text-green-500 font-medium">
                  {overview.activeSubscriptions} {t("dashboard.active")}
                </p>
                <p className={cn("text-xs font-medium", dashboard.trends.subscriptions.trendColor)}>
                  {dashboard.trends.subscriptions.changeSign}{dashboard.trends.subscriptions.changePercent.toFixed(1)}% {t("dashboard.trends.vsLastMonth")}
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
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold tracking-tight">{overview.totalAdmins.toLocaleString()}</h3>
                  <span className={cn("text-lg font-bold", dashboard.trends.admins.trendColor)}>
                    {dashboard.trends.admins.trendIcon}
                  </span>
                </div>
                <p className="text-sm text-green-500 font-medium">
                  {overview.activeAdmins} {t("dashboard.active")}
                </p>
                <p className={cn("text-xs font-medium", dashboard.trends.admins.trendColor)}>
                  {dashboard.trends.admins.changeSign}{dashboard.trends.admins.changePercent.toFixed(1)}% {t("dashboard.trends.vsLastMonth")}
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

      {/* 30-Day Forecast Section */}
      <div className="p-6 rounded-2xl border bg-gradient-to-br from-purple-500/10 to-pink-500/5 shadow-lg">
        <h3 className={cn("text-xl font-bold mb-4", isRTL && "text-right")}>
          {t("dashboard.trends.forecast30Days")}
        </h3>
        <p className={cn("text-sm text-muted-foreground mb-6", isRTL && "text-right")}>
          {t("dashboard.trends.forecastDesc")}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Companies Forecast */}
          <div className="p-4 rounded-xl border bg-card/50">
            <p className={cn("text-sm text-muted-foreground mb-2", isRTL && "text-right")}>
              {t("dashboard.companies")}
            </p>
            <div className={cn("flex items-baseline gap-2", )}>
              <p className="text-2xl font-bold">{dashboard.trends.companies.forecast30Days}</p>
              <span className="text-sm text-blue-500 font-medium">
                (+{dashboard.trends.companies.forecastGrowth})
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dashboard.trends.dailyRate")}: {dashboard.trends.companies.dailyGrowthRate}
            </p>
          </div>

          {/* Subscriptions Forecast */}
          <div className="p-4 rounded-xl border bg-card/50">
            <p className={cn("text-sm text-muted-foreground mb-2", isRTL && "text-right")}>
              {t("dashboard.subscriptions")}
            </p>
            <div className={cn("flex items-baseline gap-2", )}>
              <p className="text-2xl font-bold">{dashboard.trends.subscriptions.forecast30Days}</p>
              <span className="text-sm text-purple-500 font-medium">
                (+{dashboard.trends.subscriptions.forecastGrowth})
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dashboard.trends.dailyRate")}: {dashboard.trends.subscriptions.dailyGrowthRate}
            </p>
          </div>

          {/* Admins Forecast */}
          <div className="p-4 rounded-xl border bg-card/50">
            <p className={cn("text-sm text-muted-foreground mb-2", isRTL && "text-right")}>
              {t("dashboard.admins")}
            </p>
            <div className={cn("flex items-baseline gap-2", )}>
              <p className="text-2xl font-bold">{dashboard.trends.admins.forecast30Days}</p>
              <span className="text-sm text-green-500 font-medium">
                (+{dashboard.trends.admins.forecastGrowth})
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dashboard.trends.dailyRate")}: {dashboard.trends.admins.dailyGrowthRate}
            </p>
          </div>
        </div>

        {/* Growth Velocity Indicator */}
        <div className={cn(
          "mt-6 p-4 rounded-xl border",
          dashboard.trends.isAccelerating ? "bg-green-500/10 border-green-500/20" :
          dashboard.trends.isDecelerating ? "bg-red-500/10 border-red-500/20" :
          "bg-blue-500/10 border-blue-500/20"
        )}>
          <div className={cn("flex items-center justify-between", )}>
            <div>
              <p className="text-sm font-medium">{t("dashboard.trends.growthVelocity")}</p>
              <p className={cn(
                "text-2xl font-bold mt-1",
                dashboard.trends.isAccelerating ? "text-green-500" :
                dashboard.trends.isDecelerating ? "text-red-500" :
                "text-blue-500"
              )}>
                {t(`dashboard.trends.velocity.${dashboard.trends.growthVelocity.toLowerCase()}`)}
              </p>
            </div>
            <div className="text-4xl">
              {dashboard.trends.isAccelerating ? '🚀' : dashboard.trends.isDecelerating ? '📉' : '📊'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
