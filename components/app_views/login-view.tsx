"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Loader2, Shield, Zap, Key, ArrowRight, Sparkles } from "lucide-react";
import { useLoginViewModel } from "@/hooks/use-login-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { useSettings } from "@/providers/settings-provider";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/layout/common/language-switcher";
import { ThemeSwitcher } from "@/components/layout/common/theme-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnimatedLoginBackground } from "@/components/app_views/animated-login-background";
import { cn } from "@/lib/utils";

export function LoginView() {
  const { t, direction } = useI18n();
  const settings = useSettings();
  const vm = useLoginViewModel();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [cursorTrail, setCursorTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const isRTL = direction === "rtl";
  const hasAnim = settings.animationLevel !== "none";
  const isHigh = settings.animationLevel === "high";

  useEffect(() => {
    vm.redirectIfAuthenticated();
  }, [vm]);

  // Advanced mouse tracking with trail
  useEffect(() => {
    if (!isHigh) return;
    
    let trailId = 0;
    const handleMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });

      // Add cursor trail point
      const newPoint = {
        x: e.clientX,
        y: e.clientY,
        id: trailId++
      };
      
      setCursorTrail(prev => {
        const updated = [...prev, newPoint];
        return updated.slice(-15); // Keep last 15 points
      });
    };

    // Clear trail periodically
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
    if (e.key === "Enter" && vm.isFormValid && !vm.isLoading) {
      vm.handleLogin();
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      
      {/* Animated Background - Extracted to separate component */}
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

      {/* Main Content - CENTERED with side card */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-8">
        <div className={cn(
          "flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12",
          isRTL && "lg:flex-row-reverse"
        )}>
          
          {/* SIDE PANEL - Branding & Features */}
          <div className={cn(
            "w-full lg:w-5/12 space-y-6",
            hasAnim && "animate-in fade-in-0 slide-in-from-left-8 duration-700",
            isRTL && hasAnim && "lg:animate-in lg:fade-in-0 lg:slide-in-from-right-8 lg:duration-700"
          )}>
            
            {/* Floating Info Card */}
            <div className="relative group">
              {/* Card Glow */}
              <div className="absolute -inset-3 bg-gradient-to-br from-primary/25 via-primary/15 to-transparent rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              
              <div className={cn(
                "relative p-8 rounded-3xl backdrop-blur-2xl border",
                settings.cardStyle === "glass"
                  ? "bg-card/30 border-white/10"
                  : "bg-card/70 border-border/40",
                "shadow-2xl"
              )}>
                
                {/* Logo - Clean Circular Image */}
                <div className="flex justify-center items-center mb-12 py-8">
                  {/* Logo with 6XL SIZE - 192px × 192px - Circular clipped */}
                  <Logo size="6xl" showText={false} clickable={false} animation="none" />
                </div>

                {/* Branding Text with Effects */}
                <div className={cn("space-y-5 mb-10", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
                  <div className="space-y-3">
                    <h1 className="relative text-4xl lg:text-5xl font-black tracking-tight leading-tight group/title">
                      <span className={cn(
                        "relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent",
                        hasAnim && "animate-gradient bg-[length:200%_200%]"
                      )}>
                        SYNFLOX
                      </span>
                      {/* Shimmer overlay */}
                      {hasAnim && (
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-clip-text text-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}>
                          SYNFLOX
                        </span>
                      )}
                    </h1>
                    <div className={cn(
                      "h-1 w-32 rounded-full bg-gradient-to-r from-primary via-primary/60 to-transparent",
                      hasAnim && "animate-pulse-slow",
                      isRTL && "ml-auto mr-0"
                    )} />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground leading-relaxed">
                    {t("auth.tagline")}
                  </p>
                </div>

                {/* Mission Quote */}
                <blockquote className={cn(
                  "mb-8 p-4 rounded-xl bg-primary/5 border-l-4 border-primary",
                  isRTL && "border-l-0 border-r-4 text-right"
                )} dir={isRTL ? "rtl" : "ltr"}>
                  <p className="text-sm italic text-muted-foreground leading-relaxed">
                    "{t("auth.mission")}"
                  </p>
                </blockquote>

                {/* Feature Pills - FIXED RTL */}
                <div className="space-y-4">
                  {[
                    { icon: Shield, text: t("auth.featureEnterpriseSecurityDesc"), color: "from-blue-500 to-cyan-500" },
                    { icon: Key, text: t("auth.featureFlexibleBillingDesc"), color: "from-purple-500 to-pink-500" },
                    { icon: Zap, text: t("auth.featureRealtimeValidationDesc"), color: "from-orange-500 to-yellow-500" }
                  ].map((item, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "group/item flex items-center gap-4 p-4 rounded-xl",
                        "bg-background/60 border border-border/40",
                        "hover:border-primary/40 hover:bg-background/80 hover:shadow-lg hover:-translate-y-0.5",
                        "transition-all duration-300",
                        isRTL && "flex-row-reverse text-right",
                        hasAnim && "animate-in fade-in-0 slide-in-from-bottom-2 duration-500",
                      )}
                      style={{ animationDelay: `${i * 100}ms` }}
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      <div className={cn(
                        "relative flex-shrink-0 p-2.5 rounded-lg bg-gradient-to-br",
                        item.color,
                        "group-hover/item:scale-110 transition-transform duration-300"
                      )}>
                        <item.icon className="w-4 h-4 text-white relative z-10" />
                        {/* Pulse effect */}
                        <div className={cn(
                          "absolute inset-0 rounded-lg bg-gradient-to-br opacity-0 group-hover/item:opacity-100 group-hover/item:animate-ping",
                          item.color
                        )} />
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground flex-1">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MAIN FORM with Magnetic Effect */}
          <div className={cn(
            "w-full lg:w-7/12 max-w-lg",
            hasAnim && "animate-in fade-in-0 slide-in-from-right-8 duration-700 delay-100",
            isRTL && hasAnim && "lg:animate-in lg:fade-in-0 lg:slide-in-from-left-8 lg:duration-700"
          )}>
            
            <div 
              className="relative group/form"
              style={{
                transform: isHigh && focusedField ? 'scale(1.01)' : 'scale(1)',
                transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              {/* Animated Gradient Border */}
              {hasAnim && (
                <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-primary via-primary/50 to-primary animate-gradient bg-[length:200%_200%] opacity-50 group-hover/form:opacity-70 transition-opacity duration-500" />
              )}
              
              {/* Dynamic Glow Based on Focus */}
              <div 
                className={cn(
                  "absolute -inset-1 rounded-3xl blur-2xl transition-all duration-500",
                  focusedField 
                    ? "opacity-60 bg-gradient-to-br from-primary via-primary/70 to-primary/40 scale-110" 
                    : "opacity-30 bg-gradient-to-br from-primary/40 to-primary/20 group-hover/form:opacity-40 group-hover/form:scale-105"
                )}
              />
              
              {/* Corner Accents */}
              <div className="absolute -top-2 -left-2 w-16 h-16 border-t-2 border-l-2 border-primary/30 rounded-tl-3xl opacity-0 group-hover/form:opacity-100 transition-opacity duration-500" />
              <div className="absolute -bottom-2 -right-2 w-16 h-16 border-b-2 border-r-2 border-primary/30 rounded-br-3xl opacity-0 group-hover/form:opacity-100 transition-opacity duration-500" />
              
              {/* Form Card */}
              <div className={cn(
                "relative p-8 lg:p-10 rounded-3xl backdrop-blur-2xl border",
                settings.cardStyle === "glass"
                  ? "bg-card/40 border-white/10"
                  : "bg-card border-border/50",
                "shadow-2xl"
              )}>
                
                {/* Form Header */}
                <div className={cn("mb-8 space-y-1", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
                  <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
                    {t("auth.welcomeBack")}
                  </h2>
                  <p className={cn(
                    "text-sm text-muted-foreground flex items-center gap-2",
                    
                  )}>
                    <Lock className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{t("auth.secureLogin")}</span>
                  </p>
                </div>

                {/* Error Alert with Animation */}
                {vm.error && (
                  <Alert 
                    variant="destructive" 
                    className={cn(
                      "mb-6 border-2 animate-in fade-in-0 slide-in-from-top-2 duration-300"
                    )}
                  >
                    <AlertDescription className={cn("font-medium flex items-center gap-2", isRTL && "text-right flex-row-reverse")}>
                      <Shield className="w-4 h-4 animate-pulse flex-shrink-0" />
                      <span>{vm.error}</span>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Form Fields */}
                <div className="space-y-5" dir={isRTL ? "rtl" : "ltr"}>
                  
                  {/* Username */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="username"
                      className={cn(
                        "text-sm font-semibold block transition-colors duration-200",
                        isRTL && "text-right",
                        focusedField === "username" ? "text-primary" : "text-foreground"
                      )}
                    >
                      {t("auth.username")}
                    </label>
                    <div className="relative">
                      <Input
                        id="username"
                        type="text"
                        placeholder={t("auth.usernamePlaceholder")}
                        value={vm.formData.username}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => vm.updateField("username", e.target.value)}
                        onFocus={() => setFocusedField("username")}
                        onBlur={() => setFocusedField(null)}
                        onKeyPress={handleKey}
                        disabled={vm.isLoading}
                        autoFocus
                        dir={isRTL ? "rtl" : "ltr"}
                        className={cn(
                          "h-12 text-base transition-all duration-300",
                          "border-2 rounded-xl",
                          focusedField === "username"
                            ? "border-primary shadow-lg shadow-primary/25 ring-4 ring-primary/10 scale-[1.01]"
                            : "border-border hover:border-primary/40 hover:shadow-md"
                        )}
                      />
                      {focusedField === "username" && (
                        <div className="absolute inset-0 -z-10 bg-primary/5 rounded-xl blur-xl" />
                      )}
                      {/* Typing indicator dots - at end, slightly up */}
                      {focusedField === "username" && vm.formData.username && (
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
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="password"
                      className={cn(
                        "text-sm font-semibold block transition-colors duration-200",
                        isRTL && "text-right",
                        focusedField === "password" ? "text-primary" : "text-foreground"
                      )}
                    >
                      {t("auth.password")}
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={vm.showPassword ? "text" : "password"}
                        placeholder={t("auth.passwordPlaceholder")}
                        value={vm.formData.password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => vm.updateField("password", e.target.value)}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        onKeyPress={handleKey}
                        disabled={vm.isLoading}
                        dir={isRTL ? "rtl" : "ltr"}
                        className={cn(
                          "h-12 text-base transition-all duration-300",
                          "border-2 rounded-xl",
                          isRTL ? "pl-12 pr-4" : "pr-12 pl-4",
                          focusedField === "password"
                            ? "border-primary shadow-lg shadow-primary/25 ring-4 ring-primary/10 scale-[1.01]"
                            : "border-border hover:border-primary/40 hover:shadow-md"
                        )}
                      />
                      <button
                        type="button"
                        onClick={vm.togglePasswordVisibility}
                        disabled={vm.isLoading}
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 p-2.5 rounded-lg",
                          "transition-all duration-300 hover:scale-110 active:scale-95",
                          isRTL ? "left-2" : "right-2",
                          focusedField === "password"
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        )}
                      >
                        {vm.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {focusedField === "password" && (
                        <div className="absolute inset-0 -z-10 bg-primary/5 rounded-xl blur-xl" />
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="button"
                    onClick={vm.handleLogin}
                    disabled={!vm.isFormValid || vm.isLoading}
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
                    
                    <span className={cn(
                      "relative flex items-center justify-center gap-2",
                      isRTL && "flex-row-reverse"
                    )}>
                      {vm.isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{t("auth.loggingIn")}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          <span>{t("auth.login")}</span>
                          <ArrowRight className={cn(
                            "w-4 h-4 group-hover/btn:translate-x-1 transition-transform",
                            isRTL && "rotate-180 group-hover/btn:-translate-x-1"
                          )} />
                        </>
                      )}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
