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
import { useActionFormDialog, getActionFormFields } from "@/components/ui/action-form-dialog";

export function useCompanyViewModel() {
  const { companyService } = useServices();
  const { t, language } = useI18n();
  const { showActionForm, ActionFormDialog } = useActionFormDialog();

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
            showActionForm({
              title: t("action.activateCompany"),
              description: t("action.activateCompanyDesc"),
              fields: getActionFormFields(t, { reason: true, notes: false, emailLanguage: true, sendEmail: true }),
              variant: "default",
              confirmText: t("company.activate"),
              itemCount: selectedIds.length,
              onSubmit: async (values) => {
                await companyService.bulkActivate(
                  selectedIds,
                  values.reason as string,
                  values.sendEmailNotification as boolean,
                  (values.lang as string) || undefined
                );
                await vm.refreshItems();
              },
            });
          },
          variant: "default" as const,
          icon: CheckCircle2,
        },
        {
          label: t("company.deactivateSelected"),
          onClick: async (selectedIds: string[]) => {
            showActionForm({
              title: t("action.deactivateCompany"),
              description: t("action.deactivateCompanyDesc"),
              fields: getActionFormFields(t, { reason: true, notes: true, emailLanguage: true, sendEmail: true }),
              variant: "warning",
              confirmText: t("company.deactivate"),
              itemCount: selectedIds.length,
              onSubmit: async (values) => {
                await companyService.bulkDeactivate(
                  selectedIds,
                  values.reason as string,
                  values.notes as string,
                  values.sendEmailNotification as boolean,
                  (values.lang as string) || undefined
                );
                await vm.refreshItems();
              },
            });
          },
          variant: "outline" as const,
          icon: XCircle,
        },
        {
          label: t("company.deleteSelected"),
          onClick: async (selectedIds: string[]) => {
            showActionForm({
              title: t("action.deleteCompany"),
              description: t("action.deleteCompanyDesc"),
              fields: getActionFormFields(t, { reason: true, notes: false, emailLanguage: true, sendEmail: true }),
              variant: "destructive",
              confirmText: t("common.delete"),
              itemCount: selectedIds.length,
              onSubmit: async (values) => {
                await companyService.bulkDelete(
                  selectedIds,
                  values.reason as string,
                  values.sendEmailNotification as boolean,
                  (values.lang as string) || undefined
                );
                await vm.refreshItems();
              },
            });
          },
          variant: "destructive" as const,
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
            showActionForm({
              title: t("action.activateCompany"),
              description: t("company.activateSingleConfirmation"),
              fields: getActionFormFields(t, { reason: true, notes: false, emailLanguage: true, sendEmail: false }),
              variant: "default",
              confirmText: t("company.activate"),
              itemCount: 1,
              onSubmit: async (values) => {
                await companyService.activateCompany(
                  item.id,
                  values.reason as string,
                  (values.lang as string) || undefined
                );
                await vm.refreshItems();
              },
            });
          },
          variant: "ghost" as const,
          icon: CheckCircle2,
          show: (item: Company) => !item.isActive,
        },
        {
          label: t("company.deactivate"),
          onClick: async (item: Company) => {
            showActionForm({
              title: t("action.deactivateCompany"),
              description: t("company.deactivateSingleConfirmation"),
              fields: getActionFormFields(t, { reason: true, notes: true, emailLanguage: true, sendEmail: false }),
              variant: "warning",
              confirmText: t("company.deactivate"),
              itemCount: 1,
              onSubmit: async (values) => {
                await companyService.deactivateCompany(
                  item.id,
                  values.reason as string,
                  values.notes as string,
                  (values.lang as string) || undefined
                );
                await vm.refreshItems();
              },
            });
          },
          variant: "ghost" as const,
          icon: XCircle,
          show: (item: Company) => item.isActive === true,
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
    [t, companyService, vm, showActionForm]
  );

  const handleDelete = useCallback(
    async (company: Company) => {
      await companyService.deleteCompany(company.id);
      await vm.refreshItems();
    },
    [companyService, vm]
  );

  return { vm, config, handleDelete, ActionFormDialog };
}
