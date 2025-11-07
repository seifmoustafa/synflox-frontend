/**
 * Dashboard Mappers
 * 
 * Handles conversion between dashboard domain models and external data formats.
 * Follows Single Responsibility Principle by separating serialization concerns
 * from domain logic.
 */

import {
  DashboardOverview,
  SystemStatistics,
  DashboardEndpoints,
  LicenseStatusStats,
  EndpointInfo,
  ParameterInfo,
  type DashboardOverviewData,
  type SystemStatisticsData,
  type DashboardEndpointsData,
  type LicenseStatusStatsData,
  type EndpointInfoData,
  type ParameterInfoData,
} from '../models/dashboard.model';

export interface DashboardOverviewResponse {
  statistics: SystemStatistics;
  endpoints: DashboardEndpoints;
}

export class DashboardMapper {
  /**
   * Convert ParameterInfo JSON to domain model
   */
  static parameterInfoFromJson(json: any): ParameterInfo {
    return new ParameterInfo({
      name: json.name || '',
      type: json.type || '',
      source: json.source || '',
      isOptional: json.isOptional ?? false,
    });
  }

  /**
   * Convert EndpointInfo JSON to domain model
   */
  static endpointInfoFromJson(json: any): EndpointInfo {
    return new EndpointInfo({
      method: json.method || 'GET',
      route: json.route || '',
      controller: json.controller || '',
      action: json.action || '',
      authorizationPolicy: json.authorizationPolicy || null,
      allowAnonymous: json.allowAnonymous ?? false,
      summary: json.summary || null,
      parameters: (json.parameters || []).map((p: any) => this.parameterInfoFromJson(p)),
    });
  }

  /**
   * Convert LicenseStatusStats JSON to domain model
   */
  static licenseStatusStatsFromJson(json: any): LicenseStatusStats {
    return new LicenseStatusStats({
      active: json.active || 0,
      expired: json.expired || 0,
      suspended: json.suspended || 0,
      total: json.total || 0,
    });
  }

  /**
   * Convert SystemStatistics JSON to domain model
   */
  static systemStatisticsFromJson(json: any): SystemStatistics {
    return new SystemStatistics({
      totalCompanies: json.totalCompanies || 0,
      totalAdmins: json.totalAdmins || 0,
      totalAdminTypes: json.totalAdminTypes || 0,
      licenseStatusStats: json.licenseStatusStats || {
        active: 0,
        expired: 0,
        suspended: 0,
        total: 0,
      },
      activeAdmins: json.activeAdmins || 0,
      inactiveAdmins: json.inactiveAdmins || 0,
      companiesExpiringSoon: json.companiesExpiringSoon || 0,
      recentlyCreatedCompanies: json.recentlyCreatedCompanies || 0,
      recentlyCreatedAdmins: json.recentlyCreatedAdmins || 0,
    });
  }

  /**
   * Convert DashboardEndpoints JSON to domain model
   */
  static dashboardEndpointsFromJson(json: any): DashboardEndpoints {
    const endpointsByController: Record<string, EndpointInfoData[]> = {};
    if (json.endpointsByController) {
      Object.entries(json.endpointsByController).forEach(([key, value]) => {
        endpointsByController[key] = Array.isArray(value)
          ? value.map((e: any) => ({
              method: e.method || 'GET',
              route: e.route || '',
              controller: e.controller || '',
              action: e.action || '',
              authorizationPolicy: e.authorizationPolicy || null,
              allowAnonymous: e.allowAnonymous ?? false,
              summary: e.summary || null,
              parameters: (e.parameters || []).map((p: any) => ({
                name: p.name || '',
                type: p.type || '',
                source: p.source || '',
                isOptional: p.isOptional ?? false,
              })),
            }))
          : [];
      });
    }

    return new DashboardEndpoints({
      totalEndpoints: json.totalEndpoints || 0,
      endpointsByController,
      allEndpoints: (json.allEndpoints || []).map((e: any) => ({
        method: e.method || 'GET',
        route: e.route || '',
        controller: e.controller || '',
        action: e.action || '',
        authorizationPolicy: e.authorizationPolicy || null,
        allowAnonymous: e.allowAnonymous ?? false,
        summary: e.summary || null,
        parameters: (e.parameters || []).map((p: any) => ({
          name: p.name || '',
          type: p.type || '',
          source: p.source || '',
          isOptional: p.isOptional ?? false,
        })),
      })),
    });
  }

  /**
   * Convert DashboardOverview JSON to domain model
   */
  static dashboardOverviewFromJson(json: any): DashboardOverview {
    return new DashboardOverview({
      statistics: json.statistics || {
        totalCompanies: 0,
        totalAdmins: 0,
        totalAdminTypes: 0,
        licenseStatusStats: {
          active: 0,
          expired: 0,
          suspended: 0,
          total: 0,
        },
        activeAdmins: 0,
        inactiveAdmins: 0,
        companiesExpiringSoon: 0,
        recentlyCreatedCompanies: 0,
        recentlyCreatedAdmins: 0,
      },
      endpoints: json.endpoints || {
        totalEndpoints: 0,
        endpointsByController: {},
        allEndpoints: [],
      },
    });
  }

  /**
   * Handle API response format and convert to DashboardOverview
   * Backend format: { statusCode, message, data: { statistics, endpoints } }
   */
  static handleApiResponse(response: any): DashboardOverview {
    // Handle SYNFLOX backend response format: { statusCode, message, data: { statistics, endpoints } }
    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data;
      if (data && typeof data === 'object') {
        return this.dashboardOverviewFromJson(data);
      }
    }

    // Handle direct data format
    if (response && typeof response === 'object') {
      return this.dashboardOverviewFromJson(response);
    }

    // Fallback for unexpected response format
    return this.dashboardOverviewFromJson({});
  }

  /**
   * Handle statistics API response
   */
  static handleStatisticsResponse(response: any): SystemStatistics {
    if (response && typeof response === 'object' && 'data' in response) {
      return this.systemStatisticsFromJson(response.data);
    }
    return this.systemStatisticsFromJson(response || {});
  }

  /**
   * Handle endpoints API response
   */
  static handleEndpointsResponse(response: any): DashboardEndpoints {
    if (response && typeof response === 'object' && 'data' in response) {
      return this.dashboardEndpointsFromJson(response.data);
    }
    return this.dashboardEndpointsFromJson(response || {});
  }
}

