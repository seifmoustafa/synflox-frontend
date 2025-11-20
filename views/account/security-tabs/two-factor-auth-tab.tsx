"use client";

import { Shield, Smartphone, CheckCircle2, AlertCircle, Loader2, Copy, X, Lock } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '@/providers/i18n-provider';
import { use2FAManagementViewModel } from '@/viewmodels/security/use-2fa-management-viewmodel';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TwoFactorAuthTabProps {
  initialIs2FAEnabled?: boolean;
}

export function TwoFactorAuthTab({ initialIs2FAEnabled = false }: TwoFactorAuthTabProps) {
  const { t, direction } = useI18n();
  const vm = use2FAManagementViewModel(initialIs2FAEnabled);
  const isRTL = direction === 'rtl';

  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyManualKey = async () => {
    if (vm.qrCodeSetup) {
      await navigator.clipboard.writeText(vm.qrCodeSetup.manualEntryKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Success Message */}
      {vm.successMessage && (
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-300">
            {vm.successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {vm.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{vm.error}</AlertDescription>
        </Alert>
      )}

      {/* 2FA Status Card */}
      <div className="p-6 rounded-lg border bg-card shadow-sm">
        <div className={cn("flex items-center justify-between mb-4",)}>
          <div className={cn("flex items-center gap-3",)}>
            <div className={cn(
              "p-3 rounded-lg",
              vm.is2FAEnabled ? "bg-green-100 dark:bg-green-900/30" : "bg-orange-100 dark:bg-orange-900/30"
            )}>
              <Shield className={cn(
                "w-6 h-6",
                vm.is2FAEnabled ? "text-green-600" : "text-orange-600"
              )} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {t('security.twoFactorAuth') || 'Two-Factor Authentication'}
              </h3>
              <p className={cn(
                "text-sm font-medium",
                vm.is2FAEnabled ? "text-green-600" : "text-orange-600"
              )}>
                {vm.is2FAEnabled
                  ? t('security.enabled') || 'Enabled'
                  : t('security.disabled') || 'Disabled'}
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          {vm.is2FAEnabled
            ? t('security.2FAEnabledDesc') || 'Your account is protected with two-factor authentication'
            : t('security.2FADisabledDesc') || 'Add an extra layer of security to your account'}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!vm.is2FAEnabled ? (
            <Button
              onClick={vm.handleEnable2FA}
              disabled={vm.isLoading}
              className="flex-1"
              size="lg"
            >
              {vm.isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> {t('common.loading')}</>
              ) : (
                <><Shield className="w-5 h-5 mr-2" /> {t('security.enable2FA') || 'Enable 2FA'}</>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setShowResetDialog(true)}
                variant="outline"
                disabled={vm.isLoading}
                className="flex-1"
              >
                {t('security.reset2FA') || 'Reset 2FA'}
              </Button>
              <Button
                onClick={() => setShowDisableDialog(true)}
                variant="destructive"
                disabled={vm.isLoading}
                className="flex-1"
              >
                {t('security.disable2FA') || 'Disable 2FA'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* QR Code Setup Dialog */}
      {vm.showQRCode && vm.qrCodeSetup && (
        <Dialog open={vm.showQRCode} onOpenChange={vm.closeQRCode}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('security.setupAuthenticator') || 'Setup Authenticator'}</DialogTitle>
              <DialogDescription>
                {t('security.scanQRCode') || 'Scan the QR code with your authenticator app'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-6 bg-white dark:bg-white rounded-xl border-2 shadow-lg">
                  <img
                    src={vm.qrCodeSetup.qrCodeDataUrl}
                    alt="QR Code"
                    className="w-72 h-72"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                </div>
              </div>

              {/* Manual Entry Key */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  {t('security.manualEntry') || 'Or enter this key manually'}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={vm.qrCodeSetup.formattedManualKey}
                    readOnly
                    className="font-mono text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyManualKey}
                  >
                    {copiedKey ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Verification Code Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  {t('security.enter6DigitCode') || 'Enter 6-digit code from your app'}
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={vm.verificationCode}
                  onChange={(e) => vm.handleVerificationCodeChange(e.target.value)}
                  placeholder="000000"
                  disabled={vm.isLoading}
                  className="text-center tracking-wider text-2xl font-mono h-14"
                />
              </div>

              {/* Verify Button */}
              <Button
                onClick={vm.handleVerify2FA}
                disabled={!vm.canVerify || vm.isLoading}
                className="w-full"
                size="lg"
              >
                {vm.isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> {t('common.verifying')}</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5 mr-2" /> {t('security.verifyAndEnable') || 'Verify & Enable'}</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('security.disable2FATitle') || 'Disable Two-Factor Authentication?'}</DialogTitle>
            <DialogDescription>
              {t('security.disable2FAWarning') || 'This will make your account less secure. Enter your password to confirm.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                {t('security.currentPassword') || 'Current Password'}
              </label>
              <Input
                type="password"
                value={vm.currentPassword}
                onChange={(e) => vm.handlePasswordChange(e.target.value)}
                placeholder={t('security.enterPassword') || 'Enter your password'}
                disabled={vm.isLoading}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDisableDialog(false)}
                className="flex-1"
                disabled={vm.isLoading}
              >
                {t('common.cancel') || 'Cancel'}
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  await vm.handleDisable2FA();
                  setShowDisableDialog(false);
                }}
                disabled={!vm.canDisable || vm.isLoading}
                className="flex-1"
              >
                {vm.isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t('common.disabling')}</>
                ) : (
                  <>{t('security.disable') || 'Disable'}</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset 2FA Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('security.reset2FATitle') || 'Reset Two-Factor Authentication'}</DialogTitle>
            <DialogDescription>
              {t('security.reset2FADesc') || 'Generate a new secret and QR code. Enter your password to confirm.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                {t('security.currentPassword') || 'Current Password'}
              </label>
              <Input
                type="password"
                value={vm.currentPassword}
                onChange={(e) => vm.handlePasswordChange(e.target.value)}
                placeholder={t('security.enterPassword') || 'Enter your password'}
                disabled={vm.isLoading}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowResetDialog(false)}
                className="flex-1"
                disabled={vm.isLoading}
              >
                {t('common.cancel') || 'Cancel'}
              </Button>
              <Button
                onClick={async () => {
                  await vm.handleReset2FA();
                  setShowResetDialog(false);
                }}
                disabled={!vm.canReset || vm.isLoading}
                className="flex-1"
              >
                {vm.isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t('common.resetting')}</>
                ) : (
                  <>{t('security.reset') || 'Reset'}</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Section */}
      <div className="p-6 rounded-lg border bg-muted/50">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          {t('security.recommendedApps') || 'Recommended Authenticator Apps'}
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Google Authenticator (iOS, Android)</li>
          <li>• Microsoft Authenticator (iOS, Android)</li>
          <li>• Authy (iOS, Android, Desktop)</li>
          <li>• 1Password (iOS, Android, Desktop)</li>
        </ul>
      </div>
    </div>
  );
}
