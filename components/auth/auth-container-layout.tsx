"use client";

import { ReactNode, useState, useEffect } from "react";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/layout/common/language-switcher";
import { ThemeSwitcher } from "@/components/layout/common/theme-switcher";
import { AnimatedLoginBackground } from "@/components/app_views/animated-login-background";
import { useI18n } from "@/providers/i18n-provider";
import { useSettings } from "@/providers/settings-provider";
import { cn } from "@/lib/utils";
import { Shield, Zap, Key } from "lucide-react";

interface AuthContainerLayoutProps {
  children: ReactNode;
}

/**
 * Auth Container Layout
 * 
 * Reusable layout for all authentication pages (login, forgot-password, reset-password).
 * Provides:
 * - Animated background with mouse tracking
 * - Floating branding card on the left
 * - Form container on the right
 * - Language and theme switchers
 * - Responsive design with RTL support
 */
export function AuthContainerLayout({ children }: AuthContainerLayoutProps) {
  const { t, direction } = useI18n();
  const settings = useSettings();
  
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [cursorTrail, setCursorTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const isRTL = direction === "rtl";
  const hasAnim = settings.animationLevel !== "none";
  const isHigh = settings.animationLevel === "high";
  
  // Mouse tracking
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

  // Click ripples
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

          {/* FORM CONTAINER (children) */}
          <div className={cn(
            "w-full lg:w-7/12 max-w-lg",
            hasAnim && "animate-in fade-in-0 slide-in-from-right-8 duration-700 delay-100",
            isRTL && hasAnim && "lg:animate-in lg:fade-in-0 lg:slide-in-from-left-8 lg:duration-700"
          )}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
