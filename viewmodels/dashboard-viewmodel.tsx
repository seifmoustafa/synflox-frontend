import { useState, useEffect, useCallback } from 'react';
import { Dashboard, CompanyStatsData, SubscriptionStatsData, AdminStatsData } from '@/domain';
import { useServices } from '@/providers/service-provider';

export type DashboardTab = 'overview' | 'companies' | 'subscriptions' | 'admins' | 'analytics';
export type ErrorType = 'network' | 'server' | 'unknown';

export function useDashboardViewModel() {
  const { dashboardService } = useServices();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>('unknown');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  
  // Detailed analytics data
  const [companyAnalytics, setCompanyAnalytics] = useState<CompanyStatsData | null>(null);
  const [subscriptionAnalytics, setSubscriptionAnalytics] = useState<SubscriptionStatsData | null>(null);
  const [adminAnalytics, setAdminAnalytics] = useState<AdminStatsData | null>(null);

  // Detect error type from error message/object
  const detectErrorType = (err: unknown): ErrorType => {
    const errorMessage = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
    
    if (errorMessage.includes('network') || 
        errorMessage.includes('fetch') || 
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout') ||
        !isOnline) {
      return 'network';
    }
    
    if (errorMessage.includes('500') || 
        errorMessage.includes('server') ||
        errorMessage.includes('internal')) {
      return 'server';
    }
    
    return 'unknown';
  };

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setErrorType('unknown');
      const data = await dashboardService.getDashboard();
      setDashboard(data);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load dashboard';
      const type = detectErrorType(err);
      
      setError(errorMsg);
      setErrorType(type);
      console.error('[Dashboard] Load error:', {
        error: err,
        type,
        message: errorMsg,
        retryCount
      });
    } finally {
      setIsLoading(false);
    }
  }, [dashboardService, isOnline, retryCount]);

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

  // Retry with exponential backoff
  const retryLoadDashboard = useCallback(async () => {
    const maxRetries = 3;
    if (retryCount >= maxRetries) {
      console.warn('[Dashboard] Max retries reached');
      return;
    }

    setRetryCount(prev => prev + 1);
    
    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, retryCount) * 1000;
    
    setTimeout(() => {
      loadDashboard();
    }, delay);
  }, [retryCount, loadDashboard]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (error && errorType === 'network') {
        loadDashboard();
      }
    };

    const handleOffline = () => {
      console.warn('[Dashboard] Network offline');
      setIsOnline(false);
      setError('No internet connection');
      setErrorType('network');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error, errorType, loadDashboard]);

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
    errorType,
    refreshDashboard,
    reload: loadDashboard,
    retry: retryLoadDashboard,
    retryCount,
    isOnline,
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
