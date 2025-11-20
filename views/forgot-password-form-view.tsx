"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Key, Lock, Loader2, Send, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Shield, KeyRound } from "lucide-react";
import { useForgotPasswordViewModel } from "@/hooks/use-forgot-password-viewmodel";
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

export function ForgotPasswordFormView() {
  const { t, direction } = useI18n();
  const settings = useSettings();
  const vm = useForgotPasswordViewModel();
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
    if (e.key === "Enter" && !vm.isLoading) {
      if (vm.isEmailSent && vm.canVerifyOtp) {
        vm.handleVerifyOtp();
      } else if (vm.requires2FA && vm.canSendOtp) {
        vm.handleSendOtp();
      } else if (!vm.requires2FA && vm.canCheckEmail) {
        vm.handleCheckEmail();
      }
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
            {/* Form Header */}
            <div className={cn("mb-8 space-y-1", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
                {vm.isEmailSent 
                  ? t("auth.verifyOtp") || "Verify OTP Code"
                  : t("auth.forgotPassword") || "Forgot Password?"}
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary flex-shrink-0" />
                <span>
                  {vm.isEmailSent
                    ? t("auth.enterOtpSent") || "Enter the 6-digit code sent to your email"
                    : t("auth.forgotPasswordInstructions") || "Enter your email to receive reset code"}
                </span>
              </p>
            </div>

            {/* Success Banner - Email Sent */}
            {vm.isEmailSent && !vm.error && (
              <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <AlertDescription className="flex items-center gap-2 text-green-800 dark:text-green-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{vm.successMessage || t("auth.otpSentSuccess") || "OTP code sent to your email! Check your inbox."}</span>
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
              
              {/* Email Field */}
              <div className="space-y-2">
                <label 
                  htmlFor="email"
                  className={cn(
                    "text-sm font-semibold block transition-colors duration-200",
                    isRTL && "text-right",
                    focusedField === "email" ? "text-primary" : "text-foreground"
                  )}
                >
                  {t("auth.email") || "Email Address"}
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder") || "admin@synflox.com"}
                    value={vm.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => vm.handleEmailChange(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    onKeyPress={handleKey}
                    disabled={vm.isLoading || vm.isEmailSent}
                    autoFocus={!vm.isEmailSent}
                    dir="ltr"
                    className={cn(
                      "h-12 text-base transition-all duration-300 border-2 rounded-xl",
                      isRTL ? "pr-10 text-right" : "pl-10",
                      focusedField === "email"
                        ? "border-primary shadow-lg shadow-primary/25 ring-4 ring-primary/10 scale-[1.01]"
                        : "border-border hover:border-primary/40 hover:shadow-md",
                      vm.isEmailSent && "bg-muted/50 cursor-not-allowed"
                    )}
                  />
                  {/* Mail Icon - RTL aware */}
                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 pointer-events-none",
                    isRTL ? "right-3" : "left-3"
                  )}>
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  {focusedField === "email" && !vm.isEmailSent && (
                    <div className="absolute inset-0 -z-10 bg-primary/5 rounded-xl blur-xl" />
                  )}
                  {/* Typing indicator dots */}
                  {focusedField === "email" && vm.email && !vm.isEmailSent && (
                    <div className={cn(
                      "absolute bottom-3 flex gap-1",
                      isRTL ? "left-4" : "right-4"
                    )}>
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-1 h-1 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {vm.email && !vm.isValidEmail && !vm.isEmailSent && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {t("auth.invalidEmailFormat") || "Invalid email format"}
                  </p>
                )}
                {vm.isEmailSent && (
                  <div className="flex items-center justify-between">
                    {/* <p className="text-xs text-primary flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {t("auth.emailLocked") || "Email locked"}
                    </p> */}
                    <button
                      type="button"
                      onClick={vm.handleChangeEmail}
                      disabled={vm.isLoading}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
                    >
                      {t("auth.wrongEmail") || "Wrong email?"}
                    </button>
                  </div>
                )}
              </div>

              {/* 2FA Verification OR Backup Code - Only shown if email requires 2FA */}
              {vm.requires2FA && !vm.isEmailSent && (
                <div className={cn(
                  "space-y-4 animate-in fade-in-0 slide-in-from-top-4 duration-500",
                  isRTL && "text-right"
                )} dir={isRTL ? "rtl" : "ltr"}>
                  {/* 2FA/Backup Code Header */}
                  <div className="space-y-2 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        {vm.useBackupCode ? (
                          <KeyRound className="w-5 h-5 text-primary" />
                        ) : (
                          <Shield className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">
                          {vm.useBackupCode ? t("auth.backupCodeRequired") : t("auth.twoFactorRequiredForReset")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {vm.useBackupCode 
                            ? t("auth.backupCodeDescription") 
                            : t("auth.twoFactorDescription")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2FA Code Input */}
                  {!vm.useBackupCode && (
                    <div className="space-y-2">
                      <label 
                        htmlFor="twoFactorCode"
                        className={cn(
                          "text-sm font-semibold block transition-colors duration-200",
                          isRTL && "text-right",
                          focusedField === "2fa" ? "text-primary" : "text-foreground"
                        )}
                      >
                        {t("auth.verificationCode")}
                      </label>
                      <div className="relative">
                        <Input
                          id="twoFactorCode"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder={t("auth.verificationCodePlaceholder")}
                          value={vm.twoFactorCode}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value.replace(/\D/g, "");
                            vm.handle2FACodeChange(value);
                          }}
                          onFocus={() => setFocusedField("2fa")}
                          onBlur={() => setFocusedField(null)}
                          onKeyPress={handleKey}
                          disabled={vm.isLoading}
                          autoFocus
                          dir="ltr"
                          className={cn(
                            "h-14 text-2xl text-center tracking-[0.5em] font-bold transition-all duration-300 border-2 rounded-xl",
                            focusedField === "2fa"
                              ? "border-primary shadow-lg shadow-primary/25 ring-4 ring-primary/10 scale-[1.01]"
                              : "border-border hover:border-primary/40 hover:shadow-md"
                          )}
                        />
                        {focusedField === "2fa" && (
                          <div className="absolute inset-0 -z-10 bg-primary/5 rounded-xl blur-xl" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {t("auth.enterCode")}
                      </p>
                    </div>
                  )}

                  {/* Backup Code Input */}
                  {vm.useBackupCode && (
                    <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                      <label 
                        htmlFor="backupCode"
                        className={cn(
                          "text-sm font-semibold block transition-colors duration-200",
                          isRTL && "text-right",
                          focusedField === "backup" ? "text-primary" : "text-foreground"
                        )}
                      >
                        {t("auth.backupCode")}
                      </label>
                      <div className="relative">
                        <Input
                          id="backupCode"
                          type="text"
                          maxLength={9}
                          placeholder="ABCD-1234"
                          value={vm.backupCode}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                            // Auto-format: ABCD-1234
                            if (value.length > 4) {
                              value = value.slice(0, 4) + "-" + value.slice(4, 8);
                            }
                            vm.handleBackupCodeChange(value);
                          }}
                          onFocus={() => setFocusedField("backup")}
                          onBlur={() => setFocusedField(null)}
                          onKeyPress={handleKey}
                          disabled={vm.isLoading}
                          autoFocus
                          dir="ltr"
                          className={cn(
                            "h-14 text-2xl text-center tracking-[0.25em] font-bold uppercase transition-all duration-300 border-2 rounded-xl",
                            focusedField === "backup"
                              ? "border-primary shadow-lg shadow-primary/25 ring-4 ring-primary/10 scale-[1.01]"
                              : "border-border hover:border-primary/40 hover:shadow-md"
                          )}
                        />
                        {focusedField === "backup" && (
                          <div className="absolute inset-0 -z-10 bg-primary/5 rounded-xl blur-xl" />
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <KeyRound className="w-3 h-3" />
                        <span>{t("auth.enterBackupCode")}</span>
                      </div>
                    </div>
                  )}

                  {/* Switch between 2FA and Backup Code */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    {!vm.useBackupCode ? (
                      <button
                        type="button"
                        onClick={vm.switchToBackupCode}
                        disabled={vm.isLoading}
                        className={cn(
                          "text-sm font-medium text-primary hover:text-primary/80 transition-all duration-200",
                          "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/10",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>{t("auth.lostTwoFactor")}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={vm.switchTo2FA}
                        disabled={vm.isLoading}
                        className={cn(
                          "text-sm font-medium text-primary hover:text-primary/80 transition-all duration-200",
                          "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/10",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <Shield className="w-4 h-4" />
                        <span>{t("auth.backTo2FA")}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* OTP Code Field - Only shown after email sent */}
              {vm.isEmailSent && (
                <div className={cn(
                  "space-y-2 animate-in fade-in-0 slide-in-from-top-4 duration-500"
                )}>
                  <label 
                    htmlFor="otpCode"
                    className={cn(
                      "text-sm font-semibold block transition-colors duration-200",
                      isRTL && "text-right",
                      focusedField === "otp" ? "text-primary" : "text-foreground"
                    )}
                  >
                    {t("auth.otpCode") || "OTP Code"}
                  </label>
                  <div className="relative">
                    <Input
                      id="otpCode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={vm.otpCode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => vm.handleOtpChange(e.target.value)}
                      onFocus={() => setFocusedField("otp")}
                      onBlur={() => setFocusedField(null)}
                      onKeyPress={handleKey}
                      disabled={vm.isLoading}
                      autoFocus
                      dir="ltr"
                      className={cn(
                        "h-14 text-2xl text-center tracking-[0.5em] font-bold transition-all duration-300 border-2 rounded-xl",
                        focusedField === "otp"
                          ? "border-primary shadow-lg shadow-primary/25 ring-4 ring-primary/10 scale-[1.01]"
                          : "border-border hover:border-primary/40 hover:shadow-md"
                      )}
                    />
                    {focusedField === "otp" && (
                      <div className="absolute inset-0 -z-10 bg-primary/5 rounded-xl blur-xl" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {t("auth.enter6DigitCode") || "Enter the 6-digit code from your email"}
                  </p>
                </div>
              )}

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
                onClick={() => {
                  if (vm.isEmailSent) {
                    vm.handleVerifyOtp();
                  } else if (vm.requires2FA) {
                    vm.handleSendOtp();
                  } else {
                    vm.handleCheckEmail();
                  }
                }}
                disabled={
                  vm.isEmailSent 
                    ? !vm.canVerifyOtp 
                    : vm.requires2FA 
                      ? !vm.canSendOtp 
                      : !vm.canCheckEmail
                }
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
                      <span>
                        {vm.isEmailSent 
                          ? t("auth.verifying") 
                          : vm.requires2FA
                            ? (vm.useBackupCode ? t("auth.verifyingBackupCode") : t("auth.verifying"))
                            : t("auth.sending")}
                      </span>
                    </>
                  ) : (
                    <>
                      {vm.isEmailSent ? (
                        <>
                          <Key className="w-5 h-5" />
                          <span>{t("auth.verifyOtp") || "Verify OTP"}</span>
                          <ArrowRight className={cn(
                            "w-4 h-4 group-hover/btn:translate-x-1 transition-transform",
                            isRTL && "rotate-180 group-hover/btn:-translate-x-1"
                          )} />
                        </>
                      ) : vm.requires2FA ? (
                        <>
                          {vm.useBackupCode ? (
                            <>
                              <KeyRound className="w-5 h-5" />
                              <span>{t("auth.verifyBackupCode")}</span>
                            </>
                          ) : (
                            <>
                              <Shield className="w-5 h-5" />
                              <span>{t("auth.verify")}</span>
                            </>
                          )}
                          <ArrowRight className={cn(
                            "w-4 h-4 group-hover/btn:translate-x-1 transition-transform",
                            isRTL && "rotate-180 group-hover/btn:-translate-x-1"
                          )} />
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>{t("auth.sendOtp") || "Send Reset Code"}</span>
                          <ArrowRight className={cn(
                            "w-4 h-4 group-hover/btn:translate-x-1 transition-transform",
                            isRTL && "rotate-180 group-hover/btn:-translate-x-1"
                          )} />
                        </>
                      )}
                    </>
                  )}
                </span>
              </Button>
            </div>
          </AuthAnimatedFormCard>
        </div>
      </div>
    </div>
  );
}
