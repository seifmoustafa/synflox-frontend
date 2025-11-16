"use client";

import { cn } from "@/lib/utils";
import { 
  Building2, 
  CreditCard, 
  Users, 
  TrendingUp, 
  Activity, 
  Sparkles,
  UserPlus,
  AlertTriangle,
  Target 
} from "lucide-react";
import { GenericChart } from "@/components/charts/generic-chart";
import { Dashboard } from "@/domain/models/dashboard.model";

interface PerformanceTabProps {
  dashboard: Dashboard;
  t: (key: string) => string;
  isRTL: boolean;
}

export function PerformanceTab({ dashboard, t, isRTL }: PerformanceTabProps) {
  const { overview, companies, subscriptions, admins, alerts, timeSeries } = dashboard;

  return (
    <div className="space-y-6">
      {/* KPI Performance Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border bg-gradient-to-br from-blue-500/10 to-blue-600/5 shadow-lg">
          <div className={cn("flex items-center gap-3 mb-4", isRTL && "flex-row-reverse")}>
            <Building2 className="w-6 h-6 text-blue-500" />
            <h3 className="font-semibold">{t("dashboard.analytics.companyHealth")}</h3>
          </div>
          <div className="text-center py-4">
            <p className="text-5xl font-bold text-blue-500">{overview.companyActivityRate.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground mt-2">{t("dashboard.analytics.activeRate")}</p>
            <div className="mt-4 w-full bg-secondary rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${overview.companyActivityRate}%` }} />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-gradient-to-br from-purple-500/10 to-purple-600/5 shadow-lg">
          <div className={cn("flex items-center gap-3 mb-4", isRTL && "flex-row-reverse")}>
            <CreditCard className="w-6 h-6 text-purple-500" />
            <h3 className="font-semibold">{t("dashboard.analytics.subscriptionHealth")}</h3>
          </div>
          <div className="text-center py-4">
            <p className="text-5xl font-bold text-purple-500">{overview.subscriptionActivityRate.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground mt-2">{t("dashboard.analytics.activeRate")}</p>
            <div className="mt-4 w-full bg-secondary rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${overview.subscriptionActivityRate}%` }} />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-gradient-to-br from-green-500/10 to-green-600/5 shadow-lg">
          <div className={cn("flex items-center gap-3 mb-4", isRTL && "flex-row-reverse")}>
            <Users className="w-6 h-6 text-green-500" />
            <h3 className="font-semibold">{t("dashboard.analytics.adminHealth")}</h3>
          </div>
          <div className="text-center py-4">
            <p className="text-5xl font-bold text-green-500">{overview.adminActivityRate.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground mt-2">{t("dashboard.analytics.activeRate")}</p>
            <div className="mt-4 w-full bg-secondary rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${overview.adminActivityRate}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Dimensional Performance Radar */}
      <GenericChart
        title={t("dashboard.analytics.performanceRadar")}
        description={t("dashboard.analytics.performanceRadarDesc")}
        type="radar"
        data={{
          labels: [
            t("dashboard.analytics.companyActivity"),
            t("dashboard.analytics.subscriptionActivity"),
            t("dashboard.analytics.adminActivity"),
            t("dashboard.analytics.growth"),
            t("dashboard.analytics.retention"),
            t("dashboard.analytics.efficiency")
          ],
          datasets: [{
            label: t("dashboard.analytics.systemPerformance"),
            data: [
              overview.companyActivityRate,
              overview.subscriptionActivityRate,
              overview.adminActivityRate,
              ((companies.createdThisMonth / Math.max(companies.total, 1)) * 100),
              ((subscriptions.active / Math.max(subscriptions.total, 1)) * 100),
              (100 - ((alerts.totalAlerts / Math.max(overview.totalCompanies, 1)) * 10))
            ],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: '#3b82f6',
            borderWidth: 2,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#3b82f6'
          }]
        }}
        height={350}
      />

      {/* Comparative Growth Analysis - Multi-Axis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GenericChart
          title={t("dashboard.analytics.comparativeGrowth")}
          description={t("dashboard.analytics.comparativeGrowthDesc")}
          type="bar"
          data={{
            labels: [t("dashboard.today"), t("dashboard.thisWeek"), t("dashboard.thisMonth")],
            datasets: [
              {
                label: t("dashboard.companies"),
                data: [companies.createdToday, companies.createdThisWeek, companies.createdThisMonth],
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: '#3b82f6',
                borderWidth: 2,
              },
              {
                label: t("dashboard.subscriptions"),
                data: [subscriptions.createdToday, subscriptions.createdThisWeek, subscriptions.createdThisMonth],
                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                borderColor: '#8b5cf6',
                borderWidth: 2,
              },
              {
                label: t("dashboard.admins"),
                data: [admins.createdToday, admins.createdThisWeek, admins.createdThisMonth],
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: '#10b981',
                borderWidth: 2,
              }
            ]
          }}
          height={350}
        />

        {/* Activity Funnel Chart */}
        <GenericChart
          title={t("dashboard.analytics.activityFunnel")}
          description={t("dashboard.analytics.activityFunnelDesc")}
          type="bar"
          data={{
            labels: [t("dashboard.analytics.totalEntities"), t("dashboard.analytics.activeEntities"), t("dashboard.analytics.recent24h")],
            datasets: [{
              label: t("dashboard.analytics.entities"),
              data: [
                overview.totalCompanies + overview.totalSubscriptions + overview.totalAdmins,
                overview.activeCompanies + overview.activeSubscriptions + overview.activeAdmins,
                companies.createdToday + subscriptions.createdToday + admins.createdToday
              ],
              backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(251, 146, 60, 0.7)'],
              borderColor: ['#3b82f6', '#10b981', '#fb923c'],
              borderWidth: 2,
            }]
          }}
          height={350}
        />
      </div>

      {/* Status Distribution - Comprehensive Mixed Chart */}
      <GenericChart
        title={t("dashboard.analytics.statusDistribution")}
        description={t("dashboard.analytics.statusDistributionDesc")}
        type="bar"
        data={{
          labels: [t("dashboard.companies"), t("dashboard.subscriptions")],
          datasets: [
            {
              label: t("dashboard.active"),
              data: [companies.activeLicense, subscriptions.active],
              backgroundColor: 'rgba(16, 185, 129, 0.7)',
              borderColor: '#10b981',
              borderWidth: 2,
              stack: 'stack1'
            },
            {
              label: t("dashboard.analytics.issues"),
              data: [companies.suspendedLicense + companies.expiredLicense, subscriptions.suspended + subscriptions.expired],
              backgroundColor: 'rgba(239, 68, 68, 0.7)',
              borderColor: '#ef4444',
              borderWidth: 2,
              stack: 'stack1'
            },
            {
              label: t("dashboard.analytics.trial"),
              data: [0, subscriptions.trial],
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              borderColor: '#3b82f6',
              borderWidth: 2,
              stack: 'stack1'
            }
          ]
        }}
        height={300}
      />

      {/* Real-Time Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
          <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
            <Building2 className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">{t("dashboard.analytics.companiesLast24h")}</span>
          </div>
          <p className="text-2xl font-bold">+{companies.createdToday}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("dashboard.analytics.newAdditions")}</p>
        </div>

        <div className="p-4 rounded-xl border bg-gradient-to-br from-purple-500/5 to-pink-500/5">
          <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
            <CreditCard className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium">{t("dashboard.analytics.subscriptionsLast24h")}</span>
          </div>
          <p className="text-2xl font-bold">+{subscriptions.createdToday}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("dashboard.analytics.newActivations")}</p>
        </div>

        <div className="p-4 rounded-xl border bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
            <UserPlus className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">{t("dashboard.analytics.adminsLast24h")}</span>
          </div>
          <p className="text-2xl font-bold">+{admins.createdToday}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("dashboard.analytics.newTeamMembers")}</p>
        </div>

        <div className="p-4 rounded-xl border bg-gradient-to-br from-orange-500/5 to-red-500/5">
          <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
            <Activity className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">{t("dashboard.analytics.systemScore")}</span>
          </div>
          <p className="text-2xl font-bold">{dashboard.overallActivityScore.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-1">{t("dashboard.analytics.overallHealth")}</p>
        </div>
      </div>

      {/* Critical & Growth Metrics Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border bg-gradient-to-br from-red-500/10 to-orange-500/5 shadow-lg">
          <h3 className={cn("text-lg font-bold mb-4 flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {t("dashboard.analytics.criticalMetrics")}
          </h3>
          <div className="space-y-3">
            <div className={cn("flex items-center justify-between p-3 rounded-lg bg-background/50", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t("dashboard.analytics.expiringToday")}</span>
              <span className="text-xl font-bold text-red-500">{alerts.subscriptionsExpiringToday}</span>
            </div>
            <div className={cn("flex items-center justify-between p-3 rounded-lg bg-background/50", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t("dashboard.analytics.expiredCompanies")}</span>
              <span className="text-xl font-bold text-red-500">{alerts.companiesWithExpiredLicense}</span>
            </div>
            <div className={cn("flex items-center justify-between p-3 rounded-lg bg-background/50", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t("dashboard.analytics.suspendedCompanies")}</span>
              <span className="text-xl font-bold text-orange-500">{alerts.companiesWithSuspendedLicense}</span>
            </div>
            <div className={cn("flex items-center justify-between p-3 rounded-lg bg-background/50", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t("dashboard.analytics.inactiveAdmins")}</span>
              <span className="text-xl font-bold text-orange-500">{alerts.inactiveAdmins}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-gradient-to-br from-blue-500/10 to-cyan-500/5 shadow-lg">
          <h3 className={cn("text-lg font-bold mb-4 flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Sparkles className="w-5 h-5 text-blue-500" />
            {t("dashboard.analytics.growthMetrics")}
          </h3>
          <div className="space-y-3">
            <div className={cn("flex items-center justify-between p-3 rounded-lg bg-background/50", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t("dashboard.analytics.monthlyGrowth")}</span>
              <span className="text-xl font-bold text-blue-500">+{companies.createdThisMonth + subscriptions.createdThisMonth}</span>
            </div>
            <div className={cn("flex items-center justify-between p-3 rounded-lg bg-background/50", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t("dashboard.analytics.weeklyGrowth")}</span>
              <span className="text-xl font-bold text-purple-500">+{companies.createdThisWeek + subscriptions.createdThisWeek}</span>
            </div>
            <div className={cn("flex items-center justify-between p-3 rounded-lg bg-background/50", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t("dashboard.analytics.avgDailyGrowth")}</span>
              <span className="text-xl font-bold text-green-500">+{Math.round((companies.createdThisMonth + subscriptions.createdThisMonth) / 30)}</span>
            </div>
            <div className={cn("flex items-center justify-between p-3 rounded-lg bg-background/50", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t("dashboard.analytics.retentionRate")}</span>
              <span className="text-xl font-bold text-purple-500">{((subscriptions.active / Math.max(subscriptions.total, 1)) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 30-DAY TIME-SERIES CHARTS */}
      <div className="space-y-6">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <h2 className="text-2xl font-bold">{t("dashboard.timeSeries.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("dashboard.timeSeries.subtitle")}</p>
        </div>

        {/* 30-Day Growth Timeline - Multi-Line Chart */}
        <GenericChart
          title={t("dashboard.timeSeries.growthTimeline")}
          description={t("dashboard.timeSeries.growthTimelineDesc")}
          type="line"
          data={{
            labels: timeSeries.dates,
            datasets: [
              {
                label: t("dashboard.timeSeries.companiesGrowth"),
                data: timeSeries.companiesCreatedData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
              },
              {
                label: t("dashboard.timeSeries.subscriptionsGrowth"),
                data: timeSeries.subscriptionsCreatedData,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4,
              },
              {
                label: t("dashboard.timeSeries.adminsGrowth"),
                data: timeSeries.adminsCreatedData,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
              }
            ]
          }}
          height={300}
        />

        {/* Active Entities Over Time - Filled Area Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GenericChart
            title={t("dashboard.timeSeries.activeOverTime")}
            description={t("dashboard.timeSeries.activeOverTimeDesc")}
            type="line"
            data={{
              labels: timeSeries.dates,
              datasets: [
                {
                  label: t("dashboard.companies"),
                  data: timeSeries.companiesActiveData,
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  fill: true,
                  tension: 0.4,
                },
                {
                  label: t("dashboard.subscriptions"),
                  data: timeSeries.subscriptionsActiveData,
                  borderColor: '#8b5cf6',
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  fill: true,
                  tension: 0.4,
                },
                {
                  label: t("dashboard.admins"),
                  data: timeSeries.adminsActiveData,
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  fill: true,
                  tension: 0.4,
                }
              ]
            }}
            height={300}
          />

          {/* Daily Average & Total Growth Stats */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl border bg-gradient-to-br from-blue-500/10 to-purple-500/5 shadow-lg">
              <h3 className={cn("text-lg font-bold mb-4", isRTL && "text-right")}>{t("dashboard.timeSeries.growthStats")}</h3>
              <div className="space-y-3">
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <span className="text-sm text-muted-foreground">{t("dashboard.timeSeries.totalGrowth")}</span>
                  <span className="text-2xl font-bold text-blue-500">{timeSeries.totalGrowth}</span>
                </div>
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <span className="text-sm text-muted-foreground">{t("dashboard.timeSeries.avgDailyGrowth")}</span>
                  <span className="text-2xl font-bold text-purple-500">{timeSeries.averageDailyGrowth.toFixed(1)}</span>
                </div>
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <span className="text-sm text-muted-foreground">{t("dashboard.timeSeries.dataPoints")}</span>
                  <span className="text-2xl font-bold text-green-500">{timeSeries.last30Days.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Entity Growth - Bar Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GenericChart
            title={t("dashboard.timeSeries.companiesGrowth")}
            type="bar"
            data={{
              labels: timeSeries.dates,
              datasets: [{
                label: t("dashboard.companies"),
                data: timeSeries.companiesCreatedData,
                backgroundColor: '#3b82f6',
              }]
            }}
            height={250}
          />
          
          <GenericChart
            title={t("dashboard.timeSeries.subscriptionsGrowth")}
            type="bar"
            data={{
              labels: timeSeries.dates,
              datasets: [{
                label: t("dashboard.subscriptions"),
                data: timeSeries.subscriptionsCreatedData,
                backgroundColor: '#8b5cf6',
              }]
            }}
            height={250}
          />
          
          <GenericChart
            title={t("dashboard.timeSeries.adminsGrowth")}
            type="bar"
            data={{
              labels: timeSeries.dates,
              datasets: [{
                label: t("dashboard.admins"),
                data: timeSeries.adminsCreatedData,
                backgroundColor: '#10b981',
              }]
            }}
            height={250}
          />
        </div>
      </div>
    </div>
  );
}
