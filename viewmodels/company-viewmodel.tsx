"use client";

import React, { useCallback, useMemo } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from "@/domain";
import type { BulkAction } from "@/components/ui/generic-crud-view";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

export function useCompanyViewModel() {
  const { companyService } = useServices();
  const { t } = useI18n();

  const vm = useGenericCrudViewModel<
    Company,
    CreateCompanyRequest,
    UpdateCompanyRequest,
    { data: Company[]; pagination: any }
  >(
    {
      getData: companyService.getCompanies.bind(companyService),
      create: companyService.createCompany.bind(companyService),
      update: companyService.updateCompany.bind(companyService),
      delete: companyService.deleteCompany.bind(companyService),
    },
    {
      itemTypeName: t("company.item"),
      itemTypeNamePlural: t("company.items"),
      getItemDisplayName: (company: Company) => company.displayName,
      searchParamName: "search",
    }
  );

  const config = useMemo(
    () => ({
      titleKey: "company.title",
      subtitleKey: "company.description",
      columns: [
        {
          key: "name",
          label: t("company.name"),
          render: (_val: unknown, company: Company) => (
            <div>
              <div className="font-medium">{company.displayName}</div>
              <div className="text-sm text-muted-foreground">{company.contactInfo}</div>
            </div>
          ),
        },
        {
          key: "contactEmail",
          label: t("company.contactEmail"),
          render: (_val: unknown, company: Company) => (
            <span className="text-sm">{company.contactEmail || "-"}</span>
          ),
        },
        {
          key: "contactPhone",
          label: t("company.contactPhone"),
          render: (_val: unknown, company: Company) => (
            <span className="text-sm text-muted-foreground">{company.contactPhone || "-"}</span>
          ),
        },
        {
          key: "status",
          label: t("company.status.title"),
          render: (_val: unknown, company: Company) => {
            const variant = company.isActive ? "active" : "inactive";
            const label = company.isActive ? t("company.status.active") : t("company.status.suspended");
            return (
              <Badge variant={variant}>
                {label}
              </Badge>
            );
          },
        },
      ],
      createFields: [
        {
          name: "name",
          label: t("company.name"),
          type: "text" as const,
          placeholder: t("company.namePlaceholder"),
          required: true,
        },
        {
          name: "contactEmail",
          label: t("company.contactEmail"),
          type: "email" as const,
          placeholder: t("company.contactEmailPlaceholder"),
        },
        {
          name: "contactPhone",
          label: t("company.contactPhone"),
          type: "tel" as const,
          placeholder: t("company.contactPhonePlaceholder"),
        },
        {
          name: "address",
          label: t("company.address"),
          type: "textarea" as const,
          placeholder: t("company.addressPlaceholder"),
        },
      ],
      editFields: [
        {
          name: "name",
          label: t("company.name"),
          type: "text" as const,
          placeholder: t("company.namePlaceholder"),
          required: true,
        },
        {
          name: "contactEmail",
          label: t("company.contactEmail"),
          type: "email" as const,
          placeholder: t("company.contactEmailPlaceholder"),
        },
        {
          name: "contactPhone",
          label: t("company.contactPhone"),
          type: "tel" as const,
          placeholder: t("company.contactPhonePlaceholder"),
        },
        {
          name: "address",
          label: t("company.address"),
          type: "textarea" as const,
          placeholder: t("company.addressPlaceholder"),
        },
        { name: "id", type: "hidden" as const, required: true },
      ],
      createInitialValues: {},
      editInitialValues: (company: Company) => ({
        name: company.name,
        contactEmail: company.contactEmail,
        contactPhone: company.contactPhone,
        address: company.address,
        id: company.id,
      }),
      enableBulkActions: true,
      bulkActions: [
        {
          label: t("company.activateSelected"),
          onClick: async (selectedIds: string[]) => {
            await companyService.bulkActivate(selectedIds);
            await vm.refreshItems();
          },
          variant: "default" as const,
          icon: CheckCircle2,
          confirmTitle: t("company.confirmActivate"),
          confirmDescription: t("company.activateConfirmation").replace("{count}", "{count}"),
          requiresConfirmation: true,
        },
        {
          label: t("company.deactivateSelected"),
          onClick: async (selectedIds: string[]) => {
            await companyService.bulkDeactivate(selectedIds);
            await vm.refreshItems();
          },
          variant: "outline" as const,
          icon: XCircle,
          confirmTitle: t("company.confirmDeactivate"),
          confirmDescription: t("company.deactivateConfirmation").replace("{count}", "{count}"),
          requiresConfirmation: true,
        },
        {
          label: t("company.deleteSelected"),
          onClick: async (selectedIds: string[]) => {
            await companyService.bulkDelete(selectedIds);
            await vm.refreshItems();
          },
          variant: "destructive" as const,
          confirmTitle: t("common.confirmDelete"),
          confirmDescription: t("company.deleteSelectedConfirmation").replace("{count}", "{count}"),
          requiresConfirmation: true,
        },
      ] as BulkAction[],
      getActions: (vm: any, t: any, handleDelete?: (item: Company) => void) => [
        {
          label: t("common.view"),
          onClick: (item: Company) => vm.openViewModal(item),
          variant: "ghost" as const,
        },
        {
          label: t("common.edit"),
          onClick: (item: Company) => vm.openEditModal(item),
          variant: "ghost" as const,
        },
        {
          label: t("company.activate"),
          onClick: async (item: Company) => {
            await companyService.activateCompany(item.id);
            await vm.refreshItems();
          },
          variant: "ghost" as const,
          icon: CheckCircle2,
          show: (item: Company) => !item.isActive,
          confirmTitle: t("company.confirmActivate"),
          confirmDescription: t("company.activateSingleConfirmation"),
          requiresConfirmation: true,
        },
        {
          label: t("company.deactivate"),
          onClick: async (item: Company) => {
            await companyService.deactivateCompany(item.id);
            await vm.refreshItems();
          },
          variant: "ghost" as const,
          icon: XCircle,
          show: (item: Company) => item.isActive === true,
          confirmTitle: t("company.confirmDeactivate"),
          confirmDescription: t("company.deactivateSingleConfirmation"),
          requiresConfirmation: true,
        },
        {
          label: t("common.delete"),
          onClick: (item: Company) => handleDelete?.(item),
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700",
          confirmTitle: t("common.confirmDelete"),
          confirmDescription: t("common.deleteConfirmation", { name: "{name}" }),
          requiresConfirmation: true,
        },
      ],
    }),
    [t, companyService, vm]
  );

  const handleDelete = useCallback(
    async (company: Company) => {
      await companyService.deleteCompany(company.id);
      await vm.refreshItems();
    },
    [companyService, vm]
  );

  return { vm, config, handleDelete };
}
