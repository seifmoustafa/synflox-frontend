"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  ArrowLeft,
  Folder,
  BarChart3,
} from "lucide-react";
import type { Module, ProjectModule, SubscriptionPlan } from "@/domain";
import { cn } from "@/lib/utils";
import { GenericTable } from "@/components/ui/generic-table";

interface ModuleDetailViewProps {
  moduleId: string;
}

export function ModuleDetailView({ moduleId }: ModuleDetailViewProps) {
  const router = useRouter();
  const { moduleService, projectModuleService, subscriptionPlanService } = useServices();
  const { t } = useI18n();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectModules, setProjectModules] = useState<ProjectModule[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const loadModule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await moduleService.getModuleById(moduleId);
      setModule(data);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : t("module.error.loadFailed");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [moduleId, moduleService, t]);

  useEffect(() => {
    loadModule();
  }, [loadModule]);

  const loadModuleProjects = useCallback(async () => {
    try {
      setProjectsLoading(true);
      const response = await projectModuleService.getModuleProjects(moduleId);
      setProjectModules(response.data);
    } catch (e) {
      // Error already shown by service
    } finally {
      setProjectsLoading(false);
    }
  }, [moduleId, projectModuleService]);

  const loadSubscriptionPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      // Get all plans
      const allPlansResponse = await subscriptionPlanService.getPlans({ pageSize: 1000 });
      
      // For each plan, check if this module is assigned
      const plansWithModule: SubscriptionPlan[] = [];
      for (const plan of allPlansResponse.data) {
        try {
          const planModules = await subscriptionPlanService.getPlanModules(plan.id);
          const hasModule = planModules.some(
            pm => pm.moduleName === module?.name || pm.moduleName?.toLowerCase().includes(module?.name.toLowerCase() || "")
          );
          if (hasModule) {
            plansWithModule.push(plan);
          }
        } catch (e) {
          // Skip if error loading plan modules
        }
      }
      
      setSubscriptionPlans(plansWithModule);
    } catch (e) {
      // Error already shown by service
    } finally {
      setPlansLoading(false);
    }
  }, [moduleId, module?.name, subscriptionPlanService]);

  useEffect(() => {
    if (activeTab === "projects" && projectModules.length === 0 && !projectsLoading) {
      loadModuleProjects();
    }
  }, [activeTab, projectModules.length, projectsLoading, loadModuleProjects]);

  useEffect(() => {
    if (activeTab === "plans" && subscriptionPlans.length === 0 && !plansLoading) {
      loadSubscriptionPlans();
    }
  }, [activeTab, subscriptionPlans.length, plansLoading, loadSubscriptionPlans]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">{t("module.error.title")}</h2>
          <p className="text-muted-foreground">
            {error || t("module.error.notFound")}
          </p>
        </div>
        <Button onClick={() => router.push("/modules")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common.goBack")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <PageBreadcrumbs
        showHome={false}
        segments={[
          { label: t("nav.modules"), href: "/modules" },
          { label: module.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{module.name}</h1>
            <p className="text-muted-foreground mt-1">
              {module.description || t("module.detail.description")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/modules")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.goBack")}
          </Button>
          <Button
            variant="default"
            onClick={() => router.push(`/modules?edit=${module.id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {t("common.edit")}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t("module.detail.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="projects">
            {t("module.detail.tabs.projects")}
            {projectModules.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {projectModules.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="plans">
            {t("module.detail.tabs.plans")}
            {subscriptionPlans.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {subscriptionPlans.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="statistics">{t("module.detail.tabs.statistics")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t("module.detail.basicInfo")}
                </CardTitle>
                <CardDescription>
                  {t("module.detail.basicInfoDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("module.name")}
                  </label>
                  <p className="text-base font-semibold">{module.name}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("module.description")}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {module.description || t("module.detail.noDescription")}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("module.status")}
                  </label>
                  <Badge variant={module.isActive ? "active" : "secondary"}>
                    {module.isActive ? t("common.active") : t("common.inactive")}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>{t("module.detail.metadata")}</CardTitle>
                <CardDescription>
                  {t("module.detail.metadataDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{t("module.detail.createdAt")}</span>
                    </div>
                    <p className="text-sm font-medium">
                      {new Date(module.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {module.updatedAt && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{t("module.detail.updatedAt")}</span>
                      </div>
                      <p className="text-sm font-medium">
                        {new Date(module.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("module.detail.tabs.projects")}</CardTitle>
              <CardDescription>
                {t("module.detail.projectsDescription", { count: projectModules.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="p-4 text-center">{t("common.loading")}</div>
              ) : projectModules.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {t("module.detail.noProjects")}
                </div>
              ) : (
                <GenericTable
                  data={projectModules}
                  columns={[
                    {
                      key: "projectName",
                      label: t("project.name"),
                      render: (_val: unknown, pm: ProjectModule) => (
                        <button
                          onClick={() => router.push(`/projects/${pm.projectId}`)}
                          className="font-medium text-left hover:text-primary transition-colors"
                        >
                          {pm.projectName || t("project.unknown")}
                        </button>
                      ),
                    },
                    {
                      key: "createdAt",
                      label: t("module.detail.addedAt"),
                      render: (_val: unknown, pm: ProjectModule) => (
                        <span className="text-sm text-muted-foreground">
                          {new Date(pm.createdAt).toLocaleDateString()}
                        </span>
                      ),
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("module.detail.tabs.plans")}</CardTitle>
              <CardDescription>
                {t("module.detail.plansDescription", { count: subscriptionPlans.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plansLoading ? (
                <div className="p-4 text-center">{t("common.loading")}</div>
              ) : subscriptionPlans.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {t("module.detail.noPlans")}
                </div>
              ) : (
                <GenericTable
                  data={subscriptionPlans}
                  columns={[
                    {
                      key: "name",
                      label: t("subscriptionPlan.name"),
                      render: (_val: unknown, plan: SubscriptionPlan) => (
                        <button
                          onClick={() => router.push(`/subscription-plans/${plan.id}`)}
                          className="font-medium text-left hover:text-primary transition-colors"
                        >
                          {plan.name}
                        </button>
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
                          {plan.billingCycleName}
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
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t("module.detail.statistics")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("module.detail.totalProjects")}
                  </label>
                  <p className="text-2xl font-bold">{projectModules.length}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("module.detail.totalPlans")}
                  </label>
                  <p className="text-2xl font-bold">{subscriptionPlans.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


