"use client";

import { useState, useEffect, useCallback } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import type {
  DashboardOverview,
  SystemStatistics,
  DashboardEndpoints,
} from "@/domain";

export function useDashboardViewModel() {
  const { dashboardService } = useServices();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
  const [endpoints, setEndpoints] = useState<DashboardEndpoints | null>(null);
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

  useEffect(() => {
    loadDashboardOverview();
  }, [loadDashboardOverview]);

  return {
    loading,
    error,
    overview,
    statistics,
    endpoints,
    activeTab,
    setActiveTab,
    refresh: loadDashboardOverview,
    refreshStatistics: loadStatistics,
    refreshEndpoints: loadEndpoints,
  };
}

