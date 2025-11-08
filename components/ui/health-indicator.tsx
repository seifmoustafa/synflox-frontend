"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { HealthStatus } from "@/domain";
import { CheckCircle2, AlertCircle, XCircle, HelpCircle } from "lucide-react";

export function HealthIndicator() {
  const { healthService } = useServices();
  const { t } = useI18n();
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await healthService.getHealth();
        setHealth(data);
      } catch (e) {
        // Error already handled
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [healthService]);

  if (loading || !health) {
    return (
      <Badge variant="outline" className="gap-1">
        <HelpCircle className="h-3 w-3" />
        {t("health.checking")}
      </Badge>
    );
  }

  const getStatusIcon = () => {
    switch (health.status) {
      case HealthStatus.Healthy:
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case HealthStatus.Degraded:
        return <AlertCircle className="h-3 w-3 text-yellow-600" />;
      case HealthStatus.Unhealthy:
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return <HelpCircle className="h-3 w-3 text-gray-600" />;
    }
  };

  const getStatusVariant = () => {
    switch (health.status) {
      case HealthStatus.Healthy:
        return "active" as const;
      case HealthStatus.Degraded:
        return "secondary" as const;
      case HealthStatus.Unhealthy:
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <Badge variant={getStatusVariant()} className="gap-1">
      {getStatusIcon()}
      {t(`health.status.${HealthStatus[health.status]?.toLowerCase() || 'unknown'}`)}
    </Badge>
  );
}

