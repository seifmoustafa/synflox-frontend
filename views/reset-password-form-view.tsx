"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useResetPasswordViewModel } from "@/hooks/use-reset-password-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { useSettings } from "@/providers/settings-provider";
import { LanguageSwitcher } from "@/components/layout/common/language-switcher";
import { ThemeSwitcher } from "@/components/layout/common/theme-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnimatedLoginBackground } from "@/components/app_views/animated-login-background";
import { AuthBrandingPanel } from "@/components/auth/auth-branding-panel";
import { AuthAnimatedFormCard } from "@/components/auth/auth-animated-form-card";
import { cn } from "@/lib/utils";

// Password Strength Indicator Component
function PasswordStrengthIndicator({ password, strength, t }: { password: string; strength: 'weak' | 'medium' | 'strong'; t: any }) {
  if (!password) return null;

  const colors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
  };

  const widths = {
    weak: 'w-1/3',
    medium: 'w-2/3',
    strong: 'w-full',
  };

  const labels = {
    weak: t("auth.passwordStrengthWeak") || 'Weak',
    medium: t("auth.passwordStrengthMedium") || 'Medium',
    strong: t("auth.passwordStrengthStrong") || 'Strong',
  };

  return (
    <div className="space-y-2">
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-300", colors[strength], widths[strength])} />
      </div>
      <p className="text-xs text-muted-foreground">
        {t("auth.passwordStrength") || "Password strength"}: <span className={cn("font-semibold", 
          strength === 'strong' && "text-green-600",
          strength === 'medium' && "text-yellow-600",
          strength === 'weak' && "text-red-600"
        )}>{labels[strength]}</span>
      </p>
    </div>
  );
}

export function ResetPasswordFormView() {
  const { t, direction } = useI18n();
  const settings = useSettings();
  const vm = useResetPasswordViewModel();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [cursorTrail, setCursorTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const isRTL = direction === "rtl";
  const hasAnim = settings.animationLevel !== "none";
  const isHigh = settings.animationLevel === "high";

  // Advanced mouse tracking
  useEffect(() => {
    if (!isHigh) return;
    
    let trailId = 0;
    const handleMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });

      const newPoint = {
        x: e.clientX,
        y: e.clientY,
        id: trailId++
      };
      
      setCursorTrail(prev => {
        const updated = [...prev, newPoint];
        return updated.slice(-15);
      });
    };

    const trailClearInterval = setInterval(() => {
      setCursorTrail([]);
    }, 1000);
    
    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      clearInterval(trailClearInterval);
    };
  }, [isHigh]);

  // Click ripple effect
  useEffect(() => {
    if (!hasAnim) return;
    
    let rippleId = 0;
    const handleClick = (e: MouseEvent) => {
      const newRipple = {
        x: e.clientX,
        y: e.clientY,
        id: rippleId++
      };
      
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 1000);
    };
    
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [hasAnim]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && vm.canSubmit && !vm.isLoading) {
      vm.handleSubmit();
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      
      {/* Animated Background */}
      <AnimatedLoginBackground 
        mousePos={mousePos}
        cursorTrail={cursorTrail}
        ripples={ripples}
      />

      {/* Top Controls */}
      <div className={cn(
        "absolute top-6 z-50 flex items-center gap-2",
        isRTL ? "left-6" : "right-6",
        hasAnim && "animate-in fade-in-0 slide-in-from-top-4 duration-500"
      )}>
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-card/60 backdrop-blur-xl border border-border/40 shadow-lg">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-8">
        <div className={cn(
          "flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12",
          isRTL && "lg:flex-row-reverse"
        )}>
          
          {/* Branding Panel */}
          <AuthBrandingPanel />

          {/* Main Form */}
          <AuthAnimatedFormCard focusedField={focusedField} isRTL={isRTL}>
            {/* Validation Loading */}
            {vm.isValidating && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="ml-3 text-muted-foreground">
                  {t("auth.validatingMagicLink") || "Validating magic link..."}
                </span>
              </div>
            )}

            {/* Validation Error */}
            {vm.validationError && !vm.isValidating && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-destructive font-medium">
                    {t("auth.validationFailed") || "Validation Failed"}
                  </p>
                  <p className="text-sm text-destructive/80 mt-1">{vm.validationError}</p>
                </div>
              </div>
            )}

            {/* Success State */}
            {vm.isSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                    {t("auth.passwordResetSuccess") || "Password Reset Successfully"}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    {t("auth.redirectingToLogin") || "Redirecting to login..."}
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            {!vm.isValidating && !vm.validationError && !vm.isSuccess && (
              <>
                {/* Form Header */}
                <div className={cn("mb-8 space-y-1", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
                  <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
                    {t("auth.resetPassword") || "Reset Password"}
                  </h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>
                      {vm.isMagicLink || vm.isOtpPreFilled
                        ? t("auth.enterNewPassword") || "Enter your new password"
                        : t("auth.enterResetDetails") || "Enter your details to reset password"}
                    </span>
                  </p>
                </div>

                {/* Info Banner */}
                {(vm.isMagicLink || vm.isOtpPreFilled) && (
                  <Alert className="mb-6 bg-primary/5 border-primary/20 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                    <AlertDescription className="flex items-center gap-2 text-primary">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {vm.isMagicLink 
                          ? (t("auth.magicLinkActive") || "Magic link activated! Enter your new password.")
                          : (t("auth.otpVerifiedProceed") || "OTP verified! Please set your new password.")}
                      </span>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error Alert */}
                {vm.error && (
                  <Alert 
                    variant="destructive" 
                    className="mb-6 border-2 animate-in fade-in-0 slide-in-from-top-2 duration-300"
                  >
                    <AlertDescription className={cn("font-medium flex items-center gap-2", isRTL && "text-right flex-row-reverse")}>
                      <AlertCircle className="w-4 h-4 animate-pulse flex-shrink-0" />
                      <span>{vm.error}</span>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Form Fields */}
                <div className="space-y-5" dir={isRTL ? "rtl" : "ltr"}>
                  
                  {/* New Password */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="newPassword"
                      className={cn(
                        "text-sm font-semibold block transition-colors duration-200",
                        isRTL && "text-right",
                        focusedField === "newPassword" ? "text-primary" : "text-foreground"
                      )}
                    >
                      {t("auth.newPassword") || "New Password"}
                    </label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={vm.showPassword ? "text" : "password"}
                        placeholder={t("auth.newPasswordPlaceholder") || "Enter new password"}
                        value={vm.formData.newPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => vm.handleFieldChange('newPassword', e.target.value)}
                        onFocus={() => setFocusedField("newPassword")}
                        onBlur={() => setFocusedField(null)}
                        onKeyPress={handleKey}
                        disabled={vm.isLoading}
                        autoFocus
                        dir="ltr"
                        className={cn(
                          "h-12 text-base transition-all duration-300 border-2 rounded-xl",
                          isRTL ? "pl-12 pr-4 text-right" : "pr-12 pl-4",
                          focusedField === "newPassword"
                            ? "border-primary shadow-lg shadow-primary/25 ring-4 ring-primary/10 scale-[1.01]"
                            : "border-border hover:border-primary/40 hover:shadow-md"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => vm.togglePasswordVisibility('new')}
                        disabled={vm.isLoading}
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 p-2.5 rounded-lg",
                          isRTL ? "left-2" : "right-2",
                          "transition-all duration-300 hover:scale-110 active:scale-95",
                          focusedField === "newPassword"
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        )}
                      >
                        {vm.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {focusedField === "newPassword" && (
                        <div className="absolute inset-0 -z-10 bg-primary/5 rounded-xl blur-xl" />
                      )}
                    </div>
                    {vm.formData.newPassword && (
                      <PasswordStrengthIndicator password={vm.formData.newPassword} strength={vm.passwordStrength} t={t} />
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="confirmPassword"
                      className={cn(
                        "text-sm font-semibold block transition-colors duration-200",
                        isRTL && "text-right",
                        focusedField === "confirmPassword" ? "text-primary" : "text-foreground"
                      )}
                    >
                      {t("auth.confirmPassword") || "Confirm Password"}
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={vm.showConfirmPassword ? "text" : "password"}
                        placeholder={t("auth.confirmPasswordPlaceholder") || "Re-enter password"}
                        value={vm.formData.confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => vm.handleFieldChange('confirmPassword', e.target.value)}
                        onFocus={() => setFocusedField("confirmPassword")}
                        onBlur={() => setFocusedField(null)}
                        onKeyPress={handleKey}
                        disabled={vm.isLoading}
                        dir="ltr"
                        className={cn(
                          "h-12 text-base transition-all duration-300 border-2 rounded-xl",
                          isRTL ? "pl-12 pr-4 text-right" : "pr-12 pl-4",
                          focusedField === "confirmPassword"
                            ? "border-primary shadow-lg shadow-primary/25 ring-4 ring-primary/10 scale-[1.01]"
                            : "border-border hover:border-primary/40 hover:shadow-md"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => vm.togglePasswordVisibility('confirm')}
                        disabled={vm.isLoading}
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 p-2.5 rounded-lg",
                          isRTL ? "left-2" : "right-2",
                          "transition-all duration-300 hover:scale-110 active:scale-95",
                          focusedField === "confirmPassword"
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        )}
                      >
                        {vm.showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {focusedField === "confirmPassword" && (
                        <div className="absolute inset-0 -z-10 bg-primary/5 rounded-xl blur-xl" />
                      )}
                    </div>
                    {vm.formData.confirmPassword && vm.formData.newPassword && (
                      <p className={cn(
                        "text-xs flex items-center gap-1",
                        vm.passwordsMatch ? "text-green-600" : "text-destructive"
                      )}>
                        {vm.passwordsMatch ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            {t("auth.passwordsMatch") || "Passwords match"}
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            {t("auth.passwordsDontMatch") || "Passwords don't match"}
                          </>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Back to Login Link */}
                  <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse justify-end")}>
                    <Link
                      href="/login"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />
                      <span>{t("auth.backToLogin") || "Back to Login"}</span>
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="button"
                    onClick={vm.handleSubmit}
                    disabled={!vm.canSubmit || vm.isLoading}
                    className={cn(
                      "w-full h-13 mt-2 text-base font-bold relative overflow-hidden group/btn rounded-xl",
                      "bg-gradient-to-r from-primary via-primary to-primary/90",
                      "hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02]",
                      "active:scale-[0.98]",
                      "transition-all duration-300",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    )}
                  >
                    {/* Animated Shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    
                    <span className="relative flex items-center justify-center gap-2">
                      {vm.isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{t("auth.resettingPassword") || "Resetting..."}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          <span>{t("auth.resetPassword") || "Reset Password"}</span>
                          <ArrowRight className={cn(
                            "w-4 h-4 group-hover/btn:translate-x-1 transition-transform",
                            isRTL && "rotate-180 group-hover/btn:-translate-x-1"
                          )} />
                        </>
                      )}
                    </span>
                  </Button>
                </div>
              </>
            )}
          </AuthAnimatedFormCard>
        </div>
      </div>
    </div>
  );
}
