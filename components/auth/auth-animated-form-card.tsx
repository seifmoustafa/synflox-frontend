"use client";

import { ReactNode } from "react";
import { useSettings } from "@/providers/settings-provider";
import { cn } from "@/lib/utils";

interface AuthAnimatedFormCardProps {
  children: ReactNode;
  focusedField: string | null;
  isRTL?: boolean;
}

export function AuthAnimatedFormCard({ children, focusedField, isRTL = false }: AuthAnimatedFormCardProps) {
  const settings = useSettings();
  
  const hasAnim = settings.animationLevel !== "none";
  const isHigh = settings.animationLevel === "high";

  return (
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
          {children}
        </div>
      </div>
    </div>
  );
}
