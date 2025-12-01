"use client";

import { useCallback, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import {
  Subscription,
  CreateSubscriptionRequest,
  RenewSubscriptionRequest,
  UpgradeSubscriptionRequest,
  SubscriptionActionRequest,
  ExtendSubscriptionRequest,
} from "@/domain";
import { Currency } from "@/domain/models/subscription-plan.model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useActionFormDialog, getActionFormFields } from "@/components/ui/action-form-dialog";

/**
 * Subscription ViewModel Hook
 * Manages subscription listing and operations
 */
export function useSubscriptionViewModel() {
  const { subscriptionService, companyService, subscriptionPlanService } = useServices();
  const { t, language } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showActionForm, ActionFormDialog } = useActionFormDialog();
  
  // Get URL query parameters
  const preSelectedCompanyId = searchParams.get('companyId');
  const shouldOpenCreateModal = searchParams.get('create') === 'true';
  
  // State for dropdown data
  const [companyOptions, setCompanyOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [planOptions, setPlanOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [plansData, setPlansData] = useState<Array<{ id: string; allowTrial: boolean; isLifetimePlan: boolean; isFreeTier: boolean }>>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [dropdownsLoaded, setDropdownsLoaded] = useState(false);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
  
  // Helper to check if selected plan allows trial
  const selectedPlanAllowsTrial = plansData.find(p => p.id === selectedPlanId)?.allowTrial ?? true;
  const selectedPlanIsLifetime = plansData.find(p => p.id === selectedPlanId)?.isLifetimePlan ?? false;

  // Load companies and plans for dropdowns
  const loadDropdownData = useCallback(async () => {
    if (dropdownsLoaded || isLoadingDropdowns) return;
    
    setIsLoadingDropdowns(true);
    try {
      console.log("📥 Loading dropdown data...");
      const [companies, plans] = await Promise.all([
        companyService.getCompanies({ page: 1, pageSize: 100 }),
        subscriptionPlanService.getAllPlans(1, 100)
      ]);
      
      console.log("📦 Companies loaded:", companies);
      console.log("📦 Plans loaded:", plans);
      
      const companyOpts = companies.data.map((c: any) => ({ value: c.id, label: c.name }));
      const planOpts = plans.plans.map((p: any) => ({ value: p.id, label: p.name }));
      const planData = plans.plans.map((p: any) => ({ 
        id: p.id, 
        allowTrial: p.allowTrial ?? false,
        isLifetimePlan: p.isLifetimePlan ?? false,
        isFreeTier: p.isFreeTier ?? false 
      }));
      
      console.log("✅ Company options:", companyOpts);
      console.log("✅ Plan options:", planOpts);
      console.log("✅ Plans data (with trial info):", planData);
      
      setCompanyOptions(companyOpts);
      setPlanOptions(planOpts);
      setPlansData(planData);
      setDropdownsLoaded(true);
    } catch (error) {
      console.error("❌ Failed to load dropdown data:", error);
    } finally {
      setIsLoadingDropdowns(false);
    }
  }, [companyService, subscriptionPlanService, dropdownsLoaded, isLoadingDropdowns]);

  // Load dropdown data on mount
  useEffect(() => {
    loadDropdownData();
  }, [loadDropdownData]);

  // Lifecycle operations handlers with ActionFormDialog
  const handleRenew = useCallback((subscription: Subscription) => {
    showActionForm({
      title: "Renew Subscription",
      description: "Are you sure you want to renew this subscription?",
      fields: getActionFormFields(t, { reason: false, notes: false, emailLanguage: true, sendEmail: false }),
      variant: "default",
      confirmText: t("subscription.operations.renew"),
      itemCount: 1,
      onSubmit: async (values) => {
        const request = new RenewSubscriptionRequest({
          id: subscription.id,
          renewStrategy: "CreateFollowUp"
        });
        await subscriptionService.renewSubscription(request);
        router.refresh();
      },
    });
  }, [subscriptionService, router, showActionForm, t]);

  const handleSuspend = useCallback((subscription: Subscription) => {
    showActionForm({
      title: t("action.suspendSubscription"),
      description: t("action.suspendSubscriptionDesc"),
      fields: getActionFormFields(t, { reason: true, notes: false, emailLanguage: true, sendEmail: false }),
      variant: "warning",
      confirmText: t("subscription.suspend"),
      itemCount: 1,
      onSubmit: async (values) => {
        const request = new SubscriptionActionRequest({
          id: subscription.id,
          reason: values.reason as string
        });
        await subscriptionService.suspendSubscription(request, (values.lang as string) || undefined);
        router.refresh();
      },
    });
  }, [subscriptionService, router, showActionForm, t]);

  const handleResume = useCallback((subscription: Subscription) => {
    showActionForm({
      title: t("action.resumeSubscription"),
      description: t("action.resumeSubscriptionDesc"),
      fields: getActionFormFields(t, { reason: true, notes: false, emailLanguage: true, sendEmail: false }),
      variant: "default",
      confirmText: t("subscription.resume"),
      itemCount: 1,
      onSubmit: async (values) => {
        const request = new SubscriptionActionRequest({
          id: subscription.id,
          reason: values.reason as string
        });
        await subscriptionService.resumeSubscription(request, (values.lang as string) || undefined);
        router.refresh();
      },
    });
  }, [subscriptionService, router, showActionForm, t]);

  const handleCancel = useCallback((subscription: Subscription) => {
    showActionForm({
      title: t("action.cancelSubscription"),
      description: t("action.cancelSubscriptionDesc"),
      fields: getActionFormFields(t, { reason: true, notes: true, emailLanguage: true, sendEmail: false }),
      variant: "destructive",
      confirmText: t("subscription.cancel"),
      itemCount: 1,
      onSubmit: async (values) => {
        const request = new SubscriptionActionRequest({
          id: subscription.id,
          reason: values.reason as string
        });
        await subscriptionService.cancelSubscription(request, (values.lang as string) || undefined);
        router.refresh();
      },
    });
  }, [subscriptionService, router, showActionForm, t]);

  const handleUpgrade = useCallback((subscription: Subscription) => {
    showActionForm({
      title: t("subscription.operations.upgrade"),
      description: t("subscription.upgradeDescription"),
      fields: [
        ...getActionFormFields(t, { reason: false, notes: false, emailLanguage: true, sendEmail: false }),
        {
          name: "newPlanId",
          label: t("subscription.newPlan"),
          type: "select",
          placeholder: t("subscription.selectNewPlan"),
          required: true,
          options: planOptions || [],
        },
        {
          name: "mode",
          label: t("subscription.upgradeMode"),
          type: "select",
          placeholder: t("subscription.selectUpgradeMode"),
          required: true,
          options: [
            { value: "DefaultFromPolicy", label: t("subscription.upgradeModes.default") },
            { value: "FullReplace", label: t("subscription.upgradeModes.fullReplace") },
            { value: "Prorated", label: t("subscription.upgradeModes.prorated") },
            { value: "Deferred", label: t("subscription.upgradeModes.deferred") },
          ],
        }
      ],
      variant: "default",
      confirmText: t("subscription.operations.upgrade"),
      itemCount: 1,
      onSubmit: async (values) => {
        try {
          const request = new UpgradeSubscriptionRequest({
            id: subscription.id,
            newPlanId: values.newPlanId as string,
            mode: values.mode as "FullReplace" | "Prorated" | "Deferred" | "DefaultFromPolicy",
          });
          await subscriptionService.upgradeSubscription(request);
          // Refresh data after dialog closes
          setTimeout(() => router.refresh(), 100);
        } catch (error) {
          // Error already handled by service notification, don't re-throw
          // to allow dialog to close
          console.error("Upgrade failed:", error);
        }
      },
    });
  }, [subscriptionService, router, showActionForm, t, planOptions]);

  const handleExtend = useCallback((subscription: Subscription) => {
    showActionForm({
      title: "Extend Subscription",
      description: "Are you sure you want to extend this subscription?",
      fields: [
        ...getActionFormFields(t, { reason: true, notes: true, emailLanguage: true, sendEmail: true }),
        {
          name: "extensionDays",
          label: "Extension Days",
          type: "text",
          placeholder: "Enter number of days (1-3650)",
          required: true,
        }
      ],
      variant: "default",
      confirmText: t("subscription.operations.extend"),
      itemCount: 1,
      onSubmit: async (values) => {
        const request = new ExtendSubscriptionRequest({
          id: subscription.id,
          extensionDays: parseInt(values.extensionDays as string),
          reason: values.reason as string,
          notes: values.notes as string,
          sendEmailNotification: values.sendEmailNotification as boolean,
        });
        await subscriptionService.extendSubscription(request, (values.lang as string) || undefined);
        router.refresh();
      },
    });
  }, [subscriptionService, router, showActionForm, t]);

  const handlePause = useCallback((subscription: Subscription) => {
    showActionForm({
      title: "Pause Subscription",
      description: "Are you sure you want to pause this subscription?",
      fields: getActionFormFields(t, { reason: true, notes: false, emailLanguage: true, sendEmail: false }),
      variant: "warning",
      confirmText: t("subscription.operations.pause"),
      itemCount: 1,
      onSubmit: async (values) => {
        const request = new SubscriptionActionRequest({
          id: subscription.id,
          reason: values.reason as string
        });
        await subscriptionService.pauseSubscription(request, (values.lang as string) || undefined);
        router.refresh();
      },
    });
  }, [subscriptionService, router, showActionForm, t]);

  const handleUnpause = useCallback((subscription: Subscription) => {
    showActionForm({
      title: "Unpause Subscription",
      description: "Are you sure you want to unpause this subscription?",
      fields: getActionFormFields(t, { reason: true, notes: false, emailLanguage: true, sendEmail: false }),
      variant: "default",
      confirmText: t("subscription.operations.unpause"),
      itemCount: 1,
      onSubmit: async (values) => {
        const request = new SubscriptionActionRequest({
          id: subscription.id,
          reason: values.reason as string
        });
        await subscriptionService.unpauseSubscription(request, (values.lang as string) || undefined);
        router.refresh();
      },
    });
  }, [subscriptionService, router, showActionForm, t]);

  const handleStopTrial = useCallback((subscription: Subscription) => {
    showActionForm({
      title: "Stop Trial",
      description: "Are you sure you want to convert this trial to a paid subscription?",
      fields: getActionFormFields(t, { reason: true, notes: false, emailLanguage: true, sendEmail: false }),
      variant: "warning",
      confirmText: t("subscription.operations.stopTrial"),
      itemCount: 1,
      onSubmit: async (values) => {
        const request = new SubscriptionActionRequest({
          id: subscription.id,
          reason: values.reason as string
        });
        await subscriptionService.stopTrial(request, (values.lang as string) || undefined);
        router.refresh();
      },
    });
  }, [subscriptionService, router, showActionForm, t]);

  const handleReactivate = useCallback((subscription: Subscription) => {
    showActionForm({
      title: "Reactivate Subscription",
      description: "Are you sure you want to reactivate this expired subscription?",
      fields: getActionFormFields(t, { reason: true, notes: false, emailLanguage: true, sendEmail: false }),
      variant: "default",
      confirmText: t("subscription.operations.reactivate"),
      itemCount: 1,
      onSubmit: async (values) => {
        const request = new SubscriptionActionRequest({
          id: subscription.id,
          reason: values.reason as string
        });
        await subscriptionService.reactivateSubscription(request, (values.lang as string) || undefined);
        router.refresh();
      },
    });
  }, [subscriptionService, router, showActionForm, t]);

  // Service interface for generic CRUD
  const service = {
    getData: async (params: { page: number; pageSize: number; search?: string }) => {
      console.log("🔍 ViewModel: Getting subscriptions with params:", params);
      const response = await subscriptionService.getAllSubscriptions(
        params.page,
        params.pageSize,
        params.search
      );
      console.log("📦 ViewModel: Got response:", response);
      console.log("📊 ViewModel: Data items:", response.data);
      console.log("📄 ViewModel: Pagination:", response.pagination);
      
      // Debug each subscription item
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((item, index) => {
          console.log(`🔍 Item ${index}:`, item);
          console.log(`🔍 Item ${index} type:`, typeof item);
          console.log(`🔍 Item ${index} constructor:`, item?.constructor?.name);
        });
      }
      
      return response;
    },
    create: async (data: any) => {
      // Validate and sanitize based on plan restrictions
      const selectedPlan = plansData.find(p => p.id === data.planId);
      const canTrial = selectedPlan ? (selectedPlan.allowTrial && !selectedPlan.isLifetimePlan) : false;
      const canAutoRenew = selectedPlan ? !selectedPlan.isLifetimePlan : true;
      
      const request = new CreateSubscriptionRequest({
        companyId: data.companyId,
        planId: data.planId,
        // Currency selection
        currency: data.currency ? parseInt(data.currency) : 1, // Default USD
        // Custom amount (optional override)
        customAmount: data.customAmount ? parseFloat(data.customAmount) : undefined,
        // Start date (optional, default today)
        startDateUtc: data.startDateUtc || undefined,
        // Only allow trial if plan permits it
        startWithTrial: canTrial ? (data.startWithTrial || false) : false,
        // Only allow auto-renew if not lifetime plan
        autoRenew: canAutoRenew ? (data.autoRenew || false) : false,
        // Notes/status reason
        statusReason: data.statusReason || undefined,
      });
      return await subscriptionService.createSubscription(request);
    },
    update: async () => {
      throw new Error("Subscriptions cannot be updated directly");
    },
    delete: async () => {
      throw new Error("Subscriptions cannot be deleted");
    },
    getById: async (id: string) => {
      return await subscriptionService.getSubscriptionById(id);
    },
  };

  const vmConfig = {
    itemTypeName: t("subscription.item"),
    itemTypeNamePlural: t("subscription.items"),
    getItemDisplayName: (subscription: Subscription) => subscription.planName,
    searchParamName: "search" as const,
  };

  const vm = useGenericCrudViewModel<Subscription, any, any, any>(
    service,
    vmConfig
  );

  // Auto-open create modal if URL has ?create=true
  useEffect(() => {
    if (shouldOpenCreateModal && vm.setIsCreateModalOpen) {
      // Small delay to ensure dropdowns are loaded
      const timer = setTimeout(() => {
        vm.setIsCreateModalOpen(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldOpenCreateModal, vm.setIsCreateModalOpen]);

  // Table configuration
  const config = {
    titleKey: "subscription.title",
    subtitleKey: "subscription.description",
    itemName: t("subscription.item"),
    itemsName: t("subscription.items"),

    columns: [
      {
        key: "companyName",
        label: t("subscription.company"),
        render: (value: any, sub: Subscription) => {
          console.log("🎯 Render companyName - value:", value);
          console.log("🎯 Render companyName - sub:", sub);
          console.log("🎯 Render companyName - type:", typeof sub);
          console.log("🎯 Render companyName - constructor:", sub?.constructor?.name);
          if (!sub) return "-";
          return sub.companyName || "-";
        },
      },
      {
        key: "planName",
        label: t("subscription.plan"),
        render: (value: any, sub: Subscription) => {
          if (!sub) return "-";
          return sub.planName || "-";
        },
      },
      {
        key: "status",
        label: t("subscription.status"),
        render: (value: any, sub: Subscription) => {
          if (!sub) {
            return (
              <Badge variant="secondary">
                {t("subscription.statuses.unknown")}
              </Badge>
            );
          }
          
          const status = sub.status || "Unknown";
          const colors: Record<string, string> = {
            Trial: "blue",
            Active: "green",
            Expiring: "yellow",
            Expired: "red",
            Suspended: "orange",
            Cancelled: "gray",
            Lifetime: "purple",
          };
          const color = colors[status] || "gray";
          
          return (
            <Badge variant={color as any}>
              {t(`subscription.statuses.${status.toLowerCase()}`)}
            </Badge>
          );
        },
      },
      {
        key: "startDate",
        label: t("subscription.startDate"),
        render: (value: any, sub: Subscription) => {
          if (!sub || !sub.startDateUtc) return "-";
          return formatDate(sub.startDateUtc) || "-";
        },
      },
      {
        key: "expiryDate",
        label: t("subscription.expiryDate"),
        render: (value: any, sub: Subscription) => {
          if (!sub) return "-";
          if (sub.isLifetime) return t("subscription.lifetime");
          if (!sub.expiryDateUtc) return "-";
          return formatDate(sub.expiryDateUtc) || "-";
        },
      },
      {
        key: "daysRemaining",
        label: t("subscription.daysRemaining"),
        render: (value: any, sub: Subscription) => {
          if (!sub) return "-";
          if (sub.isLifetime) return "∞";
          return sub.daysRemaining?.toString() || "-";
        },
      },
      {
        key: "amount",
        label: t("subscription.amount"),
        render: (value: any, sub: Subscription) => {
          if (!sub || sub.amount === undefined || sub.currency === undefined) return "-";
          const currencyName = Currency[sub.currency] || "USD";
          return `${sub.amount} ${currencyName}`;
        },
      },
    ],

    // Pre-fill form with company from URL if provided
    createInitialValues: preSelectedCompanyId ? {
      companyId: preSelectedCompanyId,
    } : {},
    
    createFields: [
      {
        name: "companyId",
        label: t("subscription.company"),
        type: "select" as const,
        required: true,
        options: companyOptions,
        helperText: t("subscription.companyHelper"),
        disabled: !!preSelectedCompanyId,
      },
      {
        name: "planId",
        label: t("subscription.plan"),
        type: "select" as const,
        required: true,
        options: planOptions,
        helperText: t("subscription.planHelper"),
        onChange: (value: any) => {
          setSelectedPlanId(value);
        },
      },
      {
        name: "currency",
        label: t("subscription.currency"),
        type: "select" as const,
        required: true,
        helperText: t("subscription.currencyHelper"),
        options: [
          { value: "1", label: t("plan.currencies.usd") },
          { value: "2", label: t("plan.currencies.eur") },
          { value: "3", label: t("plan.currencies.egp") },
          { value: "4", label: t("plan.currencies.sar") },
          { value: "5", label: t("plan.currencies.aed") },
          { value: "6", label: t("plan.currencies.gbp") },
          { value: "7", label: t("plan.currencies.jpy") },
          { value: "8", label: t("plan.currencies.cny") },
        ],
        // Hide currency field for free tier plans
        isVisible: (formData: Record<string, any>) => {
          const planId = formData.planId;
          if (!planId) return true;
          const plan = plansData.find(p => p.id === planId);
          return plan ? !plan.isFreeTier : true;
        },
      },
      {
        name: "customAmount",
        label: t("subscription.customAmount"),
        type: "number" as const,
        placeholder: t("subscription.customAmountPlaceholder"),
        helperText: t("subscription.customAmountHelper"),
        min: 0,
        // Hide custom amount field for free tier plans
        isVisible: (formData: Record<string, any>) => {
          const planId = formData.planId;
          if (!planId) return true;
          const plan = plansData.find(p => p.id === planId);
          return plan ? !plan.isFreeTier : true;
        },
      },
      {
        name: "startDateUtc",
        label: t("subscription.startDate"),
        type: "date" as const,
        helperText: t("subscription.startDateHelper"),
      },
      {
        name: "startWithTrial",
        label: t("subscription.startWithTrial"),
        type: "checkbox" as const,
        helperText: t("subscription.trialHelper"),
        isVisible: (formData: Record<string, any>) => {
          const planId = formData.planId;
          if (!planId) return true;
          const plan = plansData.find(p => p.id === planId);
          return plan ? (plan.allowTrial && !plan.isLifetimePlan) : true;
        },
      },
      {
        name: "autoRenew",
        label: t("subscription.autoRenew"),
        type: "checkbox" as const,
        helperText: t("subscription.autoRenewHelper"),
        isVisible: (formData: Record<string, any>) => {
          const planId = formData.planId;
          if (!planId) return true;
          const plan = plansData.find(p => p.id === planId);
          return plan ? !plan.isLifetimePlan : true;
        },
      },
      {
        name: "statusReason",
        label: t("subscription.notes"),
        type: "textarea" as const,
        placeholder: t("subscription.notesPlaceholder"),
        helperText: t("subscription.notesHelper"),
        maxLength: 500,
      },
    ],
    editFields: [
      {
        name: "autoRenew",
        label: t("subscription.autoRenew"),
        type: "checkbox" as const,
        helperText: t("subscription.autoRenewHelper"),
      },
      {
        name: "statusReason",
        label: t("subscription.notes"),
        type: "textarea" as const,
        placeholder: t("subscription.notesPlaceholder"),
        helperText: t("subscription.notesHelper"),
        maxLength: 500,
      },
    ],
    
    // Actions configuration - show only relevant actions based on subscription state
    getActions: (vm: any, t: any, handleDelete?: (item: Subscription) => void) => [
      {
        label: t("subscription.operations.view"),
        onClick: (item: Subscription) => router.push(`/subscriptions/${item.id}`),
        variant: "ghost" as const,
      },
      {
        label: t("subscription.operations.renew"),
        onClick: (item: Subscription) => handleRenew(item),
        variant: "outline" as const,
        show: (item: Subscription) => item.canRenew,
      },
      {
        label: t("subscription.operations.suspend"),
        onClick: (item: Subscription) => handleSuspend(item),
        variant: "outline" as const,
        show: (item: Subscription) => item.canSuspend, // Only show if active (not suspended)
      },
      {
        label: t("subscription.operations.resume"),
        onClick: (item: Subscription) => handleResume(item),
        variant: "outline" as const,
        show: (item: Subscription) => item.canResume, // Only show if suspended
      },
      {
        label: t("subscription.operations.cancel"),
        onClick: (item: Subscription) => handleCancel(item),
        variant: "destructive" as const,
        show: (item: Subscription) => item.canCancel,
      },
      {
        label: t("subscription.operations.upgrade"),
        onClick: (item: Subscription) => handleUpgrade(item),
        variant: "outline" as const,
        show: (item: Subscription) => item.canUpgrade,
      },
      {
        label: t("subscription.operations.extend"),
        onClick: (item: Subscription) => handleExtend(item),
        variant: "outline" as const,
        show: (item: Subscription) => item.canExtend,
      },
      {
        label: t("subscription.operations.pause"),
        onClick: (item: Subscription) => handlePause(item),
        variant: "outline" as const,
        show: (item: Subscription) => item.isActive && !item.isTrial && item.status !== "Suspended",
      },
      {
        label: t("subscription.operations.unpause"),
        onClick: (item: Subscription) => handleUnpause(item),
        variant: "outline" as const,
        show: (item: Subscription) => item.status === "Paused",
      },
      {
        label: t("subscription.operations.stopTrial"),
        onClick: (item: Subscription) => handleStopTrial(item),
        variant: "outline" as const,
        show: (item: Subscription) => item.isTrial && item.isActive,
      },
      {
        label: t("subscription.operations.reactivate"),
        onClick: (item: Subscription) => handleReactivate(item),
        variant: "outline" as const,
        show: (item: Subscription) => item.canReactivate,
      },
    ],
  };

  return { vm, config, ActionFormDialog };
}
