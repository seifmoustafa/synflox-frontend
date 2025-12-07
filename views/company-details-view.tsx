"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCompanyDetailsViewModel } from "@/viewmodels/company-details-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { useCurrency } from "@/providers/currency-provider";
import { CurrencySelector } from "@/components/dashboard/currency-selector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { RenewalReminder } from "@/components/company/renewal-reminder";
import { QuickActions } from "@/components/company/quick-actions";
import { ExportHistoryButton } from "@/components/subscription/export-history-button";
import { CompanyAnalytics } from "@/components/company/company-analytics";
import { ClientAdminTokens } from "@/components/company/client-admin-tokens";
import { CompanyAdminSection } from "@/components/company/company-admin-section";
import { formatDate, cn } from "@/lib/utils";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  CreditCard,
  Clock,
  Users,
  TrendingUp,
  Package,
  AlertCircle,
  ExternalLink,
  Settings,
  Zap,
  Pause,
  Play,
  Key,
  UserCog,
} from "lucide-react";

interface CompanyDetailsViewProps {
  companyId: string;
}

export function CompanyDetailsView({ companyId }: CompanyDetailsViewProps) {
  const {
    company,
    subscriptions,
    activeSubscription,
    isLoading,
    subscriptionsLoading,
    error,
    refresh,
    handleEdit,
    handleCreateSubscription,
    handleBack,
  } = useCompanyDetailsViewModel(companyId);
  const { t, direction } = useI18n();
  const { formatAmount, currencyInfo } = useCurrency();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const isRTL = direction === "rtl";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ErrorMessage message={error || t("company.notFound")} />
      </div>
    );
  }

  const activeCount = subscriptions.filter((s: any) => s.isActive && !s.isExpired).length;
  const totalRevenue = subscriptions.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <PageBreadcrumbs
        segments={[
          { label: t("company.items"), href: "/companies" },
          { label: company.name }
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
              {company.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={company.isActive ? "default" : "destructive"}>
                {company.isActive ? (
                  <><CheckCircle2 className="h-3 w-3 me-1" />{t("company.active")}</>
                ) : (
                  <><XCircle className="h-3 w-3 me-1" />{t("company.inactive")}</>
                )}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground text-sm">
                {t("company.item")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CurrencySelector />
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 me-2" />
            {t("common.refresh")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 me-2" />
            {t("common.edit")}
          </Button>
          <Button size="sm" onClick={handleCreateSubscription}>
            <Plus className="h-4 w-4 me-2" />
            {t("subscription.create")}
          </Button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("company.status.title")}</CardTitle>
            {company.isActive ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {company.isActive ? t("company.active") : t("company.inactive")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("company.createdAt")}: {formatDate(company.createdTimestamp)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("subscription.items")}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCount} {t("subscription.statuses.active")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("subscription.amount")}</CardTitle>
            <span className="text-sm font-medium text-muted-foreground">{currencyInfo.symbol}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.revenue.totalSubscriptionValue")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("subscription.activeSubscription")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {activeSubscription ? (
              <>
                <div className="text-lg font-bold truncate">{activeSubscription.planName}</div>
                <p className="text-xs text-muted-foreground">
                  {activeSubscription.daysRemaining} {t("subscription.daysRemaining")}
                </p>
              </>
            ) : (
              <>
                <div className="text-lg font-bold text-muted-foreground">-</div>
                <p className="text-xs text-muted-foreground">
                  {t("subscription.noSubscriptions")}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Renewal Reminder */}
      {activeSubscription && (
        <RenewalReminder subscription={activeSubscription} />
      )}

      {/* Quick Actions */}
      <QuickActions
        company={company}
        activeSubscription={activeSubscription}
        onCreateSubscription={handleCreateSubscription}
        setActiveTab={setActiveTab}
      />

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        <TabsList className={cn("grid w-full grid-cols-4 lg:w-[800px]", isRTL && "lg:mr-0 lg:ml-auto")}>
          {isRTL ? (
            <>
              <TabsTrigger value="tokens" className="gap-2 ">
                <Key className="h-4 w-4" />
                {t("clientAdminToken.items")}
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-2 ">
                <UserCog className="h-4 w-4" />
                {t("companyAdmin.item")}
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="gap-2 ">
                <CreditCard className="h-4 w-4" />
                {t("subscription.items")}
              </TabsTrigger>
              <TabsTrigger value="overview" className="gap-2 ">
                <Building2 className="h-4 w-4" />
                {t("dashboard.overview.title")}
              </TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="overview" className="gap-2">
                <Building2 className="h-4 w-4" />
                {t("dashboard.overview.title")}
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="gap-2">
                <CreditCard className="h-4 w-4" />
                {t("subscription.items")}
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-2">
                <UserCog className="h-4 w-4" />
                {t("companyAdmin.item")}
              </TabsTrigger>
              <TabsTrigger value="tokens" className="gap-2">
                <Key className="h-4 w-4" />
                {t("clientAdminToken.items")}
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {t("company.information")}
                </CardTitle>
                <CardDescription>
                  {t("company.detail.basicInfoDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{t("company.email")}</p>
                    <p className="font-medium truncate">{company.contactEmail || "-"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="p-2 rounded-full bg-green-500/10">
                    <Phone className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{t("company.phone")}</p>
                    <p className="font-medium">{company.contactPhone || "-"}</p>
                  </div>
                </div>

                {company.address && (
                  <div className="flex items-start gap-4 p-3 rounded-lg border">
                    <div className="p-2 rounded-full bg-purple-500/10">
                      <MapPin className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{t("company.address")}</p>
                      <p className="font-medium">{company.address}</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">{t("company.createdAt")}</p>
                    <p className="font-medium text-sm">{formatDate(company.createdTimestamp)}</p>
                  </div>
                  {company.updatedTimestamp && (
                    <div className="p-3 rounded-lg border">
                      <p className="text-xs text-muted-foreground">{t("company.updatedAt")}</p>
                      <p className="font-medium text-sm">{formatDate(company.updatedTimestamp)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Subscription */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {t("subscription.activeSubscription")}
                </CardTitle>
                <CardDescription>
                  {t("subscription.currentPlanDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeSubscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{activeSubscription.planName}</p>
                          <p className="text-xs text-muted-foreground">
                            {activeSubscription.amount} {activeSubscription.currency}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">
                        <CheckCircle2 className="h-3 w-3 me-1" />
                        {activeSubscription.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs text-muted-foreground">{t("subscription.startDate")}</p>
                        <p className="font-medium text-sm">
                          {formatDate(new Date(activeSubscription.startDateUtc))}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs text-muted-foreground">{t("subscription.expiryDate")}</p>
                        <p className="font-medium text-sm">
                          {activeSubscription.isLifetime 
                            ? t("subscription.lifetime") 
                            : formatDate(new Date(activeSubscription.expiryDateUtc))}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">{t("subscription.daysRemaining")}</p>
                        <p className="text-sm font-bold">
                          {activeSubscription.isLifetime ? "∞" : activeSubscription.daysRemaining}
                        </p>
                      </div>
                      {!activeSubscription.isLifetime && (
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (activeSubscription.daysRemaining / 365) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => router.push(`/subscriptions/${activeSubscription.id}`)}
                    >
                      <ExternalLink className="h-4 w-4 me-2" />
                      {t("common.viewDetails")}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground mb-4">
                      {t("subscription.noSubscriptions")}
                    </p>
                    <Button onClick={handleCreateSubscription}>
                      <Plus className="h-4 w-4 me-2" />
                      {t("subscription.create")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Analytics Section */}
          {subscriptions.length > 0 && (
            <CompanyAnalytics subscriptions={subscriptions} />
          )}
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t("subscription.items")}
                </CardTitle>
                <CardDescription>
                  {subscriptions.length} {t("subscription.total")}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <ExportHistoryButton
                  companyId={companyId}
                  companyName={company.name}
                  subscriptions={subscriptions}
                />
                <Button size="sm" onClick={handleCreateSubscription}>
                  <Plus className="h-4 w-4 me-2" />
                  {t("subscription.create")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {subscriptionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">{t("subscription.noSubscriptions")}</p>
                  <p className="text-muted-foreground mb-6">
                    {t("subscription.noSubscriptionsDescription")}
                  </p>
                  <Button onClick={handleCreateSubscription}>
                    <Plus className="h-4 w-4 me-2" />
                    {t("subscription.create")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {subscriptions.map((sub: any) => (
                    <Link
                      key={sub.id}
                      href={`/subscriptions/${sub.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${getStatusBgColor(sub.status)}`}>
                          {getStatusIcon(sub.status)}
                        </div>
                        <div>
                          <p className="font-medium group-hover:text-primary transition-colors">
                            {sub.planName || "Subscription"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {sub.amount} {sub.currency} • {sub.isLifetime ? t("subscription.lifetime") : `${sub.daysRemaining} ${t("subscription.daysRemaining")}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={getStatusVariant(sub.status)}>
                          {t(`subscription.statuses.${sub.status?.toLowerCase()}`)}
                        </Badge>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Tab */}
        <TabsContent value="admin" className="space-y-6">
          <CompanyAdminSection companyId={companyId} companyName={company.name} />
        </TabsContent>

        {/* Tokens Tab */}
        <TabsContent value="tokens" className="space-y-6">
          <ClientAdminTokens companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getStatusVariant(status: string): "default" | "destructive" | "secondary" | "outline" {
  switch (status?.toLowerCase()) {
    case "active":
    case "trial":
      return "default";
    case "expired":
    case "cancelled":
      return "destructive";
    case "suspended":
    case "paused":
      return "secondary";
    default:
      return "outline";
  }
}

function getStatusBgColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "active": return "bg-green-500/10";
    case "trial": return "bg-blue-500/10";
    case "expired": return "bg-red-500/10";
    case "cancelled": return "bg-gray-500/10";
    case "suspended": return "bg-orange-500/10";
    case "paused": return "bg-yellow-500/10";
    default: return "bg-gray-500/10";
  }
}

function getStatusIcon(status: string) {
  switch (status?.toLowerCase()) {
    case "active": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "trial": return <Clock className="h-5 w-5 text-blue-500" />;
    case "expired": return <AlertCircle className="h-5 w-5 text-red-500" />;
    case "cancelled": return <XCircle className="h-5 w-5 text-gray-500" />;
    case "suspended": return <Pause className="h-5 w-5 text-orange-500" />;
    case "paused": return <Pause className="h-5 w-5 text-yellow-500" />;
    default: return <CreditCard className="h-5 w-5 text-gray-500" />;
  }
}
