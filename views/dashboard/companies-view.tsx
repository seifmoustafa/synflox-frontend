"use client";

import React from "react";
import { useCompaniesViewModel } from "@/viewmodels/dashboard/companies-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
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
  ArrowUpRight,
  Crown,
  MapPin,
  Activity,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  AlertCircle,
  Star,
} from "lucide-react";

// ============================================================================
// Summary KPI Cards
// ============================================================================

function CompanyKpiCards({ dashboard }: { dashboard: any }) {
  const { t } = useI18n();
  
  const kpis = [
    {
      title: t('dashboard.companiesDashboard.totalCompanies'),
      value: dashboard.totalCompanies ?? 0,
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
    },
    {
      title: t('dashboard.companiesDashboard.newThisMonth'),
      value: dashboard.newThisMonth ?? 0,
      subtitle: `${dashboard.newThisWeek ?? 0} ${t('dashboard.companiesDashboard.thisWeek')}`,
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500',
    },
    {
      title: t('dashboard.companiesDashboard.subscriptionCoverage'),
      value: `${(dashboard.subscriptionCoverage ?? 0).toFixed(1)}%`,
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-500',
    },
    {
      title: t('dashboard.companiesDashboard.alertsCount'),
      value: dashboard.totalAlertCount,
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-500',
      urgent: (dashboard.criticalAlertCount ?? 0) > 0,
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
// Company Status Distribution - Professional Doughnut Chart
// ============================================================================

function StatusDistributionChart({ distribution }: { distribution: any }) {
  const { t } = useI18n();
  
  const data = {
    labels: [
      t('dashboard.companiesDashboard.active'),
      t('dashboard.companiesDashboard.inactive'),
      t('dashboard.companiesDashboard.suspended'),
      t('dashboard.companiesDashboard.atRisk'),
    ],
    datasets: [{
      data: [
        distribution?.active ?? 0,
        distribution?.inactive ?? 0,
        distribution?.suspended ?? 0,
        distribution?.atRisk ?? 0,
      ],
      backgroundColor: ['#22c55e', '#6b7280', '#ef4444', '#f97316'],
      borderColor: 'transparent',
      borderWidth: 0,
      hoverOffset: 15,
    }],
  };

  const total = (distribution?.active ?? 0) + (distribution?.inactive ?? 0) + 
                (distribution?.suspended ?? 0) + (distribution?.atRisk ?? 0);

  const statusItems = [
    { name: t('dashboard.companiesDashboard.active'), value: distribution?.active ?? 0, color: 'bg-green-500' },
    { name: t('dashboard.companiesDashboard.inactive'), value: distribution?.inactive ?? 0, color: 'bg-gray-500' },
    { name: t('dashboard.companiesDashboard.suspended'), value: distribution?.suspended ?? 0, color: 'bg-red-500' },
    { name: t('dashboard.companiesDashboard.atRisk'), value: distribution?.atRisk ?? 0, color: 'bg-orange-500' },
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <PieChart className="h-5 w-5 text-purple-500" />
          {t('dashboard.companiesDashboard.statusDistribution')}
        </CardTitle>
        <CardDescription>{t('dashboard.companiesDashboard.statusDistributionDesc')}</CardDescription>
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
            {statusItems.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{item.value}</span>
                    <Badge variant="secondary" className="text-xs">
                      {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
                    </Badge>
                  </div>
                </div>
                <Progress value={total > 0 ? (item.value / total) * 100 : 0} className="h-1.5" />
              </div>
            ))}
            
            {/* Health Score */}
            <div className="pt-4 border-t mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('dashboard.companiesDashboard.healthScore')}</span>
                <span className="text-2xl font-bold text-green-500">
                  {(distribution?.healthScore ?? 0).toFixed(1)}%
                </span>
              </div>
              <Progress value={distribution?.healthScore ?? 0} className="h-3" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Company Growth Trend - Area Chart
// ============================================================================

function GrowthTrendChart({ growth }: { growth: any }) {
  const { t } = useI18n();

  const chartData = {
    labels: growth?.dailyData?.map((d: any) => d.formattedDate || new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [{
      label: t('dashboard.companiesDashboard.newCompanies'),
      data: growth?.dailyData?.map((d: any) => d.newCompanies) || [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.3)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 8,
    }],
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-500" />
              {t('dashboard.companiesDashboard.growthTrend')}
            </CardTitle>
            <CardDescription>{t('dashboard.companiesDashboard.last30Days')}</CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              {growth?.isGrowing ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <span className={`text-xl font-bold ${growth?.isGrowing ? 'text-green-500' : 'text-red-500'}`}>
                {growth?.formattedGrowthRate || '0%'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              +{growth?.totalGrowth ?? 0} {t('dashboard.companiesDashboard.companies')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <GenericChart
            title=""
            description=""
            data={chartData}
            type="line"
            height={280}
            exportable={false}
            filterable={false}
            resizable={false}
          />
        </div>
        
        {/* Growth Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center p-3 rounded-lg bg-blue-500/10">
            <p className="text-2xl font-bold text-blue-500">{(growth?.averagePerDay ?? 0).toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.companiesDashboard.avgPerDay')}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-500/10">
            <p className="text-2xl font-bold text-green-500">{growth?.bestDay ?? 0}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.companiesDashboard.bestDay')}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-500/10">
            <p className="text-2xl font-bold text-purple-500">{growth?.formattedBestDayDate || 'N/A'}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.companiesDashboard.bestDayDate')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Subscription Coverage - Horizontal Bar Chart
// ============================================================================

function SubscriptionCoverageChart({ dashboard }: { dashboard: any }) {
  const { t } = useI18n();

  const chartData = {
    labels: [
      t('dashboard.companiesDashboard.withActive'),
      t('dashboard.companiesDashboard.withTrial'),
      t('dashboard.companiesDashboard.withExpired'),
      t('dashboard.companiesDashboard.withNone'),
    ],
    datasets: [{
      label: t('dashboard.companiesDashboard.companies'),
      data: [
        dashboard.withActiveSubscription ?? 0,
        dashboard.withTrialSubscription ?? 0,
        dashboard.withExpiredSubscription ?? 0,
        dashboard.withNoSubscription ?? 0,
      ],
      backgroundColor: ['#22c55e', '#3b82f6', '#f97316', '#6b7280'],
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 8,
    }],
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-500" />
          {t('dashboard.companiesDashboard.subscriptionCoverage')}
        </CardTitle>
        <CardDescription>{t('dashboard.companiesDashboard.coverageDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <GenericChart
            title=""
            description=""
            data={chartData}
            type="bar"
            height={280}
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
// Top Companies Leaderboard
// ============================================================================

function TopCompaniesSection({ topCompanies }: { topCompanies: any }) {
  const { t } = useI18n();
  const companies = topCompanies?.companies || [];

  if (companies.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            {t('dashboard.companiesDashboard.topCompanies')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Building2 className="h-16 w-16 mb-4 opacity-20" />
            <p>{t('dashboard.companiesDashboard.noCompanies')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
      case 1: return 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800';
      case 2: return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              {t('dashboard.companiesDashboard.topCompanies')}
            </CardTitle>
            <CardDescription>{t('dashboard.companiesDashboard.topCompaniesDesc')}</CardDescription>
          </div>
          <Badge variant="outline">
            {t('dashboard.companiesDashboard.totalValue')}: {topCompanies?.formattedTotalRevenue ?? 'EGP 0'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {companies.slice(0, 5).map((company: any, index: number) => (
            <div key={company.id || index} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getMedalColor(index)}`}>
                {index < 3 ? <Star className="h-5 w-5" /> : index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{company.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {company.activeSubscriptions} {t('dashboard.companiesDashboard.subs')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{company.topPlanName}</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-green-500">{company.formattedValue}</p>
                <Badge variant={company.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                  {company.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Company Alerts Section
// ============================================================================

function AlertsSection({ alerts, criticalCount, highCount, mediumCount }: { 
  alerts: any[]; 
  criticalCount: number; 
  highCount: number;
  mediumCount: number;
}) {
  const { t } = useI18n();

  const getPriorityStyles = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return { color: 'bg-red-500', text: 'text-red-500', badge: 'destructive' as const };
      case 'high': return { color: 'bg-orange-500', text: 'text-orange-500', badge: 'default' as const };
      case 'medium': return { color: 'bg-yellow-500', text: 'text-yellow-500', badge: 'secondary' as const };
      default: return { color: 'bg-blue-500', text: 'text-blue-500', badge: 'outline' as const };
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              {t('dashboard.companiesDashboard.alerts')}
            </CardTitle>
            <CardDescription>{t('dashboard.companiesDashboard.alertsDesc')}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive">{criticalCount} Critical</Badge>
            )}
            {highCount > 0 && (
              <Badge className="bg-orange-500">{highCount} High</Badge>
            )}
            {mediumCount > 0 && (
              <Badge variant="secondary">{mediumCount} Medium</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <CheckCircle2 className="h-16 w-16 mb-4 text-green-500 opacity-50" />
            <p className="font-medium">{t('dashboard.companiesDashboard.noAlerts')}</p>
            <p className="text-sm">{t('dashboard.companiesDashboard.allGood')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert: any, index: number) => {
              const styles = getPriorityStyles(alert.priority);
              return (
                <div key={alert.companyId || index} className="flex items-start gap-3 p-3 rounded-xl border bg-card">
                  <div className={`w-2 h-2 rounded-full mt-2 ${styles.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{alert.companyName}</p>
                      <Badge variant={styles.badge}>{alert.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.alertMessage}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {alert.daysRemaining === 0 
                          ? t('dashboard.companiesDashboard.expiringToday')
                          : `${alert.daysRemaining} ${t('dashboard.companiesDashboard.daysRemaining')}`
                        }
                      </div>
                      <span className="text-xs text-blue-500 cursor-pointer hover:underline">
                        {alert.suggestedAction}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function CompaniesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
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

export function CompaniesView() {
  const { dashboard, isLoading, error, refresh, formattedLastUpdate } = useCompaniesViewModel();
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
    return <CompaniesSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.companiesDashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.companiesDashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
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
      <CompanyKpiCards dashboard={dashboard} />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistributionChart distribution={dashboard.statusDistribution} />
        <GrowthTrendChart growth={dashboard.growth} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubscriptionCoverageChart dashboard={dashboard} />
        <TopCompaniesSection topCompanies={dashboard.topCompanies} />
      </div>

      {/* Alerts */}
      <AlertsSection 
        alerts={dashboard.alerts} 
        criticalCount={dashboard.criticalAlertCount ?? 0}
        highCount={dashboard.highAlertCount ?? 0}
        mediumCount={dashboard.mediumAlertCount ?? 0}
      />
    </div>
  );
}
