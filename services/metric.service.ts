/**
 * Metric Service
 *
 * Handles Metrics operations with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  MetricsSummary,
  MetricHistory,
  MetricMapper,
  type MetricsResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface IMetricService {
  getSummary(): Promise<MetricsSummary>;
  getHistory(params?: {
    metricName?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<MetricHistory>;
  getMetrics(params?: {
    page?: number;
    pageSize?: number;
    category?: string;
  }): Promise<MetricsResponse>;
  aggregateMetrics(params: {
    metricNames: string[];
    aggregationType: 'sum' | 'avg' | 'min' | 'max';
    startDate?: string;
    endDate?: string;
  }): Promise<any>;
  cleanupMetrics(olderThanDays: number): Promise<void>;
}

export class MetricService implements IMetricService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getSummary(): Promise<MetricsSummary> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.METRICS_SUMMARY
      );
      const summaryData = response?.data || response;
      return MetricMapper.summaryFromJson(summaryData);
    } catch (e) {
      throw e;
    }
  }

  async getHistory(params?: {
    metricName?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<MetricHistory> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.METRICS_HISTORY,
        params
      );
      const historyData = response?.data || response;
      return MetricMapper.historyFromJson(historyData);
    } catch (e) {
      throw e;
    }
  }

  async getMetrics(params?: {
    page?: number;
    pageSize?: number;
    category?: string;
  }): Promise<MetricsResponse> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.METRICS_GET_ALL,
        params
      );
      return MetricMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async aggregateMetrics(params: {
    metricNames: string[];
    aggregationType: 'sum' | 'avg' | 'min' | 'max';
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.METRICS_AGGREGATE,
        params
      );
      const message = response?.message || "Metrics aggregated successfully";
      this.notificationService.success(message);
      return response?.data || response;
    } catch (e) {
      throw e;
    }
  }

  async cleanupMetrics(olderThanDays: number): Promise<void> {
    try {
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.METRICS_CLEANUP,
        { olderThanDays }
      );
      const message = response?.message || "Metrics cleanup completed successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }
}

