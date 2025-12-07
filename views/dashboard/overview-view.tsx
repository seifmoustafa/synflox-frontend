"use client";

import React from "react";
import { useOverviewViewModel } from "@/viewmodels/dashboard/overview-viewmodel";
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
  Building2, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Calendar,
  DollarSign,
  Activity,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Shield,
  FileKey,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react";

// ============================================================================
// KPI Cards Section - Professional Metrics Display
// ============================================================================

function KpiCardsSection({ dashboard }: { dashboard: any }) {
  const { t } = useI18n();
  
  const kpiCards = [
    {
      title: t('dashboard.overview.totalCompanies'),
      value: dashboard.companiesKpi?.value ?? 0,
      change: dashboard.companiesKpi?.changePercentage ?? 0,
      direction: dashboard.companiesKpi?.changeDirection ?? 'unchanged',
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
    },
    {
      title: t('dashboard.overview.activeSubscriptions'),
      value: dashboard.subscriptionsKpi?.value ?? 0,
      change: dashboard.subscriptionsKpi?.changePercentage ?? 0,
      direction: dashboard.subscriptionsKpi?.changeDirection ?? 'unchanged',
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500',
    },
    {
      title: t('dashboard.overview.monthlyRevenue'),
      value: dashboard.revenueKpi?.value ?? 0,
      change: dashboard.revenueKpi?.changePercentage ?? 0,
      direction: dashboard.revenueKpi?.changeDirection ?? 'unchanged',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-500',
      isCurrency: true,
      currencySymbol: dashboard.revenueKpi?.currencySymbol ?? '$',
    },
    {
      title: t('dashboard.overview.activeAlerts'),
      value: dashboard.alertsKpi?.value ?? 0,
      change: dashboard.alertsKpi?.changePercentage ?? 0,
      direction: dashboard.alertsKpi?.changeDirection ?? 'unchanged',
      icon: Bell,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-500',
    },
  ];

  const formatValue = (value: number, isCurrency?: boolean, currencySymbol?: string) => {
    if (isCurrency) {
      const symbol = currencySymbol || '$';
      return `${symbol}${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)}`;
    }
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiCards.map((kpi, index) => (
        <Card key={index} className="overflow-hidden border-0 shadow-lg">
          <div className={`h-1 bg-gradient-to-r ${kpi.color}`} />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">{kpi.title}</p>
                <p className="text-3xl font-bold tracking-tight">
                  {formatValue(kpi.value, kpi.isCurrency, kpi.currencySymbol)}
                </p>
                <div className="flex items-center gap-1">
                  {kpi.direction === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : kpi.direction === 'down' ? (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={`text-sm font-medium ${
                    kpi.direction === 'up' ? 'text-green-500' : 
                    kpi.direction === 'down' ? 'text-red-500' : 
                    'text-muted-foreground'
                  }`}>
                    {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">{t('dashboard.overview.vsLastMonth')}</span>
                </div>
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

function SubscriptionDistributionChart({ distribution }: { distribution: any[] }) {
  const { t } = useI18n();

  // Helper to translate status labels from backend
  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'Active': t('dashboard.overview.active'),
      'Trial': t('dashboard.overview.trial'),
      'Expired': t('dashboard.overview.expired'),
      'Suspended': t('dashboard.overview.suspended'),
    };
    return statusMap[status] || status;
  };

  const chartData = {
    labels: distribution?.map(d => translateStatus(d.label || d.name)) || [
      t('dashboard.overview.active'),
      t('dashboard.overview.trial'),
      t('dashboard.overview.expired'),
      t('dashboard.overview.suspended')
    ],
    datasets: [{
      data: distribution?.map(d => d.value || d.count) || [0, 0, 0, 0],
      backgroundColor: [
        '#22c55e', // Green - Active
        '#3b82f6', // Blue - Trial
        '#f97316', // Orange - Expired  
        '#ef4444', // Red - Suspended
      ],
      borderColor: 'transparent',
      borderWidth: 0,
      hoverOffset: 10,
    }],
  };

  const total = distribution?.reduce((sum, d) => sum + (d.value || d.count || 0), 0) || 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              {t('dashboard.overview.subscriptionStatus')}
            </CardTitle>
            <CardDescription>{t('dashboard.overview.subscriptionStatusDesc')}</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {total} {t('dashboard.overview.total')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="w-full lg:w-1/2 h-[250px]">
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
          <div className="w-full lg:w-1/2 space-y-3">
            {distribution?.map((item, index) => {
              const colors = ['bg-green-500', 'bg-blue-500', 'bg-orange-500', 'bg-red-500'];
              const value = item.value || item.count || 0;
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                    <span className="text-sm font-medium">{translateStatus(item.label || item.name)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">{value}</span>
                    <Badge variant="secondary" className="text-xs">
                      {percentage}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Growth Trend Chart - Area Chart
// ============================================================================

function GrowthTrendChart({ growthData }: { growthData: any[] }) {
  const { t } = useI18n();

  const chartData = {
    labels: growthData?.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [
      {
        label: t('dashboard.overview.companies'),
        // Use ?? instead of || to preserve 0 values
        data: growthData?.map(d => d.companies ?? 0) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: t('dashboard.overview.subscriptions'),
        data: growthData?.map(d => d.subscriptions ?? 0) || [],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-500" />
              {t('dashboard.overview.growthTrend')}
            </CardTitle>
            <CardDescription>{t('dashboard.overview.last30Days')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <GenericChart
            title=""
            description=""
            data={chartData}
            type="line"
            height={300}
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
// Quick Stats Grid - Detailed Metrics
// ============================================================================

function QuickStatsGrid({ stats }: { stats: any }) {
  const { t } = useI18n();

  const statGroups = [
    {
      title: t('dashboard.overview.companiesOverview'),
      icon: Building2,
      color: 'text-blue-500',
      items: [
        { label: t('dashboard.overview.totalCompanies'), value: stats?.totalCompanies ?? 0 },
        { label: t('dashboard.overview.activeCompanies'), value: stats?.activeCompanies ?? 0 },
        { label: t('dashboard.overview.inactiveCompanies'), value: stats?.inactiveCompanies ?? 0 },
        { label: t('dashboard.overview.withoutSubscription'), value: stats?.companiesWithoutSub ?? 0 },
      ],
    },
    {
      title: t('dashboard.overview.subscriptionsOverview'),
      icon: Calendar,
      color: 'text-green-500',
      items: [
        { label: t('dashboard.overview.total'), value: stats?.totalSubscriptions ?? 0 },
        { label: t('dashboard.overview.active'), value: stats?.activeSubscriptions ?? 0 },
        { label: t('dashboard.overview.trial'), value: stats?.trialSubscriptions ?? 0 },
        { label: t('dashboard.overview.suspended'), value: stats?.suspendedSubscriptions ?? 0 },
      ],
    },
    {
      title: t('dashboard.overview.expiringSoon'),
      icon: AlertTriangle,
      color: 'text-orange-500',
      items: [
        { label: t('dashboard.overview.today'), value: stats?.expiringToday ?? 0, urgent: true },
        { label: t('dashboard.overview.thisWeek'), value: stats?.expiringThisWeek ?? 0 },
        { label: t('dashboard.overview.thisMonth'), value: stats?.expiringThisMonth ?? 0 },
        { label: t('dashboard.overview.expired'), value: stats?.expiredSubscriptions ?? 0 },
      ],
    },
    {
      title: t('dashboard.overview.systemHealth'),
      icon: Activity,
      color: 'text-purple-500',
      items: [
        { label: t('dashboard.overview.totalAdmins'), value: stats?.totalAdmins ?? 0 },
        { label: t('dashboard.overview.activeAdmins'), value: stats?.activeAdmins ?? 0 },
        { label: t('dashboard.overview.companyGrowth'), value: `${(stats?.companyGrowthRate ?? 0).toFixed(1)}%`, isPercent: true },
        { label: t('dashboard.overview.subGrowth'), value: `${(stats?.subscriptionGrowthRate ?? 0).toFixed(1)}%`, isPercent: true },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statGroups.map((group, groupIndex) => (
        <Card key={groupIndex} className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <group.icon className={`h-4 w-4 ${group.color}`} />
              {group.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {group.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={`font-semibold ${(item as any).urgent ? 'text-red-500' : ''}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// Recent Activity Timeline
// ============================================================================

function RecentActivitySection({ activities }: { activities: any[] }) {
  const { t } = useI18n();

  const getActivityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'created': return CheckCircle2;
      case 'updated': return RefreshCw;
      case 'deleted': return XCircle;
      case 'activated': return Zap;
      case 'suspended': return Shield;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'created': return 'text-green-500 bg-green-500/10';
      case 'updated': return 'text-blue-500 bg-blue-500/10';
      case 'deleted': return 'text-red-500 bg-red-500/10';
      case 'activated': return 'text-purple-500 bg-purple-500/10';
      case 'suspended': return 'text-orange-500 bg-orange-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              {t('dashboard.overview.recentActivity')}
            </CardTitle>
            <CardDescription>{t('dashboard.overview.latestActions')}</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            {t('dashboard.overview.viewAll')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(activities || []).slice(0, 8).map((activity, index) => {
            const Icon = getActivityIcon(activity.actionType);
            const colorClass = getActivityColor(activity.actionType);
            return (
              <div key={activity.id || index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`p-2 rounded-full ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {activity.description || `${activity.actionType} ${activity.entityType}`}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{activity.performedBy}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{activity.timeAgo}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {activity.entityType}
                </Badge>
              </div>
            );
          })}
          {(!activities || activities.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>{t('dashboard.overview.noActivity')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6"><Skeleton className="h-[300px]" /></CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6"><Skeleton className="h-[300px]" /></CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Main View
// ============================================================================

export function OverviewView() {
  const { dashboard, isLoading, error, refresh, formattedLastUpdate } = useOverviewViewModel();
  const { t } = useI18n();

  if (error) {
    return (
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-lg font-medium mb-2">{t('dashboard.error')}</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('common.retry')}
          </Button>
        </div>
      </Card>
    );
  }

  if (isLoading || !dashboard) {
    return <OverviewSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.overview.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.overview.subtitle')}</p>
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
      <KpiCardsSection dashboard={dashboard} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubscriptionDistributionChart distribution={dashboard.subscriptionStatusDistribution} />
        <GrowthTrendChart growthData={dashboard.growthTrend} />
      </div>

      {/* Quick Stats */}
      <QuickStatsGrid stats={dashboard.stats} />

      {/* Recent Activity */}
      <RecentActivitySection activities={dashboard.recentActivity} />
    </div>
  );
}
