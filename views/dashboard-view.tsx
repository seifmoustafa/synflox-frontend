"use client";

import { useDashboardViewModel } from "@/viewmodels/use-dashboard-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { useSettings } from "@/providers/settings-provider";
import { GenericChart } from "@/components/charts/generic-chart";
import {
  Building2,
  Users,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Loader2,
  AlertCircle,
  Sparkles,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ChartData } from "chart.js";

export function DashboardView() {
  const vm = useDashboardViewModel();
  const { t, direction } = useI18n();
  const settings = useSettings();

  const isRTL = direction === "rtl";
  const hasAnim = settings.animationLevel !== "none";

  // Loading State
  if (vm.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{t("dashboard.loading")}</p>
        </div>
      </div>
    );
  }

  // Error State
  if (vm.error || !vm.dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {vm.error || t("dashboard.error")}
          </AlertDescription>
          <Button
            onClick={vm.reload}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            {t("dashboard.retry")}
          </Button>
        </Alert>
      </div>
    );
  }

  const { dashboard } = vm;
  const { overview, companies, subscriptions, admins, alerts } = dashboard;

  // Health color
  const healthColor =
    dashboard.systemHealth === 'critical' ? 'text-red-500' :
      dashboard.systemHealth === 'warning' ? 'text-yellow-500' :
        'text-green-500';

  const healthIcon =
    dashboard.systemHealth === 'critical' ? XCircle :
      dashboard.systemHealth === 'warning' ? AlertTriangle :
        CheckCircle2;

  const HealthIcon = healthIcon;

  // CHART DATA PREPARATION
  const companyStatusChartData: ChartData<'doughnut'> = {
    labels: [t("dashboard.activeCompanies"), t("dashboard.suspendedCompanies"), t("dashboard.expiredCompanies")],
    datasets: [{
      data: [companies.active, companies.suspended, companies.expired],
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
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      }
    ]
  };

  return (
    <div className="space-y-6 p-6" dir={isRTL ? "rtl" : "ltr"}>

      {/* Header */}
      <div className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
      )}>
        <div className={cn("space-y-2", isRTL && "text-right")}>
          <h1 className={cn(
            "text-3xl font-bold tracking-tight flex items-center gap-3",
          )}>
            <BarChart3 className="w-8 h-8 text-primary" />
            <span>{t("dashboard.title")}</span>
          </h1>
        </div>

        <Button
          onClick={vm.refreshDashboard}
          disabled={vm.isRefreshing}
          className={cn(hasAnim && "hover:scale-105 transition-transform duration-200")}
        >
          <RefreshCw className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2", vm.isRefreshing && "animate-spin")} />
          <span>{t("dashboard.refresh")}</span>
        </Button>
      </div>

      {/* Alerts as Statistics - No Banner! */}

      {/* TABS NAVIGATION */}
      <Tabs value={vm.activeTab} onValueChange={(v) => vm.setActiveTab(v as any)} className="w-full" dir={isRTL ? "rtl" : "ltr"}>
        <TabsList className={cn("grid w-full grid-cols-5", isRTL && "flex-row-reverse")}>
          <TabsTrigger value="overview">{t("dashboard.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="companies">{t("dashboard.tabs.companies")}</TabsTrigger>
          <TabsTrigger value="subscriptions">{t("dashboard.tabs.subscriptions")}</TabsTrigger>
          <TabsTrigger value="admins">{t("dashboard.tabs.admins")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("dashboard.tabs.analytics")}</TabsTrigger>
        </TabsList>
        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards - 4 CARDS INCLUDING ALERTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Companies Card */}
            <div className={cn("group relative", hasAnim && "animate-in fade-in-0 slide-in-from-bottom-4 duration-500")}>
              {hasAnim && (
                <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient bg-[length:200%_200%]" />
              )}
              <div className={cn("relative p-6 rounded-2xl border bg-card shadow-lg group-hover:shadow-xl transition-shadow duration-300")}>
                <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("space-y-2", isRTL && "text-right")}>
                    <p className="text-sm font-medium text-muted-foreground">{t("dashboard.companies")}</p>
                    <h3 className="text-3xl font-bold tracking-tight">{overview.totalCompanies.toLocaleString()}</h3>
                    <div className={cn("flex items-center gap-2 text-sm", isRTL && "flex-row-reverse")}>
                      <span className="text-green-500 font-medium">{overview.activeCompanies} {t("dashboard.active")}</span>
                      <span className="text-muted-foreground">({overview.companyActivityRate.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="w-6 h-6" />
                  </div>
                </div>
                {companies.createdToday > 0 && (
                  <div className={cn("mt-4 pt-4 border-t flex items-center gap-2 text-sm", isRTL && "flex-row-reverse")}>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">+{companies.createdToday} {t("dashboard.today")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Subscriptions Card */}
            <div className={cn("group relative", hasAnim && "animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100")}>
              {hasAnim && (
                <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient bg-[length:200%_200%]" />
              )}
              <div className={cn("relative p-6 rounded-2xl border bg-card shadow-lg group-hover:shadow-xl transition-shadow duration-300")}>
                <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("space-y-2", isRTL && "text-right")}>
                    <p className="text-sm font-medium text-muted-foreground">{t("dashboard.subscriptions")}</p>
                    <h3 className="text-3xl font-bold tracking-tight">{overview.totalSubscriptions.toLocaleString()}</h3>
                    <div className={cn("flex items-center gap-2 text-sm", isRTL && "flex-row-reverse")}>
                      <span className="text-green-500 font-medium">{overview.activeSubscriptions} {t("dashboard.active")}</span>
                      <span className="text-muted-foreground">({overview.subscriptionActivityRate.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform duration-300">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>
                {subscriptions.expiringWithin7Days > 0 && (
                  <div className={cn("mt-4 pt-4 border-t flex items-center gap-2 text-sm", isRTL && "flex-row-reverse")}>
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-500 font-medium">{subscriptions.expiringWithin7Days} {t("dashboard.expiringSoon")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Admins Card */}
            <div className={cn("group relative", hasAnim && "animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200")}>
              {hasAnim && (
                <div className="absolute -inset-[1px] bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient bg-[length:200%_200%]" />
              )}
              <div className={cn("relative p-6 rounded-2xl border bg-card shadow-lg group-hover:shadow-xl transition-shadow duration-300")}>
                <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("space-y-2", isRTL && "text-right")}>
                    <p className="text-sm font-medium text-muted-foreground">{t("dashboard.admins")}</p>
                    <h3 className="text-3xl font-bold tracking-tight">{overview.totalAdmins.toLocaleString()}</h3>
                    <div className={cn("flex items-center gap-2 text-sm", isRTL && "flex-row-reverse")}>
                      <span className="text-green-500 font-medium">{overview.activeAdmins} {t("dashboard.active")}</span>
                      <span className="text-muted-foreground">({overview.adminActivityRate.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* ALERTS CARD - Beautiful Statistics! */}
            <div className={cn("group relative", hasAnim && "animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300")}>
              {hasAnim && (
                <div className="absolute -inset-[1px] bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient bg-[length:200%_200%]" />
              )}
              <div className={cn("relative p-6 rounded-2xl border bg-card shadow-lg group-hover:shadow-xl transition-shadow duration-300")}>
                <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("space-y-2", isRTL && "text-right")}>
                    <p className="text-sm font-medium text-muted-foreground">{t("dashboard.systemAlerts")}</p>
                    <h3 className="text-3xl font-bold tracking-tight">{alerts.totalAlerts.toLocaleString()}</h3>
                    <div className="space-y-1">
                      {alerts.hasCriticalAlerts && (
                        <div className={cn("flex items-center gap-2 text-sm", isRTL && "flex-row-reverse")}>
                          <span className="text-red-500 font-medium">{alerts.subscriptionsExpiringToday + alerts.expiredCompanies} {t("dashboard.critical")}</span>
                        </div>
                      )}
                      {alerts.hasWarnings && (
                        <div className={cn("flex items-center gap-2 text-sm", isRTL && "flex-row-reverse")}>
                          <span className="text-orange-500 font-medium">{alerts.subscriptionsExpiringThisWeek + alerts.suspendedCompanies} {t("dashboard.warnings")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={cn(
                    "p-3 rounded-xl group-hover:scale-110 transition-transform duration-300",
                    alerts.hasCriticalAlerts ? "bg-red-500/10 text-red-500" : alerts.hasWarnings ? "bg-orange-500/10 text-orange-500" : "bg-green-500/10 text-green-500"
                  )}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Status Pie Chart */}
            <GenericChart
              title={t("dashboard.charts.companyStatus")}
              description={t("dashboard.charts.companyStatusDesc")}
              type="doughnut"
              data={companyStatusChartData}
              height={300}
              className={cn(hasAnim && "animate-in fade-in-0 slide-in-from-left-4 duration-500")}
            />

            {/* Subscription Status Pie Chart */}
            <GenericChart
              title={t("dashboard.charts.subscriptionStatus")}
              description={t("dashboard.charts.subscriptionStatusDesc")}
              type="pie"
              data={subscriptionStatusChartData}
              height={300}
              className={cn(hasAnim && "animate-in fade-in-0 slide-in-from-right-4 duration-500")}
            />
          </div>

          {/* Growth Chart */}
          <GenericChart
            title={t("dashboard.charts.growthTrends")}
            description={t("dashboard.charts.growthTrendsDesc")}
            type="line"
            data={growthChartData}
            height={250}
            className={cn(hasAnim && "animate-in fade-in-0 slide-in-from-bottom-4 duration-500")}
          />
        </TabsContent>

        {/* COMPANIES TAB */}
        <TabsContent value="companies" className="space-y-6">

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Status Doughnut */}
            <GenericChart
              title={t("dashboard.charts.companyStatus")}
              description={t("dashboard.charts.companyStatusDesc")}
              type="doughnut"
              data={companyStatusChartData}
              height={300}
            />

            {/* Growth Bar Chart */}
            <GenericChart
              title={t("dashboard.growth")}
              description={t("dashboard.charts.growthTrendsDesc")}
              type="bar"
              data={{
                labels: [t("dashboard.today"), t("dashboard.thisWeek"), t("dashboard.thisMonth")],
                datasets: [{
                  label: t("dashboard.companies"),
                  data: [companies.createdToday, companies.createdThisWeek, companies.createdThisMonth],
                  backgroundColor: 'rgba(59, 130, 246, 0.7)',
                  borderColor: '#3b82f6',
                  borderWidth: 2,
                }]
              }}
              height={300}
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border bg-card shadow-lg">
              <h3 className={cn("text-xl font-bold mb-4", isRTL && "text-right")}>{t("dashboard.companyBreakdown")}</h3>
              <div className="space-y-3">
                <div className={cn("flex items-center justify-between pb-3 border-b", isRTL && "flex-row-reverse")}>
                  <span className="text-muted-foreground">{t("dashboard.total")}</span>
                  <span className="text-2xl font-bold">{companies.total}</span>
                </div>
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <span className="text-sm">{t("dashboard.activeCompanies")}</span>
                  <span className="font-medium text-green-500">{companies.active}</span>
                </div>
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <span className="text-sm">{t("dashboard.suspendedCompanies")}</span>
                  <span className="font-medium text-orange-500">{companies.suspended}</span>
                </div>
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <span className="text-sm">{t("dashboard.expiredCompanies")}</span>
                  <span className="font-medium text-red-500">{companies.expired}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border bg-card shadow-lg">
              <h3 className={cn("text-xl font-bold mb-4", isRTL && "text-right")}>{t("dashboard.growth")}</h3>
              <div className="space-y-4">
                <div>
                  <p className={cn("text-sm text-muted-foreground mb-1", isRTL && "text-right")}>{t("dashboard.today")}</p>
                  <p className="text-3xl font-bold text-primary">+{companies.createdToday}</p>
                </div>
                <div>
                  <p className={cn("text-sm text-muted-foreground mb-1", isRTL && "text-right")}>{t("dashboard.thisWeek")}</p>
                  <p className="text-2xl font-bold">+{companies.createdThisWeek}</p>
                </div>
                <div>
                  <p className={cn("text-sm text-muted-foreground mb-1", isRTL && "text-right")}>{t("dashboard.thisMonth")}</p>
                  <p className="text-2xl font-bold">+{companies.createdThisMonth}</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* SUBSCRIPTIONS TAB */}
        <TabsContent value="subscriptions" className="space-y-6">

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
        </TabsContent>

        {/* ADMINS TAB */}
        <TabsContent value="admins" className="space-y-6">

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Admin Types Doughnut */}
            <GenericChart
              title={t("dashboard.adminTypes")}
              description={t("dashboard.adminTypeDistribution")}
              type="doughnut"
              data={{
                labels: Object.keys(admins.byType),
                datasets: [{
                  data: Object.values(admins.byType),
                  backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
                  borderColor: ['#2563eb', '#059669', '#d97706', '#7c3aed'],
                  borderWidth: 2,
                }]
              }}
              height={300}
            />

            {/* Admin Activity Bar Chart */}
            <GenericChart
              title={t("dashboard.adminActivity")}
              description={t("dashboard.adminGrowth")}
              type="bar"
              data={{
                labels: [t("dashboard.today"), t("dashboard.thisWeek"), t("dashboard.thisMonth")],
                datasets: [{
                  label: t("dashboard.admins"),
                  data: [admins.createdToday, admins.createdThisWeek, admins.createdThisMonth],
                  backgroundColor: 'rgba(16, 185, 129, 0.7)',
                  borderColor: '#10b981',
                  borderWidth: 2,
                }]
              }}
              height={300}
            />
          </div>

          {/* Active vs Inactive Chart */}
          <GenericChart
            title={t("dashboard.adminStatus")}
            description={t("dashboard.activeVsInactive")}
            type="pie"
            data={{
              labels: [t("dashboard.active"), t("dashboard.inactive")],
              datasets: [{
                data: [admins.active, admins.inactive],
                backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(239, 68, 68, 0.7)'],
                borderColor: ['#10b981', '#ef4444'],
                borderWidth: 2,
              }]
            }}
            height={250}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border bg-card shadow-lg">
              <h3 className={cn("text-xl font-bold mb-4", isRTL && "text-right")}>{t("dashboard.adminStats")}</h3>
              <div className="space-y-3">
                <div className={cn("flex items-center justify-between pb-3 border-b", isRTL && "flex-row-reverse")}>
                  <span className="text-muted-foreground">{t("dashboard.total")}</span>
                  <span className="text-2xl font-bold">{admins.total}</span>
                </div>
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <span className="text-sm">{t("dashboard.active")}</span>
                  <span className="font-medium text-green-500">{admins.active}</span>
                </div>
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <span className="text-sm">{t("dashboard.inactive")}</span>
                  <span className="font-medium text-red-500">{admins.inactive}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border bg-card shadow-lg">
              <h3 className={cn("text-xl font-bold mb-4", isRTL && "text-right")}>{t("dashboard.adminTypes")}</h3>
              <div className="space-y-2">
                {Object.entries(admins.byType).map(([type, count]) => (
                  <div key={type} className={cn("flex items-center justify-between py-2 border-b last:border-0", isRTL && "flex-row-reverse")}>
                    <span className="text-sm font-medium">{type}</span>
                    <span className="text-lg font-bold text-primary">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl border bg-card shadow-lg">
              <h3 className={cn("text-xl font-bold mb-4", isRTL && "text-right")}>{t("dashboard.growth")}</h3>
              <div className="space-y-4">
                <div>
                  <p className={cn("text-sm text-muted-foreground mb-1", isRTL && "text-right")}>{t("dashboard.today")}</p>
                  <p className="text-2xl font-bold">+{admins.createdToday}</p>
                </div>
                <div>
                  <p className={cn("text-sm text-muted-foreground mb-1", isRTL && "text-right")}>{t("dashboard.thisWeek")}</p>
                  <p className="text-2xl font-bold">+{admins.createdThisWeek}</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ANALYTICS TAB - MASSIVE COMPREHENSIVE ANALYTICS */}
        <TabsContent value="analytics" className="space-y-6">

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

            {/* Activity Funnel Analysis */}
            <GenericChart
              title={t("dashboard.analytics.activityFunnel")}
              description={t("dashboard.analytics.activityFunnelDesc")}
              type="bar"
              data={{
                labels: [
                  t("dashboard.analytics.totalEntities"),
                  t("dashboard.analytics.activeEntities"),
                  t("dashboard.analytics.recent24h")
                ],
                datasets: [{
                  label: t("dashboard.analytics.entities"),
                  data: [
                    overview.totalCompanies + overview.totalSubscriptions + overview.totalAdmins,
                    overview.activeCompanies + overview.activeSubscriptions + overview.activeAdmins,
                    dashboard.recentActivity.companiesLast24Hours + dashboard.recentActivity.subscriptionsLast24Hours + dashboard.recentActivity.adminsLast24Hours
                  ],
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(251, 146, 60, 0.7)'
                  ],
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
                  data: [companies.active, subscriptions.active],
                  backgroundColor: 'rgba(16, 185, 129, 0.7)',
                  borderColor: '#10b981',
                  borderWidth: 2,
                  stack: 'stack1'
                },
                {
                  label: t("dashboard.analytics.issues"),
                  data: [companies.suspended + companies.expired, subscriptions.suspended + subscriptions.expired],
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

          {/* Real-time Activity Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border bg-card shadow-lg hover:shadow-xl transition-shadow">
              <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-2xl font-bold text-blue-500">+{dashboard.recentActivity.companiesLast24Hours}</span>
              </div>
              <p className={cn("text-sm font-medium", isRTL && "text-right")}>{t("dashboard.analytics.companiesLast24h")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.analytics.newAdditions")}</p>
            </div>

            <div className="p-6 rounded-2xl border bg-card shadow-lg hover:shadow-xl transition-shadow">
              <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
                <span className="text-2xl font-bold text-purple-500">+{dashboard.recentActivity.subscriptionsLast24Hours}</span>
              </div>
              <p className={cn("text-sm font-medium", isRTL && "text-right")}>{t("dashboard.analytics.subscriptionsLast24h")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.analytics.newActivations")}</p>
            </div>

            <div className="p-6 rounded-2xl border bg-card shadow-lg hover:shadow-xl transition-shadow">
              <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
                <div className="p-3 rounded-xl bg-green-500/10">
                  <UserPlus className="w-6 h-6 text-green-500" />
                </div>
                <span className="text-2xl font-bold text-green-500">+{dashboard.recentActivity.adminsLast24Hours}</span>
              </div>
              <p className={cn("text-sm font-medium", isRTL && "text-right")}>{t("dashboard.analytics.adminsLast24h")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.analytics.newTeamMembers")}</p>
            </div>

            <div className="p-6 rounded-2xl border bg-card shadow-lg hover:shadow-xl transition-shadow">
              <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
                <div className="p-3 rounded-xl bg-orange-500/10">
                  <Activity className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-2xl font-bold text-orange-500">{dashboard.overallActivityScore.toFixed(0)}%</span>
              </div>
              <p className={cn("text-sm font-medium", isRTL && "text-right")}>{t("dashboard.analytics.systemScore")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.analytics.overallHealth")}</p>
            </div>
          </div>

          {/* Critical Alerts & Warnings Analysis */}
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
                  <span className="text-xl font-bold text-red-500">{alerts.expiredCompanies}</span>
                </div>
                <div className={cn("flex items-center justify-between p-3 rounded-lg bg-background/50", isRTL && "flex-row-reverse")}>
                  <span className="text-sm">{t("dashboard.analytics.suspendedCompanies")}</span>
                  <span className="text-xl font-bold text-orange-500">{alerts.suspendedCompanies}</span>
                </div>
                <div className={cn("flex items-center justify-between p-3 rounded-lg bg-background/50", isRTL && "flex-row-reverse")}>
                  <span className="text-sm">{t("dashboard.analytics.inactiveAdmins")}</span>
                  <span className="text-xl font-bold text-orange-500">{alerts.inactiveAdmins}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border bg-gradient-to-br from-blue-500/10 to-cyan-500/5 shadow-lg">
              <h3 className={cn("text-lg font-bold mb-4 flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <BarChart3 className="w-5 h-5 text-blue-500" />
                {t("dashboard.analytics.growthMetrics")}
              </h3>
              <div className="space-y-3">
                <div className={cn("flex items-center justify-between p-3 rounded-lg bg-background/50", isRTL && "flex-row-reverse")}>
                  <span className="text-sm">{t("dashboard.analytics.monthlyGrowth")}</span>
                  <span className="text-xl font-bold text-blue-500">+{companies.createdThisMonth + subscriptions.createdThisMonth + admins.createdThisMonth}</span>
                </div>
                <div className={cn("flex items-center justify-between p-3 rounded-lg bg-background/50", isRTL && "flex-row-reverse")}>
                  <span className="text-sm">{t("dashboard.analytics.weeklyGrowth")}</span>
                  <span className="text-xl font-bold text-cyan-500">+{companies.createdThisWeek + subscriptions.createdThisWeek + admins.createdThisWeek}</span>
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

          {/* System Timestamp */}
          <div className="p-4 rounded-xl border bg-card/50 text-center">
            <p className="text-sm text-muted-foreground">
              {t("dashboard.lastUpdated")}: <span className="font-medium">{dashboard.generatedAt.toLocaleString()}</span>
            </p>
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}
