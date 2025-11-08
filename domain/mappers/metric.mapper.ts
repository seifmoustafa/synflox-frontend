/**
 * Metric Mappers
 * 
 * Handles conversion between metric domain models and external data formats.
 */

import {
  Metric,
  MetricsSummary,
  MetricHistory,
  type MetricData,
  type MetricsSummaryData,
  type MetricHistoryData,
} from '../models/metric.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface MetricsResponse {
  data: Metric[];
  pagination: PaginationInfo;
}

export class MetricMapper {
  /**
   * Convert JSON/API response to Metric domain model
   */
  static fromJson(json: any): Metric {
    let metadata: Record<string, any> | undefined;
    if (json.metadata) {
      if (typeof json.metadata === 'string') {
        try {
          metadata = JSON.parse(json.metadata);
        } catch {
          metadata = {};
        }
      } else {
        metadata = json.metadata;
      }
    }

    return new Metric({
      id: json.id || '',
      name: json.name || '',
      value: json.value || 0,
      unit: json.unit,
      category: json.category || '',
      timestamp: json.timestamp || new Date().toISOString(),
      metadata,
    });
  }

  /**
   * Convert JSON/API response to MetricsSummary domain model
   */
  static summaryFromJson(json: any): MetricsSummary {
    return new MetricsSummary({
      totalCompanies: json.totalCompanies || 0,
      activeCompanies: json.activeCompanies || 0,
      expiredCompanies: json.expiredCompanies || 0,
      suspendedCompanies: json.suspendedCompanies || 0,
      trialCompanies: json.trialCompanies || 0,
      totalApiKeys: json.totalApiKeys || 0,
      activeApiKeys: json.activeApiKeys || 0,
      totalWebhooks: json.totalWebhooks || 0,
      activeWebhooks: json.activeWebhooks || 0,
      totalRequests: json.totalRequests || 0,
      successfulRequests: json.successfulRequests || 0,
      failedRequests: json.failedRequests || 0,
      averageResponseTime: json.averageResponseTime || 0,
      errorRate: json.errorRate || 0,
      lastUpdated: json.lastUpdated || new Date().toISOString(),
    });
  }

  /**
   * Convert JSON/API response to MetricHistory domain model
   */
  static historyFromJson(json: any): MetricHistory {
    return new MetricHistory({
      metricName: json.metricName || '',
      dataPoints: json.dataPoints || json.data || [],
      periodStart: json.periodStart || json.period?.start || new Date().toISOString(),
      periodEnd: json.periodEnd || json.period?.end || new Date().toISOString(),
    });
  }

  /**
   * Handle different API response formats and convert to MetricsResponse
   */
  static handleApiResponse(response: any): MetricsResponse {
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

    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data;
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
      if ('metrics' in data) {
        const metrics = data.metrics || [];
        const pagination = data.pagination || {};
        return {
          data: Array.isArray(metrics) 
            ? metrics.map((item: any) => this.fromJson(item))
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
        data: response.map((item: any) => this.fromJson(item)),
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

