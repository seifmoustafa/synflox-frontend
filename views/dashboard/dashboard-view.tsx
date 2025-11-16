"use client";

import { useDashboardViewModel } from "@/viewmodels/use-dashboard-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { useSettings } from "@/providers/settings-provider";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BarChart3, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "./overview-tab";
import { CompaniesTab } from "./companies-tab";
import { SubscriptionsTab } from "./subscriptions-tab";
import { AdminsTab } from "./admins-tab";
import { AnalyticsTab } from "./analytics-tab";


export function DashboardView() {
  const vm = useDashboardViewModel();
  const { t, direction } = useI18n();
  const settings = useSettings();

  const isRTL = direction === "rtl";
  const hasAnim = settings.animationLevel !== "none";

  // Loading state
  if (vm.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">{t("dashboard.loading")}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (vm.error || !vm.dashboard) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("dashboard.error")}</AlertTitle>
          <AlertDescription>{vm.error || t("dashboard.error")}</AlertDescription>
          <Button
            variant="outline"
            size="sm"
            onClick={vm.reload}
            className="mt-4"
          >
            {t("dashboard.retry")}
          </Button>
        </Alert>
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
        <TabsList className={cn("grid w-full grid-cols-5", isRTL && "flex-row-reverse")}>
          <TabsTrigger value="overview">{t("dashboard.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="companies">{t("dashboard.tabs.companies")}</TabsTrigger>
          <TabsTrigger value="subscriptions">{t("dashboard.tabs.subscriptions")}</TabsTrigger>
          <TabsTrigger value="admins">{t("dashboard.tabs.admins")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("dashboard.tabs.analytics")}</TabsTrigger>
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

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsTab dashboard={dashboard} t={t} isRTL={isRTL} />

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
