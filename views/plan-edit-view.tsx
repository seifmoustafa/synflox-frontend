"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { SubscriptionPlan, UpdatePlanRequest } from "@/domain";
import { GenericForm } from "@/components/forms/generic-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import React from "react";
import { appLogger } from "@/lib/logger";

interface PlanEditViewProps {
  planId: string;
}

export function PlanEditView({ planId }: PlanEditViewProps) {
  const router = useRouter();
  const { subscriptionPlanService, projectService, moduleService } = useServices();
  const { t } = useI18n();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectOptions, setProjectOptions] = useState<Array<{value: string, label: string}>>([]);
  const [moduleOptions, setModuleOptions] = useState<Array<{value: string, label: string}>>([]);
  const [parentPlanOptions, setParentPlanOptions] = useState<Array<{value: string, label: string}>>([]);
  const [fallbackPlanOptions, setFallbackPlanOptions] = useState<Array<{value: string, label: string}>>([]);

  useEffect(() => {
    loadData();
  }, [planId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load plan
      const planResult = await subscriptionPlanService.getPlanById(planId);
      setPlan(planResult);

      // Load projects
      const projectsResult = await projectService.getProjects({ page: 1, pageSize: 100 });
      setProjectOptions(projectsResult.data.map((p: any) => ({
        value: p.id,
        label: p.name
      })));

      // Load modules
      const modulesResult = await moduleService.getAllModules(1, 100);
      setModuleOptions(modulesResult.modules.map((m: any) => ({
        value: m.id,
        label: m.name
      })));

      // Load all plans for parent and fallback dropdowns
      const plansResult = await subscriptionPlanService.getAllPlans(1, 100);
      // Filter out current plan for parent selection
      setParentPlanOptions(plansResult.plans
        .filter((p: any) => p.id !== planId)
        .map((p: any) => ({
          value: p.id,
          label: `${p.name}${p.parentPlanName ? ` (← ${p.parentPlanName})` : ''}`
        })));
      // All plans for fallback, mark free tier ones
      setFallbackPlanOptions(plansResult.plans.map((p: any) => ({
        value: p.id,
        label: p.isFreeTier ? `⭐ ${p.name} (${t("plan.isFreeTier")})` : p.name
      })));
    } catch (error) {
      appLogger.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      // Convert currency and amount fields into prices array
      const prices = data.currency && data.amount ? [{
        currency: parseInt(data.currency),
        amount: parseFloat(data.amount)
      }] : plan?.prices || [];

      const request = new UpdatePlanRequest({
        id: planId,
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
        // New fields
        isFreeTier: data.isFreeTier,
        parentPlanId: data.parentPlanId || null,
        displayOrder: data.displayOrder ? parseInt(data.displayOrder) : 0,
        exportGraceDays: data.exportGraceDays ? parseInt(data.exportGraceDays) : 30,
        defaultFallbackPlanId: data.defaultFallbackPlanId || null,
        fallbackAccessMode: data.fallbackAccessMode ? parseInt(data.fallbackAccessMode) : undefined,
        showLockedModulesInMenu: data.showLockedModulesInMenu,
      });

      await subscriptionPlanService.updatePlan(request);
      router.push(`/plans/${planId}`);
    } catch (error) {
      appLogger.error("Failed to update plan:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">{t("plan.notFound")}</h2>
        <Button onClick={() => router.push("/plans")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>
      </div>
    );
  }

  const initialValues = {
    name: plan.name,
    description: plan.description,
    durationType: plan.durationType?.toString() || "3",
    currency: plan.primaryPrice?.currency?.toString() || "1",
    amount: plan.primaryPrice?.amount || 0,
    allowTrial: plan.allowTrial,
    trialDurationDays: plan.trialDurationDays,
    autoRenew: plan.autoRenew,
    upgradePolicy: plan.upgradePolicy?.toString() || "0",
    gracePeriodDays: plan.gracePeriodDays,
    customFeatures: plan.customFeatures || [],
    projectIds: plan.projects?.map(p => p.id) || [],
    moduleIds: plan.modules?.map(m => m.id) || [],
    // New fields
    isFreeTier: plan.isFreeTier || false,
    parentPlanId: plan.parentPlanId || "",
    displayOrder: plan.displayOrder || 0,
    exportGraceDays: plan.exportGraceDays || 30,
    defaultFallbackPlanId: plan.defaultFallbackPlanId || "",
    fallbackAccessMode: plan.fallbackAccessMode?.toString() || "2",
    showLockedModulesInMenu: plan.showLockedModulesInMenu ?? true,
  };

  const fields = [
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
      isVisible: (formData: any) => !formData.isFreeTier,
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
      isVisible: (formData: any) => !formData.isFreeTier,
    },
    {
      name: "amount",
      label: t("plan.priceAmount"),
      type: "number" as const,
      required: true,
      placeholder: "99.99",
      helperText: t("plan.amount"),
      isVisible: (formData: any) => !formData.isFreeTier,
    },
    {
      name: "allowTrial",
      label: t("plan.allowTrial"),
      type: "checkbox" as const,
      helperText: t("plan.trialHelper"),
      isVisible: (formData: any) => formData.durationType !== "99" && !formData.isFreeTier,
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
      isVisible: (formData: any) => formData.durationType !== "99" && formData.allowTrial === true && !formData.isFreeTier,
    },
    {
      name: "autoRenew",
      label: t("plan.autoRenew"),
      type: "checkbox" as const,
      helperText: t("plan.autoRenewHelper"),
      isVisible: (formData: any) => formData.durationType !== "99" && !formData.isFreeTier,
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
      isVisible: (formData: any) => formData.durationType !== "99" && !formData.isFreeTier,
    },
    {
      name: "gracePeriodDays",
      label: t("plan.gracePeriod"),
      type: "number" as const,
      placeholder: "7",
      min: 0,
      max: 30,
      helperText: t("plan.gracePeriodRangeHelper"),
      isVisible: (formData: any) => formData.durationType !== "99" && !formData.isFreeTier,
    },
    {
      name: "exportGraceDays",
      label: t("plan.exportGraceDays"),
      type: "number" as const,
      placeholder: "30",
      min: 0,
      max: 90,
      helperText: t("plan.exportGraceDaysHelper"),
      isVisible: (formData: any) => formData.durationType !== "99" && !formData.isFreeTier,
    },
    {
      name: "defaultFallbackPlanId",
      label: t("plan.defaultFallbackPlan"),
      type: "select" as const,
      options: [{ value: "", label: t("common.none") }, ...fallbackPlanOptions],
      helperText: t("plan.defaultFallbackPlanHelper"),
      isVisible: (formData: any) => !formData.isFreeTier && formData.durationType !== "99",
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
      isVisible: (formData: any) => !formData.isFreeTier && formData.durationType !== "99",
    },
    {
      name: "showLockedModulesInMenu",
      label: t("plan.showLockedModulesInMenu"),
      type: "checkbox" as const,
      helperText: t("plan.showLockedModulesInMenuHelper"),
      isVisible: (formData: any) => !formData.isFreeTier,
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
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <PageBreadcrumbs
        segments={[
          { label: t("plan.items"), href: "/plans" },
          { label: plan.name, href: `/plans/${planId}` },
          { label: t("common.edit") }
        ]}
        // showBackButton
        showHome={false}
        onBack={() => router.push(`/plans/${planId}`)}
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t("common.edit")} {plan.name}</h1>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("plan.title")}</CardTitle>
          <CardDescription>{t("plan.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <GenericForm
            fields={fields}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/plans/${planId}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
