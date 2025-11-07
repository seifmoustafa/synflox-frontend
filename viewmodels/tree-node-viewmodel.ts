/**
 * Tree Node View Model
 * 
 * Handles all state management for the Tree Node view.
 * Extracted from tree-node-view.tsx to separate business logic from UI.
 */

"use client";

import { useCallback, useMemo } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { GenericTreeView } from "@/components/ui/generic-tree-view";
import type { 
  TreeNode, 
  CreateTreeNodeRequest, 
  UpdateTreeNodeRequest 
} from "@/domain";
import { useTreeViewModel, type TreeService, type TreeViewModelConfig } from "@/hooks/use-tree-view-model";

export function useTreeNodeViewModel() {
  const { treeNodeService } = useServices();
  const { t } = useI18n();

  // Create service adapter for generic tree view model
  const service: TreeService<TreeNode, CreateTreeNodeRequest, UpdateTreeNodeRequest> = useMemo(() => ({
    getWithChildren: (params) => treeNodeService.getTreeNodesHierarchical(params),
    create: (data) => treeNodeService.createTreeNode(data),
    update: (id, data) => treeNodeService.updateTreeNode(id, data),
    delete: (id) => treeNodeService.deleteTreeNode(id),
  }), [treeNodeService]);

  // Configuration for the generic tree view model
  const config: TreeViewModelConfig<TreeNode> = useMemo(() => ({
    itemTypeName: t("treeNode.item"),
    itemTypeNamePlural: t("treeNode.items"),
    getItemDisplayName: (item: TreeNode) => item.displayName,
    getFormFieldName: (item: TreeNode) => item.name,
    createFormData: (values: any) => ({
      name: values.name,
      type: values.type,
      status: values.status,
      parentId: values.parentId === "" ? null : values.parentId,
      order: values.order,
      description: values.description,
      metadata: values.metadata,
    }),
    updateFormData: (values: any, item: TreeNode) => ({
      id: item.id,
      name: values.name,
      type: values.type,
      status: values.status,
      parentId: values.parentId === "" ? null : values.parentId,
      order: values.order,
      description: values.description,
      metadata: values.metadata,
    }),
    getInitialFormValues: (item?: TreeNode, parent?: TreeNode) => ({
      name: item?.name || "",
      type: item?.type || "",
      status: item?.status || "active",
      parentId: parent?.id || item?.parentId || "",
      order: item?.order || 0,
      description: item?.description || "",
      metadata: item?.metadata || {},
    }),
  }), [t]);

  // Use the generic tree view model directly
  const vm = useTreeViewModel(service, config);

  const renderFormFields = useCallback((formValues: any, setFormValues: (values: any) => void, editing: TreeNode | null, parentForNew: TreeNode | null) => {
    // Convert to GenericForm fields
    const fields = [
      {
        name: "name",
        label: t("treeNode.name"),
        type: "text" as const,
        placeholder: t("treeNode.namePlaceholder"),
        required: true,
      },
      {
        name: "type",
        label: t("treeNode.type"),
        type: "text" as const,
        placeholder: t("treeNode.typePlaceholder"),
      },
      {
        name: "status",
        label: t("treeNode.status"),
        type: "select" as const,
        options: [
          { value: "active", label: t("treeNode.active") },
          { value: "inactive", label: t("treeNode.inactive") },
          { value: "pending", label: t("treeNode.pending") },
        ],
        placeholder: t("treeNode.selectStatus"),
        required: true,
      },
      {
        name: "parentId",
        label: t("treeNode.parentNode"),
        type: "select" as const,
        options: [
          { value: "", label: t("treeNode.root") },
          ...(vm.parentOptions || [])
            .filter(option => option.id !== formValues.id)
            .map(option => ({
              value: option.id,
              label: option.name
            }))
        ],
        placeholder: t("treeNode.selectParentNode"),
        disabled: !!parentForNew, // Disable if adding child
      },
      {
        name: "order",
        label: t("treeNode.order"),
        type: "number" as const,
        placeholder: t("treeNode.orderPlaceholder"),
        min: 0,
      },
      {
        name: "description",
        label: t("treeNode.description"),
        type: "textarea" as const,
        placeholder: t("treeNode.descriptionPlaceholder"),
      },
    ];

    return fields;
  }, [t, vm.parentOptions]);

  return {
    vm,
    renderFormFields,
    title: t("treeNode.title"),
    subtitle: t("treeNode.description"),
  };
}

