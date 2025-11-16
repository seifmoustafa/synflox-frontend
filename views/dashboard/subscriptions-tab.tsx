"use client";

import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { GenericChart } from "@/components/charts/generic-chart";
import { Dashboard } from "@/domain/models/dashboard.model";

interface SubscriptionsTabProps {
  dashboard: Dashboard;
  t: (key: string) => string;
  isRTL: boolean;
}

export function SubscriptionsTab({ dashboard, t, isRTL }: SubscriptionsTabProps) {
  const { subscriptions } = dashboard;

  // Subscription Status Chart
  const subscriptionStatusChartData = {
    labels: [t("dashboard.activeSubscriptions"), t("dashboard.trialSubscriptions"), t("dashboard.expiredSubscriptions"), t("dashboard.suspendedCompanies")],
    datasets: [{
      data: [subscriptions.active, subscriptions.trial, subscriptions.expired, subscriptions.suspended],
      backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#f59e0b'],
      borderColor: ['#059669', '#2563eb', '#dc2626', '#d97706'],
      borderWidth: 2,
    }]
  };

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Status Pie */}
        <GenericChart
          title={t("dashboard.charts.subscriptionStatus")}
          description={t("dashboard.charts.subscriptionStatusDesc")}
          type="pie"
          data={subscriptionStatusChartData}
          height={300}
        />

        {/* Subscription Plans Bar Chart */}
        <GenericChart
          title={t("dashboard.subscriptionPlans")}
          description={t("dashboard.planDistribution")}
          type="bar"
          data={{
            labels: Object.keys(subscriptions.byPlan),
            datasets: [{
              label: t("dashboard.subscriptions"),
              data: Object.values(subscriptions.byPlan),
              backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(251, 146, 60, 0.7)', 'rgba(139, 92, 246, 0.7)'],
              borderColor: ['#3b82f6', '#10b981', '#fb923c', '#8b5cf6'],
              borderWidth: 2,
            }]
          }}
          height={300}
        />
      </div>

      {/* Growth Timeline */}
      <GenericChart
        title={t("dashboard.subscriptionGrowth")}
        description={t("dashboard.charts.growthTrendsDesc")}
        type="line"
        data={{
          labels: [t("dashboard.today"), t("dashboard.thisWeek"), t("dashboard.thisMonth")],
          datasets: [{
            label: t("dashboard.subscriptions"),
            data: [subscriptions.createdToday, subscriptions.createdThisWeek, subscriptions.createdThisMonth],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4,
            fill: true,
          }]
        }}
        height={250}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border bg-card shadow-lg">
          <h3 className={cn("text-xl font-bold mb-4", isRTL && "text-right")}>{t("dashboard.subscriptionBreakdown")}</h3>
          <div className="space-y-3">
            <div className={cn("flex items-center justify-between pb-3 border-b", isRTL && "flex-row-reverse")}>
              <span className="text-muted-foreground">{t("dashboard.total")}</span>
              <span className="text-2xl font-bold">{subscriptions.total}</span>
            </div>
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t("dashboard.activeSubscriptions")}</span>
              <span className="font-medium text-green-500">{subscriptions.active}</span>
            </div>
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t("dashboard.trialSubscriptions")}</span>
              <span className="font-medium text-blue-500">{subscriptions.trial}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-card shadow-lg">
          <h3 className={cn("text-xl font-bold mb-4", isRTL && "text-right")}>{t("dashboard.expirations")}</h3>
          <div className="space-y-3">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2 rounded-lg bg-red-500/10">
                <Clock className="h-5 w-5 text-red-500" />
              </div>
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold">{subscriptions.expiringWithin7Days}</p>
                <p className="text-sm text-muted-foreground">{t("dashboard.expiring7Days")}</p>
              </div>
            </div>
            <div className={cn("flex items-center gap-3 pt-3 border-t", isRTL && "flex-row-reverse")}>
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold">{subscriptions.expiringWithin30Days}</p>
                <p className="text-sm text-muted-foreground">{t("dashboard.expiring30Days")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-card shadow-lg">
          <h3 className={cn("text-xl font-bold mb-4", isRTL && "text-right")}>{t("dashboard.statusBreakdown")}</h3>
          <div className="space-y-2">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t("dashboard.expiredSubscriptions")}</span>
              <span className="font-medium text-red-500">{subscriptions.expired}</span>
            </div>
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t("dashboard.suspendedCompanies")}</span>
              <span className="font-medium text-orange-500">{subscriptions.suspended}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
