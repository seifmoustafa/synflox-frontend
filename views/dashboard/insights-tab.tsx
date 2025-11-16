"use client";

import { cn } from "@/lib/utils";
import { 
  Users,
  TrendingDown,
  AlertTriangle,
  RefreshCcw,
  Heart,
  Target,
  Clock
} from "lucide-react";
import { GenericChart } from "@/components/charts/generic-chart";
import { Dashboard } from "@/domain/models/dashboard.model";

interface InsightsTabProps {
  dashboard: Dashboard;
  t: (key: string) => string;
  isRTL: boolean;
}

export function InsightsTab({ dashboard, t, isRTL }: InsightsTabProps) {
  const { lifecycle } = dashboard;

  return (
    <div className="space-y-6">
      {/* Lifecycle Stages KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* New Companies */}
        <div className="p-6 rounded-2xl border bg-gradient-to-br from-blue-500/10 to-cyan-600/5 shadow-lg">
          <div className={cn("flex items-center gap-3 mb-2", )}>
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-medium text-muted-foreground">{t("dashboard.lifecycle.new")}</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{lifecycle.stages.new}</p>
          <p className="text-xs text-muted-foreground mt-2">{t("dashboard.lifecycle.newDesc")}</p>
        </div>

        {/* Active Companies */}
        <div className="p-6 rounded-2xl border bg-gradient-to-br from-green-500/10 to-emerald-600/5 shadow-lg">
          <div className={cn("flex items-center gap-3 mb-2", )}>
            <Heart className="w-5 h-5 text-green-500" />
            <h3 className="text-sm font-medium text-muted-foreground">{t("dashboard.lifecycle.active")}</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{lifecycle.stages.active}</p>
          <p className="text-xs text-muted-foreground mt-2">{t("dashboard.lifecycle.activeDesc")}</p>
        </div>

        {/* At-Risk Companies */}
        <div className="p-6 rounded-2xl border bg-gradient-to-br from-orange-500/10 to-amber-600/5 shadow-lg">
          <div className={cn("flex items-center gap-3 mb-2", )}>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-medium text-muted-foreground">{t("dashboard.lifecycle.atRisk")}</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">{lifecycle.stages.atRisk}</p>
          <p className="text-xs text-muted-foreground mt-2">{t("dashboard.lifecycle.atRiskDesc")}</p>
        </div>

        {/* Churned Companies */}
        <div className="p-6 rounded-2xl border bg-gradient-to-br from-red-500/10 to-rose-600/5 shadow-lg">
          <div className={cn("flex items-center gap-3 mb-2", )}>
            <TrendingDown className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-medium text-muted-foreground">{t("dashboard.lifecycle.churned")}</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">{lifecycle.stages.churned}</p>
          <p className="text-xs text-muted-foreground mt-2">{t("dashboard.lifecycle.churnedDesc")}</p>
        </div>

        {/* Returning Companies */}
        <div className="p-6 rounded-2xl border bg-gradient-to-br from-purple-500/10 to-violet-600/5 shadow-lg">
          <div className={cn("flex items-center gap-3 mb-2", )}>
            <RefreshCcw className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-medium text-muted-foreground">{t("dashboard.lifecycle.returning")}</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">{lifecycle.stages.returning}</p>
          <p className="text-xs text-muted-foreground mt-2">{t("dashboard.lifecycle.returningDesc")}</p>
        </div>
      </div>

      {/* Churn Metrics KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Churn Rate */}
        <div className={cn(
          "p-6 rounded-2xl border shadow-lg",
          lifecycle.churnStatus === 'healthy' ? "bg-gradient-to-br from-green-500/10 to-emerald-600/5" :
          lifecycle.churnStatus === 'warning' ? "bg-gradient-to-br from-orange-500/10 to-amber-600/5" :
          "bg-gradient-to-br from-red-500/10 to-rose-600/5"
        )}>
          <div className={cn("flex items-center gap-3 mb-2", )}>
            <TrendingDown className={cn(
              "w-5 h-5",
              lifecycle.churnStatus === 'healthy' ? "text-green-500" :
              lifecycle.churnStatus === 'warning' ? "text-orange-500" :
              "text-red-500"
            )} />
            <h3 className="text-sm font-medium text-muted-foreground">{t("dashboard.churn.churnRate")}</h3>
          </div>
          <p className={cn(
            "text-3xl font-bold",
            lifecycle.churnStatus === 'healthy' ? "text-green-600" :
            lifecycle.churnStatus === 'warning' ? "text-orange-600" :
            "text-red-600"
          )}>
            {lifecycle.churn.churnRate.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-2">{t("dashboard.churn.churnRateDesc")}</p>
        </div>

        {/* Retention Rate */}
        <div className="p-6 rounded-2xl border bg-gradient-to-br from-blue-500/10 to-cyan-600/5 shadow-lg">
          <div className={cn("flex items-center gap-3 mb-2", )}>
            <Target className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-medium text-muted-foreground">{t("dashboard.churn.retentionRate")}</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{lifecycle.churn.retentionRate.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-2">{t("dashboard.churn.retentionRateDesc")}</p>
        </div>

        {/* Average Lifetime */}
        <div className="p-6 rounded-2xl border bg-gradient-to-br from-purple-500/10 to-violet-600/5 shadow-lg">
          <div className={cn("flex items-center gap-3 mb-2", )}>
            <Clock className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-medium text-muted-foreground">{t("dashboard.churn.avgLifetime")}</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">{lifecycle.averageLifetimeMonths.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground mt-2">{t("dashboard.churn.avgLifetimeDesc")}</p>
        </div>

        {/* High Risk Count */}
        <div className="p-6 rounded-2xl border bg-gradient-to-br from-orange-500/10 to-red-600/5 shadow-lg">
          <div className={cn("flex items-center gap-3 mb-2", )}>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-medium text-muted-foreground">{t("dashboard.churn.highRisk")}</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">{lifecycle.churn.highRiskCount}</p>
          <p className="text-xs text-muted-foreground mt-2">{t("dashboard.churn.highRiskDesc")}</p>
        </div>
      </div>

      {/* Charts Row 1: Lifecycle & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lifecycle Stages Distribution */}
        <GenericChart
          type="doughnut"
          title={t("dashboard.lifecycle.stagesChart")}
          description={t("dashboard.lifecycle.stagesChartDesc")}
          data={{
            labels: [
              t("dashboard.lifecycle.new"),
              t("dashboard.lifecycle.active"),
              t("dashboard.lifecycle.atRisk"),
              t("dashboard.lifecycle.churned"),
              t("dashboard.lifecycle.returning")
            ],
            datasets: [{
              data: lifecycle.stageData,
              backgroundColor: lifecycle.stageColors,
            }]
          }}
          height={300}
        />

        {/* Health Distribution */}
        <GenericChart
          type="bar"
          title={t("dashboard.lifecycle.healthChart")}
          description={t("dashboard.lifecycle.healthChartDesc")}
          data={{
            labels: [
              t("dashboard.lifecycle.excellent"),
              t("dashboard.lifecycle.good"),
              t("dashboard.lifecycle.fair"),
              t("dashboard.lifecycle.poor")
            ],
            datasets: [{
              label: t("dashboard.lifecycle.companies"),
              data: lifecycle.healthData,
              backgroundColor: lifecycle.healthColors,
            }]
          }}
          height={300}
        />
      </div>

      {/* Charts Row 2: Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <GenericChart
          type="pie"
          title={t("dashboard.churn.riskChart")}
          description={t("dashboard.churn.riskChartDesc")}
          data={{
            labels: [
              t("dashboard.churn.lowRisk"),
              t("dashboard.churn.mediumRisk"),
              t("dashboard.churn.highRisk")
            ],
            datasets: [{
              data: lifecycle.riskData,
              backgroundColor: lifecycle.riskColors,
            }]
          }}
          height={300}
        />

        {/* Lifecycle Health Panel */}
        <div className="p-6 rounded-2xl border bg-card shadow-lg space-y-4">
          <h3 className={cn("text-xl font-bold mb-4", isRTL && "text-right")}>
            {t("dashboard.lifecycle.healthMetrics")}
          </h3>
          
          <div className="space-y-3">
            <div className={cn("flex items-center justify-between pb-3 border-b", )}>
              <span className="text-sm text-muted-foreground">{t("dashboard.lifecycle.healthyCompanies")}</span>
              <span className="text-2xl font-bold text-green-500">{lifecycle.healthyCompanies}</span>
            </div>
            
            <div className={cn("flex items-center justify-between pb-3 border-b", )}>
              <span className="text-sm text-muted-foreground">{t("dashboard.lifecycle.unhealthyCompanies")}</span>
              <span className="text-2xl font-bold text-orange-500">{lifecycle.unhealthyCompanies}</span>
            </div>
            
            <div className={cn("flex items-center justify-between pb-3 border-b", )}>
              <span className="text-sm text-muted-foreground">{t("dashboard.lifecycle.healthRate")}</span>
              <span className="text-2xl font-bold text-blue-500">{lifecycle.healthRate.toFixed(1)}%</span>
            </div>
            
            <div className={cn("flex items-center justify-between", )}>
              <span className="text-sm text-muted-foreground">{t("dashboard.lifecycle.totalCompanies")}</span>
              <span className="text-2xl font-bold">{lifecycle.totalCompanies}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Churn Status */}
        <div className={cn(
          "p-6 rounded-2xl border shadow-lg",
          lifecycle.churnStatus === 'healthy' ? "bg-gradient-to-br from-green-500/10 to-emerald-500/5" :
          lifecycle.churnStatus === 'warning' ? "bg-gradient-to-br from-orange-500/10 to-amber-500/5" :
          "bg-gradient-to-br from-red-500/10 to-rose-500/5"
        )}>
          <h3 className={cn("text-lg font-bold mb-4", isRTL && "text-right")}>
            {t("dashboard.churn.status")}
          </h3>
          <p className={cn(
            "text-4xl font-bold mb-2",
            lifecycle.churnStatus === 'healthy' ? "text-green-600" :
            lifecycle.churnStatus === 'warning' ? "text-orange-600" :
            "text-red-600"
          )}>
            {lifecycle.churnStatus === 'healthy' ? '✅' : lifecycle.churnStatus === 'warning' ? '⚠️' : '🚨'}
          </p>
          <p className="text-sm text-muted-foreground">
            {lifecycle.churnStatus === 'healthy' 
              ? t("dashboard.churn.statusHealthy") 
              : lifecycle.churnStatus === 'warning'
              ? t("dashboard.churn.statusWarning")
              : t("dashboard.churn.statusCritical")}
          </p>
        </div>

        {/* Retention Status */}
        <div className={cn(
          "p-6 rounded-2xl border shadow-lg",
          lifecycle.retentionStatus === 'excellent' ? "bg-gradient-to-br from-green-500/10 to-emerald-500/5" :
          lifecycle.retentionStatus === 'good' ? "bg-gradient-to-br from-blue-500/10 to-cyan-500/5" :
          "bg-gradient-to-br from-orange-500/10 to-red-500/5"
        )}>
          <h3 className={cn("text-lg font-bold mb-4", isRTL && "text-right")}>
            {t("dashboard.churn.retentionStatus")}
          </h3>
          <p className={cn(
            "text-4xl font-bold mb-2",
            lifecycle.retentionStatus === 'excellent' ? "text-green-600" :
            lifecycle.retentionStatus === 'good' ? "text-blue-600" :
            "text-orange-600"
          )}>
            {lifecycle.retentionStatus === 'excellent' ? '🌟' : lifecycle.retentionStatus === 'good' ? '👍' : '⚡'}
          </p>
          <p className="text-sm text-muted-foreground">
            {lifecycle.retentionStatus === 'excellent'
              ? t("dashboard.churn.retentionExcellent")
              : lifecycle.retentionStatus === 'good'
              ? t("dashboard.churn.retentionGood")
              : t("dashboard.churn.retentionPoor")}
          </p>
        </div>

        {/* Action Required */}
        <div className={cn(
          "p-6 rounded-2xl border shadow-lg",
          lifecycle.needsAttention 
            ? "bg-gradient-to-br from-orange-500/10 to-red-500/5" 
            : "bg-gradient-to-br from-green-500/10 to-emerald-500/5"
        )}>
          <h3 className={cn("text-lg font-bold mb-4", isRTL && "text-right")}>
            {t("dashboard.churn.actionRequired")}
          </h3>
          <p className={cn(
            "text-4xl font-bold mb-2",
            lifecycle.needsAttention ? "text-orange-600" : "text-green-600"
          )}>
            {lifecycle.needsAttention ? '⚠️' : '✅'}
          </p>
          <p className="text-sm text-muted-foreground">
            {lifecycle.needsAttention
              ? t("dashboard.churn.actionNeeded")
              : t("dashboard.churn.allGood")}
          </p>
        </div>
      </div>
    </div>
  );
}
