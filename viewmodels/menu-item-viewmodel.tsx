"use client";

import { useState, useCallback, useEffect } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import type { MenuItem } from "@/domain";

export function useMenuItemViewModel() {
  const { navigationService } = useServices();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const loadMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await navigationService.fetchMenuItems();
      setMenuItems(data.menuItems);
    } catch (e) {
      // Error already shown by service
    } finally {
      setLoading(false);
    }
  }, [navigationService]);

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  const updateMenuItems = useCallback(async (items: MenuItem[]) => {
    // This would call an API to update menu items order/structure
    // For now, we'll just update local state
    setMenuItems(items);
  }, []);

  return {
    loading,
    menuItems,
    loadMenuItems,
    updateMenuItems,
  };
}

