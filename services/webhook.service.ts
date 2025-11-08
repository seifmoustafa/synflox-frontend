/**
 * Webhook Service
 *
 * Handles Webhook CRUD operations and delivery history with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  Webhook,
  WebhookDelivery,
  WebhookMapper,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  type WebhooksResponse,
  type WebhookDeliveriesResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface IWebhookService {
  getWebhooks(params?: {
    page?: number;
    pageSize?: number;
    companyId?: string;
    isActive?: boolean;
  }): Promise<WebhooksResponse>;
  getWebhookById(id: string): Promise<Webhook>;
  getCompanyWebhooks(companyId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<WebhooksResponse>;
  createWebhook(data: CreateWebhookRequest): Promise<Webhook>;
  updateWebhook(id: string, data: UpdateWebhookRequest): Promise<Webhook>;
  deleteWebhook(id: string): Promise<void>;
  getDeliveries(webhookId: string, params?: {
    page?: number;
    pageSize?: number;
    status?: number;
  }): Promise<WebhookDeliveriesResponse>;
  retryFailedDeliveries(): Promise<void>;
}

export class WebhookService implements IWebhookService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getWebhooks(params?: {
    page?: number;
    pageSize?: number;
    companyId?: string;
    isActive?: boolean;
  }): Promise<WebhooksResponse> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.WEBHOOKS_GET_ALL,
        params
      );
      return WebhookMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async getWebhookById(id: string): Promise<Webhook> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.WEBHOOKS_GET_BY_ID}/${id}`
      );
      const webhookData = response?.data || response;
      return WebhookMapper.fromJson(webhookData);
    } catch (e) {
      throw e;
    }
  }

  async getCompanyWebhooks(companyId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<WebhooksResponse> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.WEBHOOKS_GET_BY_COMPANY}/${companyId}`,
        params
      );
      return WebhookMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async createWebhook(data: CreateWebhookRequest): Promise<Webhook> {
    try {
      const json = WebhookMapper.createRequestToJson(data);
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.WEBHOOKS_CREATE,
        json
      );
      const webhookData = response?.data || response;
      const message = response?.message || "Webhook created successfully";
      this.notificationService.success(message);
      return WebhookMapper.fromJson(webhookData);
    } catch (e) {
      throw e;
    }
  }

  async updateWebhook(id: string, data: UpdateWebhookRequest): Promise<Webhook> {
    try {
      const json = WebhookMapper.updateRequestToJson(data);
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.WEBHOOKS_UPDATE}/${id}`,
        json
      );
      const webhookData = response?.data || response;
      const message = response?.message || "Webhook updated successfully";
      this.notificationService.success(message);
      return WebhookMapper.fromJson(webhookData);
    } catch (e) {
      throw e;
    }
  }

  async deleteWebhook(id: string): Promise<void> {
    try {
      const response = await this.apiService.delete<any>(
        `${API_ENDPOINTS.WEBHOOKS_DELETE}/${id}`
      );
      const message = response?.message || "Webhook deleted successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }

  async getDeliveries(webhookId: string, params?: {
    page?: number;
    pageSize?: number;
    status?: number;
  }): Promise<WebhookDeliveriesResponse> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.WEBHOOKS_GET_DELIVERIES}/${webhookId}/deliveries`,
        params
      );
      return WebhookMapper.handleDeliveriesResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async retryFailedDeliveries(): Promise<void> {
    try {
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.WEBHOOKS_RETRY_FAILED,
        {}
      );
      const message = response?.message || "Failed deliveries retry initiated successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }
}

