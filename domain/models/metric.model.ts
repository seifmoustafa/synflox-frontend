/**
 * Metric Domain Model
 * 
 * Represents system metrics and monitoring data.
 */

export interface MetricData {
  id: string; // Encrypted GUID
  name: string;
  value: number;
  unit?: string;
  category: string;
  timestamp: string; // ISO date string
  metadata?: Record<string, any>;
}

export class Metric {
  public readonly id: string;
  public readonly name: string;
  public readonly value: number;
  public readonly unit?: string;
  public readonly category: string;
  public readonly timestamp: string;
  public readonly metadata?: Record<string, any>;

  constructor(data: MetricData) {
    this.id = data.id;
    this.name = data.name;
    this.value = data.value;
    this.unit = data.unit;
    this.category = data.category;
    this.timestamp = data.timestamp;
    this.metadata = data.metadata;
  }

  /**
   * Get formatted value with unit
   */
  get formattedValue(): string {
    if (this.unit) {
      return `${this.value.toLocaleString()} ${this.unit}`;
    }
    return this.value.toLocaleString();
  }
}

export interface MetricsSummaryData {
  totalCompanies: number;
  activeCompanies: number;
  expiredCompanies: number;
  suspendedCompanies: number;
  trialCompanies: number;
  totalApiKeys: number;
  activeApiKeys: number;
  totalWebhooks: number;
  activeWebhooks: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  errorRate: number;
  lastUpdated: string; // ISO date string
}

export class MetricsSummary {
  public readonly totalCompanies: number;
  public readonly activeCompanies: number;
  public readonly expiredCompanies: number;
  public readonly suspendedCompanies: number;
  public readonly trialCompanies: number;
  public readonly totalApiKeys: number;
  public readonly activeApiKeys: number;
  public readonly totalWebhooks: number;
  public readonly activeWebhooks: number;
  public readonly totalRequests: number;
  public readonly successfulRequests: number;
  public readonly failedRequests: number;
  public readonly averageResponseTime: number;
  public readonly errorRate: number;
  public readonly lastUpdated: string;

  constructor(data: MetricsSummaryData) {
    this.totalCompanies = data.totalCompanies;
    this.activeCompanies = data.activeCompanies;
    this.expiredCompanies = data.expiredCompanies;
    this.suspendedCompanies = data.suspendedCompanies;
    this.trialCompanies = data.trialCompanies;
    this.totalApiKeys = data.totalApiKeys;
    this.activeApiKeys = data.activeApiKeys;
    this.totalWebhooks = data.totalWebhooks;
    this.activeWebhooks = data.activeWebhooks;
    this.totalRequests = data.totalRequests;
    this.successfulRequests = data.successfulRequests;
    this.failedRequests = data.failedRequests;
    this.averageResponseTime = data.averageResponseTime;
    this.errorRate = data.errorRate;
    this.lastUpdated = data.lastUpdated;
  }

  /**
   * Get success rate percentage
   */
  get successRate(): number {
    if (this.totalRequests === 0) return 0;
    return (this.successfulRequests / this.totalRequests) * 100;
  }
}

export interface MetricHistoryData {
  metricName: string;
  dataPoints: Array<{
    timestamp: string;
    value: number;
  }>;
  periodStart: string;
  periodEnd: string;
}

export class MetricHistory {
  public readonly metricName: string;
  public readonly dataPoints: Array<{
    timestamp: string;
    value: number;
  }>;
  public readonly periodStart: string;
  public readonly periodEnd: string;

  constructor(data: MetricHistoryData) {
    this.metricName = data.metricName;
    this.dataPoints = data.dataPoints || [];
    this.periodStart = data.periodStart;
    this.periodEnd = data.periodEnd;
  }
}

