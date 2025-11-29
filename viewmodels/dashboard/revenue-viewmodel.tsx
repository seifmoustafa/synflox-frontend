"use client";

import { useState, useEffect, useCallback } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import type { RevenueDashboard } from "@/domain";

export interface UseRevenueViewModelReturn {
  dashboard: RevenueDashboard | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  formattedLastUpdate: string;
}

export function useRevenueViewModel(): UseRevenueViewModelReturn {
  const { dashboardService } = useServices();
  const { t } = useI18n();
  
  const [dashboard, setDashboard] = useState<RevenueDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardService.getRevenue();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to fetch revenue dashboard:', err);
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

  const formattedLastUpdate = dashboard 
    ? new Date(dashboard.generatedAt).toLocaleTimeString() 
    : '';

  return { dashboard, isLoading, error, refresh, formattedLastUpdate };
}
