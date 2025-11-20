"use client";

import { useNotificationPreferencesViewModel } from "@/viewmodels/account/use-notification-preferences-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Building2, 
  Calendar, 
  AlertTriangle,
  Save,
  RotateCcw,
  CheckCircle2,
  Info,
  Home
} from "lucide-react";
import Link from "next/link";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export function NotificationsView() {
  const vm = useNotificationPreferencesViewModel();
  const { t, direction } = useI18n();
  const isRTL = direction === "rtl";

  // Loading state
  if (vm.isLoading) {
    return (
      <div className="space-y-6 p-6" dir={isRTL ? "rtl" : "ltr"}>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!vm.preferences) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" dir={isRTL ? "rtl" : "ltr"}>
        <p className="text-muted-foreground">{t("notifications.loadError") || "Failed to load notification preferences"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12" dir={isRTL ? "rtl" : "ltr"}>
      {/* Breadcrumbs */}
      <div className="mx-6 mt-6 mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/account">
                  {t('nav.account') || 'Account'}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold">
                {t('nav.notifications') || 'Notifications'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-6 mb-8 mx-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-lg bg-primary/10">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t("notifications.title") || "Notification Preferences"}</h1>
            <p className="text-muted-foreground mt-1">
              {t("notifications.subtitle") || "Manage how you receive notifications and alerts"}
            </p>
          </div>
        </div>

        {/* Summary Info */}
        {vm.preferences.hasAnyEnabled && (
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-300">
              {(t("notifications.enabledCount") || `You have ${vm.preferences.enabledCount} notification types enabled`).replace(
                "{count}",
                vm.preferences.enabledCount.toString()
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        {/* Save/Reset Buttons */}
        {vm.hasChanges && (
          <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-300 flex items-center justify-between">
              <span>{t("notifications.unsavedChanges") || "You have unsaved changes"}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={vm.resetChanges}
                  disabled={vm.isSaving}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t("common.reset") || "Reset"}
                </Button>
                <Button
                  size="sm"
                  onClick={vm.savePreferences}
                  disabled={vm.isSaving}
                >
                  {vm.isSaving ? (
                    <>{t("common.saving") || "Saving..."}</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {t("common.saveChanges") || "Save Changes"}
                    </>
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {t("notifications.channels") || "Notification Channels"}
            </CardTitle>
            <CardDescription>
              {t("notifications.channelsDesc") || "Choose how you want to receive notifications"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{t("notifications.email") || "Email Notifications"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("notifications.emailDesc") || "Receive notifications via email"}
                  </p>
                </div>
              </div>
              <Switch
                checked={vm.preferences.emailNotificationsEnabled}
                onCheckedChange={vm.toggleEmail}
                disabled={vm.isSaving}
              />
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{t("notifications.push") || "Push Notifications"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("notifications.pushDesc") || "Receive push notifications in browser"}
                  </p>
                </div>
              </div>
              <Switch
                checked={vm.preferences.pushNotificationsEnabled}
                onCheckedChange={vm.togglePush}
                disabled={vm.isSaving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Alert Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {t("notifications.alertTypes") || "Alert Types"}
            </CardTitle>
            <CardDescription>
              {t("notifications.alertTypesDesc") || "Select which types of alerts you want to receive"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Expiry */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Building2 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{t("notifications.companyExpiry") || "Company License Expiry"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("notifications.companyExpiryDesc") || "Get notified when company licenses are about to expire"}
                  </p>
                </div>
              </div>
              <Switch
                checked={vm.preferences.companyExpiryNotifications}
                onCheckedChange={vm.toggleCompanyExpiry}
                disabled={vm.isSaving}
              />
            </div>

            {/* Subscription Expiry */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{t("notifications.subscriptionExpiry") || "Subscription Expiry"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("notifications.subscriptionExpiryDesc") || "Get notified when subscriptions are about to expire"}
                  </p>
                </div>
              </div>
              <Switch
                checked={vm.preferences.subscriptionExpiryNotifications}
                onCheckedChange={vm.toggleSubscriptionExpiry}
                disabled={vm.isSaving}
              />
            </div>

            {/* System Alerts */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{t("notifications.systemAlerts") || "System Alerts"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("notifications.systemAlertsDesc") || "Get notified about important system updates and issues"}
                  </p>
                </div>
              </div>
              <Switch
                checked={vm.preferences.systemAlertsNotifications}
                onCheckedChange={vm.toggleSystemAlerts}
                disabled={vm.isSaving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            {t("notifications.info") || "Changes will take effect immediately after saving. You can update these preferences at any time."}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
