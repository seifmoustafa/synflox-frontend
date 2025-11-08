"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/domain";
import type { CrudConfig } from "@/components/ui/generic-crud-view";
import { Badge } from "@/components/ui/badge";

export function useProjectViewModel() {
  const router = useRouter();
  const { projectService } = useServices();
  const { t } = useI18n();

  const vm = useGenericCrudViewModel<
    Project,
    CreateProjectRequest,
    UpdateProjectRequest,
    { data: Project[]; pagination: any }
  >(
    {
      getData: projectService.getProjects.bind(projectService),
      create: projectService.createProject.bind(projectService),
      update: projectService.updateProject.bind(projectService),
      delete: projectService.deleteProject.bind(projectService),
    },
    {
      itemTypeName: t("project.item"),
      itemTypeNamePlural: t("project.items"),
      getItemDisplayName: (project: Project) => project.displayName,
      searchParamName: "search",
    }
  );

  const handleDelete = useCallback(async (project: Project) => {
    await projectService.deleteProject(project.id);
    await vm.refreshItems();
  }, [projectService, vm]);

  const config: CrudConfig<Project> = useMemo(
    () => ({
      titleKey: "project.title",
      subtitleKey: "project.description",
      columns: [
        {
          key: "name",
          label: t("project.name"),
          render: (_val: unknown, project: Project) => (
            <div className="font-medium">{project.name}</div>
          ),
        },
        {
          key: "description",
          label: t("project.description"),
          render: (_val: unknown, project: Project) => (
            <span className="text-sm text-muted-foreground">
              {project.description || "-"}
            </span>
          ),
        },
        {
          key: "isActive",
          label: t("project.status"),
          render: (_val: unknown, project: Project) => (
            <Badge variant={project.isActive ? "active" : "secondary"}>
              {project.isActive ? t("common.active") : t("common.inactive")}
            </Badge>
          ),
        },
      ],
      createFields: [
        {
          name: "name",
          label: t("project.name"),
          type: "text" as const,
          placeholder: t("project.namePlaceholder"),
          required: true,
        },
        {
          name: "description",
          label: t("project.description"),
          type: "textarea" as const,
          placeholder: t("project.descriptionPlaceholder"),
        },
        {
          name: "isActive",
          label: t("project.isActive"),
          type: "checkbox" as const,
        },
      ],
      editFields: [
        {
          name: "name",
          label: t("project.name"),
          type: "text" as const,
          placeholder: t("project.namePlaceholder"),
          required: true,
        },
        {
          name: "description",
          label: t("project.description"),
          type: "textarea" as const,
          placeholder: t("project.descriptionPlaceholder"),
        },
        {
          name: "isActive",
          label: t("project.isActive"),
          type: "checkbox" as const,
        },
        { name: "id", type: "hidden" as const, required: true },
      ],
      createInitialValues: {
        isActive: true,
      },
      editInitialValues: (project: Project) => ({
        name: project.name,
        description: project.description || "",
        isActive: project.isActive,
        id: project.id,
      }),
      getActions: (vm: any, t: any, handleDelete) => {
        return [
          {
            label: t("common.view"),
            onClick: (item: Project) => router.push(`/projects/${item.id}`),
            variant: "ghost" as const,
          },
          {
            label: t("common.edit"),
            onClick: (item: Project) => vm.openEditModal(item),
            variant: "ghost" as const,
          },
          {
            label: t("common.delete"),
            onClick: (item: Project) => handleDelete?.(item),
            variant: "ghost" as const,
            className: "text-red-600 hover:text-red-700",
            confirmTitle: t("common.confirmDelete"),
            confirmDescription: t("common.deleteConfirmation", { itemType: t("project.item") }),
            isDeleteAction: true,
          },
        ];
      },
    }),
    [t, router, handleDelete]
  );

  return { vm, config, handleDelete };
}

