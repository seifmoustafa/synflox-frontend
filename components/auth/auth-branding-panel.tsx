"use client";

import { Shield, Key, Zap } from "lucide-react";
import { useI18n } from "@/providers/i18n-provider";
import { useSettings } from "@/providers/settings-provider";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

export function AuthBrandingPanel() {
  const { t, direction } = useI18n();
  const settings = useSettings();
  
  const isRTL = direction === "rtl";
  const hasAnim = settings.animationLevel !== "none";

  return (
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
  );
}
