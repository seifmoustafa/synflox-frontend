"use client";

import { useState, useEffect, useCallback } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { Subscription, SubscriptionStatus } from "@/domain/models/subscription.model";

/**
 * Analytics data interface matching backend response
 */
interface AnalyticsData {
  subscriptionId: string;
  companyName: string;
  planName: string;
  period: {
    from: string;
    to: string;
  };
  status: {
    isActive: boolean;
    isExpired: boolean;
    isTrial: boolean;
    daysRemaining: number;
  };
  usage: {
    totalDays: number;
    activeDays: number;
    utilizationPercentage: number;
  };
}

/**
 * History item interface
 */
interface HistoryItem {
  action: string;
  timestamp: string;
  reason: string;
  details: any;
}

/**
 * Subscription Analytics ViewModel Hook
 * Manages subscription analytics data and visualizations
 */
export function useSubscriptionAnalyticsViewModel(subscriptionId: string) {
  const { subscriptionService } = useServices();
  const { t } = useI18n();

  // State
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  // Calculate date range based on time range
  const getDateRange = useCallback(() => {
    const toDate = new Date();
    const fromDate = new Date();
    
    switch (timeRange) {
      case "7d":
        fromDate.setDate(fromDate.getDate() - 7);
        break;
      case "30d":
        fromDate.setDate(fromDate.getDate() - 30);
        break;
      case "90d":
        fromDate.setDate(fromDate.getDate() - 90);
        break;
      case "1y":
        fromDate.setFullYear(fromDate.getFullYear() - 1);
        break;
    }
    
    return { fromDate, toDate };
  }, [timeRange]);

  // Load subscription and analytics data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Loading analytics for subscription:", subscriptionId);

      // Load subscription details
      const sub = await subscriptionService.getSubscriptionById(subscriptionId);
      setSubscription(sub);
      console.log("📦 Loaded subscription:", sub);

      // Load status
      try {
        const status = await subscriptionService.getSubscriptionStatus(subscriptionId);
        setSubscriptionStatus(status);
        console.log("📊 Loaded status:", status);
      } catch (e) {
        console.warn("⚠️ Failed to load status:", e);
      }

      // Load analytics with date range
      try {
        const { fromDate, toDate } = getDateRange();
        const analyticsData = await subscriptionService.getSubscriptionAnalytics(subscriptionId, fromDate, toDate);
        setAnalytics(analyticsData);
        console.log("📈 Loaded analytics:", analyticsData);
      } catch (e) {
        console.warn("⚠️ Failed to load analytics:", e);
      }

      // Load history
      try {
        const historyData = await subscriptionService.getSubscriptionHistory(subscriptionId);
        setHistory(historyData);
        console.log("📜 Loaded history:", historyData);
      } catch (e) {
        console.warn("⚠️ Failed to load history:", e);
      }

    } catch (err: any) {
      console.error("❌ Failed to load subscription analytics:", err);
      setError(err.message || t("subscription.analyticsLoadError"));
    } finally {
      setLoading(false);
    }
  }, [subscriptionId, subscriptionService, t, getDateRange]);

  // Load data on mount and when time range changes
  useEffect(() => {
    if (subscriptionId) {
      loadData();
    }
  }, [subscriptionId, timeRange, loadData]);

  return {
    // Data
    subscription,
    subscriptionStatus,
    analytics,
    history,
    loading,
    error,
    
    // Filters
    timeRange,
    setTimeRange,
    
    // Actions
    loadData,
  };
}
