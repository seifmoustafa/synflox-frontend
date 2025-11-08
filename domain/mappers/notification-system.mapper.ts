/**
 * Notification System Mappers
 * 
 * Handles conversion between notification system domain models and external data formats.
 */

import {
  SystemNotification,
  SystemNotificationType,
  UnreadCountResponse,
  type SystemNotificationData,
  type SystemNotificationsResponseData,
  type UnreadCountResponseData,
} from '../models/notification-system.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface SystemNotificationsResponse {
  data: SystemNotification[];
  pagination: PaginationInfo;
}

export class NotificationSystemMapper {
  /**
   * Convert JSON/API response to SystemNotification domain model
   */
  static fromJson(json: any): SystemNotification {
    return new SystemNotification({
      id: json.id || '',
      companyId: json.companyId || '',
      type: json.type || SystemNotificationType.General,
      title: json.title || '',
      message: json.message || '',
      isRead: json.isRead ?? false,
      readAt: json.readAt,
      createdAt: json.createdAt || json.createdTimestamp || new Date().toISOString(),
    });
  }

  /**
   * Convert SystemNotification domain model to JSON for API requests
   */
  static toJson(notification: SystemNotification): any {
    return {
      id: notification.id,
      companyId: notification.companyId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }

  /**
   * Handle different API response formats and convert to SystemNotificationsResponse
   */
  static handleApiResponse(response: any): SystemNotificationsResponse {
    // Handle format: { data: [...], pagination: {...} } (direct array with pagination)
    if (response && typeof response === 'object' && 'data' in response && 'pagination' in response) {
      if (Array.isArray(response.data)) {
        const pagination = response.pagination || {};
        return {
          data: response.data.map((item: any) => this.fromJson(item)),
          pagination: {
            itemsCount: pagination.itemsCount || pagination.totalItems || 0,
            pageSize: pagination.pageSize || 10,
            page: pagination.currentPage || pagination.page || 1,
            pagesCount: pagination.pagesCount || pagination.totalPages || 0,
          }
        };
      }
    }

    // Handle SYNFLOX backend response format: { statusCode, message, data: { notifications, pagination } }
    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data;
      if (data && typeof data === 'object') {
        // Check if it's an array directly
        if (Array.isArray(data)) {
          const pagination = response.pagination || {};
          return {
            data: data.map((item: any) => this.fromJson(item)),
            pagination: {
              itemsCount: pagination.itemsCount || pagination.totalItems || data.length,
              pageSize: pagination.pageSize || 10,
              page: pagination.currentPage || pagination.page || 1,
              pagesCount: pagination.pagesCount || pagination.totalPages || 1,
            }
          };
        }
        // Check if it has notifications property
        if ('notifications' in data) {
          const pagination = data.pagination || {};
          return {
            data: Array.isArray(data.notifications) 
              ? data.notifications.map((item: any) => this.fromJson(item))
              : [],
            pagination: {
              itemsCount: pagination.itemsCount || pagination.totalItems || 0,
              pageSize: pagination.pageSize || 10,
              page: pagination.currentPage || pagination.page || 1,
              pagesCount: pagination.pagesCount || pagination.totalPages || 0,
            }
          };
        }
      }
    }

    // Handle direct array response
    if (Array.isArray(response)) {
      return {
        data: response.map((item: any) => this.fromJson(item)),
        pagination: {
          itemsCount: response.length,
          pageSize: response.length,
          page: 1,
          pagesCount: 1,
        }
      };
    }

    // Fallback for unexpected response format
    return {
      data: [],
      pagination: {
        itemsCount: 0,
        pageSize: 10,
        page: 1,
        pagesCount: 0,
      }
    };
  }

  /**
   * Convert API response to UnreadCountResponse
   */
  static unreadCountFromJson(json: any): UnreadCountResponse {
    const data = json?.data || json;
    return new UnreadCountResponse({
      count: data.count || data.unreadCount || 0,
    });
  }
}

