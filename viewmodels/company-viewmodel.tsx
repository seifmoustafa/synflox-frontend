"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { companyService, subscriptionPlanService } = useServices();
  const { t } = useI18n();
  const licensingVm = useLicensingViewModel();
  const [subscriptionPlanOptions, setSubscriptionPlanOptions] = useState<Array<{value: string, label: string}>>([]);
  
  // Licensing modal states
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [licenseKeyModalOpen, setLicenseKeyModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Date picker modal states for bulk operations
  const [datePickerModalOpen, setDatePickerModalOpen] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState<{
    action: 'activate' | 'extend';
    selectedIds: string[];
  } | null>(null);
  
  // Export modal states
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [exporting, setExporting] = useState(false);
  
  // Track loading state per action per company
  const [actionLoading, setActionLoading] = useState<Record<string, Set<string>>>({});
  
  const setActionLoadingState = useCallback((action: string, companyId: string, loading: boolean) => {
    setActionLoading(prev => {
      const newState = { ...prev };
      if (!newState[action]) {
        newState[action] = new Set();
      }
      if (loading) {
        newState[action].add(companyId);
      } else {
        newState[action].delete(companyId);
      }
      return newState;
    });
  }, []);
  
  const isActionLoading = useCallback((action: string, companyId: string) => {
    return actionLoading[action]?.has(companyId) || false;
  }, [actionLoading]);

  // Load subscription plans for dropdown
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await subscriptionPlanService.getPlans({ pageSize: 100, isActive: true });
        setSubscriptionPlanOptions(
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
            <div className="flex items-center gap-2">
              <div className="font-medium">{company.name}</div>
              {company.isTrial && (
                <Badge variant="secondary" className="text-xs">
                  {t("company.trialBadge")}
                </Badge>
              )}
            </div>
          ),
        },
        {
          key: "status",
          label: t("company.status.title"),
          render: (_val: unknown, company: Company) => {
            const status = company.status;
            // Normalize status for comparison (case-insensitive)
            const statusLower = status?.toLowerCase() || "";
            const variant = statusLower === "active" ? "active" : statusLower === "expired" ? "destructive" : "secondary";
            return (
              <Badge variant={variant}>
                {t(`company.status.${statusLower.replace(/\s+/g, "")}`)}
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
        {
          name: "subscriptionPlanId",
          label: t("company.subscriptionPlan"),
          type: "select" as const,
          placeholder: t("company.subscriptionPlanPlaceholder"),
          options: subscriptionPlanOptions,
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
        {
          name: "subscriptionPlanId",
          label: t("company.subscriptionPlan"),
          type: "select" as const,
          placeholder: t("company.subscriptionPlanPlaceholder"),
          options: subscriptionPlanOptions,
        },
      ],
      createInitialValues: {},
      editInitialValues: (company: Company) => ({
        name: company.name,
        expiryDate: company.expiryDate ? company.expiryDate.split('T')[0] : "",
        isActive: company.isActive,
        contactEmail: company.contactEmail || "",
        contactPhone: company.contactPhone || "",
        address: company.address || "",
        subscriptionPlanId: company.subscriptionPlanId || "",
        id: company.id,
      }),
      getActions: (vm: any, t: any, handleDelete) => {
        const actions: any[] = [
          {
            label: t("common.view"),
            onClick: (item: Company) => router.push(`/companies/${item.id}`),
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
            show: (item: Company) => status(item)?.toLowerCase() !== "active",
            className: "text-green-600 hover:text-green-700",
          },
          {
            label: t("licensing.suspend"),
            onClick: async (item: Company) => {
              setActionLoadingState("suspend", item.id, true);
              try {
                const success = await licensingVm.suspendCompany(item.id);
                if (success) {
                  await vm.refreshItems();
                }
              } finally {
                setActionLoadingState("suspend", item.id, false);
              }
            },
            variant: "ghost" as const,
            show: (item: Company) => status(item)?.toLowerCase() === "active",
            className: "text-orange-600 hover:text-orange-700",
            confirmTitle: t("licensing.suspend"),
            confirmDescription: t("licensing.confirmSuspend", { name: "{name}" }),
            confirmationVariant: "warning", // Use warning variant for suspend
            loading: (item: Company) => isActionLoading("suspend", item.id),
          },
          {
            label: t("licensing.resume"),
            onClick: async (item: Company) => {
              setActionLoadingState("resume", item.id, true);
              try {
                const success = await licensingVm.resumeCompany(item.id);
                if (success) {
                  await vm.refreshItems();
                }
              } finally {
                setActionLoadingState("resume", item.id, false);
              }
            },
            variant: "ghost" as const,
            show: (item: Company) => status(item)?.toLowerCase() === "suspended",
            className: "text-blue-600 hover:text-blue-700",
            confirmTitle: t("licensing.resume"),
            confirmDescription: t("licensing.confirmResume", { name: "{name}" }),
            confirmationVariant: "info", // Use info variant for resume
            loading: (item: Company) => isActionLoading("resume", item.id),
          },
          {
            label: t("licensing.extend"),
            onClick: (item: Company) => {
              setSelectedCompany(item);
              setExtendModalOpen(true);
            },
            variant: "ghost" as const,
            show: (item: Company) => {
              const itemStatus = status(item)?.toLowerCase();
              return itemStatus === "active" || itemStatus === "expired";
            },
          },
          {
            label: t("licensing.generateKey"),
            onClick: async (item: Company) => {
              setActionLoadingState("generateKey", item.id, true);
              try {
                const key = await licensingVm.generateLicenseKey(item.id);
                if (key) {
                  setLicenseKey(key);
                  setSelectedCompany(item);
                  setLicenseKeyModalOpen(true);
                  await vm.refreshItems();
                }
              } finally {
                setActionLoadingState("generateKey", item.id, false);
              }
            },
            variant: "ghost" as const,
            className: "text-purple-600 hover:text-purple-700",
            loading: (item: Company) => isActionLoading("generateKey", item.id),
          },
          // {
          //   label: t("common.makeInactive"),
          //   onClick: async (item: Company) => {
          //     await companyService.toggleActive(item.id, false);
          //     await vm.refreshItems();
          //   },
          //   variant: "ghost" as const,
          //   className: "text-orange-600 hover:text-orange-700",
          //   show: (item: Company) => item.isActive === true,
          //   confirmTitle: t("common.makeInactive"),
          //   confirmDescription: t("common.confirmMakeInactive", { name: "{name}" }),
          //   confirmationVariant: "warning", // Use warning variant for make inactive
          // },
          // {
          //   label: t("common.makeActive"),
          //   onClick: async (item: Company) => {
          //     await companyService.toggleActive(item.id, true);
          //     await vm.refreshItems();
          //   },
          //   variant: "ghost" as const,
          //   className: "text-green-600 hover:text-green-700",
          //   show: (item: Company) => item.isActive !== true,
          //   confirmTitle: t("common.makeActive"),
          //   confirmDescription: t("common.confirmMakeActive", { name: "{name}" }),
          //   confirmationVariant: "info", // Use info variant for make active
          // },
          {
            label: t("common.delete"),
            onClick: (item: Company) => handleDelete?.(item),
            variant: "ghost" as const,
            className: "text-red-600 hover:text-red-700",
            confirmTitle: t("common.confirmDelete"),
            confirmDescription: t("common.deleteConfirmation", { name: "{name}" }),
            isDeleteAction: true, // Use delete confirmation dialog
          }
        );

        return actions;
      },
      enableBulkActions: true,
      bulkActions: [
        {
          label: t("licensing.bulkActivate"),
          onClick: async (selectedIds: string[]) => {
            setPendingBulkAction({ action: 'activate', selectedIds });
            setDatePickerModalOpen(true);
          },
          confirmTitle: t("licensing.bulkActivate"),
          confirmDescription: t("licensing.confirmBulkActivate", { count: "{count}" }),
          variant: "default" as const,
        },
        {
          label: t("licensing.bulkSuspend"),
          onClick: async (selectedIds: string[]) => {
            const result = await licensingVm.bulkSuspend(selectedIds);
            if (result) {
              await vm.refreshItems();
            }
          },
          confirmTitle: t("licensing.bulkSuspend"),
          confirmDescription: t("licensing.confirmBulkSuspend", { count: "{count}" }),
          variant: "default" as const,
        },
        {
          label: t("licensing.bulkResume"),
          onClick: async (selectedIds: string[]) => {
            const result = await licensingVm.bulkResume(selectedIds);
            if (result) {
              await vm.refreshItems();
            }
          },
          confirmTitle: t("licensing.bulkResume"),
          confirmDescription: t("licensing.confirmBulkResume", { count: "{count}" }),
          variant: "default" as const,
        },
        {
          label: t("licensing.bulkExtend"),
          onClick: async (selectedIds: string[]) => {
            setPendingBulkAction({ action: 'extend', selectedIds });
            setDatePickerModalOpen(true);
          },
          confirmTitle: t("licensing.bulkExtend"),
          confirmDescription: t("licensing.confirmBulkExtend", { count: "{count}" }),
          variant: "default" as const,
        },
      ],
      customActions: [
        {
          label: t("company.export"),
          onClick: async () => {
            setExportModalOpen(true);
          },
          variant: "outline" as const,
        },
        {
          label: t("company.import"),
          onClick: async () => {
            // Import dialog will be handled in the view component
            // For now, just show a file input
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv,.xlsx,.xls';
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                // Determine format from file extension
                const format: 'xlsx' | 'csv' = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ? 'xlsx' : 'csv';
                try {
                  await companyService.importCompanies(file, format);
                  await vm.refreshItems();
                } catch (error) {
                  // Error already shown by service
                }
              }
            };
            input.click();
          },
          variant: "outline" as const,
        },
      ],
    }),
    [t, setActivateModalOpen, setExtendModalOpen, setLicenseKeyModalOpen, setSelectedCompany, setLicenseKey, licensingVm, vm, handleDelete, companyService, subscriptionPlanOptions, setExportModalOpen]
  );

  const handleCopyLicenseKey = useCallback(async () => {
    if (licenseKey) {
      await navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [licenseKey]);

  const handleDatePickerConfirm = useCallback(async (date: string) => {
    if (!pendingBulkAction) return;
    
    const { action, selectedIds } = pendingBulkAction;
    
    if (action === 'activate') {
      const result = await licensingVm.bulkActivate(selectedIds, date);
      if (result) {
        await vm.refreshItems();
      }
    } else if (action === 'extend') {
      const result = await licensingVm.bulkExtend(selectedIds, date);
      if (result) {
        await vm.refreshItems();
      }
    }
    
    setPendingBulkAction(null);
  }, [pendingBulkAction, licensingVm, vm]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      await companyService.exportCompanies(exportFormat);
      setExportModalOpen(false);
      setExportFormat('xlsx'); // Reset to default
    } catch (e) {
      // Error already shown by service
    } finally {
      setExporting(false);
    }
  }, [exportFormat, companyService]);

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
    // Date picker modal
    datePickerModalOpen,
    setDatePickerModalOpen,
    handleDatePickerConfirm,
    // Export modal
    exportModalOpen,
    setExportModalOpen,
    exportFormat,
    setExportFormat,
    exporting,
    handleExport,
  };
}

