/**
 * Analytics Domain Model
 * 
 * Represents analytics data for companies and API usage.
 */

export interface CompanyUsageAnalyticsData {
  companyId: string; // Encrypted GUID
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number; // milliseconds
  lastActivityAt?: string; // ISO date string
  periodStart: string; // ISO date string
  periodEnd: string; // ISO date string
  requestsByEndpoint?: Record<string, number>;
  requestsByDay?: Record<string, number>; // Date string -> count
}

export class CompanyUsageAnalytics {
  public readonly companyId: string;
  public readonly totalRequests: number;
  public readonly successfulRequests: number;
  public readonly failedRequests: number;
  public readonly averageResponseTime: number;
  public readonly lastActivityAt?: string;
  public readonly periodStart: string;
  public readonly periodEnd: string;
  public readonly requestsByEndpoint?: Record<string, number>;
  public readonly requestsByDay?: Record<string, number>;

  constructor(data: CompanyUsageAnalyticsData) {
    this.companyId = data.companyId;
    this.totalRequests = data.totalRequests;
    this.successfulRequests = data.successfulRequests;
    this.failedRequests = data.failedRequests;
    this.averageResponseTime = data.averageResponseTime;
    this.lastActivityAt = data.lastActivityAt;
    this.periodStart = data.periodStart;
    this.periodEnd = data.periodEnd;
    this.requestsByEndpoint = data.requestsByEndpoint;
    this.requestsByDay = data.requestsByDay;
  }

  /**
   * Get success rate percentage
   */
  get successRate(): number {
    if (this.totalRequests === 0) return 0;
    return (this.successfulRequests / this.totalRequests) * 100;
  }

  /**
   * Get failure rate percentage
   */
  get failureRate(): number {
    if (this.totalRequests === 0) return 0;
    return (this.failedRequests / this.totalRequests) * 100;
  }
}

export interface ApiUsageAnalyticsData {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  periodStart: string; // ISO date string
  periodEnd: string; // ISO date string
  requestsByEndpoint?: Record<string, {
    count: number;
    successCount: number;
    failCount: number;
    avgResponseTime: number;
  }>;
  requestsByCompany?: Record<string, {
    companyId: string;
    companyName?: string;
    count: number;
    successCount: number;
    failCount: number;
  }>;
  requestsByDay?: Record<string, number>;
}

export class ApiUsageAnalytics {
  public readonly totalRequests: number;
  public readonly successfulRequests: number;
  public readonly failedRequests: number;
  public readonly averageResponseTime: number;
  public readonly periodStart: string;
  public readonly periodEnd: string;
  public readonly requestsByEndpoint?: Record<string, {
    count: number;
    successCount: number;
    failCount: number;
    avgResponseTime: number;
  }>;
  public readonly requestsByCompany?: Record<string, {
    companyId: string;
    companyName?: string;
    count: number;
    successCount: number;
    failCount: number;
  }>;
  public readonly requestsByDay?: Record<string, number>;

  constructor(data: ApiUsageAnalyticsData) {
    this.totalRequests = data.totalRequests;
    this.successfulRequests = data.successfulRequests;
    this.failedRequests = data.failedRequests;
    this.averageResponseTime = data.averageResponseTime;
    this.periodStart = data.periodStart;
    this.periodEnd = data.periodEnd;
    this.requestsByEndpoint = data.requestsByEndpoint;
    this.requestsByCompany = data.requestsByCompany;
    this.requestsByDay = data.requestsByDay;
  }

  /**
   * Get success rate percentage
   */
  get successRate(): number {
    if (this.totalRequests === 0) return 0;
    return (this.successfulRequests / this.totalRequests) * 100;
  }

  /**
   * Get failure rate percentage
   */
  get failureRate(): number {
    if (this.totalRequests === 0) return 0;
    return (this.failedRequests / this.totalRequests) * 100;
  }
}

