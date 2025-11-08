/**
 * Health Service
 *
 * Handles Health Check operations with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  Health,
  HealthMapper,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface IHealthService {
  getHealth(): Promise<Health>;
}

export class HealthService implements IHealthService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getHealth(): Promise<Health> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.HEALTH_CHECK,
        {},
        { skipAuth: true } // Health check endpoint is AllowAnonymous
      );
      const healthData = response?.data || response;
      return HealthMapper.fromJson(healthData);
    } catch (e) {
      // Return unhealthy status on error
      return new Health({
        status: 3, // Unhealthy
        message: "Failed to check health status",
        timestamp: new Date().toISOString(),
      });
    }
  }
}

