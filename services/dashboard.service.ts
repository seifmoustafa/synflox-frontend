/**
 * Dashboard Service
 *
 * Handles Dashboard operations with SYNFLOX backend API.
 * Uses domain models and follows clean architecture principles.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  DashboardOverview,
  SystemStatistics,
  DashboardEndpoints,
  DashboardMapper,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface IDashboardService {
  getDashboardOverview(): Promise<DashboardOverview>;
  getStatistics(): Promise<SystemStatistics>;
  getEndpoints(): Promise<DashboardEndpoints>;
}

export class DashboardService implements IDashboardService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      // SYNFLOX API: GET /api/dashboard/overview
      // Backend returns: { statusCode, message, data: { statistics, endpoints } }
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.DASHBOARD_OVERVIEW
      );
      return DashboardMapper.handleApiResponse(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async getStatistics(): Promise<SystemStatistics> {
    try {
      // SYNFLOX API: GET /api/dashboard/statistics
      // Backend returns: { statusCode, message, data: SystemStatistics }
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.DASHBOARD_STATISTICS
      );
      return DashboardMapper.handleStatisticsResponse(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async getEndpoints(): Promise<DashboardEndpoints> {
    try {
      // SYNFLOX API: GET /api/dashboard/endpoints
      // Backend returns: { statusCode, message, data: DashboardEndpoints }
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.DASHBOARD_ENDPOINTS
      );
      return DashboardMapper.handleEndpointsResponse(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }
}

