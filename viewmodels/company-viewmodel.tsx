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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import GenericSelect from "@/components/ui/generic-select";
import { Copy, Check, Calendar, Key, Download, Loader2 } from "lucide-react";

export function useCompanyViewModel() {
  const router = useRouter();
  const { companyService, subscriptionPlanService } = useServices();
  const { t } = useI18n();
  const licensingVm = useLicensingViewModel();
  const [subscriptionPlanOptions, setSubscriptionPlanOptions] = useState<Array<{value: string, label: string}>>([]);
  
  // Licensing state (for license key modal)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  
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
            variant: "ghost" as const,
            show: (item: Company) => status(item)?.toLowerCase() !== "active",
            className: "text-green-600 hover:text-green-700",
            modal: {
              title: (item?: Company) => t("licensing.activate"),
              description: (item?: Company) => item ? t("company.activateDescription").replace("{{name}}", item.name) : "",
              size: "md",
              content: (item?: Company, context?: any, onClose?: () => void) => {
                // Use closure to access viewmodel state
                const ActivateModalContent = () => {
                  const [expiryDate, setExpiryDate] = useState("");
                  const [submitting, setSubmitting] = useState(false);
                  
                  const handleSubmit = async (e: React.FormEvent) => {
                    e.preventDefault();
                    if (!expiryDate || !item) return;
                    setSubmitting(true);
                    try {
                      const success = await licensingVm.activateCompany(item!.id, new Date(expiryDate).toISOString());
                      if (success) {
                        onClose?.();
                        await vm.refreshItems();
                      }
                    } finally {
                      setSubmitting(false);
                    }
                  };

                  return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="activateExpiryDate">{t("company.expiryDate")}</Label>
                        <DatePicker
                          id="activateExpiryDate"
                          value={expiryDate}
                          onChange={setExpiryDate}
                          placeholder={t("company.expiryDatePlaceholder")}
                          required
                          type="date"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onClose}
                          disabled={submitting}
                        >
                          {t("common.cancel")}
                        </Button>
                        <Button
                          type="submit"
                          disabled={licensingVm.loading || !expiryDate || submitting}
                        >
                          {submitting || licensingVm.loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {t("common.loading")}
                            </>
                          ) : (
                            <>
                              <Calendar className="w-4 h-4 mr-2" />
                              {t("licensing.activate")}
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  );
                };
                return <ActivateModalContent />;
              },
              refreshAfterModal: true,
            },
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
            variant: "ghost" as const,
            show: (item: Company) => {
              const itemStatus = status(item)?.toLowerCase();
              return itemStatus === "active" || itemStatus === "expired";
            },
            modal: {
              title: (item?: Company) => t("licensing.extend"),
              description: (item?: Company) => item ? t("company.extendDescription").replace("{{name}}", item.name) : "",
              size: "md",
              content: (item?: Company, context?: any, onClose?: () => void) => {
                const ExtendModalContent = () => {
                  const [expiryDate, setExpiryDate] = useState("");
                  const [submitting, setSubmitting] = useState(false);
                  
                  const handleSubmit = async (e: React.FormEvent) => {
                    e.preventDefault();
                    if (!expiryDate || !item) return;
                    setSubmitting(true);
                    try {
                      const success = await licensingVm.extendCompany(item!.id, new Date(expiryDate).toISOString());
                      if (success) {
                        onClose?.();
                        await vm.refreshItems();
                      }
                    } finally {
                      setSubmitting(false);
                    }
                  };

                  return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="extendExpiryDate">{t("company.newExpiryDate")}</Label>
                        <DatePicker
                          id="extendExpiryDate"
                          value={expiryDate}
                          onChange={setExpiryDate}
                          placeholder={t("company.expiryDatePlaceholder")}
                          required
                          type="date"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onClose}
                          disabled={submitting}
                        >
                          {t("common.cancel")}
                        </Button>
                        <Button
                          type="submit"
                          disabled={licensingVm.loading || !expiryDate || submitting}
                        >
                          {submitting || licensingVm.loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {t("common.loading")}
                            </>
                          ) : (
                            <>
                              <Calendar className="w-4 h-4 mr-2" />
                              {t("licensing.extend")}
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  );
                };
                return <ExtendModalContent />;
              },
              refreshAfterModal: true,
            },
          },
          {
            label: t("licensing.generateKey"),
            variant: "ghost" as const,
            className: "text-purple-600 hover:text-purple-700",
            loading: (item: Company) => isActionLoading("generateKey", item.id),
            onClick: async (item: Company) => {
              setActionLoadingState("generateKey", item.id, true);
              try {
                const key = await licensingVm.generateLicenseKey(item.id);
                if (key) {
                  setLicenseKey(key);
                  setSelectedCompany(item);
                  // Show license key modal
                  // Note: This will be handled by a separate modal trigger
                }
                await vm.refreshItems();
              } finally {
                setActionLoadingState("generateKey", item.id, false);
              }
            },
            modal: {
              title: t("licensing.viewKey"),
              description: (item?: Company) => item ? t("company.licenseKeyDescription").replace("{{name}}", item.name) : "",
              size: "md",
              content: (item?: Company, context?: any, onClose?: () => void) => {
                const LicenseKeyModalContent = () => {
                  const [copiedState, setCopiedState] = useState(false);
                  const currentKey = licenseKey || item?.licenseKey || "";
                  
                  const handleCopy = async () => {
                    if (currentKey) {
                      await navigator.clipboard.writeText(currentKey);
                      setCopiedState(true);
                      setTimeout(() => setCopiedState(false), 2000);
                    }
                  };

                  return (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t("company.licenseKey")}</Label>
                        <div className="flex gap-2">
                          <Input
                            value={currentKey}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleCopy}
                            title={t("common.copy")}
                          >
                            {copiedState ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        {copiedState && (
                          <p className="text-sm text-green-600">{t("common.copied")}</p>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={onClose}>
                          {t("common.close")}
                        </Button>
                      </div>
                    </div>
                  );
                };
                return <LicenseKeyModalContent />;
              },
              refreshAfterModal: false,
            },
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
          confirmTitle: t("licensing.bulkActivate"),
          confirmDescription: t("licensing.confirmBulkActivate", { count: "{count}" }),
          variant: "default" as const,
          onClick: async (selectedIds: string[]) => {
            // Modal will be opened by GenericCrudView
          },
          modal: {
            title: (item?: any, context?: { selectedIds: string[]; count: number }) => t("licensing.bulkActivate"),
            description: (item?: any, context?: { selectedIds: string[]; count: number }) => t("datePickerModal.selectDate"),
            size: "md",
            content: (item?: any, context?: { selectedIds: string[]; count: number }, onClose?: () => void) => {
              const BulkActivateModalContent = () => {
                const [expiryDate, setExpiryDate] = useState("");
                const [submitting, setSubmitting] = useState(false);
                
                const handleSubmit = async (e: React.FormEvent) => {
                  e.preventDefault();
                  if (!expiryDate || !context?.selectedIds?.length) return;
                  setSubmitting(true);
                  try {
                    const result = await licensingVm.bulkActivate(context?.selectedIds || [], expiryDate);
                    if (result) {
                      onClose?.();
                      await vm.refreshItems();
                    }
                  } finally {
                    setSubmitting(false);
                  }
                };

                return (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("company.expiryDate")}</Label>
                      <DatePicker
                        value={expiryDate}
                        onChange={setExpiryDate}
                        placeholder={t("company.expiryDatePlaceholder")}
                        required
                        type="date"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={submitting}
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        type="submit"
                        disabled={!expiryDate || submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t("common.loading")}
                          </>
                        ) : (
                          t("licensing.bulkActivate")
                        )}
                      </Button>
                    </div>
                  </form>
                );
              };
              return <BulkActivateModalContent />;
            },
            refreshAfterModal: true,
          },
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
          confirmTitle: t("licensing.bulkExtend"),
          confirmDescription: t("licensing.confirmBulkExtend", { count: "{count}" }),
          variant: "default" as const,
          onClick: async (selectedIds: string[]) => {
            // Modal will be opened by GenericCrudView
          },
          modal: {
            title: (item?: any, context?: { selectedIds: string[]; count: number }) => t("licensing.bulkExtend"),
            description: (item?: any, context?: { selectedIds: string[]; count: number }) => t("datePickerModal.selectDate"),
            size: "md",
            content: (item?: any, context?: { selectedIds: string[]; count: number }, onClose?: () => void) => {
              const BulkExtendModalContent = () => {
                const [expiryDate, setExpiryDate] = useState("");
                const [submitting, setSubmitting] = useState(false);
                
                const handleSubmit = async (e: React.FormEvent) => {
                  e.preventDefault();
                  if (!expiryDate || !context?.selectedIds?.length) return;
                  setSubmitting(true);
                  try {
                    const result = await licensingVm.bulkExtend(context?.selectedIds || [], expiryDate);
                    if (result) {
                      onClose?.();
                      await vm.refreshItems();
                    }
                  } finally {
                    setSubmitting(false);
                  }
                };

                return (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("company.newExpiryDate")}</Label>
                      <DatePicker
                        value={expiryDate}
                        onChange={setExpiryDate}
                        placeholder={t("company.expiryDatePlaceholder")}
                        required
                        type="date"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={submitting}
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        type="submit"
                        disabled={!expiryDate || submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t("common.loading")}
                          </>
                        ) : (
                          t("licensing.bulkExtend")
                        )}
                      </Button>
                    </div>
                  </form>
                );
              };
              return <BulkExtendModalContent />;
            },
            refreshAfterModal: true,
          },
        },
      ],
      customActions: [
        {
          label: t("company.export"),
          variant: "outline" as const,
          onClick: async () => {
            // Modal will be opened by GenericCrudView
          },
          modal: {
            title: t("company.export"),
            description: t("company.exportDescription"),
            size: "md",
            content: (item?: any, context?: any, onClose?: () => void) => {
              const ExportModalContent = () => {
                const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
                const [isExporting, setIsExporting] = useState(false);
                const [exportStatus, setExportStatus] = useState<'idle' | 'creating' | 'downloading' | 'success'>('idle');
                
                const handleExport = async () => {
                  setIsExporting(true);
                  setExportStatus('creating');
                  
                  try {
                    await companyService.exportCompanies(format);
                    setExportStatus('success');
                    // Close modal after a short delay to show success
                    setTimeout(() => {
                      onClose?.();
                    }, 1500);
                  } catch (error) {
                    // Error already shown by service
                    setExportStatus('idle');
                    // Don't close modal on error so user can try again
                  } finally {
                    setIsExporting(false);
                  }
                };

                return (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("company.exportFormat")}</Label>
                      <GenericSelect
                        options={[
                          { value: 'xlsx', label: t("company.exportFormatXlsx") },
                          { value: 'csv', label: t("company.exportFormatCsv") },
                        ]}
                        value={format}
                        onValueChange={(value: string | string[]) => {
                          setFormat((Array.isArray(value) ? value[0] : value) as 'xlsx' | 'csv');
                        }}
                        placeholder={t("company.exportFormatPlaceholder")}
                        disabled={isExporting}
                      />
                    </div>
                    
                    {/* Export Status Messages */}
                    {exportStatus === 'creating' && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t("company.exportCreating")}</span>
                      </div>
                    )}
                    
                    {exportStatus === 'success' && (
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <Check className="w-4 h-4" />
                        <span>{t("company.exportSuccess")}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isExporting}
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        onClick={handleExport}
                        disabled={isExporting || exportStatus === 'success'}
                        isLoading={isExporting}
                      >
                        {exportStatus === 'success' ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            {t("company.exportCompleted")}
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            {t("company.export")}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              };
              return <ExportModalContent />;
            },
            refreshAfterModal: false,
          },
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
    [t, setSelectedCompany, setLicenseKey, licensingVm, vm, handleDelete, companyService, subscriptionPlanOptions, licenseKey]
  );



  return { 
    vm, 
    config, 
    handleDelete,
    handleToggleActive,
  };
}

