"use client";

import { useActivityViewModel } from "@/viewmodels/account/use-activity-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { useSettings } from "@/providers/settings-provider";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Key,
  Smartphone,
  MapPin,
  Calendar,
  Info
} from "lucide-react";

/**
 * Get severity color for events
 */
function getSeverityColor(severity: string): string {
  const s = severity.toLowerCase();
  if (s === 'critical') return 'text-red-500';
  if (s === 'warning') return 'text-yellow-500';
  return 'text-blue-500';
}

function getSeverityBg(severity: string): string {
  const s = severity.toLowerCase();
  if (s === 'critical') return 'bg-red-500/10';
  if (s === 'warning') return 'bg-yellow-500/10';
  return 'bg-blue-500/10';
}

export function ActivityView() {
  const vm = useActivityViewModel();
  const { t, direction } = useI18n();
  const settings = useSettings();

  const isRTL = direction === "rtl";
  const hasAnim = settings.animationLevel !== "none";

  // Loading state
  if (vm.isLoading) {
    return (
      <div className="space-y-6 p-6" dir={isRTL ? "rtl" : "ltr"}>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error state
  if (vm.error || !vm.securityDashboard) {
    return (
      <div className="space-y-6 p-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Breadcrumbs */}
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
                {t('nav.activity') || 'Activity'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t("activity.errors.loadData")}</h3>
              <p className="text-muted-foreground mb-6">{vm.error}</p>
              <Button onClick={vm.reload} size="lg">
                <RefreshCw className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                {t("common.retry")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { securityDashboard } = vm;
  const scoreColor = securityDashboard.scoreColor;

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
                {t('nav.activity') || 'Activity'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-6 mb-8 mx-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t("activity.title") || "Security Activity"}</h1>
              <p className="text-muted-foreground mt-1">
                {t("activity.subtitle") || "Monitor your account security and recent activities"}
              </p>
            </div>
          </div>
          <Button onClick={vm.reload} variant="outline" size="sm">
            <RefreshCw className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
            {t("common.refresh")}
          </Button>
        </div>

        {/* Security Score */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Score Display */}
          <Card className={cn("border-2", hasAnim && "hover:shadow-lg transition-shadow duration-200")}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 mb-3">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - securityDashboard.securityScore / 100)}`}
                      className={cn(
                        scoreColor === 'green' ? 'text-green-500' :
                        scoreColor === 'yellow' ? 'text-yellow-500' : 'text-red-500'
                      )}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn(
                      "text-2xl font-bold",
                      scoreColor === 'green' ? 'text-green-500' :
                      scoreColor === 'yellow' ? 'text-yellow-500' : 'text-red-500'
                    )}>
                      {securityDashboard.securityScore}
                    </span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <p className="font-semibold text-center">{t("activity.securityScore")}</p>
                <Badge variant={securityDashboard.isSecure ? "default" : "secondary"} className="mt-2">
                  {securityDashboard.securityLevel}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 2FA Status */}
          <Card className={cn("border-l-4", securityDashboard.is2FAEnabled ? "border-l-green-500" : "border-l-yellow-500")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  securityDashboard.is2FAEnabled ? "bg-green-500/10" : "bg-yellow-500/10"
                )}>
                  <Shield className={cn(
                    "w-5 h-5",
                    securityDashboard.is2FAEnabled ? "text-green-500" : "text-yellow-500"
                  )} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t("activity.twoFactor")}</p>
                  <p className="text-2xl font-bold">
                    {securityDashboard.is2FAEnabled ? t("common.enabled") : t("common.disabled")}
                  </p>
                </div>
              </div>
              {securityDashboard.twoFactorStats.totalVerifications > 0 && (
                <p className="text-xs text-muted-foreground">
                  {securityDashboard.twoFactorStats.totalVerifications} {t("activity.verifications")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Backup Codes */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Key className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t("activity.backupCodes")}</p>
                  <p className="text-2xl font-bold">{securityDashboard.backupCodesRemaining}</p>
                </div>
              </div>
              <Progress 
                value={(securityDashboard.backupCodesRemaining / 10) * 100} 
                className="h-2"
              />
            </CardContent>
          </Card>

          {/* Failed Logins */}
          <Card className={cn(
            "border-l-4",
            securityDashboard.failedLoginStats.last24Hours > 0 ? "border-l-red-500" : "border-l-green-500"
          )}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  securityDashboard.failedLoginStats.last24Hours > 0 ? "bg-red-500/10" : "bg-green-500/10"
                )}>
                  {securityDashboard.failedLoginStats.last24Hours > 0 ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t("activity.failedLogins")}</p>
                  <p className="text-2xl font-bold">{securityDashboard.failedLoginStats.last24Hours}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("activity.last24Hours") || "Last 24 hours"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 space-y-6">
        {/* Recommendations */}
        {securityDashboard.recommendations.length > 0 && (
          <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-300">
              <div className="space-y-2">
                <p className="font-semibold">{t("activity.recommendations")}</p>
                <ul className="list-disc list-inside space-y-1">
                  {securityDashboard.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Recent Security Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {t("activity.recentEvents") || "Recent Security Events"}
                </CardTitle>
                <CardDescription>
                  {t("activity.recentEventsDesc") || "Latest security activities on your account"}
                </CardDescription>
              </div>
              <Badge variant="outline">
                {securityDashboard.recentEvents.length} {t("activity.events")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {securityDashboard.recentEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">{t("activity.noEvents") || "No recent security events"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {securityDashboard.recentEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                      hasAnim && "hover:bg-accent/50"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg flex-shrink-0",
                      getSeverityBg(event.severity)
                    )}>
                      {event.success ? (
                        <CheckCircle2 className={cn("w-5 h-5", getSeverityColor(event.severity))} />
                      ) : (
                        <XCircle className={cn("w-5 h-5", getSeverityColor(event.severity))} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <p className="font-semibold">{event.eventType}</p>
                        <Badge variant={event.success ? "default" : "destructive"} className="flex-shrink-0">
                          {event.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.relativeTime}
                        </div>
                        {event.ipAddress && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.ipAddress}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Failed Login Statistics */}
        {securityDashboard.failedLoginStats.last30Days > 0 && (
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                {t("activity.failedLoginStats") || "Failed Login Attempts"}
              </CardTitle>
              <CardDescription>
                {t("activity.failedLoginStatsDesc") || "Track suspicious login activities"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <p className="text-sm text-muted-foreground mb-1">{t("activity.last24Hours")}</p>
                  <p className="text-3xl font-bold text-red-600">{securityDashboard.failedLoginStats.last24Hours}</p>
                </div>
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <p className="text-sm text-muted-foreground mb-1">{t("activity.last7Days")}</p>
                  <p className="text-3xl font-bold text-red-600">{securityDashboard.failedLoginStats.last7Days}</p>
                </div>
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <p className="text-sm text-muted-foreground mb-1">{t("activity.last30Days")}</p>
                  <p className="text-3xl font-bold text-red-600">{securityDashboard.failedLoginStats.last30Days}</p>
                </div>
              </div>

              {securityDashboard.failedLoginStats.suspiciousActivity && (
                <Alert className="mt-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-300">
                    <p className="font-semibold mb-1">{t("activity.suspiciousActivity")}</p>
                    <p className="text-sm">
                      {t("activity.suspiciousActivityDesc") || "We detected unusual login attempts on your account"}
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Footer */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {t("activity.lastUpdated") || "Last updated"}: {new Date(securityDashboard.lastAuditDate).toLocaleString()}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
