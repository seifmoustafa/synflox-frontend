/**
 * Subscription History Service
 *
 * Handles subscription history operations with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  SubscriptionHistory,
  SubscriptionHistoryMapper,
  type SubscriptionHistoryResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface ISubscriptionHistoryService {
  getHistory(companyId: string, params?: {
    page?: number;
    pageSize?: number;
    fromDate?: string;
    toDate?: string;
    actionType?: number;
  }): Promise<SubscriptionHistoryResponse>;
  getAllHistory(params?: {
    page?: number;
    pageSize?: number;
    fromDate?: string;
    toDate?: string;
    actionType?: number;
    companyId?: string;
  }): Promise<SubscriptionHistoryResponse>;
}

export class SubscriptionHistoryService implements ISubscriptionHistoryService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getHistory(companyId: string, params?: {
    page?: number;
    pageSize?: number;
    fromDate?: string;
    toDate?: string;
    actionType?: number;
  }): Promise<SubscriptionHistoryResponse> {
    try {
      // SYNFLOX API: GET /api/licensing/{companyId}/history
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.LICENSING_HISTORY}/${companyId}/history`,
        params
      );
      return SubscriptionHistoryMapper.handleApiResponse(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async getAllHistory(params?: {
    page?: number;
    pageSize?: number;
    fromDate?: string;
    toDate?: string;
    actionType?: number;
    companyId?: string;
  }): Promise<SubscriptionHistoryResponse> {
    try {
      // SYNFLOX API: GET /api/licensing/history
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.LICENSING_HISTORY}/history`,
        params
      );
      return SubscriptionHistoryMapper.handleApiResponse(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }
}

