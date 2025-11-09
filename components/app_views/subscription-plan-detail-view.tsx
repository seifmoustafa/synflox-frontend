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
  Settings,
  Building2,
  BarChart3,
} from "lucide-react";
import type { SubscriptionPlan, Company, BillingCycle } from "@/domain";
import { cn } from "@/lib/utils";
import { GenericModal } from "@/components/ui/generic-modal";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { GenericTable } from "@/components/ui/generic-table";

interface SubscriptionPlanDetailViewProps {
  planId: string;
}

export function SubscriptionPlanDetailView({ planId }: SubscriptionPlanDetailViewProps) {
  const router = useRouter();
  const { subscriptionPlanService, companyService } = useServices();
  const { t } = useI18n();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [moduleAssignmentOpen, setModuleAssignmentOpen] = useState(false);
  const [projectModules, setProjectModules] = useState<Array<{
    projectModuleId: string;
    projectName: string;
    moduleName: string;
    isEnabled: boolean;
  }>>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const loadPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionPlanService.getPlanById(planId);
      setPlan(data);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : t("subscriptionPlan.error.loadFailed");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [planId, subscriptionPlanService, t]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const loadCompanies = useCallback(async () => {
    try {
      setCompaniesLoading(true);
      const response = await companyService.getCompanies({ pageSize: 1000 });
      // Filter companies by subscriptionPlanId on frontend
      const filtered = response.data.filter(c => c.subscriptionPlanId === planId);
      setCompanies(filtered);
    } catch (e) {
      // Error already shown by service
    } finally {
      setCompaniesLoading(false);
    }
  }, [planId, companyService]);

  const loadModules = useCallback(async () => {
    if (!planId) return;
    try {
      setModulesLoading(true);
      const modules = await subscriptionPlanService.getPlanModules(planId);
      setProjectModules(modules);
    } catch (e) {
      // Error already shown by service
    } finally {
      setModulesLoading(false);
    }
  }, [planId, subscriptionPlanService]);

  useEffect(() => {
    if (moduleAssignmentOpen) {
      loadModules();
    }
  }, [moduleAssignmentOpen, loadModules]);

  useEffect(() => {
    if (activeTab === "companies" && companies.length === 0 && !companiesLoading) {
      loadCompanies();
    }
  }, [activeTab, companies.length, companiesLoading, loadCompanies]);

  const handleToggleModule = (projectModuleId: string) => {
    setProjectModules(prev => prev.map(pm => 
      pm.projectModuleId === projectModuleId 
        ? { ...pm, isEnabled: !pm.isEnabled }
        : pm
    ));
  };

  const handleSaveModules = async () => {
    if (!plan) return;
    try {
      const projectModulesToSave = projectModules.map(pm => ({
        projectModuleId: pm.projectModuleId,
        isEnabled: pm.isEnabled,
      }));
      await subscriptionPlanService.assignModules(plan.id, projectModulesToSave);
      setModuleAssignmentOpen(false);
      await loadPlan();
    } catch (e) {
      // Error already shown by service
    }
  };

  const getBillingCycleName = (cycle: BillingCycle): string => {
    const names: Record<BillingCycle, string> = {
      [BillingCycle.Monthly]: t("subscriptionPlan.billingCycle.monthly"),
      [BillingCycle.Yearly]: t("subscriptionPlan.billingCycle.yearly"),
      [BillingCycle.Quarterly]: t("subscriptionPlan.billingCycle.quarterly"),
      [BillingCycle.OneTime]: t("subscriptionPlan.billingCycle.oneTime"),
    };
    return names[cycle] || t("subscriptionPlan.billingCycle.unknown");
  };

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

  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">{t("subscriptionPlan.error.title")}</h2>
          <p className="text-muted-foreground">
            {error || t("subscriptionPlan.error.notFound")}
          </p>
        </div>
        <Button onClick={() => router.push("/subscription-plans")} variant="outline">
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
          { label: t("nav.subscriptionPlans"), href: "/subscription-plans" },
          { label: plan.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{plan.name}</h1>
            <p className="text-muted-foreground mt-1">
              {plan.description || t("subscriptionPlan.detail.description")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/subscription-plans")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.goBack")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setModuleAssignmentOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {t("subscriptionPlan.detail.assignModules")}
          </Button>
          <Button
            variant="default"
            onClick={() => router.push(`/subscription-plans?edit=${plan.id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {t("common.edit")}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t("subscriptionPlan.detail.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="modules">
            {t("subscriptionPlan.detail.tabs.modules")}
            {projectModules.filter(pm => pm.isEnabled).length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {projectModules.filter(pm => pm.isEnabled).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="companies">
            {t("subscriptionPlan.detail.tabs.companies")}
            {companies.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {companies.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="statistics">{t("subscriptionPlan.detail.tabs.statistics")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t("subscriptionPlan.detail.basicInfo")}
                </CardTitle>
                <CardDescription>
                  {t("subscriptionPlan.detail.basicInfoDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("subscriptionPlan.name")}
                  </label>
                  <p className="text-base font-semibold">{plan.name}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("subscriptionPlan.description")}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {plan.description || t("subscriptionPlan.detail.noDescription")}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("subscriptionPlan.price")}
                  </label>
                  <p className="text-base font-semibold">{plan.formattedPrice}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("subscriptionPlan.billingCycle")}
                  </label>
                  <Badge variant="secondary">
                    {getBillingCycleName(plan.billingCycle)}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("subscriptionPlan.status")}
                  </label>
                  <Badge variant={plan.isActive ? "active" : "secondary"}>
                    {plan.isActive ? t("common.active") : t("common.inactive")}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>{t("subscriptionPlan.detail.metadata")}</CardTitle>
                <CardDescription>
                  {t("subscriptionPlan.detail.metadataDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{t("subscriptionPlan.detail.createdAt")}</span>
                    </div>
                    <p className="text-sm font-medium">
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {plan.updatedAt && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{t("subscriptionPlan.detail.updatedAt")}</span>
                      </div>
                      <p className="text-sm font-medium">
                        {new Date(plan.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {plan.maxCompanies && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{t("subscriptionPlan.maxCompanies")}</span>
                      </div>
                      <p className="text-sm font-medium">{plan.maxCompanies}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          {plan.parsedFeatures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("subscriptionPlan.features")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {plan.parsedFeatures.map((feature, index) => (
                    <li key={index} className="text-sm">{feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("subscriptionPlan.detail.tabs.modules")}</CardTitle>
              <CardDescription>
                {t("subscriptionPlan.detail.modulesDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modulesLoading ? (
                <div className="p-4 text-center">{t("common.loading")}</div>
              ) : projectModules.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {t("subscriptionPlan.detail.noModules")}
                </div>
              ) : (
                <div className="space-y-2">
                  {projectModules.map((pm) => (
                    <div key={pm.projectModuleId} className="flex items-center space-x-2 p-2 border rounded">
                      <Checkbox
                        checked={pm.isEnabled}
                        onCheckedChange={() => handleToggleModule(pm.projectModuleId)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{pm.moduleName}</div>
                        <div className="text-sm text-muted-foreground">
                          {t("subscriptionPlan.detail.project")}: {pm.projectName}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveModules}>
                      {t("common.save")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("subscriptionPlan.detail.tabs.companies")}</CardTitle>
              <CardDescription>
                {t("subscriptionPlan.detail.companiesDescription", { count: companies.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {companiesLoading ? (
                <div className="p-4 text-center">{t("common.loading")}</div>
              ) : companies.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {t("subscriptionPlan.detail.noCompanies")}
                </div>
              ) : (
                <GenericTable
                  data={companies}
                  columns={[
                    {
                      key: "name",
                      label: t("company.name"),
                      render: (_val: unknown, company: Company) => (
                        <div className="font-medium">{company.name}</div>
                      ),
                    },
                    {
                      key: "status",
                      label: t("company.status.title"),
                      render: (_val: unknown, company: Company) => {
                        const status = company.status;
                        const statusConfig: Record<string, { variant: "active" | "secondary" | "destructive"; label: string }> = {
                          active: { variant: "active", label: t("company.status.active") },
                          expired: { variant: "destructive", label: t("company.status.expired") },
                          suspended: { variant: "secondary", label: t("company.status.suspended") },
                        };
                        const config = statusConfig[status.toLowerCase()] || statusConfig.active;
                        return (
                          <Badge variant={config.variant}>
                            {config.label}
                          </Badge>
                        );
                      },
                    },
                    {
                      key: "expiryDate",
                      label: t("company.expiryDate"),
                      render: (_val: unknown, company: Company) => (
                        <span className="text-sm">
                          {company.expiryDate 
                            ? new Date(company.expiryDate).toLocaleDateString()
                            : "-"}
                        </span>
                      ),
                    },
                  ]}
                  onRowClick={(company) => router.push(`/companies/${company.id}`)}
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
                  {t("subscriptionPlan.detail.statistics")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("subscriptionPlan.detail.totalCompanies")}
                  </label>
                  <p className="text-2xl font-bold">{companies.length}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("subscriptionPlan.detail.activeCompanies")}
                  </label>
                  <p className="text-2xl font-bold">
                    {companies.filter(c => c.isActiveStatus).length}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("subscriptionPlan.detail.enabledModules")}
                  </label>
                  <p className="text-2xl font-bold">
                    {projectModules.filter(pm => pm.isEnabled).length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Module Assignment Modal */}
      <GenericModal
        open={moduleAssignmentOpen}
        onOpenChange={setModuleAssignmentOpen}
        title={t("subscriptionPlan.assignModules")}
        description={t("subscriptionPlan.assignModulesDescription", { planName: plan.name })}
        size="lg"
      >
        <div className="space-y-4">
          {modulesLoading ? (
            <div className="p-4 text-center">{t("common.loading")}</div>
          ) : projectModules.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {t("subscriptionPlan.detail.noModules")}
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {projectModules.map((pm) => (
                  <div key={pm.projectModuleId} className="flex items-center space-x-2 p-2 border rounded">
                    <Checkbox
                      checked={pm.isEnabled}
                      onCheckedChange={() => handleToggleModule(pm.projectModuleId)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{pm.moduleName}</div>
                      <div className="text-sm text-muted-foreground">
                        {t("subscriptionPlan.detail.project")}: {pm.projectName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setModuleAssignmentOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleSaveModules}>
                  {t("common.save")}
                </Button>
              </div>
            </>
          )}
        </div>
      </GenericModal>
    </div>
  );
}

