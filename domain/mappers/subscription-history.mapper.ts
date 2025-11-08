/**
 * Subscription History Mappers
 * 
 * Handles conversion between subscription history domain models and external data formats.
 */

import {
  SubscriptionHistory,
  SubscriptionHistoryActionType,
  type SubscriptionHistoryData,
  type SubscriptionHistoryResponseData,
} from '../models/subscription-history.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface SubscriptionHistoryResponse {
  data: SubscriptionHistory[];
  pagination: PaginationInfo;
}

export class SubscriptionHistoryMapper {
  /**
   * Convert JSON/API response to SubscriptionHistory domain model
   */
  static fromJson(json: any): SubscriptionHistory {
    return new SubscriptionHistory({
      id: json.id || '',
      companyId: json.companyId || '',
      actionType: json.actionType || SubscriptionHistoryActionType.Updated,
      actionTypeName: json.actionTypeName || json.actionType || 'Unknown',
      oldValue: json.oldValue,
      newValue: json.newValue,
      performedBy: json.performedBy,
      timestamp: json.timestamp || json.createdAt || new Date().toISOString(),
      notes: json.notes,
    });
  }

  /**
   * Convert SubscriptionHistory domain model to JSON for API requests
   */
  static toJson(history: SubscriptionHistory): any {
    return {
      id: history.id,
      companyId: history.companyId,
      actionType: history.actionType,
      actionTypeName: history.actionTypeName,
      oldValue: history.oldValue,
      newValue: history.newValue,
      performedBy: history.performedBy,
      timestamp: history.timestamp,
      notes: history.notes,
    };
  }

  /**
   * Handle different API response formats and convert to SubscriptionHistoryResponse
   * Backend format options:
   * 1. { statusCode, message, data: { history, pagination } }
   * 2. { data: [...], pagination: {...} } (after ApiService unwrap)
   */
  static handleApiResponse(response: any): SubscriptionHistoryResponse {
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

    // Handle SYNFLOX backend response format: { statusCode, message, data: { history, pagination } }
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
        // Check if it has history property
        if ('history' in data) {
          const pagination = data.pagination || {};
          return {
            data: Array.isArray(data.history) 
              ? data.history.map((item: any) => this.fromJson(item))
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
}

