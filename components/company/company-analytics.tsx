"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/providers/i18n-provider";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Package,
  BarChart3,
} from "lucide-react";

interface CompanyAnalyticsProps {
  subscriptions: any[];
}

export function CompanyAnalytics({ subscriptions }: CompanyAnalyticsProps) {
  const { t } = useI18n();

  const analytics = useMemo(() => {
    if (!subscriptions || subscriptions.length === 0) {
      return null;
    }

    const total = subscriptions.length;
    const active = subscriptions.filter((s: any) => s.isActive && !s.isExpired).length;
    const trial = subscriptions.filter((s: any) => s.isTrial && s.isActive).length;
    const expired = subscriptions.filter((s: any) => s.isExpired).length;
    const suspended = subscriptions.filter((s: any) => !s.isActive && !s.isExpired).length;

    const totalRevenue = subscriptions.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
    const activeRevenue = subscriptions
      .filter((s: any) => s.isActive && !s.isExpired)
      .reduce((sum: number, s: any) => sum + (s.amount || 0), 0);

    const avgSubscriptionValue = total > 0 ? totalRevenue / total : 0;

    // Calculate status distribution percentages
    const statusDistribution = [
      { label: t("subscription.statuses.active"), value: active, color: "bg-green-500", percentage: (active / total) * 100 },
      { label: t("subscription.statuses.trial"), value: trial, color: "bg-blue-500", percentage: (trial / total) * 100 },
      { label: t("subscription.statuses.expired"), value: expired, color: "bg-red-500", percentage: (expired / total) * 100 },
      { label: t("subscription.statuses.suspended"), value: suspended, color: "bg-orange-500", percentage: (suspended / total) * 100 },
    ];

    // Group by plan
    const planDistribution = subscriptions.reduce((acc: any, sub: any) => {
      const planName = sub.planName || "Unknown";
      if (!acc[planName]) {
        acc[planName] = { count: 0, revenue: 0 };
      }
      acc[planName].count++;
      acc[planName].revenue += sub.amount || 0;
      return acc;
    }, {});

    const topPlan = Object.entries(planDistribution)
      .sort((a: any, b: any) => b[1].revenue - a[1].revenue)[0];

    return {
      total,
      active,
      trial,
      expired,
      suspended,
      totalRevenue,
      activeRevenue,
      avgSubscriptionValue,
      statusDistribution,
      topPlan: topPlan ? { name: topPlan[0], count: (topPlan[1] as any).count, revenue: (topPlan[1] as any).revenue } : null,
    };
  }, [subscriptions, t]);

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t("subscription.analytics")}
          </CardTitle>
          <CardDescription>{t("subscription.noAnalytics")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.revenue.totalRevenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("subscription.total")}: {analytics.total}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.revenue.activeRevenue")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.activeRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.active} {t("subscription.statuses.active")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.revenue.avgPerCustomer")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.avgSubscriptionValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("subscription.amount")} / {t("subscription.item")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t("subscription.statusDistribution")}
          </CardTitle>
          <CardDescription>
            {t("subscription.statusDistributionDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.statusDistribution.map((item: any, index: number) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{item.value}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.percentage.toFixed(0)}%
                  </Badge>
                </div>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Plan */}
      {analytics.topPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("dashboard.subscriptions.topPlan")}
            </CardTitle>
            <CardDescription>
              {t("dashboard.subscriptions.topPlanDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div>
                <p className="text-lg font-bold">{analytics.topPlan.name}</p>
                <p className="text-sm text-muted-foreground">
                  {analytics.topPlan.count} {t("subscription.items")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {analytics.topPlan.revenue.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.revenue.totalRevenue")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
