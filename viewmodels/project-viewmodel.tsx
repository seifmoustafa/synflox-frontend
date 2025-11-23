"use client";

import React, { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/domain";
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

  const config = useMemo(
    () => ({
      titleKey: "project.title",
      subtitleKey: "project.description",
      columns: [
        {
          key: "name",
          label: t("project.name"),
          render: (_val: unknown, project: Project) => (
            <div>
              <div className="font-medium">{project.displayName}</div>
              {project.description && (
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {project.description}
                </div>
              )}
            </div>
          ),
        },
        {
          key: "modules",
          label: t("project.modules"),
          render: (_val: unknown, project: Project) => (
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {project.moduleCount} {project.moduleCount === 1 ? t("project.module") : t("project.modules")}
              </Badge>
            </div>
          ),
        },
        {
          key: "features",
          label: t("project.features"),
          render: (_val: unknown, project: Project) => (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {project.featureCount} {project.featureCount === 1 ? t("project.feature") : t("project.features")}
              </Badge>
            </div>
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
          label: t("project.projectDescription"),
          type: "textarea" as const,
          placeholder: t("project.descriptionPlaceholder"),
        },
        {
          name: "features",
          label: t("project.features"),
          type: "array" as const,
          placeholder: t("project.featuresPlaceholder"),
          helperText: t("project.featuresHelper"),
          maxItems: 200, // Max 200 features per project
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
          label: t("project.projectDescription"),
          type: "textarea" as const,
          placeholder: t("project.descriptionPlaceholder"),
        },
        {
          name: "features",
          label: t("project.features"),
          type: "array" as const,
          placeholder: t("project.featuresPlaceholder"),
          helperText: t("project.featuresHelper"),
          maxItems: 200, // Max 200 features per project
        },
        { name: "id", type: "hidden" as const, required: true },
      ],
      createInitialValues: {
        features: [], // Initialize as empty array
      },
      editInitialValues: (project: Project) => ({
        name: project.name,
        description: project.description,
        features: project.features,
        id: project.id,
      }),
      getActions: (vm: any, t: any, handleDelete?: (item: Project) => void) => [
        {
          label: t("common.details"),
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
          confirmDescription: t("common.deleteConfirmation", { name: "{name}" }),
          requiresConfirmation: true,
        },
      ],
    }),
    [t, projectService, vm]
  );

  const handleDelete = useCallback(
    async (project: Project) => {
      await projectService.deleteProject(project.id);
      await vm.refreshItems();
    },
    [projectService, vm]
  );

  return { vm, config, handleDelete };
}
