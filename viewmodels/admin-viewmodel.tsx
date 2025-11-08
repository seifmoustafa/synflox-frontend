"use client";

import React, { useCallback, useMemo } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type {
  Admin,
  CreateAdminRequest,
  UpdateAdminRequest,
} from "@/domain";
import type { CrudConfig } from "@/components/ui/generic-crud-view";
import { Badge } from "@/components/ui/badge";

export function useAdminViewModel() {
  const { adminService, adminTypeService } = useServices();
  const { t } = useI18n();

  const vm = useGenericCrudViewModel<
    Admin,
    CreateAdminRequest,
    UpdateAdminRequest,
    { data: Admin[]; pagination: any }
  >(
    {
      getData: adminService.getAdmins.bind(adminService),
      create: adminService.createAdmin.bind(adminService),
      update: adminService.updateAdmin.bind(adminService),
      delete: adminService.deleteAdmin.bind(adminService),
    },
    {
      itemTypeName: t("admin.item"),
      itemTypeNamePlural: t("admin.items"),
      getItemDisplayName: (admin: Admin) => admin.displayName,
      searchParamName: "search",
    }
  );

  const config: CrudConfig<Admin> = useMemo(
    () => ({
      titleKey: "admin.title",
      subtitleKey: "admin.description",
      columns: [
        {
          key: "name",
          label: t("admin.name"),
          render: (_val: unknown, admin: Admin) => (
            <div>
              <div className="font-medium">{admin.displayName}</div>
              <div className="text-sm text-muted-foreground">{admin.username}</div>
            </div>
          ),
        },
        {
          key: "adminType",
          label: t("admin.adminType"),
          render: (_val: unknown, admin: Admin) => (
            <span className="text-sm">{admin.adminTypeName || "-"}</span>
          ),
        },
        {
          key: "phoneNumber",
          label: t("admin.phoneNumber"),
          render: (_val: unknown, admin: Admin) => (
            <span className="text-sm text-muted-foreground">{admin.phoneNumber}</span>
          ),
        },
        {
          key: "isActive",
          label: t("admin.status"),
          render: (_val: unknown, admin: Admin) => (
            <Badge variant={admin.isActive ? "active" : "secondary"}>
              {admin.isActive ? t("admin.active") : t("admin.inactive")}
            </Badge>
          ),
        },
      ],
      createFields: [
        {
          name: "username",
          label: t("admin.username"),
          type: "text" as const,
          placeholder: t("admin.usernamePlaceholder"),
          required: true,
        },
        {
          name: "password",
          label: t("admin.password"),
          type: "password" as const,
          placeholder: t("admin.passwordPlaceholder"),
          required: true,
        },
        {
          name: "firstName",
          label: t("admin.firstName"),
          type: "text" as const,
          placeholder: t("admin.firstNamePlaceholder"),
          required: true,
        },
        {
          name: "lastName",
          label: t("admin.lastName"),
          type: "text" as const,
          placeholder: t("admin.lastNamePlaceholder"),
          required: true,
        },
        {
          name: "phoneNumber",
          label: t("admin.phoneNumber"),
          type: "text" as const,
          placeholder: t("admin.phoneNumberPlaceholder"),
          required: true,
        },
        {
          name: "adminTypeId",
          label: t("admin.adminType"),
          type: "searchable-select" as const,
          placeholder: t("admin.adminTypePlaceholder"),
          searchType: "server" as const,
          onServerSearch: async (query: string) => {
            const res = await adminTypeService.getAdminTypes({ search: query });
            return res.data.map(at => ({ value: at.id, label: at.name }));
          },
          required: true,
        },
      ],
      editFields: [
        {
          name: "username",
          label: t("admin.username"),
          type: "text" as const,
          placeholder: t("admin.usernamePlaceholder"),
          required: true,
        },
        {
          name: "firstName",
          label: t("admin.firstName"),
          type: "text" as const,
          placeholder: t("admin.firstNamePlaceholder"),
          required: true,
        },
        {
          name: "lastName",
          label: t("admin.lastName"),
          type: "text" as const,
          placeholder: t("admin.lastNamePlaceholder"),
          required: true,
        },
        {
          name: "phoneNumber",
          label: t("admin.phoneNumber"),
          type: "text" as const,
          placeholder: t("admin.phoneNumberPlaceholder"),
        },
        {
          name: "adminTypeId",
          label: t("admin.adminType"),
          type: "searchable-select" as const,
          placeholder: t("admin.adminTypePlaceholder"),
          searchType: "server" as const,
          onServerSearch: async (query: string) => {
            const res = await adminTypeService.getAdminTypes({ search: query });
            return res.data.map(at => ({ value: at.id, label: at.name }));
          },
          required: true,
        },
        {
          name: "isActive",
          label: t("admin.isActive"),
          type: "checkbox" as const,
        },
        { name: "id", type: "hidden" as const, required: true },
      ],
      createInitialValues: {},
      editInitialValues: (admin: Admin) => ({
        username: admin.username,
        firstName: admin.firstName,
        lastName: admin.lastName,
        phoneNumber: admin.phoneNumber,
        adminTypeId: admin.adminTypeId,
        isActive: admin.isActive ?? true,
        id: admin.id,
      }),
      getActions: (vm: any, t: any, handleDelete) => [
        {
          label: t("common.view"),
          onClick: (item: Admin) => vm.openViewModal(item),
          variant: "ghost" as const,
        },
        {
          label: t("common.edit"),
          onClick: (item: Admin) => vm.openEditModal(item),
          variant: "ghost" as const,
        },
        {
          label: t("common.makeInactive"),
          onClick: async (item: Admin) => {
            await adminService.toggleActive(item.id, false);
            await vm.refreshItems();
          },
          variant: "ghost" as const,
          className: "text-orange-600 hover:text-orange-700",
          show: (item: Admin) => item.isActive === true,
          confirmTitle: t("common.makeInactive"),
          confirmDescription: t("common.confirmMakeInactive", { name: "{name}" }),
        },
        {
          label: t("common.makeActive"),
          onClick: async (item: Admin) => {
            await adminService.toggleActive(item.id, true);
            await vm.refreshItems();
          },
          variant: "ghost" as const,
          className: "text-green-600 hover:text-green-700",
          show: (item: Admin) => item.isActive !== true,
          confirmTitle: t("common.makeActive"),
          confirmDescription: t("common.confirmMakeActive", { name: "{name}" }),
        },
        {
          label: t("common.delete"),
          onClick: (item: Admin) => handleDelete?.(item),
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700",
          confirmTitle: t("common.confirmDelete"),
          confirmDescription: t("common.deleteConfirmation", { name: "{name}" }),
        },
      ],
      enableBulkActions: true,
      bulkActions: [
        {
          label: t("admin.bulkActivate"),
          onClick: async (selectedIds: string[]) => {
            for (const id of selectedIds) {
              await adminService.toggleActive(id, true);
            }
            await vm.refreshItems();
          },
          confirmTitle: t("admin.bulkActivate"),
          confirmDescription: t("admin.confirmBulkActivate", { count: "{count}" }),
          variant: "default" as const,
        },
        {
          label: t("admin.bulkDeactivate"),
          onClick: async (selectedIds: string[]) => {
            for (const id of selectedIds) {
              await adminService.toggleActive(id, false);
            }
            await vm.refreshItems();
          },
          confirmTitle: t("admin.bulkDeactivate"),
          confirmDescription: t("admin.confirmBulkDeactivate", { count: "{count}" }),
          variant: "default" as const,
        },
        {
          label: t("admin.bulkDelete"),
          onClick: async (selectedIds: string[]) => {
            for (const id of selectedIds) {
              await adminService.deleteAdmin(id);
            }
            await vm.refreshItems();
          },
          confirmTitle: t("admin.bulkDelete"),
          confirmDescription: t("admin.confirmBulkDelete", { count: "{count}" }),
          variant: "destructive" as const,
        },
      ],
    }),
    [t, adminTypeService, adminService, vm]
  );

  const handleDelete = useCallback(async (admin: Admin) => {
    await adminService.deleteAdmin(admin.id);
    await vm.refreshItems();
  }, [adminService, vm]);

  const handleToggleActive = useCallback(async (admin: Admin) => {
    await adminService.toggleActive(admin.id, !admin.isActive);
    await vm.refreshItems();
  }, [adminService, vm]);

  return { vm, config, handleDelete, handleToggleActive };
}

