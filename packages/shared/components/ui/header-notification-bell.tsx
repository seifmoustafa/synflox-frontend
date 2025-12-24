/**
 * HeaderNotificationBell
 * 
 * Pre-wired NotificationBell that uses the NotificationProvider context.
 * Drop-in replacement for the Bell button in headers.
 */

'use client';

import { useNotificationContextOptional } from '../../providers/notification-provider';
import { NotificationBell } from './notification-bell';
import { Button } from './button';
import { Bell } from 'lucide-react';
import { useI18n } from '../../providers/i18n-provider';
import { cn } from '../../lib/utils';

interface HeaderNotificationBellProps {
      notificationsPageUrl?: string;
      className?: string;
}

export function HeaderNotificationBell({
      notificationsPageUrl = '/notifications',
      className,
}: HeaderNotificationBellProps) {
      const notifications = useNotificationContextOptional();
      const { t } = useI18n();

      // If provider not available, show basic bell
      if (!notifications) {
            return (
                  <Button variant="ghost" size="icon" className={cn('hover-lift', className)}>
                        <Bell className="w-5 h-5" />
                  </Button>
            );
      }

      // Ensure recentNotifications is always an array
      const safeNotifications = Array.isArray(notifications.recentNotifications)
            ? notifications.recentNotifications
            : [];

      return (
            <NotificationBell
                  notifications={safeNotifications}
                  unreadCount={notifications.unreadCount ?? 0}
                  isLoading={notifications.isLoading ?? false}
                  onMarkAsRead={notifications.markAsRead}
                  onMarkAllAsRead={notifications.markAllAsRead}
                  onOpen={notifications.refresh}
                  notificationsPageUrl={notificationsPageUrl}
                  className={className}
                  t={t}
            />
      );
}
