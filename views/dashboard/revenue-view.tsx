"use client";

import React from "react";
import { useRevenueViewModel } from "@/viewmodels/dashboard/revenue-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { CurrencySelector } from "@/components/dashboard/currency-selector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { GenericChart, GENERIC_COLORS } from "@/components/charts/generic-chart";
import { 
  RefreshCw, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Wallet,
  CreditCard,
  Receipt,
  TrendingUpIcon,
  Calculator,
  Layers,
  Award,
  Crown,
  Coins,
  Clock,
} from "lucide-react";

// ============================================================================
// Revenue KPI Cards - Professional Financial Metrics
// ============================================================================

function RevenueKpiCards({ dashboard }: { dashboard: any }) {
  const { t } = useI18n();
  
  const currencySymbol = dashboard?.displayCurrencySymbol || '$';
  
  const formatCurrency = (value: number) => {
    return `${currencySymbol}${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)}`;
  };

  const kpis = [
    {
      title: t('dashboard.revenueDashboard.mrr'),
      value: formatCurrency(dashboard.metrics?.mrr ?? 0),
      change: dashboard.metrics?.mrrChangePercentage ?? 0,
      direction: (dashboard.metrics?.mrrChangePercentage ?? 0) >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500',
    },
    {
      title: t('dashboard.revenueDashboard.arr'),
      value: formatCurrency(dashboard.metrics?.arr ?? 0),
      icon: Wallet,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
    },
    {
      title: t('dashboard.revenueDashboard.arpc'),
      value: formatCurrency(dashboard.metrics?.arpc ?? 0),
      subtitle: t('dashboard.revenueDashboard.perCompany'),
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-500',
    },
    {
      title: t('dashboard.revenueDashboard.activeCompanies'),
      value: dashboard.metrics?.activeCustomers ?? 0,
      icon: CreditCard,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="overflow-hidden border-0 shadow-lg">
          <div className={`h-1 bg-gradient-to-r ${kpi.color}`} />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">{kpi.title}</p>
                <p className="text-2xl font-bold tracking-tight">
                  {kpi.value}
                </p>
                {kpi.change !== undefined && (
                  <div className="flex items-center gap-1">
                    {kpi.direction === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : kpi.direction === 'down' ? (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    ) : null}
                    {kpi.change !== undefined && (
                      <span className={`text-sm font-medium ${
                        kpi.direction === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {kpi.change >= 0 ? '+' : ''}{kpi.change?.toFixed(1)}%
                      </span>
                    )}
                  </div>
                )}
                {kpi.subtitle && (
                  <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.textColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// Revenue by Plan - Horizontal Bar Chart
// ============================================================================

function RevenueByPlanChart({ byPlan, currencySymbol = '$' }: { byPlan: any; currencySymbol?: string }) {
  const { t } = useI18n();

  const plans = byPlan?.plans || [];
  const data = {
    labels: plans.map((p: any) => p.planName || p.name),
    datasets: [{
      label: t('dashboard.revenueDashboard.revenue'),
      data: plans.map((p: any) => p.monthlyRevenue || p.revenue || p.amount || 0),
      backgroundColor: GENERIC_COLORS.primary.slice(0, plans.length || 5),
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 8,
    }],
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              {t('dashboard.revenueDashboard.byPlan')}
            </CardTitle>
            <CardDescription>{t('dashboard.revenueDashboard.byPlanDesc')}</CardDescription>
          </div>
          {byPlan?.topRevenuePlanName && (
            <Badge className="bg-yellow-500/20 text-yellow-600 border-0">
              <Crown className="h-3 w-3 mr-1" />
              {t('dashboard.revenueDashboard.topPlan')}: {byPlan.topRevenuePlanName}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <GenericChart
            title=""
            description=""
            data={data}
            type="bar"
            height={300}
            exportable={false}
            filterable={false}
            resizable={false}
          />
        </div>
        
        {/* Plan Details */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6 pt-4 border-t">
          {plans.slice(0, 6).map((plan: any, index: number) => (
            <div key={index} className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: GENERIC_COLORS.primary[index % GENERIC_COLORS.primary.length] }}
                />
                <span className="text-sm font-medium truncate">{plan.planName || plan.name}</span>
              </div>
              <p className="text-lg font-bold text-green-500">
                {currencySymbol}{new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(plan.monthlyRevenue || plan.revenue || plan.amount || 0)}
              </p>
              <p className="text-xs text-muted-foreground">
                {plan.subscriptionCount || plan.count || 0} {t('dashboard.revenueDashboard.subscriptions')}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Revenue Trend - Area Chart
// ============================================================================

function RevenueTrendChart({ trend }: { trend: any[] }) {
  const { t } = useI18n();

  const data = {
    labels: trend?.map((d: any) => {
      const date = new Date(d.date || d.month);
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }) || [],
    datasets: [{
      label: t('dashboard.revenueDashboard.monthlyRevenue'),
      data: trend?.map((d: any) => d.revenue || d.amount || 0) || [],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.3)',
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 10,
      pointBackgroundColor: '#22c55e',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }],
  };

  // Calculate growth
  const currentRevenue = trend?.[trend.length - 1]?.revenue || 0;
  const previousRevenue = trend?.[trend.length - 2]?.revenue || 0;
  const growth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <LineChart className="h-5 w-5 text-green-500" />
              {t('dashboard.revenueDashboard.trend')}
            </CardTitle>
            <CardDescription>{t('dashboard.revenueDashboard.trendDesc')}</CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              {growth >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <span className={`text-xl font-bold ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{t('dashboard.revenueDashboard.vsLastMonth')}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <GenericChart
            title=""
            description=""
            data={data}
            type="line"
            height={320}
            exportable={false}
            filterable={false}
            resizable={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Revenue Projections
// ============================================================================

function RevenueProjectionsSection({ projections, currencySymbol = '$' }: { projections: any; currencySymbol?: string }) {
  const { t } = useI18n();

  const formatCurrency = (value: number) => {
    return `${currencySymbol}${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
    }).format(value || 0)}`;
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calculator className="h-5 w-5 text-purple-500" />
          {t('dashboard.revenueDashboard.projections')}
        </CardTitle>
        <CardDescription>{t('dashboard.revenueDashboard.projectionsDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Next Month MRR */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">{t('dashboard.revenueDashboard.nextMonthMrr')}</span>
            </div>
            <p className="text-3xl font-bold text-green-500">
              {formatCurrency(projections?.projectedNextMonthMRR ?? 0)}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {(projections?.projectedNextMonthChange ?? 0) >= 0 ? '+' : ''}{(((projections?.projectedNextMonthChange ?? 0) / ((projections?.projectedNextMonthMRR ?? 1) - (projections?.projectedNextMonthChange ?? 0))) * 100).toFixed(1)}% projected
              </Badge>
            </div>
          </div>

          {/* Expected Renewals */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">{t('dashboard.revenueDashboard.expectedRenewals')}</span>
            </div>
            <p className="text-3xl font-bold text-blue-500">
              {projections?.expectedRenewals ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {t('dashboard.revenueDashboard.subscriptionsToRenew')}
            </p>
          </div>

          {/* At Risk Revenue */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">{t('dashboard.revenueDashboard.atRiskRevenue')}</span>
            </div>
            <p className="text-3xl font-bold text-red-500">
              {formatCurrency(projections?.atRiskRevenue ?? 0)}
            </p>
            <div className="mt-2">
              <Badge variant="destructive" className="text-xs">
                {projections?.atRiskSubscriptions ?? 0} {t('dashboard.revenueDashboard.atRiskSubs')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Confidence Meter */}
        {projections?.confidenceLevel && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('dashboard.revenueDashboard.projectionConfidence')}</span>
              <span className="text-sm font-bold">{projections.confidenceLevel}%</span>
            </div>
            <Progress value={projections.confidenceLevel} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {t('dashboard.revenueDashboard.confidenceNote')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Revenue Breakdown - Pie Chart
// ============================================================================

function RevenueBreakdownChart({ breakdown, currencySymbol = '$' }: { breakdown: any; currencySymbol?: string }) {
  const { t } = useI18n();

  // Get the latest trend data point for breakdown
  const latestTrend = breakdown?.trend?.dataPoints?.[breakdown?.trend?.dataPoints?.length - 1] || {};
  
  const categories = [
    { name: t('dashboard.revenueDashboard.newSubscriptions'), value: latestTrend?.newRevenue ?? 0 },
    { name: t('dashboard.revenueDashboard.renewals'), value: latestTrend?.recurringRevenue ?? 0 },
    { name: t('dashboard.revenueDashboard.upgrades'), value: 0 }, // Not tracked separately in API
  ];

  const data = {
    labels: categories.map((c: any) => c.name || c.category),
    datasets: [{
      data: categories.map((c: any) => c.value || c.amount || 0),
      backgroundColor: ['#22c55e', '#3b82f6', '#a855f7', '#f97316'],
      borderColor: 'transparent',
      borderWidth: 0,
      hoverOffset: 15,
    }],
  };

  const total = categories.reduce((sum: number, c: any) => sum + (c.value || c.amount || 0), 0);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <PieChart className="h-5 w-5 text-purple-500" />
          {t('dashboard.revenueDashboard.breakdown')}
        </CardTitle>
        <CardDescription>{t('dashboard.revenueDashboard.breakdownDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="w-full lg:w-1/2 h-[280px]">
            <GenericChart
              title=""
              description=""
              data={data}
              type="doughnut"
              height={280}
              exportable={false}
              filterable={false}
              resizable={false}
            />
          </div>
          <div className="w-full lg:w-1/2 space-y-4">
            {categories.map((cat: any, index: number) => {
              const value = cat.value || cat.amount || 0;
              const percentage = total > 0 ? (value / total) * 100 : 0;
              const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500'];
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                      <span className="text-sm font-medium">{cat.name || cat.category}</span>
                    </div>
                    <span className="font-bold">
                      {currencySymbol}{new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(value)}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-1.5" />
                </div>
              );
            })}
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('dashboard.revenueDashboard.totalRevenue')}</span>
                <span className="text-xl font-bold text-green-500">
                  {currencySymbol}{new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function RevenueSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6"><Skeleton className="h-[350px]" /></CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6"><Skeleton className="h-[350px]" /></CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Main View
// ============================================================================

export function RevenueView() {
  const { 
    dashboard, 
    isLoading, 
    error, 
    refresh, 
    formattedLastUpdate,
    formattedRatesUpdate,
  } = useRevenueViewModel();
  const { t } = useI18n();


  if (error) {
    return (
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-lg font-medium mb-2">{t('dashboard.error')}</p>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('common.retry')}
          </Button>
        </div>
      </Card>
    );
  }

  if (isLoading || !dashboard) {
    return <RevenueSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.revenueDashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.revenueDashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Currency Selector */}
          <CurrencySelector />
          
          <Badge variant="outline" className="text-xs">
            <Award className="h-3 w-3 mr-1" />
            {t('dashboard.revenueDashboard.superAdminOnly')}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {t('dashboard.lastUpdated')}: {formattedLastUpdate}
          </span>
          <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t('common.refresh')}
          </Button>
        </div>
      </div>
      
      {/* Exchange Rate Info Banner */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg text-sm">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {t('dashboard.revenueDashboard.ratesFrom')}: {formattedRatesUpdate}
        </span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {t('dashboard.revenueDashboard.displayingIn')} {dashboard.displayCurrency} ({dashboard.displayCurrencySymbol})
        </Badge>
      </div>

      {/* KPI Cards */}
      <RevenueKpiCards dashboard={dashboard} />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueByPlanChart byPlan={dashboard.byPlan} currencySymbol={dashboard.displayCurrencySymbol} />
        <RevenueTrendChart trend={dashboard.trend?.dataPoints} />
      </div>

      {/* Projections */}
      <RevenueProjectionsSection projections={dashboard.projections} currencySymbol={dashboard.displayCurrencySymbol} />

      {/* Revenue Breakdown */}
      <RevenueBreakdownChart breakdown={dashboard} currencySymbol={dashboard.displayCurrencySymbol} />
    </div>
  );
}
