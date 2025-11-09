"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type {
  ApiKey,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
  CreateApiKeyResponse,
  RegenerateApiKeyResponse,
} from "@/domain";
import type { CrudConfig } from "@/components/ui/generic-crud-view";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Key } from "lucide-react";

export function useApiKeyViewModel() {
  const router = useRouter();
  const { apiKeyService, companyService } = useServices();
  const { t, language } = useI18n();
  const [companyOptions, setCompanyOptions] = useState<Array<{value: string, label: string}>>([]);
  const [showKeyModalOpen, setShowKeyModalOpen] = useState(false);
  const [fullKey, setFullKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    ApiKey,
    CreateApiKeyRequest,
    UpdateApiKeyRequest,
    { data: ApiKey[]; pagination: any }
  >(
    {
      getData: apiKeyService.getApiKeys.bind(apiKeyService),
      create: async (data: CreateApiKeyRequest) => {
        const response = await apiKeyService.createApiKey(data);
        // Show the full key in a modal
        setFullKey(response.fullKey);
        setShowKeyModalOpen(true);
        return response.apiKey;
      },
      update: apiKeyService.updateApiKey.bind(apiKeyService),
      delete: apiKeyService.deleteApiKey.bind(apiKeyService),
    },
    {
      itemTypeName: t("apiKey.item"),
      itemTypeNamePlural: t("apiKey.items"),
      getItemDisplayName: (key: ApiKey) => key.displayName,
      searchParamName: "search",
    }
  );

  const handleDelete = useCallback(async (key: ApiKey) => {
    await apiKeyService.deleteApiKey(key.id);
    await vm.refreshItems();
  }, [apiKeyService, vm]);

  const handleRegenerate = useCallback(async (key: ApiKey) => {
    try {
      const response = await apiKeyService.regenerateApiKey(key.id);
      setFullKey(response.fullKey);
      setShowKeyModalOpen(true);
      await vm.refreshItems();
    } catch (e) {
      // Error already shown by service
    }
  }, [apiKeyService, vm]);

  const handleCopyKey = useCallback(async () => {
    if (fullKey) {
      try {
        await navigator.clipboard.writeText(fullKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy API key:", error);
      }
    }
  }, [fullKey]);

  const config: CrudConfig<ApiKey> = useMemo(
    () => ({
      titleKey: "apiKey.title",
      subtitleKey: "apiKey.description",
      columns: [
        {
          key: "name",
          label: t("apiKey.name"),
          render: (_val: unknown, key: ApiKey) => (
            <div className="font-medium">{key.name}</div>
          ),
        },
        {
          key: "companyId",
          label: t("apiKey.company"),
          render: (_val: unknown, key: ApiKey) => {
            const company = companyOptions.find(c => c.value === key.companyId);
            return <span className="text-sm">{company?.label || key.companyId}</span>;
          },
        },
        {
          key: "isActive",
          label: t("apiKey.status"),
          render: (_val: unknown, key: ApiKey) => (
            <div className="flex items-center gap-2">
              <Badge variant={key.isActive ? "active" : "secondary"}>
                {key.isActive ? t("common.active") : t("common.inactive")}
              </Badge>
              {key.isExpired && (
                <Badge variant="destructive">
                  {t("apiKey.expired")}
                </Badge>
              )}
            </div>
          ),
        },
        {
          key: "lastUsedAt",
          label: t("apiKey.lastUsedAt"),
          render: (_val: unknown, key: ApiKey) => (
            <span className="text-sm text-muted-foreground">
              {key.lastUsedAt 
                ? new Date(key.lastUsedAt).toLocaleString(language === "ar" ? "ar-EG" : "en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    calendar: "gregory",
                  })
                : t("apiKey.neverUsed")}
            </span>
          ),
        },
        {
          key: "expiresAt",
          label: t("apiKey.expiresAt"),
          render: (_val: unknown, key: ApiKey) => (
            <span className="text-sm text-muted-foreground">
              {key.expiresAt 
                ? new Date(key.expiresAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    calendar: "gregory",
                  })
                : t("apiKey.neverExpires")}
            </span>
          ),
        },
      ],
      createFields: [
        {
          name: "companyId",
          label: t("apiKey.company"),
          type: "select" as const,
          placeholder: t("apiKey.companyPlaceholder"),
          options: companyOptions,
          required: true,
        },
        {
          name: "name",
          label: t("apiKey.name"),
          type: "text" as const,
          placeholder: t("apiKey.namePlaceholder"),
          required: true,
        },
        {
          name: "description",
          label: t("apiKey.description"),
          type: "textarea" as const,
          placeholder: t("apiKey.descriptionPlaceholder"),
        },
        {
          name: "expiresAt",
          label: t("apiKey.expiresAt"),
          type: "date" as const,
          placeholder: t("apiKey.expiresAtPlaceholder"),
        },
      ],
      editFields: [
        {
          name: "name",
          label: t("apiKey.name"),
          type: "text" as const,
          placeholder: t("apiKey.namePlaceholder"),
          required: true,
        },
        {
          name: "description",
          label: t("apiKey.description"),
          type: "textarea" as const,
          placeholder: t("apiKey.descriptionPlaceholder"),
        },
        {
          name: "isActive",
          label: t("apiKey.isActive"),
          type: "checkbox" as const,
        },
        {
          name: "expiresAt",
          label: t("apiKey.expiresAt"),
          type: "date" as const,
          placeholder: t("apiKey.expiresAtPlaceholder"),
        },
        { name: "id", type: "hidden" as const, required: true },
      ],
      createInitialValues: {
        isActive: true,
      },
      editInitialValues: (key: ApiKey) => ({
        name: key.name,
        description: key.description || "",
        isActive: key.isActive,
        expiresAt: key.expiresAt ? new Date(key.expiresAt).toISOString().split('T')[0] : "",
        id: key.id,
      }),
      getActions: (vm: any, t: any, handleDelete: ((item: ApiKey) => void) | undefined) => {
        return [
          {
            label: t("common.view"),
            onClick: (item: ApiKey) => router.push(`/api-keys/${item.id}`),
            variant: "ghost" as const,
          },
          {
            label: t("common.edit"),
            onClick: (item: ApiKey) => vm.openEditModal(item),
            variant: "ghost" as const,
          },
          {
            label: t("apiKey.regenerate"),
            onClick: async (item: ApiKey) => {
              await handleRegenerate(item);
            },
            variant: "ghost" as const,
            confirmTitle: t("apiKey.confirmRegenerate"),
            confirmDescription: t("apiKey.confirmRegenerateDescription"),
            confirmationVariant: "warning",
          },
          {
            label: t("common.delete"),
            onClick: (item: ApiKey) => handleDelete?.(item),
            variant: "ghost" as const,
            className: "text-red-600 hover:text-red-700",
            confirmTitle: t("common.confirmDelete"),
            confirmDescription: t("common.deleteConfirmation", { itemType: t("apiKey.item") }),
            isDeleteAction: true,
          },
        ];
      },
    }),
    [t, router, handleDelete, handleRegenerate, companyOptions]
  );

  return {
    vm,
    config,
    handleDelete,
    handleRegenerate,
    showKeyModalOpen,
    setShowKeyModalOpen,
    fullKey,
    setFullKey,
    copied,
    handleCopyKey,
  };
}

