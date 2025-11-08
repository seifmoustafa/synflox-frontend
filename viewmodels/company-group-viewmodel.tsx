"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type {
  CompanyGroup,
  CreateCompanyGroupRequest,
  UpdateCompanyGroupRequest,
} from "@/domain";
import type { CrudConfig } from "@/components/ui/generic-crud-view";
import { Badge } from "@/components/ui/badge";

export function useCompanyGroupViewModel() {
  const router = useRouter();
  const { companyGroupService } = useServices();
  const { t } = useI18n();
  const [manageCompaniesOpen, setManageCompaniesOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<CompanyGroup | null>(null);

  const vm = useGenericCrudViewModel<
    CompanyGroup,
    CreateCompanyGroupRequest,
    UpdateCompanyGroupRequest,
    { data: CompanyGroup[]; pagination: any }
  >(
    {
      getData: companyGroupService.getGroups.bind(companyGroupService),
      create: companyGroupService.createGroup.bind(companyGroupService),
      update: companyGroupService.updateGroup.bind(companyGroupService),
      delete: companyGroupService.deleteGroup.bind(companyGroupService),
    },
    {
      itemTypeName: t("companyGroup.item"),
      itemTypeNamePlural: t("companyGroup.items"),
      getItemDisplayName: (group: CompanyGroup) => group.displayName,
      searchParamName: "search",
    }
  );

  const handleDelete = useCallback(async (group: CompanyGroup) => {
    await companyGroupService.deleteGroup(group.id);
    await vm.refreshItems();
  }, [companyGroupService, vm]);

  const config: CrudConfig<CompanyGroup> = useMemo(
    () => ({
      titleKey: "companyGroup.title",
      subtitleKey: "companyGroup.description",
      columns: [
        {
          key: "name",
          label: t("companyGroup.name"),
          render: (_val: unknown, group: CompanyGroup) => (
            <div className="font-medium">{group.name}</div>
          ),
        },
        {
          key: "description",
          label: t("companyGroup.description"),
          render: (_val: unknown, group: CompanyGroup) => (
            <span className="text-sm text-muted-foreground">
              {group.description || "-"}
            </span>
          ),
        },
        {
          key: "companyCount",
          label: t("companyGroup.companyCount"),
          render: (_val: unknown, group: CompanyGroup) => (
            <Badge variant="secondary">
              {group.companyCount ?? 0} {t("company.items")}
            </Badge>
          ),
        },
        {
          key: "isActive",
          label: t("companyGroup.status"),
          render: (_val: unknown, group: CompanyGroup) => (
            <Badge variant={group.isActive ? "active" : "secondary"}>
              {group.isActive ? t("common.active") : t("common.inactive")}
            </Badge>
          ),
        },
      ],
      createFields: [
        {
          name: "name",
          label: t("companyGroup.name"),
          type: "text" as const,
          placeholder: t("companyGroup.namePlaceholder"),
          required: true,
        },
        {
          name: "description",
          label: t("companyGroup.description"),
          type: "textarea" as const,
          placeholder: t("companyGroup.descriptionPlaceholder"),
        },
        {
          name: "isActive",
          label: t("companyGroup.isActive"),
          type: "checkbox" as const,
        },
      ],
      editFields: [
        {
          name: "name",
          label: t("companyGroup.name"),
          type: "text" as const,
          placeholder: t("companyGroup.namePlaceholder"),
          required: true,
        },
        {
          name: "description",
          label: t("companyGroup.description"),
          type: "textarea" as const,
          placeholder: t("companyGroup.descriptionPlaceholder"),
        },
        {
          name: "isActive",
          label: t("companyGroup.isActive"),
          type: "checkbox" as const,
        },
        { name: "id", type: "hidden" as const, required: true },
      ],
      createInitialValues: {
        isActive: true,
      },
      editInitialValues: (group: CompanyGroup) => ({
        name: group.name,
        description: group.description || "",
        isActive: group.isActive,
        id: group.id,
      }),
      getActions: (vm: any, t: any, handleDelete) => {
        return [
          {
            label: t("common.view"),
            onClick: (item: CompanyGroup) => router.push(`/company-groups/${item.id}`),
            variant: "ghost" as const,
          },
          {
            label: t("common.edit"),
            onClick: (item: CompanyGroup) => vm.openEditModal(item),
            variant: "ghost" as const,
          },
          {
            label: t("companyGroup.manageCompanies"),
            onClick: (item: CompanyGroup) => {
              setSelectedGroup(item);
              setManageCompaniesOpen(true);
            },
            variant: "ghost" as const,
          },
          {
            label: t("common.delete"),
            onClick: (item: CompanyGroup) => handleDelete?.(item),
            variant: "ghost" as const,
            className: "text-red-600 hover:text-red-700",
            confirmTitle: t("common.confirmDelete"),
            confirmDescription: t("common.deleteConfirmation", { itemType: t("companyGroup.item") }),
            isDeleteAction: true,
          },
        ];
      },
      enableBulkActions: true,
      bulkActions: [
        {
          label: t("licensing.bulkActivate"),
          onClick: async (selectedIds: string[]) => {
            // For groups, we need to get companies first, then activate
            // This is a simplified version - in real implementation, would need to handle multiple groups
            if (selectedIds.length === 1) {
              const expiryDate = prompt(t("company.expiryDate") + " (YYYY-MM-DD):");
              if (expiryDate) {
                await companyGroupService.bulkActivateGroup(selectedIds[0], new Date(expiryDate).toISOString());
                await vm.refreshItems();
              }
            }
          },
          confirmTitle: t("licensing.bulkActivate"),
          confirmDescription: t("licensing.confirmBulkActivate", { count: "{count}" }),
          variant: "default" as const,
        },
        {
          label: t("licensing.bulkSuspend"),
          onClick: async (selectedIds: string[]) => {
            if (selectedIds.length === 1) {
              await companyGroupService.bulkSuspendGroup(selectedIds[0]);
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
            if (selectedIds.length === 1) {
              await companyGroupService.bulkResumeGroup(selectedIds[0]);
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
            if (selectedIds.length === 1) {
              const expiryDate = prompt(t("company.newExpiryDate") + " (YYYY-MM-DD):");
              if (expiryDate) {
                await companyGroupService.bulkExtendGroup(selectedIds[0], new Date(expiryDate).toISOString());
                await vm.refreshItems();
              }
            }
          },
          confirmTitle: t("licensing.bulkExtend"),
          confirmDescription: t("licensing.confirmBulkExtend", { count: "{count}" }),
          variant: "default" as const,
        },
      ],
    }),
    [t, router, handleDelete, companyGroupService, vm]
  );

  return {
    vm,
    config,
    handleDelete,
    manageCompaniesOpen,
    setManageCompaniesOpen,
    selectedGroup,
    setSelectedGroup,
  };
}

