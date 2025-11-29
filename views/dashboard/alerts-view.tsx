"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAlertsViewModel } from "@/viewmodels/dashboard/alerts-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { GenericChart, GENERIC_COLORS } from "@/components/charts/generic-chart";
import { 
  RefreshCw, 
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  ExternalLink,
  Eye,
  EyeOff,
  Building2,
  CalendarClock,
  ShieldAlert,
  Users,
  FileKey,
  Zap,
  Timer,
  ArrowRight,
  Filter,
  SortAsc,
} from "lucide-react";

// ============================================================================
// Alert Stats Cards
// ============================================================================

function AlertStatsCards({ counts }: { counts: any }) {
  const { t } = useI18n();
  
  const cards = [
    {
      title: t('dashboard.alertsDashboard.critical'),
      value: counts?.critical ?? 0,
      icon: AlertCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-500',
      urgent: true,
    },
    {
      title: t('dashboard.alertsDashboard.high'),
      value: counts?.high ?? 0,
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-500',
    },
    {
      title: t('dashboard.alertsDashboard.medium'),
      value: counts?.medium ?? 0,
      icon: Bell,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-500',
    },
    {
      title: t('dashboard.alertsDashboard.low'),
      value: counts?.low ?? 0,
      icon: CheckCircle2,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className={`overflow-hidden border-0 shadow-lg ${card.urgent && card.value > 0 ? 'ring-2 ring-red-500/50' : ''}`}>
          <div className={`h-1 bg-gradient-to-r ${card.color}`} />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                <p className={`text-3xl font-bold tracking-tight ${card.urgent && card.value > 0 ? 'text-red-500 animate-pulse' : ''}`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.textColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// Alerts by Category - Doughnut Chart
// ============================================================================

function AlertsByCategoryChart({ byCategory }: { byCategory: any }) {
  const { t } = useI18n();

  const categories = byCategory?.categories || [
    { category: t('dashboard.alertsDashboard.expiringSubscriptions'), count: byCategory?.expiringSubscriptions ?? 0 },
    { category: t('dashboard.alertsDashboard.expiredSubscriptions'), count: byCategory?.expiredSubscriptions ?? 0 },
    { category: t('dashboard.alertsDashboard.inactiveCompanies'), count: byCategory?.inactiveCompanies ?? 0 },
    { category: t('dashboard.alertsDashboard.systemHealth'), count: byCategory?.systemHealth ?? 0 },
  ];

  const data = {
    labels: categories.map((c: any) => c.category || c.name),
    datasets: [{
      data: categories.map((c: any) => c.count || c.value || 0),
      backgroundColor: ['#f97316', '#ef4444', '#6b7280', '#3b82f6'],
      borderColor: 'transparent',
      borderWidth: 0,
      hoverOffset: 15,
    }],
  };

  const total = categories.reduce((sum: number, c: any) => sum + (c.count || c.value || 0), 0);

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('expir')) return CalendarClock;
    if (category.toLowerCase().includes('inactive')) return Building2;
    if (category.toLowerCase().includes('system')) return ShieldAlert;
    return Bell;
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <PieChart className="h-5 w-5 text-purple-500" />
          {t('dashboard.alertsDashboard.byCategory')}
        </CardTitle>
        <CardDescription>{t('dashboard.alertsDashboard.byCategoryDesc')}</CardDescription>
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
          <div className="w-full lg:w-1/2 space-y-3">
            {categories.map((cat: any, index: number) => {
              const count = cat.count || cat.value || 0;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const colors = ['bg-orange-500', 'bg-red-500', 'bg-gray-500', 'bg-blue-500'];
              const Icon = getCategoryIcon(cat.category || cat.name);
              return (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cat.category || cat.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{count}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
            
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('dashboard.alertsDashboard.totalAlerts')}</span>
                <span className="text-2xl font-bold">{total}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Alerts by Priority - Bar Chart
// ============================================================================

function AlertsByPriorityChart({ counts }: { counts: any }) {
  const { t } = useI18n();

  const data = {
    labels: [
      t('dashboard.alertsDashboard.critical'),
      t('dashboard.alertsDashboard.high'),
      t('dashboard.alertsDashboard.medium'),
      t('dashboard.alertsDashboard.low'),
    ],
    datasets: [{
      label: t('dashboard.alertsDashboard.alerts'),
      data: [
        counts?.critical ?? 0,
        counts?.high ?? 0,
        counts?.medium ?? 0,
        counts?.low ?? 0,
      ],
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
          <BarChart3 className="h-5 w-5 text-red-500" />
          {t('dashboard.alertsDashboard.byPriority')}
        </CardTitle>
        <CardDescription>{t('dashboard.alertsDashboard.byPriorityDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <GenericChart
            title=""
            description=""
            data={data}
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
// Alert Items List
// ============================================================================

function AlertItemsList({ alerts, onMarkRead, onDismiss }: { 
  alerts: any[]; 
  onMarkRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
}) {
  const { t } = useI18n();
  const router = useRouter();

  // Handle action button clicks
  const handleAction = (actionUrl: string | undefined) => {
    if (!actionUrl) return;
    
    // Convert backend URLs to frontend routes
    // Backend: /subscriptions/create?companyId=xxx → /subscriptions/new?companyId=xxx
    // Backend: /companies/{id} → /companies/{id}
    // Backend: /subscriptions/{id} → /subscriptions/{id}
    // Backend: /subscriptions/{id}/renew → /subscriptions/{id}/edit (for now)
    
    let frontendUrl = actionUrl;
    
    // Handle subscription create
    if (actionUrl.includes('/subscriptions/create')) {
      frontendUrl = actionUrl.replace('/subscriptions/create', '/subscriptions/new');
    }
    // Handle subscription renew
    else if (actionUrl.includes('/renew')) {
      frontendUrl = actionUrl.replace('/renew', '/edit');
    }
    
    router.push(frontendUrl);
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return { 
        color: 'bg-red-500', 
        text: 'text-red-500', 
        badge: 'destructive' as const,
        ring: 'ring-2 ring-red-500/30',
        icon: AlertCircle,
      };
      case 'high': return { 
        color: 'bg-orange-500', 
        text: 'text-orange-500', 
        badge: 'default' as const,
        ring: '',
        icon: AlertTriangle,
      };
      case 'medium': return { 
        color: 'bg-yellow-500', 
        text: 'text-yellow-500', 
        badge: 'secondary' as const,
        ring: '',
        icon: Bell,
      };
      default: return { 
        color: 'bg-blue-500', 
        text: 'text-blue-500', 
        badge: 'outline' as const,
        ring: '',
        icon: CheckCircle2,
      };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'expiring_subscription': case 'subscription_expiring': return CalendarClock;
      case 'expired_subscription': case 'subscription_expired': return Calendar;
      case 'inactive_company': case 'company_inactive': return Building2;
      case 'inactive_admin': case 'admin_inactive': return Users;
      case 'license': case 'license_key': return FileKey;
      case 'system': case 'system_health': return ShieldAlert;
      default: return Bell;
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-500" />
            {t('dashboard.alertsDashboard.allAlerts')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <CheckCircle2 className="h-20 w-20 mb-4 text-green-500 opacity-50" />
            <p className="text-xl font-medium">{t('dashboard.alertsDashboard.noAlerts')}</p>
            <p className="text-sm mt-2">{t('dashboard.alertsDashboard.allGood')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              {t('dashboard.alertsDashboard.allAlerts')}
            </CardTitle>
            <CardDescription>
              {alerts.length} {t('dashboard.alertsDashboard.activeAlerts')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              {t('dashboard.alertsDashboard.filter')}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <SortAsc className="h-4 w-4" />
              {t('dashboard.alertsDashboard.sort')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const styles = getPriorityStyles(alert.priority);
            const CategoryIcon = getCategoryIcon(alert.category);
            const PriorityIcon = styles.icon;
            
            return (
              <div 
                key={alert.id || index} 
                className={`p-4 rounded-xl border bg-card hover:bg-muted/30 transition-all ${styles.ring} ${alert.isRead ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${styles.color}/10`}>
                    <PriorityIcon className={`h-5 w-5 ${styles.text}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{alert.title}</span>
                      <Badge variant={styles.badge}>{alert.priority}</Badge>
                      <Badge variant="outline" className="text-xs">
                        <CategoryIcon className="h-3 w-3 mr-1" />
                        {alert.category?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-2">{alert.message}</p>
                    
                    {alert.entityName && (
                      <div className="flex items-center gap-2 mt-2">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{alert.entityName}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3">
                      {alert.daysRemaining !== undefined && (
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3 text-muted-foreground" />
                          <span className={`text-xs ${alert.daysRemaining <= 0 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                            {alert.daysRemaining === 0 
                              ? t('dashboard.alertsDashboard.today')
                              : alert.daysRemaining < 0
                              ? t('dashboard.alertsDashboard.overdue')
                              : `${alert.daysRemaining} ${t('dashboard.alertsDashboard.daysRemaining')}`
                            }
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{alert.timeAgo}</span>
                      </div>
                    </div>
                    
                    {(alert.primaryAction || alert.secondaryAction) && (
                      <div className="flex items-center gap-2 mt-3">
                        {alert.secondaryAction && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAction(alert.secondaryActionUrl)}
                          >
                            {alert.secondaryAction}
                          </Button>
                        )}
                        {alert.primaryAction && (
                          <Button 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleAction(alert.primaryActionUrl)}
                          >
                            <Zap className="h-3 w-3" />
                            {alert.primaryAction}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => onMarkRead?.(alert.id)}
                    >
                      {alert.isRead ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => onDismiss?.(alert.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function AlertsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6"><Skeleton className="h-[320px]" /></CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6"><Skeleton className="h-[320px]" /></CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Main View
// ============================================================================

export function AlertsView() {
  const { dashboard, isLoading, error, refresh, formattedLastUpdate } = useAlertsViewModel();
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
    return <AlertsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.alertsDashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.alertsDashboard.subtitle')}</p>
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

      {/* Stats Cards */}
      <AlertStatsCards counts={dashboard.counts} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsByCategoryChart byCategory={dashboard.byCategory} />
        <AlertsByPriorityChart counts={dashboard.counts} />
      </div>

      {/* Alerts List */}
      <AlertItemsList 
        alerts={dashboard.allAlerts} 
      />
    </div>
  );
}
