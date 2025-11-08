"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type {
  Module,
  CreateModuleRequest,
  UpdateModuleRequest,
} from "@/domain";
import type { CrudConfig } from "@/components/ui/generic-crud-view";
import { Badge } from "@/components/ui/badge";

export function useModuleViewModel() {
  const router = useRouter();
  const { moduleService } = useServices();
  const { t } = useI18n();

  const vm = useGenericCrudViewModel<
    Module,
    CreateModuleRequest,
    UpdateModuleRequest,
    { data: Module[]; pagination: any }
  >(
    {
      getData: moduleService.getModules.bind(moduleService),
      create: moduleService.createModule.bind(moduleService),
      update: moduleService.updateModule.bind(moduleService),
      delete: moduleService.deleteModule.bind(moduleService),
    },
    {
      itemTypeName: t("module.item"),
      itemTypeNamePlural: t("module.items"),
      getItemDisplayName: (module: Module) => module.displayName,
      searchParamName: "search",
    }
  );

  const handleDelete = useCallback(async (module: Module) => {
    await moduleService.deleteModule(module.id);
    await vm.refreshItems();
  }, [moduleService, vm]);

  const config: CrudConfig<Module> = useMemo(
    () => ({
      titleKey: "module.title",
      subtitleKey: "module.description",
      columns: [
        {
          key: "name",
          label: t("module.name"),
          render: (_val: unknown, module: Module) => (
            <div className="font-medium">{module.name}</div>
          ),
        },
        {
          key: "description",
          label: t("module.description"),
          render: (_val: unknown, module: Module) => (
            <span className="text-sm text-muted-foreground">
              {module.description || "-"}
            </span>
          ),
        },
        {
          key: "isActive",
          label: t("module.status"),
          render: (_val: unknown, module: Module) => (
            <Badge variant={module.isActive ? "active" : "secondary"}>
              {module.isActive ? t("common.active") : t("common.inactive")}
            </Badge>
          ),
        },
      ],
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
          label: t("module.description"),
          type: "textarea" as const,
          placeholder: t("module.descriptionPlaceholder"),
        },
        {
          name: "isActive",
          label: t("module.isActive"),
          type: "checkbox" as const,
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
          label: t("module.description"),
          type: "textarea" as const,
          placeholder: t("module.descriptionPlaceholder"),
        },
        {
          name: "isActive",
          label: t("module.isActive"),
          type: "checkbox" as const,
        },
        { name: "id", type: "hidden" as const, required: true },
      ],
      createInitialValues: {
        isActive: true,
      },
      editInitialValues: (module: Module) => ({
        name: module.name,
        description: module.description || "",
        isActive: module.isActive,
        id: module.id,
      }),
      getActions: (vm: any, t: any, handleDelete) => {
        return [
          {
            label: t("common.view"),
            onClick: (item: Module) => router.push(`/modules/${item.id}`),
            variant: "ghost" as const,
          },
          {
            label: t("common.edit"),
            onClick: (item: Module) => vm.openEditModal(item),
            variant: "ghost" as const,
          },
          {
            label: t("common.delete"),
            onClick: (item: Module) => handleDelete?.(item),
            variant: "ghost" as const,
            className: "text-red-600 hover:text-red-700",
            confirmTitle: t("common.confirmDelete"),
            confirmDescription: t("common.deleteConfirmation", { itemType: t("module.item") }),
            isDeleteAction: true,
          },
        ];
      },
    }),
    [t, router, handleDelete]
  );

  return { vm, config, handleDelete };
}

