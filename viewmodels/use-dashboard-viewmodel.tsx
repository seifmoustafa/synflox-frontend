import { useState, useEffect, useCallback } from 'react';
import { Dashboard } from '@/domain';
import { useServices } from '@/providers/service-provider';

export function useDashboardViewModel() {
  const { dashboardService } = useServices();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardService.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardService]);

  const refreshDashboard = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const data = await dashboardService.refreshDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh dashboard');
      console.error('Dashboard refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [dashboardService]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    dashboard,
    isLoading,
    isRefreshing,
    error,
    refreshDashboard,
    reload: loadDashboard,
  };
}
