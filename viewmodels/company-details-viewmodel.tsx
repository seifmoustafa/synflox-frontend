"use client";

import { useCallback, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useCurrency } from "@/providers/currency-provider";
import { Company } from "@/domain";

/**
 * Company Details ViewModel Hook
 * Manages company details page state and operations
 */
export function useCompanyDetailsViewModel(companyId: string) {
  const { companyService, subscriptionService } = useServices();
  const { t } = useI18n();
  const router = useRouter();
  const { activeCurrency, version } = useCurrency();

  const [company, setCompany] = useState<Company | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Compute active subscription from subscriptions list
  // Include Active, Trial, and Expiring statuses
  const activeSubscription = useMemo(() => {
    return subscriptions.find((s: any) => 
      s.isActive && !s.isExpired
    ) || null;
  }, [subscriptions]);

  // Load company details
  const loadCompany = useCallback(async () => {
    if (!companyId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await companyService.getCompanyById(companyId, activeCurrency);
      setCompany(data);
    } catch (err: any) {
      console.error("Failed to load company:", err);
      setError(err.message || "Failed to load company");
    } finally {
      setIsLoading(false);
    }
  }, [companyId, companyService, activeCurrency]);

  // Load company subscriptions
  const loadSubscriptions = useCallback(async () => {
    if (!companyId) return;
    
    try {
      setSubscriptionsLoading(true);
      // Get subscriptions for this company with currency conversion
      const data = await subscriptionService.getCompanySubscriptions(companyId, activeCurrency);
      setSubscriptions(data || []);
    } catch (err: any) {
      console.error("Failed to load subscriptions:", err);
      // Don't set error for subscriptions, just log
    } finally {
      setSubscriptionsLoading(false);
    }
  }, [companyId, subscriptionService, activeCurrency]);

  // Initial load and re-fetch on currency change
  useEffect(() => {
    loadCompany();
    loadSubscriptions();
  }, [loadCompany, loadSubscriptions, version]);

  // Refresh data
  const refresh = useCallback(() => {
    loadCompany();
    loadSubscriptions();
  }, [loadCompany, loadSubscriptions]);

  // Navigate to edit
  const handleEdit = useCallback(() => {
    // For now, navigate back to companies list with edit action
    router.push(`/companies?edit=${companyId}`);
  }, [companyId, router]);

  // Navigate to create subscription
  const handleCreateSubscription = useCallback(() => {
    router.push(`/subscriptions?create=true&companyId=${companyId}`);
  }, [companyId, router]);

  // Navigate back
  const handleBack = useCallback(() => {
    router.push("/companies");
  }, [router]);

  return {
    company,
    subscriptions,
    activeSubscription,
    isLoading,
    subscriptionsLoading,
    error,
    refresh,
    handleEdit,
    handleCreateSubscription,
    handleBack,
  };
}
