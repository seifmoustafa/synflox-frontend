"use client";

import { Bell } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@shared/lib/utils";
import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
      DropdownMenuSeparator,
} from "@shared/components/ui/dropdown-menu";
import { useI18n } from "@shared/providers/i18n-provider";

export interface InAppNotification {
      id: string;
      title: string;
      message: string;
      type: string;
      isRead: boolean;
      createdAt: string;
      actionUrl?: string;
}

interface HeaderNotificationBellProps {
      notificationsPageUrl?: string;
      className?: string;
}

/**
 * HeaderNotificationBell Component
 * 
 * Displays a notification bell icon with unread count badge.
 * Shows a dropdown with recent notifications on click.
 * Navigates to full notifications page when "View All" is clicked.
 */
export function HeaderNotificationBell({
      notificationsPageUrl = "/notifications",
      className,
}: HeaderNotificationBellProps) {
      const router = useRouter();
      const { t } = useI18n();
      const [unreadCount, setUnreadCount] = useState(0);
      const [notifications, setNotifications] = useState<InAppNotification[]>([]);
      const [loading, setLoading] = useState(false);

      // TODO: Implement API call to fetch unread count
      const fetchUnreadCount = useCallback(async () => {
            try {
                  // Will be implemented when backend is ready
                  // const response = await notificationService.getUnreadCount();
                  // setUnreadCount(response);
            } catch (error) {
                  console.error("Failed to fetch unread count:", error);
            }
      }, []);

      // TODO: Implement API call to fetch recent notifications
      const fetchRecentNotifications = useCallback(async () => {
            setLoading(true);
            try {
                  // Will be implemented when backend is ready
                  // const response = await notificationService.getRecentNotifications(5);
                  // setNotifications(response.notifications);
                  // setUnreadCount(response.unreadCount);
            } catch (error) {
                  console.error("Failed to fetch notifications:", error);
            } finally {
                  setLoading(false);
            }
      }, []);

      // Fetch unread count on mount
      useEffect(() => {
            fetchUnreadCount();
            // Poll every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
      }, [fetchUnreadCount]);

      // Format time ago
      const formatTimeAgo = (dateString: string): string => {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return t("notification.justNow") || "Just now";
            if (diffMins < 60) return `${diffMins} ${t("notification.minutesAgo") || "min ago"}`;
            if (diffHours < 24) return `${diffHours} ${t("notification.hoursAgo") || "hours ago"}`;
            return `${diffDays} ${t("notification.daysAgo") || "days ago"}`;
      };

      const handleNotificationClick = async (notification: InAppNotification) => {
            // TODO: Mark as read via API
            // await notificationService.markAsRead(notification.id);

            if (notification.actionUrl) {
                  router.push(notification.actionUrl);
            }
      };

      const handleViewAll = () => {
            router.push(notificationsPageUrl);
      };

      return (
            <DropdownMenu onOpenChange={(open) => open && fetchRecentNotifications()}>
                  <DropdownMenuTrigger asChild>
                        <Button
                              variant="ghost"
                              size="icon"
                              className={cn("relative hover:bg-accent hover:text-accent-foreground", className)}
                              title={t("notification.title") || "Notifications"}
                        >
                              <Bell className="w-5 h-5" />
                              {unreadCount > 0 && (
                                    <Badge
                                          variant="destructive"
                                          className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                                    >
                                          {unreadCount > 99 ? "99+" : unreadCount}
                                    </Badge>
                              )}
                        </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                        <div className="flex items-center justify-between px-4 py-2 border-b">
                              <span className="font-semibold text-sm">
                                    {t("notification.title") || "Notifications"}
                              </span>
                              {unreadCount > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                          {unreadCount} {t("notification.unread") || "unread"}
                                    </Badge>
                              )}
                        </div>

                        {loading ? (
                              <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                              </div>
                        ) : notifications.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                    <Bell className="w-8 h-8 mb-2 opacity-50" />
                                    <span className="text-sm">
                                          {t("notification.empty") || "No notifications"}
                                    </span>
                              </div>
                        ) : (
                              <>
                                    {notifications.map((notification) => (
                                          <DropdownMenuItem
                                                key={notification.id}
                                                className={cn(
                                                      "flex flex-col items-start gap-1 p-3 cursor-pointer",
                                                      !notification.isRead && "bg-primary/5"
                                                )}
                                                onClick={() => handleNotificationClick(notification)}
                                          >
                                                <div className="flex items-start justify-between w-full gap-2">
                                                      <span className={cn(
                                                            "text-sm font-medium line-clamp-1",
                                                            !notification.isRead && "font-semibold"
                                                      )}>
                                                            {notification.title}
                                                      </span>
                                                      {!notification.isRead && (
                                                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                                                      )}
                                                </div>
                                                <span className="text-xs text-muted-foreground line-clamp-2">
                                                      {notification.message}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                      {formatTimeAgo(notification.createdAt)}
                                                </span>
                                          </DropdownMenuItem>
                                    ))}
                              </>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                              className="flex items-center justify-center py-2 text-primary cursor-pointer"
                              onClick={handleViewAll}
                        >
                              {t("notification.viewAll") || "View All Notifications"}
                        </DropdownMenuItem>
                  </DropdownMenuContent>
            </DropdownMenu>
      );
}
