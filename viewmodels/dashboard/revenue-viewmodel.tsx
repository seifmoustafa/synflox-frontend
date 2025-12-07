"use client";

import { useState, useEffect, useCallback } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useCurrency, SUPPORTED_CURRENCIES } from "@/providers/currency-provider";
import type { RevenueDashboard, CurrencyRates } from "@/domain";

// Re-export for backward compatibility
export { SUPPORTED_CURRENCIES };

export interface UseRevenueViewModelReturn {
  dashboard: RevenueDashboard | null;
  exchangeRates: CurrencyRates | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  formattedLastUpdate: string;
  formattedRatesUpdate: string;
}

export function useRevenueViewModel(): UseRevenueViewModelReturn {
  const { dashboardService } = useServices();
  const { t } = useI18n();
  const { activeCurrency, version } = useCurrency();
  
  const [dashboard, setDashboard] = useState<RevenueDashboard | null>(null);
  const [exchangeRates, setExchangeRates] = useState<CurrencyRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [data, rates] = await Promise.all([
        dashboardService.getRevenue(activeCurrency),
        dashboardService.getExchangeRates(activeCurrency)
      ]);
      setDashboard(data);
      setExchangeRates(rates);
    } catch (err) {
      console.error('Failed to fetch revenue dashboard:', err);
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
    ? new Date(dashboard.generatedAt).toLocaleTimeString() 
    : '';
    
  const formattedRatesUpdate = dashboard?.exchangeRatesUpdatedAt
    ? new Date(dashboard.exchangeRatesUpdatedAt).toLocaleString()
    : '';

  return { 
    dashboard, 
    exchangeRates,
    isLoading, 
    error, 
    refresh, 
    formattedLastUpdate,
    formattedRatesUpdate
  };
}
