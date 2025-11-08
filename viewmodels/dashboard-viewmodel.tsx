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
  SystemNotification,
  SystemNotificationsResponse,
} from "@/domain";
import { GenerateReportRequest, ReportType } from "@/domain";

export function useDashboardViewModel() {
  const { dashboardService, metricService, analyticsService, companyService, reportService, notificationSystemService } = useServices();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
  const [endpoints, setEndpoints] = useState<DashboardEndpoints | null>(null);
  const [metricsSummary, setMetricsSummary] = useState<MetricsSummary | null>(null);
  const [apiUsage, setApiUsage] = useState<ApiUsageAnalytics | null>(null);
  const [trialCompaniesCount, setTrialCompaniesCount] = useState<number>(0);
  const [expiryReportData, setExpiryReportData] = useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<SystemNotification[]>([]);
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

  const loadExpiryReport = useCallback(async () => {
    try {
      // Generate subscription expiry report for next 30 days
      const request = new GenerateReportRequest({
        reportType: ReportType.SubscriptionSummary, // Using SubscriptionSummary as closest match
        parameters: { days: 30 },
      });
      const report = await reportService.generateReport(request);
      // The report data structure depends on backend - assuming it has results array
      if (report.parameters && Array.isArray(report.parameters.results)) {
        setExpiryReportData(report.parameters.results);
      }
    } catch (e) {
      // Error already shown by service, set empty array
      setExpiryReportData([]);
    }
  }, [reportService]);

  const loadRecentNotifications = useCallback(async () => {
    try {
      const response = await notificationSystemService.getNotifications({
        page: 1,
        pageSize: 10,
        isRead: undefined, // Get both read and unread
      });
      setRecentNotifications(response.data || []);
    } catch (e) {
      // Error already shown, set empty array
      setRecentNotifications([]);
    }
  }, [notificationSystemService]);

  useEffect(() => {
    loadDashboardOverview();
    loadMetricsSummary();
    loadApiUsage();
    loadTrialCompaniesCount();
    loadExpiryReport();
    loadRecentNotifications();
  }, [loadDashboardOverview, loadMetricsSummary, loadApiUsage, loadTrialCompaniesCount, loadExpiryReport, loadRecentNotifications]);

  return {
    loading,
    error,
    overview,
    statistics,
    endpoints,
    metricsSummary,
    apiUsage,
    trialCompaniesCount,
    expiryReportData,
    recentNotifications,
    activeTab,
    setActiveTab,
    refresh: loadDashboardOverview,
    refreshStatistics: loadStatistics,
    refreshEndpoints: loadEndpoints,
    refreshMetrics: loadMetricsSummary,
    refreshApiUsage: loadApiUsage,
    refreshExpiryReport: loadExpiryReport,
    refreshNotifications: loadRecentNotifications,
  };
}

