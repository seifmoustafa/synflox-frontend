"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { SubscriptionPlan, PlanEntitlement, UpdatePlanEntitlementRequest } from "@/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { EntitlementsTree } from "@/components/ui/entitlements-tree";
import { appLogger } from "@/lib/logger";

interface PlanDetailsViewProps {
  planId: string;
}

export function PlanDetailsView({ planId }: PlanDetailsViewProps) {
  const router = useRouter();
  const { subscriptionPlanService, planEntitlementService } = useServices();
  const { t } = useI18n();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [entitlements, setEntitlements] = useState<PlanEntitlement[]>([]);
  const [entitlementsLoading, setEntitlementsLoading] = useState(false);

  const loadEntitlements = useCallback(async () => {
    try {
      setEntitlementsLoading(true);
      const result = await planEntitlementService.getByPlanId(planId);
      setEntitlements(result);
    } catch (error) {
      appLogger.error("Failed to load entitlements:", error);
    } finally {
      setEntitlementsLoading(false);
    }
  }, [planId, planEntitlementService]);

  useEffect(() => {
    loadPlan();
    loadEntitlements();
  }, [planId, loadEntitlements]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const result = await subscriptionPlanService.getPlanById(planId);
      setPlan(result);
    } catch (error) {
      appLogger.error("Failed to load plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntitlementUpdate = async (request: UpdatePlanEntitlementRequest) => {
    const result = await planEntitlementService.update(request);
    if (result) {
      // Reload entitlements to reflect changes
      await loadEntitlements();
    }
  };

  const handleEntitlementDelete = async (id: string) => {
    const success = await planEntitlementService.delete(id);
    if (success) {
      await loadEntitlements();
    }
  };

  const handleEdit = () => {
    router.push(`/plans/${planId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm(t("common.confirmDelete"))) return;
    
    try {
      await subscriptionPlanService.deletePlan(planId);
      router.push("/plans");
    } catch (error) {
      appLogger.error("Failed to delete plan:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
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

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <PageBreadcrumbs
        segments={[
          { label: t("plan.items"), href: "/plans" },
          { label: plan.name }
        ]}
        // showBackButton
        showHome={false}
        onBack={() => router.push("/plans")}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{plan.name}</h1>
          {plan.description && (
            <p className="text-muted-foreground mt-2">{plan.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEdit} variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            {t("common.edit")}
          </Button>
          <Button onClick={handleDelete} variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </div>

      {/* Plan Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t("plan.title")}</CardTitle>
          <CardDescription>{t("plan.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("plan.durationType")}
              </label>
              <div className="mt-1">
                <Badge variant="outline">{plan.durationDescription}</Badge>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("plan.price")}
              </label>
              <div className="mt-1 text-2xl font-bold">
                {plan.primaryPrice ? plan.formatPrice(plan.primaryPrice) : t("plan.noPrice")}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("plan.allowTrial")}
              </label>
              <div className="mt-1">
                <Badge variant={plan.allowTrial ? "default" : "secondary"}>
                  {plan.allowTrial ? t("common.yes") : t("common.no")}
                </Badge>
                {plan.allowTrial && plan.trialDurationDays && (
                  <span className="ml-2 text-sm">
                    {plan.trialDurationDays} {t("common.days")}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("plan.autoRenew")}
              </label>
              <div className="mt-1">
                <Badge variant={plan.autoRenew ? "default" : "secondary"}>
                  {plan.autoRenew ? t("common.yes") : t("common.no")}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("plan.gracePeriod")}
              </label>
              <div className="mt-1">
                {plan.gracePeriodDays} {t("common.days")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Features */}
      {plan.customFeatures && plan.customFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("plan.customFeatures")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {plan.customFeatures.map((feature, index) => (
                <Badge key={index} variant="secondary">
                  {feature}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entitlements - Hierarchical Permission Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t("entitlements.planTitle") || "Entitlements"}
          </CardTitle>
          <CardDescription>
            {t("entitlements.planDescription") || "Configure access permissions for projects and modules in this plan"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntitlementsTree
            entitlements={entitlements}
            loading={entitlementsLoading}
            onUpdate={handleEntitlementUpdate}
            onDelete={handleEntitlementDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
