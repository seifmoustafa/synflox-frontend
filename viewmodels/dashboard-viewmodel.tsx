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
import { ReportType, GenerateReportRequest } from "@/domain";

export interface ExpiryReportResult {
  companyId: string;
  companyName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  status: string;
}

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
  const [expiryReport, setExpiryReport] = useState<ExpiryReportResult[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<SystemNotification[]>([]);
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

  const loadExpiryReport = useCallback(async () => {
    try {
      // Fetch companies and filter those expiring within the next 30 days
      const response = await companyService.getCompanies({ page: 1, pageSize: 1000 });
      const companies = response.data || [];
      
      // Calculate date range for next 30 days
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      // Filter companies expiring within the next 30 days
      const expiringCompanies = companies
        .filter((company) => {
          if (!company.expiryDate) return false;
          
          const expiryDate = new Date(company.expiryDate);
          expiryDate.setHours(0, 0, 0, 0); // Normalize to start of day
          
          // Include companies that expire today or within the next 30 days
          return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
        })
        .map((company) => {
          const expiryDate = new Date(company.expiryDate!);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          // Determine status based on days until expiry
          let status = "active";
          if (daysUntilExpiry <= 7) {
            status = "critical";
          } else if (daysUntilExpiry <= 15) {
            status = "warning";
          }
          
          return {
            companyId: company.id,
            companyName: company.name,
            expiryDate: company.expiryDate!,
            daysUntilExpiry: daysUntilExpiry,
            status: status,
          } as ExpiryReportResult;
        })
        .sort((a, b) => {
          // Sort by expiry date (soonest first)
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        });
      
      setExpiryReport(expiringCompanies);
    } catch (e) {
      // Error already shown by service
      setExpiryReport([]);
    }
  }, [companyService]);

  const loadRecentNotifications = useCallback(async () => {
    try {
      const response = await notificationSystemService.getNotifications({
        page: 1,
        pageSize: 10,
        isRead: false, // Get unread notifications
      });
      setRecentNotifications(response.data || []);
    } catch (e) {
      // Error already shown by service
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
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadDashboardOverview();
      loadMetricsSummary();
      loadApiUsage();
      loadRecentNotifications();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadDashboardOverview, loadMetricsSummary, loadApiUsage, loadTrialCompaniesCount, loadExpiryReport, loadRecentNotifications]);

  return {
    loading,
    error,
    overview,
    statistics,
    endpoints,
    metricsSummary,
    apiUsage,
    expiryReport,
    recentNotifications,
    trialCompaniesCount,
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

