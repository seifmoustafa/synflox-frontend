"use client";

import { useState, useEffect, useCallback } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useCurrency } from "@/providers/currency-provider";
import type { OverviewDashboard } from "@/domain";

export interface UseOverviewViewModelReturn {
  // Data
  dashboard: OverviewDashboard | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refresh: () => Promise<void>;
  
  // Computed
  formattedLastUpdate: string;
}

export function useOverviewViewModel(): UseOverviewViewModelReturn {
  const { dashboardService } = useServices();
  const { t } = useI18n();
  const { activeCurrency, version } = useCurrency();
  
  const [dashboard, setDashboard] = useState<OverviewDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardService.getOverview(activeCurrency);
      setDashboard(data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
      setError(t('dashboard.error'));
    } finally {
      setIsLoading(false);
    }
  }, [dashboardService, t, activeCurrency, version]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const refresh = useCallback(async () => {
    await fetchDashboard();
  }, [fetchDashboard]);

  const formattedLastUpdate = dashboard 
    ? dashboard.formattedGeneratedAt 
    : '';

  return {
    dashboard,
    isLoading,
    error,
    refresh,
    formattedLastUpdate,
  };
}
