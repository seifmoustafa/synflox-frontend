/**
 * NotificationDropdown Component
 * 
 * Dropdown showing recent notifications with actions.
 * Used inside NotificationBell component.
 */

'use client';

import { cn } from '../../lib/utils';
import type { InAppNotification } from '../../domain/models/in-app-notification.model';
import { NotificationItem } from './notification-item';
import { Button } from './button';
import { ScrollArea } from './scroll-area';
import { Bell, CheckCheck, ExternalLink, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NotificationDropdownProps {
      notifications: InAppNotification[];
      unreadCount: number;
      isLoading?: boolean;
      onMarkAsRead?: (id: string) => void;
      onMarkAllAsRead?: () => void;
      onNotificationClick?: (notification: InAppNotification) => void;
      onClose?: () => void;
      notificationsPageUrl?: string;
      className?: string;
      t?: (key: string) => string;
}

export function NotificationDropdown({
      notifications,
      unreadCount,
      isLoading = false,
      onMarkAsRead,
      onMarkAllAsRead,
      onNotificationClick,
      onClose,
      notificationsPageUrl = '/notifications',
      className,
      t = (key) => key,
}: NotificationDropdownProps) {
      const router = useRouter();

      // Ensure notifications is always an array
      const safeNotifications = Array.isArray(notifications) ? notifications : [];
      const safeUnreadCount = typeof unreadCount === 'number' ? unreadCount : 0;

      const handleViewAll = () => {
            onClose?.();
            router.push(notificationsPageUrl);
      };

      const handleNotificationClick = (notification: InAppNotification) => {
            onNotificationClick?.(notification);
            onClose?.();

            // Navigate if there's an action URL
            if (notification.actionUrl) {
                  router.push(notification.actionUrl);
            }
      };

      return (
            <div
                  className={cn(
                        'w-[400px] max-w-[calc(100vw-32px)] bg-popover border border-border rounded-xl shadow-2xl',
                        'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
                        className
                  )}
            >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-transparent rounded-t-xl">
                        <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                    <Bell className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                    <h3 className="font-semibold text-base">{t('notification.title') || 'Notifications'}</h3>
                                    {safeUnreadCount > 0 && (
                                          <p className="text-xs text-muted-foreground">
                                                {safeUnreadCount} {t('notification.unread') || 'unread'}
                                          </p>
                                    )}
                              </div>
                        </div>
                        {safeUnreadCount > 0 && onMarkAllAsRead && (
                              <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onMarkAllAsRead}
                                    className="text-xs hover:bg-primary/10 hover:text-primary"
                              >
                                    <CheckCheck className="w-4 h-4 mr-1" />
                                    {t('notification.markAllRead') || 'Mark all read'}
                              </Button>
                        )}
                  </div>

                  {/* Notification List */}
                  <ScrollArea className="max-h-[450px]">
                        {isLoading ? (
                              <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                              </div>
                        ) : safeNotifications.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                                    <div className="p-4 rounded-full bg-muted mb-4">
                                          <Bell className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <p className="font-medium text-foreground mb-1">
                                          {t('notification.empty') || 'No notifications'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                          {t('notification.emptyDesc') || 'When you receive notifications, they will appear here.'}
                                    </p>
                              </div>
                        ) : (
                              <div className="divide-y divide-border/50">
                                    {safeNotifications.map((notification) => (
                                          <NotificationItem
                                                key={notification.id}
                                                notification={notification}
                                                onClick={handleNotificationClick}
                                                onMarkAsRead={onMarkAsRead}
                                                compact
                                          />
                                    ))}
                              </div>
                        )}
                  </ScrollArea>

                  {/* Footer */}
                  <div className="p-3 border-t bg-muted/30 rounded-b-xl">
                        <Button
                              variant="ghost"
                              className="w-full text-sm font-medium hover:bg-primary/10 hover:text-primary"
                              onClick={handleViewAll}
                        >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              {t('notification.viewAll') || 'View all notifications'}
                        </Button>
                  </div>
            </div>
      );
}

