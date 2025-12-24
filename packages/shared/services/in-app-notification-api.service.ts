/**
 * In-App Notification API Service
 * 
 * Provides methods for interacting with the backend notification API.
 * Works with both Admin and Client portals.
 */

import type {
      InAppNotification,
      InAppNotificationList,
      InAppNotificationPreferences,
      RegisterPushSubscription,
} from '../domain/models/in-app-notification.model';

export interface IInAppNotificationApiService {
      getNotifications(page?: number, pageSize?: number, unreadOnly?: boolean): Promise<InAppNotificationList>;
      getRecentNotifications(count?: number): Promise<InAppNotification[]>;
      getUnreadCount(): Promise<number>;
      markAsRead(id: string): Promise<boolean>;
      markAllAsRead(): Promise<number>;
      deleteNotification(id: string): Promise<boolean>;
      getPreferences(): Promise<InAppNotificationPreferences>;
      updatePreferences(preferences: InAppNotificationPreferences): Promise<InAppNotificationPreferences>;
      registerPushSubscription(subscription: RegisterPushSubscription): Promise<boolean>;
      unregisterPushSubscription(endpoint: string): Promise<boolean>;
}

/**
 * Creates an in-app notification API service using the provided API client.
 * This factory pattern allows different auth mechanisms (Admin JWT vs Client Session).
 */
export function createInAppNotificationApi(
      apiClient: {
            get<T>(endpoint: string, params?: Record<string, any>): Promise<T>;
            post<T>(endpoint: string, data?: any): Promise<T>;
            put<T>(endpoint: string, data?: any): Promise<T>;
            delete<T>(endpoint: string): Promise<T>;
      },
      basePath: string = '/api/notifications'
): IInAppNotificationApiService {
      return {
            /**
             * Get paginated notifications
             */
            async getNotifications(
                  page: number = 1,
                  pageSize: number = 20,
                  unreadOnly: boolean = false
            ): Promise<InAppNotificationList> {
                  return apiClient.get<InAppNotificationList>(basePath, {
                        page: page.toString(),
                        pageSize: pageSize.toString(),
                        unreadOnly: unreadOnly.toString(),
                  });
            },

            /**
             * Get recent notifications for dropdown
             */
            async getRecentNotifications(count: number = 5): Promise<InAppNotification[]> {
                  return apiClient.get<InAppNotification[]>(`${basePath}/recent`, {
                        count: count.toString(),
                  });
            },

            /**
             * Get unread notification count
             */
            async getUnreadCount(): Promise<number> {
                  const response = await apiClient.get<{ unreadCount: number }>(`${basePath}/unread-count`);
                  return response.unreadCount;
            },

            /**
             * Mark a notification as read
             */
            async markAsRead(id: string): Promise<boolean> {
                  await apiClient.post<void>(`${basePath}/${id}/read`);
                  return true;
            },

            /**
             * Mark all notifications as read
             */
            async markAllAsRead(): Promise<number> {
                  const response = await apiClient.post<{ markedCount: number }>(`${basePath}/read-all`);
                  return response.markedCount;
            },

            /**
             * Delete a notification
             */
            async deleteNotification(id: string): Promise<boolean> {
                  await apiClient.delete<void>(`${basePath}/${id}`);
                  return true;
            },

            /**
             * Get notification preferences
             */
            async getPreferences(): Promise<InAppNotificationPreferences> {
                  return apiClient.get<InAppNotificationPreferences>(`${basePath}/preferences`);
            },

            /**
             * Update notification preferences
             */
            async updatePreferences(
                  preferences: InAppNotificationPreferences
            ): Promise<InAppNotificationPreferences> {
                  return apiClient.put<InAppNotificationPreferences>(`${basePath}/preferences`, preferences);
            },

            /**
             * Register push subscription
             */
            async registerPushSubscription(subscription: RegisterPushSubscription): Promise<boolean> {
                  await apiClient.post<void>(`${basePath}/push/subscribe`, subscription);
                  return true;
            },

            /**
             * Unregister push subscription
             */
            async unregisterPushSubscription(endpoint: string): Promise<boolean> {
                  await apiClient.delete<void>(`${basePath}/push/unsubscribe?endpoint=${encodeURIComponent(endpoint)}`);
                  return true;
            },
      };
}
