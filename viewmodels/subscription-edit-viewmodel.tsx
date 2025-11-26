"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { Subscription } from "@/domain/models/subscription.model";
import { Currency } from "@/domain/models/subscription-plan.model";

interface SubscriptionFormData {
  companyId: string;
  planId: string;
  currency: Currency;
  amount: number;
  autoRenew: boolean;
  isActive: boolean;
  isTrial: boolean;
  isLifetime: boolean;
  startDateUtc: string;
  expiryDateUtc: string;
  statusReason: string | null;
}

/**
 * Subscription Edit ViewModel Hook
 * Manages subscription editing form and operations
 */
export function useSubscriptionEditViewModel(subscriptionId: string) {
  const { subscriptionService, companyService, subscriptionPlanService } = useServices();
  const { t } = useI18n();
  const router = useRouter();

  // State
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SubscriptionFormData>({
    companyId: "",
    planId: "",
    currency: Currency.USD,
    amount: 0,
    autoRenew: false,
    isActive: true,
    isTrial: false,
    isLifetime: false,
    startDateUtc: "",
    expiryDateUtc: "",
    statusReason: null,
  });
  const [originalFormData, setOriginalFormData] = useState<SubscriptionFormData | null>(null);

  // Dropdown options
  const [companyOptions, setCompanyOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [planOptions, setPlanOptions] = useState<Array<{ value: string; label: string }>>([]);

  // Load subscription and dropdown data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load subscription details
      const sub = await subscriptionService.getSubscriptionById(subscriptionId);
      setSubscription(sub);

      // Load dropdown options
      const [companies, plans] = await Promise.all([
        companyService.getCompanies({ page: 1, pageSize: 100 }),
        subscriptionPlanService.getAllPlans(1, 100)
      ]);

      setCompanyOptions(companies.data.map((c: any) => ({ value: c.id, label: c.name })));
      setPlanOptions(plans.plans.map((p: any) => ({ value: p.id, label: p.name })));

      // Initialize form data
      const initialFormData: SubscriptionFormData = {
        companyId: sub.companyId,
        planId: sub.planId,
        currency: sub.currency,
        amount: sub.amount,
        autoRenew: sub.autoRenew,
        isActive: sub.isActive,
        isTrial: sub.isTrial,
        isLifetime: sub.isLifetime,
        startDateUtc: sub.startDateUtc.toISOString().slice(0, 16),
        expiryDateUtc: sub.expiryDateUtc.toISOString().slice(0, 16),
        statusReason: sub.statusReason || null,
      };

      setFormData(initialFormData);
      setOriginalFormData(initialFormData);

    } catch (err: any) {
      console.error("❌ Failed to load subscription for editing:", err);
      setError(err.message || t("subscription.loadError"));
    } finally {
      setLoading(false);
    }
  }, [subscriptionId, subscriptionService, companyService, subscriptionPlanService, t]);

  // Load data on mount
  useEffect(() => {
    if (subscriptionId) {
      loadData();
    }
  }, [subscriptionId, loadData]);

  // Check if form has changes
  const hasChanges = useCallback(() => {
    if (!originalFormData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  }, [formData, originalFormData]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!subscription || !hasChanges()) return;

    try {
      setSaving(true);

      // Create update request (this would need to be implemented in the service)
      // For now, we'll just show a success message
      console.log("💾 Saving subscription changes:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to details page
      router.push(`/subscriptions/${subscriptionId}`);

    } catch (err: any) {
      console.error("❌ Failed to save subscription:", err);
      setError(err.message || t("subscription.saveError"));
    } finally {
      setSaving(false);
    }
  }, [subscription, formData, hasChanges, router, subscriptionId, t]);

  return {
    // Data
    subscription,
    loading,
    error,
    saving,
    
    // Form
    formData,
    setFormData,
    originalFormData,
    hasChanges: hasChanges(),
    
    // Options
    companyOptions,
    planOptions,
    
    // Actions
    handleSave,
    loadData,
  };
}
