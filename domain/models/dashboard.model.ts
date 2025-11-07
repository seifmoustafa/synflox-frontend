/**
 * Dashboard Domain Model
 * 
 * Represents the core dashboard data in the domain layer.
 * This model is independent of external concerns and focuses
 * purely on dashboard data and business logic.
 */

export interface ParameterInfoData {
  name: string;
  type: string;
  source: string; // "Route", "Query", "Body", "Form", "Header", "ModelBinding"
  isOptional: boolean;
}

export class ParameterInfo {
  public readonly name: string;
  public readonly type: string;
  public readonly source: string;
  public readonly isOptional: boolean;

  constructor(data: ParameterInfoData) {
    this.name = data.name;
    this.type = data.type;
    this.source = data.source;
    this.isOptional = data.isOptional;
  }
}

export interface EndpointInfoData {
  method: string; // "GET", "POST", "PUT", "DELETE", "PATCH"
  route: string;
  controller: string;
  action: string;
  authorizationPolicy: string | null;
  allowAnonymous: boolean;
  summary: string | null;
  parameters: ParameterInfoData[];
}

export class EndpointInfo {
  public readonly method: string;
  public readonly route: string;
  public readonly controller: string;
  public readonly action: string;
  public readonly authorizationPolicy: string | null;
  public readonly allowAnonymous: boolean;
  public readonly summary: string | null;
  public readonly parameters: ParameterInfo[];

  constructor(data: EndpointInfoData) {
    this.method = data.method;
    this.route = data.route;
    this.controller = data.controller;
    this.action = data.action;
    this.authorizationPolicy = data.authorizationPolicy;
    this.allowAnonymous = data.allowAnonymous;
    this.summary = data.summary;
    this.parameters = (data.parameters || []).map(p => new ParameterInfo(p));
  }

  /**
   * Get method color for UI display
   */
  get methodColor(): string {
    const colors: Record<string, string> = {
      GET: "#3b82f6",    // Blue
      POST: "#10b981",   // Green
      PUT: "#f59e0b",    // Orange
      DELETE: "#ef4444", // Red
      PATCH: "#8b5cf6",  // Purple
    };
    return colors[this.method] || "#6b7280";
  }

  /**
   * Check if endpoint is protected
   */
  get isProtected(): boolean {
    return !this.allowAnonymous;
  }

  /**
   * Get authorization status display
   */
  get authorizationStatus(): "Protected" | "Anonymous" {
    return this.allowAnonymous ? "Anonymous" : "Protected";
  }
}

export interface LicenseStatusStatsData {
  active: number;
  expired: number;
  suspended: number;
  total: number;
}

export class LicenseStatusStats {
  public readonly active: number;
  public readonly expired: number;
  public readonly suspended: number;
  public readonly total: number;

  constructor(data: LicenseStatusStatsData) {
    this.active = data.active;
    this.expired = data.expired;
    this.suspended = data.suspended;
    this.total = data.total;
  }

  /**
   * Get active percentage
   */
  get activePercentage(): number {
    return this.total > 0 ? Math.round((this.active / this.total) * 100) : 0;
  }

  /**
   * Get expired percentage
   */
  get expiredPercentage(): number {
    return this.total > 0 ? Math.round((this.expired / this.total) * 100) : 0;
  }

  /**
   * Get suspended percentage
   */
  get suspendedPercentage(): number {
    return this.total > 0 ? Math.round((this.suspended / this.total) * 100) : 0;
  }

  /**
   * Get chart data for pie chart
   */
  get chartData(): Array<{ name: string; value: number; fill: string }> {
    return [
      { name: "Active", value: this.active, fill: "#10b981" },
      { name: "Expired", value: this.expired, fill: "#ef4444" },
      { name: "Suspended", value: this.suspended, fill: "#f59e0b" },
    ];
  }
}

export interface SystemStatisticsData {
  totalCompanies: number;
  totalAdmins: number;
  totalAdminTypes: number;
  licenseStatusStats: LicenseStatusStatsData;
  activeAdmins: number;
  inactiveAdmins: number;
  companiesExpiringSoon: number;
  recentlyCreatedCompanies: number;
  recentlyCreatedAdmins: number;
}

export class SystemStatistics {
  public readonly totalCompanies: number;
  public readonly totalAdmins: number;
  public readonly totalAdminTypes: number;
  public readonly licenseStatusStats: LicenseStatusStats;
  public readonly activeAdmins: number;
  public readonly inactiveAdmins: number;
  public readonly companiesExpiringSoon: number;
  public readonly recentlyCreatedCompanies: number;
  public readonly recentlyCreatedAdmins: number;

  constructor(data: SystemStatisticsData) {
    this.totalCompanies = data.totalCompanies;
    this.totalAdmins = data.totalAdmins;
    this.totalAdminTypes = data.totalAdminTypes;
    this.licenseStatusStats = new LicenseStatusStats(data.licenseStatusStats);
    this.activeAdmins = data.activeAdmins;
    this.inactiveAdmins = data.inactiveAdmins;
    this.companiesExpiringSoon = data.companiesExpiringSoon;
    this.recentlyCreatedCompanies = data.recentlyCreatedCompanies;
    this.recentlyCreatedAdmins = data.recentlyCreatedAdmins;
  }

  /**
   * Check if there are expiring companies (warning)
   */
  get hasExpiringCompanies(): boolean {
    return this.companiesExpiringSoon > 0;
  }
}

export interface DashboardEndpointsData {
  totalEndpoints: number;
  endpointsByController: Record<string, EndpointInfoData[]>;
  allEndpoints: EndpointInfoData[];
}

export class DashboardEndpoints {
  public readonly totalEndpoints: number;
  public readonly endpointsByController: Record<string, EndpointInfo[]>;
  public readonly allEndpoints: EndpointInfo[];

  constructor(data: DashboardEndpointsData) {
    this.totalEndpoints = data.totalEndpoints;
    this.endpointsByController = Object.fromEntries(
      Object.entries(data.endpointsByController || {}).map(([key, value]) => [
        key,
        value.map(e => new EndpointInfo(e)),
      ])
    );
    this.allEndpoints = (data.allEndpoints || []).map(e => new EndpointInfo(e));
  }

  /**
   * Get controller names
   */
  get controllerNames(): string[] {
    return Object.keys(this.endpointsByController);
  }

  /**
   * Get endpoints for a specific controller
   */
  getEndpointsByController(controller: string): EndpointInfo[] {
    return this.endpointsByController[controller] || [];
  }
}

export interface DashboardOverviewData {
  statistics: SystemStatisticsData;
  endpoints: DashboardEndpointsData;
}

export class DashboardOverview {
  public readonly statistics: SystemStatistics;
  public readonly endpoints: DashboardEndpoints;

  constructor(data: DashboardOverviewData) {
    this.statistics = new SystemStatistics(data.statistics);
    this.endpoints = new DashboardEndpoints(data.endpoints);
  }
}

