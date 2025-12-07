"use client";

import React from "react";
import { useSubscriptionsViewModel } from "@/viewmodels/dashboard/subscriptions-viewmodel";
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
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Activity,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Shield,
  Play,
  Pause,
  XCircle,
  RotateCcw,
  Timer,
  CalendarClock,
  Layers,
} from "lucide-react";

// ============================================================================
// KPI Cards
// ============================================================================

function SubscriptionKpiCards({ dashboard }: { dashboard: any }) {
  const { t } = useI18n();
  
  const kpis = [
    {
      title: t('dashboard.subscriptionsDashboard.total'),
      value: dashboard.totalSubscriptions ?? 0,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
    },
    {
      title: t('dashboard.subscriptionsDashboard.active'),
      value: dashboard.activeSubscriptions ?? 0,
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500',
    },
    {
      title: t('dashboard.subscriptionsDashboard.mrr'),
      value: dashboard.formattedTotalMonthlyRevenue ?? 'EGP 0',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-500',
      isCurrency: true,
    },
    {
      title: t('dashboard.subscriptionsDashboard.expiringThisMonth'),
      value: dashboard.expiryTimeline?.expiringThisMonthValue ?? 0,
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-500',
      urgent: (dashboard.expiryTimeline?.expiringTodayValue ?? 0) > 0,
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
                <p className={`text-3xl font-bold tracking-tight ${kpi.urgent ? 'text-red-500' : ''}`}>
                  {kpi.value}
                </p>
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
// Subscription Status Distribution - Doughnut Chart
// ============================================================================

function StatusDistributionChart({ distribution }: { distribution: any }) {
  const { t } = useI18n();
  
  const data = {
    labels: [
      t('dashboard.subscriptionsDashboard.active'),
      t('dashboard.subscriptionsDashboard.trial'),
      t('dashboard.subscriptionsDashboard.expired'),
      t('dashboard.subscriptionsDashboard.suspended'),
      t('dashboard.subscriptionsDashboard.paused'),
      t('dashboard.subscriptionsDashboard.cancelled'),
    ],
    datasets: [{
      data: [
        distribution?.active ?? 0,
        distribution?.trial ?? 0,
        distribution?.expired ?? 0,
        distribution?.suspended ?? 0,
        distribution?.paused ?? 0,
        distribution?.cancelled ?? 0,
      ],
      backgroundColor: ['#22c55e', '#3b82f6', '#f97316', '#ef4444', '#eab308', '#6b7280'],
      borderColor: 'transparent',
      borderWidth: 0,
      hoverOffset: 15,
    }],
  };

  // Use the total from the distribution object directly, or calculate from status counts only
  const total = distribution?.total ?? (
    (distribution?.active ?? 0) +
    (distribution?.trial ?? 0) +
    (distribution?.expired ?? 0) +
    (distribution?.suspended ?? 0) +
    (distribution?.paused ?? 0) +
    (distribution?.cancelled ?? 0)
  );

  const items = [
    { name: t('dashboard.subscriptionsDashboard.active'), value: distribution?.active ?? 0, color: 'bg-green-500', icon: CheckCircle2 },
    { name: t('dashboard.subscriptionsDashboard.trial'), value: distribution?.trial ?? 0, color: 'bg-blue-500', icon: Zap },
    { name: t('dashboard.subscriptionsDashboard.expired'), value: distribution?.expired ?? 0, color: 'bg-orange-500', icon: Clock },
    { name: t('dashboard.subscriptionsDashboard.suspended'), value: distribution?.suspended ?? 0, color: 'bg-red-500', icon: Shield },
    { name: t('dashboard.subscriptionsDashboard.paused'), value: distribution?.paused ?? 0, color: 'bg-yellow-500', icon: Pause },
    { name: t('dashboard.subscriptionsDashboard.cancelled'), value: distribution?.cancelled ?? 0, color: 'bg-gray-500', icon: XCircle },
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <PieChart className="h-5 w-5 text-purple-500" />
          {t('dashboard.subscriptionsDashboard.statusDistribution')}
        </CardTitle>
        <CardDescription>{t('dashboard.subscriptionsDashboard.statusDistributionDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="w-full lg:w-1/2 h-[320px]">
            <GenericChart
              title=""
              description=""
              data={data}
              type="doughnut"
              height={320}
              exportable={false}
              filterable={false}
              resizable={false}
            />
          </div>
          <div className="w-full lg:w-1/2 space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{item.value}</span>
                  <Badge variant="secondary" className="text-xs">
                    {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Subscriptions by Plan - Bar Chart
// ============================================================================

function SubscriptionsByPlanChart({ planData }: { planData: any[] }) {
  const { t } = useI18n();

  const data = {
    labels: planData?.map(p => p.planName || p.name) || [],
    datasets: [{
      label: t('dashboard.subscriptionsDashboard.subscriptions'),
      // Backend sends totalCount, activeCount - use totalCount for the chart
      data: planData?.map(p => p.totalCount || p.activeCount || p.count || p.subscriptionCount || 0) || [],
      backgroundColor: planData?.map(p => p.color) || GENERIC_COLORS.primary.slice(0, planData?.length || 5),
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 8,
    }],
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          {t('dashboard.subscriptionsDashboard.byPlan')}
        </CardTitle>
        <CardDescription>{t('dashboard.subscriptionsDashboard.byPlanDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <GenericChart
            title=""
            description=""
            data={data}
            type="bar"
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
// Expiry Timeline - Stacked Bar or Cards
// ============================================================================

function ExpiryTimelineSection({ timeline }: { timeline: any }) {
  const { t } = useI18n();

  const timeframes = [
    {
      label: t('dashboard.subscriptionsDashboard.expiringToday'),
      value: timeline?.expiringTodayValue ?? 0,
      color: 'bg-red-500',
      textColor: 'text-red-500',
      bgColor: 'bg-red-500/10',
      icon: AlertTriangle,
      urgent: true,
    },
    {
      label: t('dashboard.subscriptionsDashboard.expiringThisWeek'),
      value: timeline?.expiringThisWeekValue ?? 0,
      color: 'bg-orange-500',
      textColor: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      icon: CalendarClock,
    },
    {
      label: t('dashboard.subscriptionsDashboard.expiringThisMonth'),
      value: timeline?.expiringThisMonthValue ?? 0,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      icon: Calendar,
    },
    {
      label: t('dashboard.subscriptionsDashboard.expiringNext3Months'),
      value: timeline?.expiringNext3MonthsValue ?? 0,
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      icon: Timer,
    },
  ];

  const chartData = {
    labels: timeframes.map(t => t.label),
    datasets: [{
      label: t('dashboard.subscriptionsDashboard.subscriptions'),
      data: timeframes.map(t => t.value),
      backgroundColor: ['#ef4444', '#f97316', '#eab308', '#3b82f6'],
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 8,
    }],
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-orange-500" />
          {t('dashboard.subscriptionsDashboard.expiryTimeline')}
        </CardTitle>
        <CardDescription>{t('dashboard.subscriptionsDashboard.expiryTimelineDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {timeframes.map((tf, index) => (
            <div key={index} className={`p-4 rounded-xl ${tf.bgColor} transition-all hover:scale-105`}>
              <tf.icon className={`h-6 w-6 ${tf.textColor} mb-2`} />
              <p className={`text-3xl font-bold ${tf.urgent ? 'text-red-500' : ''}`}>{tf.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{tf.label}</p>
            </div>
          ))}
        </div>
        <div className="h-[200px]">
          <GenericChart
            title=""
            description=""
            data={chartData}
            type="bar"
            height={200}
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
// Lifecycle Metrics
// ============================================================================

function LifecycleMetricsSection({ metrics }: { metrics: any }) {
  const { t } = useI18n();

  const lifecycleData = [
    { label: t('dashboard.subscriptionsDashboard.renewals'), value: metrics?.renewals ?? 0, icon: RotateCcw, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { label: t('dashboard.subscriptionsDashboard.upgrades'), value: metrics?.upgrades ?? 0, icon: TrendingUp, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: t('dashboard.subscriptionsDashboard.downgrades'), value: metrics?.downgrades ?? 0, icon: TrendingDown, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    { label: t('dashboard.subscriptionsDashboard.cancellations'), value: metrics?.cancellations ?? 0, icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    { label: t('dashboard.subscriptionsDashboard.reactivations'), value: metrics?.reactivations ?? 0, icon: Play, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { label: t('dashboard.subscriptionsDashboard.extensions'), value: metrics?.extensions ?? 0, icon: Timer, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  ];

  const chartData = {
    labels: lifecycleData.map(d => d.label),
    datasets: [{
      label: t('dashboard.subscriptionsDashboard.operations'),
      data: lifecycleData.map(d => d.value),
      backgroundColor: ['#22c55e', '#3b82f6', '#f97316', '#ef4444', '#a855f7', '#06b6d4'],
      borderColor: 'transparent',
      borderWidth: 0,
    }],
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Layers className="h-5 w-5 text-purple-500" />
          {t('dashboard.subscriptionsDashboard.lifecycleMetrics')}
        </CardTitle>
        <CardDescription>{t('dashboard.subscriptionsDashboard.lifecycleMetricsDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {lifecycleData.map((item, index) => (
            <div key={index} className={`p-4 rounded-xl ${item.bgColor} flex items-center gap-3`}>
              <item.icon className={`h-8 w-8 ${item.color}`} />
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="h-[250px]">
          <GenericChart
            title=""
            description=""
            data={chartData}
            type="doughnut"
            height={250}
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
// Loading Skeleton
// ============================================================================

function SubscriptionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-20" />
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

export function SubscriptionsView() {
  const { dashboard, isLoading, error, refresh, formattedLastUpdate } = useSubscriptionsViewModel();
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
    return <SubscriptionsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.subscriptionsDashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.subscriptionsDashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <CurrencySelector />
          <span className="text-xs text-muted-foreground">
            {t('dashboard.lastUpdated')}: {formattedLastUpdate}
          </span>
          <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <SubscriptionKpiCards dashboard={dashboard} />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistributionChart distribution={dashboard.statusDistribution} />
        <SubscriptionsByPlanChart planData={dashboard.byPlan?.plans} />
      </div>

      {/* Expiry Timeline */}
      <ExpiryTimelineSection timeline={dashboard.expiryTimeline} />

      {/* Lifecycle Metrics */}
      <LifecycleMetricsSection metrics={dashboard.lifecycleMetrics} />
    </div>
  );
}
