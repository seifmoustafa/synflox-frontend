"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type {
  Admin,
  CreateAdminRequest,
  UpdateAdminRequest,
} from "@/domain";
import type { CrudConfig, BulkAction } from "@/components/ui/generic-crud-view";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, KeyRound } from "lucide-react";
import { toast } from "sonner";

export function useAdminViewModel() {
  const { adminService, adminTypeService } = useServices();
  const { t } = useI18n();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState<{ adminName: string; temporaryPassword: string } | null>(null);

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

  const config = useMemo(
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
          key: "status",
          label: t("admin.status"),
          render: (_val: unknown, admin: Admin) => {
            const variant = admin.isActive ? "default" : "secondary";
            const label = admin.isActive ? t("admin.active") : t("admin.inactive");
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
            return res.data.map(at => ({ value: at.id, label: at.adminTypeName }));
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
            return res.data.map(at => ({ value: at.id, label: at.adminTypeName }));
          },
          required: true,
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
        id: admin.id,
      }),
      enableBulkActions: true,
      bulkActions: [
        {
          label: t("admin.activateSelected"),
          onClick: async (selectedIds: string[]) => {
            await adminService.activateSelected(selectedIds);
            await vm.refreshItems();
          },
          variant: "default" as const,
          icon: <CheckCircle2 className="w-4 h-4" />,
          confirmTitle: t("admin.confirmActivate"),
          confirmDescription: t("admin.activateConfirmation").replace("{count}", "{count}"),
          requiresConfirmation: true,
        },
        {
          label: t("admin.deactivateSelected"),
          onClick: async (selectedIds: string[]) => {
            await adminService.deactivateSelected(selectedIds);
            await vm.refreshItems();
          },
          variant: "outline" as const,
          icon: <XCircle className="w-4 h-4" />,
          confirmTitle: t("admin.confirmDeactivate"),
          confirmDescription: t("admin.deactivateConfirmation").replace("{count}", "{count}"),
          requiresConfirmation: true,
        },
        {
          label: t("admin.deleteSelected"),
          onClick: async (selectedIds: string[]) => {
            await adminService.deleteSelected(selectedIds);
            await vm.refreshItems();
          },
          variant: "destructive" as const,
          confirmTitle: t("common.confirmDelete"),
          confirmDescription: t("admin.deleteSelectedConfirmation").replace("{count}", "{count}"),
          requiresConfirmation: true,
        },
      ] as BulkAction[],
      getActions: (vm: any, t: any, handleDelete?: (item: Admin) => void) => [
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
          label: t("admin.activate"),
          onClick: async (item: Admin) => {
            await adminService.activateAdmin(item.id);
            await vm.refreshItems();
          },
          variant: "ghost" as const,
          icon: <CheckCircle2 className="w-4 h-4" />,
          show: (item: Admin) => !item.isActive,
          confirmTitle: t("admin.confirmActivate"),
          confirmDescription: t("admin.activateConfirmation").replace("{count}", "1"),
          requiresConfirmation: true,
        },
        {
          label: t("admin.deactivate"),
          onClick: async (item: Admin) => {
            await adminService.deactivateAdmin(item.id);
            await vm.refreshItems();
          },
          variant: "ghost" as const,
          icon: <XCircle className="w-4 h-4" />,
          show: (item: Admin) => item.isActive === true,
          confirmTitle: t("admin.confirmDeactivate"),
          confirmDescription: t("admin.deactivateConfirmation").replace("{count}", "1"),
          requiresConfirmation: true,
        },
        {
          label: t("admin.resetPassword"),
          onClick: async (item: Admin) => {
            const result = await adminService.resetPassword(item.id);
            setResetPasswordData({
              adminName: item.displayName,
              temporaryPassword: result.temporaryPassword,
            });
            setShowPasswordModal(true);
          },
          variant: "ghost" as const,
          icon: <KeyRound className="w-4 h-4" />,
          confirmTitle: t("admin.resetPassword"),
          confirmDescription: t("admin.resetPasswordConfirmation"),
          requiresConfirmation: true,
        },
        {
          label: t("common.delete"),
          onClick: (item: Admin) => handleDelete?.(item),
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700",
          confirmTitle: t("common.confirmDelete"),
          confirmDescription: t("common.deleteConfirmation", { name: "{name}" }),
          requiresConfirmation: true,
        },
      ],
    }),
    [t, adminTypeService, adminService, vm, setResetPasswordData, setShowPasswordModal]
  );

  const handleDelete = useCallback(async (admin: Admin) => {
    await adminService.deleteAdmin(admin.id);
    await vm.refreshItems();
  }, [adminService, vm]);

  const handleActivateAll = useCallback(async () => {
    await adminService.activateAll();
    await vm.refreshItems();
  }, [adminService, vm]);

  const handleDeactivateAll = useCallback(async () => {
    await adminService.deactivateAll();
    await vm.refreshItems();
  }, [adminService, vm]);

  const handleDeleteAll = useCallback(async () => {
    const confirmationText = prompt(t("admin.deleteAllConfirmation"));
    if (confirmationText === "DELETE_ALL_ADMINS") {
      await adminService.deleteAll(confirmationText);
      await vm.refreshItems();
    } else if (confirmationText !== null) {
      toast.error(t("common.invalidConfirmation"));
    }
  }, [adminService, vm, t]);

  return { 
    vm, 
    config, 
    handleDelete, 
    showPasswordModal, 
    setShowPasswordModal, 
    resetPasswordData,
    handleActivateAll,
    handleDeactivateAll,
    handleDeleteAll,
  };
}

