"use client";

import { useState, useEffect, useCallback } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import type {
  DashboardOverview,
  SystemStatistics,
  DashboardEndpoints,
  MetricsSummary,
  ApiUsageAnalytics,
} from "@/domain";

export function useDashboardViewModel() {
  const { dashboardService, metricService, analyticsService, companyService } = useServices();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
  const [endpoints, setEndpoints] = useState<DashboardEndpoints | null>(null);
  const [metricsSummary, setMetricsSummary] = useState<MetricsSummary | null>(null);
  const [apiUsage, setApiUsage] = useState<ApiUsageAnalytics | null>(null);
  const [trialCompaniesCount, setTrialCompaniesCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"statistics" | "endpoints">("statistics");

  const loadDashboardOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardOverview();
      setOverview(data);
      setStatistics(data.statistics);
      setEndpoints(data.endpoints);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : t("dashboard.error.loadFailed");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dashboardService, t]);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getStatistics();
      setStatistics(data);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : t("dashboard.error.loadFailed");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dashboardService, t]);

  const loadEndpoints = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getEndpoints();
      setEndpoints(data);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : t("dashboard.error.loadFailed");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dashboardService, t]);

  const loadMetricsSummary = useCallback(async () => {
    try {
      const data = await metricService.getSummary();
      setMetricsSummary(data);
    } catch (e) {
      // Error already shown by service
    }
  }, [metricService]);

  const loadApiUsage = useCallback(async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // Last 30 days
      const data = await analyticsService.getApiUsage({ startDate, endDate });
      setApiUsage(data);
    } catch (e) {
      // Error already shown by service
    }
  }, [analyticsService]);

  const loadTrialCompaniesCount = useCallback(async () => {
    try {
      // Get companies and filter for trials
      const response = await companyService.getCompanies({ page: 1, pageSize: 1000 });
      const companies = response.data || [];
      const trialCount = companies.filter((c: any) => c.isTrial).length;
      setTrialCompaniesCount(trialCount);
    } catch (e) {
      // Error already shown by service
    }
  }, [companyService]);

  useEffect(() => {
    loadDashboardOverview();
    loadMetricsSummary();
    loadApiUsage();
    loadTrialCompaniesCount();
  }, [loadDashboardOverview, loadMetricsSummary, loadApiUsage, loadTrialCompaniesCount]);

  return {
    loading,
    error,
    overview,
    statistics,
    endpoints,
    metricsSummary,
    apiUsage,
    trialCompaniesCount,
    activeTab,
    setActiveTab,
    refresh: loadDashboardOverview,
    refreshStatistics: loadStatistics,
    refreshEndpoints: loadEndpoints,
    refreshMetrics: loadMetricsSummary,
    refreshApiUsage: loadApiUsage,
  };
}

