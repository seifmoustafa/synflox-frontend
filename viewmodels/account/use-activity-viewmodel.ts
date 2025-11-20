/**
 * Activity & Security Analytics ViewModel
 * Manages state and business logic for the activity/security analytics page
 */

import { useState, useEffect, useCallback } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { SecurityDashboard } from "@/domain";

export interface ActivityViewModelReturn {
  // State
  securityDashboard: SecurityDashboard | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  reload: () => Promise<void>;
  
  // Date range for analytics (future feature)
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  setDateRange: (startDate: Date | null, endDate: Date | null) => void;
}

export function useActivityViewModel(): ActivityViewModelReturn {
  const { accountService } = useServices();
  const { t } = useI18n();

  const [securityDashboard, setSecurityDashboard] = useState<SecurityDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRangeState] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  /**
   * Load security dashboard data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await accountService.getSecurityDashboard();
      setSecurityDashboard(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("activity.errors.loadData");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [accountService, t]);

  /**
   * Reload data
   */
  const reload = useCallback(async () => {
    await loadData();
  }, [loadData]);

  /**
   * Set date range for analytics
   */
  const setDateRange = useCallback((startDate: Date | null, endDate: Date | null) => {
    setDateRangeState({ startDate, endDate });
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    securityDashboard,
    isLoading,
    error,
    reload,
    dateRange,
    setDateRange,
  };
}
