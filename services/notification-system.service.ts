/**
 * Notification System Service
 *
 * Handles in-system notification operations with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  SystemNotification,
  NotificationSystemMapper,
  UnreadCountResponse,
  type SystemNotificationsResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface INotificationSystemService {
  getNotifications(params?: {
    page?: number;
    pageSize?: number;
    companyId?: string;
    isRead?: boolean;
    type?: number;
  }): Promise<SystemNotificationsResponse>;
  getCompanyNotifications(companyId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<SystemNotificationsResponse>;
  getUnreadCount(companyId?: string): Promise<UnreadCountResponse>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(companyId: string): Promise<void>;
}

export class NotificationSystemService implements INotificationSystemService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getNotifications(params?: {
    page?: number;
    pageSize?: number;
    companyId?: string;
    isRead?: boolean;
    type?: number;
  }): Promise<SystemNotificationsResponse> {
    try {
      // SYNFLOX API: GET /api/notifications
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.NOTIFICATIONS_GET_ALL,
        params
      );
      return NotificationSystemMapper.handleApiResponse(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async getCompanyNotifications(companyId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<SystemNotificationsResponse> {
    try {
      // SYNFLOX API: GET /api/notifications/company/{companyId}
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.NOTIFICATIONS_GET_BY_COMPANY}/${companyId}`,
        params
      );
      return NotificationSystemMapper.handleApiResponse(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async getUnreadCount(companyId?: string): Promise<UnreadCountResponse> {
    try {
      // SYNFLOX API: GET /api/notifications/company/{companyId}/unread-count
      // or GET /api/notifications/unread-count (for all)
      const endpoint = companyId 
        ? `${API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT}/${companyId}/unread-count`
        : `${API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT}/unread-count`;
      const response = await this.apiService.get<any>(endpoint);
      return NotificationSystemMapper.unreadCountFromJson(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      // SYNFLOX API: PUT /api/notifications/{id}/read
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.NOTIFICATIONS_MARK_READ}/${notificationId}/read`,
        {}
      );
      const message = response?.message || "Notification marked as read";
      this.notificationService.success(message);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async markAllAsRead(companyId: string): Promise<void> {
    try {
      // SYNFLOX API: PUT /api/notifications/company/{companyId}/mark-all-read
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ}/${companyId}/mark-all-read`,
        {}
      );
      const message = response?.message || "All notifications marked as read";
      this.notificationService.success(message);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }
}

