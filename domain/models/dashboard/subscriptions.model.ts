/**
 * Dashboard Subscriptions Models
 * 
 * Models for the subscriptions analytics dashboard.
 */

import {
  DistributionItem,
  DistributionItemData,
  formatCurrency,
} from './shared.model';

// ============================================================================
// Data Interfaces
// ============================================================================

export interface SubscriptionStatusDistributionData {
  active: number;
  trial: number;
  expired: number;
  suspended: number;
  cancelled: number;
  paused: number;
  total: number;
}

export interface SubscriptionByPlanData {
  planId: string;
  planName: string;
  planTier: string;
  activeCount: number;
  trialCount: number;
  totalCount: number;
  monthlyRevenue: number;
  totalRevenue: number;
  percentage: number;
  color: string;
}

export interface SubscriptionsByPlanSummaryData {
  plans: SubscriptionByPlanData[];
  topPlanName: string;
  topPlanCount: number;
  totalMonthlyRevenue: number;
}

export interface ExpiringSubscriptionData {
  subscriptionId: string;
  companyId: string;
  companyName: string;
  planName: string;
  expiryDate: string;
  daysRemaining: number;
  monthlyValue: number;
  priority: string;
}

export interface ExpiryTimelineData {
  expiringToday: ExpiringSubscriptionData[];
  expiringTodayCount: number;
  expiringTodayValue: number;
  expiringThisWeek: ExpiringSubscriptionData[];
  expiringThisWeekCount: number;
  expiringThisWeekValue: number;
  expiringThisMonth: ExpiringSubscriptionData[];
  expiringThisMonthCount: number;
  expiringThisMonthValue: number;
  expiringNext3Months: ExpiringSubscriptionData[];
  expiringNext3MonthsCount: number;
  expiringNext3MonthsValue: number;
}

export interface LifecycleMetricsData {
  newSubscriptions: number;
  renewals: number;
  upgrades: number;
  downgrades: number;
  cancellations: number;
  suspensions: number;
  reactivations: number;
  previousNewSubscriptions: number;
  previousRenewals: number;
  previousCancellations: number;
  trialConversionRate: number;
  churnRate: number;
  retentionRate: number;
  renewalRate: number;
  averageDurationDays: number;
  medianDurationDays: number;
}

export interface SubscriptionGrowthPointData {
  date: string;
  newSubscriptions: number;
  activeSubscriptions: number;
  churned: number;
}

export interface SubscriptionGrowthSummaryData {
  netGrowth: number;
  growthRate: number;
  totalNew: number;
  totalChurned: number;
  dailyData: SubscriptionGrowthPointData[];
}

export interface SubscriptionsDashboardData {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  totalMonthlyRevenue: number;
  statusDistribution: SubscriptionStatusDistributionData;
  statusChart: DistributionItemData[];
  byPlan: SubscriptionsByPlanSummaryData;
  expiryTimeline: ExpiryTimelineData;
  lifecycleMetrics: LifecycleMetricsData;
  growth: SubscriptionGrowthSummaryData;
  generatedAt: string;
}

// ============================================================================
// Domain Classes
// ============================================================================

export class SubscriptionStatusDistribution {
  public readonly active: number;
  public readonly trial: number;
  public readonly expired: number;
  public readonly suspended: number;
  public readonly cancelled: number;
  public readonly paused: number;
  public readonly total: number;

  constructor(data: SubscriptionStatusDistributionData) {
    this.active = data.active;
    this.trial = data.trial;
    this.expired = data.expired;
    this.suspended = data.suspended;
    this.cancelled = data.cancelled;
    this.paused = data.paused;
    this.total = data.total;
  }

  get activeRate(): number {
    return this.total > 0 ? (this.active / this.total) * 100 : 0;
  }

  get trialRate(): number {
    return this.total > 0 ? (this.trial / this.total) * 100 : 0;
  }

  get churnedCount(): number {
    return this.expired + this.cancelled;
  }
}

export class SubscriptionByPlan {
  public readonly planId: string;
  public readonly planName: string;
  public readonly planTier: string;
  public readonly activeCount: number;
  public readonly trialCount: number;
  public readonly totalCount: number;
  public readonly monthlyRevenue: number;
  public readonly totalRevenue: number;
  public readonly percentage: number;
  public readonly color: string;

  constructor(data: SubscriptionByPlanData) {
    this.planId = data.planId;
    this.planName = data.planName;
    this.planTier = data.planTier;
    this.activeCount = data.activeCount;
    this.trialCount = data.trialCount;
    this.totalCount = data.totalCount;
    this.monthlyRevenue = data.monthlyRevenue;
    this.totalRevenue = data.totalRevenue;
    this.percentage = data.percentage;
    this.color = data.color;
  }

  get formattedMonthlyRevenue(): string {
    return formatCurrency(this.monthlyRevenue);
  }

  get formattedTotalRevenue(): string {
    return formatCurrency(this.totalRevenue);
  }

  get formattedPercentage(): string {
    return `${this.percentage.toFixed(1)}%`;
  }

  get averageRevenuePerSubscription(): number {
    return this.activeCount > 0 ? this.monthlyRevenue / this.activeCount : 0;
  }
}

export class SubscriptionsByPlanSummary {
  public readonly plans: SubscriptionByPlan[];
  public readonly topPlanName: string;
  public readonly topPlanCount: number;
  public readonly totalMonthlyRevenue: number;

  constructor(data: SubscriptionsByPlanSummaryData) {
    this.plans = data.plans.map(p => new SubscriptionByPlan(p));
    this.topPlanName = data.topPlanName;
    this.topPlanCount = data.topPlanCount;
    this.totalMonthlyRevenue = data.totalMonthlyRevenue;
  }

  get formattedTotalMonthlyRevenue(): string {
    return formatCurrency(this.totalMonthlyRevenue);
  }

  get planCount(): number {
    return this.plans.length;
  }
}

export class ExpiringSubscription {
  public readonly subscriptionId: string;
  public readonly companyId: string;
  public readonly companyName: string;
  public readonly planName: string;
  public readonly expiryDate: Date;
  public readonly daysRemaining: number;
  public readonly monthlyValue: number;
  public readonly priority: string;

  constructor(data: ExpiringSubscriptionData) {
    this.subscriptionId = data.subscriptionId;
    this.companyId = data.companyId;
    this.companyName = data.companyName;
    this.planName = data.planName;
    this.expiryDate = new Date(data.expiryDate);
    this.daysRemaining = data.daysRemaining;
    this.monthlyValue = data.monthlyValue;
    this.priority = data.priority;
  }

  get formattedExpiryDate(): string {
    return this.expiryDate.toLocaleDateString();
  }

  get formattedValue(): string {
    return formatCurrency(this.monthlyValue);
  }

  get isCritical(): boolean {
    return this.priority === 'critical';
  }

  get isUrgent(): boolean {
    return this.priority === 'critical' || this.priority === 'high';
  }

  get daysRemainingText(): string {
    if (this.daysRemaining <= 0) return 'Today';
    if (this.daysRemaining === 1) return '1 day';
    return `${this.daysRemaining} days`;
  }
}

export class ExpiryTimeline {
  public readonly expiringToday: ExpiringSubscription[];
  public readonly expiringTodayCount: number;
  public readonly expiringTodayValue: number;
  public readonly expiringThisWeek: ExpiringSubscription[];
  public readonly expiringThisWeekCount: number;
  public readonly expiringThisWeekValue: number;
  public readonly expiringThisMonth: ExpiringSubscription[];
  public readonly expiringThisMonthCount: number;
  public readonly expiringThisMonthValue: number;
  public readonly expiringNext3Months: ExpiringSubscription[];
  public readonly expiringNext3MonthsCount: number;
  public readonly expiringNext3MonthsValue: number;

  constructor(data: ExpiryTimelineData) {
    this.expiringToday = data.expiringToday.map(s => new ExpiringSubscription(s));
    this.expiringTodayCount = data.expiringTodayCount;
    this.expiringTodayValue = data.expiringTodayValue;
    this.expiringThisWeek = data.expiringThisWeek.map(s => new ExpiringSubscription(s));
    this.expiringThisWeekCount = data.expiringThisWeekCount;
    this.expiringThisWeekValue = data.expiringThisWeekValue;
    this.expiringThisMonth = data.expiringThisMonth.map(s => new ExpiringSubscription(s));
    this.expiringThisMonthCount = data.expiringThisMonthCount;
    this.expiringThisMonthValue = data.expiringThisMonthValue;
    this.expiringNext3Months = data.expiringNext3Months.map(s => new ExpiringSubscription(s));
    this.expiringNext3MonthsCount = data.expiringNext3MonthsCount;
    this.expiringNext3MonthsValue = data.expiringNext3MonthsValue;
  }

  get totalExpiringCount(): number {
    return this.expiringTodayCount + this.expiringThisWeekCount + 
           this.expiringThisMonthCount + this.expiringNext3MonthsCount;
  }

  get totalExpiringValue(): number {
    return this.expiringTodayValue + this.expiringThisWeekValue + 
           this.expiringThisMonthValue + this.expiringNext3MonthsValue;
  }

  get formattedTotalValue(): string {
    return formatCurrency(this.totalExpiringValue);
  }

  get hasUrgent(): boolean {
    return this.expiringTodayCount > 0;
  }

  get urgentSubscriptions(): ExpiringSubscription[] {
    return [...this.expiringToday, ...this.expiringThisWeek.filter(s => s.isUrgent)];
  }
}

export class LifecycleMetrics {
  public readonly newSubscriptions: number;
  public readonly renewals: number;
  public readonly upgrades: number;
  public readonly downgrades: number;
  public readonly cancellations: number;
  public readonly suspensions: number;
  public readonly reactivations: number;
  public readonly previousNewSubscriptions: number;
  public readonly previousRenewals: number;
  public readonly previousCancellations: number;
  public readonly trialConversionRate: number;
  public readonly churnRate: number;
  public readonly retentionRate: number;
  public readonly renewalRate: number;
  public readonly averageDurationDays: number;
  public readonly medianDurationDays: number;

  constructor(data: LifecycleMetricsData) {
    this.newSubscriptions = data.newSubscriptions;
    this.renewals = data.renewals;
    this.upgrades = data.upgrades;
    this.downgrades = data.downgrades;
    this.cancellations = data.cancellations;
    this.suspensions = data.suspensions;
    this.reactivations = data.reactivations;
    this.previousNewSubscriptions = data.previousNewSubscriptions;
    this.previousRenewals = data.previousRenewals;
    this.previousCancellations = data.previousCancellations;
    this.trialConversionRate = data.trialConversionRate;
    this.churnRate = data.churnRate;
    this.retentionRate = data.retentionRate;
    this.renewalRate = data.renewalRate;
    this.averageDurationDays = data.averageDurationDays;
    this.medianDurationDays = data.medianDurationDays;
  }

  get newSubscriptionChange(): number {
    if (this.previousNewSubscriptions === 0) return 100;
    return ((this.newSubscriptions - this.previousNewSubscriptions) / this.previousNewSubscriptions) * 100;
  }

  get isGrowing(): boolean {
    return this.newSubscriptions > this.cancellations;
  }

  get netChange(): number {
    return this.newSubscriptions - this.cancellations;
  }

  get formattedRetentionRate(): string {
    return `${this.retentionRate.toFixed(1)}%`;
  }

  get formattedChurnRate(): string {
    return `${this.churnRate.toFixed(1)}%`;
  }

  get averageDurationMonths(): number {
    return Math.round(this.averageDurationDays / 30);
  }
}

export class SubscriptionGrowthPoint {
  public readonly date: Date;
  public readonly newSubscriptions: number;
  public readonly activeSubscriptions: number;
  public readonly churned: number;

  constructor(data: SubscriptionGrowthPointData) {
    this.date = new Date(data.date);
    this.newSubscriptions = data.newSubscriptions;
    this.activeSubscriptions = data.activeSubscriptions;
    this.churned = data.churned;
  }

  get formattedDate(): string {
    return this.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  get netChange(): number {
    return this.newSubscriptions - this.churned;
  }
}

export class SubscriptionGrowthSummary {
  public readonly netGrowth: number;
  public readonly growthRate: number;
  public readonly totalNew: number;
  public readonly totalChurned: number;
  public readonly dailyData: SubscriptionGrowthPoint[];

  constructor(data: SubscriptionGrowthSummaryData) {
    this.netGrowth = data.netGrowth;
    this.growthRate = data.growthRate;
    this.totalNew = data.totalNew;
    this.totalChurned = data.totalChurned;
    this.dailyData = data.dailyData.map(d => new SubscriptionGrowthPoint(d));
  }

  get formattedGrowthRate(): string {
    return `${this.growthRate >= 0 ? '+' : ''}${this.growthRate.toFixed(1)}%`;
  }

  get isGrowing(): boolean {
    return this.netGrowth > 0;
  }
}

export class SubscriptionsDashboard {
  public readonly totalSubscriptions: number;
  public readonly activeSubscriptions: number;
  public readonly trialSubscriptions: number;
  public readonly totalMonthlyRevenue: number;
  public readonly statusDistribution: SubscriptionStatusDistribution;
  public readonly statusChart: DistributionItem[];
  public readonly byPlan: SubscriptionsByPlanSummary;
  public readonly expiryTimeline: ExpiryTimeline;
  public readonly lifecycleMetrics: LifecycleMetrics;
  public readonly growth: SubscriptionGrowthSummary;
  public readonly generatedAt: Date;

  constructor(data: SubscriptionsDashboardData) {
    this.totalSubscriptions = data.totalSubscriptions;
    this.activeSubscriptions = data.activeSubscriptions;
    this.trialSubscriptions = data.trialSubscriptions;
    this.totalMonthlyRevenue = data.totalMonthlyRevenue;
    this.statusDistribution = new SubscriptionStatusDistribution(data.statusDistribution);
    this.statusChart = data.statusChart.map(d => new DistributionItem(d));
    this.byPlan = new SubscriptionsByPlanSummary(data.byPlan);
    this.expiryTimeline = new ExpiryTimeline(data.expiryTimeline);
    this.lifecycleMetrics = new LifecycleMetrics(data.lifecycleMetrics);
    this.growth = new SubscriptionGrowthSummary(data.growth);
    this.generatedAt = new Date(data.generatedAt);
  }

  get formattedTotalMonthlyRevenue(): string {
    return formatCurrency(this.totalMonthlyRevenue);
  }

  get activeRate(): number {
    return this.totalSubscriptions > 0 
      ? (this.activeSubscriptions / this.totalSubscriptions) * 100 
      : 0;
  }

  get hasUrgentExpirations(): boolean {
    return this.expiryTimeline.hasUrgent;
  }
}
