"use client";

import React, { useState } from "react";
import { useLicenseViewModel } from "@/viewmodels/license-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Key,
  RefreshCw,
  Download,
  Copy,
  Trash2,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Monitor,
  FileKey,
  Eye,
  EyeOff,
  Loader2,
  Building2,
  Calendar,
  Info,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { License, GenerateLicenseRequest, ValidateLicenseRequest } from "@/domain/models/license.model";

// ============================================================================
// License Info Card
// ============================================================================

interface LicenseInfoCardProps {
  license: License;
  onGenerate: () => void;
  onRegenerate: () => void;
  onRevoke: () => void;
  onDownload: () => void;
  onCopy: () => void;
  isGenerating: boolean;
}

function LicenseInfoCard({
  license,
  onGenerate,
  onRegenerate,
  onRevoke,
  onDownload,
  onCopy,
  isGenerating,
}: LicenseInfoCardProps) {
  const { t } = useI18n();
  const [showKey, setShowKey] = useState(false);

  const getStatusBadge = () => {
    const colorMap: Record<string, string> = {
      green: "bg-green-500/10 text-green-500 border-green-500/20",
      yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      red: "bg-red-500/10 text-red-500 border-red-500/20",
      gray: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };

    return (
      <Badge variant="outline" className={colorMap[license.statusColor] || colorMap.gray}>
        {license.status}
      </Badge>
    );
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <FileKey className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-xl">{t("license.title")}</CardTitle>
              <CardDescription>{t("license.subtitle")}</CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* License Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Building2 className="h-4 w-4" />
              <span className="text-sm">{t("license.company")}</span>
            </div>
            <p className="font-semibold truncate">{license.companyName}</p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Key className="h-4 w-4" />
              <span className="text-sm">{t("license.plan")}</span>
            </div>
            <p className="font-semibold truncate">{license.planName}</p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{t("license.expiresAt")}</span>
            </div>
            <p className="font-semibold">{license.formattedExpiryDate}</p>
            <p className={`text-xs ${
              license.expiryUrgency === 'critical' ? 'text-red-500' :
              license.expiryUrgency === 'warning' ? 'text-orange-500' :
              license.expiryUrgency === 'expired' ? 'text-red-500' :
              'text-muted-foreground'
            }`}>
              {license.isExpired 
                ? t("license.expired") 
                : `${license.daysUntilExpiry} ${t("license.daysRemaining")}`}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Monitor className="h-4 w-4" />
              <span className="text-sm">{t("license.machineBinding")}</span>
            </div>
            <p className="font-semibold">
              {license.isMachineBound ? t("license.bound") : t("license.notBound")}
            </p>
            {license.machineFingerprint && (
              <p className="text-xs text-muted-foreground truncate">
                {license.machineFingerprint}
              </p>
            )}
          </div>
        </div>

        {/* License Key Section */}
        {license.licenseKey && (
          <div className="p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">{t("license.licenseKey")}</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                value={showKey ? license.licenseKey : license.truncatedLicenseKey.replace(/./g, '•')}
                readOnly
                className="font-mono text-xs"
              />
              <Button variant="outline" size="icon" onClick={onCopy}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Info className="h-4 w-4" />
            <span>{t("license.version")}: v{license.keyVersion}</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span>{t("license.entitlementsVersion")}: v{license.entitlementsVersion}</span>
          </div>
          {license.generatedAtUtc && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{t("license.generatedAt")}: {license.formattedGeneratedDate}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          {!license.hasValidKey ? (
            <Button onClick={onGenerate} disabled={isGenerating || !license.canRegenerate}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Key className="mr-2 h-4 w-4" />
              )}
              {t("license.generate")}
            </Button>
          ) : (
            <>
              <Button onClick={onRegenerate} disabled={isGenerating || !license.canRegenerate}>
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {t("license.regenerate")}
              </Button>
              <Button variant="outline" onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" />
                {t("license.download")}
              </Button>
              <Button variant="outline" onClick={onCopy}>
                <Copy className="mr-2 h-4 w-4" />
                {t("license.copy")}
              </Button>
              <Button variant="destructive" onClick={onRevoke} disabled={!license.canRevoke}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t("license.revoke")}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Generate License Dialog
// ============================================================================

interface GenerateLicenseDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (request: GenerateLicenseRequest) => Promise<void>;
  isGenerating: boolean;
}

function GenerateLicenseDialog({ open, onClose, onGenerate, isGenerating }: GenerateLicenseDialogProps) {
  const { t } = useI18n();
  const [notes, setNotes] = useState("");
  const [allowMultipleMachines, setAllowMultipleMachines] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate(new GenerateLicenseRequest({
      notes: notes || undefined,
      allowMultipleMachines,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-purple-500" />
            {t("license.generateTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("license.generateDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("license.notes")}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("license.notesPlaceholder")}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label>{t("license.allowMultipleMachines")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("license.allowMultipleMachinesDesc")}
              </p>
            </div>
            <Switch
              checked={allowMultipleMachines}
              onCheckedChange={setAllowMultipleMachines}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Key className="mr-2 h-4 w-4" />
              )}
              {t("license.generate")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// License Key Result Dialog
// ============================================================================

interface LicenseKeyDialogProps {
  open: boolean;
  onClose: () => void;
  licenseKey: string;
  onCopy: () => void;
  onDownload: () => void;
}

function LicenseKeyDialog({ open, onClose, licenseKey, onCopy, onDownload }: LicenseKeyDialogProps) {
  const { t } = useI18n();
  const [showKey, setShowKey] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-500" />
            {t("license.generatedSuccessfully")}
          </DialogTitle>
          <DialogDescription>
            {t("license.saveKeyWarning")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-green-500/5 border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">{t("license.yourLicenseKey")}</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="p-3 bg-background rounded border font-mono text-xs break-all max-h-40 overflow-auto">
              {showKey ? licenseKey : licenseKey.slice(0, 50) + '•••••••••••••••'}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
            <p className="text-sm text-orange-600 dark:text-orange-400">
              {t("license.keyNotStoredWarning")}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCopy}>
            <Copy className="mr-2 h-4 w-4" />
            {t("license.copy")}
          </Button>
          <Button variant="outline" onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            {t("license.downloadFile")}
          </Button>
          <Button onClick={onClose}>
            {t("common.done")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Validate License Dialog
// ============================================================================

interface ValidateLicenseDialogProps {
  open: boolean;
  onClose: () => void;
  onValidate: (request: ValidateLicenseRequest) => Promise<void>;
  validationResult: any;
  isValidating: boolean;
}

function ValidateLicenseDialog({ 
  open, 
  onClose, 
  onValidate, 
  validationResult,
  isValidating 
}: ValidateLicenseDialogProps) {
  const { t } = useI18n();
  const [licenseKey, setLicenseKey] = useState("");
  const [validateOnline, setValidateOnline] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onValidate(new ValidateLicenseRequest({
      licenseKey,
      validateOnline,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            {t("license.validateTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("license.validateDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("license.licenseKey")}</Label>
            <Textarea
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder={t("license.pasteKeyHere")}
              rows={4}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label>{t("license.validateOnline")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("license.validateOnlineDesc")}
              </p>
            </div>
            <Switch
              checked={validateOnline}
              onCheckedChange={setValidateOnline}
            />
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div className={`p-4 rounded-lg border ${
              validationResult.isValid 
                ? 'bg-green-500/5 border-green-500/20' 
                : 'bg-red-500/5 border-red-500/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {validationResult.isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-semibold">
                  {validationResult.isValid ? t("license.valid") : t("license.invalid")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{validationResult.message}</p>
              
              {validationResult.isValid && (
                <div className="mt-3 space-y-1 text-sm">
                  <p><strong>{t("license.company")}:</strong> {validationResult.companyName}</p>
                  <p><strong>{t("license.plan")}:</strong> {validationResult.planName}</p>
                  <p><strong>{t("license.expiresAt")}:</strong> {validationResult.expiresAtUtc?.toLocaleDateString()}</p>
                </div>
              )}

              {validationResult.warnings?.length > 0 && (
                <div className="mt-3 p-2 rounded bg-yellow-500/10">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                    {t("license.warnings")}:
                  </p>
                  <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
                    {validationResult.warnings.map((w: string, i: number) => (
                      <li key={i}>• {w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.close")}
            </Button>
            <Button type="submit" disabled={isValidating || !licenseKey.trim()}>
              {isValidating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Shield className="mr-2 h-4 w-4" />
              )}
              {t("license.validate")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Revoke License Dialog
// ============================================================================

interface RevokeLicenseDialogProps {
  open: boolean;
  onClose: () => void;
  onRevoke: (reason?: string) => Promise<void>;
  isRevoking: boolean;
}

function RevokeLicenseDialog({ open, onClose, onRevoke, isRevoking }: RevokeLicenseDialogProps) {
  const { t } = useI18n();
  const [reason, setReason] = useState("");

  const handleRevoke = async () => {
    await onRevoke(reason || undefined);
    setReason("");
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShieldX className="h-5 w-5 text-red-500" />
            {t("license.revokeTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("license.revokeDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label>{t("license.revokeReason")}</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("license.revokeReasonPlaceholder")}
            rows={3}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRevoke}
            disabled={isRevoking}
            className="bg-red-500 hover:bg-red-600"
          >
            {isRevoking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {t("license.revoke")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function LicenseSkeleton() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-20" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main View
// ============================================================================

interface LicenseViewProps {
  subscriptionId: string;
}

export function LicenseView({ subscriptionId }: LicenseViewProps) {
  const vm = useLicenseViewModel(subscriptionId);
  const { t } = useI18n();

  if (vm.isLoading) {
    return <LicenseSkeleton />;
  }

  if (vm.error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-lg font-medium mb-2">{t("common.error")}</p>
          <p className="text-muted-foreground mb-4">{vm.error}</p>
          <Button onClick={vm.refresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("common.retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!vm.license) {
    return (
      <>
        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileKey className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium mb-2">{t("license.noLicense")}</p>
            <p className="text-muted-foreground mb-4">{t("license.noLicenseDesc")}</p>
            <Button onClick={() => vm.openGenerateDialog(subscriptionId)}>
              <Key className="mr-2 h-4 w-4" />
              {t("license.generate")}
            </Button>
          </CardContent>
        </Card>

        {/* Generate Dialog - needed when no license exists */}
        <GenerateLicenseDialog
          open={vm.showGenerateDialog}
          onClose={vm.closeGenerateDialog}
          onGenerate={async (request) => {
            await vm.generateLicense(subscriptionId, request);
          }}
          isGenerating={vm.isGenerating}
        />

        {/* License Key Result Dialog */}
        {vm.generatedLicense && (
          <LicenseKeyDialog
            open={vm.showLicenseKeyDialog}
            onClose={vm.closeLicenseKeyDialog}
            licenseKey={vm.generatedLicense.licenseKey}
            onCopy={() => vm.copyLicenseKey(vm.generatedLicense!.licenseKey)}
            onDownload={() => vm.downloadLicense(subscriptionId)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <LicenseInfoCard
        license={vm.license}
        onGenerate={() => vm.openGenerateDialog(subscriptionId)}
        onRegenerate={() => vm.regenerateLicense(subscriptionId)}
        onRevoke={() => vm.openRevokeDialog(subscriptionId)}
        onDownload={() => vm.downloadLicense(subscriptionId)}
        onCopy={() => vm.license?.licenseKey && vm.copyLicenseKey(vm.license.licenseKey)}
        isGenerating={vm.isGenerating}
      />

      {/* Dialogs */}
      <GenerateLicenseDialog
        open={vm.showGenerateDialog}
        onClose={vm.closeGenerateDialog}
        onGenerate={async (request) => {
          await vm.generateLicense(subscriptionId, request);
        }}
        isGenerating={vm.isGenerating}
      />

      {vm.generatedLicense && (
        <LicenseKeyDialog
          open={vm.showLicenseKeyDialog}
          onClose={vm.closeLicenseKeyDialog}
          licenseKey={vm.generatedLicense.licenseKey}
          onCopy={() => vm.copyLicenseKey(vm.generatedLicense!.licenseKey)}
          onDownload={() => vm.downloadLicense(subscriptionId)}
        />
      )}

      <ValidateLicenseDialog
        open={vm.showValidateDialog}
        onClose={vm.closeValidateDialog}
        onValidate={vm.validateLicense}
        validationResult={vm.validationResult}
        isValidating={vm.isValidating}
      />

      <RevokeLicenseDialog
        open={vm.showRevokeDialog}
        onClose={vm.closeRevokeDialog}
        onRevoke={async (reason) => {
          await vm.revokeLicense(subscriptionId, reason);
        }}
        isRevoking={vm.isRevoking}
      />
    </>
  );
}
