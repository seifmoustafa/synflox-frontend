"use client";

import { useMenuItemViewModel } from "@/viewmodels/menu-item-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { GenericTreeView } from "@/components/ui/generic-tree-view";
import { useTreeViewModel } from "@/hooks/use-tree-view-model";
import { MenuItem } from "@/domain";
import { useEffect, useMemo } from "react";

export function MenuItemView() {
  const { t } = useI18n();
  const { loading, menuItems, loadMenuItems } = useMenuItemViewModel();

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  const vm = useTreeViewModel<MenuItem, any, any>(
    null, // No service - using static data
    useMemo(() => ({
      staticData: menuItems,
      itemTypeName: t("menuItem.item"),
      itemTypeNamePlural: t("menuItem.items"),
      autoLoad: false, // We load manually
      disableOperations: true, // Read-only for now
    }), [menuItems, t])
  );

  return (
    <GenericTreeView
      viewModel={vm}
      title={t("menuItem.title")}
      subtitle={t("menuItem.description")}
      getId={(item) => item.id}
      getLabel={(item) => item.name}
      getChildren={(item) => item.children}
    />
  );
}

