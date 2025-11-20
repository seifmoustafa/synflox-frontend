"use client";

import { Shield, AlertTriangle, CheckCircle2, Clock, Loader2, RefreshCw } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
import { useSecurityOverviewViewModel } from '@/viewmodels/security/use-security-overview-viewmodel';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SecurityOverviewTab() {
  const { t, direction } = useI18n();
  const vm = useSecurityOverviewViewModel();
  const isRTL = direction === 'rtl';

  if (vm.isLoading && !vm.hasData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (vm.error && !vm.hasData) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{vm.error}</AlertDescription>
      </Alert>
    );
  }

  if (!vm.dashboard) {
    return null;
  }

  const { dashboard } = vm;

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Refresh Button */}
      <div className={cn("flex justify-end",)}>
        <Button
          onClick={vm.handleRefresh}
          disabled={vm.isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2", vm.isLoading && "animate-spin")} />
          {t('common.refresh') || 'Refresh'}
        </Button>
      </div>

      {/* Security Score Card */}
      <div className="p-6 rounded-lg border bg-card shadow-sm">
        <div className={cn("flex items-center justify-between mb-4",)}>
          <h3 className="text-lg font-semibold">{t('security.securityScore') || 'Security Score'}</h3>
          <div className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            dashboard.scoreLevel === 'excellent' && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
            dashboard.scoreLevel === 'good' && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
            dashboard.scoreLevel === 'fair' && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
            dashboard.scoreLevel === 'poor' && "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
          )}>
            {dashboard.scoreLevel.toUpperCase()}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl font-bold text-primary">
            {dashboard.securityScore}
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
        </div>

        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 rounded-full",
              dashboard.scoreLevel === 'excellent' && "bg-green-500",
              dashboard.scoreLevel === 'good' && "bg-blue-500",
              dashboard.scoreLevel === 'fair' && "bg-orange-500",
              dashboard.scoreLevel === 'poor' && "bg-red-500"
            )}
            style={{ width: `${dashboard.securityScore}%` }}
          />
        </div>
      </div>

      {/* Security Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 2FA Status */}
        <div className={cn(
          "p-4 rounded-lg border",
          dashboard.is2FAEnabled
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
        )}>
          <div className={cn("flex items-center gap-2 mb-2",)}>
            <Shield className={cn(
              "w-5 h-5",
              dashboard.is2FAEnabled ? "text-green-600" : "text-orange-600"
            )} />
            <h4 className="font-semibold text-sm">
              {t('security.twoFactorAuth') || '2FA'}
            </h4>
          </div>
          <p className={cn(
            "text-xs font-medium",
            dashboard.is2FAEnabled ? "text-green-700 dark:text-green-400" : "text-orange-700 dark:text-orange-400"
          )}>
            {dashboard.is2FAEnabled
              ? t('security.enabled') || 'Enabled'
              : t('security.disabled') || 'Disabled'}
          </p>
        </div>

        {/* Backup Codes */}
        <div className={cn(
          "p-4 rounded-lg border",
          dashboard.hasBackupCodes
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
        )}>
          <div className={cn("flex items-center gap-2 mb-2",)}>
            <CheckCircle2 className={cn(
              "w-5 h-5",
              dashboard.hasBackupCodes ? "text-green-600" : "text-orange-600"
            )} />
            <h4 className="font-semibold text-sm">
              {t('security.backupCodes') || 'Backup Codes'}
            </h4>
          </div>
          <p className={cn(
            "text-xs font-medium",
            dashboard.hasBackupCodes ? "text-green-700 dark:text-green-400" : "text-orange-700 dark:text-orange-400"
          )}>
            {dashboard.backupCodesRemaining} {t('security.remaining') || 'remaining'}
          </p>
        </div>

        {/* Password Age */}
        <div className={cn(
          "p-4 rounded-lg border",
          dashboard.passwordChangeNeeded
            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        )}>
          <div className={cn("flex items-center gap-2 mb-2",)}>
            <Clock className={cn(
              "w-5 h-5",
              dashboard.passwordChangeNeeded ? "text-red-600" : "text-blue-600"
            )} />
            <h4 className="font-semibold text-sm">
              {t('security.passwordAge') || 'Password Age'}
            </h4>
          </div>
          <p className={cn(
            "text-xs font-medium",
            dashboard.passwordChangeNeeded ? "text-red-700 dark:text-red-400" : "text-blue-700 dark:text-blue-400"
          )}>
            {dashboard.daysSincePasswordChange} {t('security.daysOld') || 'days old'}
          </p>
        </div>

        {/* Failed Logins */}
        <div className={cn(
          "p-4 rounded-lg border",
          dashboard.failedLoginAttempts > 5
            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
        )}>
          <div className={cn("flex items-center gap-2 mb-2",)}>
            <AlertTriangle className={cn(
              "w-5 h-5",
              dashboard.failedLoginAttempts > 5 ? "text-red-600" : "text-green-600"
            )} />
            <h4 className="font-semibold text-sm">
              {t('security.failedLogins') || 'Failed Logins'}
            </h4>
          </div>
          <p className={cn(
            "text-xs font-medium",
            dashboard.failedLoginAttempts > 5 ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"
          )}>
            {dashboard.failedLoginAttempts} {t('security.attempts') || 'attempts'}
          </p>
        </div>
      </div>

      {/* High Priority Recommendations */}
      {dashboard.highPriorityRecommendations.length > 0 && (
        <div className="p-6 rounded-lg border bg-card shadow-sm">
          <h3 className={cn("text-lg font-semibold mb-4", isRTL && "text-right")}>
            {t('security.recommendations') || 'Security Recommendations'}
          </h3>
          <div className="space-y-3">
            {dashboard.highPriorityRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
              >
                <div className={cn("flex items-start gap-3",)}>
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{rec}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Security Events */}
      {dashboard.recentEvents.length > 0 && (
        <div className="p-6 rounded-lg border bg-card shadow-sm">
          <h3 className={cn("text-lg font-semibold mb-4", isRTL && "text-right")}>
            {t('security.recentEvents') || 'Recent Security Events'}
          </h3>
          <div className="space-y-2">
            {dashboard.recentEvents.slice(0, 5).map((event, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                 
                )}
              >
                <div className={cn("flex items-center gap-3",)}>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    event.severity === 'high' && "bg-red-500",
                    event.severity === 'medium' && "bg-orange-500",
                    event.severity === 'low' && "bg-green-500"
                  )} />
                  <div>
                    <p className="text-sm font-medium">{event.description}</p>
                    <p className="text-xs text-muted-foreground">{event.location} • {event.ipAddress}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{event.relativeTime}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
