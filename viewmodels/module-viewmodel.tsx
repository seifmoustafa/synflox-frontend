"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type { Module } from "@/domain";
import { CreateModuleRequest, UpdateModuleRequest } from "@/domain";
import { Badge } from "@/components/ui/badge";

export function useModuleViewModel() {
  const router = useRouter();
  const { moduleService } = useServices();
  const { t } = useI18n();

  // Helper function to adapt the service method to expected format
  const getModules = async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }) => {
    const result = await moduleService.getAllModules(
      params?.page,
      params?.pageSize,
      params?.search
    );
    return {
      data: result.modules,
      pagination: result.pagination,
    };
  };

  // Helper function for update that creates the request object
  const updateModule = async (id: string, data: any) => {
    const request = new UpdateModuleRequest(
      id,
      data.name,
      data.description,
      data.features  // ✅ FIXED! Pass features instead of isActive!
    );
    return await moduleService.updateModule(request);
  };

  const vm = useGenericCrudViewModel<
    Module,
    CreateModuleRequest,
    UpdateModuleRequest,
    { data: Module[]; pagination: any }
  >(
    {
      getData: getModules,
      create: moduleService.createModule.bind(moduleService),
      update: updateModule,
      delete: moduleService.deleteModule.bind(moduleService),
    },
    {
      itemTypeName: t("module.item"),
      itemTypeNamePlural: t("module.items"),
      getItemDisplayName: (module: Module) => module.displayName,
      searchParamName: "search",
    }
  );

  const config = useMemo(
    () => ({
      titleKey: "module.title",
      subtitleKey: "module.description",
      columns: [
        {
          key: "name",
          label: t("module.name"),
          render: (val: unknown, module: Module) => (
            <div className="font-medium">{module.displayName}</div>
          ),
        },
        {
          key: "description",
          label: t("module.tableDescription"),
          render: (_val: unknown, module: Module) => (
            <div className="text-sm text-muted-foreground truncate max-w-md">
              {module.description || t("common.noData")}
            </div>
          ),
        },
        {
          key: "features",
          label: t("module.features"),
          render: (_val: unknown, module: Module) => (
            <Badge variant="outline" className="text-xs">
              {module.featuresCount} {module.featuresCount === 1 ? t("common.item") : t("common.items")}
            </Badge>
          ),
        },
        {
          key: "status",
          label: t("common.status"),
          render: (_val: unknown, module: Module) => {
            const variant = module.isActive ? "default" : "secondary";
            const label = module.isActive ? t("common.active") : t("common.inactive");
            return (
              <Badge variant={variant}>
                {label}
              </Badge>
            );
          },
        },
      ],
      searchPlaceholder: t("module.searchPlaceholder"),
      noDataMessage: t("module.noModules"),
      createFields: [
        {
          name: "name",
          label: t("module.name"),
          type: "text" as const,
          placeholder: t("module.namePlaceholder"),
          required: true,
        },
        {
          name: "description",
          label: t("module.moduleDescription"),
          type: "textarea" as const,
          placeholder: t("module.descriptionPlaceholder"),
          required: false,
        },
        {
          name: "features",
          label: t("module.features"),
          type: "array" as const,
          placeholder: t("module.featuresPlaceholder"),
          helperText: t("module.featuresHelper"),
          maxItems: 200, // Max 200 features per module
        },
      ],
      editFields: [
        {
          name: "name",
          label: t("module.name"),
          type: "text" as const,
          placeholder: t("module.namePlaceholder"),
          required: true,
        },
        {
          name: "description",
          label: t("module.moduleDescription"),
          type: "textarea" as const,
          placeholder: t("module.descriptionPlaceholder"),
          required: false,
        },
        {
          name: "features",
          label: t("module.features"),
          type: "array" as const,
          placeholder: t("module.featuresPlaceholder"),
          helperText: t("module.featuresHelper"),
          maxItems: 200, // Max 200 features per module
        },
        { name: "id", type: "hidden" as const, required: true },
      ],
      createInitialValues: {
        name: "",
        description: "",
        features: [], // Initialize as empty array
      },
      editInitialValues: (module: Module) => ({
        name: module.name,
        description: module.description,
        features: module.features || [],
        id: module.id,
      }),
      getActions: (vm: any, t: any, handleDelete?: (item: Module) => void) => [
        {
          label: t("common.details"),
          onClick: (item: Module) => router.push(`/modules/${item.id}`),
          variant: "ghost" as const,
        },
        {
          label: t("common.edit"),
          onClick: (item: Module) => vm.openEditModal(item),
          variant: "ghost" as const,
        },
        {
          label: t("module.toggleStatus"),
          onClick: async (item: Module) => {
            if (item.isActive) {
              await moduleService.deactivateModule(item.id);
            } else {
              await moduleService.activateModule(item.id);
            }
            await vm.refreshItems();
          },
          variant: "ghost" as const,
          confirmTitle: t("module.confirmToggleStatus"),
          confirmDescription: t("module.toggleStatusWarning"),
          requiresConfirmation: true,
        },
        {
          label: t("common.delete"),
          onClick: (item: Module) => handleDelete?.(item),
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700",
          confirmTitle: t("common.confirmDelete"),
          confirmDescription: t("common.deleteConfirmation", { name: "{name}" }),
          requiresConfirmation: true,
        },
      ],
    }),
    [t, moduleService, vm]
  );

  const handleDelete = React.useCallback(
    async (module: Module) => {
      await moduleService.deleteModule(module.id);
      await vm.refreshItems();
    },
    [moduleService, vm]
  );

  return { vm, config, handleDelete };
}
