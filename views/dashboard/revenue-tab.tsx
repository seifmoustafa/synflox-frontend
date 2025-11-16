"use client";

import { cn } from "@/lib/utils";
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Sparkles
} from "lucide-react";
import { GenericChart } from "@/components/charts/generic-chart";
import { Dashboard } from "@/domain/models/dashboard.model";

interface RevenueTabProps {
  dashboard: Dashboard;
  t: (key: string) => string;
  isRTL: boolean;
}

export function RevenueTab({ dashboard, t, isRTL }: RevenueTabProps) {
  const { revenue } = dashboard;

  return (
    <div className="space-y-6">
      {/* Revenue KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* MRR Card */}
        <div className="p-6 rounded-2xl border bg-gradient-to-br from-green-500/10 to-emerald-600/5 shadow-lg">
          <div className={cn("flex items-center gap-3 mb-2", isRTL && "flex-row-reverse")}>
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-sm font-medium text-muted-foreground">{t("dashboard.revenue.mrr")}</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">${revenue.mrr.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">{t("dashboard.revenue.monthlyRecurring")}</p>
        </div>

        {/* ARR Card */}
        <div className="p-6 rounded-2xl border bg-gradient-to-br from-blue-500/10 to-cyan-600/5 shadow-lg">
          <div className={cn("flex items-center gap-3 mb-2", isRTL && "flex-row-reverse")}>
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-medium text-muted-foreground">{t("dashboard.revenue.arr")}</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">${revenue.arr.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">{t("dashboard.revenue.annualRecurring")}</p>
        </div>

        {/* ARPC Card */}
        <div className="p-6 rounded-2xl border bg-gradient-to-br from-purple-500/10 to-violet-600/5 shadow-lg">
          <div className={cn("flex items-center gap-3 mb-2", isRTL && "flex-row-reverse")}>
            <Wallet className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-medium text-muted-foreground">{t("dashboard.revenue.arpc")}</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">${revenue.arpc.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">{t("dashboard.revenue.avgPerCustomer")}</p>
        </div>

        {/* Growth Card */}
        <div className={cn(
          "p-6 rounded-2xl border shadow-lg",
          revenue.isGrowing 
            ? "bg-gradient-to-br from-green-500/10 to-emerald-600/5" 
            : "bg-gradient-to-br from-orange-500/10 to-red-600/5"
        )}>
          <div className={cn("flex items-center gap-3 mb-2", isRTL && "flex-row-reverse")}>
            {revenue.isGrowing ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-orange-500" />
            )}
            <h3 className="text-sm font-medium text-muted-foreground">{t("dashboard.revenue.momGrowth")}</h3>
          </div>
          <p className={cn(
            "text-3xl font-bold",
            revenue.isGrowing ? "text-green-600" : "text-orange-600"
          )}>
            {revenue.monthOverMonthGrowth > 0 ? "+" : ""}{revenue.monthOverMonthGrowth.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-2">{t("dashboard.revenue.monthOverMonth")}</p>
        </div>
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <GenericChart
          type="line"
          title={t("dashboard.revenue.monthlyTrend")}
          description={t("dashboard.revenue.monthlyTrendDesc")}
          data={{
            labels: revenue.months,
            datasets: [{
              label: t("dashboard.revenue.revenue"),
              data: revenue.monthlyRevenueData,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.4,
            }]
          }}
          height={300}
        />

        {/* Revenue by Plan */}
        <GenericChart
          type="doughnut"
          title={t("dashboard.revenue.byPlan")}
          description={t("dashboard.revenue.byPlanDesc")}
          data={{
            labels: revenue.planNames,
            datasets: [{
              data: revenue.planRevenues,
              backgroundColor: [
                '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', 
                '#ef4444', '#06b6d4', '#ec4899', '#6366f1'
              ],
            }]
          }}
          height={300}
        />

        {/* Subscription Count Trend */}
        <GenericChart
          type="bar"
          title={t("dashboard.revenue.subscriptionTrend")}
          description={t("dashboard.revenue.subscriptionTrendDesc")}
          data={{
            labels: revenue.months,
            datasets: [{
              label: t("dashboard.revenue.subscriptionCount"),
              data: revenue.monthlySubscriptionCounts,
              backgroundColor: '#3b82f6',
            }]
          }}
          height={300}
        />

        {/* Customer Metrics */}
        <div className="p-6 rounded-2xl border bg-card shadow-lg space-y-4">
          <h3 className={cn("text-xl font-bold mb-4", isRTL && "text-right")}>
            {t("dashboard.revenue.customerMetrics")}
          </h3>
          
          <div className="space-y-3">
            <div className={cn("flex items-center justify-between pb-3 border-b", isRTL && "flex-row-reverse")}>
              <span className="text-sm text-muted-foreground">{t("dashboard.revenue.payingCustomers")}</span>
              <span className="text-2xl font-bold text-green-500">{revenue.payingCustomers}</span>
            </div>
            
            <div className={cn("flex items-center justify-between pb-3 border-b", isRTL && "flex-row-reverse")}>
              <span className="text-sm text-muted-foreground">{t("dashboard.revenue.trialCustomers")}</span>
              <span className="text-2xl font-bold text-blue-500">{revenue.trialSubscriptions}</span>
            </div>
            
            <div className={cn("flex items-center justify-between pb-3 border-b", isRTL && "flex-row-reverse")}>
              <span className="text-sm text-muted-foreground">{t("dashboard.revenue.conversionRate")}</span>
              <span className="text-2xl font-bold text-purple-500">{revenue.conversionRate.toFixed(1)}%</span>
            </div>
            
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <span className="text-sm text-muted-foreground">{t("dashboard.revenue.totalRevenue")}</span>
              <span className="text-2xl font-bold">${revenue.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Plan */}
        <div className="p-6 rounded-2xl border bg-gradient-to-br from-green-500/10 to-emerald-500/5 shadow-lg">
          <h3 className={cn("text-lg font-bold mb-4 flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Sparkles className="w-5 h-5 text-green-500" />
            {t("dashboard.revenue.topPlan")}
          </h3>
          <p className="text-3xl font-bold text-green-600 mb-2">{revenue.topPlan}</p>
          <p className="text-sm text-muted-foreground">
            ${revenue.topPlanRevenue.toLocaleString()} {t("dashboard.revenue.revenue")}
          </p>
        </div>

        {/* Currency Breakdown */}
        <div className="p-6 rounded-2xl border bg-gradient-to-br from-blue-500/10 to-cyan-500/5 shadow-lg">
          <h3 className={cn("text-lg font-bold mb-4", isRTL && "text-right")}>
            {t("dashboard.revenue.currencyBreakdown")}
          </h3>
          <div className="space-y-2">
            {revenue.currencyCodes.map((currency, idx) => (
              <div key={currency} className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <span className="text-sm font-medium">{currency}</span>
                <span className="text-lg font-bold text-blue-600">
                  ${revenue.currencyRevenues[idx].toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Indicator */}
        <div className={cn(
          "p-6 rounded-2xl border shadow-lg",
          revenue.isGrowing 
            ? "bg-gradient-to-br from-green-500/10 to-emerald-500/5" 
            : "bg-gradient-to-br from-orange-500/10 to-red-500/5"
        )}>
          <h3 className={cn("text-lg font-bold mb-4 flex items-center gap-2", isRTL && "flex-row-reverse")}>
            {revenue.isGrowing ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-orange-500" />
            )}
            {t("dashboard.revenue.growthStatus")}
          </h3>
          <p className={cn(
            "text-4xl font-bold mb-2",
            revenue.isGrowing ? "text-green-600" : "text-orange-600"
          )}>
            {revenue.growthDirection === 'up' ? '📈' : revenue.growthDirection === 'down' ? '📉' : '➡️'}
          </p>
          <p className="text-sm text-muted-foreground">
            {revenue.isGrowing 
              ? t("dashboard.revenue.revenueGrowing") 
              : t("dashboard.revenue.revenueDecreasing")}
          </p>
        </div>
      </div>
    </div>
  );
}
