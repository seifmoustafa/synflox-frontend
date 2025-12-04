"use client";

import React, { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import {
  SubscriptionPlan,
  CreatePlanRequest,
  UpdatePlanRequest,
  PlanDurationType,
  UpgradePolicy,
} from "@/domain";
import { Badge } from "@/components/ui/badge";
import { PlanModuleConflict, CreatePlanWithConfirmationRequest } from "@/services/subscription-plan.service";

export function useSubscriptionPlanViewModel() {
  const router = useRouter();
  const { subscriptionPlanService, projectService, moduleService } = useServices();
  const { t } = useI18n();
  
  // Load projects, modules, free tier plans, and parent plans for dropdowns
  const [projectOptions, setProjectOptions] = React.useState<Array<{value: string, label: string}>>([]);
  const [moduleOptions, setModuleOptions] = React.useState<Array<{value: string, label: string}>>([]);
  const [freeTierPlanOptions, setFreeTierPlanOptions] = React.useState<Array<{value: string, label: string}>>([]);
  const [parentPlanOptions, setParentPlanOptions] = React.useState<Array<{value: string, label: string}>>([]);
  
  // Module conflict dialog state for CREATE
  const [showConflictDialog, setShowConflictDialog] = React.useState(false);
  const [moduleConflicts, setModuleConflicts] = React.useState<PlanModuleConflict[]>([]);
  const [pendingCreateData, setPendingCreateData] = React.useState<any>(null);
  const [isConfirmLoading, setIsConfirmLoading] = React.useState(false);
  
  // Custom initial values for reopening form with data
  const [customCreateInitialValues, setCustomCreateInitialValues] = React.useState<any>(null);
  
  // Ref to store modal closer and refresh function (will be set after VM is created)
  const closeCreateModalRef = React.useRef<(() => void) | null>(null);
  const refreshDataRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    // Load projects
    projectService.getProjects({ page: 1, pageSize: 100 }).then(result => {
      setProjectOptions(result.data.map((p: any) => ({
        value: p.id,
        label: p.name
      })));
    });

    // Load modules
    moduleService.getAllModules(1, 100).then(result => {
      setModuleOptions(result.modules.map((m: any) => ({
        value: m.id,
        label: m.name
      })));
    });

    // Load all plans for dropdowns
    subscriptionPlanService.getAllPlans(1, 100).then(result => {
      // For parent plan dropdown - show hierarchy
      setParentPlanOptions(result.plans.map((p: any) => ({
        value: p.id,
        label: `${p.name}${p.parentPlanName ? ` (← ${p.parentPlanName})` : ''}`
      })));
      
      // For fallback plan dropdown - show all plans with free tier indicator
      setFreeTierPlanOptions(result.plans.map((p: any) => ({
        value: p.id,
        label: p.isFreeTier ? `⭐ ${p.name} (${t("plan.isFreeTier")})` : p.name
      })));
    });
  }, [projectService, moduleService, subscriptionPlanService, t]);

  // ⭐ CUSTOM VALIDATION: At least one project or module required (unless inheriting from parent)
  const validatePlanContent = (formData: any): string | null => {
    const hasProjects = formData.projectIds && formData.projectIds.length > 0;
    const hasModules = formData.moduleIds && formData.moduleIds.length > 0;
    const hasParent = !!formData.parentPlanId;
    
    // Plans with a parent can inherit all content from parent
    if (!hasProjects && !hasModules && !hasParent) {
      return t("plan.mustIncludeContent");
    }
    
    return null;
  };

  const createPlan = async (data: any) => {
    // ⭐ Validate content before submission
    const contentError = validatePlanContent(data);
    if (contentError) {
      throw new Error(contentError);
    }

    // Convert currency and amount fields into prices array
    const prices = data.currency && data.amount ? [{
      currency: parseInt(data.currency),
      amount: parseFloat(data.amount)
    }] : [];

    const request = new CreatePlanRequest({
      name: data.name,
      description: data.description,
      durationType: parseInt(data.durationType),
      prices,
      allowTrial: data.allowTrial,
      trialDurationDays: data.trialDurationDays,
      autoRenew: data.autoRenew,
      upgradePolicy: data.upgradePolicy ? parseInt(data.upgradePolicy) : undefined,
      gracePeriodDays: data.gracePeriodDays,
      exportGraceDays: data.exportGraceDays,
      isFreeTier: data.isFreeTier,
      fallbackAccessMode: data.fallbackAccessMode ? parseInt(data.fallbackAccessMode) : undefined,
      showLockedModulesInMenu: data.showLockedModulesInMenu,
      customFeatures: data.customFeatures || [],
      projectIds: data.projectIds || [],
      moduleIds: data.moduleIds || [],
      // Plan Hierarchy
      parentPlanId: data.parentPlanId || null,
      displayOrder: data.displayOrder ? parseInt(data.displayOrder) : 0,
    });
    
    try {
      return await subscriptionPlanService.createPlan(request);
    } catch (error: any) {
      // Handle module conflict error (409 Conflict)
      const isConflict = error?.statusCode === 409 || error?.response?.status === 409;
      const responseData = error?.response?.data;
      
      if (isConflict && responseData?.requiresConfirmation) {
        // Store data for confirmation dialog
        setPendingCreateData(data);
        const conflicts = responseData.validationResult?.moduleConflicts || [];
        setModuleConflicts(conflicts);
        
        // Close the create modal first
        if (closeCreateModalRef.current) {
          closeCreateModalRef.current();
        }
        
        // Show conflict dialog
        setShowConflictDialog(true);
        
        // Return a dummy result to prevent error - the dialog will handle the rest
        return {} as SubscriptionPlan;
      }
      throw error;
    }
  };
  
  // Handle confirmation from conflict dialog
  const handleConfirmCreate = async () => {
    if (!pendingCreateData) {
      console.error("No pending data for confirmation");
      setShowConflictDialog(false);
      return;
    }
    
    setIsConfirmLoading(true);
    
    try {
      // Build the confirmation request
      const prices = pendingCreateData.currency && pendingCreateData.amount ? [{
        currency: parseInt(pendingCreateData.currency),
        amount: parseFloat(pendingCreateData.amount)
      }] : [];

      const request = {
        name: pendingCreateData.name,
        description: pendingCreateData.description,
        durationType: parseInt(pendingCreateData.durationType),
        prices,
        allowTrial: pendingCreateData.allowTrial,
        trialDurationDays: pendingCreateData.trialDurationDays,
        autoRenew: pendingCreateData.autoRenew,
        upgradePolicy: pendingCreateData.upgradePolicy ? parseInt(pendingCreateData.upgradePolicy) : undefined,
        gracePeriodDays: pendingCreateData.gracePeriodDays,
        exportGraceDays: pendingCreateData.exportGraceDays,
        isFreeTier: pendingCreateData.isFreeTier,
        fallbackAccessMode: pendingCreateData.fallbackAccessMode ? parseInt(pendingCreateData.fallbackAccessMode) : undefined,
        showLockedModulesInMenu: pendingCreateData.showLockedModulesInMenu,
        customFeatures: pendingCreateData.customFeatures || [],
        projectIds: pendingCreateData.projectIds || [],
        moduleIds: pendingCreateData.moduleIds || [],
        parentPlanId: pendingCreateData.parentPlanId || null,
        displayOrder: pendingCreateData.displayOrder ? parseInt(pendingCreateData.displayOrder) : 0,
        confirmRemoveDuplicates: true,
        isValid: true,
      } as CreatePlanWithConfirmationRequest;

      await subscriptionPlanService.createWithConfirmation(request);
      
      // Close dialog and clear state
      setShowConflictDialog(false);
      setPendingCreateData(null);
      setModuleConflicts([]);
      
      // Refresh the data list (no page reload!)
      if (refreshDataRef.current) {
        refreshDataRef.current();
      }
    } catch (error) {
      console.error("Failed to create plan with confirmation:", error);
      // Keep dialog open on error so user can try again
    } finally {
      setIsConfirmLoading(false);
    }
  };
  
  // Ref to open modal (will be set after VM is created)
  const openCreateModalRef = React.useRef<(() => void) | null>(null);
  
  const handleCancelConflictDialog = () => {
    setShowConflictDialog(false);
    setModuleConflicts([]);
    
    // Reopen the create modal with the pending data
    if (pendingCreateData) {
      // Set custom initial values for the form
      setCustomCreateInitialValues(pendingCreateData);
      // Open the modal
      if (openCreateModalRef.current) {
        openCreateModalRef.current();
      }
    }
    
    // Clear pending data after setting initial values
    setPendingCreateData(null);
  };

  const updatePlan = async (id: string, data: any) => {
    // ⭐ Validate content before submission
    const contentError = validatePlanContent(data);
    if (contentError) {
      throw new Error(contentError);
    }

    // Convert currency and amount fields into prices array
    const prices = data.currency && data.amount ? [{
      currency: parseInt(data.currency),
      amount: parseFloat(data.amount)
    }] : data.prices || [];

    const request = new UpdatePlanRequest({
      id,
      name: data.name,
      description: data.description,
      durationType: data.durationType ? parseInt(data.durationType) : undefined,
      prices,
      allowTrial: data.allowTrial,
      trialDurationDays: data.trialDurationDays,
      autoRenew: data.autoRenew,
      upgradePolicy: data.upgradePolicy ? parseInt(data.upgradePolicy) : undefined,
      gracePeriodDays: data.gracePeriodDays,
      exportGraceDays: data.exportGraceDays,
      isFreeTier: data.isFreeTier,
      fallbackAccessMode: data.fallbackAccessMode ? parseInt(data.fallbackAccessMode) : undefined,
      showLockedModulesInMenu: data.showLockedModulesInMenu,
      customFeatures: data.customFeatures || [],
      projectIds: data.projectIds || [],
      moduleIds: data.moduleIds || [],
      // Plan Hierarchy
      parentPlanId: data.parentPlanId || null,
      displayOrder: data.displayOrder ? parseInt(data.displayOrder) : undefined,
    });
    return await subscriptionPlanService.updatePlan(request);
  };

  const vm = useGenericCrudViewModel<
    SubscriptionPlan,
    CreatePlanRequest,
    UpdatePlanRequest,
    { data: SubscriptionPlan[]; pagination: any }
  >(
    {
      getData: async (params: { page: number; pageSize: number; search?: string }) => {
        const result = await subscriptionPlanService.getAllPlans(params.page, params.pageSize, params.search);
        return { data: result.plans, pagination: result.pagination };
      },
      create: createPlan,
      update: updatePlan,
      delete: subscriptionPlanService.deletePlan.bind(subscriptionPlanService),
    },
    {
      itemTypeName: t("plan.item"),
      itemTypeNamePlural: t("plan.items"),
      getItemDisplayName: (plan: SubscriptionPlan) => plan.displayName,
      searchParamName: "search",
    }
  );
  
  // Store modal functions and refresh in refs so conflict handlers can access them
  React.useEffect(() => {
    closeCreateModalRef.current = () => vm.setIsCreateModalOpen(false);
    openCreateModalRef.current = () => vm.setIsCreateModalOpen(true);
    refreshDataRef.current = vm.refresh;
  }, [vm.setIsCreateModalOpen, vm.refresh]);
  
  // Clear custom initial values when modal closes normally
  React.useEffect(() => {
    if (!vm.isCreateModalOpen && customCreateInitialValues) {
      // Delay clearing to allow form to initialize with the values
      const timer = setTimeout(() => {
        setCustomCreateInitialValues(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [vm.isCreateModalOpen, customCreateInitialValues]);

  const config = useMemo(
    () => ({
      titleKey: "plan.title",
      subtitleKey: "plan.description",
      columns: [
        {
          key: "name",
          label: t("plan.name"),
          render: (_val: unknown, plan: SubscriptionPlan) => (
            <div>
              <div className="font-medium">{plan.displayName}</div>
              {plan.description && (
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {plan.description}
                </div>
              )}
            </div>
          ),
        },
        {
          key: "durationType",
          label: t("plan.durationType"),
          render: (_val: unknown, plan: SubscriptionPlan) => (
            <Badge variant="secondary">
              {plan.durationDescription}
            </Badge>
          ),
        },
        {
          key: "price",
          label: t("plan.price"),
          render: (_val: unknown, plan: SubscriptionPlan) => {
            const price = plan.primaryPrice;
            return price ? (
              <span className="font-medium">{plan.formatPrice(price)}</span>
            ) : (
              <span className="text-muted-foreground">{t("plan.noPrice")}</span>
            );
          },
        },
        {
          key: "parentPlan",
          label: t("plan.parentPlanName"),
          render: (_val: unknown, plan: SubscriptionPlan) => (
            plan.parentPlanName ? (
              <Badge variant="secondary" className="gap-1">
                ← {plan.parentPlanName}
              </Badge>
            ) : (
              <span className="text-muted-foreground text-sm">—</span>
            )
          ),
        },
        {
          key: "features",
          label: t("plan.features"),
          render: (_val: unknown, plan: SubscriptionPlan) => (
            <div className="flex flex-col gap-1">
              <Badge variant="outline">
                {plan.projectsCount} {t("plan.projects")} / {plan.modulesCount} {t("plan.modules")}
              </Badge>
              {plan.hasParentPlan && (plan.inheritedProjectsCount > 0 || plan.inheritedModulesCount > 0) && (
                <span className="text-xs text-muted-foreground">
                  +{plan.inheritedProjectsCount} / +{plan.inheritedModulesCount} {t("plan.inherited")}
                </span>
              )}
            </div>
          ),
        },
      ],
      createFields: [
        {
          name: "name",
          label: t("plan.name"),
          type: "text" as const,
          placeholder: t("plan.namePlaceholder"),
          required: true,
          minLength: 2,
          maxLength: 150,
          helperText: t("plan.nameHelper"),
        },
        {
          name: "description",
          label: t("plan.planDescription"),
          type: "textarea" as const,
          placeholder: t("plan.descriptionPlaceholder"),
          maxLength: 2000,
          helperText: t("plan.descriptionHelper"),
        },
        {
          name: "isFreeTier",
          label: t("plan.isFreeTier"),
          type: "checkbox" as const,
          helperText: t("plan.isFreeTierHelper"),
        },
        {
          name: "parentPlanId",
          label: t("plan.parentPlan"),
          type: "select" as const,
          options: [{ value: "", label: t("common.none") }, ...parentPlanOptions],
          helperText: t("plan.parentPlanHelper"),
        },
        {
          name: "displayOrder",
          label: t("plan.displayOrder"),
          type: "number" as const,
          placeholder: "0",
          min: 0,
          helperText: t("plan.displayOrderHelper"),
        },
        {
          name: "durationType",
          label: t("plan.durationType"),
          type: "select" as const,
          required: true,
          helperText: t("plan.duration.monthly"),
          options: [
            { value: "1", label: t("plan.duration.weekly") },
            { value: "3", label: t("plan.duration.monthly") },
            { value: "4", label: t("plan.duration.quarterly") },
            { value: "6", label: t("plan.duration.yearly") },
            { value: "99", label: t("plan.duration.lifetime") },
          ],
          isVisible: (formData: any) => !formData.isFreeTier, // Hide for Free Tier (forced to Lifetime)
        },
        {
          name: "currency",
          label: t("plan.currency"),
          type: "select" as const,
          required: true,
          helperText: t("plan.selectCurrency"),
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
          isVisible: (formData: any) => !formData.isFreeTier, // Hide for Free Tier (price is 0)
        },
        {
          name: "amount",
          label: t("plan.priceAmount"),
          type: "number" as const,
          required: true,
          placeholder: "99.99",
          helperText: t("plan.amount"),
          isVisible: (formData: any) => !formData.isFreeTier, // Hide for Free Tier (price is 0)
        },
        {
          name: "allowTrial",
          label: t("plan.allowTrial"),
          type: "checkbox" as const,
          helperText: t("plan.trialHelper"),
          isVisible: (formData: any) => formData.durationType !== "99" && !formData.isFreeTier, // Hide for Lifetime or Free Tier
        },
        {
          name: "trialDurationDays",
          label: t("plan.trialDuration"),
          type: "number" as const,
          placeholder: "14",
          required: true,
          min: 1,
          max: 60,
          helperText: t("plan.trialDurationHelper"),
          isVisible: (formData: any) => formData.durationType !== "99" && formData.allowTrial === true && !formData.isFreeTier, // Show only if not Lifetime AND trial enabled AND not Free Tier
        },
        {
          name: "autoRenew",
          label: t("plan.autoRenew"),
          type: "checkbox" as const,
          helperText: t("plan.autoRenewHelper"),
          isVisible: (formData: any) => formData.durationType !== "99" && !formData.isFreeTier, // Hide for Lifetime or Free Tier
        },
        {
          name: "upgradePolicy",
          label: t("plan.upgradePolicy"),
          type: "select" as const,
          helperText: t("plan.upgradePolicyHelper"),
          options: [
            { value: "0", label: t("plan.upgradePolicies.fullReplace") },
            { value: "1", label: t("plan.upgradePolicies.prorated") },
            { value: "2", label: t("plan.upgradePolicies.deferred") },
          ],
          isVisible: (formData: any) => formData.durationType !== "99" && !formData.isFreeTier, // Hide for Lifetime or Free Tier
        },
        {
          name: "gracePeriodDays",
          label: t("plan.gracePeriod"),
          type: "number" as const,
          placeholder: "7",
          min: 0,
          max: 30,
          helperText: t("plan.gracePeriodRangeHelper"),
          isVisible: (formData: any) => formData.durationType !== "99" && !formData.isFreeTier, // Hide for Lifetime or Free Tier
        },
        {
          name: "exportGraceDays",
          label: t("plan.exportGraceDays"),
          type: "number" as const,
          placeholder: "30",
          min: 0,
          max: 90,
          helperText: t("plan.exportGraceDaysHelper"),
          isVisible: (formData: any) => formData.durationType !== "99" && !formData.isFreeTier, // Hide for Lifetime or Free Tier
        },
        {
          name: "defaultFallbackPlanId",
          label: t("plan.defaultFallbackPlan"),
          type: "select" as const,
          options: [{ value: "", label: t("common.none") }, ...freeTierPlanOptions],
          helperText: t("plan.defaultFallbackPlanHelper"),
          isVisible: (formData: any) => !formData.isFreeTier && formData.durationType !== "99", // Hide for Free Tier or Lifetime (no expiry = no fallback)
        },
        {
          name: "fallbackAccessMode",
          label: t("plan.fallbackAccessMode"),
          type: "select" as const,
          options: [
            { value: "2", label: t("plan.accessModes.readOnly") },
            { value: "3", label: t("plan.accessModes.exportOnly") },
            { value: "4", label: t("plan.accessModes.blocked") },
          ],
          helperText: t("plan.fallbackAccessModeHelper"),
          isVisible: (formData: any) => !formData.isFreeTier && formData.durationType !== "99", // Hide for Free Tier or Lifetime (no expiry = no fallback mode)
        },
        {
          name: "showLockedModulesInMenu",
          label: t("plan.showLockedModulesInMenu"),
          type: "checkbox" as const,
          helperText: t("plan.showLockedModulesInMenuHelper"),
          isVisible: (formData: any) => !formData.isFreeTier, // Hide for Free Tier only (Lifetime can still show locked modules)
        },
        {
          name: "customFeatures",
          label: t("plan.customFeatures"),
          type: "array" as const,
          placeholder: t("plan.customFeaturesPlaceholder"),
          helperText: t("plan.customFeaturesHelper"),
        },
        {
          name: "projectIds",
          label: t("plan.selectProjects"),
          type: "multi-select" as const,
          options: projectOptions,
          helperText: t("plan.projectsHelper"),
        },
        {
          name: "moduleIds",
          label: t("plan.selectModules"),
          type: "multi-select" as const,
          options: moduleOptions,
          helperText: t("plan.modulesHelper"),
        },
      ],
      editFields: [
        {
          name: "name",
          label: t("plan.name"),
          type: "text" as const,
          placeholder: t("plan.namePlaceholder"),
          required: true,
          minLength: 2,
          maxLength: 150,
          helperText: t("plan.nameHelper"),
        },
        {
          name: "description",
          label: t("plan.planDescription"),
          type: "textarea" as const,
          placeholder: t("plan.descriptionPlaceholder"),
          maxLength: 2000,
          helperText: t("plan.descriptionHelper"),
        },
        {
          name: "isFreeTier",
          label: t("plan.isFreeTier"),
          type: "checkbox" as const,
          helperText: t("plan.isFreeTierHelper"),
        },
        {
          name: "parentPlanId",
          label: t("plan.parentPlan"),
          type: "select" as const,
          options: [{ value: "", label: t("common.none") }, ...parentPlanOptions],
          helperText: t("plan.parentPlanHelper"),
        },
        {
          name: "displayOrder",
          label: t("plan.displayOrder"),
          type: "number" as const,
          placeholder: "0",
          min: 0,
          helperText: t("plan.displayOrderHelper"),
        },
        {
          name: "durationType",
          label: t("plan.durationType"),
          type: "select" as const,
          required: true,
          isVisible: (formData: any) => !formData.isFreeTier, // Hide for Free Tier (forced to Lifetime)
          helperText: t("plan.duration.monthly"),
          options: [
            { value: "1", label: t("plan.duration.weekly") },
            { value: "3", label: t("plan.duration.monthly") },
            { value: "4", label: t("plan.duration.quarterly") },
            { value: "6", label: t("plan.duration.yearly") },
            { value: "99", label: t("plan.duration.lifetime") },
          ],
        },
        {
          name: "currency",
          label: t("plan.currency"),
          type: "select" as const,
          required: true,
          helperText: t("plan.selectCurrency"),
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
          isVisible: (formData: any) => !formData.isFreeTier, // Hide for Free Tier (price is 0)
        },
        {
          name: "amount",
          label: t("plan.priceAmount"),
          type: "number" as const,
          required: true,
          placeholder: "99.99",
          helperText: t("plan.amount"),
          isVisible: (formData: any) => !formData.isFreeTier, // Hide for Free Tier (price is 0)
        },
        {
          name: "allowTrial",
          label: t("plan.allowTrial"),
          type: "checkbox" as const,
          helperText: t("plan.trialHelper"),
          isVisible: (formData: any) => formData.durationType !== "99" && !formData.isFreeTier, // Hide for Lifetime or Free Tier
        },
        {
          name: "trialDurationDays",
          label: t("plan.trialDuration"),
          type: "number" as const,
          placeholder: "14",
          required: true,
          min: 1,
          max: 60,
          helperText: t("plan.trialDurationHelper"),
          isVisible: (formData: any) => formData.durationType !== "99" && formData.allowTrial === true && !formData.isFreeTier, // Show only if not Lifetime AND trial enabled AND not Free Tier
        },
        {
          name: "autoRenew",
          label: t("plan.autoRenew"),
          type: "checkbox" as const,
          helperText: t("plan.autoRenewHelper"),
          isVisible: (formData: any) => formData.durationType !== "99" && !formData.isFreeTier, // Hide for Lifetime or Free Tier
        },
        {
          name: "upgradePolicy",
          label: t("plan.upgradePolicy"),
          type: "select" as const,
          helperText: t("plan.upgradePolicyHelper"),
          options: [
            { value: "0", label: t("plan.upgradePolicies.fullReplace") },
            { value: "1", label: t("plan.upgradePolicies.prorated") },
            { value: "2", label: t("plan.upgradePolicies.deferred") },
          ],
          isVisible: (formData: any) => formData.durationType !== "99" && !formData.isFreeTier, // Hide for Lifetime or Free Tier
        },
        {
          name: "gracePeriodDays",
          label: t("plan.gracePeriod"),
          type: "number" as const,
          placeholder: "7",
          min: 0,
          max: 30,
          helperText: t("plan.gracePeriodRangeHelper"),
          isVisible: (formData: any) => formData.durationType !== "99" && !formData.isFreeTier, // Hide for Lifetime or Free Tier
        },
        {
          name: "exportGraceDays",
          label: t("plan.exportGraceDays"),
          type: "number" as const,
          placeholder: "30",
          min: 0,
          max: 90,
          helperText: t("plan.exportGraceDaysHelper"),
          isVisible: (formData: any) => formData.durationType !== "99" && !formData.isFreeTier, // Hide for Lifetime or Free Tier
        },
        {
          name: "defaultFallbackPlanId",
          label: t("plan.defaultFallbackPlan"),
          type: "select" as const,
          options: [{ value: "", label: t("common.none") }, ...freeTierPlanOptions],
          helperText: t("plan.defaultFallbackPlanHelper"),
          isVisible: (formData: any) => !formData.isFreeTier && formData.durationType !== "99", // Hide for Free Tier or Lifetime (no expiry = no fallback)
        },
        {
          name: "fallbackAccessMode",
          label: t("plan.fallbackAccessMode"),
          type: "select" as const,
          options: [
            { value: "2", label: t("plan.accessModes.readOnly") },
            { value: "3", label: t("plan.accessModes.exportOnly") },
            { value: "4", label: t("plan.accessModes.blocked") },
          ],
          helperText: t("plan.fallbackAccessModeHelper"),
          isVisible: (formData: any) => !formData.isFreeTier && formData.durationType !== "99", // Hide for Free Tier or Lifetime (no expiry = no fallback mode)
        },
        {
          name: "showLockedModulesInMenu",
          label: t("plan.showLockedModulesInMenu"),
          type: "checkbox" as const,
          helperText: t("plan.showLockedModulesInMenuHelper"),
          isVisible: (formData: any) => !formData.isFreeTier, // Hide for Free Tier only (Lifetime can still show locked modules)
        },
        {
          name: "customFeatures",
          label: t("plan.customFeatures"),
          type: "array" as const,
          placeholder: t("plan.customFeaturesPlaceholder"),
          helperText: t("plan.customFeaturesHelper"),
        },
        {
          name: "projectIds",
          label: t("plan.selectProjects"),
          type: "multi-select" as const,
          options: projectOptions,
          helperText: t("plan.projectsHelper"),
        },
        {
          name: "moduleIds",
          label: t("plan.selectModules"),
          type: "multi-select" as const,
          options: moduleOptions,
          helperText: t("plan.modulesHelper"),
        },
        { name: "id", type: "hidden" as const, required: true },
      ],
      createInitialValues: customCreateInitialValues || {
        durationType: 3, // Monthly by default
        currency: 1, // USD by default
        amount: 0,
        allowTrial: false,
        trialDurationDays: null,
        autoRenew: false,
        upgradePolicy: 0, // FullReplace by default
        gracePeriodDays: 0,
        exportGraceDays: 30,
        isFreeTier: false,
        fallbackAccessMode: "2", // ReadOnly
        showLockedModulesInMenu: true,
        customFeatures: [],
        projectIds: [],
        moduleIds: [],
      },
      editInitialValues: (plan: SubscriptionPlan) => ({
        name: plan.name,
        description: plan.description,
        durationType: plan.durationType?.toString() || "3", // Convert to string for select
        currency: plan.primaryPrice?.currency?.toString() || "1", // Convert to string for select
        amount: plan.primaryPrice?.amount || 0,
        allowTrial: plan.allowTrial,
        trialDurationDays: plan.trialDurationDays,
        autoRenew: plan.autoRenew,
        upgradePolicy: plan.upgradePolicy?.toString() || "0", // Convert to string for select
        gracePeriodDays: plan.gracePeriodDays,
        exportGraceDays: plan.exportGraceDays,
        isFreeTier: plan.isFreeTier,
        fallbackAccessMode: plan.fallbackAccessMode?.toString() || "2",
        showLockedModulesInMenu: plan.showLockedModulesInMenu,
        customFeatures: plan.customFeatures || [],
        projectIds: plan.projects?.map(p => p.id) || [],
        moduleIds: plan.modules?.map(m => m.id) || [],
        id: plan.id,
      }),
      getActions: (vm: any, t: any, handleDelete?: (item: SubscriptionPlan) => void) => [
        {
          label: t("common.view"),
          onClick: (item: SubscriptionPlan) => router.push(`/plans/${item.id}`),
          variant: "ghost" as const,
        },
        {
          label: t("common.edit"),
          onClick: (item: SubscriptionPlan) => router.push(`/plans/${item.id}/edit`),
          variant: "ghost" as const,
        },
        {
          label: t("common.delete"),
          onClick: handleDelete!, // handleDelete is provided by GenericCrudView
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700",
          confirmTitle: t("common.confirmDelete"),
          confirmDescription: t("common.deleteConfirmation", { name: "{name}" }),
          requiresConfirmation: true,
        },
      ],
    }),
    [t, subscriptionPlanService, vm, customCreateInitialValues, projectOptions, moduleOptions, freeTierPlanOptions, parentPlanOptions]
  );

  return { 
    vm, 
    config,
    // Conflict dialog state for CREATE
    conflictDialog: {
      show: showConflictDialog,
      conflicts: moduleConflicts,
      onConfirm: handleConfirmCreate,
      onCancel: handleCancelConflictDialog,
      isLoading: isConfirmLoading,
    }
  };
}
