/**
 * Health Check Domain Model
 * 
 * Represents system health status.
 */

export enum HealthStatus {
  Healthy = 1,
  Degraded = 2,
  Unhealthy = 3,
  Unknown = 4,
}

export interface HealthData {
  status: HealthStatus;
  message?: string;
  timestamp: string; // ISO date string
  checks?: Record<string, {
    status: HealthStatus;
    message?: string;
    responseTime?: number; // milliseconds
  }>;
  version?: string;
  uptime?: number; // seconds
}

export class Health {
  public readonly status: HealthStatus;
  public readonly message?: string;
  public readonly timestamp: string;
  public readonly checks?: Record<string, {
    status: HealthStatus;
    message?: string;
    responseTime?: number;
  }>;
  public readonly version?: string;
  public readonly uptime?: number;

  constructor(data: HealthData) {
    this.status = data.status;
    this.message = data.message;
    this.timestamp = data.timestamp;
    this.checks = data.checks;
    this.version = data.version;
    this.uptime = data.uptime;
  }

  /**
   * Check if system is healthy
   */
  get isHealthy(): boolean {
    return this.status === HealthStatus.Healthy;
  }

  /**
   * Get formatted uptime
   */
  get formattedUptime(): string {
    if (!this.uptime) return "-";
    const days = Math.floor(this.uptime / 86400);
    const hours = Math.floor((this.uptime % 86400) / 3600);
    const minutes = Math.floor((this.uptime % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}

