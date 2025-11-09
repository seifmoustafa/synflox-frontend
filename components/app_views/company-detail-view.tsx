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
  Building2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Key,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  FileText,
  History,
  Package,
  Sparkles,
  BarChart3,
  RefreshCw,
  Play,
  ArrowRight,
  Plus,
} from "lucide-react";
import type { Company, SubscriptionPlan } from "@/domain";
import { CompanyCustomField, CustomFieldType } from "@/domain";
import { cn } from "@/lib/utils";
import { GenericModal } from "@/components/ui/generic-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GenericSelect from "@/components/ui/generic-select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { useLicensingViewModel } from "@/viewmodels/licensing-viewmodel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SubscriptionHistoryEmbeddedView } from "./subscription-history-embedded-view";

interface CompanyDetailViewProps {
  companyId: string;
}

export function CompanyDetailView({ companyId }: CompanyDetailViewProps) {
  const router = useRouter();
  const { companyService, companyCustomFieldService, subscriptionPlanService } = useServices();
  const { t } = useI18n();
  const licensingVm = useLicensingViewModel();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Helper function to set loading state (handles both initial and operation loading)
  const setLoadingState = useCallback((keyOrValue: string | boolean, value?: boolean) => {
    if (typeof keyOrValue === "boolean") {
      // Initial loading
      setLoading(keyOrValue);
    } else if (typeof keyOrValue === "string" && typeof value === "boolean") {
      // Operation loading
      setOperationLoading((prev) => ({
        ...prev,
        [keyOrValue]: value,
      }));
    }
  }, []);
  const [customFields, setCustomFields] = useState<CompanyCustomField[]>([]);
  const [customFieldsLoading, setCustomFieldsLoading] = useState(false);
  const [customFieldModalOpen, setCustomFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CompanyCustomField | null>(null);
  const [fieldForm, setFieldForm] = useState({
    fieldName: "",
    fieldType: CustomFieldType.String.toString(),
    fieldValue: "",
  });
  
  // Trial modals
  const [startTrialModalOpen, setStartTrialModalOpen] = useState(false);
  const [convertTrialModalOpen, setConvertTrialModalOpen] = useState(false);
  const [trialDays, setTrialDays] = useState("30");
  const [convertExpiryDate, setConvertExpiryDate] = useState("");
  
  // Subscription plan
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [changePlanModalOpen, setChangePlanModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [planOptions, setPlanOptions] = useState<Array<{value: string, label: string}>>([]);
  
  // License key
  const [licenseKeyModalOpen, setLicenseKeyModalOpen] = useState(false);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [licenseKeyCopied, setLicenseKeyCopied] = useState(false);

  const loadCompany = useCallback(async () => {
    try {
      setLoadingState(true);
      setError(null);
      const data = await companyService.getCompanyById(companyId);
      setCompany(data);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : t("company.error.loadFailed");
      setError(errorMessage);
    } finally {
      setLoadingState(false);
    }
  }, [companyId, companyService, t]);

  useEffect(() => {
    loadCompany();
  }, [loadCompany]);

  // Sync licenseKey state with company.licenseKey when company is loaded
  useEffect(() => {
    if (company?.licenseKey && company.licenseKey !== licenseKey) {
      setLicenseKey(company.licenseKey);
    }
  }, [company?.licenseKey]);

  const loadCustomFields = useCallback(async () => {
    if (!companyId) return;
    try {
      setCustomFieldsLoading(true);
      const response = await companyCustomFieldService.getCustomFields(companyId, { pageSize: 100 });
      setCustomFields(response.data);
    } catch (e) {
      // Error already shown by service
    } finally {
      setCustomFieldsLoading(false);
    }
  }, [companyId, companyCustomFieldService]);

  useEffect(() => {
    if (company) {
      loadCustomFields();
      if (company.subscriptionPlanId) {
        loadSubscriptionPlan();
      } else {
        setSubscriptionPlan(null);
      }
    }
  }, [company, loadCustomFields]);

  const loadSubscriptionPlan = useCallback(async () => {
    if (!company?.subscriptionPlanId) return;
    try {
      setPlanLoading(true);
      const plan = await subscriptionPlanService.getPlanById(company.subscriptionPlanId);
      setSubscriptionPlan(plan);
    } catch (e) {
      // Error already shown by service
      setSubscriptionPlan(null);
    } finally {
      setPlanLoading(false);
    }
  }, [company?.subscriptionPlanId, subscriptionPlanService]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await subscriptionPlanService.getPlans({ pageSize: 100, isActive: true });
        setPlanOptions(
          response.data.map(plan => ({
            value: plan.id,
            label: plan.name,
          }))
        );
      } catch (e) {
        // Error already shown by service
      }
    };
    loadPlans();
  }, [subscriptionPlanService]);

  const handleOpenCustomFieldModal = (field?: CompanyCustomField) => {
    if (field) {
      setEditingField(field);
      setFieldForm({
        fieldName: field.fieldName,
        fieldType: field.fieldType.toString(),
        fieldValue: field.formattedValue,
      });
    } else {
      setEditingField(null);
      setFieldForm({
        fieldName: "",
        fieldType: CustomFieldType.String.toString(),
        fieldValue: "",
      });
    }
    setCustomFieldModalOpen(true);
  };

  const handleSaveCustomField = async () => {
    if (!companyId) return;
    try {
      const { CreateCompanyCustomFieldRequest, UpdateCompanyCustomFieldRequest } = await import("@/domain");
      
      if (editingField) {
        const request = new UpdateCompanyCustomFieldRequest({
          id: editingField.id,
          companyId,
          fieldName: fieldForm.fieldName,
          fieldType: parseInt(fieldForm.fieldType) as CustomFieldType,
          fieldValue: fieldForm.fieldValue,
        });
        await companyCustomFieldService.updateCustomField(companyId, editingField.id, request);
      } else {
        const request = new CreateCompanyCustomFieldRequest({
          companyId,
          fieldName: fieldForm.fieldName,
          fieldType: parseInt(fieldForm.fieldType) as CustomFieldType,
          fieldValue: fieldForm.fieldValue,
        });
        await companyCustomFieldService.createCustomField(companyId, request);
      }
      
      setCustomFieldModalOpen(false);
      setEditingField(null);
      await loadCustomFields();
    } catch (e) {
      // Error already shown by service
    }
  };

  const handleDeleteCustomField = async (fieldId: string) => {
    if (!companyId) return;
    try {
      await companyCustomFieldService.deleteCustomField(companyId, fieldId);
      await loadCustomFields();
    } catch (e) {
      // Error already shown by service
    }
  };

  const handleCopyLicenseKey = useCallback(async () => {
    if (licenseKey) {
      try {
        await navigator.clipboard.writeText(licenseKey);
        setLicenseKeyCopied(true);
        setTimeout(() => setLicenseKeyCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy license key:", error);
      }
    } else if (company?.licenseKey) {
      try {
        await navigator.clipboard.writeText(company.licenseKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy license key:", error);
      }
    }
  }, [company?.licenseKey, licenseKey]);

  const handleStartTrial = async () => {
    if (!company) return;
    setLoadingState("startTrial", true);
    try {
      const days = parseInt(trialDays) || 30;
      const success = await licensingVm.startTrial(company.id, days);
      if (success) {
        setStartTrialModalOpen(false);
        setTrialDays("30");
        await loadCompany();
      }
    } catch (e) {
      // Error already shown by service
    } finally {
      setLoadingState("startTrial", false);
    }
  };

  const handleConvertTrial = async () => {
    if (!company || !convertExpiryDate) return;
    setLoadingState("convertTrial", true);
    try {
      const success = await licensingVm.convertTrial(company.id, new Date(convertExpiryDate).toISOString());
      if (success) {
        setConvertTrialModalOpen(false);
        setConvertExpiryDate("");
        await loadCompany();
      }
    } catch (e) {
      // Error already shown by service
    } finally {
      setLoadingState("convertTrial", false);
    }
  };

  const handleGenerateLicenseKey = async () => {
    if (!company) return;
    setLoadingState("generateLicenseKey", true);
    try {
      const key = await licensingVm.generateLicenseKey(company.id);
      if (key) {
        setLicenseKey(key);
        setLicenseKeyModalOpen(true);
        // Reload company to update the license key in the main view
        await loadCompany();
      }
    } catch (e) {
      // Error already shown by service
    } finally {
      setLoadingState("generateLicenseKey", false);
    }
  };

  const handleRegenerateLicenseKey = async () => {
    if (!company) return;
    setLoadingState("regenerateLicenseKey", true);
    try {
      const key = await licensingVm.regenerateLicenseKey(company.id);
      if (key) {
        setLicenseKey(key);
        setLicenseKeyModalOpen(true);
        // Reload company to update the license key in the main view
        await loadCompany();
      }
    } catch (e) {
      // Error already shown by service
    } finally {
      setLoadingState("regenerateLicenseKey", false);
    }
  };

  const handleChangePlan = async () => {
    if (!company || !selectedPlanId) return;
    setLoadingState("changePlan", true);
    try {
      const { UpdateCompanyRequest } = await import("@/domain");
      const request = new UpdateCompanyRequest({
        id: company.id,
        subscriptionPlanId: selectedPlanId,
      });
      await companyService.updateCompany(company.id, request);
      setChangePlanModalOpen(false);
      setSelectedPlanId("");
      await loadCompany();
    } catch (e) {
      // Error already shown by service
    } finally {
      setLoadingState("changePlan", false);
    }
  };

  const calculateTrialDaysRemaining = (): number | null => {
    if (!company?.isTrial || !company?.trialEndDate) return null;
    const endDate = new Date(company.trialEndDate);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t("company.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">
              {t("company.error.title")}
            </CardTitle>
            <CardDescription>
              {error || t("company.error.notFound")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={() => router.back()} variant="outline">
                {t("common.goBack")}
              </Button>
              <Button onClick={loadCompany}>{t("common.retry")}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = company.status;
  const statusConfig = {
    Active: {
      variant: "active" as const,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    Expired: {
      variant: "destructive" as const,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    Suspended: {
      variant: "secondary" as const,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <PageBreadcrumbs
        showHome={false}
        segments={[
          { label: t("nav.companies"), href: "/companies" },
          { label: company.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            {company.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("company.detail.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={statusConfig[status].variant}
            className="text-sm px-3 py-1"
          >
            <StatusIcon className="h-4 w-4 mr-1" />
            {t(`company.status.${status.toLowerCase()}`)}
          </Badge>
          <Button variant="outline" onClick={() => router.push(`/companies`)}>
            <Edit className="h-4 w-4 mr-2" />
            {t("common.edit")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t("company.detail.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="customFields">
            {t("company.detail.tabs.customFields")}
            {customFields.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {customFields.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">{t("company.detail.tabs.history")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("company.detail.tabs.analytics")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("company.detail.basicInfo")}
            </CardTitle>
            <CardDescription>
              {t("company.detail.basicInfoDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("company.name")}
              </label>
              <p className="text-base font-semibold">{company.name}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("company.status.title")}
              </label>
              <div className="flex items-center gap-2">
                <Badge variant={statusConfig[status].variant}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {t(`company.status.${status.toLowerCase()}`)}
                </Badge>
                <Badge variant={company.isActive ? "active" : "inactive"}>
                  {company.isActive
                    ? t("company.active")
                    : t("company.inactive")}
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("company.expiryDate")}
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-base">
                  {company.expiryDate
                    ? new Date(company.expiryDate).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : t("company.detail.noExpiryDate")}
                </p>
                {company.expiryDate && (
                  <Badge
                    variant={
                      new Date(company.expiryDate) < new Date()
                        ? "destructive"
                        : "default"
                    }
                    className="ml-2"
                  >
                    {new Date(company.expiryDate) < new Date()
                      ? t("company.detail.expired")
                      : t("company.detail.valid")}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t("company.detail.contactInfo")}
            </CardTitle>
            <CardDescription>
              {t("company.detail.contactInfoDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t("company.contactEmail")}
              </label>
              <p className="text-base">
                {company.contactEmail || (
                  <span className="text-muted-foreground italic">
                    {t("company.detail.notProvided")}
                  </span>
                )}
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {t("company.contactPhone")}
              </label>
              <p className="text-base">
                {company.contactPhone || (
                  <span className="text-muted-foreground italic">
                    {t("company.detail.notProvided")}
                  </span>
                )}
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t("company.address")}
              </label>
              <p className="text-base">
                {company.address || (
                  <span className="text-muted-foreground italic">
                    {t("company.detail.notProvided")}
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trial Information */}
        {company.isTrial && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {t("company.detail.trial.status")}
              </CardTitle>
              <CardDescription>
                {t("company.detail.trial.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="active">
                  {t("company.detail.trial.active")}
                </Badge>
                {company.trialEndDate && (
                  <>
                    <span className="text-sm text-muted-foreground">
                      {t("company.detail.trial.endDate")}:
                    </span>
                    <span className="text-sm font-medium">
                      {new Date(company.trialEndDate).toLocaleDateString()}
                    </span>
                    {calculateTrialDaysRemaining() !== null && (
                      <>
                        <span className="text-sm text-muted-foreground">
                          ({t("company.detail.trial.daysRemaining", { days: calculateTrialDaysRemaining() })})
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
              <Button
                variant="default"
                onClick={() => setConvertTrialModalOpen(true)}
                isLoading={operationLoading["convertTrial"] || licensingVm.loading}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                {t("company.detail.trial.convert")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Start Trial Button - Only show if not in trial */}
        {!company.isTrial && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {t("company.detail.trial.title")}
              </CardTitle>
              <CardDescription>
                {t("company.detail.trial.startDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="default"
                onClick={() => setStartTrialModalOpen(true)}
              >
                <Play className="h-4 w-4 mr-2" />
                {t("company.detail.trial.start")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plan Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t("company.detail.subscriptionPlan.title")}
                </CardTitle>
                <CardDescription>
                  {t("company.detail.subscriptionPlan.description")}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPlanId(company.subscriptionPlanId || "");
                  setChangePlanModalOpen(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                {t("company.detail.subscriptionPlan.change")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {planLoading ? (
              <div className="p-4 text-center">{t("common.loading")}</div>
            ) : subscriptionPlan ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("subscriptionPlan.name")}
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold">{subscriptionPlan.name}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/subscription-plans/${subscriptionPlan.id}`)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("subscriptionPlan.price")}
                    </label>
                    <p className="text-base">{subscriptionPlan.formattedPrice}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("subscriptionPlan.billingCycle")}
                    </label>
                    <p className="text-base">{subscriptionPlan.billingCycleName}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  {t("company.detail.subscriptionPlan.noPlan")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPlanId("");
                    setChangePlanModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("company.detail.subscriptionPlan.assign")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* License Key Management */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {t("company.detail.licenseKey.title")}
            </CardTitle>
            <CardDescription>
              {t("company.detail.licenseKey.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(company.licenseKey || licenseKey) ? (
              <>
                <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      {t("company.licenseKey")}
                    </label>
                    {(operationLoading["generateLicenseKey"] || operationLoading["regenerateLicenseKey"] || licensingVm.loading) ? (
                      <div className="flex items-center gap-2 py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm text-muted-foreground">{t("common.loading")}</span>
                      </div>
                    ) : (
                      <code className="text-sm font-mono break-all">
                        {licenseKey || company.licenseKey}
                      </code>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLicenseKey}
                    title={t("common.copy")}
                    disabled={operationLoading["generateLicenseKey"] || operationLoading["regenerateLicenseKey"] || licensingVm.loading}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    {t("common.copied")}
                  </p>
                )}
                <Button
                  variant="outline"
                  onClick={handleRegenerateLicenseKey}
                  isLoading={operationLoading["regenerateLicenseKey"] || licensingVm.loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("company.detail.licenseKey.regenerate")}
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                onClick={handleGenerateLicenseKey}
                isLoading={operationLoading["generateLicenseKey"] || licensingVm.loading}
              >
                <Key className="h-4 w-4 mr-2" />
                {t("company.detail.licenseKey.generate")}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t("company.detail.timestamps")}
            </CardTitle>
            <CardDescription>
              {t("company.detail.timestampsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {t("company.detail.createdAt")}
                </label>
                <p className="text-base">
                  {new Date(company.createdTimestamp).toLocaleString(
                    undefined,
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
              {company.updatedTimestamp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("company.detail.updatedAt")}
                  </label>
                  <p className="text-base">
                    {new Date(company.updatedTimestamp).toLocaleString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="customFields" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("company.detail.customFields.title")}</CardTitle>
                  <CardDescription>
                    {t("company.detail.customFields.description")}
                  </CardDescription>
                </div>
                <Button onClick={() => handleOpenCustomFieldModal()}>
                  {t("company.detail.customFields.addField")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {customFieldsLoading ? (
                <div className="text-center py-8">{t("common.loading")}</div>
              ) : customFields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t("company.detail.customFields.noFields")}
                </div>
              ) : (
                <div className="space-y-4">
                  {customFields.map((field) => (
                    <div key={field.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{field.fieldName}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <Badge variant="secondary" className="mr-2">
                            {t(`company.detail.customFields.types.${CustomFieldType[field.fieldType]?.toLowerCase() || 'string'}`)}
                          </Badge>
                          <span>{field.formattedValue}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenCustomFieldModal(field)}
                        >
                          {t("common.edit")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => {
                            if (confirm(t("common.deleteConfirmation", { itemType: t("company.detail.customFields.field") }))) {
                              handleDeleteCustomField(field.id);
                            }
                          }}
                        >
                          {t("common.delete")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("company.detail.history.title")}</CardTitle>
                  <CardDescription>
                    {t("company.detail.history.description")}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/companies/${companyId}/history`)}
                >
                  <History className="h-4 w-4 mr-2" />
                  {t("company.detail.history.viewHistory")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SubscriptionHistoryEmbeddedView companyId={companyId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t("company.detail.tabs.analytics")}
              </CardTitle>
              <CardDescription>
                {t("company.detail.analytics.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Button
                  variant="default"
                  onClick={() => router.push(`/companies/${companyId}/analytics`)}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {t("company.detail.analytics.viewFull")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Custom Field Modal */}
      <GenericModal
        open={customFieldModalOpen}
        onOpenChange={setCustomFieldModalOpen}
        title={editingField ? t("company.detail.customFields.editField") : t("company.detail.customFields.addField")}
        description={editingField ? t("company.detail.customFields.editFieldDescription") : t("company.detail.customFields.addFieldDescription")}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("company.detail.customFields.fieldName")}</Label>
            <Input
              value={fieldForm.fieldName}
              onChange={(e) => setFieldForm({ ...fieldForm, fieldName: e.target.value })}
              placeholder={t("company.detail.customFields.fieldNamePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("company.detail.customFields.fieldType")}</Label>
            <GenericSelect
              options={[
                { value: CustomFieldType.String.toString(), label: t("company.detail.customFields.types.string") },
                { value: CustomFieldType.Number.toString(), label: t("company.detail.customFields.types.number") },
                { value: CustomFieldType.Boolean.toString(), label: t("company.detail.customFields.types.boolean") },
                { value: CustomFieldType.Date.toString(), label: t("company.detail.customFields.types.date") },
                { value: CustomFieldType.Json.toString(), label: t("company.detail.customFields.types.json") },
              ]}
              value={fieldForm.fieldType}
              onValueChange={(value: string | string[]) => setFieldForm({ ...fieldForm, fieldType: Array.isArray(value) ? value[0] : value })}
              placeholder={t("company.detail.customFields.fieldType")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("company.detail.customFields.fieldValue")}</Label>
            {fieldForm.fieldType === CustomFieldType.Boolean.toString() ? (
              <GenericSelect
                options={[
                  { value: "true", label: t("common.yes") },
                  { value: "false", label: t("common.no") },
                ]}
                value={fieldForm.fieldValue}
                onValueChange={(value: string | string[]) => setFieldForm({ ...fieldForm, fieldValue: Array.isArray(value) ? value[0] : value })}
                placeholder={t("company.detail.customFields.fieldValuePlaceholder")}
              />
            ) : fieldForm.fieldType === CustomFieldType.Date.toString() ? (
              <Input
                type="date"
                value={fieldForm.fieldValue}
                onChange={(e) => setFieldForm({ ...fieldForm, fieldValue: e.target.value })}
              />
            ) : fieldForm.fieldType === CustomFieldType.Number.toString() ? (
              <Input
                type="number"
                value={fieldForm.fieldValue}
                onChange={(e) => setFieldForm({ ...fieldForm, fieldValue: e.target.value })}
                placeholder={t("company.detail.customFields.fieldValuePlaceholder")}
              />
            ) : fieldForm.fieldType === CustomFieldType.Json.toString() ? (
              <Textarea
                value={fieldForm.fieldValue}
                onChange={(e) => setFieldForm({ ...fieldForm, fieldValue: e.target.value })}
                placeholder={t("company.detail.customFields.jsonPlaceholder")}
                rows={6}
              />
            ) : (
              <Input
                value={fieldForm.fieldValue}
                onChange={(e) => setFieldForm({ ...fieldForm, fieldValue: e.target.value })}
                placeholder={t("company.detail.customFields.fieldValuePlaceholder")}
              />
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCustomFieldModalOpen(false);
                setEditingField(null);
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSaveCustomField}>
              {t("common.save")}
            </Button>
          </div>
        </div>
        </GenericModal>

      {/* Start Trial Modal */}
      <GenericModal
        open={startTrialModalOpen}
        onOpenChange={setStartTrialModalOpen}
        title={t("company.detail.trial.start")}
        description={t("company.detail.trial.startDescription")}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trialDays">{t("company.detail.trial.days")}</Label>
            <Input
              id="trialDays"
              type="number"
              value={trialDays}
              onChange={(e) => setTrialDays(e.target.value)}
              placeholder="30"
              min="1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setStartTrialModalOpen(false);
                setTrialDays("30");
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleStartTrial}
              isLoading={operationLoading["startTrial"] || licensingVm.loading}
              disabled={!trialDays}
            >
              {t("company.detail.trial.start")}
            </Button>
          </div>
        </div>
      </GenericModal>

      {/* Convert Trial Modal */}
      <GenericModal
        open={convertTrialModalOpen}
        onOpenChange={setConvertTrialModalOpen}
        title={t("company.detail.trial.convert")}
        description={t("company.detail.trial.convertDescription")}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="convertExpiryDate">{t("company.expiryDate")}</Label>
            <DatePicker
              id="convertExpiryDate"
              value={convertExpiryDate}
              onChange={setConvertExpiryDate}
              placeholder={t("company.expiryDatePlaceholder")}
              required
              type="date"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setConvertTrialModalOpen(false);
                setConvertExpiryDate("");
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleConvertTrial}
              isLoading={operationLoading["convertTrial"] || licensingVm.loading}
              disabled={!convertExpiryDate}
            >
              {t("company.detail.trial.convert")}
            </Button>
          </div>
        </div>
      </GenericModal>

      {/* Change Plan Modal */}
      <GenericModal
        open={changePlanModalOpen}
        onOpenChange={setChangePlanModalOpen}
        title={t("company.detail.subscriptionPlan.change")}
        description={t("company.detail.subscriptionPlan.changeDescription")}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="planSelect">{t("subscriptionPlan.name")}</Label>
            <GenericSelect
              id="planSelect"
              options={planOptions}
              value={selectedPlanId}
              onValueChange={(value: string | string[]) => setSelectedPlanId(Array.isArray(value) ? value[0] : value)}
              placeholder={t("company.detail.subscriptionPlan.selectPlan")}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setChangePlanModalOpen(false);
                setSelectedPlanId("");
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleChangePlan}
              isLoading={operationLoading["changePlan"]}
              disabled={!selectedPlanId}
            >
              {t("common.save")}
            </Button>
          </div>
        </div>
      </GenericModal>

      {/* License Key Display Modal */}
      <Dialog open={licenseKeyModalOpen} onOpenChange={setLicenseKeyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              {t("licensing.viewKey")}
            </DialogTitle>
            <DialogDescription>
              {t("company.licenseKeyDescription", { name: company?.name || "" })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("company.licenseKey")}</Label>
              <div className="flex gap-2">
                <Input
                  value={licenseKey || ""}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLicenseKey}
                  title={t("common.copy")}
                >
                  {licenseKeyCopied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {licenseKeyCopied && (
                <p className="text-sm text-green-600">{t("common.copied")}</p>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setLicenseKeyModalOpen(false)}>
                {t("common.close")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
