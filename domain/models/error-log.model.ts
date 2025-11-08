/**
 * Error Log Domain Model
 * 
 * Represents system error logs.
 */

export enum ErrorLogLevel {
  Debug = 1,
  Info = 2,
  Warning = 3,
  Error = 4,
  Critical = 5,
}

export interface ErrorLogData {
  id: string; // Encrypted GUID
  level: ErrorLogLevel;
  message: string;
  exception?: string;
  stackTrace?: string;
  source?: string; // Controller/Service name
  userId?: string; // Encrypted GUID
  companyId?: string; // Encrypted GUID
  requestPath?: string;
  requestMethod?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string; // ISO date string
  resolved: boolean;
  resolvedAt?: string; // ISO date string
  resolvedBy?: string; // User ID
}

export class ErrorLog {
  public readonly id: string;
  public readonly level: ErrorLogLevel;
  public readonly message: string;
  public readonly exception?: string;
  public readonly stackTrace?: string;
  public readonly source?: string;
  public readonly userId?: string;
  public readonly companyId?: string;
  public readonly requestPath?: string;
  public readonly requestMethod?: string;
  public readonly ipAddress?: string;
  public readonly userAgent?: string;
  public readonly timestamp: string;
  public readonly resolved: boolean;
  public readonly resolvedAt?: string;
  public readonly resolvedBy?: string;

  constructor(data: ErrorLogData) {
    this.id = data.id;
    this.level = data.level;
    this.message = data.message;
    this.exception = data.exception;
    this.stackTrace = data.stackTrace;
    this.source = data.source;
    this.userId = data.userId;
    this.companyId = data.companyId;
    this.requestPath = data.requestPath;
    this.requestMethod = data.requestMethod;
    this.ipAddress = data.ipAddress;
    this.userAgent = data.userAgent;
    this.timestamp = data.timestamp;
    this.resolved = data.resolved;
    this.resolvedAt = data.resolvedAt;
    this.resolvedBy = data.resolvedBy;
  }

  /**
   * Get display name
   */
  get displayName(): string {
    return this.message;
  }

  /**
   * Check if error is critical
   */
  get isCritical(): boolean {
    return this.level === ErrorLogLevel.Critical || this.level === ErrorLogLevel.Error;
  }
}

