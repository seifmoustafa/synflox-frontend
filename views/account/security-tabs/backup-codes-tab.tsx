"use client";

import { Key, Download, Copy, Trash2, CheckCircle2, AlertCircle, AlertTriangle, Loader2, Lock, FileText, FileJson } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '@/providers/i18n-provider';
import { useBackupCodesViewModel } from '@/viewmodels/security/use-backup-codes-viewmodel';
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
  DialogFooter,
} from '@/components/ui/dialog';

export function BackupCodesTab() {
  const { t, direction } = useI18n();
  const vm = useBackupCodesViewModel();
  const isRTL = direction === 'rtl';

  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

      {/* Backup Codes Status Card */}
      {vm.backupCodesStatus && (
        <div className="p-6 rounded-lg border bg-card shadow-sm">
          <div className={cn("flex items-center justify-between mb-4",)}>
            <div className={cn("flex items-center gap-3",)}>
              <div className={cn(
                "p-3 rounded-lg",
                vm.backupCodesStatus.statusLevel === 'success' && "bg-green-100 dark:bg-green-900/30",
                vm.backupCodesStatus.statusLevel === 'warning' && "bg-orange-100 dark:bg-orange-900/30",
                vm.backupCodesStatus.statusLevel === 'danger' && "bg-red-100 dark:bg-red-900/30"
              )}>
                <Key className={cn(
                  "w-6 h-6",
                  vm.backupCodesStatus.statusLevel === 'success' && "text-green-600",
                  vm.backupCodesStatus.statusLevel === 'warning' && "text-orange-600",
                  vm.backupCodesStatus.statusLevel === 'danger' && "text-red-600"
                )} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {t('security.backupCodes') || 'Backup Codes'}
                </h3>
                <p className={cn(
                  "text-sm font-medium",
                  vm.backupCodesStatus.statusLevel === 'success' && "text-green-600",
                  vm.backupCodesStatus.statusLevel === 'warning' && "text-orange-600",
                  vm.backupCodesStatus.statusLevel === 'danger' && "text-red-600"
                )}>
                  {vm.backupCodesStatus.statusMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  vm.backupCodesStatus.statusLevel === 'success' && "bg-green-500",
                  vm.backupCodesStatus.statusLevel === 'warning' && "bg-orange-500",
                  vm.backupCodesStatus.statusLevel === 'danger' && "bg-red-500"
                )}
                style={{ width: `${vm.backupCodesStatus.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4 p-4 rounded-lg bg-muted/50">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('security.total') || 'Total'}</p>
              <p className="text-2xl font-bold">{vm.backupCodesStatus.totalCodes}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('security.remaining') || 'Remaining'}</p>
              <p className="text-2xl font-bold text-green-600">{vm.backupCodesStatus.remainingCodes}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('security.used') || 'Used'}</p>
              <p className="text-2xl font-bold text-orange-600">{vm.backupCodesStatus.usedCodes}</p>
            </div>
          </div>

          {/* Warning Messages */}
          {vm.backupCodesStatus.needsRegeneration && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t('security.noCodesRemaining') || 'All backup codes used! Generate new codes immediately.'}
              </AlertDescription>
            </Alert>
          )}

          {vm.backupCodesStatus.lowCodesWarning && !vm.backupCodesStatus.needsRegeneration && (
            <Alert className="mb-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-300">
                {t('security.lowCodesWarning') || 'Running low on backup codes. Consider generating new ones.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => setShowGenerateDialog(true)}
              disabled={vm.isLoading}
              className="flex-1"
              variant={vm.backupCodesStatus.needsRegeneration ? "default" : "outline"}
            >
              <Key className="w-4 h-4 mr-2" />
              {t('security.generateNewCodes') || 'Generate New Codes'}
            </Button>
            {vm.backupCodesStatus.hasBackupCodes && (
              <Button
                onClick={() => setShowDeleteDialog(true)}
                disabled={vm.isLoading}
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('security.deleteAll') || 'Delete All'}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Generated Codes Display */}
      {vm.showCodes && vm.generatedCodes && (
        <div className="p-6 rounded-lg border bg-card shadow-sm space-y-4">
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-300">
              {t('security.saveCodesWarning') || 'Save these codes now! They will only be shown once.'}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-semibold">{t('security.yourBackupCodes') || 'Your Backup Codes'}</h4>
            <div className="grid grid-cols-2 gap-2">
              {vm.generatedCodes.formattedCodes.map((code, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 font-mono"
                >
                  <span className="text-sm font-semibold">{code}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => vm.handleCopyCode(code)}
                    className="h-8 w-8"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="pt-4 border-t space-y-3">
            <h4 className="font-semibold">{t('security.exportCodes') || 'Export Codes'}</h4>
            <div className="flex gap-2">
              <Button
                onClick={() => vm.handleExportCodes('txt')}
                variant="outline"
                disabled={vm.isExporting}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                {t('security.exportText') || 'Text File'}
              </Button>
              <Button
                onClick={() => vm.handleExportCodes('json')}
                variant="outline"
                disabled={vm.isExporting}
                className="flex-1"
              >
                <FileJson className="w-4 h-4 mr-2" />
                {t('security.exportJSON') || 'JSON'}
              </Button>
              <Button
                onClick={() => vm.handleExportCodes('pdf')}
                variant="outline"
                disabled={vm.isExporting}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('security.exportPDF') || 'PDF'}
              </Button>
            </div>
          </div>

          {/* Copy All Button */}
          <Button
            onClick={vm.handleCopyAllCodes}
            variant="outline"
            className="w-full"
          >
            <Copy className="w-4 h-4 mr-2" />
            {t('security.copyAllCodes') || 'Copy All Codes'}
          </Button>

          <Button
            onClick={vm.handleCloseCodes}
            variant="secondary"
            className="w-full"
          >
            {t('security.closeAndFinish') || 'Close & Finish'}
          </Button>
        </div>
      )}

      {/* Generate Codes Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('security.generateBackupCodes') || 'Generate Backup Codes'}</DialogTitle>
            <DialogDescription>
              {t('security.generateCodesDesc') || 'This will invalidate all previous backup codes. Enter your password to confirm.'}
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
                disabled={vm.isGenerating}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGenerateDialog(false)}
              disabled={vm.isGenerating}
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              onClick={async () => {
                await vm.handleGenerateCodes();
                setShowGenerateDialog(false);
              }}
              disabled={!vm.canGenerate || vm.isGenerating}
            >
              {vm.isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t('common.generating')}</>
              ) : (
                <><Key className="w-4 h-4 mr-2" /> {t('security.generate') || 'Generate'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Codes Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('security.deleteAllCodes') || 'Delete All Backup Codes?'}</DialogTitle>
            <DialogDescription>
              {t('security.deleteCodesWarning') || 'This action cannot be undone. You will need to generate new codes to use backup code recovery.'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={vm.isLoading}
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await vm.handleDeleteCodes();
                setShowDeleteDialog(false);
              }}
              disabled={vm.isLoading}
            >
              {vm.isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t('common.deleting')}</>
              ) : (
                <><Trash2 className="w-4 h-4 mr-2" /> {t('security.delete') || 'Delete'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Section */}
      <div className="p-6 rounded-lg border bg-muted/50">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          {t('security.aboutBackupCodes') || 'About Backup Codes'}
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• {t('security.backupCodesInfo1') || 'Each code can only be used once'}</li>
          <li>• {t('security.backupCodesInfo2') || 'Store them in a safe place'}</li>
          <li>• {t('security.backupCodesInfo3') || 'Use them if you lose access to your authenticator app'}</li>
          <li>• {t('security.backupCodesInfo4') || 'Generate new codes when you run low'}</li>
        </ul>
      </div>
    </div>
  );
}
