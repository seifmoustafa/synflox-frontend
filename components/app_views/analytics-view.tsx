"use client";

import { useState } from "react";
import { useAnalyticsViewModel } from "@/viewmodels/analytics-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GenericChart, GENERIC_COLORS } from "@/components/charts/generic-chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Activity, Clock, CheckCircle2, XCircle } from "lucide-react";

interface AnalyticsViewProps {
  companyId?: string;
}

export function AnalyticsView({ companyId }: AnalyticsViewProps) {
  const { t } = useI18n();
  const { 
    loading, 
    companyUsage, 
    apiUsage, 
    apiUsageByEndpoint, 
    apiUsageByCompany,
    dateRange,
    updateDateRange,
    refresh
  } = useAnalyticsViewModel(companyId);
  const [localStartDate, setLocalStartDate] = useState(dateRange.startDate || "");
  const [localEndDate, setLocalEndDate] = useState(dateRange.endDate || "");

  const handleApplyDateRange = () => {
    updateDateRange(localStartDate, localEndDate);
  };

  // Prepare chart data for requests by day
  const getRequestsByDayChartData = () => {
    const data = companyId ? companyUsage?.requestsByDay : apiUsage?.requestsByDay;
    if (!data) return null;

    const sortedDays = Object.keys(data).sort();
    return {
      labels: sortedDays.map(day => new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: t("analytics.requests"),
        data: sortedDays.map(day => data[day]),
        borderColor: GENERIC_COLORS.primary[0],
        backgroundColor: GENERIC_COLORS.primary[0] + "20",
        fill: true,
        tension: 0.4,
      }],
    };
  };

  // Prepare chart data for requests by endpoint
  const getRequestsByEndpointChartData = () => {
    if (!apiUsageByEndpoint?.requestsByEndpoint) return null;

    const entries = Object.entries(apiUsageByEndpoint.requestsByEndpoint);
    const sorted = entries.sort((a, b) => b[1].count - a[1].count).slice(0, 10);

    return {
      labels: sorted.map(([endpoint]) => endpoint.split('/').pop() || endpoint),
      datasets: [{
        label: t("analytics.requests"),
        data: sorted.map(([, data]) => data.count),
        backgroundColor: GENERIC_COLORS.primary.map(c => c + "80"),
        borderColor: GENERIC_COLORS.primary,
        borderWidth: 1,
      }],
    };
  };

  // Prepare chart data for requests by company
  const getRequestsByCompanyChartData = () => {
    if (!apiUsageByCompany?.requestsByCompany) return null;

    const entries = Object.entries(apiUsageByCompany.requestsByCompany);
    const sorted = entries.sort((a, b) => b[1].count - a[1].count).slice(0, 10);

    // Use primary colors but start from index 1 to differentiate from other charts
    const colors = GENERIC_COLORS.primary.slice(1);

    return {
      labels: sorted.map(([, data]) => data.companyName || data.companyId.substring(0, 8)),
      datasets: [{
        label: t("analytics.requests"),
        data: sorted.map(([, data]) => data.count),
        backgroundColor: colors.map(c => c + "80"),
        borderColor: colors,
        borderWidth: 1,
      }],
    };
  };

  if (loading && !companyUsage && !apiUsage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.filters")}</CardTitle>
          <CardDescription>{t("analytics.filtersDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>{t("analytics.fromDate")}</Label>
              <Input
                type="date"
                value={localStartDate}
                onChange={(e) => setLocalStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label>{t("analytics.toDate")}</Label>
              <Input
                type="date"
                value={localEndDate}
                onChange={(e) => setLocalEndDate(e.target.value)}
              />
            </div>
            <Button onClick={handleApplyDateRange}>
              <Calendar className="h-4 w-4 mr-2" />
              {t("analytics.apply")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {companyId && companyUsage ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("analytics.totalRequests")}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyUsage.totalRequests.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("analytics.successRate")}</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyUsage.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">{companyUsage.successfulRequests.toLocaleString()} {t("analytics.successful")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("analytics.failureRate")}</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyUsage.failureRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">{companyUsage.failedRequests.toLocaleString()} {t("analytics.failed")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("analytics.avgResponseTime")}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyUsage.averageResponseTime.toFixed(0)}ms</div>
            </CardContent>
          </Card>
        </div>
      ) : apiUsage ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("analytics.totalRequests")}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiUsage.totalRequests.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("analytics.successRate")}</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiUsage.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">{apiUsage.successfulRequests.toLocaleString()} {t("analytics.successful")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("analytics.failureRate")}</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiUsage.failureRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">{apiUsage.failedRequests.toLocaleString()} {t("analytics.failed")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("analytics.avgResponseTime")}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiUsage.averageResponseTime.toFixed(0)}ms</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {getRequestsByDayChartData() && (
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.requestsByDay")}</CardTitle>
              <CardDescription>{t("analytics.requestsByDayDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <GenericChart
                type="line"
                title={t("analytics.requestsByDay")}
                description={t("analytics.requestsByDayDescription")}
                data={getRequestsByDayChartData()!}
                height={300}
              />
            </CardContent>
          </Card>
        )}

        {getRequestsByEndpointChartData() && (
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.requestsByEndpoint")}</CardTitle>
              <CardDescription>{t("analytics.requestsByEndpointDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <GenericChart
                type="bar"
                title={t("analytics.requestsByEndpoint")}
                description={t("analytics.requestsByEndpointDescription")}
                data={getRequestsByEndpointChartData()!}
                height={300}
              />
            </CardContent>
          </Card>
        )}

        {getRequestsByCompanyChartData() && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t("analytics.requestsByCompany")}</CardTitle>
              <CardDescription>{t("analytics.requestsByCompanyDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <GenericChart
                type="bar"
                title={t("analytics.requestsByCompany")}
                description={t("analytics.requestsByCompanyDescription")}
                data={getRequestsByCompanyChartData()!}
                height={300}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

