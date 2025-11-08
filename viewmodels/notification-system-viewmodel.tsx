"use client";

import { useCallback, useMemo, useEffect, useState } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type {
  SystemNotification,
} from "@/domain";
import type { CrudConfig } from "@/components/ui/generic-crud-view";
import { Badge } from "@/components/ui/badge";
import { SystemNotificationType } from "@/domain";

export function useNotificationSystemViewModel(companyId?: string) {
  const { notificationSystemService } = useServices();
  const { t } = useI18n();
  const [unreadCount, setUnreadCount] = useState(0);

  const vm = useGenericCrudViewModel<
    SystemNotification,
    never, // No create
    never, // No update
    { data: SystemNotification[]; pagination: any }
  >(
    {
      getData: companyId 
        ? notificationSystemService.getCompanyNotifications.bind(notificationSystemService, companyId)
        : notificationSystemService.getNotifications.bind(notificationSystemService),
      create: async () => { throw new Error("Not supported"); },
      update: async () => { throw new Error("Not supported"); },
      delete: async () => { throw new Error("Not supported"); },
    },
    {
      itemTypeName: t("notifications.item"),
      itemTypeNamePlural: t("notifications.items"),
      getItemDisplayName: (notification: SystemNotification) => notification.displayName,
      searchParamName: "search",
    }
  );

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await notificationSystemService.getUnreadCount(companyId);
      setUnreadCount(response.count);
    } catch (e) {
      // Error already shown by service
    }
  }, [notificationSystemService, companyId]);

  useEffect(() => {
    loadUnreadCount();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationSystemService.markAsRead(notificationId);
      await vm.refreshItems();
      await loadUnreadCount();
    } catch (e) {
      // Error already shown by service
    }
  }, [notificationSystemService, vm, loadUnreadCount]);

  const markAllAsRead = useCallback(async (companyId?: string) => {
    if (!companyId) return;
    try {
      await notificationSystemService.markAllAsRead(companyId);
      await vm.refreshItems();
      await loadUnreadCount();
    } catch (e) {
      // Error already shown by service
    }
  }, [notificationSystemService, vm, loadUnreadCount]);

  const getNotificationTypeName = useCallback((type: SystemNotificationType): string => {
    const names: Record<SystemNotificationType, string> = {
      [SystemNotificationType.ExpiryWarning]: t("notifications.type.expiryWarning"),
      [SystemNotificationType.Expired]: t("notifications.type.expired"),
      [SystemNotificationType.Suspended]: t("notifications.type.suspended"),
      [SystemNotificationType.Activated]: t("notifications.type.activated"),
      [SystemNotificationType.Resumed]: t("notifications.type.resumed"),
      [SystemNotificationType.Extended]: t("notifications.type.extended"),
      [SystemNotificationType.General]: t("notifications.type.general"),
    };
    return names[type] || t("notifications.type.unknown");
  }, [t]);

  const config: CrudConfig<SystemNotification> = useMemo(
    () => ({
      titleKey: "notifications.title",
      subtitleKey: "notifications.description",
      columns: [
        {
          key: "type",
          label: t("notifications.typeLabel"),
          render: (_val: unknown, notification: SystemNotification) => (
            <Badge variant="secondary">
              {getNotificationTypeName(notification.type)}
            </Badge>
          ),
        },
        {
          key: "title",
          label: t("notifications.title"),
          render: (_val: unknown, notification: SystemNotification) => (
            <div className="font-medium">{notification.title}</div>
          ),
        },
        {
          key: "message",
          label: t("notifications.message"),
          render: (_val: unknown, notification: SystemNotification) => (
            <span className="text-sm text-muted-foreground">
              {notification.message}
            </span>
          ),
        },
        {
          key: "createdAt",
          label: t("notifications.createdAt"),
          render: (_val: unknown, notification: SystemNotification) => (
            <span className="text-sm">
              {notification.formattedCreatedAt}
            </span>
          ),
        },
        {
          key: "isRead",
          label: t("notifications.status"),
          render: (_val: unknown, notification: SystemNotification) => (
            <Badge variant={notification.isRead ? "secondary" : "default"}>
              {notification.isRead ? t("notifications.read") : t("notifications.unread")}
            </Badge>
          ),
        },
      ],
      createFields: [], // No create
      editFields: [], // No edit
      createInitialValues: {},
      editInitialValues: () => ({}),
      getActions: (vm: any, t: any) => [
        {
          label: notification => notification.isRead ? t("notifications.markUnread") : t("notifications.markRead"),
          onClick: async (item: SystemNotification) => {
            await markAsRead(item.id);
          },
          variant: "ghost" as const,
        },
      ],
      enableBulkActions: false,
      enableCreate: false,
      enableEdit: false,
      enableDelete: false,
    }),
    [t, getNotificationTypeName, markAsRead]
  );

  return { vm, config, unreadCount, markAsRead, markAllAsRead, loadUnreadCount };
}

