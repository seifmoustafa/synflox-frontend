"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, BarChart3, Key, Settings, Calendar, DollarSign, Building, Package, Clock, AlertCircle, CheckCircle, XCircle, Pause, Play, RotateCcw, Layers, Box, Star, ArrowLeft, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { useI18n } from "@/providers/i18n-provider";
import { formatDate } from "@/lib/utils";
import { Currency } from "@/domain/models/subscription-plan.model";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { useSubscriptionDetailsViewModel } from "@/viewmodels/subscription-details-viewmodel";
import { 
  SubscriptionActionDialog, 
  SubscriptionActionDialogData,
  SubscriptionActionType 
} from "@/components/dialogs/subscription-action-dialog";

interface SubscriptionDetailsViewProps {
  subscriptionId: string;
}

export function SubscriptionDetailsView({ subscriptionId }: SubscriptionDetailsViewProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { 
    subscription, 
    subscriptionStatus,
    history,
    analytics,
    loading, 
    historyLoading,
    analyticsLoading,
    error, 
    handleLifecycleAction 
  } = useSubscriptionDetailsViewModel(subscriptionId);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Action dialog state
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<SubscriptionActionType | null>(null);

  // Open action dialog
  const openActionDialog = (action: SubscriptionActionType) => {
    setCurrentAction(action);
    setActionDialogOpen(true);
  };

  // Handle action confirmation from dialog
  const handleActionConfirm = async (data: SubscriptionActionDialogData) => {
    if (!currentAction || !subscription) return;
    
    await handleLifecycleAction(
      currentAction as any,
      subscription,
      data.reason,
      data.notes,
      data.sendEmailNotification,
      data.language
    );
  };

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
        <ErrorMessage 
          message={error || t("subscription.loadError")} 
        />
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (subscription.status) {
      case "Active": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Suspended": return <Pause className="h-5 w-5 text-orange-500" />;
      case "Cancelled": return <XCircle className="h-5 w-5 text-red-500" />;
      case "Expired": return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "Trial": return <Clock className="h-5 w-5 text-blue-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (subscription.status) {
      case "Active": return "green";
      case "Trial": return "blue";
      case "Expiring": return "yellow";
      case "Expired": return "red";
      case "Suspended": return "orange";
      case "Cancelled": return "gray";
      case "Lifetime": return "purple";
      default: return "gray";
    }
  };

  const getDaysRemainingProgress = () => {
    if (subscription.isLifetime) return 100;
    if (subscription.isExpired) return 0;
    
    const totalDays = Math.ceil(
      (subscription.expiryDateUtc.getTime() - subscription.startDateUtc.getTime()) / (1000 * 60 * 60 * 24)
    );
    const remainingDays = subscription.daysRemaining || 0;
    return Math.max(0, Math.min(100, (remainingDays / totalDays) * 100));
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <PageBreadcrumbs
        segments={[
          { label: t("subscription.items"), href: "/subscriptions" },
          { label: subscription.planName }
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {subscription.planName}
          </h1>
          <p className="text-muted-foreground">
            {subscription.companyName} • {t("subscription.item")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/subscriptions/${subscriptionId}/edit`)}
          >
            <Edit className="h-4 w-4 me-2" />
            {t("common.edit")}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/subscriptions/${subscriptionId}/analytics`)}
          >
            <BarChart3 className="h-4 w-4 me-2" />
            {t("subscription.analytics")}
          </Button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("subscription.status")}</CardTitle>
            {getStatusIcon()}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor() as any} className="text-sm">
                {t(`subscription.statuses.${subscription.status.toLowerCase()}`)}
              </Badge>
            </div>
            {subscription.statusReason && (
              <p className="text-xs text-muted-foreground mt-2">
                {subscription.statusReason}
              </p>
            )}
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
            <div className="space-y-2 mt-2">
              <Progress value={getDaysRemainingProgress()} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {subscription.isLifetime 
                  ? t("subscription.lifetime")
                  : `${t("subscription.expires")} ${formatDate(subscription.expiryDateUtc)}`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("subscription.amount")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription.amount} {Currency[subscription.currency] || "USD"}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription.autoRenew ? t("subscription.autoRenewEnabled") : t("subscription.autoRenewDisabled")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("subscription.company")}</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {subscription.companyName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{subscription.companyName}</p>
                <p className="text-xs text-muted-foreground">{t("subscription.customer")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <span>{t("subscription.quickActions")}</span>
          </CardTitle>
          <CardDescription>
            {t("subscription.quickActionsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {subscription.canRenew && (
              <Button
                variant="outline"
                onClick={() => openActionDialog("renew")}
              >
                <RotateCcw className="h-4 w-4 me-2" />
                {t("subscription.operations.renew")}
              </Button>
            )}
            {subscription.canSuspend && (
              <Button
                variant="outline"
                onClick={() => openActionDialog("suspend")}
              >
                <Pause className="h-4 w-4 me-2" />
                {t("subscription.operations.suspend")}
              </Button>
            )}
            {subscription.canResume && (
              <Button
                variant="outline"
                onClick={() => openActionDialog("resume")}
              >
                <Play className="h-4 w-4 me-2" />
                {t("subscription.operations.resume")}
              </Button>
            )}
            {subscription.canCancel && (
              <Button
                variant="destructive"
                onClick={() => openActionDialog("cancel")}
              >
                <XCircle className="h-4 w-4 me-2" />
                {t("subscription.operations.cancel")}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push(`/subscriptions/${subscriptionId}/license-keys`)}
            >
              <Key className="h-4 w-4 me-2" />
              {t("subscription.licenseKeys")}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/subscriptions/${subscriptionId}/analytics`)}
            >
              <BarChart3 className="h-4 w-4 me-2" />
              {t("subscription.analytics")}
            </Button>
            {/* Entitlements button REMOVED - v2.0: Will be Plan-level entitlements view */}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4" dir={t("dir") as "ltr" | "rtl"}>
        <TabsList className={`grid w-full grid-cols-4 ${t("dir") === "rtl" ? "direction-rtl" : ""}`}>
          {t("dir") === "rtl" ? (
            <>
              <TabsTrigger value="history">{t("subscription.tabs.history")}</TabsTrigger>
              <TabsTrigger value="features">{t("subscription.tabs.features")}</TabsTrigger>
              <TabsTrigger value="billing">{t("subscription.tabs.billing")}</TabsTrigger>
              <TabsTrigger value="overview">{t("subscription.tabs.overview")}</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="overview">{t("subscription.tabs.overview")}</TabsTrigger>
              <TabsTrigger value="billing">{t("subscription.tabs.billing")}</TabsTrigger>
              <TabsTrigger value="features">{t("subscription.tabs.features")}</TabsTrigger>
              <TabsTrigger value="history">{t("subscription.tabs.history")}</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("subscription.subscriptionDetails")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("subscription.startDate")}</p>
                    <p className="text-sm">{formatDate(subscription.startDateUtc)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("subscription.expiryDate")}</p>
                    <p className="text-sm">
                      {subscription.isLifetime ? t("subscription.lifetime") : formatDate(subscription.expiryDateUtc)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("subscription.trial")}</p>
                    <p className="text-sm">{subscription.isTrial ? t("common.yes") : t("common.no")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("subscription.autoRenew")}</p>
                    <p className="text-sm">{subscription.autoRenew ? t("common.yes") : t("common.no")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("subscription.planDetails")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{subscription.planName}</p>
                    <p className="text-sm text-muted-foreground">{t("subscription.currentPlan")}</p>
                  </div>
                </div>
                {subscription.planDescription && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{t("subscription.planDescriptionLabel")}</p>
                      <p className="text-sm text-muted-foreground">{subscription.planDescription}</p>
                    </div>
                  </>
                )}
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("subscription.pricing")}</p>
                  <p className="text-2xl font-bold">
                    {subscription.amount} {Currency[subscription.currency] || "USD"}
                  </p>
                </div>
                {/* Quick Features Summary */}
                {(subscription.projects?.length > 0 || subscription.modules?.length > 0 || subscription.customFeatures?.length > 0) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{t("subscription.planFeaturesSummary")}</p>
                      <div className="flex flex-wrap gap-2">
                        {subscription.projects?.length > 0 && (
                          <Badge variant="outline">
                            {subscription.projects.length} {t("subscription.projectsIncluded")}
                          </Badge>
                        )}
                        {subscription.modules?.length > 0 && (
                          <Badge variant="outline">
                            {subscription.modules.length} {t("subscription.modulesIncluded")}
                          </Badge>
                        )}
                        {subscription.customFeatures?.length > 0 && (
                          <Badge variant="outline">
                            {subscription.customFeatures.length} {t("subscription.customFeaturesIncluded")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("subscription.billingInformation")}</CardTitle>
                <CardDescription>
                  {t("subscription.billingDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("subscription.currency")}</p>
                    <p className="text-lg font-bold">{Currency[subscription.currency] || "USD"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("subscription.amount")}</p>
                    <p className="text-lg font-bold">{subscription.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("subscription.autoRenew")}</p>
                    <Badge variant={subscription.autoRenew ? "success" : "secondary"}>
                      {subscription.autoRenew ? t("common.yes") : t("common.no")}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("subscription.status")}</p>
                    <Badge variant={subscription.isActive ? "success" : "secondary"}>
                      {subscription.isActive ? t("common.active") : t("common.inactive")}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Usage Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("subscription.usageStatistics")}</CardTitle>
                  <CardDescription>
                    {t("subscription.usageStatisticsDescription")}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/subscriptions/${subscriptionId}/analytics`)}
                >
                  <BarChart3 className="h-4 w-4 me-2" />
                  {t("subscription.viewDetailedAnalytics")}
                </Button>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="md" />
                  </div>
                ) : analytics ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t("subscription.activeDays")}</p>
                        <p className="text-2xl font-bold">{(analytics.usage as any)?.activeDays ?? (analytics.usage as any)?.ActiveDays ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t("subscription.totalDays")}</p>
                        <p className="text-2xl font-bold">{(analytics.usage as any)?.totalDays ?? (analytics.usage as any)?.TotalDays ?? 0}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t("subscription.utilizationRate")}</span>
                        <span className="font-medium">{Math.round((analytics.usage as any)?.utilizationPercentage ?? (analytics.usage as any)?.UtilizationPercentage ?? 0)}%</span>
                      </div>
                      <Progress value={(analytics.usage as any)?.utilizationPercentage ?? (analytics.usage as any)?.UtilizationPercentage ?? 0} className="h-2" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{t("subscription.noAnalytics")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          {/* View Plan Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => router.push(`/plans/${subscription.planId}`)}
            >
              <Package className="h-4 w-4 me-2" />
              {t("subscription.viewPlanDetails")}
            </Button>
          </div>

          {/* Projects */}
          {subscription.projects && subscription.projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  {t("subscription.includedProjects")}
                </CardTitle>
                <CardDescription>
                  {t("subscription.includedProjectsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscription.projects.map((project: any) => (
                    <div 
                      key={project.id} 
                      className="p-4 rounded-lg border hover:border-primary hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Box className="h-5 w-5 text-primary" />
                          <h4 className="font-medium">{project.name}</h4>
                        </div>
                        <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 rtl:rotate-0" />
                      </div>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                      )}
                      {project.modules && project.modules.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">{t("subscription.modules")}:</p>
                          <div className="flex flex-wrap gap-1">
                            {project.modules.map((module: any) => (
                              <Badge 
                                key={module.id} 
                                variant="secondary" 
                                className="text-xs hover:bg-primary hover:text-primary-foreground cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/modules/${module.id}`);
                                }}
                              >
                                {module.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Standalone Modules */}
          {subscription.modules && subscription.modules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t("subscription.includedModules")}
                </CardTitle>
                <CardDescription>
                  {t("subscription.includedModulesDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {subscription.modules.map((module: any) => (
                    <div 
                      key={module.id} 
                      className="p-4 rounded-lg border hover:border-primary hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/modules/${module.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Box className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">{module.name}</h4>
                        </div>
                        <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 rtl:rotate-0" />
                      </div>
                      {module.description && (
                        <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom Features */}
          {subscription.customFeatures && subscription.customFeatures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  {t("subscription.customFeatures")}
                </CardTitle>
                <CardDescription>
                  {t("subscription.customFeaturesDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {subscription.customFeatures.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* No Features */}
          {(!subscription.projects || subscription.projects.length === 0) &&
           (!subscription.modules || subscription.modules.length === 0) &&
           (!subscription.customFeatures || subscription.customFeatures.length === 0) && (
            <Card>
              <CardHeader>
                <CardTitle>{t("subscription.planFeatures")}</CardTitle>
                <CardDescription>
                  {t("subscription.featuresDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t("subscription.noFeatures")}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("subscription.subscriptionHistory")}</CardTitle>
              <CardDescription>
                {t("subscription.historyDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item: any, index: number) => {
                    // Get action-specific icon and color
                    const getActionStyle = (action: string) => {
                      const actionLower = action?.toLowerCase() || '';
                      if (actionLower.includes('created')) return { icon: <CheckCircle className="h-5 w-5" />, bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600' };
                      if (actionLower.includes('activated')) return { icon: <Play className="h-5 w-5" />, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600' };
                      if (actionLower.includes('suspended') || actionLower.includes('paused')) return { icon: <Pause className="h-5 w-5" />, bg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-600' };
                      if (actionLower.includes('cancelled') || actionLower.includes('canceled')) return { icon: <XCircle className="h-5 w-5" />, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600' };
                      if (actionLower.includes('renewed') || actionLower.includes('extended')) return { icon: <RotateCcw className="h-5 w-5" />, bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600' };
                      if (actionLower.includes('status')) return { icon: <AlertCircle className="h-5 w-5" />, bg: 'bg-gray-100 dark:bg-gray-900/30', color: 'text-gray-600' };
                      return { icon: <Clock className="h-5 w-5" />, bg: 'bg-primary/10', color: 'text-primary' };
                    };
                    const style = getActionStyle(item.action);
                    
                    return (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center ${style.color}`}>
                            {style.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.action}</p>
                          <p className="text-sm text-muted-foreground">{item.reason}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(new Date(item.timestamp))}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t("subscription.noHistory")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      {currentAction && (
        <SubscriptionActionDialog
          open={actionDialogOpen}
          onClose={() => {
            setActionDialogOpen(false);
            setCurrentAction(null);
          }}
          onConfirm={handleActionConfirm}
          actionType={currentAction}
          subscriptionName={subscription.planName}
          companyName={subscription.companyName}
        />
      )}
    </div>
  );
}
