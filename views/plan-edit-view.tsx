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
    } catch (error) {
      console.error("Failed to load data:", error);
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
      });

      await subscriptionPlanService.updatePlan(request);
      router.push(`/plans/${planId}`);
    } catch (error) {
      console.error("Failed to update plan:", error);
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
  };

  const fields = [
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
