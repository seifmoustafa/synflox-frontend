/**
 * NotificationItem Component
 * 
 * Displays a single notification with icon, title, message, and time.
 * Handles read/unread state and priority indicators.
 */

'use client';

import { cn } from '../../lib/utils';
import type { InAppNotification } from '../../domain/models/in-app-notification.model';
import { getNotificationIcon } from '../../domain/models/in-app-notification.model';
import {
      Bell,
      CreditCard,
      Shield,
      Monitor,
      Settings,
      Gift,
      AlertCircle,
      AlertTriangle,
      Calendar,
      Check,
      Clock,
      X,
} from 'lucide-react';

interface NotificationItemProps {
      notification: InAppNotification;
      onClick?: (notification: InAppNotification) => void;
      onMarkAsRead?: (id: string) => void;
      onDelete?: (id: string) => void;
      compact?: boolean;
      className?: string;
}

const iconMap: Record<string, any> = {
      bell: Bell,
      'credit-card': CreditCard,
      shield: Shield,
      monitor: Monitor,
      cog: Settings,
      settings: Settings,
      gift: Gift,
      'alert-circle': AlertCircle,
      'alert-triangle': AlertTriangle,
      calendar: Calendar,
      'calendar-warning': Calendar,
      clock: Clock,
      check: Check,
};

export function NotificationItem({
      notification,
      onClick,
      onMarkAsRead,
      onDelete,
      compact = false,
      className,
}: NotificationItemProps) {
      const iconName = getNotificationIcon(notification.type, notification.icon);
      const IconComponent = iconMap[iconName] || Bell;

      const priorityStyles = {
            urgent: 'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-900/10',
            high: 'border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10',
            normal: '',
            low: 'opacity-80',
      };

      const handleClick = () => {
            if (onClick) {
                  onClick(notification);
            }
            if (onMarkAsRead && !notification.isRead) {
                  onMarkAsRead(notification.id);
            }
      };

      return (
            <div
                  className={cn(
                        'group relative flex gap-3 p-3 rounded-lg transition-colors cursor-pointer',
                        'hover:bg-accent/50',
                        !notification.isRead && 'bg-accent/30',
                        priorityStyles[notification.priority] || '',
                        compact && 'p-2 gap-2',
                        className
                  )}
                  onClick={handleClick}
            >
                  {/* Unread indicator */}
                  {!notification.isRead && (
                        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}

                  {/* Icon */}
                  <div
                        className={cn(
                              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                              notification.priority === 'urgent'
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
                                    : notification.priority === 'high'
                                          ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400'
                                          : 'bg-primary/10 text-primary',
                              compact && 'w-8 h-8'
                        )}
                  >
                        <IconComponent className={cn('w-5 h-5', compact && 'w-4 h-4')} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                              <h4
                                    className={cn(
                                          'font-medium text-sm truncate',
                                          !notification.isRead && 'font-semibold'
                                    )}
                              >
                                    {notification.title}
                              </h4>
                              {!compact && (
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                          {notification.timeAgo}
                                    </span>
                              )}
                        </div>
                        <p
                              className={cn(
                                    'text-sm text-muted-foreground mt-0.5',
                                    compact ? 'line-clamp-1' : 'line-clamp-2'
                              )}
                        >
                              {notification.message}
                        </p>
                        {compact && (
                              <span className="text-xs text-muted-foreground mt-1">
                                    {notification.timeAgo}
                              </span>
                        )}
                  </div>

                  {/* Actions (visible on hover) */}
                  {!compact && (onMarkAsRead || onDelete) && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {onMarkAsRead && !notification.isRead && (
                                    <button
                                          onClick={(e) => {
                                                e.stopPropagation();
                                                onMarkAsRead(notification.id);
                                          }}
                                          className="p-1 rounded hover:bg-background"
                                          title="Mark as read"
                                    >
                                          <Check className="w-4 h-4 text-muted-foreground" />
                                    </button>
                              )}
                              {onDelete && (
                                    <button
                                          onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(notification.id);
                                          }}
                                          className="p-1 rounded hover:bg-destructive/10"
                                          title="Delete"
                                    >
                                          <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                    </button>
                              )}
                        </div>
                  )}
            </div>
      );
}
