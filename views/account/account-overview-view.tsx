"use client";

import { useRef } from "react";
import { useAccountOverviewViewModel } from "@/viewmodels/account/use-account-overview-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { useSettings } from "@/providers/settings-provider";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Shield, 
  Mail, 
  Activity, 
  ChevronRight, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Key,
  Download,
  TrendingUp,
  Calendar,
  MapPin,
  Sparkles,
  Camera,
  X,
  Loader2
} from "lucide-react";

/**
 * Security Score Color Helper
 */
function getSecurityScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  return "text-red-500";
}

function getSecurityScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-500/10";
  if (score >= 60) return "bg-yellow-500/10";
  return "bg-red-500/10";
}

export function AccountOverviewView() {
  const vm = useAccountOverviewViewModel();
  const { t, direction } = useI18n();
  const settings = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRTL = direction === "rtl";
  const hasAnim = settings.animationLevel !== "none";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      vm.handlePhotoUpload(file);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  // Loading state
  if (vm.isLoading) {
    return (
      <div className="space-y-6 p-6" dir={isRTL ? "rtl" : "ltr"}>
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  // Error state
  if (vm.error || !vm.profile || !vm.securityDashboard) {
    return (
      <div className="space-y-6 p-6" dir={isRTL ? "rtl" : "ltr"}>
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t("account.errors.loadProfile")}</h3>
              <p className="text-muted-foreground mb-6">{vm.error}</p>
              <Button onClick={vm.reload} size="lg">
                <RefreshCw className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                {t("dashboard.refresh")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile, securityDashboard } = vm;
  const securityScore = securityDashboard.securityScore;
  const scoreColor = getSecurityScoreColor(securityScore);
  const scoreBgColor = getSecurityScoreBgColor(securityScore);

  return (
    <div className="min-h-screen pb-12" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-8 mb-8 mx-6 mt-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Profile Section */}
          <div className="flex items-center gap-6">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            
            <div className="relative group">
              <div 
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg cursor-pointer relative overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {vm.isUploadingPhoto ? (
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                ) : profile.hasProfilePicture ? (
                  <>
                    <img 
                      src={profile.fullProfilePictureUrl!} 
                      alt={profile.displayName}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <User className="w-10 h-10 text-white mb-1" />
                    <Camera className="w-4 h-4 text-white/70" />
                  </div>
                )}
              </div>
              
              {/* Remove Button */}
              {profile.hasProfilePicture && !vm.isUploadingPhoto && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    vm.handlePhotoRemove();
                  }}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg"
                  title={t("account.removePhoto")}
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
              
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-background flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">
                {t("account.welcomeBack")}, {profile.displayName}! <Sparkles className="inline w-6 h-6 text-yellow-500" />
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {profile.email || profile.username}
              </p>
              {profile.lastLoginAt && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {t("account.lastLogin")}: {new Date(profile.lastLoginAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={vm.reload} className="shadow-md">
              <RefreshCw className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
              {t("dashboard.refresh")}
            </Button>
            <Button size="lg" onClick={vm.navigateToProfile} className="shadow-md">
              <User className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
              {t("account.editProfile")}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Security Overview Card - Featured */}
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary" />
                  {t("account.securityOverview")}
                </CardTitle>
                <CardDescription className="mt-1">
                  {t("account.securityStatus")}
                </CardDescription>
              </div>
              <Badge variant={securityScore >= 80 ? "default" : securityScore >= 60 ? "secondary" : "destructive"} className="text-lg px-4 py-2">
                {securityDashboard.securityLevel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Security Score with Circular Progress */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="relative w-32 h-32 mb-4">
                  {/* Circular progress SVG */}
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted-foreground/20"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(securityScore / 100) * 351.86} 351.86`}
                      className={cn(scoreColor)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn("text-3xl font-bold", scoreColor)}>{securityScore}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <p className="font-semibold text-center">{t("account.securityScore")}</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {securityScore >= 80 ? t("account.excellentSecurity") : securityScore >= 60 ? t("account.goodSecurity") : t("account.needsAttention")}
                </p>
              </div>

              {/* 2FA Status */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-primary/20">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                  securityDashboard.twoFactorStats.isEnabled ? "bg-green-500/10" : "bg-yellow-500/10"
                )}>
                  <Key className={cn(
                    "w-8 h-8",
                    securityDashboard.twoFactorStats.isEnabled ? "text-green-500" : "text-yellow-500"
                  )} />
                </div>
                <p className="font-semibold text-center">{t("account.twoFactorAuth")}</p>
                <Badge variant={securityDashboard.twoFactorStats.isEnabled ? "default" : "secondary"} className="mt-2">
                  {securityDashboard.twoFactorStats.isEnabled ? t("account.enabled") : t("account.disabled")}
                </Badge>
                {!securityDashboard.twoFactorStats.isEnabled && (
                  <Button size="sm" variant="ghost" onClick={vm.navigateToSecurity} className="mt-3">
                    {t("account.enableNow")}
                  </Button>
                )}
              </div>

              {/* Backup Codes */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-primary/20">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                  <Download className="w-8 h-8 text-blue-500" />
                </div>
                <p className="font-semibold text-center">{t("account.backupCodes")}</p>
                <div className="text-3xl font-bold text-blue-500 mt-2">
                  {securityDashboard.backupCodesStats.remainingCodes}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  of {securityDashboard.backupCodesStats.totalGenerated} {t("account.codesRemaining")}
                </p>
                <Progress 
                  value={(securityDashboard.backupCodesStats.remainingCodes / securityDashboard.backupCodesStats.totalGenerated) * 100} 
                  className="h-2 mt-3 w-full"
                />
              </div>
            </div>

            {/* Recommendations */}
            {securityDashboard.recommendations.length > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-2">{t("account.securityRecommendations")}</p>
                    <ul className="space-y-1">
                      {securityDashboard.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-yellow-500">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Password Age */}
          <Card className={cn("border-l-4 border-l-purple-500", hasAnim && "hover:shadow-lg transition-shadow duration-200")}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {profile.daysSinceLastPasswordChange === 999 ? t("account.never") : `${profile.daysSinceLastPasswordChange} days`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("account.sincePasswordChange")}</p>
              {profile.daysSinceLastPasswordChange > 90 && profile.daysSinceLastPasswordChange < 999 && (
                <Badge variant="destructive" className="mt-2 text-xs">{t("account.considerChanging")}</Badge>
              )}
            </CardContent>
          </Card>

          {/* Failed Logins */}
          <Card className={cn("border-l-4 border-l-red-500", hasAnim && "hover:shadow-lg transition-shadow duration-200")}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <Activity className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{securityDashboard.failedLoginStats.last7Days}</div>
              <p className="text-xs text-muted-foreground mt-1">{t("account.failedLoginsWeek")}</p>
              {securityDashboard.failedLoginStats.suspiciousActivity && (
                <Badge variant="destructive" className="mt-2 text-xs">{t("account.suspicious")}</Badge>
              )}
            </CardContent>
          </Card>

          {/* Account Age */}
          <Card className={cn("border-l-4 border-l-green-500", hasAnim && "hover:shadow-lg transition-shadow duration-200")}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-green-500" />
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{Math.floor((profile.daysSinceCreation || 0) / 30)} {t("account.months")}</div>
              <p className="text-xs text-muted-foreground mt-1">{t("account.accountAge")}</p>
            </CardContent>
          </Card>

          {/* Backup Codes Expiry */}
          <Card className={cn("border-l-4 border-l-blue-500", hasAnim && "hover:shadow-lg transition-shadow duration-200")}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Key className="w-5 h-5 text-blue-500" />
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{securityDashboard.backupCodesStats.daysUntilExpiry}</div>
              <p className="text-xs text-muted-foreground mt-1">{t("account.daysUntilExpire")}</p>
            </CardContent>
          </Card>
        </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t("account.navigationCards")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Profile Card */}
          <Card 
            className={cn(
              "cursor-pointer",
              hasAnim && "hover:shadow-lg hover:scale-105 transition-all duration-200"
            )}
            onClick={vm.navigateToProfile}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <User className="w-8 h-8 text-primary" />
                <ChevronRight className={cn("w-5 h-5 text-muted-foreground", isRTL && "rotate-180")} />
              </div>
              <CardTitle>{t("account.profileCard.title")}</CardTitle>
              <CardDescription>{t("account.profileCard.description")}</CardDescription>
            </CardHeader>
          </Card>

          {/* Security Card */}
          <Card 
            className={cn(
              "cursor-pointer",
              hasAnim && "hover:shadow-lg hover:scale-105 transition-all duration-200"
            )}
            onClick={vm.navigateToSecurity}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <Shield className="w-8 h-8 text-primary" />
                <ChevronRight className={cn("w-5 h-5 text-muted-foreground", isRTL && "rotate-180")} />
              </div>
              <CardTitle>{t("account.securityCard.title")}</CardTitle>
              <CardDescription>{t("account.securityCard.description")}</CardDescription>
            </CardHeader>
          </Card>

          {/* Emails Card */}
          <Card 
            className={cn(
              "cursor-pointer",
              hasAnim && "hover:shadow-lg hover:scale-105 transition-all duration-200"
            )}
            onClick={vm.navigateToEmails}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <Mail className="w-8 h-8 text-primary" />
                <ChevronRight className={cn("w-5 h-5 text-muted-foreground", isRTL && "rotate-180")} />
              </div>
              <CardTitle>{t("account.emailsCard.title")}</CardTitle>
              <CardDescription>{t("account.emailsCard.description")}</CardDescription>
            </CardHeader>
          </Card>

          {/* Activity Card */}
          <Card 
            className={cn(
              "cursor-pointer",
              hasAnim && "hover:shadow-lg hover:scale-105 transition-all duration-200"
            )}
            onClick={vm.navigateToActivity}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <Activity className="w-8 h-8 text-primary" />
                <ChevronRight className={cn("w-5 h-5 text-muted-foreground", isRTL && "rotate-180")} />
              </div>
              <CardTitle>{t("account.activityCard.title")}</CardTitle>
              <CardDescription>{t("account.activityCard.description")}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

        {/* Recent Security Events Timeline */}
        {securityDashboard.recentEvents.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    {t("account.recentSecurityActivity")}
                  </CardTitle>
                  <CardDescription>{t("account.latestSecurityEvents")}</CardDescription>
                </div>
                <Button size="sm" variant="ghost" onClick={vm.navigateToActivity}>
                  {t("account.viewAll")}
                  <ChevronRight className={cn("w-4 h-4", isRTL ? "mr-1" : "ml-1")} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityDashboard.recentEvents.slice(0, 5).map((event, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        event.success ? "bg-green-500/10" : "bg-red-500/10"
                      )}>
                        {event.success ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      {index < securityDashboard.recentEvents.slice(0, 5).length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2" />
                      )}
                    </div>
                    {/* Event content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium">{event.description}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.ipAddress}
                            </span>
                          </div>
                        </div>
                        {event.severity && (
                          <Badge 
                            variant={event.severity === "Critical" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {event.severity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
