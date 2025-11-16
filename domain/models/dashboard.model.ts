// Dashboard Domain Models

// ============================================
// DATA INTERFACES (from API)
// ============================================

export interface DashboardData {
  overview: OverviewStatsData;
  companies: CompanyStatsData;
  subscriptions: SubscriptionStatsData;
  admins: AdminStatsData;
  alerts: AlertsData;
  recentActivity: RecentActivityData;
  timeSeries: TimeSeriesData;
  revenue: RevenueData;
  lifecycle: LifecycleData;
  generatedAtUtc: string;
}

export interface OverviewStatsData {
  totalCompanies: number;
  activeCompanies: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalAdmins: number;
  activeAdmins: number;
}

export interface CompanyStatsData {
  total: number;
  activeLicense: number;  // Companies with active subscription
  suspendedLicense: number;  // Companies with suspended subscription
  expiredLicense: number;  // Companies with expired/no subscription
  createdToday: number;
  createdThisWeek: number;
  createdThisMonth: number;
}

export interface SubscriptionStatsData {
  total: number;
  active: number;
  trial: number;
  expired: number;
  suspended: number;
  expiringWithin7Days: number;
  expiringWithin30Days: number;
  createdToday: number;
  createdThisWeek: number;
  createdThisMonth: number;
  byPlan: Record<string, number>;
}

export interface AdminStatsData {
  total: number;
  active: number;
  inactive: number;
  createdToday: number;
  createdThisWeek: number;
  createdThisMonth: number;
  byType: Record<string, number>;
}

export interface AlertsData {
  subscriptionsExpiringToday: number;
  subscriptionsExpiringThisWeek: number;
  companiesWithSuspendedLicense: number;  // Companies that have suspended subscription
  companiesWithExpiredLicense: number;  // Companies with expired or no subscription
  inactiveAdmins: number;
  messages: string[];
}

export interface RecentActivityData {
  companiesLast24Hours: number;
  subscriptionsLast24Hours: number;
  adminsLast24Hours: number;
}

export interface TimeSeriesData {
  last30Days: DailyMetric[];
}

export interface DailyMetric {
  date: string;
  companiesCreated: number;
  subscriptionsCreated: number;
  adminsCreated: number;
  companiesActive: number;
  subscriptionsActive: number;
  adminsActive: number;
}

export interface RevenueData {
  mrr: number;
  arr: number;
  totalRevenue: number;
  arpc: number;
  revenueByPlan: Record<string, number>;
  revenueByCurrency: Record<string, number>;
  monthlyRevenue: MonthlyRevenueData[];
  monthOverMonthGrowth: number;
  payingCustomers: number;
  trialSubscriptions: number;
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  subscriptionCount: number;
  averageRevenuePerSubscription: number;
}

export interface LifecycleData {
  stages: LifecycleStageData;
  churn: ChurnData;
  healthDistribution: HealthDistributionData;
  transitions: LifecycleTransitionData[];
}

export interface LifecycleStageData {
  new: number;
  active: number;
  atRisk: number;
  churned: number;
  returning: number;
}

export interface ChurnData {
  churnRate: number;
  churnedThisMonth: number;
  highRiskCount: number;
  retentionRate: number;
  averageLifetimeDays: number;
  riskDistribution: RiskDistributionData;
}

export interface RiskDistributionData {
  low: number;
  medium: number;
  high: number;
}

export interface HealthDistributionData {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
}

export interface LifecycleTransitionData {
  fromStage: string;
  toStage: string;
  count: number;
}

// ============================================
// DOMAIN MODELS (with business logic)
// ============================================

export class OverviewStats {
  constructor(
    public readonly totalCompanies: number,
    public readonly activeCompanies: number,
    public readonly totalSubscriptions: number,
    public readonly activeSubscriptions: number,
    public readonly totalAdmins: number,
    public readonly activeAdmins: number
  ) {}

  get companyActivityRate(): number {
    return this.totalCompanies > 0 ? (this.activeCompanies / this.totalCompanies) * 100 : 0;
  }

  get subscriptionActivityRate(): number {
    return this.totalSubscriptions > 0 ? (this.activeSubscriptions / this.totalSubscriptions) * 100 : 0;
  }

  get adminActivityRate(): number {
    return this.totalAdmins > 0 ? (this.activeAdmins / this.totalAdmins) * 100 : 0;
  }

  get inactiveCompanies(): number {
    return this.totalCompanies - this.activeCompanies;
  }

  get inactiveSubscriptions(): number {
    return this.totalSubscriptions - this.activeSubscriptions;
  }

  get inactiveAdmins(): number {
    return this.totalAdmins - this.activeAdmins;
  }
}

export class CompanyStats {
  constructor(
    public readonly total: number,
    public readonly activeLicense: number,
    public readonly suspendedLicense: number,
    public readonly expiredLicense: number,
    public readonly createdToday: number,
    public readonly createdThisWeek: number,
    public readonly createdThisMonth: number
  ) {}

  get activePercentage(): number {
    return this.total > 0 ? (this.activeLicense / this.total) * 100 : 0;
  }

  get suspendedPercentage(): number {
    return this.total > 0 ? (this.suspendedLicense / this.total) * 100 : 0;
  }

  get expiredPercentage(): number {
    return this.total > 0 ? (this.expiredLicense / this.total) * 100 : 0;
  }

  get growthTrend(): 'up' | 'down' | 'stable' {
    if (this.createdThisWeek > this.createdToday * 5) return 'up';
    if (this.createdThisWeek < this.createdToday * 3) return 'down';
    return 'stable';
  }

  get hasIssues(): boolean {
    return this.suspendedLicense > 0 || this.expiredLicense > 0;
  }
}

export class SubscriptionStats {
  constructor(
    public readonly total: number,
    public readonly active: number,
    public readonly trial: number,
    public readonly expired: number,
    public readonly suspended: number,
    public readonly expiringWithin7Days: number,
    public readonly expiringWithin30Days: number,
    public readonly createdToday: number,
    public readonly createdThisWeek: number,
    public readonly createdThisMonth: number,
    public readonly byPlan: Record<string, number>
  ) {}

  get activePercentage(): number {
    return this.total > 0 ? (this.active / this.total) * 100 : 0;
  }

  get trialPercentage(): number {
    return this.total > 0 ? (this.trial / this.total) * 100 : 0;
  }

  get expiredPercentage(): number {
    return this.total > 0 ? (this.expired / this.total) * 100 : 0;
  }

  get suspendedPercentage(): number {
    return this.total > 0 ? (this.suspended / this.total) * 100 : 0;
  }

  get needsAttention(): boolean {
    return this.expiringWithin7Days > 0 || this.suspended > 0 || this.expired > 0;
  }

  get criticalExpirations(): boolean {
    return this.expiringWithin7Days > 5;
  }

  get topPlan(): { name: string; count: number } | null {
    const plans = Object.entries(this.byPlan);
    if (plans.length === 0) return null;
    
    const sorted = plans.sort((a, b) => b[1] - a[1]);
    return { name: sorted[0][0], count: sorted[0][1] };
  }

  get planCount(): number {
    return Object.keys(this.byPlan).length;
  }
}

export class AdminStats {
  constructor(
    public readonly total: number,
    public readonly active: number,
    public readonly inactive: number,
    public readonly createdToday: number,
    public readonly createdThisWeek: number,
    public readonly createdThisMonth: number,
    public readonly byType: Record<string, number>
  ) {}

  get activePercentage(): number {
    return this.total > 0 ? (this.active / this.total) * 100 : 0;
  }

  get inactivePercentage(): number {
    return this.total > 0 ? (this.inactive / this.total) * 100 : 0;
  }

  get typeCount(): number {
    return Object.keys(this.byType).length;
  }

  get needsReview(): boolean {
    return this.inactive > this.total * 0.3; // More than 30% inactive
  }
}

export class Alerts {
  constructor(
    public readonly subscriptionsExpiringToday: number,
    public readonly subscriptionsExpiringThisWeek: number,
    public readonly companiesWithSuspendedLicense: number,
    public readonly companiesWithExpiredLicense: number,
    public readonly inactiveAdmins: number,
    public readonly messages: string[]
  ) {}

  get totalAlerts(): number {
    return (
      this.subscriptionsExpiringToday +
      this.subscriptionsExpiringThisWeek +
      this.companiesWithSuspendedLicense +
      this.companiesWithExpiredLicense +
      this.inactiveAdmins
    );
  }

  get hasCriticalAlerts(): boolean {
    // Critical: subscriptions expiring today OR 4+ total, OR 6+ expired companies
    return this.subscriptionsExpiringToday >= 4 || this.companiesWithExpiredLicense >= 6;
  }

  get hasWarnings(): boolean {
    // Warning for 1-3 subscriptions expiring today, or this week, 
    return (
      (this.subscriptionsExpiringToday > 0 && this.subscriptionsExpiringToday < 4) ||
      this.subscriptionsExpiringThisWeek > 0 ||
      this.companiesWithSuspendedLicense > 0 ||
      (this.companiesWithExpiredLicense > 0 && this.companiesWithExpiredLicense < 6) ||
      this.inactiveAdmins > 0
    );
  }

  get alertLevel(): 'critical' | 'warning' | 'info' | 'none' {
    if (this.hasCriticalAlerts) return 'critical';
    if (this.hasWarnings) return 'warning';
    if (this.totalAlerts > 0) return 'info';
    return 'none';
  }
}

export class RecentActivity {
  constructor(
    public readonly companiesLast24Hours: number,
    public readonly subscriptionsLast24Hours: number,
    public readonly adminsLast24Hours: number
  ) {}

  get totalActivity(): number {
    return this.companiesLast24Hours + this.subscriptionsLast24Hours + this.adminsLast24Hours;
  }

  get isActive(): boolean {
    return this.totalActivity > 0;
  }

  get mostActiveArea(): 'companies' | 'subscriptions' | 'admins' | 'none' {
    if (this.totalActivity === 0) return 'none';
    
    const max = Math.max(
      this.companiesLast24Hours,
      this.subscriptionsLast24Hours,
      this.adminsLast24Hours
    );
    
    if (max === this.companiesLast24Hours) return 'companies';
    if (max === this.subscriptionsLast24Hours) return 'subscriptions';
    return 'admins';
  }
}

export class TimeSeries {
  constructor(public readonly last30Days: DailyMetric[]) {}

  get dates(): string[] {
    return this.last30Days.map(d => new Date(d.date).toLocaleDateString());
  }

  get companiesCreatedData(): number[] {
    return this.last30Days.map(d => d.companiesCreated);
  }

  get subscriptionsCreatedData(): number[] {
    return this.last30Days.map(d => d.subscriptionsCreated);
  }

  get adminsCreatedData(): number[] {
    return this.last30Days.map(d => d.adminsCreated);
  }

  get companiesActiveData(): number[] {
    return this.last30Days.map(d => d.companiesActive);
  }

  get subscriptionsActiveData(): number[] {
    return this.last30Days.map(d => d.subscriptionsActive);
  }

  get adminsActiveData(): number[] {
    return this.last30Days.map(d => d.adminsActive);
  }

  get totalGrowth(): number {
    return this.last30Days.reduce((sum, d) => sum + d.companiesCreated + d.subscriptionsCreated + d.adminsCreated, 0);
  }

  get averageDailyGrowth(): number {
    return this.totalGrowth / Math.max(this.last30Days.length, 1);
  }
}

export class Revenue {
  constructor(
    public readonly mrr: number,
    public readonly arr: number,
    public readonly totalRevenue: number,
    public readonly arpc: number,
    public readonly revenueByPlan: Record<string, number>,
    public readonly revenueByCurrency: Record<string, number>,
    public readonly monthlyRevenue: MonthlyRevenueData[],
    public readonly monthOverMonthGrowth: number,
    public readonly payingCustomers: number,
    public readonly trialSubscriptions: number
  ) {}

  get months(): string[] {
    return this.monthlyRevenue.map(m => m.month);
  }

  get monthlyRevenueData(): number[] {
    return this.monthlyRevenue.map(m => m.revenue);
  }

  get monthlySubscriptionCounts(): number[] {
    return this.monthlyRevenue.map(m => m.subscriptionCount);
  }

  get averageRevenuePerSubscription(): number[] {
    return this.monthlyRevenue.map(m => m.averageRevenuePerSubscription);
  }

  get topPlan(): string {
    const plans = Object.entries(this.revenueByPlan);
    if (plans.length === 0) return 'N/A';
    return plans.reduce((max, current) => current[1] > max[1] ? current : max)[0];
  }

  get topPlanRevenue(): number {
    const topPlan = this.topPlan;
    return this.revenueByPlan[topPlan] || 0;
  }

  get planNames(): string[] {
    return Object.keys(this.revenueByPlan);
  }

  get planRevenues(): number[] {
    return Object.values(this.revenueByPlan);
  }

  get currencyCodes(): string[] {
    return Object.keys(this.revenueByCurrency);
  }

  get currencyRevenues(): number[] {
    return Object.values(this.revenueByCurrency);
  }

  get isGrowing(): boolean {
    return this.monthOverMonthGrowth > 0;
  }

  get growthDirection(): 'up' | 'down' | 'flat' {
    if (this.monthOverMonthGrowth > 0) return 'up';
    if (this.monthOverMonthGrowth < 0) return 'down';
    return 'flat';
  }

  get conversionRate(): number {
    const total = this.payingCustomers + this.trialSubscriptions;
    return total > 0 ? (this.payingCustomers / total) * 100 : 0;
  }
}

export class Lifecycle {
  constructor(
    public readonly stages: LifecycleStageData,
    public readonly churn: ChurnData,
    public readonly healthDistribution: HealthDistributionData,
    public readonly transitions: LifecycleTransitionData[]
  ) {}

  // Lifecycle stage metrics
  get totalCompanies(): number {
    return this.stages.new + this.stages.active + this.stages.atRisk + this.stages.churned;
  }

  get healthyCompanies(): number {
    return this.stages.active + this.stages.new;
  }

  get unhealthyCompanies(): number {
    return this.stages.atRisk + this.stages.churned;
  }

  get healthRate(): number {
    const total = this.totalCompanies;
    return total > 0 ? (this.healthyCompanies / total) * 100 : 0;
  }

  // Chart data for lifecycle stages
  get stageLabels(): string[] {
    return ['New', 'Active', 'At-Risk', 'Churned', 'Returning'];
  }

  get stageData(): number[] {
    return [
      this.stages.new,
      this.stages.active,
      this.stages.atRisk,
      this.stages.churned,
      this.stages.returning
    ];
  }

  get stageColors(): string[] {
    return ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  }

  // Chart data for health distribution
  get healthLabels(): string[] {
    return ['Excellent', 'Good', 'Fair', 'Poor'];
  }

  get healthData(): number[] {
    return [
      this.healthDistribution.excellent,
      this.healthDistribution.good,
      this.healthDistribution.fair,
      this.healthDistribution.poor
    ];
  }

  get healthColors(): string[] {
    return ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
  }

  // Chart data for risk distribution
  get riskLabels(): string[] {
    return ['Low Risk', 'Medium Risk', 'High Risk'];
  }

  get riskData(): number[] {
    return [
      this.churn.riskDistribution.low,
      this.churn.riskDistribution.medium,
      this.churn.riskDistribution.high
    ];
  }

  get riskColors(): string[] {
    return ['#10b981', '#f59e0b', '#ef4444'];
  }

  // Churn metrics
  get isChurning(): boolean {
    return this.churn.churnRate > 5; // > 5% is concerning
  }

  get churnStatus(): 'healthy' | 'warning' | 'critical' {
    if (this.churn.churnRate < 3) return 'healthy';
    if (this.churn.churnRate < 7) return 'warning';
    return 'critical';
  }

  get retentionStatus(): 'excellent' | 'good' | 'poor' {
    if (this.churn.retentionRate >= 95) return 'excellent';
    if (this.churn.retentionRate >= 85) return 'good';
    return 'poor';
  }

  get averageLifetimeMonths(): number {
    return this.churn.averageLifetimeDays / 30;
  }

  get averageLifetimeYears(): number {
    return this.churn.averageLifetimeDays / 365;
  }

  // Transition insights
  get transitionFlowData(): { from: string; to: string; value: number }[] {
    return this.transitions.map(t => ({
      from: t.fromStage,
      to: t.toStage,
      value: t.count
    }));
  }

  get mostCommonTransition(): LifecycleTransitionData | null {
    if (this.transitions.length === 0) return null;
    return this.transitions.reduce((max, t) => t.count > max.count ? t : max);
  }

  // Risk insights
  get criticalRiskPercentage(): number {
    const total = this.churn.riskDistribution.low + 
                  this.churn.riskDistribution.medium + 
                  this.churn.riskDistribution.high;
    return total > 0 ? (this.churn.riskDistribution.high / total) * 100 : 0;
  }

  get needsAttention(): boolean {
    return this.churn.highRiskCount > 0 || this.churn.churnRate > 5;
  }
}

export class Dashboard {
  constructor(
    public readonly overview: OverviewStats,
    public readonly companies: CompanyStats,
    public readonly subscriptions: SubscriptionStats,
    public readonly admins: AdminStats,
    public readonly alerts: Alerts,
    public readonly recentActivity: RecentActivity,
    public readonly timeSeries: TimeSeries,
    public readonly revenue: Revenue,
    public readonly lifecycle: Lifecycle,
    public readonly generatedAt: Date
  ) {}

  get systemHealth(): 'healthy' | 'warning' | 'critical' {
    if (this.alerts.hasCriticalAlerts) return 'critical';
    if (this.alerts.hasWarnings) return 'warning';
    return 'healthy';
  }

  get overallActivityScore(): number {
    const scores = [
      this.overview.companyActivityRate,
      this.overview.subscriptionActivityRate,
      this.overview.adminActivityRate
    ];
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  get needsImmediateAttention(): boolean {
    return this.alerts.hasCriticalAlerts || this.subscriptions.criticalExpirations;
  }

  get isStale(): boolean {
    const now = new Date();
    const diffMs = now.getTime() - this.generatedAt.getTime();
    const diffMinutes = diffMs / 1000 / 60;
    return diffMinutes > 5; // Stale if older than 5 minutes
  }
}
