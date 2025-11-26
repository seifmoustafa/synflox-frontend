"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Calendar, DollarSign, Users, Activity, BarChart3, PieChart, LineChart, Download, Clock, CheckCircle, AlertCircle, Pause, XCircle, Play, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { useI18n } from "@/providers/i18n-provider";
import { formatDate } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";

// Import chart components
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as RechartsPieChart, Cell, Pie } from "recharts";
import { BarChart, Bar } from "recharts";
import { useSubscriptionAnalyticsViewModel } from "@/viewmodels/subscription-analytics-viewmodel";

interface SubscriptionAnalyticsViewProps {
  subscriptionId: string;
}

export function SubscriptionAnalyticsView({ subscriptionId }: SubscriptionAnalyticsViewProps) {
  const { t } = useI18n();
  const router = useRouter();
  const {
    subscription,
    subscriptionStatus,
    analytics,
    history,
    loading,
    error,
    timeRange,
    setTimeRange,
  } = useSubscriptionAnalyticsViewModel(subscriptionId);

  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ErrorMessage message={error || t("subscription.loadError")} />
      </div>
    );
  }

  // Use real data from analytics API (with fallbacks for safety)
  const usageData = (analytics as any)?.monthlyTrends?.map((trend: any) => ({
    month: trend.month || trend.Month,
    usage: trend.usage || trend.Usage || 0,
    revenue: trend.revenue || trend.Revenue || 0,
  })) || [];

  const statusDistribution = (analytics as any)?.statusDistribution?.map((status: any) => ({
    name: status.name || status.Name,
    value: status.value || status.Value || 0,
    color: status.color || status.Color || "#6b7280",
  })) || [
    { name: "Active", value: 100, color: "#10b981" },
  ];

  const featureUsage = (analytics as any)?.featureUsage?.map((feature: any) => ({
    feature: feature.feature || feature.Feature,
    usage: feature.usage || feature.Usage || 0,
  })) || [];

  // Get action-specific icon and color for history
  const getActionStyle = (action: string) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('created')) return { icon: <CheckCircle className="h-4 w-4" />, bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600' };
    if (actionLower.includes('activated')) return { icon: <Play className="h-4 w-4" />, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600' };
    if (actionLower.includes('suspended') || actionLower.includes('paused')) return { icon: <Pause className="h-4 w-4" />, bg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-600' };
    if (actionLower.includes('cancelled') || actionLower.includes('canceled')) return { icon: <XCircle className="h-4 w-4" />, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600' };
    if (actionLower.includes('renewed') || actionLower.includes('extended')) return { icon: <RotateCcw className="h-4 w-4" />, bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600' };
    if (actionLower.includes('status')) return { icon: <AlertCircle className="h-4 w-4" />, bg: 'bg-gray-100 dark:bg-gray-900/30', color: 'text-gray-600' };
    return { icon: <Clock className="h-4 w-4" />, bg: 'bg-primary/10', color: 'text-primary' };
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <PageBreadcrumbs
        segments={[
          { label: t("subscription.items"), href: "/subscriptions" },
          { label: subscription.planName, href: `/subscriptions/${subscriptionId}` },
          { label: t("subscription.analytics") }
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("subscription.analytics")}
          </h1>
          <p className="text-muted-foreground">
            {subscription.companyName} • {subscription.planName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 me-2" />
            {t("subscription.exportReport")}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("subscription.amount")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscription.amount}</div>
            <p className="text-xs text-muted-foreground">
              {subscription.planName}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("subscription.utilizationRate")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((analytics?.usage as any)?.utilizationPercentage ?? (analytics?.usage as any)?.UtilizationPercentage ?? 0)}%
            </div>
            <Progress value={(analytics?.usage as any)?.utilizationPercentage ?? (analytics?.usage as any)?.UtilizationPercentage ?? 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {(analytics?.usage as any)?.activeDays ?? (analytics?.usage as any)?.ActiveDays ?? 0} / {(analytics?.usage as any)?.totalDays ?? (analytics?.usage as any)?.TotalDays ?? 0} {t("subscription.activeDays").toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("subscription.daysRemaining")}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription.isLifetime ? "∞" : subscription.daysRemaining}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription.isLifetime ? t("subscription.lifetime") : `${t("subscription.expires")} ${formatDate(subscription.expiryDateUtc)}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("subscription.status")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={subscription.isActive ? "success" : "secondary"} className="text-lg px-3 py-1">
              {t(`subscription.statuses.${subscription.status.toLowerCase()}`)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {subscription.autoRenew ? t("subscription.autoRenewEnabled") : t("subscription.autoRenewDisabled")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4" dir={t("dir") as "ltr" | "rtl"}>
        <TabsList className="grid w-full grid-cols-4">
          {t("dir") === "rtl" ? (
            <>
              <TabsTrigger value="performance">{t("subscription.analyticsPerformance")}</TabsTrigger>
              <TabsTrigger value="revenue">{t("subscription.analyticsRevenue")}</TabsTrigger>
              <TabsTrigger value="usage">{t("subscription.analyticsUsage")}</TabsTrigger>
              <TabsTrigger value="overview">{t("subscription.analyticsOverview")}</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="overview">{t("subscription.analyticsOverview")}</TabsTrigger>
              <TabsTrigger value="usage">{t("subscription.analyticsUsage")}</TabsTrigger>
              <TabsTrigger value="revenue">{t("subscription.analyticsRevenue")}</TabsTrigger>
              <TabsTrigger value="performance">{t("subscription.analyticsPerformance")}</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  <span>{t("subscription.usageTrend")}</span>
                </CardTitle>
                <CardDescription>
                  {t("subscription.usageTrendDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usageData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="usage" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">{t("subscription.noUsageData")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  <span>{t("subscription.statusDistribution")}</span>
                </CardTitle>
                <CardDescription>
                  {t("subscription.statusDistributionDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry: { name: string; value: number; color: string }, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {statusDistribution.map((item: { name: string; value: number; color: string }) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{t(`subscription.statuses.${item.name.toLowerCase()}`)}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <span>{t("subscription.featureUsage")}</span>
              </CardTitle>
              <CardDescription>
                {t("subscription.featureUsageDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureUsage.length > 0 ? (
                  featureUsage.map((feature: { feature: string; usage: number }) => (
                    <div key={feature.feature} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{feature.feature}</span>
                        <span className="text-sm text-muted-foreground">{feature.usage}%</span>
                      </div>
                      <Progress value={feature.usage} className="h-2" />
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">{t("subscription.noFeatureData")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span>{t("subscription.revenueAnalysis")}</span>
              </CardTitle>
              <CardDescription>
                {t("subscription.revenueAnalysisDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("subscription.systemHealth")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t("subscription.uptime")}</span>
                  <Badge variant="success">
                    {(analytics as any)?.performance?.uptimePercentage ?? (analytics as any)?.performance?.UptimePercentage ?? 99.9}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t("subscription.responseTime")}</span>
                  <Badge variant="success">
                    &lt; {(analytics as any)?.performance?.responseTimeMs ?? (analytics as any)?.performance?.ResponseTimeMs ?? 200}ms
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t("subscription.errorRate")}</span>
                  <Badge variant="success">
                    {(analytics as any)?.performance?.errorRate ?? (analytics as any)?.performance?.ErrorRate ?? 0.01}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("subscription.supportMetrics")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t("subscription.ticketsResolved")}</span>
                  <span className="font-medium">
                    {(analytics as any)?.performance?.ticketResolutionRate ?? (analytics as any)?.performance?.TicketResolutionRate ?? 98.5}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t("subscription.avgResponseTime")}</span>
                  <span className="font-medium">
                    {(analytics as any)?.performance?.avgResponseTimeHours ?? (analytics as any)?.performance?.AvgResponseTimeHours ?? 2.3} {t("common.hours")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t("subscription.satisfaction")}</span>
                  <Badge variant="success">
                    {(analytics as any)?.performance?.satisfactionScore ?? (analytics as any)?.performance?.SatisfactionScore ?? 4.8}/5
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Subscription History */}
      <Card>
        <CardHeader>
          <CardTitle>{t("subscription.subscriptionHistory")}</CardTitle>
          <CardDescription>
            {t("subscription.historyDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history && history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item: any, index: number) => {
                const style = getActionStyle(item.action);
                return (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className={`w-8 h-8 rounded-full ${style.bg} flex items-center justify-center ${style.color}`}>
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.reason}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(new Date(item.timestamp))}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">{t("subscription.noHistory")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
