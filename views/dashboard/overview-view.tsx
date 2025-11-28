"use client";

import React from "react";
import { useOverviewViewModel } from "@/viewmodels/dashboard/overview-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  RefreshCw, 
  Building2, 
  CreditCard, 
  DollarSign, 
  Bell,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Clock,
  Users,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { KpiCard, QuickStats, DistributionItem, TimeSeriesDataPoint, RecentActivityItem } from "@/domain";
import { Building2 as Building2Icon, CreditCard as CreditCardIcon, User, Package, FolderOpen, Box, Activity as ActivityIcon } from "lucide-react";

// KPI Card Component
function KpiCardComponent({ kpi, icon: Icon }: { kpi: KpiCard; icon: React.ElementType }) {
  const getChangeIcon = () => {
    switch (kpi.changeDirection) {
      case 'up': return <TrendingUp className="h-3 w-3" />;
      case 'down': return <TrendingDown className="h-3 w-3" />;
      default: return <Minus className="h-3 w-3" />;
    }
  };

  const getChangeVariant = (): "success" | "error" | "secondary" => {
    switch (kpi.changeDirection) {
      case 'up': return 'success';
      case 'down': return 'error';
      default: return 'secondary';
    }
  };

  // Map color names to proper CSS colors
  const getIconColor = () => {
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      green: '#22c55e',
      purple: '#a855f7',
      yellow: '#eab308',
      red: '#ef4444',
      orange: '#f97316',
    };
    return colorMap[kpi.color.toLowerCase()] || kpi.color;
  };

  const iconColor = getIconColor();

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
            <p className="text-3xl font-bold">{kpi.formattedValue}</p>
            {kpi.hasChange && (
              <Badge variant={getChangeVariant()} className="gap-1">
                {getChangeIcon()}
                <span>{kpi.formattedChange}</span>
              </Badge>
            )}
          </div>
          <div 
            className="p-3 rounded-full" 
            style={{ backgroundColor: `${iconColor}20` }}
          >
            <Icon className="h-6 w-6" style={{ color: iconColor }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Stats Component
function QuickStatsComponent({ stats }: { stats: QuickStats }) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('dashboard.quickStats.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Companies Stats */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t('dashboard.quickStats.totalCompanies')}</p>
            <p className="text-xl font-semibold">{stats.totalCompanies}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t('dashboard.quickStats.activeCompanies')}</p>
            <p className="text-xl font-semibold text-green-600">{stats.activeCompanies}</p>
          </div>
          
          {/* Subscriptions Stats */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t('dashboard.quickStats.activeSubscriptions')}</p>
            <p className="text-xl font-semibold text-blue-600">{stats.activeSubscriptions}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t('dashboard.quickStats.trialSubscriptions')}</p>
            <p className="text-xl font-semibold text-purple-600">{stats.trialSubscriptions}</p>
          </div>

          {/* Expiring Stats */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t('dashboard.quickStats.expiringToday')}</p>
            <p className={`text-xl font-semibold ${stats.expiringToday > 0 ? 'text-red-600' : ''}`}>
              {stats.expiringToday}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t('dashboard.quickStats.expiringThisWeek')}</p>
            <p className={`text-xl font-semibold ${stats.expiringThisWeek > 0 ? 'text-orange-600' : ''}`}>
              {stats.expiringThisWeek}
            </p>
          </div>

          {/* Admin Stats */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t('dashboard.quickStats.totalAdmins')}</p>
            <p className="text-xl font-semibold">{stats.totalAdmins}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t('dashboard.quickStats.activeAdmins')}</p>
            <p className="text-xl font-semibold text-green-600">{stats.activeAdmins}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Status Distribution Component
function StatusDistributionComponent({ items }: { items: DistributionItem[] }) {
  const { t } = useI18n();
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('dashboard.charts.subscriptionStatus')}</CardTitle>
        <CardDescription>{t('dashboard.charts.subscriptionStatusDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="h-4 rounded-full overflow-hidden flex mb-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="h-full transition-all"
              style={{ 
                width: `${item.percentage}%`, 
                backgroundColor: item.color 
              }}
            />
          ))}
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium ml-auto">{item.count}</span>
              <span className="text-xs text-muted-foreground">({item.formattedPercentage})</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Alerts Summary Component
function AlertsSummaryComponent({ stats }: { stats: QuickStats }) {
  const { t } = useI18n();
  
  const alerts = [
    { 
      label: t('dashboard.quickStats.expiringToday'), 
      count: stats.expiringToday, 
      priority: 'critical' as const,
      variant: 'error' as const,
      description: t('dashboard.subscriptions'),
    },
    { 
      label: t('dashboard.quickStats.expiringThisWeek'), 
      count: stats.expiringThisWeek, 
      priority: 'high' as const,
      variant: 'warning' as const,
      description: t('dashboard.subscriptions'),
    },
    { 
      label: t('dashboard.quickStats.expiringThisMonth'), 
      count: stats.expiringThisMonth, 
      priority: 'medium' as const,
      variant: 'pending' as const,
      description: t('dashboard.subscriptions'),
    },
    { 
      label: t('dashboard.quickStats.companiesWithoutSub'), 
      count: stats.companiesWithoutSub, 
      priority: 'low' as const,
      variant: 'info' as const,
      description: t('dashboard.companies'),
    },
  ];

  const hasUrgentAlerts = stats.expiringToday > 0;

  return (
    <Card className={hasUrgentAlerts ? 'border-red-500/50 dark:border-red-500/30' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{t('dashboard.systemAlerts')}</CardTitle>
            {hasUrgentAlerts && (
              <Badge variant="error" className="animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {t('dashboard.priority.critical')}
              </Badge>
            )}
          </div>
          <Badge variant="secondary">{stats.totalExpiring} {t('dashboard.total')}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant={alert.variant} className="w-2 h-2 p-0 rounded-full" />
                <span className="text-sm">{alert.label}</span>
              </div>
              <Badge variant={alert.count > 0 ? alert.variant : "secondary"}>
                {alert.count}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Growth Trends Chart Component
function GrowthTrendsChart({ data }: { data: TimeSeriesDataPoint[] }) {
  const { t } = useI18n();
  const [mounted, setMounted] = React.useState(false);

  // Fix hydration issue with recharts
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Transform data for chart - show last 14 days for better readability
  const chartData = data.slice(-14).map(point => ({
    date: point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: point.value,
    label: point.label,
  }));

  // Calculate max value for Y axis
  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('dashboard.charts.growthTrends')}</CardTitle>
          <CardDescription>{t('dashboard.charts.growthTrendsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('dashboard.charts.growthTrends')}</CardTitle>
        <CardDescription>{t('dashboard.charts.growthTrendsDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
                stroke="#374151"
                opacity={0.3}
              />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={[0, maxValue + 1]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb',
                }}
                labelStyle={{ color: '#f9fafb' }}
                formatter={(value: number) => [value, t('dashboard.companies')]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#growthGradient)"
                dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>{data.length} {t('dashboard.timeSeries.dataPoints')}</span>
          <span>{t('dashboard.timeSeries.last30Days')}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Activity Component
function RecentActivityComponent({ activities }: { activities: RecentActivityItem[] }) {
  const { t } = useI18n();

  const getIconForEntityType = (entityType: string) => {
    switch (entityType) {
      case 'Company': return Building2Icon;
      case 'Subscription': return CreditCardIcon;
      case 'Admin': return User;
      case 'Plan': return Package;
      case 'Project': return FolderOpen;
      case 'Module': return Box;
      default: return ActivityIcon;
    }
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('dashboard.recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ActivityIcon className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">{t('dashboard.noRecentActivity')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('dashboard.recentActivity')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getIconForEntityType(activity.entityType);
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div 
                  className="p-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `${activity.color}20` }}
                >
                  <Icon className="h-4 w-4" style={{ color: activity.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    <span className="text-primary">{activity.performedBy}</span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {activity.timeAgo}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Skeleton
function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Overview View
export function OverviewView() {
  const { dashboard, isLoading, error, refresh, formattedLastUpdate } = useOverviewViewModel();
  const { t } = useI18n();

  const getKpiIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('compan')) return Building2;
    if (lower.includes('subscription')) return CreditCard;
    if (lower.includes('mrr') || lower.includes('revenue')) return DollarSign;
    if (lower.includes('alert')) return Bell;
    return Activity;
  };

  if (error && !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-medium text-red-600">{error}</p>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('dashboard.retry')}
        </Button>
      </div>
    );
  }

  if (isLoading && !dashboard) {
    return <OverviewSkeleton />;
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.pages.overview')}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-3 w-3" />
            {t('dashboard.lastUpdated')}: {formattedLastUpdate}
          </p>
        </div>
        <Button 
          onClick={refresh} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {t('dashboard.refresh')}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboard.kpiCards.map((kpi, index) => (
          <KpiCardComponent 
            key={index} 
            kpi={kpi} 
            icon={getKpiIcon(kpi.title)} 
          />
        ))}
      </div>

      {/* Quick Stats */}
      <QuickStatsComponent stats={dashboard.stats} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistributionComponent items={dashboard.subscriptionStatusDistribution} />
        <AlertsSummaryComponent stats={dashboard.stats} />
      </div>

      {/* Growth Trend & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dashboard.growthTrend.length > 0 && (
          <GrowthTrendsChart data={dashboard.growthTrend} />
        )}
        <RecentActivityComponent activities={dashboard.recentActivity} />
      </div>
    </div>
  );
}
