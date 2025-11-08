/**
 * Analytics Mappers
 * 
 * Handles conversion between analytics domain models and external data formats.
 */

import {
  CompanyUsageAnalytics,
  ApiUsageAnalytics,
  type CompanyUsageAnalyticsData,
  type ApiUsageAnalyticsData,
} from '../models/analytics.model';

export class AnalyticsMapper {
  /**
   * Convert JSON/API response to CompanyUsageAnalytics domain model
   */
  static companyUsageFromJson(json: any): CompanyUsageAnalytics {
    return new CompanyUsageAnalytics({
      companyId: json.companyId || '',
      totalRequests: json.totalRequests || 0,
      successfulRequests: json.successfulRequests || 0,
      failedRequests: json.failedRequests || 0,
      averageResponseTime: json.averageResponseTime || 0,
      lastActivityAt: json.lastActivityAt,
      periodStart: json.periodStart || json.period?.start || new Date().toISOString(),
      periodEnd: json.periodEnd || json.period?.end || new Date().toISOString(),
      requestsByEndpoint: json.requestsByEndpoint || json.byEndpoint,
      requestsByDay: json.requestsByDay || json.byDay,
    });
  }

  /**
   * Convert JSON/API response to ApiUsageAnalytics domain model
   */
  static apiUsageFromJson(json: any): ApiUsageAnalytics {
    return new ApiUsageAnalytics({
      totalRequests: json.totalRequests || 0,
      successfulRequests: json.successfulRequests || 0,
      failedRequests: json.failedRequests || 0,
      averageResponseTime: json.averageResponseTime || 0,
      periodStart: json.periodStart || json.period?.start || new Date().toISOString(),
      periodEnd: json.periodEnd || json.period?.end || new Date().toISOString(),
      requestsByEndpoint: json.requestsByEndpoint || json.byEndpoint,
      requestsByCompany: json.requestsByCompany || json.byCompany,
      requestsByDay: json.requestsByDay || json.byDay,
    });
  }

  /**
   * Handle API response format
   */
  static handleApiResponse<T>(response: any, mapper: (json: any) => T): T {
    const data = response?.data || response;
    return mapper(data);
  }
}

