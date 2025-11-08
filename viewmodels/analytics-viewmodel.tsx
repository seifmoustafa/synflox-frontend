"use client";

import { useState, useCallback, useEffect } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import type {
  CompanyUsageAnalytics,
  ApiUsageAnalytics,
} from "@/domain";

export function useAnalyticsViewModel(companyId?: string) {
  const { analyticsService } = useServices();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [companyUsage, setCompanyUsage] = useState<CompanyUsageAnalytics | null>(null);
  const [apiUsage, setApiUsage] = useState<ApiUsageAnalytics | null>(null);
  const [apiUsageByEndpoint, setApiUsageByEndpoint] = useState<ApiUsageAnalytics | null>(null);
  const [apiUsageByCompany, setApiUsageByCompany] = useState<ApiUsageAnalytics | null>(null);
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const loadCompanyUsage = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const data = await analyticsService.getCompanyUsage(companyId, dateRange);
      setCompanyUsage(data);
    } catch (e) {
      // Error already shown by service
    } finally {
      setLoading(false);
    }
  }, [companyId, analyticsService, dateRange]);

  const loadApiUsage = useCallback(async () => {
    try {
      setLoading(true);
      const [usage, byEndpoint, byCompany] = await Promise.all([
        analyticsService.getApiUsage(dateRange),
        analyticsService.getApiUsageByEndpoint(dateRange),
        analyticsService.getApiUsageByCompany(dateRange),
      ]);
      setApiUsage(usage);
      setApiUsageByEndpoint(byEndpoint);
      setApiUsageByCompany(byCompany);
    } catch (e) {
      // Error already shown by service
    } finally {
      setLoading(false);
    }
  }, [analyticsService, dateRange]);

  useEffect(() => {
    if (companyId) {
      loadCompanyUsage();
    } else {
      loadApiUsage();
    }
  }, [companyId, loadCompanyUsage, loadApiUsage]);

  const updateDateRange = useCallback((startDate?: string, endDate?: string) => {
    setDateRange({ startDate, endDate });
  }, []);

  return {
    loading,
    companyUsage,
    apiUsage,
    apiUsageByEndpoint,
    apiUsageByCompany,
    dateRange,
    updateDateRange,
    refresh: companyId ? loadCompanyUsage : loadApiUsage,
  };
}

