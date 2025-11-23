"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { SubscriptionPlan } from "@/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";

interface PlanDetailsViewProps {
  planId: string;
}

export function PlanDetailsView({ planId }: PlanDetailsViewProps) {
  const router = useRouter();
  const { subscriptionPlanService } = useServices();
  const { t } = useI18n();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, [planId]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const result = await subscriptionPlanService.getPlanById(planId);
      setPlan(result);
    } catch (error) {
      console.error("Failed to load plan:", error);
    } finally {
      setLoading(false);
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
      console.error("Failed to delete plan:", error);
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

      {/* Projects */}
      {plan.projects && plan.projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("plan.projects")}</CardTitle>
            <CardDescription>{t("plan.projectsHelper")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {plan.projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {project.name}
                      {/* <ExternalLink className="h-4 w-4 text-muted-foreground" /> */}
                    </div>
                    {project.description && (
                      <div className="text-sm text-muted-foreground">
                        {project.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modules */}
      {plan.modules && plan.modules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("plan.modules")}</CardTitle>
            <CardDescription>{t("plan.modulesHelper")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {plan.modules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/modules/${module.id}`)}
                >
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {module.name}
                      {/* <ExternalLink className="h-4 w-4 text-muted-foreground" /> */}
                    </div>
                    {module.description && (
                      <div className="text-sm text-muted-foreground">
                        {module.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
