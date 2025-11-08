/**
 * Analytics Service
 *
 * Handles Analytics operations with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  CompanyUsageAnalytics,
  ApiUsageAnalytics,
  AnalyticsMapper,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface IAnalyticsService {
  getCompanyUsage(companyId: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<CompanyUsageAnalytics>;
  getApiUsage(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiUsageAnalytics>;
  getApiUsageByEndpoint(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiUsageAnalytics>;
  getApiUsageByCompany(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiUsageAnalytics>;
}

export class AnalyticsService implements IAnalyticsService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getCompanyUsage(companyId: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<CompanyUsageAnalytics> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.ANALYTICS_COMPANY_USAGE}/${companyId}/usage`,
        params
      );
      return AnalyticsMapper.handleApiResponse(
        response,
        AnalyticsMapper.companyUsageFromJson
      );
    } catch (e) {
      throw e;
    }
  }

  async getApiUsage(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiUsageAnalytics> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.ANALYTICS_API_USAGE,
        params
      );
      return AnalyticsMapper.handleApiResponse(
        response,
        AnalyticsMapper.apiUsageFromJson
      );
    } catch (e) {
      throw e;
    }
  }

  async getApiUsageByEndpoint(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiUsageAnalytics> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.ANALYTICS_API_USAGE_BY_ENDPOINT,
        params
      );
      return AnalyticsMapper.handleApiResponse(
        response,
        AnalyticsMapper.apiUsageFromJson
      );
    } catch (e) {
      throw e;
    }
  }

  async getApiUsageByCompany(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiUsageAnalytics> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.ANALYTICS_API_USAGE_BY_COMPANY,
        params
      );
      return AnalyticsMapper.handleApiResponse(
        response,
        AnalyticsMapper.apiUsageFromJson
      );
    } catch (e) {
      throw e;
    }
  }
}

