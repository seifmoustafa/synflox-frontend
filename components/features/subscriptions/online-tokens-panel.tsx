"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import {
  OnlineToken,
  OnlineDevice,
  DeviceLimit,
  GenerateOnlineTokenRequest,
  PendingChanges,
} from "@/domain/models/online-token.model";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { GenericModal } from "@/components/ui/generic-modal";
import { GenericForm, FieldConfig } from "@/components/forms/generic-form";
import { GenericTable } from "@/components/ui/generic-table";
import { cn } from "@/lib/utils";

// Icons
import {
  Key,
  Plus,
  RefreshCw,
  Trash2,
  Copy,
  CheckCircle2,
  Monitor,
  Smartphone,
  Server,
  Clock,
  AlertTriangle,
  Activity,
  Calendar,
} from "lucide-react";

interface OnlineTokensPanelProps {
  subscriptionId: string;
}

export function OnlineTokensPanel({ subscriptionId }: OnlineTokensPanelProps) {
  const { onlineTokenService } = useServices();
  const { t, direction } = useI18n();
  const isRTL = direction === "rtl";

  // State
  const [tokens, setTokens] = useState<OnlineToken[]>([]);
  const [devices, setDevices] = useState<OnlineDevice[]>([]);
  const [deviceLimit, setDeviceLimit] = useState<DeviceLimit | null>(null);
  const [pendingChanges, setPendingChanges] = useState<PendingChanges | null>(null);
  const [loading, setLoading] = useState(true);
  const [includeRevoked, setIncludeRevoked] = useState(false);

  // Dialog states
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [selectedToken, setSelectedToken] = useState<OnlineToken | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copied, setCopied] = useState(false);

  // ============================================================================
  // Data Loading (defined first so handlers can reference it)
  // ============================================================================
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tokensData, devicesData, limitData, changesData] = await Promise.all([
        onlineTokenService.getTokensBySubscription(subscriptionId, includeRevoked),
        onlineTokenService.getDevices(subscriptionId),
        onlineTokenService.getDeviceLimit(subscriptionId),
        onlineTokenService.getPendingChanges(subscriptionId),
      ]);
      setTokens(tokensData);
      setDevices(devicesData);
      setDeviceLimit(limitData);
      setPendingChanges(changesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, [subscriptionId, includeRevoked, onlineTokenService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================================================
  // Computed Values
  // ============================================================================
  const totalAllocatedDevices = useMemo(() => {
    return tokens
      .filter(t => t.isActive)
      .reduce((sum, t) => sum + (t.maxDevices ?? 0), 0);
  }, [tokens]);

  const maxDevicesAvailable = useMemo(() => {
    if (!deviceLimit) return 999;
    if (deviceLimit.isUnlimited) return 999;
    return Math.max(0, (deviceLimit.maxAllowed ?? 0) - totalAllocatedDevices);
  }, [deviceLimit, totalAllocatedDevices]);

  // ============================================================================
  // Handlers (defined before tokenActions so they can be referenced)
  // ============================================================================
  const handleGenerateToken = useCallback(async (formData: Record<string, any>) => {
    const requestedDevices = formData.maxDevices ?? 0;
    if (!deviceLimit?.isUnlimited && requestedDevices > maxDevicesAvailable) {
      return;
    }

    setIsSubmitting(true);
    try {
      const request = new GenerateOnlineTokenRequest({
        subscriptionId,
        name: formData.name,
        expiryDays: formData.expiryDays,
        autoRefreshEnabled: formData.autoRefreshEnabled,
        maxDevices: formData.maxDevices || undefined,
        notes: formData.notes || undefined,
      });
      
      const result = await onlineTokenService.generateToken(request);
      
      if (result.success && result.token) {
        setGeneratedToken(result.token);
        setShowGenerateDialog(false);
        setShowTokenDialog(true);
        loadData();
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [subscriptionId, deviceLimit, maxDevicesAvailable, onlineTokenService, loadData]);

  const handleRevokeToken = useCallback(async () => {
    if (!selectedToken) return;
    
    setIsRevoking(true);
    try {
      const success = await onlineTokenService.revokeToken(selectedToken.id, "Admin revoked");
      if (success) {
        setShowRevokeDialog(false);
        setSelectedToken(null);
        loadData();
      }
    } finally {
      setIsRevoking(false);
    }
  }, [selectedToken, onlineTokenService, loadData]);

  const handleRegenerateToken = useCallback(async (token: OnlineToken) => {
    setIsSubmitting(true);
    try {
      const result = await onlineTokenService.regenerateToken(token.id);
      if (result.success && result.token) {
        setGeneratedToken(result.token);
        setShowTokenDialog(true);
        loadData();
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [onlineTokenService, loadData]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, []);

  // ============================================================================
  // Field Configuration for Generate Token Form
  // ============================================================================
  const generateTokenFields: FieldConfig[] = useMemo(() => {
    // Only compute when dialog is shown to avoid re-initialization
    if (!showGenerateDialog) return [];
    return [
      {
        name: "name",
        label: `${t("onlineTokens.tokenName")} *`,
        type: "text",
        required: true,
        placeholder: t("onlineTokens.tokenNamePlaceholder"),
        maxLength: 100,
      },
      {
        name: "expiryDays",
        label: t("onlineTokens.expiryDays"),
        type: "number",
        required: true,
        min: 1,
        max: 3650,
        defaultValue: 90,
      },
      {
        name: "autoRefreshEnabled",
        label: t("onlineTokens.autoRefresh"),
        type: "switch",
        defaultValue: true,
      },
      {
        name: "maxDevices",
        label: t("onlineTokens.maxDevices"),
        type: "number",
        required: false,
        min: 1,
        max: maxDevicesAvailable > 0 ? maxDevicesAvailable : 999,
        placeholder: deviceLimit?.isUnlimited 
          ? t("onlineTokens.unlimited") 
          : `${t("onlineTokens.maxAvailable")}: ${maxDevicesAvailable}`,
        helperText: deviceLimit?.isUnlimited 
          ? t("onlineTokens.unlimitedDevices")
          : `${t("onlineTokens.allocatedDevices")}: ${totalAllocatedDevices}/${deviceLimit?.maxAllowed ?? 0}. ${t("onlineTokens.remainingSlots")}: ${maxDevicesAvailable}`,
      },
      {
        name: "notes",
        label: t("onlineTokens.notes"),
        type: "textarea",
        required: false,
        placeholder: t("onlineTokens.notesPlaceholder"),
        maxLength: 500,
      },
    ];
  }, [showGenerateDialog, t, maxDevicesAvailable, deviceLimit, totalAllocatedDevices]);

  // ============================================================================
  // Table Columns
  // ============================================================================
  const tokenColumns = useMemo(() => [
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

  const deviceColumns = useMemo(() => [
    {
      key: "deviceName" as keyof OnlineDevice,
      label: t("onlineTokens.deviceName"),
      render: (_: any, device: OnlineDevice) => {
        const type = device.deviceType?.toLowerCase() ?? "";
        let icon = <Monitor className="h-4 w-4" />;
        if (type.includes("mobile") || type.includes("phone")) icon = <Smartphone className="h-4 w-4" />;
        if (type.includes("server")) icon = <Server className="h-4 w-4" />;
        return (
          <div className="flex items-center gap-2">
            {icon}
            {device.deviceName}
          </div>
        );
      },
    },
    {
      key: "deviceType" as keyof OnlineDevice,
      label: t("onlineTokens.deviceType"),
    },
    {
      key: "lastSeenAtUtc" as keyof OnlineDevice,
      label: t("onlineTokens.lastSeen"),
      render: (_: any, device: OnlineDevice) => device.formattedLastSeen,
    },
    {
      key: "apiCallCount" as keyof OnlineDevice,
      label: t("onlineTokens.apiCalls"),
    },
  ], [t]);

  // Device actions
  const deviceActions = useMemo(() => [
    {
      label: t("onlineTokens.unbindDevice"),
      icon: Trash2,
      onClick: async (device: OnlineDevice) => {
        if (confirm(t("onlineTokens.confirmUnbind"))) {
          const success = await onlineTokenService.unbindDevice(device.id);
          if (success) {
            loadData();
          }
        }
      },
      variant: "destructive" as const,
    },
  ], [t, onlineTokenService, loadData]);

  // Token actions (now handlers are defined before this)
  const tokenActions = useMemo(() => [
    {
      label: t("common.regenerate"),
      icon: RefreshCw,
      onClick: handleRegenerateToken,
      show: (token: OnlineToken) => token.isActive,
    },
    {
      label: t("onlineTokens.revoke"),
      icon: Trash2,
      onClick: (token: OnlineToken) => {
        setSelectedToken(token);
        setShowRevokeDialog(true);
      },
      variant: "destructive" as const,
      show: (token: OnlineToken) => token.isActive,
    },
  ], [t, handleRegenerateToken]);

  // ============================================================================
  // Loading State
  // ============================================================================
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Stats
  const activeTokens = tokens.filter(t => t.isActive).length;

  return (
    <div className="space-y-6" dir={direction}>
      {/* Summary Cards */}
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
            <CardTitle className="text-sm font-medium">{t("onlineTokens.registeredDevices")}</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deviceLimit?.isUnlimited 
                ? devices.length 
                : `${devices.length} / ${deviceLimit?.maxAllowed ?? 0}`}
            </div>
            {!deviceLimit?.isUnlimited && deviceLimit && (
              <Progress 
                value={(devices.length / (deviceLimit.maxAllowed || 1)) * 100} 
                className="mt-2 h-2"
              />
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {t("onlineTokens.allocatedToTokens")}: {totalAllocatedDevices}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("onlineTokens.pendingChanges")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingChanges?.totalPendingChanges ?? 0}</div>
            {pendingChanges?.formattedNextChangeDate && (
              <p className="text-xs text-muted-foreground">
                {t("onlineTokens.nextChange")}: {pendingChanges.formattedNextChangeDate}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tokens" className="space-y-4" dir={direction}>
        <TabsList className={isRTL ? "flex-row-reverse" : ""}>
          {isRTL ? (
            <>
              <TabsTrigger value="changes" className="gap-2">
                <Activity className="h-4 w-4" />
                {t("onlineTokens.changes")}
              </TabsTrigger>
              <TabsTrigger value="devices" className="gap-2">
                <Monitor className="h-4 w-4" />
                {t("onlineTokens.devices")}
              </TabsTrigger>
              <TabsTrigger value="tokens" className="gap-2">
                <Key className="h-4 w-4" />
                {t("onlineTokens.tokens")}
              </TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="tokens" className="gap-2">
                <Key className="h-4 w-4" />
                {t("onlineTokens.tokens")}
              </TabsTrigger>
              <TabsTrigger value="devices" className="gap-2">
                <Monitor className="h-4 w-4" />
                {t("onlineTokens.devices")}
              </TabsTrigger>
              <TabsTrigger value="changes" className="gap-2">
                <Activity className="h-4 w-4" />
                {t("onlineTokens.changes")}
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Tokens Tab */}
        <TabsContent value="tokens" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="includeRevoked"
                checked={includeRevoked}
                onCheckedChange={setIncludeRevoked}
              />
              <Label htmlFor="includeRevoked">{t("onlineTokens.showRevoked")}</Label>
            </div>
            <Button 
              onClick={() => setShowGenerateDialog(true)} 
              className="gap-2"
              disabled={!deviceLimit?.isUnlimited && maxDevicesAvailable <= 0}
            >
              <Plus className="h-4 w-4" />
              {t("onlineTokens.generateToken")}
            </Button>
          </div>

          {!deviceLimit?.isUnlimited && maxDevicesAvailable <= 0 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              {t("onlineTokens.noDeviceSlotsAvailable")}
            </div>
          )}

          <Card>
            <CardContent className="pt-6">
              <GenericTable<OnlineToken>
                data={tokens}
                columns={tokenColumns}
                actions={tokenActions}
                emptyMessage={t("onlineTokens.noTokens")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("onlineTokens.connectedDevices")}</CardTitle>
              <CardDescription>
                {devices.length} {t("onlineTokens.devicesRegistered")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {devices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t("onlineTokens.noDevices")}</p>
                </div>
              ) : (
                <GenericTable<OnlineDevice>
                  data={devices}
                  columns={deviceColumns}
                  actions={deviceActions}
                  emptyMessage={t("onlineTokens.noDevices")}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Changes Tab */}
        <TabsContent value="changes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("onlineTokens.pendingChangesTitle")}</CardTitle>
              <CardDescription>
                {t("onlineTokens.pendingChangesDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!pendingChanges?.changes?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t("onlineTokens.noChanges")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingChanges.changes.map((change) => (
                    <div key={change.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{change.changeDescription}</span>
                        <Badge variant="outline">{change.effectPolicy}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("onlineTokens.effectiveDate")}: {change.formattedEffectiveDate}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Token Modal */}
      <GenericModal
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        title={t("onlineTokens.generateToken")}
        description={t("onlineTokens.generateDescription")}
      >
        {generateTokenFields.length > 0 && (
          <GenericForm
            fields={generateTokenFields}
            onSubmit={handleGenerateToken}
            onCancel={() => setShowGenerateDialog(false)}
          />
        )}
      </GenericModal>

      {/* Generated Token Display Dialog */}
      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent className="sm:max-w-md" dir={direction}>
          <DialogHeader className={isRTL ? "text-right" : ""}>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              {t("onlineTokens.tokenGenerated")}
            </DialogTitle>
            <DialogDescription>
              {t("onlineTokens.tokenGeneratedDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all">
              {generatedToken}
            </div>

            <div className={cn(
              "flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg",
              isRTL && "text-right"
            )}>
              <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                {t("onlineTokens.tokenSecurityWarning")}
              </p>
            </div>

            <Button
              className="w-full gap-2"
              onClick={() => generatedToken && copyToClipboard(generatedToken)}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {t("common.copied")}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  {t("onlineTokens.copyToken")}
                </>
              )}
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={() => {
              setShowTokenDialog(false);
              setGeneratedToken(null);
              setCopied(false);
            }}>
              {t("common.done")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <ConfirmationDialog
        open={showRevokeDialog}
        onOpenChange={setShowRevokeDialog}
        title={t("onlineTokens.revokeToken")}
        confirmText={t("onlineTokens.revoke")}
        cancelText={t("common.cancel")}
        onConfirm={handleRevokeToken}
        onCancel={() => {
          setShowRevokeDialog(false);
          setSelectedToken(null);
        }}
        variant="destructive"
        icon={<AlertTriangle className="h-6 w-6 text-destructive" />}
        isLoading={isRevoking}
      >
        <p className="text-muted-foreground">
          {t("onlineTokens.revokeDescription")}
        </p>
        {selectedToken && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="font-medium">{selectedToken.displayName}</p>
            <p className="text-sm text-muted-foreground">
              {t("onlineTokens.devices")}: {selectedToken.deviceUsageText}
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
}
