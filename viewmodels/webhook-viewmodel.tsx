"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type {
  Webhook,
  WebhookDelivery,
  WebhookEventType,
} from "@/domain";
import { CreateWebhookRequest, UpdateWebhookRequest } from "@/domain";
import { WebhookEventType as WebhookEventTypeEnum, WebhookDeliveryStatus } from "@/domain";
import type { CrudConfig } from "@/components/ui/generic-crud-view";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

export function useWebhookViewModel() {
  const router = useRouter();
  const { webhookService, companyService } = useServices();
  const { t } = useI18n();
  const [companyOptions, setCompanyOptions] = useState<Array<{value: string, label: string}>>([]);
  const [deliveriesModalOpen, setDeliveriesModalOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);

  // Load companies for dropdown
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await companyService.getCompanies({ pageSize: 1000 });
        setCompanyOptions(
          response.data.map(company => ({
            value: company.id,
            label: company.name,
          }))
        );
      } catch (e) {
        // Error already shown by service
      }
    };
    loadCompanies();
  }, [companyService]);

  const vm = useGenericCrudViewModel<
    Webhook,
    CreateWebhookRequest,
    UpdateWebhookRequest,
    { data: Webhook[]; pagination: any }
  >(
    {
      getData: webhookService.getWebhooks.bind(webhookService),
      create: async (data: CreateWebhookRequest) => {
        // Convert eventTypes from string array to number array
        const eventTypes = Array.isArray(data.eventTypes) 
          ? data.eventTypes.map(et => typeof et === 'string' ? parseInt(et) : et)
          : [];
        const request = new CreateWebhookRequest({
          ...data,
          eventTypes: eventTypes as WebhookEventType[],
        });
        return await webhookService.createWebhook(request);
      },
      update: async (id: string, data: UpdateWebhookRequest) => {
        // Convert eventTypes from string array to number array if present
        const updateData: any = { ...data };
        if (updateData.eventTypes && Array.isArray(updateData.eventTypes)) {
          updateData.eventTypes = updateData.eventTypes.map((et: any) => 
            typeof et === 'string' ? parseInt(et) : et
          );
        }
        const request = new UpdateWebhookRequest({
          id,
          ...updateData,
        });
        return await webhookService.updateWebhook(id, request);
      },
      delete: webhookService.deleteWebhook.bind(webhookService),
    },
    {
      itemTypeName: t("webhook.item"),
      itemTypeNamePlural: t("webhook.items"),
      getItemDisplayName: (webhook: Webhook) => webhook.displayName,
      searchParamName: "search",
    }
  );

  const handleDelete = useCallback(async (webhook: Webhook) => {
    await webhookService.deleteWebhook(webhook.id);
    await vm.refreshItems();
  }, [webhookService, vm]);

  const handleViewDeliveries = useCallback(async (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setDeliveriesModalOpen(true);
    try {
      setDeliveriesLoading(true);
      const response = await webhookService.getDeliveries(webhook.id, { pageSize: 100 });
      setDeliveries(response.data);
    } catch (e) {
      // Error already shown by service
    } finally {
      setDeliveriesLoading(false);
    }
  }, [webhookService]);

  const handleRetryFailed = useCallback(async () => {
    try {
      await webhookService.retryFailedDeliveries();
    } catch (e) {
      // Error already shown by service
    }
  }, [webhookService]);

  // Event type options for multi-select
  const eventTypeOptions = useMemo(() => [
    { value: WebhookEventTypeEnum.CompanyActivated.toString(), label: t("webhook.eventTypes.companyActivated") },
    { value: WebhookEventTypeEnum.CompanySuspended.toString(), label: t("webhook.eventTypes.companySuspended") },
    { value: WebhookEventTypeEnum.CompanyResumed.toString(), label: t("webhook.eventTypes.companyResumed") },
    { value: WebhookEventTypeEnum.CompanyExpired.toString(), label: t("webhook.eventTypes.companyExpired") },
    { value: WebhookEventTypeEnum.CompanyExtended.toString(), label: t("webhook.eventTypes.companyExtended") },
    { value: WebhookEventTypeEnum.CompanyDeleted.toString(), label: t("webhook.eventTypes.companyDeleted") },
    { value: WebhookEventTypeEnum.LicenseKeyGenerated.toString(), label: t("webhook.eventTypes.licenseKeyGenerated") },
    { value: WebhookEventTypeEnum.TrialStarted.toString(), label: t("webhook.eventTypes.trialStarted") },
    { value: WebhookEventTypeEnum.TrialConverted.toString(), label: t("webhook.eventTypes.trialConverted") },
  ], [t]);

  const config: CrudConfig<Webhook> = useMemo(
    () => ({
      titleKey: "webhook.title",
      subtitleKey: "webhook.description",
      columns: [
        {
          key: "url",
          label: t("webhook.url"),
          render: (_val: unknown, webhook: Webhook) => (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <code className="text-sm font-mono">{webhook.url}</code>
            </div>
          ),
        },
        {
          key: "companyId",
          label: t("webhook.company"),
          render: (_val: unknown, webhook: Webhook) => {
            const company = companyOptions.find(c => c.value === webhook.companyId);
            return <span className="text-sm">{company?.label || webhook.companyId}</span>;
          },
        },
        {
          key: "eventTypes",
          label: t("webhook.eventTypes"),
          render: (_val: unknown, webhook: Webhook) => (
            <div className="flex flex-wrap gap-1">
              {webhook.eventTypes.map((et) => (
                <Badge key={et} variant="secondary" className="text-xs">
                  {t(`webhook.eventTypes.${WebhookEventTypeEnum[et]?.toLowerCase() || 'unknown'}`)}
                </Badge>
              ))}
            </div>
          ),
        },
        {
          key: "isActive",
          label: t("webhook.status"),
          render: (_val: unknown, webhook: Webhook) => (
            <Badge variant={webhook.isActive ? "active" : "secondary"}>
              {webhook.isActive ? t("common.active") : t("common.inactive")}
            </Badge>
          ),
        },
        {
          key: "lastDeliveryAt",
          label: t("webhook.lastDeliveryAt"),
          render: (_val: unknown, webhook: Webhook) => (
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                {webhook.lastDeliveryAt 
                  ? new Date(webhook.lastDeliveryAt).toLocaleDateString()
                  : t("webhook.neverDelivered")}
              </span>
              {webhook.lastDeliveryStatus && (
                <Badge 
                  variant={
                    webhook.lastDeliveryStatus === WebhookDeliveryStatus.Success 
                      ? "active" 
                      : webhook.lastDeliveryStatus === WebhookDeliveryStatus.Failed
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {t(`webhook.deliveryStatus.${WebhookDeliveryStatus[webhook.lastDeliveryStatus]?.toLowerCase() || 'pending'}`)}
                </Badge>
              )}
            </div>
          ),
        },
      ],
      createFields: [
        {
          name: "companyId",
          label: t("webhook.company"),
          type: "select" as const,
          placeholder: t("webhook.companyPlaceholder"),
          options: companyOptions,
          required: true,
        },
        {
          name: "url",
          label: t("webhook.url"),
          type: "text" as const,
          placeholder: t("webhook.urlPlaceholder"),
          required: true,
        },
        {
          name: "secret",
          label: t("webhook.secret"),
          type: "text" as const,
          placeholder: t("webhook.secretPlaceholder"),
        },
        {
          name: "eventTypes",
          label: t("webhook.eventTypes"),
          type: "multi-select" as const,
          placeholder: t("webhook.eventTypesPlaceholder"),
          options: eventTypeOptions,
          required: true,
        },
        {
          name: "retryCount",
          label: t("webhook.retryCount"),
          type: "number" as const,
          placeholder: t("webhook.retryCountPlaceholder"),
        },
        {
          name: "timeoutSeconds",
          label: t("webhook.timeoutSeconds"),
          type: "number" as const,
          placeholder: t("webhook.timeoutSecondsPlaceholder"),
        },
        {
          name: "isActive",
          label: t("webhook.isActive"),
          type: "checkbox" as const,
        },
      ],
      editFields: [
        {
          name: "url",
          label: t("webhook.url"),
          type: "text" as const,
          placeholder: t("webhook.urlPlaceholder"),
          required: true,
        },
        {
          name: "secret",
          label: t("webhook.secret"),
          type: "text" as const,
          placeholder: t("webhook.secretPlaceholder"),
        },
        {
          name: "eventTypes",
          label: t("webhook.eventTypes"),
          type: "multi-select" as const,
          placeholder: t("webhook.eventTypesPlaceholder"),
          options: eventTypeOptions,
          required: true,
        },
        {
          name: "retryCount",
          label: t("webhook.retryCount"),
          type: "number" as const,
          placeholder: t("webhook.retryCountPlaceholder"),
        },
        {
          name: "timeoutSeconds",
          label: t("webhook.timeoutSeconds"),
          type: "number" as const,
          placeholder: t("webhook.timeoutSecondsPlaceholder"),
        },
        {
          name: "isActive",
          label: t("webhook.isActive"),
          type: "checkbox" as const,
        },
        { name: "id", type: "hidden" as const, required: true },
      ],
      createInitialValues: {
        isActive: true,
        retryCount: 3,
        timeoutSeconds: 30,
        eventTypes: [],
      },
      editInitialValues: (webhook: Webhook) => ({
        url: webhook.url,
        secret: webhook.secret || "",
        eventTypes: webhook.eventTypes.map(et => et.toString()),
        retryCount: webhook.retryCount,
        timeoutSeconds: webhook.timeoutSeconds,
        isActive: webhook.isActive,
        id: webhook.id,
      }),
      getActions: (vm: any, t: any, handleDelete: ((item: Webhook) => void) | undefined) => {
        return [
          {
            label: t("common.view"),
            onClick: (item: Webhook) => router.push(`/webhooks/${item.id}`),
            variant: "ghost" as const,
          },
          {
            label: t("webhook.viewDeliveries"),
            onClick: (item: Webhook) => handleViewDeliveries(item),
            variant: "ghost" as const,
          },
          {
            label: t("common.edit"),
            onClick: (item: Webhook) => vm.openEditModal(item),
            variant: "ghost" as const,
          },
          {
            label: t("common.delete"),
            onClick: (item: Webhook) => handleDelete?.(item),
            variant: "ghost" as const,
            className: "text-red-600 hover:text-red-700",
            confirmTitle: t("common.confirmDelete"),
            confirmDescription: t("common.deleteConfirmation", { itemType: t("webhook.item") }),
            isDeleteAction: true,
          },
        ];
      },
      customActions: [
        {
          label: t("webhook.retryFailed"),
          onClick: handleRetryFailed,
          variant: "default" as const,
        },
      ],
    }),
    [t, router, handleDelete, handleViewDeliveries, handleRetryFailed, companyOptions, eventTypeOptions]
  );

  return {
    vm,
    config,
    handleDelete,
    deliveriesModalOpen,
    setDeliveriesModalOpen,
    selectedWebhook,
    deliveries,
    deliveriesLoading,
  };
}

