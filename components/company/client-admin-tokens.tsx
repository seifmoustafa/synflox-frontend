"use client";

import { useState, useEffect } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { AdminToken, GenerateAdminTokenRequest } from "@/domain";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Eye,
  Link2,
  RefreshCw,
  AlertCircle,
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showGeneratedTokenDialog, setShowGeneratedTokenDialog] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [tokenToRevoke, setTokenToRevoke] = useState<AdminToken | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    expiryDays: "365",
    canBindDevices: true,
    canUnbindDevices: true,
    canViewDevices: true,
    canApproveReplacements: true,
    dailyApiLimit: "0",
    notes: "",
  });

  useEffect(() => {
    loadTokens();
  }, [companyId]);

  const loadTokens = async () => {
    try {
      setIsLoading(true);
      const result = await clientAdminTokenService.getTokensByCompany(companyId);
      setTokens(result);
    } catch (error) {
      console.error("Failed to load tokens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!formData.name.trim()) return;
    
    try {
      setIsGenerating(true);
      const request = new GenerateAdminTokenRequest({
        companyId,
        name: formData.name,
        expiryDays: parseInt(formData.expiryDays) || 365,
        canBindDevices: formData.canBindDevices,
        canUnbindDevices: formData.canUnbindDevices,
        canViewDevices: formData.canViewDevices,
        canApproveReplacements: formData.canApproveReplacements,
        dailyApiLimit: parseInt(formData.dailyApiLimit) || 0,
        notes: formData.notes || null,
      });
      
      const response = await clientAdminTokenService.generateToken(request);
      
      if (response.success && response.token) {
        setGeneratedToken(response.token);
        setShowGenerateDialog(false);
        setShowGeneratedTokenDialog(true);
        // Reset form
        setFormData({
          name: "",
          expiryDays: "365",
          canBindDevices: true,
          canUnbindDevices: true,
          canViewDevices: true,
          canApproveReplacements: true,
          dailyApiLimit: "0",
          notes: "",
        });
        // Reload tokens
        loadTokens();
      }
    } catch (error) {
      console.error("Failed to generate token:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async () => {
    if (!tokenToRevoke) return;
    
    try {
      setIsRevoking(true);
      await clientAdminTokenService.revokeToken(tokenToRevoke.id);
      setShowRevokeDialog(false);
      setTokenToRevoke(null);
      loadTokens();
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

  const getStatusBadge = (token: AdminToken) => {
    if (!token.isValid || token.isExpired) {
      return <Badge variant="destructive">{t("clientAdminToken.expired")}</Badge>;
    }
    if (token.isExpiringSoon) {
      return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">{t("clientAdminToken.expiringSoon")}</Badge>;
    }
    return <Badge variant="default" className="bg-green-500/10 text-green-600">{t("clientAdminToken.active")}</Badge>;
  };

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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={isRTL ? "text-right" : ""}>{t("clientAdminToken.name")}</TableHead>
                    <TableHead className={isRTL ? "text-right" : ""}>{t("clientAdminToken.status")}</TableHead>
                    <TableHead className={isRTL ? "text-right" : ""}>{t("clientAdminToken.permissions")}</TableHead>
                    <TableHead className={isRTL ? "text-right" : ""}>{t("clientAdminToken.expiresAt")}</TableHead>
                    <TableHead className={isRTL ? "text-right" : ""}>{t("clientAdminToken.usageCount")}</TableHead>
                    <TableHead className={isRTL ? "text-left" : "text-right"}>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.map((token) => (
                    <TableRow key={token.id}>
                      <TableCell className="font-medium">{token.name}</TableCell>
                      <TableCell>{getStatusBadge(token)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {token.canBindDevices && (
                            <Badge variant="outline" className="text-xs">{t("clientAdminToken.canBindDevices")}</Badge>
                          )}
                          {token.canViewDevices && (
                            <Badge variant="outline" className="text-xs">{t("clientAdminToken.canViewDevices")}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={cn("flex items-center gap-2", isRTL && " justify-end")}>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {token.formattedExpiryDate}
                        </div>
                      </TableCell>
                      <TableCell>{token.usageCount}</TableCell>
                      <TableCell className={isRTL ? "text-left" : "text-right"}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setTokenToRevoke(token);
                            setShowRevokeDialog(true);
                          }}
                          disabled={!token.isValid}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Token Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-[500px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t("clientAdminToken.generateTitle")}</DialogTitle>
            <DialogDescription>
              {t("clientAdminToken.generateDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Token Name */}
            <div className="space-y-2">
              <Label>{t("clientAdminToken.name")} *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("clientAdminToken.namePlaceholder")}
              />
            </div>

            {/* Expiry Days */}
            <div className="space-y-2">
              <Label>{t("clientAdminToken.expiryDays")}</Label>
              <Input
                type="number"
                value={formData.expiryDays}
                onChange={(e) => setFormData({ ...formData, expiryDays: e.target.value })}
                min={1}
                max={3650}
              />
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <Label>{t("clientAdminToken.permissions")}</Label>
              <div className="space-y-2">
                <div className={cn("flex items-center justify-between", isRTL && "")}>
                  <span className="text-sm">{t("clientAdminToken.canBindDevices")}</span>
                  <Switch
                    checked={formData.canBindDevices}
                    onCheckedChange={(checked) => setFormData({ ...formData, canBindDevices: checked })}
                  />
                </div>
                <div className={cn("flex items-center justify-between", isRTL && "")}>
                  <span className="text-sm">{t("clientAdminToken.canUnbindDevices")}</span>
                  <Switch
                    checked={formData.canUnbindDevices}
                    onCheckedChange={(checked) => setFormData({ ...formData, canUnbindDevices: checked })}
                  />
                </div>
                <div className={cn("flex items-center justify-between", isRTL && "")}>
                  <span className="text-sm">{t("clientAdminToken.canViewDevices")}</span>
                  <Switch
                    checked={formData.canViewDevices}
                    onCheckedChange={(checked) => setFormData({ ...formData, canViewDevices: checked })}
                  />
                </div>
                <div className={cn("flex items-center justify-between", isRTL && "")}>
                  <span className="text-sm">{t("clientAdminToken.canApproveReplacements")}</span>
                  <Switch
                    checked={formData.canApproveReplacements}
                    onCheckedChange={(checked) => setFormData({ ...formData, canApproveReplacements: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Daily API Limit */}
            <div className="space-y-2">
              <Label>{t("clientAdminToken.dailyApiLimit")}</Label>
              <Input
                type="number"
                value={formData.dailyApiLimit}
                onChange={(e) => setFormData({ ...formData, dailyApiLimit: e.target.value })}
                min={0}
              />
              <p className="text-xs text-muted-foreground">{t("clientAdminToken.dailyApiLimitHelper")}</p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>{t("clientAdminToken.notes")}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t("clientAdminToken.notesPlaceholder")}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className={isRTL ? "" : ""}>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={!formData.name.trim() || isGenerating}
              className={cn("gap-2", isRTL && "")}
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {t("clientAdminToken.generate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
