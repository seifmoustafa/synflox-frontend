/**
 * Report Mappers
 * 
 * Handles conversion between report domain models and external data formats.
 */

import {
  Report,
  ReportType,
  ReportStatus,
  GenerateReportRequest,
  AvailableReport,
  type ReportData,
  type GenerateReportRequestData,
  type AvailableReportData,
} from '../models/report.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface ReportsResponse {
  data: Report[];
  pagination: PaginationInfo;
}

export interface AvailableReportsResponse {
  data: AvailableReport[];
}

export class ReportMapper {
  /**
   * Convert JSON/API response to Report domain model
   */
  static fromJson(json: any): Report {
    let parameters: Record<string, any> | undefined;
    if (json.parameters) {
      if (typeof json.parameters === 'string') {
        try {
          parameters = JSON.parse(json.parameters);
        } catch {
          parameters = {};
        }
      } else {
        parameters = json.parameters;
      }
    }

    return new Report({
      id: json.id || '',
      reportType: typeof json.reportType === 'number' 
        ? json.reportType 
        : ReportType[json.reportType as keyof typeof ReportType] || ReportType.CompanyList,
      name: json.name || '',
      description: json.description,
      parameters,
      generatedAt: json.generatedAt,
      generatedBy: json.generatedBy,
      fileUrl: json.fileUrl,
      fileSize: json.fileSize,
      format: json.format,
      status: typeof json.status === 'number'
        ? json.status
        : ReportStatus[json.status as keyof typeof ReportStatus] || ReportStatus.Pending,
      createdAt: json.createdAt || json.createdTimestamp || new Date().toISOString(),
      expiresAt: json.expiresAt,
    });
  }

  /**
   * Convert AvailableReport JSON to domain model
   */
  static availableReportFromJson(json: any): AvailableReport {
    return new AvailableReport({
      reportType: typeof json.reportType === 'number' 
        ? json.reportType 
        : ReportType[json.reportType as keyof typeof ReportType] || ReportType.CompanyList,
      name: json.name || '',
      description: json.description || '',
      availableFormats: json.availableFormats || ['excel'],
      requiredParameters: json.requiredParameters,
      optionalParameters: json.optionalParameters,
    });
  }

  /**
   * Convert GenerateReportRequest domain model to JSON for API requests
   */
  static generateRequestToJson(request: GenerateReportRequest): any {
    const json: any = {
      reportType: request.reportType,
      format: request.format || 'excel',
    };
    if (request.parameters) {
      json.parameters = request.parameters;
    }
    return json;
  }

  /**
   * Handle different API response formats and convert to ReportsResponse
   */
  static handleApiResponse(response: any): ReportsResponse {
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
      if ('reports' in data) {
        const reports = data.reports || [];
        const pagination = data.pagination || {};
        return {
          data: Array.isArray(reports) 
            ? reports.map((item: any) => this.fromJson(item))
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

  /**
   * Handle available reports response
   */
  static handleAvailableReportsResponse(response: any): AvailableReportsResponse {
    const data = response?.data || response;
    if (Array.isArray(data)) {
      return {
        data: data.map((item: any) => this.availableReportFromJson(item)),
      };
    }
    if (data && typeof data === 'object' && 'reports' in data) {
      return {
        data: Array.isArray(data.reports) 
          ? data.reports.map((item: any) => this.availableReportFromJson(item))
          : [],
      };
    }
    return { data: [] };
  }
}

