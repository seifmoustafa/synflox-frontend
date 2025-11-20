"use client";

import { Lock, Eye, EyeOff, Shield, KeyRound, CheckCircle2, AlertCircle, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '@/providers/i18n-provider';
import { usePasswordChangeViewModel } from '@/viewmodels/security/use-password-change-viewmodel';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PasswordChangeTabProps {
  userHas2FA?: boolean;
}

export function PasswordChangeTab({ userHas2FA = false }: PasswordChangeTabProps) {
  const { t, direction } = useI18n();
  const vm = usePasswordChangeViewModel(userHas2FA);
  const isRTL = direction === 'rtl';

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetMethod, setResetMethod] = useState<'otp' | 'magic-link'>('otp');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [showOtpEntry, setShowOtpEntry] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

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

      {/* Forgot Password Form (Inline) */}
      {showForgotPasswordForm ? (
        <div className="p-6 rounded-lg border bg-card shadow-sm space-y-6">
          <div className={cn(isRTL && "text-right")}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Reset all forgot password state
                setShowForgotPasswordForm(false);
                setForgotPasswordSent(false);
                setForgotPasswordEmail('');
                setShowOtpEntry(false);
                setOtpCode('');
                setShowNewPasswordForm(false);
                setResetNewPassword('');
                setResetConfirmPassword('');
                setResetMethod('otp');
              }}
              className={cn("mb-4 -ml-2", isRTL && "-mr-2 -ml-0")}
            >
              <ArrowLeft className={cn("w-4 h-4 mr-2", isRTL && "ml-2 mr-0 rotate-180")} />
              {t('common.back') || 'Back'}
            </Button>
            
            <div className={cn("flex items-center gap-3 mb-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-primary/10">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {t('security.resetPassword') || 'Reset Password'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('security.resetPasswordDesc') || 'Enter your email to receive a reset link'}
                </p>
              </div>
            </div>
          </div>

          {showNewPasswordForm ? (
            /* New Password Form After OTP Verification */
            <>
              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  {t('security.otpVerified') || 'OTP verified! Set your new password.'}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className={cn("text-sm font-semibold", isRTL && "block text-right")}>
                    {t('security.newPassword') || 'New Password'}
                  </label>
                  <Input
                    type="password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder={t('security.enterNewPassword') || 'Enter new password'}
                    className={cn(isRTL && "text-right")}
                  />
                </div>

                <div className="space-y-2">
                  <label className={cn("text-sm font-semibold", isRTL && "block text-right")}>
                    {t('security.confirmPassword') || 'Confirm Password'}
                  </label>
                  <Input
                    type="password"
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder={t('security.confirmNewPassword') || 'Confirm new password'}
                    className={cn(isRTL && "text-right")}
                  />
                </div>

                <Button
                  onClick={async () => {
                    // TODO: Call reset password API
                    alert('Password reset successful!');
                    setShowForgotPasswordForm(false);
                    setShowNewPasswordForm(false);
                  }}
                  disabled={!resetNewPassword || resetNewPassword !== resetConfirmPassword}
                  className="w-full"
                >
                  {t('security.resetPassword') || 'Reset Password'}
                </Button>
              </div>
            </>
          ) : showOtpEntry ? (
            /* OTP Entry Form */
            <>
              <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                  {t('security.otpSent') || `We sent a 6-digit code to ${forgotPasswordEmail}`}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className={cn("text-sm font-semibold", isRTL && "block text-right")}>
                  {t('security.enterOtpCode') || 'Enter OTP Code'}
                </label>
                <Input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  disabled={isVerifyingOtp}
                  className={cn("text-center text-2xl tracking-widest font-mono", isRTL && "text-right")}
                />
                <p className="text-xs text-muted-foreground text-center">
                  {t('security.otpExpiry') || 'Code expires in 15 minutes'}
                </p>
              </div>

              <Button
                onClick={async () => {
                  setIsVerifyingOtp(true);
                  // TODO: Call verify OTP API
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  setIsVerifyingOtp(false);
                  setShowOtpEntry(false);
                  setShowNewPasswordForm(true);
                }}
                disabled={otpCode.length !== 6 || isVerifyingOtp}
                className="w-full"
              >
                {isVerifyingOtp && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('security.verifyOtp') || 'Verify Code'}
              </Button>

              <Button
                variant="ghost"
                onClick={async () => {
                  // TODO: Resend OTP
                  alert('OTP resent!');
                }}
                className="w-full"
              >
                {t('security.resendOtp') || 'Resend Code'}
              </Button>
            </>
          ) : !forgotPasswordSent ? (
            /* Email Entry & Method Selection */
            <>
              <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                  {t('security.resetPasswordInfo') || 'Choose how you want to reset your password'}
                </AlertDescription>
              </Alert>

              {/* Method Selection */}
              <div className="space-y-3">
                <label className={cn("text-sm font-semibold", isRTL && "block text-right")}>
                  {t('security.resetMethod') || 'Reset Method'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setResetMethod('otp')}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all",
                      resetMethod === 'otp'
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                      isRTL && "text-right"
                    )}
                  >
                    <div className="font-semibold text-sm mb-1">
                      {t('security.otpMethod') || 'OTP Code'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t('security.otpMethodDesc') || 'Get 6-digit code'}
                    </div>
                  </button>
                  <button
                    onClick={() => setResetMethod('magic-link')}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all",
                      resetMethod === 'magic-link'
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                      isRTL && "text-right"
                    )}
                  >
                    <div className="font-semibold text-sm mb-1">
                      {t('security.magicLinkMethod') || 'Magic Link'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t('security.magicLinkMethodDesc') || 'Click link in email'}
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className={cn("text-sm font-semibold", isRTL && "block text-right")}>
                  {t('common.email') || 'Email Address'}
                </label>
                <Input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder={t('auth.enterEmail') || 'Enter your email'}
                  disabled={isSendingReset}
                  className={cn(isRTL && "text-right")}
                />
              </div>

              <Button
                onClick={async () => {
                  setIsSendingReset(true);
                  // TODO: Call send reset API with method
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  setForgotPasswordSent(true);
                  if (resetMethod === 'otp') {
                    setShowOtpEntry(true);
                  }
                  setIsSendingReset(false);
                }}
                disabled={!forgotPasswordEmail || isSendingReset}
                className="w-full"
              >
                {isSendingReset && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {resetMethod === 'otp' 
                  ? (t('security.sendOtpCode') || 'Send OTP Code')
                  : (t('security.sendMagicLink') || 'Send Magic Link')
                }
              </Button>
            </>
          ) : (
            /* Magic Link Sent Success */
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-300">
                <div className="space-y-2">
                  <p className="font-semibold">
                    {t('security.magicLinkSent') || 'Magic link sent!'}
                  </p>
                  <p>
                    {t('security.magicLinkSentDesc') || 'Check your email and click the link to reset your password. The link will expire in 15 minutes.'}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        /* Change Password Form */
        <div className="p-6 rounded-lg border bg-card shadow-sm space-y-6">
          <div className={cn(isRTL && "text-right")}>
            <h3 className="text-lg font-semibold mb-2">
              {t('security.changePassword') || 'Change Password'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {vm.requires2FA
                ? t('security.changePasswordWith2FADesc') || 'Password change requires 2FA verification'
                : t('security.changePasswordDesc') || 'Update your account password'}
            </p>
          </div>

        {/* Current Password */}
        <div className="space-y-2">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <label className={cn("text-sm font-semibold", isRTL && "text-right")}>
              {t('security.currentPassword') || 'Current Password'}
            </label>
            <button
              type="button"
              onClick={() => setShowForgotPasswordForm(true)}
              className="text-xs text-primary hover:text-primary/80 underline transition-colors"
            >
              {t('security.forgotCurrentPassword') || 'Forgot current password?'}
            </button>
          </div>
          <div className="relative">
            <Input
              type={showCurrentPassword ? "text" : "password"}
              value={vm.currentPassword}
              onChange={(e) => vm.handleCurrentPasswordChange(e.target.value)}
              placeholder={t('security.enterCurrentPassword') || 'Enter current password'}
              disabled={vm.isLoading}
              className={cn("pr-10", isRTL && "pl-10 pr-3 text-right")}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground",
                isRTL ? "left-0" : "right-0"
              )}
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className={cn("text-sm font-semibold", isRTL && "block text-right")}>
            {t('security.newPassword') || 'New Password'}
          </label>
          <div className="relative">
            <Input
              type={showNewPassword ? "text" : "password"}
              value={vm.newPassword}
              onChange={(e) => vm.handleNewPasswordChange(e.target.value)}
              placeholder={t('security.enterNewPassword') || 'Enter new password'}
              disabled={vm.isLoading}
              className={cn("pr-10", isRTL && "pl-10 pr-3 text-right")}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground",
                isRTL ? "left-0" : "right-0"
              )}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {vm.newPassword && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      vm.passwordStrength === 'weak' && "w-1/3 bg-red-500",
                      vm.passwordStrength === 'medium' && "w-2/3 bg-orange-500",
                      vm.passwordStrength === 'strong' && "w-full bg-green-500"
                    )}
                  />
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  vm.passwordStrength === 'weak' && "text-red-600",
                  vm.passwordStrength === 'medium' && "text-orange-600",
                  vm.passwordStrength === 'strong' && "text-green-600"
                )}>
                  {vm.passwordStrength.charAt(0).toUpperCase() + vm.passwordStrength.slice(1)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('security.passwordRequirements') || 'Min 8 characters, uppercase, lowercase, number, special char'}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className={cn("text-sm font-semibold", isRTL && "block text-right")}>
            {t('security.confirmPassword') || 'Confirm Password'}
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={vm.confirmPassword}
              onChange={(e) => vm.handleConfirmPasswordChange(e.target.value)}
              placeholder={t('security.confirmNewPassword') || 'Confirm new password'}
              disabled={vm.isLoading}
              className={cn("pr-10", isRTL && "pl-10 pr-3 text-right")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground",
                isRTL ? "left-0" : "right-0"
              )}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {vm.confirmPassword && !vm.passwordsMatch && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {t('security.passwordsNoMatch') || 'Passwords do not match'}
            </p>
          )}
          {vm.confirmPassword && vm.passwordsMatch && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {t('security.passwordsMatch') || 'Passwords match'}
            </p>
          )}
        </div>

        {/* 2FA Verification (if required) */}
        {vm.requires2FA && (
          <div className="pt-4 border-t space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className={cn("flex items-center gap-3",)}>
                <div className="p-2 rounded-lg bg-primary/20">
                  {vm.useBackupCode ? (
                    <KeyRound className="w-5 h-5 text-primary" />
                  ) : (
                    <Shield className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">
                    {vm.useBackupCode
                      ? t('security.backupCodeRequired') || 'Backup Code Required'
                      : t('security.twoFactorRequired') || '2FA Verification Required'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {vm.useBackupCode
                      ? t('security.enterBackupCode') || 'Enter one of your backup codes'
                      : t('security.enter2FACode') || 'Enter your 2FA code from authenticator app'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2FA Code or Backup Code Input */}
            {!vm.useBackupCode ? (
              <div className="space-y-2">
                <label className={cn("text-sm font-semibold", isRTL && "block text-right")}>
                  {t('security.verificationCode') || 'Verification Code'}
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={vm.twoFactorCode}
                  onChange={(e) => vm.handle2FACodeChange(e.target.value)}
                  placeholder="000000"
                  disabled={vm.isLoading}
                  className={cn("text-center tracking-wider text-2xl font-mono h-14", isRTL && "text-right")}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className={cn("text-sm font-semibold", isRTL && "block text-right")}>
                  {t('security.backupCode') || 'Backup Code'}
                </label>
                <Input
                  type="text"
                  maxLength={9}
                  value={vm.backupCode}
                  onChange={(e) => {
                    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    if (value.length > 4) {
                      value = value.slice(0, 4) + '-' + value.slice(4, 8);
                    }
                    vm.handleBackupCodeChange(value);
                  }}
                  placeholder="ABCD-1234"
                  disabled={vm.isLoading}
                  className={cn("text-center tracking-wider text-2xl font-mono h-14 uppercase", isRTL && "text-right")}
                />
              </div>
            )}

            {/* Switch between 2FA and Backup Code */}
            <div className="flex justify-center">
              {!vm.useBackupCode ? (
                <button
                  type="button"
                  onClick={vm.switchToBackupCode}
                  disabled={vm.isLoading}
                  className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  {t('security.useBackupCode') || 'Use backup code instead'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={vm.switchTo2FA}
                  disabled={vm.isLoading}
                  className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  {t('security.use2FACode') || 'Use 2FA code instead'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={vm.handleChangePassword}
          disabled={!vm.canChangePassword || vm.isLoading}
          className="w-full"
          size="lg"
        >
          {vm.isLoading ? (
            <>
              <Loader2 className={cn("w-5 h-5 animate-spin", isRTL ? "ml-2" : "mr-2")} />
              {t('security.changingPassword') || 'Changing Password...'}
            </>
          ) : (
            <>
              <Lock className={cn("w-5 h-5", isRTL ? "ml-2" : "mr-2")} />
              {t('security.changePassword') || 'Change Password'}
            </>
          )}
        </Button>
      </div>
      )}
    </div>
  );
}
