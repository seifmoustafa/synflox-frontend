/**
 * Dashboard Companies Models
 * 
 * Models for the companies analytics dashboard.
 */

import {
  DistributionItem,
  DistributionItemData,
  CompanyStatus,
} from './shared.model';

// ============================================================================
// Data Interfaces
// ============================================================================

export interface CompanyStatusDistributionData {
  active: number;
  inactive: number;
  suspended: number;
  atRisk: number;
  total: number;
}

export interface CompanyGrowthPointData {
  date: string;
  newCompanies: number;
  totalCompanies: number;
}

export interface CompanyGrowthSummaryData {
  totalGrowth: number;
  growthRate: number;
  averagePerDay: number;
  bestDay: number;
  bestDayDate: string;
  dailyData: CompanyGrowthPointData[];
}

export interface TopCompanyData {
  id: string;
  name: string;
  logoUrl?: string;
  activeSubscriptions: number;
  totalValue: number;
  topPlanName: string;
  latestSubscriptionDate: string;
  status: string;
}

export interface TopCompaniesData {
  companies: TopCompanyData[];
  totalRevenue: number;
  totalSubscriptions: number;
}

export type CompanyAlertType = 
  | 'no_subscription'
  | 'subscription_expiring'
  | 'subscription_expired'
  | 'payment_failed'
  | 'inactive';

export interface CompanyAlertData {
  companyId: string;
  companyName: string;
  alertType: string;
  alertMessage: string;
  expiryDate?: string;
  daysRemaining: number;
  priority: string;
  suggestedAction: string;
}

export interface CompaniesDashboardData {
  // Currency info
  displayCurrency: string;
  displayCurrencySymbol: string;
  // Stats
  totalCompanies: number;
  newThisMonth: number;
  newThisWeek: number;
  subscriptionCoverage: number;
  statusDistribution: CompanyStatusDistributionData;
  statusChart: DistributionItemData[];
  growth: CompanyGrowthSummaryData;
  topCompanies: TopCompaniesData;
  alerts: CompanyAlertData[];
  criticalAlertCount: number;
  highAlertCount: number;
  mediumAlertCount: number;
  withActiveSubscription: number;
  withTrialSubscription: number;
  withExpiredSubscription: number;
  withNoSubscription: number;
  generatedAt: string;
}

// ============================================================================
// Domain Classes
// ============================================================================

export class CompanyStatusDistribution {
  public readonly active: number;
  public readonly inactive: number;
  public readonly suspended: number;
  public readonly atRisk: number;
  public readonly total: number;

  constructor(data: CompanyStatusDistributionData) {
    this.active = data.active;
    this.inactive = data.inactive;
    this.suspended = data.suspended;
    this.atRisk = data.atRisk;
    this.total = data.total;
  }

  getPercentage(status: CompanyStatus): number {
    if (this.total === 0) return 0;
    switch (status) {
      case 'active': return (this.active / this.total) * 100;
      case 'inactive': return (this.inactive / this.total) * 100;
      case 'suspended': return (this.suspended / this.total) * 100;
      case 'at_risk': return (this.atRisk / this.total) * 100;
    }
  }

  get healthScore(): number {
    if (this.total === 0) return 0;
    // Health = Active / (Total - Suspended)
    const denominator = this.total - this.suspended;
    return denominator > 0 ? (this.active / denominator) * 100 : 0;
  }
}

export class CompanyGrowthPoint {
  public readonly date: Date;
  public readonly newCompanies: number;
  public readonly totalCompanies: number;

  constructor(data: CompanyGrowthPointData) {
    this.date = new Date(data.date);
    this.newCompanies = data.newCompanies;
    this.totalCompanies = data.totalCompanies;
  }

  get formattedDate(): string {
    return this.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export class CompanyGrowthSummary {
  public readonly totalGrowth: number;
  public readonly growthRate: number;
  public readonly averagePerDay: number;
  public readonly bestDay: number;
  public readonly bestDayDate: Date;
  public readonly dailyData: CompanyGrowthPoint[];

  constructor(data: CompanyGrowthSummaryData) {
    this.totalGrowth = data.totalGrowth;
    this.growthRate = data.growthRate;
    this.averagePerDay = data.averagePerDay;
    this.bestDay = data.bestDay;
    this.bestDayDate = new Date(data.bestDayDate);
    this.dailyData = data.dailyData.map(d => new CompanyGrowthPoint(d));
  }

  get formattedGrowthRate(): string {
    return `${this.growthRate >= 0 ? '+' : ''}${this.growthRate.toFixed(1)}%`;
  }

  get isGrowing(): boolean {
    return this.growthRate > 0;
  }

  get formattedBestDayDate(): string {
    return this.bestDayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export class TopCompany {
  public readonly id: string;
  public readonly name: string;
  public readonly logoUrl?: string;
  public readonly activeSubscriptions: number;
  public readonly totalValue: number;
  public readonly topPlanName: string;
  public readonly latestSubscriptionDate: Date;
  public readonly status: CompanyStatus;

  constructor(data: TopCompanyData) {
    this.id = data.id;
    this.name = data.name;
    this.logoUrl = data.logoUrl;
    this.activeSubscriptions = data.activeSubscriptions;
    this.totalValue = data.totalValue;
    this.topPlanName = data.topPlanName;
    this.latestSubscriptionDate = new Date(data.latestSubscriptionDate);
    this.status = (data.status.toLowerCase().replace('_', '-') as CompanyStatus) || 'active';
  }

  get formattedValue(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(this.totalValue);
  }

  get initials(): string {
    return this.name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  get isAtRisk(): boolean {
    return this.status === 'at_risk';
  }
}

export class TopCompanies {
  public readonly companies: TopCompany[];
  public readonly totalRevenue: number;
  public readonly totalSubscriptions: number;

  constructor(data: TopCompaniesData) {
    this.companies = data.companies.map(c => new TopCompany(c));
    this.totalRevenue = data.totalRevenue;
    this.totalSubscriptions = data.totalSubscriptions;
  }

  get formattedTotalRevenue(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(this.totalRevenue);
  }

  get averageRevenuePerCompany(): number {
    return this.companies.length > 0 ? this.totalRevenue / this.companies.length : 0;
  }
}

export class CompanyAlert {
  public readonly companyId: string;
  public readonly companyName: string;
  public readonly alertType: CompanyAlertType;
  public readonly alertMessage: string;
  public readonly expiryDate?: Date;
  public readonly daysRemaining: number;
  public readonly priority: string;
  public readonly suggestedAction: string;

  constructor(data: CompanyAlertData) {
    this.companyId = data.companyId;
    this.companyName = data.companyName;
    this.alertType = data.alertType as CompanyAlertType;
    this.alertMessage = data.alertMessage;
    this.expiryDate = data.expiryDate ? new Date(data.expiryDate) : undefined;
    this.daysRemaining = data.daysRemaining;
    this.priority = data.priority;
    this.suggestedAction = data.suggestedAction;
  }

  get isCritical(): boolean {
    return this.priority === 'critical';
  }

  get isUrgent(): boolean {
    return this.priority === 'critical' || this.priority === 'high';
  }

  get formattedExpiryDate(): string {
    return this.expiryDate ? this.expiryDate.toLocaleDateString() : 'N/A';
  }
}

export class CompaniesDashboard {
  public readonly displayCurrency: string;
  public readonly displayCurrencySymbol: string;
  public readonly totalCompanies: number;
  public readonly newThisMonth: number;
  public readonly newThisWeek: number;
  public readonly subscriptionCoverage: number;
  public readonly statusDistribution: CompanyStatusDistribution;
  public readonly statusChart: DistributionItem[];
  public readonly growth: CompanyGrowthSummary;
  public readonly topCompanies: TopCompanies;
  public readonly alerts: CompanyAlert[];
  public readonly criticalAlertCount: number;
  public readonly highAlertCount: number;
  public readonly mediumAlertCount: number;
  public readonly withActiveSubscription: number;
  public readonly withTrialSubscription: number;
  public readonly withExpiredSubscription: number;
  public readonly withNoSubscription: number;
  public readonly generatedAt: Date;

  constructor(data: CompaniesDashboardData) {
    this.displayCurrency = data.displayCurrency;
    this.displayCurrencySymbol = data.displayCurrencySymbol;
    this.totalCompanies = data.totalCompanies;
    this.newThisMonth = data.newThisMonth;
    this.newThisWeek = data.newThisWeek;
    this.subscriptionCoverage = data.subscriptionCoverage;
    this.statusDistribution = new CompanyStatusDistribution(data.statusDistribution);
    this.statusChart = data.statusChart.map(d => new DistributionItem(d));
    this.growth = new CompanyGrowthSummary(data.growth);
    this.topCompanies = new TopCompanies(data.topCompanies);
    this.alerts = data.alerts.map(a => new CompanyAlert(a));
    this.criticalAlertCount = data.criticalAlertCount;
    this.highAlertCount = data.highAlertCount;
    this.mediumAlertCount = data.mediumAlertCount;
    this.withActiveSubscription = data.withActiveSubscription;
    this.withTrialSubscription = data.withTrialSubscription;
    this.withExpiredSubscription = data.withExpiredSubscription;
    this.withNoSubscription = data.withNoSubscription;
    this.generatedAt = new Date(data.generatedAt);
  }

  get formattedCoverage(): string {
    return `${this.subscriptionCoverage.toFixed(1)}%`;
  }

  get totalAlertCount(): number {
    return this.criticalAlertCount + this.highAlertCount + this.mediumAlertCount;
  }

  get hasUrgentAlerts(): boolean {
    return this.criticalAlertCount > 0 || this.highAlertCount > 0;
  }

  get urgentAlerts(): CompanyAlert[] {
    return this.alerts.filter(a => a.isUrgent);
  }
}
