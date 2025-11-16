import { useState, useEffect, useCallback } from 'react';
import { Dashboard, CompanyStatsData, SubscriptionStatsData, AdminStatsData } from '@/domain';
import { useServices } from '@/providers/service-provider';

export type DashboardTab = 'overview' | 'companies' | 'subscriptions' | 'admins' | 'analytics';

export function useDashboardViewModel() {
  const { dashboardService } = useServices();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  
  // Detailed analytics data
  const [companyAnalytics, setCompanyAnalytics] = useState<CompanyStatsData | null>(null);
  const [subscriptionAnalytics, setSubscriptionAnalytics] = useState<SubscriptionStatsData | null>(null);
  const [adminAnalytics, setAdminAnalytics] = useState<AdminStatsData | null>(null);

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

  const loadCompanyAnalytics = useCallback(async () => {
    try {
      const data = await dashboardService.getCompanyAnalytics();
      setCompanyAnalytics(data);
    } catch (err) {
      console.error('Company analytics load error:', err);
    }
  }, [dashboardService]);

  const loadSubscriptionAnalytics = useCallback(async () => {
    try {
      const data = await dashboardService.getSubscriptionAnalytics();
      setSubscriptionAnalytics(data);
    } catch (err) {
      console.error('Subscription analytics load error:', err);
    }
  }, [dashboardService]);

  const loadAdminAnalytics = useCallback(async () => {
    try {
      const data = await dashboardService.getAdminAnalytics();
      setAdminAnalytics(data);
    } catch (err) {
      console.error('Admin analytics load error:', err);
    }
  }, [dashboardService]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Load detailed analytics when switching tabs
  useEffect(() => {
    if (activeTab === 'companies' && !companyAnalytics) {
      loadCompanyAnalytics();
    } else if (activeTab === 'subscriptions' && !subscriptionAnalytics) {
      loadSubscriptionAnalytics();
    } else if (activeTab === 'admins' && !adminAnalytics) {
      loadAdminAnalytics();
    }
  }, [activeTab, companyAnalytics, subscriptionAnalytics, adminAnalytics, loadCompanyAnalytics, loadSubscriptionAnalytics, loadAdminAnalytics]);

  return {
    dashboard,
    isLoading,
    isRefreshing,
    error,
    refreshDashboard,
    reload: loadDashboard,
    activeTab,
    setActiveTab,
    companyAnalytics,
    subscriptionAnalytics,
    adminAnalytics,
    loadCompanyAnalytics,
    loadSubscriptionAnalytics,
    loadAdminAnalytics,
  };
}
