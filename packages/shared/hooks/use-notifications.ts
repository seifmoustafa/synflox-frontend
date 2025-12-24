/**
 * useNotifications Hook
 * 
 * React hook for managing in-app notifications with real-time SignalR support.
 * Provides state, actions, and automatic refresh on SignalR events.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
      InAppNotification,
      InAppNotificationPreferences,
      RealTimeNotification,
} from '../domain/models/in-app-notification.model';
import type { IInAppNotificationApiService } from '../services/in-app-notification-api.service';
import { toast } from '../hooks/use-enhanced-toast';

export interface UseNotificationsOptions {
      /** API service instance */
      api: IInAppNotificationApiService;
      /** SignalR hub URL (optional) */
      signalRHubUrl?: string;
      /** Auto-fetch on mount */
      autoFetch?: boolean;
      /** Poll interval in ms (0 = disabled) */
      pollInterval?: number;
      /** Show toast for new notifications */
      showToastOnNew?: boolean;
      /** Play sound on new notification */
      playSound?: boolean;
}

export interface UseNotificationsReturn {
      // State
      notifications: InAppNotification[];
      recentNotifications: InAppNotification[];
      unreadCount: number;
      isLoading: boolean;
      isConnected: boolean;
      error: Error | null;
      preferences: InAppNotificationPreferences | null;

      // Actions
      refresh: () => Promise<void>;
      refreshUnreadCount: () => Promise<void>;
      markAsRead: (id: string) => Promise<void>;
      markAllAsRead: () => Promise<void>;
      deleteNotification: (id: string) => Promise<void>;
      updatePreferences: (prefs: InAppNotificationPreferences) => Promise<void>;
      loadMore: () => Promise<void>;
      hasMore: boolean;
}

export function useNotifications(options: UseNotificationsOptions): UseNotificationsReturn {
      const {
            api,
            signalRHubUrl,
            autoFetch = true,
            pollInterval = 0,
            showToastOnNew = true,
            playSound = false,
      } = options;

      // State
      const [notifications, setNotifications] = useState<InAppNotification[]>([]);
      const [recentNotifications, setRecentNotifications] = useState<InAppNotification[]>([]);
      const [unreadCount, setUnreadCount] = useState(0);
      const [isLoading, setIsLoading] = useState(false);
      const [isConnected, setIsConnected] = useState(false);
      const [error, setError] = useState<Error | null>(null);
      const [preferences, setPreferences] = useState<InAppNotificationPreferences | null>(null);
      const [page, setPage] = useState(1);
      const [hasMore, setHasMore] = useState(true);

      // Refs for SignalR connection
      const connectionRef = useRef<any>(null);
      const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

      /**
       * Refresh unread count
       */
      const refreshUnreadCount = useCallback(async () => {
            try {
                  const count = await api.getUnreadCount();
                  setUnreadCount(count);
            } catch (err) {
                  console.error('Failed to fetch unread count:', err);
            }
      }, [api]);

      /**
       * Refresh recent notifications (for dropdown)
       */
      const refreshRecent = useCallback(async () => {
            try {
                  const recent = await api.getRecentNotifications(5);
                  setRecentNotifications(recent);
            } catch (err) {
                  console.error('Failed to fetch recent notifications:', err);
            }
      }, [api]);

      /**
       * Full refresh
       */
      const refresh = useCallback(async () => {
            // Skip if not authenticated
            if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
                  return;
            }

            setIsLoading(true);
            setError(null);
            try {
                  const [notifList, recent, count] = await Promise.all([
                        api.getNotifications(1, 20),
                        api.getRecentNotifications(5),
                        api.getUnreadCount(),
                  ]);
                  setNotifications(notifList.items);
                  setRecentNotifications(recent);
                  setUnreadCount(count);
                  setPage(1);
                  setHasMore(notifList.hasMore);
            } catch {
                  // Silently fail - backend might not be running or user not authenticated
                  // This is normal during development without backend
            } finally {
                  setIsLoading(false);
            }
      }, [api]);

      /**
       * Load more notifications (pagination)
       */
      const loadMore = useCallback(async () => {
            if (!hasMore || isLoading) return;

            setIsLoading(true);
            try {
                  const nextPage = page + 1;
                  const notifList = await api.getNotifications(nextPage, 20);
                  setNotifications(prev => [...prev, ...notifList.items]);
                  setPage(nextPage);
                  setHasMore(notifList.hasMore);
            } catch (err) {
                  console.error('Failed to load more notifications:', err);
            } finally {
                  setIsLoading(false);
            }
      }, [api, page, hasMore, isLoading]);

      /**
       * Mark notification as read
       */
      const markAsRead = useCallback(async (id: string) => {
            try {
                  await api.markAsRead(id);
                  // Update local state
                  setNotifications(prev =>
                        prev.map(n => (n.id === id ? { ...n, isRead: true, readAtUtc: new Date().toISOString() } : n))
                  );
                  setRecentNotifications(prev =>
                        prev.map(n => (n.id === id ? { ...n, isRead: true, readAtUtc: new Date().toISOString() } : n))
                  );
                  setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (err) {
                  console.error('Failed to mark as read:', err);
                  throw err;
            }
      }, [api]);

      /**
       * Mark all as read
       */
      const markAllAsRead = useCallback(async () => {
            try {
                  await api.markAllAsRead();
                  const now = new Date().toISOString();
                  setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAtUtc: now })));
                  setRecentNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAtUtc: now })));
                  setUnreadCount(0);
            } catch (err) {
                  console.error('Failed to mark all as read:', err);
                  throw err;
            }
      }, [api]);

      /**
       * Delete notification
       */
      const deleteNotification = useCallback(async (id: string) => {
            const notification = notifications.find(n => n.id === id);
            try {
                  await api.deleteNotification(id);
                  setNotifications(prev => prev.filter(n => n.id !== id));
                  setRecentNotifications(prev => prev.filter(n => n.id !== id));
                  if (notification && !notification.isRead) {
                        setUnreadCount(prev => Math.max(0, prev - 1));
                  }
            } catch (err) {
                  console.error('Failed to delete notification:', err);
                  throw err;
            }
      }, [api, notifications]);

      /**
       * Update preferences
       */
      const updatePreferences = useCallback(async (prefs: InAppNotificationPreferences) => {
            try {
                  const updated = await api.updatePreferences(prefs);
                  setPreferences(updated);
            } catch (err) {
                  console.error('Failed to update preferences:', err);
                  throw err;
            }
      }, [api]);

      /**
       * Handle new notification from SignalR
       */
      const handleNewNotification = useCallback((notification: RealTimeNotification) => {
            // Add to lists
            const newNotif: InAppNotification = {
                  id: notification.id,
                  type: notification.type,
                  category: notification.type.split('_')[0] || 'general',
                  title: notification.title,
                  message: notification.message,
                  priority: notification.priority as any,
                  icon: notification.icon,
                  actionUrl: notification.actionUrl,
                  isRead: false,
                  readAtUtc: null,
                  createdAtUtc: notification.createdAtUtc,
                  timeAgo: 'Just now',
            };

            setNotifications(prev => [newNotif, ...prev]);
            setRecentNotifications(prev => [newNotif, ...prev.slice(0, 4)]);
            setUnreadCount(notification.newUnreadCount);

            // Show toast
            if (showToastOnNew) {
                  toast({
                        title: notification.title,
                        description: notification.message,
                        variant: notification.priority === 'urgent' ? 'destructive' : 'default',
                  });
            }

            // Play sound
            if (playSound) {
                  try {
                        const audio = new Audio('/sounds/notification.mp3');
                        audio.volume = 0.5;
                        audio.play().catch(() => { });
                  } catch { }
            }
      }, [showToastOnNew, playSound]);

      /**
       * Initialize SignalR connection
       */
      useEffect(() => {
            if (!signalRHubUrl) return;

            // Only connect if user has a token (is authenticated)
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!token) {
                  // Not authenticated, skip SignalR connection
                  return;
            }

            let hubConnection: any = null;

            const connectSignalR = async () => {
                  try {
                        // Dynamic import for @microsoft/signalr
                        const signalR = await import('@microsoft/signalr');

                        hubConnection = new signalR.HubConnectionBuilder()
                              .withUrl(signalRHubUrl, {
                                    accessTokenFactory: () => {
                                          // Get token from storage
                                          if (typeof window !== 'undefined') {
                                                return localStorage.getItem('accessToken') || '';
                                          }
                                          return '';
                                    },
                              })
                              .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Retry with backoff
                              .configureLogging(signalR.LogLevel.None) // Completely silent
                              .build();

                        // Register event handlers
                        hubConnection.on('ReceiveNotification', handleNewNotification);
                        hubConnection.on('UpdateUnreadCount', (count: number) => {
                              setUnreadCount(count);
                        });

                        // Connection state changes
                        hubConnection.onreconnecting(() => setIsConnected(false));
                        hubConnection.onreconnected(() => setIsConnected(true));
                        hubConnection.onclose(() => setIsConnected(false));

                        // Start connection
                        await hubConnection.start();
                        setIsConnected(true);
                        connectionRef.current = hubConnection;

                        // Only log success in development
                        if (process.env.NODE_ENV === 'development') {
                              console.log('SignalR connected to notifications hub');
                        }
                  } catch {
                        // Silently fail - backend might not be running
                        setIsConnected(false);
                  }
            };

            connectSignalR();

            return () => {
                  if (hubConnection) {
                        hubConnection.stop();
                  }
            };
      }, [signalRHubUrl, handleNewNotification]);

      /**
       * Initial fetch
       */
      useEffect(() => {
            if (autoFetch) {
                  refresh();
            }
      }, [autoFetch, refresh]);

      /**
       * Polling fallback (if SignalR not available)
       */
      useEffect(() => {
            if (pollInterval > 0 && !signalRHubUrl) {
                  pollTimerRef.current = setInterval(() => {
                        refreshUnreadCount();
                        refreshRecent();
                  }, pollInterval);

                  return () => {
                        if (pollTimerRef.current) {
                              clearInterval(pollTimerRef.current);
                        }
                  };
            }
      }, [pollInterval, signalRHubUrl, refreshUnreadCount, refreshRecent]);

      return {
            notifications,
            recentNotifications,
            unreadCount,
            isLoading,
            isConnected,
            error,
            preferences,
            refresh,
            refreshUnreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            updatePreferences,
            loadMore,
            hasMore,
      };
}
