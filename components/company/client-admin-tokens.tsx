"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { AdminToken, GenerateAdminTokenRequest } from "@/domain";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { GenericModal } from "@/components/ui/generic-modal";
import { GenericForm, FieldConfig } from "@/components/forms/generic-form";
import { GenericTable } from "@/components/ui/generic-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientAdminTokensProps {
  companyId: string;
}

export function ClientAdminTokens({ companyId }: ClientAdminTokensProps) {
  const { clientAdminTokenService } = useServices();
  const { t, direction } = useI18n();
  const isRTL = direction === "rtl";
  
  const [tokens, setTokens] = useState<AdminToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showGeneratedTokenDialog, setShowGeneratedTokenDialog] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [tokenToRevoke, setTokenToRevoke] = useState<AdminToken | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copied, setCopied] = useState(false);

  // ============================================================================
  // Field Configuration for Generate Token Form
  // ============================================================================

  const generateTokenFields: FieldConfig[] = useMemo(() => [
    {
      name: "name",
      label: `${t("clientAdminToken.name")} *`,
      type: "text",
      required: true,
      placeholder: t("clientAdminToken.namePlaceholder"),
      maxLength: 100,
    },
    {
      name: "expiryDays",
      label: t("clientAdminToken.expiryDays"),
      type: "number",
      required: true,
      min: 1,
      max: 3650,
      defaultValue: 365,
    },
    // Permissions
    {
      name: "canBindDevices",
      label: t("clientAdminToken.canBindDevices"),
      type: "switch",
      defaultValue: true,
    },
    {
      name: "canUnbindDevices",
      label: t("clientAdminToken.canUnbindDevices"),
      type: "switch",
      defaultValue: true,
    },
    {
      name: "canViewDevices",
      label: t("clientAdminToken.canViewDevices"),
      type: "switch",
      defaultValue: true,
    },
    {
      name: "canApproveReplacements",
      label: t("clientAdminToken.canApproveReplacements"),
      type: "switch",
      defaultValue: true,
    },
    {
      name: "dailyApiLimit",
      label: t("clientAdminToken.dailyApiLimit"),
      type: "number",
      min: 0,
      defaultValue: 0,
      helperText: t("clientAdminToken.dailyApiLimitHelper"),
    },
    {
      name: "notes",
      label: t("clientAdminToken.notes"),
      type: "textarea",
      placeholder: t("clientAdminToken.notesPlaceholder"),
      rows: 2,
    },
  ], [t]);

  const generateTokenInitialValues = useMemo(() => ({
    name: "",
    expiryDays: 365,
    canBindDevices: true,
    canUnbindDevices: true,
    canViewDevices: true,
    canApproveReplacements: true,
    dailyApiLimit: 0,
    notes: "",
  }), []);

  // ============================================================================
  // Table Columns
  // ============================================================================
  const columns = useMemo(() => [
    {
      key: "name" as keyof AdminToken,
      label: t("clientAdminToken.name"),
      render: (_: any, token: AdminToken) => (
        <div className="flex items-center gap-2 font-medium">
          <Key className="h-4 w-4 text-muted-foreground" />
          {token.name}
        </div>
      ),
    },
    {
      key: "isValid" as keyof AdminToken,
      label: t("clientAdminToken.status"),
      render: (_: any, token: AdminToken) => {
        if (!token.isValid || token.isExpired) {
          return <Badge variant="destructive">{t("clientAdminToken.expired")}</Badge>;
        }
        if (token.isExpiringSoon) {
          return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">{t("clientAdminToken.expiringSoon")}</Badge>;
        }
        return <Badge variant="default" className="bg-green-500/10 text-green-600">{t("clientAdminToken.active")}</Badge>;
      },
    },
    {
      key: "canBindDevices" as keyof AdminToken,
      label: t("clientAdminToken.permissions"),
      render: (_: any, token: AdminToken) => (
        <div className="flex gap-1 flex-wrap">
          {token.canBindDevices && (
            <Badge variant="outline" className="text-xs">{t("clientAdminToken.canBindDevices")}</Badge>
          )}
          {token.canViewDevices && (
            <Badge variant="outline" className="text-xs">{t("clientAdminToken.canViewDevices")}</Badge>
          )}
        </div>
      ),
    },
    {
      key: "expiresAtUtc" as keyof AdminToken,
      label: t("clientAdminToken.expiresAt"),
      render: (_: any, token: AdminToken) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {token.formattedExpiryDate}
        </div>
      ),
    },
    {
      key: "usageCount" as keyof AdminToken,
      label: t("clientAdminToken.usageCount"),
    },
  ], [t]);

  // Table actions
  const actions = useMemo(() => [
    {
      label: t("clientAdminToken.revoke"),
      icon: Trash2,
      onClick: (token: AdminToken) => {
        setTokenToRevoke(token);
        setShowRevokeDialog(true);
      },
      variant: "destructive" as const,
      show: (token: AdminToken) => token.isValid,
    },
  ], [t]);

  // ============================================================================
  // Data Loading
  // ============================================================================

  const loadTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await clientAdminTokenService.getTokensByCompany(companyId);
      setTokens(result);
    } catch (error) {
      console.error("Failed to load tokens:", error);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, clientAdminTokenService]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleGenerate = async (data: Record<string, any>) => {
    const request = new GenerateAdminTokenRequest({
      companyId,
      name: data.name,
      expiryDays: parseInt(data.expiryDays) || 365,
      canBindDevices: data.canBindDevices,
      canUnbindDevices: data.canUnbindDevices,
      canViewDevices: data.canViewDevices,
      canApproveReplacements: data.canApproveReplacements,
      dailyApiLimit: parseInt(data.dailyApiLimit) || 0,
      notes: data.notes || null,
    });
    
    const response = await clientAdminTokenService.generateToken(request);
    
    if (response.success && response.token) {
      setGeneratedToken(response.token);
      setShowGenerateDialog(false);
      setShowGeneratedTokenDialog(true);
      await loadTokens();
    }
  };

  const handleRevoke = async () => {
    if (!tokenToRevoke) return;
    
    try {
      setIsRevoking(true);
      await clientAdminTokenService.revokeToken(tokenToRevoke.id);
      setShowRevokeDialog(false);
      setTokenToRevoke(null);
      await loadTokens();
    } catch (error) {
      console.error("Failed to revoke token:", error);
    } finally {
      setIsRevoking(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card dir={isRTL ? "rtl" : "ltr"}>
        <CardHeader className={cn("flex flex-row items-center justify-between", isRTL && "")}>
          <div className={isRTL ? "text-right" : "text-left"}>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "")}>
              <Key className="h-5 w-5" />
              {t("clientAdminToken.title")}
            </CardTitle>
            <CardDescription>
              {t("clientAdminToken.description")}
            </CardDescription>
          </div>
          <Button onClick={() => setShowGenerateDialog(true)} className={cn("gap-2", isRTL && "")}>
            <Plus className="h-4 w-4" />
            {t("clientAdminToken.generate")}
          </Button>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <div className="text-center py-12">
              <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">{t("clientAdminToken.noTokens")}</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                {t("clientAdminToken.noTokensDescription")}
              </p>
              <Button onClick={() => setShowGenerateDialog(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                {t("clientAdminToken.generate")}
              </Button>
            </div>
          ) : (
            <GenericTable<AdminToken>
              data={tokens}
              columns={columns}
              actions={actions}
              emptyMessage={t("clientAdminToken.noTokens")}
            />
          )}
        </CardContent>
      </Card>

      {/* Generate Token Modal */}
      <GenericModal
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        title={t("clientAdminToken.generateTitle")}
        description={t("clientAdminToken.generateDescription")}
        size="md"
        formKey={showGenerateDialog ? "generate-token" : undefined}
      >
        <GenericForm
          fields={generateTokenFields}
          initialValues={generateTokenInitialValues}
          onSubmit={handleGenerate}
          onCancel={() => setShowGenerateDialog(false)}
        />
      </GenericModal>

      {/* Generated Token Success Dialog */}
      <Dialog open={showGeneratedTokenDialog} onOpenChange={setShowGeneratedTokenDialog}>
        <DialogContent className="sm:max-w-[600px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              {t("clientAdminToken.generatedSuccessfully")}
            </DialogTitle>
            <DialogDescription>
              {t("clientAdminToken.saveTokenWarning")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Token Display */}
            <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all">
              {generatedToken}
            </div>

            {/* Warning */}
            <div className={cn("flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg", isRTL && " text-right")}>
              <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">
                {t("clientAdminToken.tokenNotStoredWarning")}
              </p>
            </div>

            {/* Copy Button */}
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
                  {t("clientAdminToken.copy")}
                </>
              )}
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={() => {
              setShowGeneratedTokenDialog(false);
              setGeneratedToken(null);
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
        title={t("clientAdminToken.revokeTitle")}
        confirmText={t("clientAdminToken.revoke")}
        cancelText={t("common.cancel")}
        onConfirm={handleRevoke}
        onCancel={() => {
          setShowRevokeDialog(false);
          setTokenToRevoke(null);
        }}
        variant="destructive"
        icon={<AlertTriangle className="h-6 w-6 text-destructive" />}
        isLoading={isRevoking}
      >
        <p className="text-muted-foreground">
          {t("clientAdminToken.revokeDescription")}
        </p>
        {tokenToRevoke && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="font-medium">{tokenToRevoke.name}</p>
            <p className="text-sm text-muted-foreground">
              {t("clientAdminToken.usageCount")}: {tokenToRevoke.usageCount}
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </>
  );
}
