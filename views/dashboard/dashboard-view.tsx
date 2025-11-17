"use client";

import { useDashboardViewModel } from "@/viewmodels/use-dashboard-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { useSettings } from "@/providers/settings-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BarChart3, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { OverviewTab } from "./overview-tab";
import { CompaniesTab } from "./companies-tab";
import { SubscriptionsTab } from "./subscriptions-tab";
import { AdminsTab } from "./admins-tab";
import { PerformanceTab } from "./performance-tab";
import { RevenueTab } from "./revenue-tab";
import { InsightsTab } from "./insights-tab";
import { AdminPerformanceTab } from "./admin-performance-tab";


export function DashboardView() {
  const vm = useDashboardViewModel();
  const { t, direction } = useI18n();
  const settings = useSettings();

  const isRTL = direction === "rtl";
  const hasAnim = settings.animationLevel !== "none";

  // Loading state
  if (vm.isLoading && !vm.dashboard) {
    return (
      <div className="space-y-6 p-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
          </div>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  // Error state
  if (vm.error || !vm.dashboard) {
    return (
      <div className="space-y-6 p-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
          </div>
        </div>
        <DashboardErrorState
          error={vm.error || undefined}
          errorType={vm.errorType}
          onRetry={vm.retry}
        />
        {!vm.isOnline && (
          <div className="text-center text-sm text-muted-foreground">
            {t("errors.checkConnection") || "Please check your internet connection"}
          </div>
        )}
      </div>
    );
  }

  const { dashboard } = vm;

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
          onClick={vm.reload}
          disabled={vm.isLoading}
          className={cn(hasAnim && "hover:scale-105 transition-transform duration-200")}
        >
          <RefreshCw className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2", vm.isLoading && "animate-spin")} />
          <span>{t("dashboard.refresh")}</span>
        </Button>
      </div>

      {/* TABS NAVIGATION */}
      <Tabs value={vm.activeTab} onValueChange={(v) => vm.setActiveTab(v as any)} className="w-full" dir={isRTL ? "rtl" : "ltr"}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 h-auto gap-2">
          <TabsTrigger value="overview" className="whitespace-nowrap">{t("dashboard.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="companies" className="whitespace-nowrap">{t("dashboard.tabs.companies")}</TabsTrigger>
          <TabsTrigger value="subscriptions" className="whitespace-nowrap">{t("dashboard.tabs.subscriptions")}</TabsTrigger>
          <TabsTrigger value="admins" className="whitespace-nowrap">{t("dashboard.tabs.admins")}</TabsTrigger>
          <TabsTrigger value="adminPerformance" className="whitespace-nowrap">{t("dashboard.tabs.adminPerformance")}</TabsTrigger>
          <TabsTrigger value="performance" className="whitespace-nowrap">{t("dashboard.tabs.performance")}</TabsTrigger>
          <TabsTrigger value="revenue" className="whitespace-nowrap">{t("dashboard.tabs.revenue")}</TabsTrigger>
          <TabsTrigger value="insights" className="whitespace-nowrap">{t("dashboard.tabs.insights")}</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <OverviewTab dashboard={dashboard} t={t} isRTL={isRTL} hasAnim={hasAnim} />
        </TabsContent>

        {/* COMPANIES TAB */}
        <TabsContent value="companies" className="space-y-6">
          <CompaniesTab dashboard={dashboard} t={t} isRTL={isRTL} />
        </TabsContent>

        {/* SUBSCRIPTIONS TAB */}
        <TabsContent value="subscriptions" className="space-y-6">
          <SubscriptionsTab dashboard={dashboard} t={t} isRTL={isRTL} />
        </TabsContent>

        {/* ADMINS TAB */}
        <TabsContent value="admins" className="space-y-6">
          <AdminsTab dashboard={dashboard} t={t} isRTL={isRTL} />
        </TabsContent>

        {/* PERFORMANCE TAB */}
        <TabsContent value="performance" className="space-y-6">
          <PerformanceTab dashboard={dashboard} t={t} isRTL={isRTL} />
        </TabsContent>

        {/* REVENUE TAB */}
        <TabsContent value="revenue" className="space-y-6">
          <RevenueTab dashboard={dashboard} t={t} isRTL={isRTL} />
        </TabsContent>

        {/* ADMIN PERFORMANCE TAB */}
        <TabsContent value="adminPerformance" className="space-y-6">
          <AdminPerformanceTab dashboard={dashboard} t={t} isRTL={isRTL} />
        </TabsContent>

        {/* INSIGHTS TAB */}
        <TabsContent value="insights" className="space-y-6">
          <InsightsTab dashboard={dashboard} t={t} isRTL={isRTL} />

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
