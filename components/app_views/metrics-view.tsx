"use client";

import { useMetricViewModel } from "@/viewmodels/metric-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GenericChart, GENERIC_COLORS } from "@/components/charts/generic-chart";
import { Badge } from "@/components/ui/badge";
import { Building2, Key, Webhook, Activity, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export function MetricsView() {
  const { t } = useI18n();
  const { loading, summary, history, loadHistory } = useMetricViewModel();

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">
              {t("metrics.error.title")}
            </CardTitle>
            <CardDescription>
              {t("metrics.error.loadFailed")}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Prepare chart data for company status
  const companyStatusChartData = {
    labels: [
      t("metrics.activeCompanies"),
      t("metrics.expiredCompanies"),
      t("metrics.suspendedCompanies"),
      t("metrics.trialCompanies"),
    ],
    datasets: [{
      label: t("metrics.companies"),
      data: [
        summary.activeCompanies,
        summary.expiredCompanies,
        summary.suspendedCompanies,
        summary.trialCompanies,
      ],
      backgroundColor: [
        GENERIC_COLORS.success[0] + "80",
        GENERIC_COLORS.destructive[0] + "80",
        GENERIC_COLORS.warning[0] + "80",
        GENERIC_COLORS.info[0] + "80",
      ],
      borderColor: [
        GENERIC_COLORS.success[0],
        GENERIC_COLORS.destructive[0],
        GENERIC_COLORS.warning[0],
        GENERIC_COLORS.info[0],
      ],
      borderWidth: 1,
    }],
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("metrics.totalCompanies")}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCompanies.toLocaleString()}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="active">{summary.activeCompanies} {t("common.active")}</Badge>
              <Badge variant="secondary">{summary.expiredCompanies} {t("metrics.expired")}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("metrics.totalApiKeys")}</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalApiKeys.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.activeApiKeys} {t("common.active")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("metrics.totalWebhooks")}</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalWebhooks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.activeWebhooks} {t("common.active")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("metrics.totalRequests")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalRequests.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <span className="text-xs text-muted-foreground">
                {summary.successRate.toFixed(1)}% {t("metrics.successRate")}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("metrics.companyStatus")}</CardTitle>
            <CardDescription>{t("metrics.companyStatusDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <GenericChart
              type="pie"
              title={t("metrics.companyStatus")}
              description={t("metrics.companyStatusDescription")}
              data={companyStatusChartData}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("metrics.apiPerformance")}</CardTitle>
            <CardDescription>{t("metrics.apiPerformanceDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t("metrics.totalRequests")}</span>
                <span className="font-semibold">{summary.totalRequests.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t("metrics.successRate")}</span>
                <Badge variant="active">{summary.successRate.toFixed(1)}%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t("metrics.errorRate")}</span>
                <Badge variant="destructive">{summary.errorRate.toFixed(2)}%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t("metrics.avgResponseTime")}</span>
                <span className="font-semibold">{summary.averageResponseTime.toFixed(0)}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {t("metrics.lastUpdated")}: {new Date(summary.lastUpdated).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

