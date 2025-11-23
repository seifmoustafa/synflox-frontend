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

export function useSubscriptionPlanViewModel() {
  const router = useRouter();
  const { subscriptionPlanService, projectService, moduleService } = useServices();
  const { t } = useI18n();
  
  // Load projects and modules for dropdowns
  const [projectOptions, setProjectOptions] = React.useState<Array<{value: string, label: string}>>([]);
  const [moduleOptions, setModuleOptions] = React.useState<Array<{value: string, label: string}>>([]);

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
  }, [projectService, moduleService]);

  const createPlan = async (data: any) => {
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
      customFeatures: data.customFeatures || [],
      projectIds: data.projectIds || [],
      moduleIds: data.moduleIds || [],
    });
    return await subscriptionPlanService.createPlan(request);
  };

  const updatePlan = async (id: string, data: any) => {
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
      customFeatures: data.customFeatures || [],
      projectIds: data.projectIds || [],
      moduleIds: data.moduleIds || [],
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
          key: "features",
          label: t("plan.features"),
          render: (_val: unknown, plan: SubscriptionPlan) => (
            <Badge variant="outline">
              {plan.featuresCount} {t("common.items")}
            </Badge>
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
        },
        {
          name: "description",
          label: t("plan.planDescription"),
          type: "textarea" as const,
          placeholder: t("plan.descriptionPlaceholder"),
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
        },
        {
          name: "amount",
          label: t("plan.priceAmount"),
          type: "number" as const,
          required: true,
          placeholder: "99.99",
          helperText: t("plan.amount"),
        },
        {
          name: "allowTrial",
          label: t("plan.allowTrial"),
          type: "checkbox" as const,
          helperText: t("plan.trialHelper"),
        },
        {
          name: "trialDurationDays",
          label: t("plan.trialDuration"),
          type: "number" as const,
          placeholder: "14",
          helperText: t("plan.trialHelper"),
        },
        {
          name: "autoRenew",
          label: t("plan.autoRenew"),
          type: "checkbox" as const,
          helperText: t("plan.autoRenewHelper"),
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
        },
        {
          name: "gracePeriodDays",
          label: t("plan.gracePeriod"),
          type: "number" as const,
          placeholder: "7",
          helperText: t("plan.gracePeriodHelper"),
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
        },
        {
          name: "description",
          label: t("plan.planDescription"),
          type: "textarea" as const,
          placeholder: t("plan.descriptionPlaceholder"),
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
        },
        {
          name: "amount",
          label: t("plan.priceAmount"),
          type: "number" as const,
          required: true,
          placeholder: "99.99",
          helperText: t("plan.amount"),
        },
        {
          name: "allowTrial",
          label: t("plan.allowTrial"),
          type: "checkbox" as const,
          helperText: t("plan.trialHelper"),
        },
        {
          name: "trialDurationDays",
          label: t("plan.trialDuration"),
          type: "number" as const,
          placeholder: "14",
          helperText: t("plan.trialHelper"),
        },
        {
          name: "autoRenew",
          label: t("plan.autoRenew"),
          type: "checkbox" as const,
          helperText: t("plan.autoRenewHelper"),
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
        },
        {
          name: "gracePeriodDays",
          label: t("plan.gracePeriod"),
          type: "number" as const,
          placeholder: "7",
          helperText: t("plan.gracePeriodHelper"),
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
      createInitialValues: {
        durationType: 3, // Monthly by default
        currency: 1, // USD by default
        amount: 0,
        allowTrial: false,
        trialDurationDays: null,
        autoRenew: false,
        upgradePolicy: 0, // FullReplace by default
        gracePeriodDays: 0,
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
    [t, subscriptionPlanService, vm]
  );

  return { vm, config };
}
