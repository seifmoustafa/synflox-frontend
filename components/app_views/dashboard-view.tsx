"use client";

import React, { useState, useMemo } from "react";
import { useDashboardViewModel } from "@/viewmodels/dashboard-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { GenericChart } from "@/components/charts/generic-chart";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  UserCog, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  Lock,
  Unlock,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BarChart3,
  FileText,
  Key,
  Webhook,
  Settings,
  Search,
  Menu,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const vm = useDashboardViewModel();
  const { t } = useI18n();
  const [copiedRoute, setCopiedRoute] = useState<string | null>(null);
  const [expandedControllers, setExpandedControllers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<string | null>(null);

  const handleCopyRoute = async (route: string) => {
    try {
      await navigator.clipboard.writeText(route);
      setCopiedRoute(route);
      setTimeout(() => setCopiedRoute(null), 2000);
    } catch (error) {
      console.error("Failed to copy route:", error);
    }
  };

  const toggleController = (controller: string) => {
    const newExpanded = new Set(expandedControllers);
    if (newExpanded.has(controller)) {
      newExpanded.delete(controller);
    } else {
      newExpanded.add(controller);
    }
    setExpandedControllers(newExpanded);
  };

  const toggleAllControllers = () => {
    if (vm.endpoints) {
      if (expandedControllers.size === vm.endpoints.controllerNames.length) {
        setExpandedControllers(new Set());
      } else {
        setExpandedControllers(new Set(vm.endpoints.controllerNames));
      }
    }
  };

  const filteredEndpoints = useMemo(() => {
    if (!vm.endpoints) return null;

    let filteredControllers: Record<string, typeof vm.endpoints.endpointsByController[string]> = { ...vm.endpoints.endpointsByController };

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filteredByController: Record<string, typeof vm.endpoints.endpointsByController[string]> = {};
      
      Object.entries(filteredControllers).forEach(([controller, endpoints]) => {
        const matchingEndpoints = endpoints.filter(
          (endpoint) =>
            endpoint.route.toLowerCase().includes(query) ||
            endpoint.method.toLowerCase().includes(query) ||
            endpoint.controller.toLowerCase().includes(query) ||
            endpoint.action.toLowerCase().includes(query)
        );
        if (matchingEndpoints.length > 0) {
          filteredByController[controller] = matchingEndpoints;
        }
      });
      
      filteredControllers = filteredByController;
    }

    // Filter by method
    if (methodFilter) {
      const filteredByController: Record<string, typeof vm.endpoints.endpointsByController[string]> = {};
      
      Object.entries(filteredControllers).forEach(([controller, endpoints]) => {
        const matchingEndpoints = endpoints.filter(
          (endpoint) => endpoint.method === methodFilter
        );
        if (matchingEndpoints.length > 0) {
          filteredByController[controller] = matchingEndpoints;
        }
      });
      
      filteredControllers = filteredByController;
    }

    // Calculate total filtered endpoints
    const totalFiltered = Object.values(filteredControllers).reduce((sum, endpoints) => sum + endpoints.length, 0);

    return {
      endpointsByController: filteredControllers,
      controllerNames: Object.keys(filteredControllers),
      totalEndpoints: totalFiltered,
    };
  }, [vm.endpoints, searchQuery, methodFilter]);

  if (vm.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t("dashboard.loading")}</p>
        </div>
      </div>
    );
  }

  if (vm.error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">{t("dashboard.error.title")}</CardTitle>
            <CardDescription>{vm.error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={vm.refresh}>{t("dashboard.error.retry")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data for license status
  const licenseChartData = vm.statistics?.licenseStatusStats.chartData || [];
  const chartData = {
    labels: licenseChartData.map((d) => d.name),
    datasets: [
      {
        label: t("dashboard.licenseStatus.title"),
        data: licenseChartData.map((d) => d.value),
        backgroundColor: licenseChartData.map((d) => d.fill),
        borderColor: licenseChartData.map((d) => d.fill),
        borderWidth: 2,
      },
    ],
  };

  // Section 1: Overview Cards (4 main cards as per design guide)
  const statisticsCards = [
    {
      title: t("dashboard.statistics.totalCompanies"),
      value: vm.statistics?.totalCompanies || 0,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: t("dashboard.statistics.activeCompanies"),
      value: vm.statistics?.licenseStatusStats?.active || 0,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: t("dashboard.statistics.expiredCompanies"),
      value: vm.statistics?.licenseStatusStats?.expired || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    {
      title: t("dashboard.statistics.suspendedCompanies"),
      value: vm.statistics?.licenseStatusStats?.suspended || 0,
      icon: Lock,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ];

  const methodColors: Record<string, string> = {
    GET: "#3b82f6",
    POST: "#10b981",
    PUT: "#f59e0b",
    DELETE: "#ef4444",
    PATCH: "#8b5cf6",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("dashboard.description")}</p>
      </div>

      <Tabs value={vm.activeTab} onValueChange={(v) => vm.setActiveTab(v as "statistics" | "endpoints")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="statistics">{t("dashboard.tabs.statistics")}</TabsTrigger>
          <TabsTrigger value="endpoints">{t("dashboard.tabs.endpoints")}</TabsTrigger>
        </TabsList>

        <TabsContent value="statistics" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statisticsCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index} className={cn(card.warning && "border-orange-500")}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <div className={cn("p-2 rounded-lg", card.bgColor)}>
                      <Icon className={cn("h-4 w-4", card.color)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    {card.warning && (
                      <p className="text-xs text-orange-600 mt-1">
                        {t("dashboard.statistics.expiringWarning")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Section 2: Subscription Status Chart (Doughnut) */}
          {vm.statistics && (
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.licenseStatus.title")}</CardTitle>
                <CardDescription>{t("dashboard.licenseStatus.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <GenericChart
                    title=""
                    description=""
                    data={{
                      labels: chartData.labels,
                      datasets: [{
                        ...chartData.datasets[0],
                        cutout: "60%", // Make it a doughnut chart
                      }],
                    }}
                    type="doughnut"
                    height={300}
                    filterable={false}
                    options={{
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                        tooltip: {
                          callbacks: {
                            label: (context: any) => {
                              const label = context.label || "";
                              const value = context.parsed || 0;
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                              return `${label}: ${value} (${percentage}%)`;
                            },
                          },
                        },
                      },
                    }}
                  />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium">{t("dashboard.licenseStatus.active")}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{vm.statistics.licenseStatusStats.active}</div>
                          <div className="text-xs text-muted-foreground">
                            {vm.statistics.licenseStatusStats.activePercentage}%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-red-500"></div>
                          <span className="text-sm font-medium">{t("dashboard.licenseStatus.expired")}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{vm.statistics.licenseStatusStats.expired}</div>
                          <div className="text-xs text-muted-foreground">
                            {vm.statistics.licenseStatusStats.expiredPercentage}%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                          <span className="text-sm font-medium">{t("dashboard.licenseStatus.suspended")}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{vm.statistics.licenseStatusStats.suspended}</div>
                          <div className="text-xs text-muted-foreground">
                            {vm.statistics.licenseStatusStats.suspendedPercentage}%
                          </div>
                        </div>
                      </div>
                      {vm.trialCompaniesCount > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                            <span className="text-sm font-medium">{t("dashboard.statistics.trialCompanies")}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{vm.trialCompaniesCount}</div>
                          </div>
                        </div>
                      )}
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{t("dashboard.licenseStatus.total")}</span>
                          <div className="font-bold">{vm.statistics.licenseStatusStats.total}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 3: Expiry Timeline Chart (Area Chart) */}
          {vm.expiryReportData && vm.expiryReportData.length > 0 && (() => {
            // Group companies by expiry date and count
            const grouped = vm.expiryReportData.reduce((acc: Record<string, number>, company: any) => {
              if (company.expiryDate) {
                const date = new Date(company.expiryDate).toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
              }
              return acc;
            }, {});

            // Transform to chart format
            const expiryChartData = Object.entries(grouped)
              .map(([date, count]) => ({
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                count: count as number,
                fullDate: date,
              }))
              .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

            const maxCount = Math.max(...expiryChartData.map(d => d.count), 0);
            const peakDate = expiryChartData.find(d => d.count === maxCount);

            return (
              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.expiryTimeline.title")}</CardTitle>
                  <CardDescription>
                    {peakDate && `${t("dashboard.expiryTimeline.peak")}: ${maxCount} ${t("dashboard.expiryTimeline.companies")} ${t("dashboard.expiryTimeline.on")} ${peakDate.date}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GenericChart
                    title=""
                    description=""
                    data={{
                      labels: expiryChartData.map(d => d.date),
                      datasets: [{
                        label: t("dashboard.expiryTimeline.expiringCompanies"),
                        data: expiryChartData.map(d => d.count),
                        borderColor: "#ef4444",
                        backgroundColor: "rgba(239, 68, 68, 0.2)",
                        fill: true,
                        tension: 0.4,
                      }],
                    }}
                    type="line"
                    height={300}
                    filterable={false}
                    options={{
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: t("dashboard.expiryTimeline.companies"),
                          },
                        },
                        x: {
                          title: {
                            display: true,
                            text: t("dashboard.expiryTimeline.date"),
                          },
                        },
                      },
                    }}
                  />
                </CardContent>
              </Card>
            );
          })()}

          {/* Section 4: API Usage Trends (Bar Chart) */}
          {vm.apiUsage && (
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.apiUsage.title")}</CardTitle>
                <CardDescription>
                  {vm.apiUsage.requestsByDay && Object.keys(vm.apiUsage.requestsByDay).length > 0
                    ? `${t("dashboard.apiUsage.average")}: ${Math.round(
                        Object.values(vm.apiUsage.requestsByDay).reduce((a: number, b: number) => a + b, 0) /
                        Object.keys(vm.apiUsage.requestsByDay).length
                      ).toLocaleString()} ${t("dashboard.apiUsage.requestsPerDay")}`
                    : t("dashboard.apiUsage.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">{t("dashboard.apiUsage.totalRequests")}</div>
                      <div className="text-2xl font-bold">{vm.apiUsage.totalRequests.toLocaleString()}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">{t("dashboard.apiUsage.successfulRequests")}</div>
                      <div className="text-2xl font-bold text-green-600">{vm.apiUsage.successfulRequests.toLocaleString()}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">{t("dashboard.apiUsage.failedRequests")}</div>
                      <div className="text-2xl font-bold text-red-600">{vm.apiUsage.failedRequests.toLocaleString()}</div>
                    </div>
                  </div>
                  {vm.apiUsage.requestsByDay && Object.keys(vm.apiUsage.requestsByDay).length > 0 && (
                    <GenericChart
                      title={t("dashboard.apiUsage.dailyChart")}
                      description=""
                      data={{
                        labels: Object.keys(vm.apiUsage.requestsByDay).map(date => {
                          const d = new Date(date);
                          return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
                        }),
                        datasets: [{
                          label: t("dashboard.apiUsage.requests"),
                          data: Object.values(vm.apiUsage.requestsByDay),
                          backgroundColor: "rgba(59, 130, 246, 0.8)",
                          borderColor: "#3b82f6",
                          borderWidth: 2,
                          borderRadius: 4,
                        }],
                      }}
                      type="bar"
                      height={300}
                      filterable={false}
                      options={{
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: t("dashboard.apiUsage.requests"),
                            },
                            ticks: {
                              callback: function(value: any) {
                                return (value / 1000).toFixed(0) + 'K';
                              },
                            },
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 5: Recent Activity / Notifications Table */}
          {vm.recentNotifications && vm.recentNotifications.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("dashboard.recentActivity.title")}</CardTitle>
                    <CardDescription>{t("dashboard.recentActivity.description")}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = "/notifications"}
                  >
                    {t("dashboard.recentActivity.viewAll")} →
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 text-sm font-medium">{t("dashboard.recentActivity.time")}</th>
                        <th className="text-left p-2 text-sm font-medium">{t("dashboard.recentActivity.type")}</th>
                        <th className="text-left p-2 text-sm font-medium">{t("dashboard.recentActivity.company")}</th>
                        <th className="text-left p-2 text-sm font-medium">{t("dashboard.recentActivity.message")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vm.recentNotifications.slice(0, 10).map((notification) => {
                        const getNotificationIcon = (type: number) => {
                          switch (type) {
                            case 1: return "⚠️"; // ExpiryWarning
                            case 2: return "🔴"; // Expired
                            case 3: return "⏸️"; // Suspended
                            case 4: return "✅"; // Activated
                            case 5: return "▶️"; // Resumed
                            case 6: return "📅"; // Extended
                            default: return "ℹ️"; // General
                          }
                        };
                        const getNotificationTypeName = (type: number) => {
                          switch (type) {
                            case 1: return t("dashboard.recentActivity.expiryWarning");
                            case 2: return t("dashboard.recentActivity.expired");
                            case 3: return t("dashboard.recentActivity.suspended");
                            case 4: return t("dashboard.recentActivity.activated");
                            case 5: return t("dashboard.recentActivity.resumed");
                            case 6: return t("dashboard.recentActivity.extended");
                            default: return t("dashboard.recentActivity.general");
                          }
                        };
                        const formatRelativeTime = (dateString: string) => {
                          const date = new Date(dateString);
                          const now = new Date();
                          const diffMs = now.getTime() - date.getTime();
                          const diffMins = Math.floor(diffMs / 60000);
                          const diffHours = Math.floor(diffMs / 3600000);
                          const diffDays = Math.floor(diffMs / 86400000);
                          
                          if (diffMins < 60) return `${diffMins} ${t("dashboard.recentActivity.minutesAgo")}`;
                          if (diffHours < 24) return `${diffHours} ${t("dashboard.recentActivity.hoursAgo")}`;
                          if (diffDays === 1) return t("dashboard.recentActivity.yesterday");
                          if (diffDays < 7) return `${diffDays} ${t("dashboard.recentActivity.daysAgo")}`;
                          return date.toLocaleDateString();
                        };
                        return (
                          <tr
                            key={notification.id}
                            className={cn(
                              "border-b hover:bg-muted/50",
                              !notification.isRead && "bg-blue-50 dark:bg-blue-950/20"
                            )}
                          >
                            <td className="p-2 text-sm">{formatRelativeTime(notification.createdAt)}</td>
                            <td className="p-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span>{getNotificationIcon(notification.type)}</span>
                                <span>{getNotificationTypeName(notification.type)}</span>
                              </div>
                            </td>
                            <td className="p-2 text-sm">{notification.companyId}</td>
                            <td className="p-2 text-sm">{notification.message}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Rate & Metrics Summary */}
          {vm.metricsSummary && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className={cn(vm.metricsSummary.errorRate > 5 && "border-red-500")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className={cn("h-5 w-5", vm.metricsSummary.errorRate > 5 ? "text-red-600" : "text-green-600")} />
                    {t("dashboard.metrics.errorRate")}
                  </CardTitle>
                  <CardDescription>{t("dashboard.metrics.errorRateDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">
                    <span className={cn(vm.metricsSummary.errorRate > 5 ? "text-red-600" : "text-green-600")}>
                      {vm.metricsSummary.errorRate.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("dashboard.metrics.totalRequests")}: {vm.metricsSummary.totalRequests.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("dashboard.metrics.failedRequests")}: {vm.metricsSummary.failedRequests.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.metrics.moduleUsage")}</CardTitle>
                  <CardDescription>{t("dashboard.metrics.moduleUsageDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t("dashboard.metrics.activeApiKeys")}</span>
                      <div className="text-right">
                        <div className="font-bold">{vm.metricsSummary.activeApiKeys}</div>
                        <div className="text-xs text-muted-foreground">
                          {vm.metricsSummary.totalApiKeys > 0 
                            ? `${Math.round((vm.metricsSummary.activeApiKeys / vm.metricsSummary.totalApiKeys) * 100)}%`
                            : "0%"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t("dashboard.metrics.activeWebhooks")}</span>
                      <div className="text-right">
                        <div className="font-bold">{vm.metricsSummary.activeWebhooks}</div>
                        <div className="text-xs text-muted-foreground">
                          {vm.metricsSummary.totalWebhooks > 0 
                            ? `${Math.round((vm.metricsSummary.activeWebhooks / vm.metricsSummary.totalWebhooks) * 100)}%`
                            : "0%"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t("dashboard.metrics.averageResponseTime")}</span>
                      <div className="font-bold">{vm.metricsSummary.averageResponseTime.toFixed(0)}ms</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.quickActions.title")}</CardTitle>
              <CardDescription>{t("dashboard.quickActions.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => window.location.href = "/analytics"}
                >
                  <BarChart3 className="h-5 w-5 mb-2" />
                  <span className="font-medium">{t("dashboard.quickActions.analytics")}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => window.location.href = "/reports"}
                >
                  <FileText className="h-5 w-5 mb-2" />
                  <span className="font-medium">{t("dashboard.quickActions.reports")}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => window.location.href = "/api-keys"}
                >
                  <Key className="h-5 w-5 mb-2" />
                  <span className="font-medium">{t("dashboard.quickActions.apiKeys")}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => window.location.href = "/webhooks"}
                >
                  <Webhook className="h-5 w-5 mb-2" />
                  <span className="font-medium">{t("dashboard.quickActions.webhooks")}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => window.location.href = "/metrics"}
                >
                  <Activity className="h-5 w-5 mb-2" />
                  <span className="font-medium">{t("dashboard.quickActions.metrics")}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => window.location.href = "/settings"}
                >
                  <Settings className="h-5 w-5 mb-2" />
                  <span className="font-medium">{t("dashboard.quickActions.settings")}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => {
                    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
                    if (searchInput) searchInput.focus();
                  }}
                >
                  <Search className="h-5 w-5 mb-2" />
                  <span className="font-medium">{t("dashboard.quickActions.search")}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => window.location.href = "/menu-items"}
                >
                  <Menu className="h-5 w-5 mb-2" />
                  <span className="font-medium">{t("dashboard.quickActions.menuItems")}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          {vm.endpoints && filteredEndpoints && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{t("dashboard.endpoints.title")}</CardTitle>
                      <CardDescription>
                        {t("dashboard.endpoints.description", { count: filteredEndpoints.totalEndpoints })}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleAllControllers}
                    >
                      {expandedControllers.size === (filteredEndpoints.controllerNames?.length || 0)
                        ? t("dashboard.endpoints.collapseAll")
                        : t("dashboard.endpoints.expandAll")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-4">
                    <div className="flex gap-2 flex-wrap">
                      <input
                        type="text"
                        placeholder={t("dashboard.endpoints.searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 min-w-[200px] px-3 py-2 border rounded-md"
                      />
                      <select
                        value={methodFilter || ""}
                        onChange={(e) => setMethodFilter(e.target.value || null)}
                        className="px-3 py-2 border rounded-md"
                      >
                        <option value="">{t("dashboard.endpoints.allMethods")}</option>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                      </select>
                    </div>
                  </div>

                  <Accordion type="multiple" value={Array.from(expandedControllers)} onValueChange={(values) => setExpandedControllers(new Set(values))}>
                    {Object.entries(filteredEndpoints.endpointsByController).map(([controller, endpoints]) => (
                        <AccordionItem key={controller} value={controller}>
                          <AccordionTrigger>
                            <div className="flex items-center justify-between w-full pr-4">
                              <span className="font-semibold">{controller}</span>
                              <Badge variant="secondary" className="ml-2">
                                {endpoints.length} {t("dashboard.endpoints.endpoints")}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pt-2">
                              {endpoints.map((endpoint, index) => (
                                <Card key={index} className="border-l-4" style={{ borderLeftColor: endpoint.methodColor }}>
                                  <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Badge
                                            style={{
                                              backgroundColor: endpoint.methodColor,
                                              color: "white",
                                            }}
                                          >
                                            {endpoint.method}
                                          </Badge>
                                          {endpoint.isProtected ? (
                                            <Lock className="h-4 w-4 text-red-500" />
                                          ) : (
                                            <Unlock className="h-4 w-4 text-green-500" />
                                          )}
                                          <Badge variant={endpoint.isProtected ? "destructive" : "success"}>
                                            {endpoint.authorizationStatus}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                            {endpoint.route}
                                          </code>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() => handleCopyRoute(endpoint.route)}
                                          >
                                            {copiedRoute === endpoint.route ? (
                                              <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                              <Copy className="h-3 w-3" />
                                            )}
                                          </Button>
                                        </div>
                                        {endpoint.summary && (
                                          <p className="text-sm text-muted-foreground mt-2">{endpoint.summary}</p>
                                        )}
                                        {endpoint.authorizationPolicy && (
                                          <Badge variant="outline" className="mt-2">
                                            {t("dashboard.endpoints.policy")}: {endpoint.authorizationPolicy}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </CardHeader>
                                  {endpoint.parameters.length > 0 && (
                                    <CardContent>
                                      <div className="space-y-2">
                                        <p className="text-sm font-medium">{t("dashboard.endpoints.parameters")}:</p>
                                        <div className="space-y-1">
                                          {endpoint.parameters.map((param, paramIndex) => (
                                            <div
                                              key={paramIndex}
                                              className="text-xs bg-muted p-2 rounded flex items-center justify-between"
                                            >
                                              <div>
                                                <span className="font-medium">{param.name}</span>
                                                <span className="text-muted-foreground ml-2">({param.type})</span>
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                  {param.source}
                                                </Badge>
                                              </div>
                                              {param.isOptional && (
                                                <Badge variant="secondary" className="text-xs">
                                                  {t("dashboard.endpoints.optional")}
                                                </Badge>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </CardContent>
                                  )}
                                </Card>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

