"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import { useLicensingViewModel } from "@/viewmodels/licensing-viewmodel";
import type {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from "@/domain";
import type { CrudConfig } from "@/components/ui/generic-crud-view";
import { Badge } from "@/components/ui/badge";

export function useCompanyViewModel() {
  const { companyService } = useServices();
  const { t } = useI18n();
  const licensingVm = useLicensingViewModel();
  
  // Licensing modal states
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [licenseKeyModalOpen, setLicenseKeyModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleDelete = useCallback(async (company: Company) => {
    await companyService.deleteCompany(company.id);
    await vm.refreshItems();
  }, [companyService, vm]);

  const handleToggleActive = useCallback(async (company: Company) => {
    await companyService.toggleActive(company.id, !company.isActive);
    await vm.refreshItems();
  }, [companyService, vm]);

  const handleActivate = useCallback(async (expiryDate: string) => {
    if (!selectedCompany) return;
    const success = await licensingVm.activateCompany(selectedCompany.id, expiryDate);
    if (success) {
      setActivateModalOpen(false);
      setSelectedCompany(null);
      await vm.refreshItems();
    }
  }, [selectedCompany, licensingVm, vm]);

  const handleExtend = useCallback(async (newExpiryDate: string) => {
    if (!selectedCompany) return;
    const success = await licensingVm.extendCompany(selectedCompany.id, newExpiryDate);
    if (success) {
      setExtendModalOpen(false);
      setSelectedCompany(null);
      await vm.refreshItems();
    }
  }, [selectedCompany, licensingVm, vm]);

  const config: CrudConfig<Company> = useMemo(
    () => ({
      titleKey: "company.title",
      subtitleKey: "company.description",
      columns: [
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
            const variant = status === "Active" ? "active" : status === "Expired" ? "destructive" : "secondary";
            return (
              <Badge variant={variant}>
                {t(`company.status.${status.toLowerCase().replace(" ", "")}`)}
              </Badge>
            );
          },
        },
        {
          key: "expiryDate",
          label: t("company.expiryDate"),
          render: (_val: unknown, company: Company) => (
            <span className="text-sm">
              {company.expiryDate ? new Date(company.expiryDate).toLocaleDateString() : "-"}
            </span>
          ),
        },
        {
          key: "contactEmail",
          label: t("company.contactEmail"),
          render: (_val: unknown, company: Company) => (
            <span className="text-sm text-muted-foreground">
              {company.contactEmail || "-"}
            </span>
          ),
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
          name: "expiryDate",
          label: t("company.expiryDate"),
          type: "date" as const,
          placeholder: t("company.expiryDatePlaceholder"),
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
          type: "text" as const,
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
          name: "expiryDate",
          label: t("company.expiryDate"),
          type: "date" as const,
          placeholder: t("company.expiryDatePlaceholder"),
        },
        {
          name: "isActive",
          label: t("company.isActive"),
          type: "checkbox" as const,
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
          type: "text" as const,
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
        expiryDate: company.expiryDate ? company.expiryDate.split('T')[0] : "",
        isActive: company.isActive,
        contactEmail: company.contactEmail || "",
        contactPhone: company.contactPhone || "",
        address: company.address || "",
        id: company.id,
      }),
      getActions: (vm: any, t: any, handleDelete) => {
        const actions: any[] = [
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
        ];

        // Add licensing actions based on company status
        const status = (item: Company) => item.status;
        actions.push(
          {
            label: t("licensing.activate"),
            onClick: (item: Company) => {
              setSelectedCompany(item);
              setActivateModalOpen(true);
            },
            variant: "ghost" as const,
            show: (item: Company) => status(item) !== "Active",
            className: "text-green-600 hover:text-green-700",
          },
          {
            label: t("licensing.suspend"),
            onClick: async (item: Company) => {
              const success = await licensingVm.suspendCompany(item.id);
              if (success) {
                await vm.refreshItems();
              }
            },
            variant: "ghost" as const,
            show: (item: Company) => status(item) === "Active",
            className: "text-orange-600 hover:text-orange-700",
            confirmTitle: t("licensing.suspend"),
            confirmDescription: t("licensing.confirmSuspend", { name: "{name}" }),
          },
          {
            label: t("licensing.resume"),
            onClick: async (item: Company) => {
              const success = await licensingVm.resumeCompany(item.id);
              if (success) {
                await vm.refreshItems();
              }
            },
            variant: "ghost" as const,
            show: (item: Company) => status(item) === "Suspended",
            className: "text-blue-600 hover:text-blue-700",
            confirmTitle: t("licensing.resume"),
            confirmDescription: t("licensing.confirmResume", { name: "{name}" }),
          },
          {
            label: t("licensing.extend"),
            onClick: (item: Company) => {
              setSelectedCompany(item);
              setExtendModalOpen(true);
            },
            variant: "ghost" as const,
            show: (item: Company) => status(item) === "Active" || status(item) === "Expired",
          },
          {
            label: t("licensing.generateKey"),
            onClick: async (item: Company) => {
              const key = await licensingVm.generateLicenseKey(item.id);
              if (key) {
                setLicenseKey(key);
                setSelectedCompany(item);
                setLicenseKeyModalOpen(true);
                await vm.refreshItems();
              }
            },
            variant: "ghost" as const,
            className: "text-purple-600 hover:text-purple-700",
          },
          {
            label: t("common.makeInactive"),
            onClick: async (item: Company) => {
              await companyService.toggleActive(item.id, false);
              await vm.refreshItems();
            },
            variant: "ghost" as const,
            className: "text-orange-600 hover:text-orange-700",
            show: (item: Company) => item.isActive === true,
            confirmTitle: t("common.makeInactive"),
            confirmDescription: t("common.confirmMakeInactive", { name: "{name}" }),
          },
          {
            label: t("common.makeActive"),
            onClick: async (item: Company) => {
              await companyService.toggleActive(item.id, true);
              await vm.refreshItems();
            },
            variant: "ghost" as const,
            className: "text-green-600 hover:text-green-700",
            show: (item: Company) => item.isActive !== true,
            confirmTitle: t("common.makeActive"),
            confirmDescription: t("common.confirmMakeActive", { name: "{name}" }),
          },
          {
            label: t("common.delete"),
            onClick: (item: Company) => handleDelete?.(item),
            variant: "ghost" as const,
            className: "text-red-600 hover:text-red-700",
            confirmTitle: t("common.confirmDelete"),
            confirmDescription: t("common.deleteConfirmation", { name: "{name}" }),
          }
        );

        return actions;
      },
    }),
    [t, setActivateModalOpen, setExtendModalOpen, setLicenseKeyModalOpen, setSelectedCompany, setLicenseKey, licensingVm, vm, handleDelete, companyService]
  );

  const handleCopyLicenseKey = useCallback(async () => {
    if (licenseKey) {
      await navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [licenseKey]);

  return { 
    vm, 
    config, 
    handleDelete,
    handleToggleActive,
    // Licensing modals
    activateModalOpen,
    setActivateModalOpen,
    extendModalOpen,
    setExtendModalOpen,
    licenseKeyModalOpen,
    setLicenseKeyModalOpen,
    selectedCompany,
    setSelectedCompany,
    licenseKey,
    handleActivate,
    handleExtend,
    handleCopyLicenseKey,
    copied,
    licensingLoading: licensingVm.loading,
  };
}

