"use client";

import { useState, useEffect, useCallback } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import type { AlertsDashboard } from "@/domain";

export interface UseAlertsViewModelReturn {
  dashboard: AlertsDashboard | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  dismissAlert: (id: string) => Promise<void>;
  formattedLastUpdate: string;
}

export function useAlertsViewModel(): UseAlertsViewModelReturn {
  const { dashboardService } = useServices();
  const { t } = useI18n();
  
  const [dashboard, setDashboard] = useState<AlertsDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardService.getAlerts();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to fetch alerts dashboard:', err);
      setError(t('dashboard.error'));
    } finally {
      setIsLoading(false);
    }
  }, [dashboardService, t]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const refresh = useCallback(async () => {
    await fetchDashboard();
  }, [fetchDashboard]);

  const dismissAlert = useCallback(async (id: string) => {
    try {
      await dashboardService.dismissAlert(id);
      await fetchDashboard();
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  }, [dashboardService, fetchDashboard]);

  const formattedLastUpdate = dashboard 
    ? new Date(dashboard.generatedAt).toLocaleTimeString() 
    : '';

  return { dashboard, isLoading, error, refresh, dismissAlert, formattedLastUpdate };
}
