"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { OnlineToken } from "@/domain/models/online-token.model";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GenericTable } from "@/components/ui/generic-table";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import {
  Key,
  RefreshCw,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Wifi,
  Package,
} from "lucide-react";

interface CompanyOnlineTokensProps {
  companyId: string;
}

/**
 * Company Online Tokens Component
 * Shows all online tokens across all subscriptions for a company.
 * This is a read-only aggregate view - token management is done per-subscription.
 */
export function CompanyOnlineTokens({ companyId }: CompanyOnlineTokensProps) {
  const { onlineTokenService } = useServices();
  const { t, direction } = useI18n();
  const router = useRouter();

  // State
  const [tokens, setTokens] = useState<OnlineToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeRevoked, setIncludeRevoked] = useState(false);

  // Load tokens for the company
  const loadTokens = useCallback(async () => {
    setLoading(true);
    try {
      const data = await onlineTokenService.getTokensByCompany(companyId, includeRevoked);
      setTokens(data);
    } catch (error) {
      console.error("Failed to load tokens:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId, includeRevoked, onlineTokenService]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  // Stats
  const activeTokens = tokens.filter((t) => t.isActive).length;
  const expiringTokens = tokens.filter((t) => t.isExpiringSoon).length;
  const totalDevices = tokens.reduce((sum, t) => sum + t.boundDeviceCount, 0);

  // Group tokens by subscription
  const tokensBySubscription = useMemo(() => {
    return tokens.reduce((acc, token) => {
      const key = token.subscriptionId;
      if (!acc[key]) {
        acc[key] = {
          subscriptionId: token.subscriptionId,
          planName: token.subscriptionPlanName,
          tokens: [],
        };
      }
      acc[key].tokens.push(token);
      return acc;
    }, {} as Record<string, { subscriptionId: string; planName: string | null; tokens: OnlineToken[] }>);
  }, [tokens]);

  // Table columns
  const columns = useMemo(() => [
    {
      key: "name" as keyof OnlineToken,
      label: t("onlineTokens.name"),
      render: (_: any, token: OnlineToken) => (
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-muted-foreground" />
          {token.displayName}
          {token.autoRefreshEnabled && (
            <RefreshCw className="h-3 w-3 text-green-500" />
          )}
        </div>
      ),
    },
    {
      key: "status" as keyof OnlineToken,
      label: t("onlineTokens.status"),
      render: (_: any, token: OnlineToken) => (
        <Badge variant={token.statusVariant}>{token.status}</Badge>
      ),
    },
    {
      key: "boundDeviceCount" as keyof OnlineToken,
      label: t("onlineTokens.devices"),
      render: (_: any, token: OnlineToken) => token.deviceUsageText,
    },
    {
      key: "expiresAtUtc" as keyof OnlineToken,
      label: t("onlineTokens.expiry"),
      render: (_: any, token: OnlineToken) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className={token.isExpiringSoon ? "text-orange-500" : ""}>
            {token.formattedExpiryDate}
          </span>
          {token.isExpiringSoon && (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}
        </div>
      ),
    },
    {
      key: "lastUsedAtUtc" as keyof OnlineToken,
      label: t("onlineTokens.lastUsed"),
      render: (_: any, token: OnlineToken) =>
        token.formattedLastUsedDate ?? (
          <span className="text-muted-foreground">{t("common.never")}</span>
        ),
    },
  ], [t]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={direction}>
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("onlineTokens.activeTokens")}</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTokens}</div>
            <p className="text-xs text-muted-foreground">
              {tokens.length} {t("onlineTokens.total")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("companyOnlineTokens.totalDevices")}</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevices}</div>
            <p className="text-xs text-muted-foreground">
              {t("companyOnlineTokens.acrossSubscriptions")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("companyOnlineTokens.expiringSoon")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{expiringTokens}</div>
            <p className="text-xs text-muted-foreground">
              {t("companyOnlineTokens.within7Days")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Switch
          id="includeRevoked"
          checked={includeRevoked}
          onCheckedChange={setIncludeRevoked}
        />
        <Label htmlFor="includeRevoked">{t("onlineTokens.showRevoked")}</Label>
      </div>

      {/* Tokens by Subscription */}
      {tokens.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Key className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="font-medium">{t("companyOnlineTokens.noTokens")}</p>
              <p className="text-sm mt-1">{t("companyOnlineTokens.noTokensDescription")}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.values(tokensBySubscription).map((group) => (
            <Card key={group.subscriptionId}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {group.planName || t("common.unknownPlan")}
                    </CardTitle>
                    <CardDescription>
                      {group.tokens.length} {t("onlineTokens.tokens")}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/subscriptions/${group.subscriptionId}?tab=online`)}
                >
                  <ExternalLink className="h-4 w-4 me-2" />
                  {t("companyOnlineTokens.manageTokens")}
                </Button>
              </CardHeader>
              <CardContent>
                <GenericTable<OnlineToken>
                  data={group.tokens}
                  columns={columns}
                  emptyMessage={t("onlineTokens.noTokens")}
                  hideActions={true}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Wifi className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">{t("companyOnlineTokens.infoTitle")}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("companyOnlineTokens.infoDescription")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
