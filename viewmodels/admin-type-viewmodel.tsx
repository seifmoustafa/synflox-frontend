"use client";

import React, { useCallback, useMemo } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type {
  AdminType,
  CreateAdminTypeRequest,
  UpdateAdminTypeRequest,
} from "@/domain";
import type { CrudConfig } from "@/components/ui/generic-crud-view";
import { Badge } from "@/components/ui/badge";

export function useAdminTypeViewModel() {
  const { adminTypeService } = useServices();
  const { t } = useI18n();

  const vm = useGenericCrudViewModel<
    AdminType,
    CreateAdminTypeRequest,
    UpdateAdminTypeRequest,
    { data: AdminType[]; pagination: any }
  >(
    {
      getData: adminTypeService.getAdminTypes.bind(adminTypeService),
      create: adminTypeService.createAdminType.bind(adminTypeService),
      update: adminTypeService.updateAdminType.bind(adminTypeService),
      delete: adminTypeService.deleteAdminType.bind(adminTypeService),
    },
    {
      itemTypeName: t("adminType.item"),
      itemTypeNamePlural: t("adminType.items"),
      getItemDisplayName: (adminType: AdminType) => adminType.displayName,
      searchParamName: "search",
    }
  );

  const config: CrudConfig<AdminType> = useMemo(
    () => ({
      titleKey: "adminType.title",
      subtitleKey: "adminType.description",
      columns: [
        {
          key: "name",
          label: t("adminType.name"),
          render: (_val: unknown, adminType: AdminType) => (
            <div className="font-medium">{adminType.name}</div>
          ),
        },
        {
          key: "description",
          label: t("common.description"),
          render: (_val: unknown, adminType: AdminType) => (
            <span className="text-sm text-muted-foreground">
              {adminType.description || "-"}
            </span>
          ),
        },
        {
          key: "isActive",
          label: t("adminType.status"),
          render: (_val: unknown, adminType: AdminType) => (
            <Badge variant={adminType.isActive ? "active" : "secondary"}>
              {adminType.isActive
                ? t("adminType.active")
                : t("adminType.inactive")}
            </Badge>
          ),
        },
      ],
      createFields: [
        {
          name: "name",
          label: t("adminType.name"),
          type: "text" as const,
          placeholder: t("adminType.namePlaceholder"),
          required: true,
        },
        {
          name: "description",
          label: t("common.description"),
          type: "textarea" as const,
          placeholder: t("adminType.descriptionPlaceholder"),
        },
      ],
      editFields: [
        {
          name: "name",
          label: t("adminType.name"),
          type: "text" as const,
          placeholder: t("adminType.namePlaceholder"),
          required: true,
        },
        {
          name: "description",
          label: t("common.description"),
          type: "textarea" as const,
          placeholder: t("adminType.descriptionPlaceholder"),
        },
        {
          name: "isActive",
          label: t("adminType.isActive"),
          type: "checkbox" as const,
        },
        { name: "id", type: "hidden" as const, required: true },
      ],
      createInitialValues: {},
      editInitialValues: (adminType: AdminType) => ({
        name: adminType.name,
        description: adminType.description || "",
        isActive: adminType.isActive ?? true,
        id: adminType.id,
      }),
      getActions: (vm: any, t: any, handleDelete) => [
        {
          label: t("common.view"),
          onClick: (item: AdminType) => vm.openViewModal(item),
          variant: "ghost" as const,
        },
        {
          label: t("common.edit"),
          onClick: (item: AdminType) => vm.openEditModal(item),
          variant: "ghost" as const,
        },
        {
          label: t("common.makeInactive"),
          onClick: async (item: AdminType) => {
            await adminTypeService.toggleActive(item.id, false);
            await vm.refreshItems();
          },
          variant: "ghost" as const,
          className: "text-orange-600 hover:text-orange-700",
          show: (item: AdminType) => item.isActive === true,
          confirmTitle: t("common.makeInactive"),
          confirmDescription: t("common.confirmMakeInactive", { name: "{name}" }),
        },
        {
          label: t("common.makeActive"),
          onClick: async (item: AdminType) => {
            await adminTypeService.toggleActive(item.id, true);
            await vm.refreshItems();
          },
          variant: "ghost" as const,
          className: "text-green-600 hover:text-green-700",
          show: (item: AdminType) => item.isActive !== true,
          confirmTitle: t("common.makeActive"),
          confirmDescription: t("common.confirmMakeActive", { name: "{name}" }),
        },
        {
          label: t("common.delete"),
          onClick: (item: AdminType) => handleDelete?.(item),
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700",
          confirmTitle: t("common.confirmDelete"),
          confirmDescription: t("common.deleteConfirmation", { name: "{name}" }),
        },
      ],
      enableBulkActions: true,
      bulkActions: [
        {
          label: t("adminType.bulkActivate"),
          onClick: async (selectedIds: string[]) => {
            for (const id of selectedIds) {
              await adminTypeService.toggleActive(id, true);
            }
            await vm.refreshItems();
          },
          confirmTitle: t("adminType.bulkActivate"),
          confirmDescription: t("adminType.confirmBulkActivate", { count: "{count}" }),
          variant: "default" as const,
        },
        {
          label: t("adminType.bulkDeactivate"),
          onClick: async (selectedIds: string[]) => {
            for (const id of selectedIds) {
              await adminTypeService.toggleActive(id, false);
            }
            await vm.refreshItems();
          },
          confirmTitle: t("adminType.bulkDeactivate"),
          confirmDescription: t("adminType.confirmBulkDeactivate", { count: "{count}" }),
          variant: "default" as const,
        },
        {
          label: t("adminType.bulkDelete"),
          onClick: async (selectedIds: string[]) => {
            for (const id of selectedIds) {
              await adminTypeService.deleteAdminType(id);
            }
            await vm.refreshItems();
          },
          confirmTitle: t("adminType.bulkDelete"),
          confirmDescription: t("adminType.confirmBulkDelete", { count: "{count}" }),
          variant: "destructive" as const,
        },
      ],
    }),
    [t, adminTypeService, vm]
  );

  const handleDelete = useCallback(
    async (adminType: AdminType) => {
      await adminTypeService.deleteAdminType(adminType.id);
      await vm.refreshItems();
    },
    [adminTypeService, vm]
  );

  const handleToggleActive = useCallback(
    async (adminType: AdminType) => {
      await adminTypeService.toggleActive(adminType.id, !adminType.isActive);
      await vm.refreshItems();
    },
    [adminTypeService, vm]
  );

  return { vm, config, handleDelete, handleToggleActive };
}
