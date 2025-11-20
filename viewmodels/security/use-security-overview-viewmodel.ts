/**
 * Security Overview ViewModel
 * Displays security dashboard with score, recommendations, and recent events
 */

import { useState, useCallback, useEffect } from 'react';
import { useServices } from '@/providers/service-provider';
import { useI18n } from '@/providers/i18n-provider';
import { SecurityDashboard } from '@/domain';

export interface SecurityOverviewViewModelReturn {
  // State
  dashboard: SecurityDashboard | null;
  isLoading: boolean;
  error: string | null;
  
  // Handlers
  handleLoadDashboard: () => Promise<void>;
  handleRefresh: () => Promise<void>;
  
  // Computed
  hasData: boolean;
}

export function useSecurityOverviewViewModel(): SecurityOverviewViewModelReturn {
  const { profileService } = useServices();
  const { t } = useI18n();

  // State
  const [dashboard, setDashboard] = useState<SecurityDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard on mount
  useEffect(() => {
    handleLoadDashboard();
  }, []);

  // Handlers
  const handleLoadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await profileService.getSecurityDashboard();
      setDashboard(data);
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        t('security.loadDashboardError') ||
        'Failed to load security dashboard';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [profileService, t]);

  const handleRefresh = useCallback(async () => {
    await handleLoadDashboard();
  }, [handleLoadDashboard]);

  // Computed
  const hasData = dashboard !== null;

  return {
    // State
    dashboard,
    isLoading,
    error,
    
    // Handlers
    handleLoadDashboard,
    handleRefresh,
    
    // Computed
    hasData,
  };
}
