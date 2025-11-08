"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useRouter } from "next/navigation";
import type { SystemNotification } from "@/domain";
import { SystemNotificationType } from "@/domain";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { notificationSystemService } = useServices();
  const { t } = useI18n();
  const router = useRouter();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationSystemService.getNotifications({
        page: 1,
        pageSize: 10,
      });
      setNotifications(response.data);
    } catch (e) {
      // Error already shown by service
    } finally {
      setLoading(false);
    }
  }, [notificationSystemService]);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await notificationSystemService.getUnreadCount();
      setUnreadCount(response.count);
    } catch (e) {
      // Error already shown by service
    }
  }, [notificationSystemService]);

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationSystemService.markAsRead(notificationId);
      await loadNotifications();
      await loadUnreadCount();
    } catch (e) {
      // Error already shown by service
    }
  }, [notificationSystemService, loadNotifications, loadUnreadCount]);

  const handleViewAll = useCallback(() => {
    setOpen(false);
    router.push("/notifications");
  }, [router]);

  const getNotificationTypeColor = (type: SystemNotificationType): string => {
    switch (type) {
      case SystemNotificationType.Expired:
      case SystemNotificationType.Suspended:
        return "text-red-600";
      case SystemNotificationType.ExpiryWarning:
        return "text-orange-600";
      case SystemNotificationType.Activated:
      case SystemNotificationType.Resumed:
        return "text-green-600";
      default:
        return "text-blue-600";
    }
  };

  // Load notifications and unread count on mount
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications();
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadNotifications, loadUnreadCount]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <h3 className="font-semibold">{t("notifications.title")}</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} {t("notifications.unread")}</Badge>
          )}
        </div>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t("notifications.noNotifications")}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start p-3 cursor-pointer",
                  !notification.isRead && "bg-muted"
                )}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1">
                    <div className={cn("font-medium text-sm", getNotificationTypeColor(notification.type))}>
                      {notification.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {notification.formattedCreatedAt}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary ml-2 mt-1" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleViewAll} className="cursor-pointer">
          {t("notifications.viewAll")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

