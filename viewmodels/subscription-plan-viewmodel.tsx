"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type { SubscriptionPlan, CreateSubscriptionPlanRequest, UpdateSubscriptionPlanRequest } from "@/domain";
import { SubscriptionPlanMapper, BillingCycle } from "@/domain";
import type { CrudConfig } from "@/components/ui/generic-crud-view";
import { Badge } from "@/components/ui/badge";

export function useSubscriptionPlanViewModel() {
  const router = useRouter();
  const { subscriptionPlanService } = useServices();
  const { t } = useI18n();
  const [moduleAssignmentOpen, setModuleAssignmentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const vm = useGenericCrudViewModel<
    SubscriptionPlan,
    CreateSubscriptionPlanRequest,
    UpdateSubscriptionPlanRequest,
    { data: SubscriptionPlan[]; pagination: any }
  >(
    {
      getData: subscriptionPlanService.getPlans.bind(subscriptionPlanService),
      create: async (data: any) => {
        // Use mapper to convert form data to request object with proper types
        const request = SubscriptionPlanMapper.formDataToCreateRequest(data);
        return await subscriptionPlanService.createPlan(request);
      },
      update: async (id: string, data: any) => {
        // Use mapper to convert form data to request object with proper types
        const request = SubscriptionPlanMapper.formDataToUpdateRequest(id, data);
        return await subscriptionPlanService.updatePlan(id, request);
      },
      delete: subscriptionPlanService.deletePlan.bind(subscriptionPlanService),
    },
    {
      itemTypeName: t("subscriptionPlan.item"),
      itemTypeNamePlural: t("subscriptionPlan.items"),
      getItemDisplayName: (plan: SubscriptionPlan) => plan.displayName,
      searchParamName: "search",
    }
  );

  const handleDelete = useCallback(async (plan: SubscriptionPlan) => {
    await subscriptionPlanService.deletePlan(plan.id);
    await vm.refreshItems();
  }, [subscriptionPlanService, vm]);

  const getBillingCycleName = useCallback((cycle: BillingCycle): string => {
    const names: Record<BillingCycle, string> = {
      [BillingCycle.Monthly]: t("subscriptionPlan.billingCycle.monthly"),
      [BillingCycle.Yearly]: t("subscriptionPlan.billingCycle.yearly"),
      [BillingCycle.Quarterly]: t("subscriptionPlan.billingCycle.quarterly"),
      [BillingCycle.OneTime]: t("subscriptionPlan.billingCycle.oneTime"),
    };
    return names[cycle] || t("subscriptionPlan.billingCycle.unknown");
  }, [t]);

  const config: CrudConfig<SubscriptionPlan> = useMemo(
    () => ({
      titleKey: "subscriptionPlan.title",
      subtitleKey: "subscriptionPlan.description",
      columns: [
        {
          key: "name",
          label: t("subscriptionPlan.name"),
          render: (_val: unknown, plan: SubscriptionPlan) => (
            <div className="font-medium">{plan.name}</div>
          ),
        },
        {
          key: "price",
          label: t("subscriptionPlan.price"),
          render: (_val: unknown, plan: SubscriptionPlan) => (
            <span className="text-sm font-semibold">{plan.formattedPrice}</span>
          ),
        },
        {
          key: "billingCycle",
          label: t("subscriptionPlan.billingCycle"),
          render: (_val: unknown, plan: SubscriptionPlan) => (
            <Badge variant="secondary">
              {getBillingCycleName(plan.billingCycle)}
            </Badge>
          ),
        },
        {
          key: "isActive",
          label: t("subscriptionPlan.status"),
          render: (_val: unknown, plan: SubscriptionPlan) => (
            <Badge variant={plan.isActive ? "active" : "secondary"}>
              {plan.isActive ? t("common.active") : t("common.inactive")}
            </Badge>
          ),
        },
        {
          key: "maxCompanies",
          label: t("subscriptionPlan.maxCompanies"),
          render: (_val: unknown, plan: SubscriptionPlan) => (
            <span className="text-sm">
              {plan.maxCompanies ?? t("subscriptionPlan.unlimited")}
            </span>
          ),
        },
        {
          key: "planTier",
          label: t("subscriptionPlan.planTier"),
          render: (_val: unknown, plan: SubscriptionPlan) => (
            <Badge variant="outline">
              {plan.planTierName}
            </Badge>
          ),
        },
        {
          key: "parentPlan",
          label: t("subscriptionPlan.parentPlan"),
          render: (_val: unknown, plan: SubscriptionPlan) => (
            <span className="text-sm">
              {plan.parentPlanName ?? t("subscriptionPlan.noParent")}
            </span>
          ),
        },
      ],
      createFields: [
        {
          name: "name",
          label: t("subscriptionPlan.name"),
          type: "text" as const,
          placeholder: t("subscriptionPlan.namePlaceholder"),
          required: true,
        },
        {
          name: "description",
          label: t("subscriptionPlan.description"),
          type: "textarea" as const,
          placeholder: t("subscriptionPlan.descriptionPlaceholder"),
        },
        {
          name: "price",
          label: t("subscriptionPlan.price"),
          type: "number" as const,
          placeholder: t("subscriptionPlan.pricePlaceholder"),
          required: true,
        },
        {
          name: "currency",
          label: t("subscriptionPlan.currency"),
          type: "text" as const,
          placeholder: t("subscriptionPlan.currencyPlaceholder"),
          required: true,
        },
        {
          name: "billingCycle",
          label: t("subscriptionPlan.billingCycle"),
          type: "select" as const,
          placeholder: t("subscriptionPlan.billingCyclePlaceholder"),
          required: true,
          options: [
            { value: BillingCycle.Monthly.toString(), label: t("subscriptionPlan.billingCycle.monthly") },
            { value: BillingCycle.Yearly.toString(), label: t("subscriptionPlan.billingCycle.yearly") },
            { value: BillingCycle.Quarterly.toString(), label: t("subscriptionPlan.billingCycle.quarterly") },
            { value: BillingCycle.OneTime.toString(), label: t("subscriptionPlan.billingCycle.oneTime") },
          ],
        },
        {
          name: "maxCompanies",
          label: t("subscriptionPlan.maxCompanies"),
          type: "number" as const,
          placeholder: t("subscriptionPlan.maxCompaniesPlaceholder"),
        },
        {
          name: "planTier",
          label: t("subscriptionPlan.planTier"),
          type: "number" as const,
          placeholder: t("subscriptionPlan.planTierPlaceholder"),
        },
        {
          name: "parentPlanId",
          label: t("subscriptionPlan.parentPlan"),
          type: "select" as const,
          placeholder: t("subscriptionPlan.parentPlanPlaceholder"),
          options: [], // Will be populated dynamically with available plans
        },
        {
          name: "isActive",
          label: t("subscriptionPlan.isActive"),
          type: "checkbox" as const,
        },
      ],
      editFields: [
        {
          name: "name",
          label: t("subscriptionPlan.name"),
          type: "text" as const,
          placeholder: t("subscriptionPlan.namePlaceholder"),
          required: true,
        },
        {
          name: "description",
          label: t("subscriptionPlan.description"),
          type: "textarea" as const,
          placeholder: t("subscriptionPlan.descriptionPlaceholder"),
        },
        {
          name: "price",
          label: t("subscriptionPlan.price"),
          type: "number" as const,
          placeholder: t("subscriptionPlan.pricePlaceholder"),
          required: true,
        },
        {
          name: "currency",
          label: t("subscriptionPlan.currency"),
          type: "text" as const,
          placeholder: t("subscriptionPlan.currencyPlaceholder"),
          required: true,
        },
        {
          name: "billingCycle",
          label: t("subscriptionPlan.billingCycle"),
          type: "select" as const,
          placeholder: t("subscriptionPlan.billingCyclePlaceholder"),
          required: true,
          options: [
            { value: BillingCycle.Monthly.toString(), label: t("subscriptionPlan.billingCycle.monthly") },
            { value: BillingCycle.Yearly.toString(), label: t("subscriptionPlan.billingCycle.yearly") },
            { value: BillingCycle.Quarterly.toString(), label: t("subscriptionPlan.billingCycle.quarterly") },
            { value: BillingCycle.OneTime.toString(), label: t("subscriptionPlan.billingCycle.oneTime") },
          ],
        },
        {
          name: "maxCompanies",
          label: t("subscriptionPlan.maxCompanies"),
          type: "number" as const,
          placeholder: t("subscriptionPlan.maxCompaniesPlaceholder"),
        },
        {
          name: "planTier",
          label: t("subscriptionPlan.planTier"),
          type: "number" as const,
          placeholder: t("subscriptionPlan.planTierPlaceholder"),
        },
        {
          name: "parentPlanId",
          label: t("subscriptionPlan.parentPlan"),
          type: "select" as const,
          placeholder: t("subscriptionPlan.parentPlanPlaceholder"),
          options: [], // Will be populated dynamically with available plans
        },
        {
          name: "isActive",
          label: t("subscriptionPlan.isActive"),
          type: "checkbox" as const,
        },
        { name: "id", type: "hidden" as const, required: true },
      ],
      createInitialValues: {
        currency: "USD",
        billingCycle: BillingCycle.Monthly.toString(),
        planTier: 0,
        isActive: true,
      },
      editInitialValues: (plan: SubscriptionPlan) => ({
        name: plan.name,
        description: plan.description || "",
        price: plan.price,
        currency: plan.currency,
        billingCycle: plan.billingCycle.toString(),
        maxCompanies: plan.maxCompanies ?? "",
        planTier: plan.planTier,
        parentPlanId: plan.parentPlanId || "",
        isActive: plan.isActive,
        id: plan.id,
      }),
      getActions: (vm: any, t: any, handleDelete) => {
        return [
          {
            label: t("common.view"),
            onClick: (item: SubscriptionPlan) => {
              router.push(`/subscription-plans/${item.id}`);
            },
            variant: "ghost" as const,
          },
          {
            label: t("common.edit"),
            onClick: (item: SubscriptionPlan) => vm.openEditModal(item),
            variant: "ghost" as const,
          },
          {
            label: t("subscriptionPlan.assignModules"),
            onClick: (item: SubscriptionPlan) => {
              setSelectedPlan(item);
              setModuleAssignmentOpen(true);
            },
            variant: "ghost" as const,
          },
          {
            label: t("common.delete"),
            onClick: (item: SubscriptionPlan) => handleDelete?.(item),
            variant: "ghost" as const,
            className: "text-red-600 hover:text-red-700",
            confirmTitle: t("common.confirmDelete"),
            confirmDescription: t("common.deleteConfirmation", { itemType: t("subscriptionPlan.item") }),
            isDeleteAction: true,
          },
        ];
      },
    }),
    [t, getBillingCycleName, handleDelete]
  );

  return {
    vm,
    config,
    handleDelete,
    moduleAssignmentOpen,
    setModuleAssignmentOpen,
    selectedPlan,
    setSelectedPlan,
  };
}

