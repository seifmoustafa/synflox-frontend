"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { SubscriptionPlan, UpdatePlanRequest } from "@/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import GenericSelect from "@/components/ui/generic-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, Package, FolderOpen, ArrowRight, Save, X, ArrowLeft,
  DollarSign, Clock, Shield, Settings2, Layers, Star, Info,
  ChevronRight, CheckCircle2, AlertCircle, Sparkles, Zap
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import React from "react";
import { appLogger } from "@/lib/logger";
import { PlanModuleConflict, UpdatePlanWithConfirmationRequest } from "@/services/subscription-plan.service";

interface PlanEditViewProps {
  planId: string;
}

export function PlanEditView({ planId }: PlanEditViewProps) {
  const router = useRouter();
  const { subscriptionPlanService, projectService, moduleService } = useServices();
  const { t, direction } = useI18n();
  const isRTL = direction === "rtl";
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectOptions, setProjectOptions] = useState<Array<{value: string, label: string}>>([]);
  const [moduleOptions, setModuleOptions] = useState<Array<{value: string, label: string}>>([]);
  const [parentPlanOptions, setParentPlanOptions] = useState<Array<{value: string, label: string}>>([]);
  const [fallbackPlanOptions, setFallbackPlanOptions] = useState<Array<{value: string, label: string}>>([]);
  
  // Module conflict dialog state
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [moduleConflicts, setModuleConflicts] = useState<PlanModuleConflict[]>([]);
  const [pendingFormData, setPendingFormData] = useState<any>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  // Form state - MUST be declared before any early returns
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    durationType: "3",
    currency: "",
    amount: "",
    allowTrial: false,
    trialDurationDays: "14",
    autoRenew: false,
    upgradePolicy: "0",
    gracePeriodDays: "7",
    customFeatures: [] as string[],
    projectIds: [] as string[],
    moduleIds: [] as string[],
    isFreeTier: false,
    parentPlanId: "",
    displayOrder: "0",
    exportGraceDays: "30",
    defaultFallbackPlanId: "",
    fallbackAccessMode: "2",
    showLockedModulesInMenu: true,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    loadData();
  }, [planId]);

  // Update form data when plan loads
  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description || "",
        durationType: plan.durationType?.toString() || "3",
        currency: plan.primaryPrice?.currency?.toString() || "",
        amount: plan.primaryPrice?.amount?.toString() || "",
        allowTrial: plan.allowTrial || false,
        trialDurationDays: plan.trialDurationDays?.toString() || "14",
        autoRenew: plan.autoRenew || false,
        upgradePolicy: plan.upgradePolicy?.toString() || "0",
        gracePeriodDays: plan.gracePeriodDays?.toString() || "7",
        customFeatures: plan.customFeatures || [],
        projectIds: plan.projects?.map(p => p.id) || [],
        moduleIds: plan.modules?.map(m => m.id) || [],
        isFreeTier: plan.isFreeTier || false,
        parentPlanId: plan.parentPlanId || "",
        displayOrder: plan.displayOrder?.toString() || "0",
        exportGraceDays: plan.exportGraceDays?.toString() || "30",
        defaultFallbackPlanId: plan.defaultFallbackPlanId || "",
        fallbackAccessMode: plan.fallbackAccessMode?.toString() || "2",
        showLockedModulesInMenu: plan.showLockedModulesInMenu ?? true,
      });
    }
  }, [plan]);

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

  const handleSubmit = async (data: any, confirmRemoveDuplicates: boolean = false): Promise<void> => {
    // Convert currency and amount fields into prices array
    const prices = data.currency && data.amount ? [{
      currency: parseInt(data.currency),
      amount: parseFloat(data.amount)
    }] : plan?.prices || [];

    const projectIds = data.projectIds || [];
    const moduleIds = data.moduleIds || [];

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
      projectIds,
      moduleIds,
      // New fields
      isFreeTier: data.isFreeTier,
      parentPlanId: data.parentPlanId || null,
      displayOrder: data.displayOrder ? parseInt(data.displayOrder) : 0,
      exportGraceDays: data.exportGraceDays ? parseInt(data.exportGraceDays) : 30,
      defaultFallbackPlanId: data.defaultFallbackPlanId || null,
      fallbackAccessMode: data.fallbackAccessMode ? parseInt(data.fallbackAccessMode) : undefined,
      showLockedModulesInMenu: data.showLockedModulesInMenu,
    }) as UpdatePlanWithConfirmationRequest;

    try {
      // If confirming removal, use the confirmation endpoint
      if (confirmRemoveDuplicates) {
        request.confirmRemoveDuplicates = true;
        await subscriptionPlanService.updateWithConfirmation(request);
      } else {
        // Regular update - will throw 409 if conflicts exist
        await subscriptionPlanService.updatePlan(request);
      }
      
      router.push(`/plans/${planId}`);
    } catch (error: any) {
      // Log everything to console for debugging
      console.log("=== UPDATE PLAN ERROR ===");
      console.log("Full error object:", error);
      console.log("error.statusCode:", error?.statusCode);
      console.log("error.response:", error?.response);
      console.log("error.response?.status:", error?.response?.status);
      console.log("error.response?.data:", error?.response?.data);
      console.log("=========================");
      
      // Check if this is a module conflict error (409 Conflict)
      // The API service sets error.response = { status, data } and error.statusCode
      const isConflict = error?.statusCode === 409 || error?.response?.status === 409;
      const responseData = error?.response?.data;
      
      console.log("isConflict:", isConflict);
      console.log("responseData:", responseData);
      console.log("requiresConfirmation:", responseData?.requiresConfirmation);
      
      if (isConflict && responseData?.requiresConfirmation) {
        console.log("SHOWING CONFLICT DIALOG!");
        // Store form data and show confirmation dialog - DO NOT THROW
        setPendingFormData(data);
        const conflicts = responseData.validationResult?.moduleConflicts || [];
        console.log("Conflicts:", conflicts);
        setModuleConflicts(conflicts);
        setShowConflictDialog(true);
        // Return successfully to prevent GenericForm from handling the error
        return;
      }
      
      console.log("NOT A CONFLICT - just returning");
      // For other errors, don't re-throw to prevent form reset
      // Just return - error was already logged
      return;
    }
  };

  // Handle confirmation from dialog
  const handleConfirmRemoveDuplicates = async () => {
    if (!pendingFormData) return;
    
    setIsConfirmLoading(true);
    try {
      await handleSubmit(pendingFormData, true);
      setShowConflictDialog(false);
      setPendingFormData(null);
      setModuleConflicts([]);
    } catch (error) {
      appLogger.error("Failed to update plan with confirmation:", error);
      // Keep dialog open on error
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const handleCancelConflictDialog = () => {
    setShowConflictDialog(false);
    // Keep pending data so form retains values if needed
    setPendingFormData(null);
    setModuleConflicts([]);
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

  // Helper functions
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = t("validation.required");
    if (formData.name && formData.name.length < 2) newErrors.name = t("validation.minLength").replace("{min}", "2");
    if (!formData.isFreeTier) {
      if (!formData.currency) newErrors.currency = t("validation.required");
      if (formData.currency && !formData.amount) newErrors.amount = t("validation.required");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) {
      // Switch to tab with errors
      if (errors.name || errors.description) setActiveTab("basic");
      else if (errors.currency || errors.amount) setActiveTab("pricing");
      return;
    }
    setSaving(true);
    try {
      await handleSubmit(formData);
    } finally {
      setSaving(false);
    }
  };

  // Options
  const durationOptions = [
    { value: "1", label: t("plan.duration.weekly") },
    { value: "3", label: t("plan.duration.monthly") },
    { value: "4", label: t("plan.duration.quarterly") },
    { value: "6", label: t("plan.duration.yearly") },
    { value: "99", label: t("plan.duration.lifetime") },
  ];

  const currencyOptions = [
    { value: "1", label: "USD ($)" },
    { value: "2", label: "EUR (€)" },
    { value: "3", label: "EGP (£E)" },
    { value: "4", label: "SAR (﷼)" },
    { value: "5", label: "AED (د.إ)" },
    { value: "6", label: "GBP (£)" },
    { value: "7", label: "JPY (¥)" },
    { value: "8", label: "CNY (¥)" },
  ];

  const upgradePolicyOptions = [
    { value: "0", label: t("plan.upgradePolicies.fullReplace") || "Full Replace" },
    { value: "1", label: t("plan.upgradePolicies.prorated") || "Prorated" },
    { value: "2", label: t("plan.upgradePolicies.deferred") || "Deferred" },
  ];

  const fallbackModeOptions = [
    { value: "2", label: t("plan.accessModes.readOnly") || "Read Only" },
    { value: "3", label: t("plan.accessModes.exportOnly") || "Export Only" },
    { value: "4", label: t("plan.accessModes.blocked") || "Blocked" },
  ];

  // Helper components
  const FieldLabel = ({ label, required, tooltip }: { label: string; required?: boolean; tooltip?: string }) => (
    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className={cn("text-destructive", isRTL ? "mr-1" : "ml-1")}>*</span>}
      </Label>
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  const FieldError = ({ error }: { error?: string }) => 
    error ? <p className={cn("text-xs text-destructive mt-1", isRTL && "text-right")}>{error}</p> : null;

  const SectionCard = ({ 
    icon: Icon, 
    title, 
    description, 
    children,
    badge,
  }: { 
    icon: React.ElementType; 
    title: string; 
    description?: string;
    children: React.ReactNode;
    badge?: string;
  }) => (
    <Card>
      <CardHeader className="pb-4">
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className={cn("flex-1", isRTL ? "text-right" : "text-left")}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse justify-end")}>
              <CardTitle className="text-lg">{title}</CardTitle>
              {badge && <Badge variant="outline" className="text-xs">{badge}</Badge>}
            </div>
            {description && <CardDescription className="text-sm mt-0.5">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );

  const isLifetime = formData.durationType === "99";
  const showPricingFields = !formData.isFreeTier;
  const showTrialFields = !formData.isFreeTier && !isLifetime;
  const showBillingFields = !formData.isFreeTier && !isLifetime;

  return (
    <TooltipProvider>
      <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Breadcrumbs */}
        <PageBreadcrumbs
          segments={[
            { label: t("plan.items"), href: "/plans" },
            { label: plan.name, href: `/plans/${planId}` },
            { label: t("common.edit") }
          ]}
          showHome={false}
          onBack={() => router.push(`/plans/${planId}`)}
        />

        {/* Header with Actions */}
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings2 className="h-6 w-6 text-primary" />
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h1 className="text-2xl font-bold">{t("common.edit")} {plan.name}</h1>
              <p className="text-sm text-muted-foreground">{t("plan.editDescription") || "Configure plan settings and pricing"}</p>
            </div>
          </div>
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => router.push(`/plans/${planId}`)}>
              <X className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {t("common.cancel")}
            </Button>
            <Button onClick={onSubmit} disabled={saving}>
              {saving ? (
                <div className={cn("h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin", isRTL ? "ml-2" : "mr-2")} />
              ) : (
                <Save className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              )}
              {t("common.save")}
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={cn("grid w-full grid-cols-4", isRTL && "direction-rtl")}>
            {isRTL ? (
              <>
                <TabsTrigger value="access" className="gap-2 flex-row-reverse">
                  <Shield className="h-4 w-4 shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{t("plan.accessTab") || "Access"}</span>
                </TabsTrigger>
                <TabsTrigger value="billing" className="gap-2 flex-row-reverse">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{t("plan.billingTab") || "Billing"}</span>
                </TabsTrigger>
                <TabsTrigger value="pricing" className="gap-2 flex-row-reverse">
                  <DollarSign className="h-4 w-4 shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{t("plan.pricingTab") || "Pricing"}</span>
                </TabsTrigger>
                <TabsTrigger value="basic" className="gap-2 flex-row-reverse">
                  <Layers className="h-4 w-4 shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{t("plan.basicInfo") || "Basic"}</span>
                </TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="basic" className="gap-2">
                  <Layers className="h-4 w-4 shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{t("plan.basicInfo") || "Basic"}</span>
                </TabsTrigger>
                <TabsTrigger value="pricing" className="gap-2">
                  <DollarSign className="h-4 w-4 shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{t("plan.pricingTab") || "Pricing"}</span>
                </TabsTrigger>
                <TabsTrigger value="billing" className="gap-2">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{t("plan.billingTab") || "Billing"}</span>
                </TabsTrigger>
                <TabsTrigger value="access" className="gap-2">
                  <Shield className="h-4 w-4 shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{t("plan.accessTab") || "Access"}</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <SectionCard icon={Layers} title={t("plan.basicInfo") || "Basic Information"} description={t("plan.basicInfoDesc") || "Plan name, description and hierarchy"}>
              <div className="grid gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <FieldLabel label={t("plan.name")} required tooltip={t("plan.nameHelper")} />
                  <Input
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder={t("plan.namePlaceholder")}
                    className={cn(errors.name && "border-destructive", isRTL && "text-right")}
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                  <FieldError error={errors.name} />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <FieldLabel label={t("plan.planDescription")} tooltip={t("plan.descriptionHelper")} />
                  <Textarea
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder={t("plan.descriptionPlaceholder")}
                    rows={3}
                    className={isRTL ? "text-right" : ""}
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                </div>

                {/* Free Tier Toggle */}
                <div className={cn("flex items-center justify-between p-4 rounded-lg border bg-muted/30", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <p className="font-medium">{t("plan.isFreeTier")}</p>
                      <p className="text-sm text-muted-foreground">{t("plan.isFreeTierHelper")}</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.isFreeTier}
                    onCheckedChange={(checked) => updateField("isFreeTier", checked)}
                  />
                </div>

                {/* Parent Plan & Display Order */}
                <div className={cn("grid gap-4 sm:grid-cols-2", isRTL && "direction-rtl")}>
                  <div className="space-y-2">
                    <FieldLabel label={t("plan.parentPlan")} tooltip={t("plan.parentPlanHelper")} />
                    <GenericSelect
                      type="single"
                      options={[{ value: "", label: t("common.none") || "None" }, ...parentPlanOptions]}
                      value={formData.parentPlanId}
                      onValueChange={(v: string | string[]) => updateField("parentPlanId", typeof v === "string" ? v : v[0] || "")}
                      allowClear
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label={t("plan.displayOrder")} tooltip={t("plan.displayOrderHelper")} />
                    <Input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => updateField("displayOrder", e.target.value)}
                      min={0}
                      className={isRTL ? "text-right" : ""}
                      dir={isRTL ? "rtl" : "ltr"}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            {formData.isFreeTier ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Star className="h-12 w-12 text-yellow-500 mb-4" />
                  <h3 className="font-semibold text-lg">{t("plan.freeTierEnabled") || "Free Tier Enabled"}</h3>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    {t("plan.freeTierPricingNote") || "Pricing options are disabled for free tier plans. Disable the free tier option in Basic tab to configure pricing."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <SectionCard icon={DollarSign} title={t("plan.pricing") || "Pricing"} description={t("plan.pricingDesc") || "Set the plan duration and price"}>
                  <div className="grid gap-4">
                    {/* Duration Type */}
                    <div className="space-y-2">
                      <FieldLabel label={t("plan.durationType")} required />
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {durationOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => updateField("durationType", opt.value)}
                            className={cn(
                              "p-3 rounded-lg border text-center transition-all",
                              formData.durationType === opt.value
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Currency & Amount */}
                    <div className={cn("grid gap-4 sm:grid-cols-2", isRTL && "direction-rtl")}>
                      <div className="space-y-2">
                        <FieldLabel label={t("plan.currency")} required />
                        <GenericSelect
                          type="single"
                          options={currencyOptions}
                          value={formData.currency}
                          onValueChange={(v: string | string[]) => updateField("currency", typeof v === "string" ? v : v[0] || "")}
                          placeholder={t("plan.selectCurrency") || "Select currency"}
                          className={cn(errors.currency && "border-destructive")}
                        />
                        <FieldError error={errors.currency} />
                      </div>
                      {/* Amount - Only show when currency is selected */}
                      {formData.currency && (
                        <div className="space-y-2">
                          <FieldLabel label={t("plan.priceAmount")} required />
                          <div className="relative">
                            <DollarSign className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                            <Input
                              type="number"
                              value={formData.amount}
                              onChange={(e) => updateField("amount", e.target.value)}
                              placeholder="0.00"
                              className={cn(isRTL ? "pr-9 text-right" : "pl-9", errors.amount && "border-destructive")}
                              step="0.01"
                              min="0"
                              dir={isRTL ? "rtl" : "ltr"}
                            />
                          </div>
                          <FieldError error={errors.amount} />
                        </div>
                      )}
                    </div>
                  </div>
                </SectionCard>

                {/* Trial Section */}
                {showTrialFields && (
                  <SectionCard icon={Sparkles} title={t("plan.trialSettings") || "Trial Period"} description={t("plan.trialDesc") || "Configure free trial options"}>
                    <div className="space-y-4">
                      <div className={cn("flex items-center justify-between p-4 rounded-lg border bg-muted/30", isRTL && "flex-row-reverse")}>
                        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                          <Zap className="h-5 w-5 text-primary" />
                          <div className={isRTL ? "text-right" : "text-left"}>
                            <p className="font-medium">{t("plan.allowTrial")}</p>
                            <p className="text-sm text-muted-foreground">{t("plan.trialHelper")}</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.allowTrial}
                          onCheckedChange={(checked) => updateField("allowTrial", checked)}
                        />
                      </div>

                      {formData.allowTrial && (
                        <div className="space-y-2">
                          <FieldLabel label={t("plan.trialDuration")} required tooltip={t("plan.trialDurationHelper")} />
                          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                            <Input
                              type="number"
                              value={formData.trialDurationDays}
                              onChange={(e) => updateField("trialDurationDays", e.target.value)}
                              className={cn("w-24", isRTL && "text-right")}
                              min={1}
                              max={60}
                              dir={isRTL ? "rtl" : "ltr"}
                            />
                            <span className="text-muted-foreground">{t("common.days") || "days"}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </SectionCard>
                )}
              </>
            )}
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            {!showBillingFields ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">{t("plan.billingNotApplicable") || "Billing Not Applicable"}</h3>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    {formData.isFreeTier 
                      ? (t("plan.freeTierNoBilling") || "Free tier plans don't have billing options.")
                      : (t("plan.lifetimeNoBilling") || "Lifetime plans are one-time purchases with no recurring billing.")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <SectionCard icon={Clock} title={t("plan.billingSettings") || "Billing Settings"} description={t("plan.billingDesc") || "Auto-renewal and upgrade policies"}>
                <div className="space-y-4">
                  {/* Auto Renew */}
                  <div className={cn("flex items-center justify-between p-4 rounded-lg border bg-muted/30", isRTL && "flex-row-reverse")}>
                    <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div className={isRTL ? "text-right" : "text-left"}>
                        <p className="font-medium">{t("plan.autoRenew")}</p>
                        <p className="text-sm text-muted-foreground">{t("plan.autoRenewHelper")}</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.autoRenew}
                      onCheckedChange={(checked) => updateField("autoRenew", checked)}
                    />
                  </div>

                  {/* Upgrade Policy */}
                  <div className="space-y-2">
                    <FieldLabel label={t("plan.upgradePolicy")} tooltip={t("plan.upgradePolicyHelper")} />
                    <GenericSelect
                      type="single"
                      options={upgradePolicyOptions}
                      value={formData.upgradePolicy}
                      onValueChange={(v: string | string[]) => updateField("upgradePolicy", typeof v === "string" ? v : v[0] || "0")}
                    />
                  </div>

                  {/* Grace & Export Days */}
                  <div className={cn("grid gap-4 sm:grid-cols-2", isRTL && "direction-rtl")}>
                    <div className="space-y-2">
                      <FieldLabel label={t("plan.gracePeriod")} tooltip={t("plan.gracePeriodRangeHelper")} />
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <Input
                          type="number"
                          value={formData.gracePeriodDays}
                          onChange={(e) => updateField("gracePeriodDays", e.target.value)}
                          className={cn("w-24", isRTL && "text-right")}
                          min={0}
                          max={30}
                          dir={isRTL ? "rtl" : "ltr"}
                        />
                        <span className="text-muted-foreground">{t("common.days") || "days"}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <FieldLabel label={t("plan.exportGraceDays")} tooltip={t("plan.exportGraceDaysHelper")} />
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <Input
                          type="number"
                          value={formData.exportGraceDays}
                          onChange={(e) => updateField("exportGraceDays", e.target.value)}
                          className={cn("w-24", isRTL && "text-right")}
                          min={0}
                          max={90}
                          dir={isRTL ? "rtl" : "ltr"}
                        />
                        <span className="text-muted-foreground">{t("common.days") || "days"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}
          </TabsContent>

          {/* Access Tab */}
          <TabsContent value="access" className="space-y-6">
            <SectionCard icon={Shield} title={t("plan.accessSettings") || "Access Control"} description={t("plan.accessDesc") || "Fallback behavior and menu visibility"}>
              <div className="space-y-4">
                {/* Fallback Plan */}
                <div className={cn("grid gap-4 sm:grid-cols-2", isRTL && "direction-rtl")}>
                  <div className="space-y-2">
                    <FieldLabel label={t("plan.defaultFallbackPlan")} tooltip={t("plan.defaultFallbackPlanHelper")} />
                    <GenericSelect
                      type="single"
                      options={[{ value: "", label: t("common.none") || "None" }, ...fallbackPlanOptions]}
                      value={formData.defaultFallbackPlanId}
                      onValueChange={(v: string | string[]) => updateField("defaultFallbackPlanId", typeof v === "string" ? v : v[0] || "")}
                      allowClear
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label={t("plan.fallbackAccessMode")} tooltip={t("plan.fallbackAccessModeHelper")} />
                    <GenericSelect
                      type="single"
                      options={fallbackModeOptions}
                      value={formData.fallbackAccessMode}
                      onValueChange={(v: string | string[]) => updateField("fallbackAccessMode", typeof v === "string" ? v : v[0] || "2")}
                    />
                  </div>
                </div>

                {/* Show Locked Modules */}
                <div className={cn("flex items-center justify-between p-4 rounded-lg border bg-muted/30", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <p className="font-medium">{t("plan.showLockedModulesInMenu")}</p>
                      <p className="text-sm text-muted-foreground">{t("plan.showLockedModulesInMenuHelper")}</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.showLockedModulesInMenu}
                    onCheckedChange={(checked) => updateField("showLockedModulesInMenu", checked)}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Projects & Modules */}
            <SectionCard icon={FolderOpen} title={t("plan.contentAccess") || "Content Access"} description={t("plan.contentAccessDesc") || "Select projects and modules included in this plan"}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <FieldLabel label={t("plan.selectProjects")} tooltip={t("plan.projectsHelper")} />
                  <GenericSelect
                    type="multiple"
                    options={projectOptions}
                    value={formData.projectIds}
                    onValueChange={(v: string | string[]) => updateField("projectIds", Array.isArray(v) ? v : [v])}
                    placeholder={t("plan.selectProjectsPlaceholder") || "Select projects..."}
                    allowClear
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel label={t("plan.selectModules")} tooltip={t("plan.modulesHelper")} />
                  <GenericSelect
                    type="multiple"
                    options={moduleOptions}
                    value={formData.moduleIds}
                    onValueChange={(v: string | string[]) => updateField("moduleIds", Array.isArray(v) ? v : [v])}
                    placeholder={t("plan.selectModulesPlaceholder") || "Select modules..."}
                    allowClear
                  />
                </div>
              </div>
            </SectionCard>
          </TabsContent>
        </Tabs>

        {/* Bottom Save Bar - Sticky */}
        <div className={cn("sticky bottom-4 bg-background/95 backdrop-blur border rounded-lg p-4 shadow-lg flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <div className="text-sm text-muted-foreground">
            {Object.keys(errors).length > 0 && (
              <span className={cn("text-destructive flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <AlertTriangle className="h-4 w-4" />
                {t("validation.fixErrors") || "Please fix the errors above"}
              </span>
            )}
          </div>
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => router.push(`/plans/${planId}`)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={onSubmit} disabled={saving}>
              {saving ? (
                <div className={cn("h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin", isRTL ? "ml-2" : "mr-2")} />
              ) : (
                <Save className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              )}
              {t("common.saveChanges") || "Save Changes"}
            </Button>
          </div>
        </div>

      {/* Module Conflict Confirmation Dialog */}
      <ConfirmationDialog
        open={showConflictDialog}
        onOpenChange={() => {}}
        title={t("plan.moduleConflictTitle")}
        confirmText={t("plan.confirmRemoveDuplicates")}
        cancelText={t("common.cancel")}
        onConfirm={handleConfirmRemoveDuplicates}
        onCancel={handleCancelConflictDialog}
        variant="warning"
        icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />}
        isLoading={isConfirmLoading}
      >
        {/* Custom conflict display */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("plan.moduleConflictDescription")}
          </p>
          
          {/* Conflict list */}
          <div className="bg-muted/50 rounded-lg border p-3 space-y-2 max-h-48 overflow-auto">
            {moduleConflicts.map((conflict, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 p-2 bg-background rounded-md border border-yellow-500/20"
              >
                <Package className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                <span className="font-medium text-sm">{conflict.moduleName}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <FolderOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{conflict.projectName}</span>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
            ⚠️ {t("plan.moduleConflictNote")}
          </p>
        </div>
      </ConfirmationDialog>
      </div>
    </TooltipProvider>
  );
}
