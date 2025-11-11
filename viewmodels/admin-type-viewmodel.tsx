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
          key: "adminTypeName",
          label: t("adminType.adminTypeName"),
          render: (_val: unknown, adminType: AdminType) => (
            <div className="font-medium">{adminType.adminTypeName}</div>
          ),
        },
       
       
      ],
      createFields: [
        {
          name: "adminTypeName",
          label: t("adminType.adminTypeName"),
          type: "text" as const,
          placeholder: t("adminType.adminTypeNamePlaceholder"),
          required: true,
        },
      ],
      editFields: [
        {
          name: "adminTypeName",
          label: t("adminType.adminTypeName"),
          type: "text" as const,
          placeholder: t("adminType.adminTypeNamePlaceholder"),
          required: true,
        },
        
        { name: "id", type: "hidden" as const, required: true },
      ],
      createInitialValues: {},
      editInitialValues: (adminType: AdminType) => ({
        adminTypeName: adminType.adminTypeName,
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
          label: t("common.delete"),
          onClick: (item: AdminType) => handleDelete?.(item),
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700",
          confirmTitle: t("common.confirmDelete"),
          confirmDescription: t("common.deleteConfirmation", { name: "{name}" }),
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

  

  return { vm, config, handleDelete };
}
