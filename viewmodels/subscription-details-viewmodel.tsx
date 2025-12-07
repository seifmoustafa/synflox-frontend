"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useCurrency } from "@/providers/currency-provider";
import { 
  Subscription,
  SubscriptionStatus,
  RenewSubscriptionRequest,
  SubscriptionActionRequest 
} from "@/domain/models/subscription.model";

// History item interface
interface SubscriptionHistoryItem {
  action: string;
  timestamp: string;
  reason: string;
  details: any;
}

// Analytics data interface
interface SubscriptionAnalytics {
  subscriptionId: string;
  companyName: string;
  planName: string;
  period: { from: string; to: string };
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
 * Subscription Details ViewModel Hook
 * Manages subscription details, lifecycle operations, and related data
 */
export function useSubscriptionDetailsViewModel(subscriptionId: string) {
  const { subscriptionService } = useServices();
  const { t } = useI18n();
  const { activeCurrency, version } = useCurrency();
  const router = useRouter();

  // State
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [history, setHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load subscription details
  const loadSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔍 Loading subscription details for ID:", subscriptionId, "Currency:", activeCurrency);
      const sub = await subscriptionService.getSubscriptionById(subscriptionId, activeCurrency);
      console.log("📦 Loaded subscription:", sub);
      
      setSubscription(sub);
    } catch (err: any) {
      console.error("❌ Failed to load subscription:", err);
      setError(err.message || t("subscription.loadError"));
    } finally {
      setLoading(false);
    }
  }, [subscriptionId, subscriptionService, t, activeCurrency]);

  // Load subscription status (detailed)
  const loadSubscriptionStatus = useCallback(async () => {
    try {
      setStatusLoading(true);
      console.log("🔍 Loading subscription status for ID:", subscriptionId);
      const status = await subscriptionService.getSubscriptionStatus(subscriptionId);
      console.log("📊 Loaded status:", status);
      setSubscriptionStatus(status);
    } catch (err: any) {
      console.error("❌ Failed to load subscription status:", err);
    } finally {
      setStatusLoading(false);
    }
  }, [subscriptionId, subscriptionService]);

  // Load subscription history
  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      console.log("📜 Loading subscription history for ID:", subscriptionId);
      const historyData = await subscriptionService.getSubscriptionHistory(subscriptionId);
      console.log("📜 Loaded history:", historyData);
      setHistory(historyData as any);
    } catch (err: any) {
      console.error("❌ Failed to load subscription history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [subscriptionId, subscriptionService]);

  // Load subscription analytics
  const loadAnalytics = useCallback(async (fromDate?: Date, toDate?: Date) => {
    try {
      setAnalyticsLoading(true);
      console.log("📈 Loading subscription analytics for ID:", subscriptionId);
      const analyticsData = await subscriptionService.getSubscriptionAnalytics(subscriptionId, fromDate, toDate);
      console.log("📈 Loaded analytics:", analyticsData);
      setAnalytics(analyticsData);
    } catch (err: any) {
      console.error("❌ Failed to load subscription analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [subscriptionId, subscriptionService]);

  // Load all data on mount and when currency changes
  useEffect(() => {
    if (subscriptionId) {
      // Load main subscription data
      loadSubscription();
      // Load additional data in parallel
      loadSubscriptionStatus();
      loadHistory();
      loadAnalytics();
    }
  }, [subscriptionId, loadSubscription, loadSubscriptionStatus, loadHistory, loadAnalytics, version]);

  // Lifecycle action handlers
  const handleLifecycleAction = useCallback(async (
    action: "renew" | "suspend" | "resume" | "cancel" | "pause" | "unpause" | "reactivate" | "stopTrial",
    subscription: Subscription,
    reason?: string,
    notes?: string,
    sendEmailNotification: boolean = true,
    language?: string
  ) => {
    try {
      setActionLoading(action);
      
      // Build request with user-provided data
      const actionRequest = new SubscriptionActionRequest({
        id: subscription.id,
        reason: reason || `Subscription ${action}ed by administrator`,
        notes: notes,
        sendEmailNotification: sendEmailNotification,
      });
      
      switch (action) {
        case "renew":
          const renewRequest = new RenewSubscriptionRequest({
            id: subscription.id,
            renewStrategy: "CreateFollowUp"
          });
          await subscriptionService.renewSubscription(renewRequest);
          break;
          
        case "suspend":
          await subscriptionService.suspendSubscription(actionRequest, language);
          break;
          
        case "resume":
          await subscriptionService.resumeSubscription(actionRequest, language);
          break;
          
        case "cancel":
          await subscriptionService.cancelSubscription(actionRequest, language);
          break;
          
        case "pause":
          await subscriptionService.pauseSubscription(actionRequest, language);
          break;
          
        case "unpause":
          await subscriptionService.unpauseSubscription(actionRequest, language);
          break;
          
        case "reactivate":
          await subscriptionService.reactivateSubscription(actionRequest, language);
          break;
          
        case "stopTrial":
          await subscriptionService.stopTrial(actionRequest, language);
          break;
      }
      
      // Reload subscription and history to get updated data
      await loadSubscription();
      await loadHistory();
      
    } catch (err: any) {
      console.error(`❌ Failed to ${action} subscription:`, err);
      setError(err.message || t(`subscription.operations.${action}Error`));
      throw err; // Re-throw so the dialog can show the error
    } finally {
      setActionLoading(null);
    }
  }, [subscriptionService, loadSubscription, loadHistory, t]);

  // Navigation helpers
  const navigateToEdit = useCallback(() => {
    router.push(`/subscriptions/${subscriptionId}/edit`);
  }, [router, subscriptionId]);

  const navigateToAnalytics = useCallback(() => {
    router.push(`/subscriptions/${subscriptionId}/analytics`);
  }, [router, subscriptionId]);

  const navigateToLicenseKeys = useCallback(() => {
    router.push(`/subscriptions/${subscriptionId}/license-keys`);
  }, [router, subscriptionId]);

  return {
    // Data
    subscription,
    subscriptionStatus,
    history,
    analytics,
    
    // Loading states
    loading,
    statusLoading,
    historyLoading,
    analyticsLoading,
    actionLoading,
    
    // Error
    error,
    
    // Actions
    handleLifecycleAction,
    loadSubscription,
    loadSubscriptionStatus,
    loadHistory,
    loadAnalytics,
    
    // Navigation
    navigateToEdit,
    navigateToAnalytics,
    navigateToLicenseKeys,
  };
}
