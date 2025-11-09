"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  Globe,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  ArrowLeft,
  Building2,
  Trash2,
  BarChart3,
  RefreshCw,
  Play,
  AlertCircle,
} from "lucide-react";
import type { Webhook, WebhookDelivery, Company, WebhookEventType, WebhookDeliveryStatus } from "@/domain";
import { WebhookEventType as WebhookEventTypeEnum, WebhookDeliveryStatus as WebhookDeliveryStatusEnum } from "@/domain";
import { cn } from "@/lib/utils";
import { GenericTable } from "@/components/ui/generic-table";
import { GenericModal } from "@/components/ui/generic-modal";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GenericSelect from "@/components/ui/generic-select";

interface WebhookDetailViewProps {
  webhookId: string;
}

export function WebhookDetailView({ webhookId }: WebhookDetailViewProps) {
  const router = useRouter();
  const { webhookService, companyService } = useServices();
  const { t } = useI18n();
  const [webhook, setWebhook] = useState<Webhook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedDeliveryId, setExpandedDeliveryId] = useState<string | null>(null);

  const loadWebhook = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await webhookService.getWebhookById(webhookId);
      setWebhook(data);
      
      // Load company
      if (data.companyId) {
        try {
          const companyData = await companyService.getCompanyById(data.companyId);
          setCompany(companyData);
        } catch (e) {
          // Company might not exist, ignore
        }
      }
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : t("webhook.error.loadFailed");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [webhookId, webhookService, companyService, t]);

  useEffect(() => {
    loadWebhook();
  }, [loadWebhook]);

  const loadDeliveries = useCallback(async () => {
    try {
      setDeliveriesLoading(true);
      const response = await webhookService.getDeliveries(webhookId, { pageSize: 100 });
      setDeliveries(response.data);
    } catch (e) {
      // Error already shown by service
    } finally {
      setDeliveriesLoading(false);
    }
  }, [webhookId, webhookService]);

  useEffect(() => {
    if (activeTab === "deliveries" && deliveries.length === 0 && !deliveriesLoading) {
      loadDeliveries();
    }
  }, [activeTab, deliveries.length, deliveriesLoading, loadDeliveries]);

  const handleDelete = async () => {
    if (!webhook) return;
    if (!confirm(t("webhook.detail.confirmDelete", { url: webhook.url }))) return;
    try {
      await webhookService.deleteWebhook(webhook.id);
      router.push("/webhooks");
    } catch (e) {
      // Error already shown by service
    }
  };

  const handleRetryFailed = async () => {
    try {
      await webhookService.retryFailedDeliveries();
      await loadDeliveries();
    } catch (e) {
      // Error already shown by service
    }
  };

  const getEventTypeName = (eventType: WebhookEventType): string => {
    const names: Record<WebhookEventType, string> = {
      [WebhookEventTypeEnum.CompanyActivated]: t("webhook.eventTypes.companyActivated"),
      [WebhookEventTypeEnum.CompanySuspended]: t("webhook.eventTypes.companySuspended"),
      [WebhookEventTypeEnum.CompanyResumed]: t("webhook.eventTypes.companyResumed"),
      [WebhookEventTypeEnum.CompanyExpired]: t("webhook.eventTypes.companyExpired"),
      [WebhookEventTypeEnum.CompanyExtended]: t("webhook.eventTypes.companyExtended"),
      [WebhookEventTypeEnum.CompanyDeleted]: t("webhook.eventTypes.companyDeleted"),
      [WebhookEventTypeEnum.LicenseKeyGenerated]: t("webhook.eventTypes.licenseKeyGenerated"),
      [WebhookEventTypeEnum.TrialStarted]: t("webhook.eventTypes.trialStarted"),
      [WebhookEventTypeEnum.TrialConverted]: t("webhook.eventTypes.trialConverted"),
    };
    return names[eventType] || `Event ${eventType}`;
  };

  const getDeliveryStatusBadge = (status: WebhookDeliveryStatus) => {
    const configs: Record<WebhookDeliveryStatus, { variant: "active" | "secondary" | "destructive"; label: string }> = {
      [WebhookDeliveryStatusEnum.Pending]: { variant: "secondary", label: t("webhook.deliveryStatus.pending") },
      [WebhookDeliveryStatusEnum.Success]: { variant: "active", label: t("webhook.deliveryStatus.success") },
      [WebhookDeliveryStatusEnum.Failed]: { variant: "destructive", label: t("webhook.deliveryStatus.failed") },
      [WebhookDeliveryStatusEnum.Retrying]: { variant: "secondary", label: t("webhook.deliveryStatus.retrying") },
    };
    const config = configs[status] || configs[WebhookDeliveryStatusEnum.Pending];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const statistics = useMemo(() => {
    const total = deliveries.length;
    const successful = deliveries.filter(d => d.status === WebhookDeliveryStatusEnum.Success).length;
    const failed = deliveries.filter(d => d.status === WebhookDeliveryStatusEnum.Failed).length;
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;
    return { total, successful, failed, successRate };
  }, [deliveries]);

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

  if (error || !webhook) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">{t("webhook.error.title")}</h2>
          <p className="text-muted-foreground">
            {error || t("webhook.error.notFound")}
          </p>
        </div>
        <Button onClick={() => router.push("/webhooks")} variant="outline">
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
          { label: t("nav.webhooks"), href: "/webhooks" },
          { label: webhook.url },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{webhook.url}</h1>
            <p className="text-muted-foreground mt-1">
              {t("webhook.detail.description")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/webhooks")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.goBack")}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/webhooks?edit=${webhook.id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {t("common.edit")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("common.delete")}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t("webhook.detail.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="deliveries">
            {t("webhook.detail.tabs.deliveries")}
            {deliveries.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {deliveries.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">{t("webhook.detail.tabs.settings")}</TabsTrigger>
          <TabsTrigger value="statistics">{t("webhook.detail.tabs.statistics")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t("webhook.detail.basicInfo")}
                </CardTitle>
                <CardDescription>
                  {t("webhook.detail.basicInfoDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("webhook.url")}
                  </label>
                  <code className="text-sm font-mono bg-muted p-2 rounded block break-all">
                    {webhook.url}
                  </code>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("webhook.secret")}
                  </label>
                  <code className="text-sm font-mono bg-muted p-2 rounded block">
                    {webhook.secret ? "****" : t("webhook.detail.noSecret")}
                  </code>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("webhook.status")}
                  </label>
                  <Badge variant={webhook.isActive ? "active" : "secondary"}>
                    {webhook.isActive ? t("common.active") : t("common.inactive")}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("webhook.eventTypes")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {webhook.eventTypes.map((eventType) => (
                      <Badge key={eventType} variant="secondary">
                        {getEventTypeName(eventType)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>{t("webhook.detail.metadata")}</CardTitle>
                <CardDescription>
                  {t("webhook.detail.metadataDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  {company && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{t("webhook.company")}</span>
                      </div>
                      <button
                        onClick={() => router.push(`/companies/${company.id}`)}
                        className="text-sm font-medium hover:text-primary transition-colors"
                      >
                        {company.name}
                      </button>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{t("webhook.retryCount")}</span>
                    </div>
                    <p className="text-sm font-medium">{webhook.retryCount}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{t("webhook.timeoutSeconds")}</span>
                    </div>
                    <p className="text-sm font-medium">{webhook.timeoutSeconds}s</p>
                  </div>
                  {webhook.lastDeliveryAt && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{t("webhook.lastDeliveryAt")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {new Date(webhook.lastDeliveryAt).toLocaleString()}
                        </p>
                        {webhook.lastDeliveryStatus && getDeliveryStatusBadge(webhook.lastDeliveryStatus)}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{t("webhook.detail.createdAt")}</span>
                    </div>
                    <p className="text-sm font-medium">
                      {new Date(webhook.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("webhook.detail.tabs.deliveries")}</CardTitle>
                  <CardDescription>
                    {t("webhook.detail.deliveryHistory")}
                  </CardDescription>
                </div>
                {deliveries.some(d => d.status === WebhookDeliveryStatusEnum.Failed) && (
                  <Button
                    variant="outline"
                    onClick={handleRetryFailed}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t("webhook.detail.retryFailed")}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {deliveriesLoading ? (
                <div className="p-4 text-center">{t("common.loading")}</div>
              ) : deliveries.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {t("webhook.detail.noDeliveries")}
                </div>
              ) : (
                <div className="space-y-2">
                  {deliveries.map((delivery) => (
                    <div key={delivery.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div>
                            <div className="font-medium">{getEventTypeName(delivery.eventType)}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(delivery.attemptedAt).toLocaleString()}
                            </div>
                          </div>
                          <div>{getDeliveryStatusBadge(delivery.status)}</div>
                          {delivery.responseCode && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Status: </span>
                              <span className={cn(
                                "font-mono",
                                delivery.responseCode >= 200 && delivery.responseCode < 300 ? "text-green-600" : "text-red-600"
                              )}>
                                {delivery.responseCode}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedDeliveryId(
                            expandedDeliveryId === delivery.id ? null : delivery.id
                          )}
                        >
                          {expandedDeliveryId === delivery.id ? t("common.hide") : t("common.show")}
                        </Button>
                      </div>
                      {expandedDeliveryId === delivery.id && (
                        <div className="mt-4 space-y-4 pt-4 border-t">
                          {delivery.errorMessage && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-red-600">
                                {t("webhook.detail.errorMessage")}
                              </Label>
                              <p className="text-sm text-red-600">{delivery.errorMessage}</p>
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label>{t("webhook.detail.payload")}</Label>
                            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48">
                              {JSON.stringify(delivery.parsedPayload, null, 2)}
                            </pre>
                          </div>
                          {delivery.responseBody && (
                            <div className="space-y-2">
                              <Label>{t("webhook.detail.responseBody")}</Label>
                              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48">
                                {delivery.responseBody}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("webhook.detail.tabs.settings")}</CardTitle>
              <CardDescription>
                {t("webhook.detail.settingsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>{t("webhook.detail.settingsNote")}</p>
                <p className="text-sm mt-2">
                  {t("webhook.detail.editNote")}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t("webhook.detail.statistics")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("webhook.detail.totalDeliveries")}
                  </label>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("webhook.detail.successfulDeliveries")}
                  </label>
                  <p className="text-2xl font-bold text-green-600">{statistics.successful}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("webhook.detail.failedDeliveries")}
                  </label>
                  <p className="text-2xl font-bold text-red-600">{statistics.failed}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("webhook.detail.successRate")}
                  </label>
                  <p className="text-2xl font-bold">{statistics.successRate}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


