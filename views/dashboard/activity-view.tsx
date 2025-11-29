"use client";

import React from "react";
import { useActivityViewModel } from "@/viewmodels/dashboard/activity-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GenericChart, GENERIC_COLORS } from "@/components/charts/generic-chart";
import { 
  RefreshCw, 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Calendar,
  BarChart3,
  LineChart,
  Zap,
  Shield,
  Edit,
  Trash2,
  Plus,
  Eye,
  Settings,
  LogIn,
  LogOut,
  Key,
  UserPlus,
  FileKey,
  Building2,
  Crown,
  Award,
} from "lucide-react";

// ============================================================================
// Activity Stats Cards
// ============================================================================

function ActivityStatsCards({ dashboard }: { dashboard: any }) {
  const { t } = useI18n();
  
  const stats = dashboard?.stats;
  const topAdmins = dashboard?.topAdmins;
  const timeline = dashboard?.timeline;
  
  const cards = [
    {
      title: t('dashboard.activityDashboard.totalActions'),
      value: stats?.totalActions ?? 0,
      icon: Activity,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
    },
    {
      title: t('dashboard.activityDashboard.todayActions'),
      value: stats?.todayActions ?? 0,
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500',
    },
    {
      title: t('dashboard.activityDashboard.activeAdmins'),
      // activeAdmins is in topAdmins.totalActiveAdmins, not in stats
      value: topAdmins?.totalActiveAdmins ?? stats?.activeAdmins ?? 0,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-500',
    },
    {
      title: t('dashboard.activityDashboard.peakHour'),
      // peakHour is in timeline.peakHourLabel, not in stats
      value: timeline?.peakHourLabel ?? stats?.peakHour ?? 'N/A',
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="overflow-hidden border-0 shadow-lg">
          <div className={`h-1 bg-gradient-to-r ${card.color}`} />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                <p className="text-3xl font-bold tracking-tight">{card.value}</p>
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
// Activity Timeline Chart
// ============================================================================

function ActivityTimelineChart({ timeline }: { timeline: any }) {
  const { t } = useI18n();

  const dailyData = timeline?.dailyData || [];
  const data = {
    labels: dailyData.map((d: any) => d.label || new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [{
      label: t('dashboard.activityDashboard.actions'),
      data: dailyData.map((d: any) => d.count || d.actions || 0),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.3)',
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 10,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }],
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-500" />
              {t('dashboard.activityDashboard.activityTimeline')}
            </CardTitle>
            <CardDescription>{t('dashboard.activityDashboard.last7Days')}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {timeline?.totalThisWeek ?? 0} {t('dashboard.activityDashboard.thisWeek')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <GenericChart
            title=""
            description=""
            data={data}
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
// Actions by Type Chart
// ============================================================================

function ActionsByTypeChart({ actionsByType }: { actionsByType: any[] }) {
  const { t } = useI18n();

  // Translate action types
  const translateActionType = (type: string) => {
    const actionTypeMap: Record<string, string> = {
      'Created': t('dashboard.activityDashboard.actionTypes.created'),
      'Updated': t('dashboard.activityDashboard.actionTypes.updated'),
      'Deleted': t('dashboard.activityDashboard.actionTypes.deleted'),
      'Activated': t('dashboard.activityDashboard.actionTypes.activated'),
      'Suspended': t('dashboard.activityDashboard.actionTypes.suspended'),
      'Resumed': t('dashboard.activityDashboard.actionTypes.resumed'),
      'Cancelled': t('dashboard.activityDashboard.actionTypes.cancelled'),
      'Renewed': t('dashboard.activityDashboard.actionTypes.renewed'),
      'Login': t('dashboard.activityDashboard.actionTypes.login'),
      'Logout': t('dashboard.activityDashboard.actionTypes.logout'),
    };
    return actionTypeMap[type] || type;
  };

  const data = {
    // DistributionItem has 'name' not 'type' or 'actionType'
    labels: actionsByType?.map(a => translateActionType(a.name || a.type || a.actionType)) || [],
    datasets: [{
      label: t('dashboard.activityDashboard.count'),
      data: actionsByType?.map(a => a.count || a.value || 0) || [],
      backgroundColor: GENERIC_COLORS.primary.slice(0, actionsByType?.length || 5),
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 8,
    }],
  };

  const getActionIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'created': case 'create': return Plus;
      case 'updated': case 'update': return Edit;
      case 'deleted': case 'delete': return Trash2;
      case 'viewed': case 'view': return Eye;
      case 'login': return LogIn;
      case 'logout': return LogOut;
      case 'activated': return Zap;
      case 'suspended': return Shield;
      default: return Activity;
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-500" />
          {t('dashboard.activityDashboard.actionsByType')}
        </CardTitle>
        <CardDescription>{t('dashboard.activityDashboard.actionsByTypeDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <GenericChart
            title=""
            description=""
            data={data}
            type={actionsByType?.length === 1 ? "doughnut" : "bar"}
            height={280}
            exportable={false}
            filterable={false}
            resizable={false}
          />
        </div>
        
        {/* Action Type Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t">
          {actionsByType?.slice(0, 8).map((action, index) => {
            const Icon = getActionIcon(action.name || action.type || action.actionType);
            return (
              <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{translateActionType(action.name || action.type || action.actionType)}</p>
                  <p className="text-sm font-bold">{action.count || action.value || 0}</p>
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
// Top Admins Leaderboard
// ============================================================================

function TopAdminsSection({ topAdmins }: { topAdmins: any[] }) {
  const { t } = useI18n();

  if (!topAdmins || topAdmins.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            {t('dashboard.activityDashboard.topAdmins')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-16 w-16 mb-4 opacity-20" />
            <p>{t('dashboard.activityDashboard.noAdmins')}</p>
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
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          {t('dashboard.activityDashboard.topAdmins')}
        </CardTitle>
        <CardDescription>{t('dashboard.activityDashboard.topAdminsDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topAdmins.slice(0, 5).map((admin, index) => (
            <div key={admin.adminId || index} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getMedalColor(index)}`}>
                {index < 3 ? <Award className="h-5 w-5" /> : index + 1}
              </div>
              
              <Avatar className="h-10 w-10">
                <AvatarImage src={admin.profilePicture} />
                <AvatarFallback>{admin.adminName?.slice(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{admin.adminName}</p>
                <p className="text-xs text-muted-foreground">{admin.role || admin.adminType}</p>
              </div>
              
              <div className="text-right">
                <p className="text-xl font-bold text-blue-500">{admin.actionCount}</p>
                <p className="text-xs text-muted-foreground">{t('dashboard.activityDashboard.actions')}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Recent Activity Feed
// ============================================================================

function RecentActivityFeed({ activities }: { activities: any[] }) {
  const { t } = useI18n();

  // Translate action types
  const translateActionType = (type: string) => {
    const actionTypeMap: Record<string, string> = {
      'Created': t('dashboard.activityDashboard.actionTypes.created'),
      'Updated': t('dashboard.activityDashboard.actionTypes.updated'),
      'Deleted': t('dashboard.activityDashboard.actionTypes.deleted'),
      'Activated': t('dashboard.activityDashboard.actionTypes.activated'),
      'Suspended': t('dashboard.activityDashboard.actionTypes.suspended'),
      'Resumed': t('dashboard.activityDashboard.actionTypes.resumed'),
      'Cancelled': t('dashboard.activityDashboard.actionTypes.cancelled'),
      'Renewed': t('dashboard.activityDashboard.actionTypes.renewed'),
      'Login': t('dashboard.activityDashboard.actionTypes.login'),
      'Logout': t('dashboard.activityDashboard.actionTypes.logout'),
    };
    return actionTypeMap[type] || type;
  };

  // Translate entity types
  const translateEntityType = (type: string) => {
    const entityTypeMap: Record<string, string> = {
      'Company': t('dashboard.activityDashboard.entityTypes.company'),
      'Subscription': t('dashboard.activityDashboard.entityTypes.subscription'),
      'Admin': t('dashboard.activityDashboard.entityTypes.admin'),
      'LicenseKey': t('dashboard.activityDashboard.entityTypes.licenseKey'),
      'Plan': t('dashboard.activityDashboard.entityTypes.plan'),
      'Project': t('dashboard.activityDashboard.entityTypes.project'),
      'Module': t('dashboard.activityDashboard.entityTypes.module'),
    };
    return entityTypeMap[type] || type;
  };

  const getActivityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'created': case 'create': return { icon: Plus, color: 'text-green-500 bg-green-500/10' };
      case 'updated': case 'update': return { icon: Edit, color: 'text-blue-500 bg-blue-500/10' };
      case 'deleted': case 'delete': return { icon: Trash2, color: 'text-red-500 bg-red-500/10' };
      case 'activated': return { icon: Zap, color: 'text-purple-500 bg-purple-500/10' };
      case 'suspended': return { icon: Shield, color: 'text-orange-500 bg-orange-500/10' };
      case 'login': return { icon: LogIn, color: 'text-cyan-500 bg-cyan-500/10' };
      case 'logout': return { icon: LogOut, color: 'text-gray-500 bg-gray-500/10' };
      default: return { icon: Activity, color: 'text-blue-500 bg-blue-500/10' };
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'company': return Building2;
      case 'subscription': return Calendar;
      case 'admin': return Users;
      case 'license': case 'licensekey': return FileKey;
      default: return Settings;
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              {t('dashboard.activityDashboard.recentActivity')}
            </CardTitle>
            <CardDescription>{t('dashboard.activityDashboard.recentActivityDesc')}</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            {t('dashboard.activityDashboard.viewAll')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!activities || activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Activity className="h-16 w-16 mb-4 opacity-20" />
            <p>{t('dashboard.activityDashboard.noActivity')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 10).map((activity, index) => {
              const { icon: ActionIcon, color } = getActivityIcon(activity.actionType);
              const EntityIcon = getEntityIcon(activity.entityType);
              return (
                <div key={activity.id || index} className="flex items-start gap-3 p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                  <div className={`p-2 rounded-full ${color}`}>
                    <ActionIcon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{activity.adminName || activity.performedBy}</span>
                      <Badge variant="secondary" className="text-xs">
                        {translateActionType(activity.actionType)}
                      </Badge>
                      <span className="text-muted-foreground">{translateEntityType(activity.entityType)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {activity.entityName || activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{activity.timeAgo}</span>
                    </div>
                  </div>
                  
                  <EntityIcon className="h-5 w-5 text-muted-foreground shrink-0" />
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

function ActivitySkeleton() {
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

export function ActivityView() {
  const { dashboard, isLoading, error, refresh, formattedLastUpdate } = useActivityViewModel();
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
    return <ActivitySkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.activityDashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.activityDashboard.subtitle')}</p>
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
      <ActivityStatsCards dashboard={dashboard} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTimelineChart timeline={dashboard.timeline} />
        <ActionsByTypeChart actionsByType={dashboard.byActionTypeChart} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopAdminsSection topAdmins={dashboard.topAdmins?.admins} />
        <RecentActivityFeed activities={dashboard.recentActivity} />
      </div>
    </div>
  );
}
