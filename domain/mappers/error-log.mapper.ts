/**
 * Error Log Mappers
 * 
 * Handles conversion between error log domain models and external data formats.
 */

import {
  ErrorLog,
  ErrorLogLevel,
  type ErrorLogData,
} from '../models/error-log.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface ErrorLogsResponse {
  data: ErrorLog[];
  pagination: PaginationInfo;
}

export class ErrorLogMapper {
  /**
   * Convert JSON/API response to ErrorLog domain model
   */
  static fromJson(json: any): ErrorLog {
    return new ErrorLog({
      id: json.id || '',
      level: typeof json.level === 'number' 
        ? json.level 
        : ErrorLogLevel[json.level as keyof typeof ErrorLogLevel] || ErrorLogLevel.Error,
      message: json.message || '',
      exception: json.exception,
      stackTrace: json.stackTrace,
      source: json.source,
      userId: json.userId,
      companyId: json.companyId,
      requestPath: json.requestPath,
      requestMethod: json.requestMethod,
      ipAddress: json.ipAddress,
      userAgent: json.userAgent,
      timestamp: json.timestamp || json.createdAt || new Date().toISOString(),
      resolved: json.resolved ?? false,
      resolvedAt: json.resolvedAt,
      resolvedBy: json.resolvedBy,
    });
  }

  /**
   * Handle different API response formats and convert to ErrorLogsResponse
   */
  static handleApiResponse(response: any): ErrorLogsResponse {
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
      if ('errors' in data || 'errorLogs' in data) {
        const errors = data.errors || data.errorLogs || [];
        const pagination = data.pagination || {};
        return {
          data: Array.isArray(errors) 
            ? errors.map((item: any) => this.fromJson(item))
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

