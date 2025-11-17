"use client";

import { AlertCircle, RefreshCw, WifiOff, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/i18n-provider";

interface DashboardErrorStateProps {
  error?: string;
  errorType?: "network" | "server" | "unknown";
  onRetry?: () => void;
  className?: string;
}

export function DashboardErrorState({
  error,
  errorType = "unknown",
  onRetry,
  className,
}: DashboardErrorStateProps) {
  const { t } = useI18n();

  const getErrorConfig = () => {
    switch (errorType) {
      case "network":
        return {
          icon: WifiOff,
          title: t("errors.networkError") || "Network Connection Lost",
          description: t("errors.networkErrorDesc") || "Unable to connect to the server. Please check your internet connection.",
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
          borderColor: "border-orange-500/20",
        };
      case "server":
        return {
          icon: ServerCrash,
          title: t("errors.serverError") || "Server Error",
          description: t("errors.serverErrorDesc") || "The server encountered an error. Please try again later.",
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/20",
        };
      default:
        return {
          icon: AlertCircle,
          title: t("errors.unknownError") || "Something Went Wrong",
          description: t("errors.unknownErrorDesc") || "An unexpected error occurred while loading the dashboard.",
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/20",
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center justify-center min-h-[400px] p-6", className)}>
      <div className="max-w-md w-full">
        <div className={cn("p-8 rounded-2xl border text-center space-y-6", config.bgColor, config.borderColor)}>
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className={cn("absolute inset-0 blur-xl rounded-full animate-pulse", config.bgColor)} />
              <div className={cn(
                "relative w-16 h-16 rounded-full flex items-center justify-center border-2",
                config.bgColor,
                config.borderColor
              )}>
                <Icon className={cn("w-8 h-8", config.color)} />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{config.title}</h3>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground font-mono break-all">
                {error}
              </p>
            </div>
          )}

          {/* Retry Button */}
          {onRetry && (
            <Button
              onClick={onRetry}
              className={cn(
                "w-full gap-2 h-11",
                "bg-gradient-to-r from-primary to-primary/90",
                "hover:shadow-lg hover:scale-105",
                "transition-all duration-300"
              )}
            >
              <RefreshCw className="w-4 h-4" />
              {t("common.retry") || "Try Again"}
            </Button>
          )}

          {/* Help Text */}
          <p className="text-xs text-muted-foreground">
            {t("errors.persistIssue") || "If this issue persists, please contact support."}
          </p>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
interface DashboardEmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function DashboardEmptyState({
  title,
  description,
  icon: Icon = AlertCircle,
  action,
  className,
}: DashboardEmptyStateProps) {
  return (
    <div className={cn("flex items-center justify-center min-h-[300px] p-6", className)}>
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Action */}
        {action && (
          <Button
            onClick={action.onClick}
            variant="outline"
            className="hover:bg-muted transition-colors"
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
