/**
 * Webhook Mappers
 * 
 * Handles conversion between webhook domain models and external data formats.
 */

import {
  Webhook,
  WebhookDelivery,
  WebhookEventType,
  WebhookDeliveryStatus,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  type WebhookData,
  type WebhookDeliveryData,
  type CreateWebhookRequestData,
  type UpdateWebhookRequestData,
} from '../models/webhook.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface WebhooksResponse {
  data: Webhook[];
  pagination: PaginationInfo;
}

export interface WebhookDeliveriesResponse {
  data: WebhookDelivery[];
  pagination: PaginationInfo;
}

export class WebhookMapper {
  /**
   * Convert JSON/API response to Webhook domain model
   */
  static fromJson(json: any): Webhook {
    // Backend uses "events" field, but we map it to "eventTypes" in domain model
    const events = json.events || json.eventTypes || [];
    const eventTypes = Array.isArray(events) 
      ? events.map((et: any) => typeof et === 'number' ? et : WebhookEventType[et as keyof typeof WebhookEventType] || et)
      : [];

    return new Webhook({
      id: json.id || '',
      companyId: json.companyId || '',
      url: json.url || '',
      secret: json.secret,
      eventTypes,
      isActive: json.isActive ?? true,
      retryCount: json.retryCount ?? 3,
      timeoutSeconds: json.timeoutSeconds ?? 30,
      lastDeliveryAt: json.lastDeliveryAt || json.lastTriggeredAt,
      lastDeliveryStatus: json.lastDeliveryStatus,
      createdAt: json.createdAt || json.createdTimestamp || new Date().toISOString(),
      updatedAt: json.updatedAt || json.updatedTimestamp,
    });
  }

  /**
   * Convert WebhookDelivery JSON to domain model
   */
  static deliveryFromJson(json: any): WebhookDelivery {
    return new WebhookDelivery({
      id: json.id || '',
      webhookId: json.webhookId || '',
      eventType: typeof json.eventType === 'number' 
        ? json.eventType 
        : WebhookEventType[json.eventType as keyof typeof WebhookEventType] || WebhookEventType.CompanyActivated,
      payload: json.payload || '{}',
      responseCode: json.responseCode,
      responseBody: json.responseBody,
      status: typeof json.status === 'number'
        ? json.status
        : WebhookDeliveryStatus[json.status as keyof typeof WebhookDeliveryStatus] || WebhookDeliveryStatus.Pending,
      attemptedAt: json.attemptedAt || new Date().toISOString(),
      deliveredAt: json.deliveredAt,
      errorMessage: json.errorMessage,
      retryCount: json.retryCount ?? 0,
    });
  }

  /**
   * Convert Webhook domain model to JSON for API requests
   */
  static toJson(webhook: Webhook): any {
    return {
      id: webhook.id,
      companyId: webhook.companyId,
      url: webhook.url,
      secret: webhook.secret,
      eventTypes: webhook.eventTypes,
      isActive: webhook.isActive,
      retryCount: webhook.retryCount,
      timeoutSeconds: webhook.timeoutSeconds,
      lastDeliveryAt: webhook.lastDeliveryAt,
      lastDeliveryStatus: webhook.lastDeliveryStatus,
      createdAt: webhook.createdAt,
      updatedAt: webhook.updatedAt,
    };
  }

  /**
   * Convert CreateWebhookRequest domain model to JSON for API requests
   */
  static createRequestToJson(request: CreateWebhookRequest): any {
    const json: any = {
      companyId: request.companyId,
      url: request.url,
      events: request.eventTypes, // Backend expects "events" field
      isActive: request.isActive,
      retryCount: request.retryCount,
      timeoutSeconds: request.timeoutSeconds,
    };
    if (request.secret !== undefined) {
      json.secret = request.secret;
    }
    return json;
  }

  /**
   * Convert UpdateWebhookRequest domain model to JSON for API requests
   */
  static updateRequestToJson(request: UpdateWebhookRequest): any {
    const json: any = {};
    if (request.url !== undefined) json.url = request.url;
    if (request.secret !== undefined) json.secret = request.secret;
    if (request.eventTypes !== undefined) json.events = request.eventTypes; // Backend expects "events" field
    if (request.isActive !== undefined) json.isActive = request.isActive;
    if (request.retryCount !== undefined) json.retryCount = request.retryCount;
    if (request.timeoutSeconds !== undefined) json.timeoutSeconds = request.timeoutSeconds;
    return json;
  }

  /**
   * Handle different API response formats and convert to WebhooksResponse
   */
  static handleApiResponse(response: any): WebhooksResponse {
    // Handle format: { data: [...], pagination: {...} } (direct array with pagination)
    if (response && typeof response === 'object' && 'data' in response && 'pagination' in response) {
      if (Array.isArray(response.data)) {
        const pagination = response.pagination || {};
        return {
          data: response.data.map((item: any) => this.fromJson(item)),
          pagination: {
            itemsCount: pagination.itemsCount || 0,
            pageSize: pagination.pageSize || 10,
            page: pagination.currentPage || pagination.page || 1,
            pagesCount: pagination.pagesCount || 0,
          }
        };
      }
    }

    // Handle SYNFLOX backend response format
    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data;
      if (data && typeof data === 'object') {
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
        // Backend response format: { data: { webhooks: [...], pagination: {...} } }
        if ('webhooks' in data || 'hooks' in data) {
          const webhooks = data.webhooks || data.hooks || [];
          const pagination = data.pagination || response.pagination || {};
          return {
            data: Array.isArray(webhooks) 
              ? webhooks.map((item: any) => this.fromJson(item))
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
   * Handle deliveries API response
   */
  static handleDeliveriesResponse(response: any): WebhookDeliveriesResponse {
    if (response && typeof response === 'object' && 'data' in response && 'pagination' in response) {
      if (Array.isArray(response.data)) {
        const pagination = response.pagination || {};
        return {
          data: response.data.map((item: any) => this.deliveryFromJson(item)),
          pagination: {
            itemsCount: pagination.itemsCount || 0,
            pageSize: pagination.pageSize || 10,
            page: pagination.currentPage || pagination.page || 1,
            pagesCount: pagination.pagesCount || 0,
          }
        };
      }
    }

    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data;
      if (Array.isArray(data)) {
        const pagination = response.pagination || {};
        return {
          data: data.map((item: any) => this.deliveryFromJson(item)),
          pagination: {
            itemsCount: pagination.itemsCount || pagination.totalItems || data.length,
            pageSize: pagination.pageSize || 10,
            page: pagination.currentPage || pagination.page || 1,
            pagesCount: pagination.pagesCount || pagination.totalPages || 1,
          }
        };
      }
      if ('deliveries' in data) {
        const deliveries = data.deliveries || [];
        const pagination = data.pagination || {};
        return {
          data: Array.isArray(deliveries) 
            ? deliveries.map((item: any) => this.deliveryFromJson(item))
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

    if (Array.isArray(response)) {
      return {
        data: response.map((item: any) => this.deliveryFromJson(item)),
        pagination: {
          itemsCount: response.length,
          pageSize: response.length,
          page: 1,
          pagesCount: 1,
        }
      };
    }

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

