"use client";

import { useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type { Company } from "@/domain";
import type { CrudConfig, CustomAction } from "@/components/ui/generic-crud-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Play, Pause, RefreshCw, Calendar } from "lucide-react";

interface UseCompanyGroupCompaniesViewModelProps {
  groupId: string;
  activeTab: string;
  onCompaniesChange?: () => void;
  onAddCompaniesClick?: () => void;
  onBulkActivateClick?: () => void;
  onBulkSuspendClick?: () => void;
  onBulkResumeClick?: () => void;
  onBulkExtendClick?: () => void;
}

export function useCompanyGroupCompaniesViewModel({ 
  groupId,
  activeTab,
  onCompaniesChange,
  onAddCompaniesClick,
  onBulkActivateClick,
  onBulkSuspendClick,
  onBulkResumeClick,
  onBulkExtendClick,
}: UseCompanyGroupCompaniesViewModelProps) {
  
  const router = useRouter();
  const { companyGroupService } = useServices();
  const { t, language } = useI18n();

  // Create a service wrapper for useGenericCrudViewModel
  const groupCompaniesService = useMemo(() => ({
    getData: async (params?: { page?: number; pageSize?: number; search?: string }) => {
      const response = await companyGroupService.getGroupCompanies(groupId, {
        page: params?.page,
        pageSize: params?.pageSize,
      });
      return response;
    },
    create: async () => {
      throw new Error("Create not supported for group companies");
    },
    update: async () => {
      throw new Error("Update not supported for group companies");
    },
    delete: async () => {
      throw new Error("Delete not supported for group companies");
    },
  }), [groupId, companyGroupService]);

  // Use the generic CRUD viewModel hook
  const vm = useGenericCrudViewModel<
    Company,
    never,
    never,
    { data: Company[]; pagination: any }
  >(
    groupCompaniesService,
    {
      itemTypeName: t("company.item"),
      itemTypeNamePlural: t("company.items"),
      getItemDisplayName: (company: Company) => company.name,
      searchParamName: "search", // Note: backend might not support search, but we include it
    }
  );

  // Load companies when tab becomes active
  useEffect(() => {
    if (activeTab === "companies" && vm.items.length === 0 && !vm.loading) {
      vm.refreshItems();
    }
  }, [activeTab, vm.items.length, vm.loading, vm]);

  // Refresh callback that also notifies parent
  const refreshItems = useCallback(async () => {
    await vm.refreshItems();
    onCompaniesChange?.();
  }, [vm, onCompaniesChange]);

  // Wrapper functions that refresh after bulk operations
  const handleBulkSuspendWithRefresh = useCallback(async () => {
    await onBulkSuspendClick?.();
    await refreshItems();
  }, [onBulkSuspendClick, refreshItems]);

  const handleBulkResumeWithRefresh = useCallback(async () => {
    await onBulkResumeClick?.();
    await refreshItems();
  }, [onBulkResumeClick, refreshItems]);

  const handleRemoveCompany = useCallback(async (company: Company) => {
    try {
      await companyGroupService.removeCompanies(groupId, [company.id]);
      await refreshItems();
    } catch (e) {
      // Error already shown by service
    }
  }, [groupId, companyGroupService, refreshItems]);

  const config: CrudConfig<Company> = useMemo(() => ({
    titleKey: "companyGroup.detail.tabs.companies",
    subtitleKey: "companyGroup.detail.companiesDescription",
    customSubtitle: t("companyGroup.detail.companiesDescription", { count: vm.items.length }),
    columns: [
      {
        key: "name",
        label: t("company.name"),
        render: (_val: unknown, company: Company) => (
          <button
            onClick={() => router.push(`/companies/${company.id}`)}
            className="font-medium hover:text-primary transition-colors"
          >
            {company.name}
          </button>
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
              ? new Date(company.expiryDate).toLocaleDateString(
                  language === "ar" ? "ar-EG" : "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    calendar: "gregory",
                  }
                )
              : "-"}
          </span>
        ),
      },
    ],
    createFields: [], // Not used - companies are added via custom modal
    editFields: [], // Not used - companies are managed elsewhere
    getActions: (vm: any, t: any) => [
      {
        label: t("companyGroup.detail.removeCompany"),
        onClick: async (company: Company) => {
          await handleRemoveCompany(company);
        },
        variant: "destructive" as const,
        confirmTitle: t("companyGroup.detail.confirmRemoveCompanyTitle"),
        confirmDescription: t("companyGroup.detail.confirmRemoveCompany", { name: "{name}" }),
        confirmationVariant: "warning" as const,
      },
    ],
    enableBulkActions: false, // Bulk actions are handled separately via customActions
    hideAddButton: true, // We use custom "Add Companies" button
    customActions: [
      {
        label: t("companyGroup.detail.addCompanies"),
        icon: <Plus className="h-4 w-4" />,
        onClick: async () => {
          onAddCompaniesClick?.();
        },
        variant: "default" as const,
      },
    ] as CustomAction[],
    customHeaderContent: vm.items.length > 0 ? (
      <div className="p-4 bg-muted rounded-lg flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium">{t("companyGroup.detail.bulkOperations")}:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkActivateClick}
        >
          <Play className="h-4 w-4 mr-1" />
          {t("companyGroup.detail.bulkActivate")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleBulkSuspendWithRefresh}
        >
          <Pause className="h-4 w-4 mr-1" />
          {t("companyGroup.detail.bulkSuspend")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleBulkResumeWithRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          {t("companyGroup.detail.bulkResume")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkExtendClick}
        >
          <Calendar className="h-4 w-4 mr-1" />
          {t("companyGroup.detail.bulkExtend")}
        </Button>
      </div>
    ) : undefined,
    itemTypeKey: "company.item",
    getItemDisplayName: (company: Company) => company.name,
  }), [vm.items.length, router, t, language, handleRemoveCompany, onAddCompaniesClick, onBulkActivateClick, handleBulkSuspendWithRefresh, handleBulkResumeWithRefresh, onBulkExtendClick]);

  return {
    vm,
    config,
    refreshItems,
  };
}

