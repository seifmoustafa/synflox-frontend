/**
 * Dashboard Revenue Models
 * 
 * Models for the revenue analytics dashboard (SuperAdmin only).
 */

import {
  DistributionItem,
  DistributionItemData,
  formatCurrency,
} from './shared.model';

// ============================================================================
// Data Interfaces
// ============================================================================

export interface RevenueMetricsData {
  mrr: number;
  previousMrr: number;
  mrrChange: number;
  mrrChangePercentage: number;
  arr: number;
  previousArr: number;
  arrChange: number;
  arrChangePercentage: number;
  arpc: number;
  previousArpc: number;
  arpcChange: number;
  arpcChangePercentage: number;
  estimatedCltv: number;
  activeCustomers: number;
  previousActiveCustomers: number;
}

export interface RevenueByPlanItemData {
  planId: string;
  planName: string;
  planTier: string;
  monthlyRevenue: number;
  annualRevenue: number;
  subscriptionCount: number;
  percentage: number;
  color: string;
}

export interface RevenueByPlanData {
  plans: RevenueByPlanItemData[];
  topRevenuePlanName: string;
  topRevenuePlanValue: number;
  totalRevenue: number;
}

export interface RevenueTrendPointData {
  date: string;
  label: string;
  revenue: number;
  newRevenue: number;
  renewalRevenue: number;
  churnedRevenue: number;
}

export interface RevenueTrendData {
  dataPoints: RevenueTrendPointData[];
  totalGrowth: number;
  growthRate: number;
  trendDirection: string;
  highestRevenue: number;
  highestRevenueDate: string;
  lowestRevenue: number;
  lowestRevenueDate: string;
}

export interface RevenueProjectionData {
  expectedRenewalRevenue: number;
  expectedRenewals: number;
  atRiskRevenue: number;
  atRiskSubscriptions: number;
  projectedNextMonthMrr: number;
  projectedNextMonthChange: number;
  projectedNextQuarterRevenue: number;
  projectedChurnImpact: number;
  bestCaseProjection: number;
  worstCaseProjection: number;
}

export interface RevenueDashboardData {
  // Currency info
  displayCurrency: string;
  displayCurrencySymbol: string;
  
  // Core data
  metrics: RevenueMetricsData;
  byPlan: RevenueByPlanData;
  byPlanChart: DistributionItemData[];
  trend: RevenueTrendData;
  projections: RevenueProjectionData;
  totalLifetimeRevenue: number;
  averageOrderValue: number;
  totalTransactions: number;
  byCurrency: DistributionItemData[];
  
  // Timestamps
  exchangeRatesUpdatedAt: string;
  generatedAt: string;
}

// Currency rates response
export interface CurrencyRateItemData {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

export interface CurrencyRatesData {
  baseCurrency: string;
  rates: CurrencyRateItemData[];
  lastUpdated: string;
  source: string;
}

// ============================================================================
// Domain Classes
// ============================================================================

export class RevenueMetrics {
  public readonly mrr: number;
  public readonly previousMrr: number;
  public readonly mrrChange: number;
  public readonly mrrChangePercentage: number;
  public readonly arr: number;
  public readonly previousArr: number;
  public readonly arrChange: number;
  public readonly arrChangePercentage: number;
  public readonly arpc: number;
  public readonly previousArpc: number;
  public readonly arpcChange: number;
  public readonly arpcChangePercentage: number;
  public readonly estimatedCltv: number;
  public readonly activeCustomers: number;
  public readonly previousActiveCustomers: number;

  constructor(data: RevenueMetricsData) {
    this.mrr = data.mrr;
    this.previousMrr = data.previousMrr;
    this.mrrChange = data.mrrChange;
    this.mrrChangePercentage = data.mrrChangePercentage;
    this.arr = data.arr;
    this.previousArr = data.previousArr;
    this.arrChange = data.arrChange;
    this.arrChangePercentage = data.arrChangePercentage;
    this.arpc = data.arpc;
    this.previousArpc = data.previousArpc;
    this.arpcChange = data.arpcChange;
    this.arpcChangePercentage = data.arpcChangePercentage;
    this.estimatedCltv = data.estimatedCltv;
    this.activeCustomers = data.activeCustomers;
    this.previousActiveCustomers = data.previousActiveCustomers;
  }

  get formattedMrr(): string {
    return formatCurrency(this.mrr);
  }

  get formattedArr(): string {
    return formatCurrency(this.arr);
  }

  get formattedArpc(): string {
    return formatCurrency(this.arpc);
  }

  get formattedCltv(): string {
    return formatCurrency(this.estimatedCltv);
  }

  get formattedMrrChange(): string {
    const prefix = this.mrrChange >= 0 ? '+' : '';
    return `${prefix}${formatCurrency(this.mrrChange)}`;
  }

  get formattedMrrChangePercentage(): string {
    const prefix = this.mrrChangePercentage >= 0 ? '+' : '';
    return `${prefix}${this.mrrChangePercentage.toFixed(1)}%`;
  }

  get isMrrGrowing(): boolean {
    return this.mrrChange > 0;
  }

  get isArrGrowing(): boolean {
    return this.arrChange > 0;
  }

  get customerChange(): number {
    return this.activeCustomers - this.previousActiveCustomers;
  }
}

export class RevenueByPlanItem {
  public readonly planId: string;
  public readonly planName: string;
  public readonly planTier: string;
  public readonly monthlyRevenue: number;
  public readonly annualRevenue: number;
  public readonly subscriptionCount: number;
  public readonly percentage: number;
  public readonly color: string;

  constructor(data: RevenueByPlanItemData) {
    this.planId = data.planId;
    this.planName = data.planName;
    this.planTier = data.planTier;
    this.monthlyRevenue = data.monthlyRevenue;
    this.annualRevenue = data.annualRevenue;
    this.subscriptionCount = data.subscriptionCount;
    this.percentage = data.percentage;
    this.color = data.color;
  }

  get formattedMonthlyRevenue(): string {
    return formatCurrency(this.monthlyRevenue);
  }

  get formattedAnnualRevenue(): string {
    return formatCurrency(this.annualRevenue);
  }

  get formattedPercentage(): string {
    return `${this.percentage.toFixed(1)}%`;
  }

  get averageRevenuePerSub(): number {
    return this.subscriptionCount > 0 ? this.monthlyRevenue / this.subscriptionCount : 0;
  }
}

export class RevenueByPlan {
  public readonly plans: RevenueByPlanItem[];
  public readonly topRevenuePlanName: string;
  public readonly topRevenuePlanValue: number;
  public readonly totalRevenue: number;

  constructor(data: RevenueByPlanData) {
    this.plans = data.plans.map(p => new RevenueByPlanItem(p));
    this.topRevenuePlanName = data.topRevenuePlanName;
    this.topRevenuePlanValue = data.topRevenuePlanValue;
    this.totalRevenue = data.totalRevenue;
  }

  get formattedTotalRevenue(): string {
    return formatCurrency(this.totalRevenue);
  }

  get formattedTopPlanValue(): string {
    return formatCurrency(this.topRevenuePlanValue);
  }

  get planCount(): number {
    return this.plans.length;
  }
}

export class RevenueTrendPoint {
  public readonly date: Date;
  public readonly label: string;
  public readonly revenue: number;
  public readonly newRevenue: number;
  public readonly renewalRevenue: number;
  public readonly churnedRevenue: number;

  constructor(data: RevenueTrendPointData) {
    this.date = new Date(data.date);
    this.label = data.label;
    this.revenue = data.revenue;
    this.newRevenue = data.newRevenue;
    this.renewalRevenue = data.renewalRevenue;
    this.churnedRevenue = data.churnedRevenue;
  }

  get formattedRevenue(): string {
    return formatCurrency(this.revenue);
  }

  get netChange(): number {
    return this.newRevenue + this.renewalRevenue - this.churnedRevenue;
  }
}

export class RevenueTrend {
  public readonly dataPoints: RevenueTrendPoint[];
  public readonly totalGrowth: number;
  public readonly growthRate: number;
  public readonly trendDirection: 'up' | 'down' | 'stable';
  public readonly highestRevenue: number;
  public readonly highestRevenueDate: Date;
  public readonly lowestRevenue: number;
  public readonly lowestRevenueDate: Date;

  constructor(data: RevenueTrendData) {
    this.dataPoints = data.dataPoints.map(p => new RevenueTrendPoint(p));
    this.totalGrowth = data.totalGrowth;
    this.growthRate = data.growthRate;
    this.trendDirection = (data.trendDirection as 'up' | 'down' | 'stable') || 'stable';
    this.highestRevenue = data.highestRevenue;
    this.highestRevenueDate = new Date(data.highestRevenueDate);
    this.lowestRevenue = data.lowestRevenue;
    this.lowestRevenueDate = new Date(data.lowestRevenueDate);
  }

  get formattedGrowthRate(): string {
    const prefix = this.growthRate >= 0 ? '+' : '';
    return `${prefix}${this.growthRate.toFixed(1)}%`;
  }

  get formattedTotalGrowth(): string {
    return formatCurrency(this.totalGrowth);
  }

  get isGrowing(): boolean {
    return this.trendDirection === 'up';
  }

  get formattedHighestRevenue(): string {
    return formatCurrency(this.highestRevenue);
  }
}

export class RevenueProjection {
  public readonly expectedRenewalRevenue: number;
  public readonly expectedRenewals: number;
  public readonly atRiskRevenue: number;
  public readonly atRiskSubscriptions: number;
  public readonly projectedNextMonthMrr: number;
  public readonly projectedNextMonthChange: number;
  public readonly projectedNextQuarterRevenue: number;
  public readonly projectedChurnImpact: number;
  public readonly bestCaseProjection: number;
  public readonly worstCaseProjection: number;

  constructor(data: RevenueProjectionData) {
    this.expectedRenewalRevenue = data.expectedRenewalRevenue;
    this.expectedRenewals = data.expectedRenewals;
    this.atRiskRevenue = data.atRiskRevenue;
    this.atRiskSubscriptions = data.atRiskSubscriptions;
    this.projectedNextMonthMrr = data.projectedNextMonthMrr;
    this.projectedNextMonthChange = data.projectedNextMonthChange;
    this.projectedNextQuarterRevenue = data.projectedNextQuarterRevenue;
    this.projectedChurnImpact = data.projectedChurnImpact;
    this.bestCaseProjection = data.bestCaseProjection;
    this.worstCaseProjection = data.worstCaseProjection;
  }

  get formattedNextMonthMrr(): string {
    return formatCurrency(this.projectedNextMonthMrr);
  }

  get formattedNextQuarterRevenue(): string {
    return formatCurrency(this.projectedNextQuarterRevenue);
  }

  get formattedAtRiskRevenue(): string {
    return formatCurrency(this.atRiskRevenue);
  }

  get formattedExpectedRenewalRevenue(): string {
    return formatCurrency(this.expectedRenewalRevenue);
  }

  get projectionRange(): string {
    return `${formatCurrency(this.worstCaseProjection)} - ${formatCurrency(this.bestCaseProjection)}`;
  }

  get hasRisk(): boolean {
    return this.atRiskSubscriptions > 0;
  }
}

export class RevenueDashboard {
  // Currency info
  public readonly displayCurrency: string;
  public readonly displayCurrencySymbol: string;
  
  // Core data
  public readonly metrics: RevenueMetrics;
  public readonly byPlan: RevenueByPlan;
  public readonly byPlanChart: DistributionItem[];
  public readonly trend: RevenueTrend;
  public readonly projections: RevenueProjection;
  public readonly totalLifetimeRevenue: number;
  public readonly averageOrderValue: number;
  public readonly totalTransactions: number;
  public readonly byCurrency: DistributionItem[];
  
  // Timestamps
  public readonly exchangeRatesUpdatedAt: Date;
  public readonly generatedAt: Date;

  constructor(data: RevenueDashboardData) {
    this.displayCurrency = data.displayCurrency;
    this.displayCurrencySymbol = data.displayCurrencySymbol;
    this.metrics = new RevenueMetrics(data.metrics);
    this.byPlan = new RevenueByPlan(data.byPlan);
    this.byPlanChart = data.byPlanChart.map(d => new DistributionItem(d));
    this.trend = new RevenueTrend(data.trend);
    this.projections = new RevenueProjection(data.projections);
    this.totalLifetimeRevenue = data.totalLifetimeRevenue;
    this.averageOrderValue = data.averageOrderValue;
    this.totalTransactions = data.totalTransactions;
    this.byCurrency = data.byCurrency.map(d => new DistributionItem(d));
    this.exchangeRatesUpdatedAt = new Date(data.exchangeRatesUpdatedAt);
    this.generatedAt = new Date(data.generatedAt);
  }

  get formattedTotalLifetimeRevenue(): string {
    return `${this.displayCurrencySymbol}${this.totalLifetimeRevenue.toLocaleString()}`;
  }

  get formattedAverageOrderValue(): string {
    return `${this.displayCurrencySymbol}${this.averageOrderValue.toLocaleString()}`;
  }

  get isHealthy(): boolean {
    return this.metrics.isMrrGrowing && !this.projections.hasRisk;
  }
  
  get ratesAgeInMinutes(): number {
    return Math.floor((new Date().getTime() - this.exchangeRatesUpdatedAt.getTime()) / 60000);
  }
  
  get isRatesStale(): boolean {
    return this.ratesAgeInMinutes > 120; // More than 2 hours old
  }
}

// Currency Rate classes
export class CurrencyRateItem {
  public readonly code: string;
  public readonly name: string;
  public readonly symbol: string;
  public readonly rate: number;
  
  constructor(data: CurrencyRateItemData) {
    this.code = data.code;
    this.name = data.name;
    this.symbol = data.symbol;
    this.rate = data.rate;
  }
  
  get formattedRate(): string {
    return this.rate.toFixed(4);
  }
}

export class CurrencyRates {
  public readonly baseCurrency: string;
  public readonly rates: CurrencyRateItem[];
  public readonly lastUpdated: Date;
  public readonly source: string;
  
  constructor(data: CurrencyRatesData) {
    this.baseCurrency = data.baseCurrency;
    this.rates = data.rates.map(r => new CurrencyRateItem(r));
    this.lastUpdated = new Date(data.lastUpdated);
    this.source = data.source;
  }
  
  getRate(currencyCode: string): number {
    const rate = this.rates.find(r => r.code === currencyCode);
    return rate?.rate ?? 1;
  }
  
  get formattedLastUpdated(): string {
    return this.lastUpdated.toLocaleString();
  }
}
