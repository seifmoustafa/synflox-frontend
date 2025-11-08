/**
 * Error Log Service
 *
 * Handles Error Log operations with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  ErrorLog,
  ErrorLogMapper,
  type ErrorLogsResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface IErrorLogService {
  getErrorLogs(params?: {
    page?: number;
    pageSize?: number;
    level?: number;
    resolved?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<ErrorLogsResponse>;
  getErrorLogById(id: string): Promise<ErrorLog>;
  cleanupErrorLogs(olderThanDays: number): Promise<void>;
}

export class ErrorLogService implements IErrorLogService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getErrorLogs(params?: {
    page?: number;
    pageSize?: number;
    level?: number;
    resolved?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<ErrorLogsResponse> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.ERROR_LOGS_GET_ALL,
        params
      );
      return ErrorLogMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async getErrorLogById(id: string): Promise<ErrorLog> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.ERROR_LOGS_GET_BY_ID}/${id}`
      );
      const errorData = response?.data || response;
      return ErrorLogMapper.fromJson(errorData);
    } catch (e) {
      throw e;
    }
  }

  async cleanupErrorLogs(olderThanDays: number): Promise<void> {
    try {
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.ERROR_LOGS_CLEANUP,
        { olderThanDays }
      );
      const message = response?.message || "Error logs cleanup completed successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }
}

