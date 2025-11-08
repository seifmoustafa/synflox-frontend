/**
 * Report Service
 *
 * Handles Report operations with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  Report,
  AvailableReport,
  ReportMapper,
  GenerateReportRequest,
  type ReportsResponse,
  type AvailableReportsResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { SecureTokenService } from "@/lib/secure-token-service";

export interface IReportService {
  getAvailableReports(): Promise<AvailableReportsResponse>;
  getReports(params?: {
    page?: number;
    pageSize?: number;
    reportType?: number;
  }): Promise<ReportsResponse>;
  getReportById(id: string): Promise<Report>;
  generateReport(data: GenerateReportRequest): Promise<Report>;
  downloadReport(reportType: number, format: 'csv' | 'excel' | 'pdf', params?: Record<string, any>): Promise<Blob>;
}

export class ReportService implements IReportService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getAvailableReports(): Promise<AvailableReportsResponse> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.REPORTS_GET_AVAILABLE
      );
      return ReportMapper.handleAvailableReportsResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async getReports(params?: {
    page?: number;
    pageSize?: number;
    reportType?: number;
  }): Promise<ReportsResponse> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.REPORTS_GET_ALL,
        params
      );
      return ReportMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async getReportById(id: string): Promise<Report> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.REPORTS_GET_BY_ID}/${id}`
      );
      const reportData = response?.data || response;
      return ReportMapper.fromJson(reportData);
    } catch (e) {
      throw e;
    }
  }

  async generateReport(data: GenerateReportRequest): Promise<Report> {
    try {
      const json = ReportMapper.generateRequestToJson(data);
      const response = await this.apiService.post<any>(
        `${API_ENDPOINTS.REPORTS_GENERATE}/${data.reportType}/generate`,
        json
      );
      const reportData = response?.data || response;
      const message = response?.message || "Report generation started successfully";
      this.notificationService.success(message);
      return ReportMapper.fromJson(reportData);
    } catch (e) {
      throw e;
    }
  }

  async downloadReport(reportType: number, format: 'csv' | 'excel' | 'pdf', params?: Record<string, any>): Promise<Blob> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const url = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
      const token = SecureTokenService.getAccessToken();
      const language = typeof window !== 'undefined' ? localStorage.getItem('language') || 'ar' : 'ar';

      const queryParams = new URLSearchParams({ format });
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(
        `${url}${API_ENDPOINTS.REPORTS_DOWNLOAD}/${reportType}/download?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept-Language': language,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to download report as ${format}`);
      }

      const blob = await response.blob();
      this.notificationService.success(`Report downloaded successfully as ${format.toUpperCase()}`);
      return blob;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : `Failed to download report as ${format}`;
      this.notificationService.error(errorMessage);
      throw e;
    }
  }
}

