/**
 * Health Mappers
 * 
 * Handles conversion between health domain models and external data formats.
 */

import {
  Health,
  HealthStatus,
  type HealthData,
} from '../models/health.model';

export class HealthMapper {
  /**
   * Convert JSON/API response to Health domain model
   */
  static fromJson(json: any): Health {
    let checks: Record<string, any> | undefined;
    if (json.checks) {
      checks = {};
      Object.entries(json.checks).forEach(([key, value]: [string, any]) => {
        checks![key] = {
          status: typeof value.status === 'number' 
            ? value.status 
            : HealthStatus[value.status as keyof typeof HealthStatus] || HealthStatus.Unknown,
          message: value.message,
          responseTime: value.responseTime,
        };
      });
    }

    return new Health({
      status: typeof json.status === 'number' 
        ? json.status 
        : HealthStatus[json.status as keyof typeof HealthStatus] || HealthStatus.Unknown,
      message: json.message,
      timestamp: json.timestamp || new Date().toISOString(),
      checks,
      version: json.version,
      uptime: json.uptime,
    });
  }
}

