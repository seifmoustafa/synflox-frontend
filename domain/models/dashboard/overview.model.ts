/**
 * Dashboard Overview Models
 * 
 * Models for the main dashboard overview page with KPIs and quick stats.
 */

import {
  DistributionItem,
  DistributionItemData,
  TimeSeriesDataPoint,
  TimeSeriesDataPointData,
  ChangeDirection,
  formatCurrency,
  formatNumber,
  formatPercentage,
} from './shared.model';

// ============================================================================
// Data Interfaces
// ============================================================================

export interface KpiCardData {
  title: string;
  value: number;
  previousValue?: number;
  changePercentage?: number;
  changeDirection?: string;
  icon: string;
  color: string;
}

export interface RecentActivityItemData {
  id: string;
  actionType: string;
  entityType: string;
  entityName: string;
  entityId: string;
  performedBy: string;
  performedById: string;
  performedAt: string;
  description?: string;
  icon: string;
  color: string;
  timeAgo?: string; // From backend (localized)
}

export interface QuickStatsData {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  companiesWithoutSub: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  expiredSubscriptions: number;
  suspendedSubscriptions: number;
  expiringToday: number;
  expiringThisWeek: number;
  expiringThisMonth: number;
  totalAdmins: number;
  activeAdmins: number;
  companyGrowthRate: number;
  subscriptionGrowthRate: number;
}

export interface OverviewDashboardData {
  companiesKpi: KpiCardData;
  subscriptionsKpi: KpiCardData;
  revenueKpi: KpiCardData;
  alertsKpi: KpiCardData;
  stats: QuickStatsData;
  subscriptionStatusDistribution: DistributionItemData[];
  growthTrend: TimeSeriesDataPointData[];
  recentActivity: RecentActivityItemData[];
  generatedAt: string;
}

// ============================================================================
// Domain Classes
// ============================================================================

export class KpiCard {
  public readonly title: string;
  public readonly value: number;
  public readonly previousValue?: number;
  public readonly changePercentage?: number;
  public readonly changeDirection: ChangeDirection;
  public readonly icon: string;
  public readonly color: string;

  constructor(data: KpiCardData) {
    this.title = data.title;
    this.value = data.value;
    this.previousValue = data.previousValue;
    this.changePercentage = data.changePercentage;
    this.changeDirection = (data.changeDirection as ChangeDirection) || 'unchanged';
    this.icon = data.icon;
    this.color = data.color;
  }

  get formattedValue(): string {
    if (this.title.toLowerCase().includes('mrr') || this.title.toLowerCase().includes('revenue')) {
      return formatCurrency(this.value);
    }
    return formatNumber(this.value);
  }

  get formattedChange(): string {
    if (this.changePercentage === undefined || this.changePercentage === null) return '';
    return formatPercentage(this.changePercentage);
  }

  get hasChange(): boolean {
    return this.changePercentage !== undefined && this.changePercentage !== null;
  }

  get isPositiveChange(): boolean {
    return this.changeDirection === 'up';
  }

  get isNegativeChange(): boolean {
    return this.changeDirection === 'down';
  }
}

export class RecentActivityItem {
  public readonly id: string;
  public readonly actionType: string;
  public readonly entityType: string;
  public readonly entityName: string;
  public readonly entityId: string;
  public readonly performedBy: string;
  public readonly performedById: string;
  public readonly performedAt: Date;
  public readonly description?: string;
  public readonly icon: string;
  public readonly color: string;
  private readonly _timeAgo?: string;

  constructor(data: RecentActivityItemData) {
    this.id = data.id;
    this.actionType = data.actionType;
    this.entityType = data.entityType;
    this.entityName = data.entityName;
    this.entityId = data.entityId;
    this.performedBy = data.performedBy;
    this.performedById = data.performedById;
    this.performedAt = new Date(data.performedAt);
    this.description = data.description;
    this.icon = data.icon;
    this.color = data.color;
    this._timeAgo = data.timeAgo;
  }

  // Use backend localized timeAgo if available, otherwise compute locally
  get timeAgo(): string {
    if (this._timeAgo) return this._timeAgo;
    
    const now = new Date();
    const diff = now.getTime() - this.performedAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return this.performedAt.toLocaleDateString();
  }

  get displayText(): string {
    return `${this.performedBy} ${this.actionType.toLowerCase()} ${this.entityType.toLowerCase()} "${this.entityName}"`;
  }
}

export class QuickStats {
  public readonly totalCompanies: number;
  public readonly activeCompanies: number;
  public readonly inactiveCompanies: number;
  public readonly companiesWithoutSub: number;
  public readonly totalSubscriptions: number;
  public readonly activeSubscriptions: number;
  public readonly trialSubscriptions: number;
  public readonly expiredSubscriptions: number;
  public readonly suspendedSubscriptions: number;
  public readonly expiringToday: number;
  public readonly expiringThisWeek: number;
  public readonly expiringThisMonth: number;
  public readonly totalAdmins: number;
  public readonly activeAdmins: number;
  public readonly companyGrowthRate: number;
  public readonly subscriptionGrowthRate: number;

  constructor(data: QuickStatsData) {
    this.totalCompanies = data.totalCompanies;
    this.activeCompanies = data.activeCompanies;
    this.inactiveCompanies = data.inactiveCompanies;
    this.companiesWithoutSub = data.companiesWithoutSub;
    this.totalSubscriptions = data.totalSubscriptions;
    this.activeSubscriptions = data.activeSubscriptions;
    this.trialSubscriptions = data.trialSubscriptions;
    this.expiredSubscriptions = data.expiredSubscriptions;
    this.suspendedSubscriptions = data.suspendedSubscriptions;
    this.expiringToday = data.expiringToday;
    this.expiringThisWeek = data.expiringThisWeek;
    this.expiringThisMonth = data.expiringThisMonth;
    this.totalAdmins = data.totalAdmins;
    this.activeAdmins = data.activeAdmins;
    this.companyGrowthRate = data.companyGrowthRate;
    this.subscriptionGrowthRate = data.subscriptionGrowthRate;
  }

  get totalExpiring(): number {
    return this.expiringToday + this.expiringThisWeek + this.expiringThisMonth;
  }

  get companyActivityRate(): number {
    if (this.totalCompanies === 0) return 0;
    return (this.activeCompanies / this.totalCompanies) * 100;
  }

  get adminActivityRate(): number {
    if (this.totalAdmins === 0) return 0;
    return (this.activeAdmins / this.totalAdmins) * 100;
  }

  get hasUrgentAlerts(): boolean {
    return this.expiringToday > 0;
  }
}

export class OverviewDashboard {
  public readonly companiesKpi: KpiCard;
  public readonly subscriptionsKpi: KpiCard;
  public readonly revenueKpi: KpiCard;
  public readonly alertsKpi: KpiCard;
  public readonly stats: QuickStats;
  public readonly subscriptionStatusDistribution: DistributionItem[];
  public readonly growthTrend: TimeSeriesDataPoint[];
  public readonly recentActivity: RecentActivityItem[];
  public readonly generatedAt: Date;

  constructor(data: OverviewDashboardData) {
    this.companiesKpi = new KpiCard(data.companiesKpi);
    this.subscriptionsKpi = new KpiCard(data.subscriptionsKpi);
    this.revenueKpi = new KpiCard(data.revenueKpi);
    this.alertsKpi = new KpiCard(data.alertsKpi);
    this.stats = new QuickStats(data.stats);
    this.subscriptionStatusDistribution = data.subscriptionStatusDistribution.map(
      d => new DistributionItem(d)
    );
    this.growthTrend = data.growthTrend.map(d => new TimeSeriesDataPoint(d));
    this.recentActivity = data.recentActivity.map(d => new RecentActivityItem(d));
    this.generatedAt = new Date(data.generatedAt);
  }

  get kpiCards(): KpiCard[] {
    return [this.companiesKpi, this.subscriptionsKpi, this.revenueKpi, this.alertsKpi];
  }

  get formattedGeneratedAt(): string {
    return this.generatedAt.toLocaleString();
  }

  get hasRecentActivity(): boolean {
    return this.recentActivity.length > 0;
  }
}
