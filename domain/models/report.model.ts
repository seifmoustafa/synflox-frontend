/**
 * Report Domain Model
 * 
 * Represents report generation and management.
 */

export enum ReportType {
  CompanyList = 1,
  SubscriptionSummary = 2,
  UsageStatistics = 3,
  FinancialReport = 4,
  AuditLog = 5,
  ApiUsage = 6,
  ErrorLogs = 7,
}

export interface ReportData {
  id: string; // Encrypted GUID
  reportType: ReportType;
  name: string;
  description?: string;
  parameters?: Record<string, any>; // JSON string
  generatedAt?: string; // ISO date string
  generatedBy?: string; // User ID
  fileUrl?: string;
  fileSize?: number; // bytes
  format?: 'csv' | 'excel' | 'pdf';
  status: ReportStatus;
  createdAt: string;
  expiresAt?: string; // ISO date string
}

export enum ReportStatus {
  Pending = 1,
  Generating = 2,
  Completed = 3,
  Failed = 4,
  Expired = 5,
}

export class Report {
  public readonly id: string;
  public readonly reportType: ReportType;
  public readonly name: string;
  public readonly description?: string;
  public readonly parameters?: Record<string, any>;
  public readonly generatedAt?: string;
  public readonly generatedBy?: string;
  public readonly fileUrl?: string;
  public readonly fileSize?: number;
  public readonly format?: 'csv' | 'excel' | 'pdf';
  public readonly status: ReportStatus;
  public readonly createdAt: string;
  public readonly expiresAt?: string;

  constructor(data: ReportData) {
    this.id = data.id;
    this.reportType = data.reportType;
    this.name = data.name;
    this.description = data.description;
    this.parameters = data.parameters;
    this.generatedAt = data.generatedAt;
    this.generatedBy = data.generatedBy;
    this.fileUrl = data.fileUrl;
    this.fileSize = data.fileSize;
    this.format = data.format;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.expiresAt = data.expiresAt;
  }

  /**
   * Get display name
   */
  get displayName(): string {
    return this.name;
  }

  /**
   * Get formatted file size
   */
  get formattedFileSize(): string {
    if (!this.fileSize) return "-";
    const kb = this.fileSize / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  }

  /**
   * Check if report is ready for download
   */
  get isReady(): boolean {
    return this.status === ReportStatus.Completed && !!this.fileUrl;
  }

  /**
   * Check if report is expired
   */
  get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date(this.expiresAt) < new Date();
  }
}

export interface GenerateReportRequestData {
  reportType: ReportType;
  parameters?: Record<string, any>;
  format?: 'csv' | 'excel' | 'pdf';
}

export class GenerateReportRequest {
  public readonly reportType: ReportType;
  public readonly parameters?: Record<string, any>;
  public readonly format?: 'csv' | 'excel' | 'pdf';

  constructor(data: GenerateReportRequestData) {
    this.reportType = data.reportType;
    this.parameters = data.parameters;
    this.format = data.format || 'excel';
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!this.reportType;
  }
}

export interface AvailableReportData {
  reportType: ReportType;
  name: string;
  description: string;
  availableFormats: ('csv' | 'excel' | 'pdf')[];
  requiredParameters?: string[];
  optionalParameters?: string[];
}

export class AvailableReport {
  public readonly reportType: ReportType;
  public readonly name: string;
  public readonly description: string;
  public readonly availableFormats: ('csv' | 'excel' | 'pdf')[];
  public readonly requiredParameters?: string[];
  public readonly optionalParameters?: string[];

  constructor(data: AvailableReportData) {
    this.reportType = data.reportType;
    this.name = data.name;
    this.description = data.description;
    this.availableFormats = data.availableFormats;
    this.requiredParameters = data.requiredParameters;
    this.optionalParameters = data.optionalParameters;
  }
}

