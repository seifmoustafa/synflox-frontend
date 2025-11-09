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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  CheckCircle2,
  XCircle,
  PauseCircle,
  Calendar,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SystemNotificationType } from "@/domain";

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

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format relative time helper
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get notification icon
  const getNotificationIcon = (type: SystemNotificationType) => {
    switch (type) {
      case SystemNotificationType.ExpiryWarning:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case SystemNotificationType.Expired:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case SystemNotificationType.Suspended:
        return <PauseCircle className="h-4 w-4 text-orange-500" />;
      case SystemNotificationType.Activated:
      case SystemNotificationType.Resumed:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case SystemNotificationType.Extended:
        return <Calendar className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  // Prepare expiry timeline data
  const expiryTimelineData = useMemo(() => {
    if (!vm.expiryReport || vm.expiryReport.length === 0) {
      // If no expiry report, use companies expiring soon from statistics
      // For now, return empty array - will be populated when report is available
      return [];
    }

    // Group by date and count
    const grouped = vm.expiryReport.reduce((acc, company) => {
      const date = new Date(company.expiryDate).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Transform to chart format
    return Object.entries(grouped)
      .map(([date, count]) => ({
        date: formatDate(date),
        count: count,
        fullDate: date
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [vm.expiryReport]);

  // Section 2: Enhanced Donut Chart Data
  const statusBreakdown = vm.statistics?.licenseStatusStats;
  const donutChartData = useMemo(() => {
    if (!statusBreakdown) return null;

    const total = statusBreakdown.total;
    const data = [
      { name: t("company.status.active"), value: statusBreakdown.active, fill: "#10B981" },
      { name: t("company.status.expired"), value: statusBreakdown.expired, fill: "#EF4444" },
      { name: t("company.status.suspended"), value: statusBreakdown.suspended, fill: "#F59E0B" },
    ].filter(item => item.value > 0);

    return {
      labels: data.map(d => d.name),
      datasets: [{
        label: t("dashboard.licenseStatus.title"),
        data: data.map(d => d.value),
        backgroundColor: data.map(d => d.fill),
        borderColor: "#ffffff",
        borderWidth: 3,
        cutout: "60%", // Makes it a donut chart
      }],
      total: total,
    };
  }, [statusBreakdown, t]);

  // Section 3: Expiry Timeline Bar Chart Data
  const expiryBarChartData = useMemo(() => {
    if (expiryTimelineData.length === 0) return null;

    // Calculate colors based on days until expiry for each date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const chartData = expiryTimelineData.map(d => {
      const expiryDate = new Date(d.fullDate);
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Color coding: Critical (≤7 days) = Red, Warning (8-15 days) = Orange, Active (>15 days) = Amber
      let backgroundColor = "#F59E0B"; // Amber for >15 days
      let borderColor = "#D97706";
      
      if (daysUntilExpiry <= 7) {
        backgroundColor = "#EF4444"; // Red for critical
        borderColor = "#DC2626";
      } else if (daysUntilExpiry <= 15) {
        backgroundColor = "#F97316"; // Orange for warning
        borderColor = "#EA580C";
      }

      return {
        date: d.date,
        count: d.count,
        fullDate: d.fullDate,
        daysUntilExpiry,
        backgroundColor,
        borderColor,
      };
    });

    return {
      labels: chartData.map(d => d.date),
      datasets: [{
        label: t("dashboard.expiryTimeline.companies"),
        data: chartData.map(d => d.count),
        backgroundColor: chartData.map(d => d.backgroundColor),
        borderColor: chartData.map(d => d.borderColor),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }],
    };
  }, [expiryTimelineData, t]);

  // Section 4: API Usage Bar Chart Data
  const apiUsageBarChartData = useMemo(() => {
    if (!vm.apiUsage?.requestsByDay || Object.keys(vm.apiUsage.requestsByDay).length === 0) return null;

    const sortedEntries = Object.entries(vm.apiUsage.requestsByDay)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-7); // Last 7 days

    return {
      labels: sortedEntries.map(([date]) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: t("dashboard.apiUsage.requests"),
        data: sortedEntries.map(([, count]) => count),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "#3B82F6",
        borderWidth: 2,
        borderRadius: 8,
      }],
    };
  }, [vm.apiUsage, t]);

  // Section 1: Statistics Cards (4 main cards as per guide)
  const mainStatisticsCards = useMemo(() => [
    {
      title: t("dashboard.statistics.totalCompanies"),
      value: vm.statistics?.totalCompanies || 0,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      borderColor: "border-blue-500",
    },
    {
      title: t("dashboard.statistics.activeCompanies"),
      value: vm.statistics?.licenseStatusStats.active || 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      borderColor: "border-green-500",
    },
    {
      title: t("dashboard.statistics.expiredCompanies"),
      value: vm.statistics?.licenseStatusStats.expired || 0,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      borderColor: "border-red-500",
    },
    {
      title: t("dashboard.statistics.suspendedCompanies"),
      value: vm.statistics?.licenseStatusStats.suspended || 0,
      icon: PauseCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      borderColor: "border-orange-500",
    },
  ], [vm.statistics, t]);

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
          {/* Section 1: Statistics Cards (4 main cards) */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {mainStatisticsCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card 
                  key={index} 
                  className={cn(
                    "transition-all hover:shadow-lg cursor-pointer",
                    `border-l-4 ${card.borderColor}`
                  )}
                  onClick={() => {
                    // Navigate to filtered companies list
                    window.location.href = `/companies?status=${card.title.toLowerCase().replace(' companies', '')}`;
                  }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <div className={cn("p-2 rounded-lg", card.bgColor)}>
                      <Icon className={cn("h-4 w-4", card.color)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{card.value.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.title.includes("Total") 
                        ? `${t("dashboard.statistics.allCompanies")}`
                        : `${t("dashboard.statistics.subscriptionStatus")}`
                      }
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Section 2: Enhanced Donut Chart for Subscription Status */}
          {donutChartData && (
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.licenseStatus.title")}</CardTitle>
                <CardDescription>
                  {t("dashboard.licenseStatus.description")} - {t("dashboard.licenseStatus.total")}: {donutChartData.total}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <GenericChart
                    title=""
                    description=""
                    data={donutChartData}
                    type="doughnut"
                    height={300}
                    filterable={false}
                    options={{
                      plugins: {
                        legend: {
                          position: "bottom" as const,
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const label = context.label || '';
                              const value = context.parsed || 0;
                              const total = donutChartData.total;
                              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                              return `${label}: ${value} (${percentage}%)`;
                            },
                          },
                        },
                      },
                    }}
                  />
                  <div className="space-y-4 flex flex-col justify-center">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium">{t("dashboard.licenseStatus.active")}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{statusBreakdown?.active || 0}</div>
                          <div className="text-xs text-muted-foreground">
                            {statusBreakdown ? `${statusBreakdown.activePercentage}%` : "0%"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-red-500"></div>
                          <span className="text-sm font-medium">{t("dashboard.licenseStatus.expired")}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{statusBreakdown?.expired || 0}</div>
                          <div className="text-xs text-muted-foreground">
                            {statusBreakdown ? `${statusBreakdown.expiredPercentage}%` : "0%"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                          <span className="text-sm font-medium">{t("dashboard.licenseStatus.suspended")}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{statusBreakdown?.suspended || 0}</div>
                          <div className="text-xs text-muted-foreground">
                            {statusBreakdown ? `${statusBreakdown.suspendedPercentage}%` : "0%"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{t("dashboard.licenseStatus.total")}</span>
                        <div className="font-bold text-xl">{donutChartData.total}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 3: Expiry Timeline Area Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.expiryTimeline.title")}</CardTitle>
              <CardDescription>{t("dashboard.expiryTimeline.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {vm.expiryReport && vm.expiryReport.length > 0 ? (
                <div className="space-y-6">
                  {/* Color Legend */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500"></div>
                      <span className="text-muted-foreground">
                        {t("dashboard.expiryTimeline.critical")} (≤7 {t("dashboard.expiryTimeline.days") || "days"})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-orange-500"></div>
                      <span className="text-muted-foreground">
                        {t("dashboard.expiryTimeline.warning")} (8-15 {t("dashboard.expiryTimeline.days") || "days"})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-amber-500"></div>
                      <span className="text-muted-foreground">
                        {t("company.status.active")} (&gt;15 {t("dashboard.expiryTimeline.days") || "days"})
                      </span>
                    </div>
                  </div>
                  {expiryBarChartData && (
                    <GenericChart
                      title=""
                      description=""
                      data={expiryBarChartData}
                      type="bar"
                      height={300}
                      filterable={false}
                      options={{
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const value = context.parsed.y ?? 0;
                                const label = context.label || '';
                                // Find the days until expiry for this date
                                const chartData = expiryTimelineData.find(d => d.date === label);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                if (chartData) {
                                  const expiryDate = new Date(chartData.fullDate);
                                  const daysUntilExpiry = Math.ceil(
                                    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                                  );
                                  return `${value} ${t("dashboard.expiryTimeline.companies")} (${daysUntilExpiry} ${daysUntilExpiry === 1 ? "day" : "days"})`;
                                }
                                return `${value} ${t("dashboard.expiryTimeline.companies")}`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1,
                            },
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
                            ticks: {
                              maxRotation: 45,
                              minRotation: 45,
                            },
                          },
                        },
                        elements: {
                          bar: {
                            borderRadius: 6,
                          },
                        },
                      }}
                    />
                  )}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("company.name")}</TableHead>
                          <TableHead>{t("dashboard.expiryTimeline.date")}</TableHead>
                          <TableHead>{t("dashboard.expiryTimeline.daysUntilExpiry")}</TableHead>
                          <TableHead>{t("company.status.title")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vm.expiryReport.map((company) => {
                          const expiryDate = new Date(company.expiryDate);
                          const statusColor = company.status === "critical" 
                            ? "text-red-600" 
                            : company.status === "warning" 
                            ? "text-orange-600" 
                            : "text-green-600";
                          
                          return (
                            <TableRow 
                              key={company.companyId}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => window.location.href = `/companies/${company.companyId}`}
                            >
                              <TableCell className="font-medium">{company.companyName}</TableCell>
                              <TableCell>
                                {expiryDate.toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </TableCell>
                              <TableCell>
                                <span className={statusColor}>
                                  {company.daysUntilExpiry} {company.daysUntilExpiry === 1 ? t("dashboard.expiryTimeline.day") || "day" : t("dashboard.expiryTimeline.days") || "days"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={company.status === "critical" ? "destructive" : company.status === "warning" ? "secondary" : "default"}
                                >
                                  {company.status === "critical" 
                                    ? t("dashboard.expiryTimeline.critical")
                                    : company.status === "warning"
                                    ? t("dashboard.expiryTimeline.warning")
                                    : t("company.status.active")}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t("dashboard.expiryTimeline.noData")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 4: API Usage Bar Chart */}
          {apiUsageBarChartData && (
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.apiUsage.title")}</CardTitle>
                <CardDescription>
                  {t("dashboard.apiUsage.description")} - {t("dashboard.apiUsage.average")}: {vm.apiUsage ? Math.round(vm.apiUsage.totalRequests / 7).toLocaleString() : 0} {t("dashboard.apiUsage.requestsPerDay")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">{t("dashboard.apiUsage.totalRequests")}</div>
                      <div className="text-2xl font-bold">{vm.apiUsage?.totalRequests.toLocaleString() || 0}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">{t("dashboard.apiUsage.successfulRequests")}</div>
                      <div className="text-2xl font-bold text-green-600">{vm.apiUsage?.successfulRequests.toLocaleString() || 0}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">{t("dashboard.apiUsage.failedRequests")}</div>
                      <div className="text-2xl font-bold text-red-600">{vm.apiUsage?.failedRequests.toLocaleString() || 0}</div>
                    </div>
                  </div>
                  <GenericChart
                    title=""
                    description=""
                    data={apiUsageBarChartData}
                    type="bar"
                    height={300}
                    filterable={false}
                    options={{
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const value = context.parsed.y ?? 0;
                              return `${value.toLocaleString()} ${t("dashboard.apiUsage.requests")}`;
                            },
                          },
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
                            callback: (value) => {
                              if (typeof value === 'number') {
                                return `${(value / 1000).toFixed(0)}K`;
                              }
                              return value;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 5: Recent Activity / Notifications Table */}
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
                  {t("dashboard.recentActivity.viewAll")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {vm.recentNotifications && vm.recentNotifications.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">{t("dashboard.recentActivity.time")}</TableHead>
                        <TableHead className="w-[100px]">{t("dashboard.recentActivity.type")}</TableHead>
                        <TableHead>{t("dashboard.recentActivity.message")}</TableHead>
                        <TableHead className="w-[100px]">{t("dashboard.recentActivity.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vm.recentNotifications.slice(0, 10).map((notification) => (
                        <TableRow 
                          key={notification.id}
                          className={cn(
                            "cursor-pointer hover:bg-muted/50",
                            !notification.isRead && "bg-blue-50 dark:bg-blue-900/10"
                          )}
                          onClick={() => window.location.href = `/notifications`}
                        >
                          <TableCell className="text-sm">
                            {formatRelativeTime(notification.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getNotificationIcon(notification.type)}
                              <span className="text-xs text-muted-foreground">
                                {SystemNotificationType[notification.type] || "General"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{notification.title}</div>
                            <div className="text-sm text-muted-foreground">{notification.message}</div>
                          </TableCell>
                          <TableCell>
                            {notification.isRead ? (
                              <Badge variant="secondary">{t("dashboard.recentActivity.read")}</Badge>
                            ) : (
                              <Badge variant="default" className="bg-blue-500">{t("dashboard.recentActivity.unread")}</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t("dashboard.recentActivity.noNotifications")}
                </div>
              )}
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
