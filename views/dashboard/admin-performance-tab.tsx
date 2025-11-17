"use client";

import { cn } from "@/lib/utils";
import { GenericChart } from "@/components/charts/generic-chart";
import { Dashboard } from "@/domain/models/dashboard.model";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Activity, Clock, Award, Target, Users } from "lucide-react";

interface AdminPerformanceTabProps {
  dashboard: Dashboard;
  t: (key: string) => string;
  isRTL: boolean;
}

export function AdminPerformanceTab({ dashboard, t, isRTL }: AdminPerformanceTabProps) {
  const { adminPerformance } = dashboard;
  const { leaderboard, activityHeatmap, typePerformance, systemActivity, peakHours } = adminPerformance;

  // Top 10 admins for leaderboard
  const topAdmins = leaderboard.slice(0, 10);

  // Get rank colors
  const getRankColor = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (index === 1) return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900";
    if (index === 2) return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
    return "bg-gray-100 text-gray-900";
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <div className="space-y-6">
      {/* System Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              {t("adminPerformance.totalActions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemActivity.totalActions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {systemActivity.avgActionsPerDay.toFixed(1)} {t("adminPerformance.perDay")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              {t("adminPerformance.activeAdmins")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemActivity.activeAdmins}</div>
            <p className="text-xs text-muted-foreground">
              {systemActivity.avgAdminsOnline.toFixed(1)} {t("adminPerformance.avgOnline")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              {t("adminPerformance.avgPerformance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminPerformance.averagePerformanceScore}/100</div>
            <p className="text-xs text-muted-foreground">
              {adminPerformance.highPerformersCount} {t("adminPerformance.highPerformers")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              {t("adminPerformance.peakHour")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peakHours[0]?.hourFormatted}</div>
            <p className="text-xs text-muted-foreground">
              {peakHours[0]?.activityCount.toLocaleString()} {t("adminPerformance.actions")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            {t("adminPerformance.leaderboard")}
          </CardTitle>
          <CardDescription>{t("adminPerformance.top10Performers")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topAdmins.map((admin, index) => (
              <div
                key={admin.adminId}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-all",
                  "hover:shadow-md hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank Badge */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                      getRankColor(index)
                    )}
                  >
                    {getRankIcon(index)}
                  </div>

                  {/* Admin Info */}
                  <div className="flex-1">
                    <div className="font-semibold flex items-center gap-2">
                      {admin.fullName}
                      <Badge variant="outline" className="text-xs">
                        {admin.username}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {admin.adminType} • {admin.daysActive} {t("adminPerformance.daysActive")}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="hidden md:grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold">{admin.totalActions}</div>
                      <div className="text-xs text-muted-foreground">{t("adminPerformance.actions")}</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{admin.companiesManaged}</div>
                      <div className="text-xs text-muted-foreground">{t("adminPerformance.companies")}</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{admin.subscriptionsManaged}</div>
                      <div className="text-xs text-muted-foreground">{t("adminPerformance.subscriptions")}</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{Math.round(admin.avgResponseTime)}ms</div>
                      <div className="text-xs text-muted-foreground">{t("adminPerformance.responseTime")}</div>
                    </div>
                  </div>

                  {/* Performance Score */}
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn("text-3xl font-bold", admin.performanceColor)}>
                      {admin.performanceScore}
                    </div>
                    <Badge className={cn(admin.activityLevelColor)}>
                      {admin.activityLevel}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Type Performance */}
        <GenericChart
          title={t("adminPerformance.typePerformance")}
          description={t("adminPerformance.performanceByType")}
          type="bar"
          data={{
            labels: typePerformance.map(t => t.typeName),
            datasets: [
              {
                label: t("adminPerformance.avgScore"),
                data: typePerformance.map(t => t.avgPerformanceScore),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: '#3b82f6',
                borderWidth: 2,
              },
            ],
          }}
          options={{
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
              },
            },
          }}
          height={300}
        />

        {/* Peak Activity Hours */}
        <GenericChart
          title={t("adminPerformance.peakHours")}
          description={t("adminPerformance.topActivityHours")}
          type="bar"
          data={{
            labels: peakHours.map(h => h.hourFormatted),
            datasets: [
              {
                label: t("adminPerformance.activityCount"),
                data: peakHours.map(h => h.activityCount),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: '#10b981',
                borderWidth: 2,
              },
            ],
          }}
          height={300}
        />

        {/* Actions per Admin Type */}
        <GenericChart
          title={t("adminPerformance.actionsPerType")}
          description={t("adminPerformance.totalActionsByType")}
          type="doughnut"
          data={{
            labels: typePerformance.map(t => t.typeName),
            datasets: [
              {
                data: typePerformance.map(t => t.totalActions),
                backgroundColor: [
                  'rgba(59, 130, 246, 0.7)',
                  'rgba(16, 185, 129, 0.7)',
                  'rgba(251, 146, 60, 0.7)',
                  'rgba(139, 92, 246, 0.7)',
                ],
                borderColor: ['#3b82f6', '#10b981', '#fb923c', '#8b5cf6'],
                borderWidth: 2,
              },
            ],
          }}
          height={300}
        />

        {/* Average Actions per Admin */}
        <GenericChart
          title={t("adminPerformance.avgActionsPerAdmin")}
          description={t("adminPerformance.activityRateByType")}
          type="bar"
          data={{
            labels: typePerformance.map(t => t.typeName),
            datasets: [
              {
                label: t("adminPerformance.avgActions"),
                data: typePerformance.map(t => t.avgActionsPerAdmin),
                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                borderColor: '#8b5cf6',
                borderWidth: 2,
              },
            ],
          }}
          height={300}
        />
      </div>

      {/* Activity Heatmap Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            {t("adminPerformance.activityHeatmap")}
          </CardTitle>
          <CardDescription>{t("adminPerformance.last30Days")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            {t("adminPerformance.heatmapComingSoon")}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {activityHeatmap.slice(0, 28).map((day, index) => (
              <div
                key={index}
                className={cn(
                  "h-20 rounded border flex flex-col items-center justify-center",
                  "transition-all hover:scale-105 hover:shadow-md cursor-pointer",
                  day.totalActivity > 500 ? "bg-green-500/20 border-green-500" :
                  day.totalActivity > 300 ? "bg-blue-500/20 border-blue-500" :
                  day.totalActivity > 100 ? "bg-yellow-500/20 border-yellow-500" :
                  "bg-gray-100 border-gray-300"
                )}
                title={`${day.dayName} - ${day.totalActivity} actions`}
              >
                <div className="text-xs font-medium">{day.dayName.substring(0, 3)}</div>
                <div className="text-lg font-bold">{day.totalActivity}</div>
                <div className="text-xs text-muted-foreground">{day.peakHour}:00</div>
              </div>
            ))}
          </div>
          
          {/* Heatmap Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
              <span>Low (&lt;100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500"></div>
              <span>Medium (100-300)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500"></div>
              <span>High (300-500)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500"></div>
              <span>Very High (&gt;500)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t("adminPerformance.systemStats")}</CardTitle>
          <CardDescription>{t("adminPerformance.overallMetrics")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-sm text-blue-700 font-medium">{t("adminPerformance.totalLogins")}</div>
              <div className="text-2xl font-bold text-blue-900">{systemActivity.totalLogins.toLocaleString()}</div>
              <div className="text-xs text-blue-600 mt-1">
                {systemActivity.avgLoginsPerDay} {t("adminPerformance.perDay")}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="text-sm text-green-700 font-medium">{t("adminPerformance.actionsPerLogin")}</div>
              <div className="text-2xl font-bold text-green-900">{systemActivity.actionsPerLogin}</div>
              <div className="text-xs text-green-600 mt-1">{t("adminPerformance.efficiency")}</div>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-sm text-purple-700 font-medium">{t("adminPerformance.peakDay")}</div>
              <div className="text-lg font-bold text-purple-900">
                {systemActivity.peakActivityDate.toLocaleDateString()}
              </div>
              <div className="text-xs text-purple-600 mt-1">
                {systemActivity.peakActivityCount.toLocaleString()} {t("adminPerformance.actions")}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="text-sm text-orange-700 font-medium">{t("adminPerformance.utilization")}</div>
              <div className="text-2xl font-bold text-orange-900">{systemActivity.systemUtilization}%</div>
              <div className="text-xs text-orange-600 mt-1">{t("adminPerformance.ofPeakCapacity")}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
