/**
 * NotificationBell Component
 * 
 * Bell icon with badge showing unread count and dropdown on click.
 * Used in the app header for quick notification access.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { NotificationDropdown } from './notification-dropdown';
import { Bell } from 'lucide-react';
import type { InAppNotification } from '../../domain/models/in-app-notification.model';

interface NotificationBellProps {
      notifications: InAppNotification[];
      unreadCount: number;
      isLoading?: boolean;
      onMarkAsRead?: (id: string) => void;
      onMarkAllAsRead?: () => void;
      onNotificationClick?: (notification: InAppNotification) => void;
      onOpen?: () => void;
      notificationsPageUrl?: string;
      className?: string;
      t?: (key: string) => string;
}

export function NotificationBell({
      notifications,
      unreadCount,
      isLoading = false,
      onMarkAsRead,
      onMarkAllAsRead,
      onNotificationClick,
      onOpen,
      notificationsPageUrl = '/notifications',
      className,
      t,
}: NotificationBellProps) {
      const [isOpen, setIsOpen] = useState(false);
      const containerRef = useRef<HTMLDivElement>(null);

      // Close dropdown when clicking outside
      useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                  if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                        setIsOpen(false);
                  }
            };

            if (isOpen) {
                  document.addEventListener('mousedown', handleClickOutside);
            }

            return () => {
                  document.removeEventListener('mousedown', handleClickOutside);
            };
      }, [isOpen]);

      // Close on escape key
      useEffect(() => {
            const handleEscape = (event: KeyboardEvent) => {
                  if (event.key === 'Escape') {
                        setIsOpen(false);
                  }
            };

            if (isOpen) {
                  document.addEventListener('keydown', handleEscape);
            }

            return () => {
                  document.removeEventListener('keydown', handleEscape);
            };
      }, [isOpen]);

      const handleToggle = () => {
            const newState = !isOpen;
            setIsOpen(newState);
            if (newState && onOpen) {
                  onOpen();
            }
      };

      return (
            <div ref={containerRef} className={cn('relative', className)}>
                  {/* Bell Button */}
                  <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggle}
                        className={cn(
                              'relative hover-lift',
                              isOpen && 'bg-accent'
                        )}
                        aria-label="Notifications"
                  >
                        <Bell className={cn('w-5 h-5', unreadCount > 0 && 'animate-wiggle')} />

                        {/* Badge */}
                        {unreadCount > 0 && (
                              <span
                                    className={cn(
                                          'absolute -top-1 -right-1 flex items-center justify-center',
                                          'min-w-[18px] h-[18px] px-1 text-[10px] font-bold',
                                          'rounded-full bg-destructive text-destructive-foreground',
                                          'animate-in zoom-in-50'
                                    )}
                              >
                                    {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                        )}
                  </Button>

                  {/* Dropdown */}
                  {isOpen && (
                        <>
                              {/* Backdrop for mobile */}
                              <div
                                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                                    onClick={() => setIsOpen(false)}
                              />

                              {/* Dropdown content */}
                              <div className="absolute right-0 top-full mt-2 z-50">
                                    <NotificationDropdown
                                          notifications={notifications}
                                          unreadCount={unreadCount}
                                          isLoading={isLoading}
                                          onMarkAsRead={onMarkAsRead}
                                          onMarkAllAsRead={onMarkAllAsRead}
                                          onNotificationClick={onNotificationClick}
                                          onClose={() => setIsOpen(false)}
                                          notificationsPageUrl={notificationsPageUrl}
                                          t={t}
                                    />
                              </div>
                        </>
                  )}
            </div>
      );
}

// Export a styled version with CSS animation
export const bellAnimationStyles = `
@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  15% { transform: rotate(-12deg); }
  30% { transform: rotate(9deg); }
  45% { transform: rotate(-6deg); }
  60% { transform: rotate(3deg); }
  75% { transform: rotate(-1deg); }
}

.animate-wiggle {
  animation: wiggle 0.6s ease-in-out;
}
`;
