"use client";

import { useState } from 'react';
import { Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export function DeleteAccountTab() {
  const { t, direction } = useI18n();
  const isRTL = direction === 'rtl';
  const [agreed, setAgreed] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDelete = () => {
    if (!agreed) return;
    setShowConfirmDialog(true);
    // TODO: Implement actual delete account logic
  };

  return (
    <div className="space-y-6">
      {/* Warning Card */}
      <Card className="border-destructive/50 bg-destructive/5 dark:bg-destructive/10">
        <CardHeader>
          <div className={cn(
            "flex items-start gap-3",
           
          )}>
            <div className="p-2 rounded-lg bg-destructive/10 dark:bg-destructive/20">
              <ShieldAlert className="w-5 h-5 text-destructive" />
            </div>
            <div className={cn("flex-1", isRTL && "text-right")}>
              <CardTitle className="text-destructive">
                {t('security.deleteAccount') || 'Delete Account'}
              </CardTitle>
              <CardDescription className="mt-1.5">
                {t('security.deleteAccountWarning') || 'This action is permanent and cannot be undone'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('security.beforeDelete') || 'Before You Delete Your Account'}
          </CardTitle>
          <CardDescription>
            {t('security.beforeDeleteDesc') || 'Please read and understand the following:'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              t('security.deletePolicy1') || 'All your personal data will be permanently deleted',
              t('security.deletePolicy2') || 'You will lose access to all your companies and licenses',
              t('security.deletePolicy3') || 'Active subscriptions will be cancelled immediately',
              t('security.deletePolicy4') || 'This action cannot be reversed or undone',
              t('security.deletePolicy5') || 'You will need to create a new account to use our services again',
            ].map((policy, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg bg-muted/50",
                 
                )}
              >
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className={cn(
                  "text-sm text-muted-foreground",
                  isRTL && "text-right"
                )}>
                  {policy}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('security.confirmation') || 'Confirmation Required'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Agreement Checkbox */}
          <div className={cn(
            "flex items-start gap-3 p-4 rounded-lg border-2 transition-colors",
            agreed
              ? "border-destructive bg-destructive/5 dark:bg-destructive/10"
              : "border-border bg-background",
           
          )}>
            <Checkbox
              id="agree-delete"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <label
              htmlFor="agree-delete"
              className={cn(
                "text-sm font-medium leading-relaxed cursor-pointer select-none",
                isRTL && "text-right"
              )}
            >
              {t('security.agreeDelete') || 'I understand that deleting my account is permanent and cannot be undone. I want to proceed with deleting my account and all associated data.'}
            </label>
          </div>

          {/* Delete Button */}
          <div className={cn(
            "flex items-center gap-3",
           
          )}>
            <Button
              variant="destructive"
              size="lg"
              onClick={handleDelete}
              disabled={!agreed}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t('security.deleteAccountPermanently') || 'Delete Account Permanently'}
            </Button>
            <p className={cn(
              "text-xs text-muted-foreground",
              isRTL && "text-right"
            )}>
              {t('security.noUndo') || 'This cannot be undone'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="max-w-md w-full mx-4 border-destructive/50">
            <CardHeader>
              <div className={cn(
                "flex items-start gap-3",
               
              )}>
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div className={cn("flex-1", isRTL && "text-right")}>
                  <CardTitle className="text-destructive">
                    {t('security.finalWarning') || 'Final Warning'}
                  </CardTitle>
                  <CardDescription className="mt-1.5">
                    {t('security.finalWarningDesc') || 'Are you absolutely sure you want to delete your account?'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn(
                "flex gap-3",
               
              )}>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1"
                >
                  {t('common.cancel') || 'Cancel'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    // TODO: Implement actual delete
                    console.log('Account deleted');
                    setShowConfirmDialog(false);
                  }}
                  className="flex-1"
                >
                  {t('security.yesDelete') || 'Yes, Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
