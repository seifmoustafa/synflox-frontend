/**
 * NotificationProvider
 * 
 * Context provider for notifications that wraps the app.
 * Provides notification state and actions to all components.
 */

'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useNotifications, type UseNotificationsReturn } from '../hooks/use-notifications';
import { createInAppNotificationApi, type IInAppNotificationApiService } from '../services/in-app-notification-api.service';

interface NotificationProviderProps {
      children: React.ReactNode;
      /** API client with auth headers configured */
      apiClient: {
            get<T>(endpoint: string, params?: Record<string, any>): Promise<T>;
            post<T>(endpoint: string, data?: any): Promise<T>;
            put<T>(endpoint: string, data?: any): Promise<T>;
            delete<T>(endpoint: string): Promise<T>;
      };
      /** Base API path (default: /api/notifications) */
      basePath?: string;
      /** SignalR hub URL (optional for real-time) */
      signalRHubUrl?: string;
      /** Show toast on new notification */
      showToastOnNew?: boolean;
      /** Polling interval if SignalR not available (ms) */
      pollInterval?: number;
}

const NotificationContext = createContext<UseNotificationsReturn | null>(null);

export function NotificationProvider({
      children,
      apiClient,
      basePath = '/api/notifications',
      signalRHubUrl,
      showToastOnNew = true,
      pollInterval = 30000, // 30 seconds default
}: NotificationProviderProps) {
      // Create API service
      const api = useMemo<IInAppNotificationApiService>(
            () => createInAppNotificationApi(apiClient, basePath),
            [apiClient, basePath]
      );

      // Use notifications hook
      const notificationState = useNotifications({
            api,
            signalRHubUrl,
            autoFetch: true,
            pollInterval: signalRHubUrl ? 0 : pollInterval, // Only poll if no SignalR
            showToastOnNew,
            playSound: false,
      });

      return (
            <NotificationContext.Provider value={notificationState}>
                  {children}
            </NotificationContext.Provider>
      );
}

/**
 * Hook to access notification state and actions
 */
export function useNotificationContext(): UseNotificationsReturn {
      const context = useContext(NotificationContext);
      if (!context) {
            throw new Error('useNotificationContext must be used within NotificationProvider');
      }
      return context;
}

/**
 * Hook that returns null if not in provider (for optional usage)
 */
export function useNotificationContextOptional(): UseNotificationsReturn | null {
      return useContext(NotificationContext);
}
