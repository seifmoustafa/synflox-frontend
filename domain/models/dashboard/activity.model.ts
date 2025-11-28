/**
 * Dashboard Activity Models
 * 
 * Models for the admin activity analytics dashboard.
 */

import { DistributionItem, DistributionItemData } from './shared.model';

// ============================================================================
// Data Interfaces
// ============================================================================

export interface ActivityStatsData {
  totalLogins: number;
  todayLogins: number;
  thisWeekLogins: number;
  thisMonthLogins: number;
  uniqueAdminsToday: number;
  totalActions: number;
  todayActions: number;
  thisWeekActions: number;
  thisMonthActions: number;
  activeSessions: number;
  averageSessionDuration: number;
  previousPeriodLogins: number;
  previousPeriodActions: number;
  loginChangePercentage: number;
  actionChangePercentage: number;
}

export interface TopAdminData {
  adminId: string;
  fullName: string;
  username: string;
  profilePictureUrl?: string;
  adminType: string;
  totalActions: number;
  todayActions: number;
  loginCount: number;
  lastLogin: string;
  lastAction: string;
  rank: number;
}

export interface TopAdminsData {
  admins: TopAdminData[];
  totalActiveAdmins: number;
  averageActionsPerAdmin: number;
}

export interface ActivityItemData {
  id: string;
  adminId: string;
  adminName: string;
  adminProfilePictureUrl?: string;
  action: string;
  actionType: string;
  entityType: string;
  entityId: string;
  entityName: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  icon: string;
  color: string;
}

export interface ActivityByEntityTypeData {
  entityType: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ActivityByActionTypeData {
  actionType: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ActivityBreakdownData {
  byEntityType: ActivityByEntityTypeData[];
  byActionType: ActivityByActionTypeData[];
  mostActiveEntityType: string;
  mostCommonAction: string;
}

export interface ActivityTimelinePointData {
  date: string;
  label: string;
  logins: number;
  actions: number;
  uniqueAdmins: number;
}

export interface HourlyActivityData {
  hour: number;
  label: string;
  count: number;
  averageCount: number;
}

export interface ActivityTimelineData {
  dailyData: ActivityTimelinePointData[];
  hourlyDistribution: HourlyActivityData[];
  peakHour: number;
  peakHourLabel: string;
  peakHourActivity: number;
  mostActiveDayOfWeek: string;
}

export interface ActivityDashboardData {
  stats: ActivityStatsData;
  topAdmins: TopAdminsData;
  recentActivity: ActivityItemData[];
  totalActivityCount: number;
  breakdown: ActivityBreakdownData;
  byEntityTypeChart: DistributionItemData[];
  byActionTypeChart: DistributionItemData[];
  timeline: ActivityTimelineData;
  generatedAt: string;
}

// ============================================================================
// Domain Classes
// ============================================================================

export class ActivityStats {
  public readonly totalLogins: number;
  public readonly todayLogins: number;
  public readonly thisWeekLogins: number;
  public readonly thisMonthLogins: number;
  public readonly uniqueAdminsToday: number;
  public readonly totalActions: number;
  public readonly todayActions: number;
  public readonly thisWeekActions: number;
  public readonly thisMonthActions: number;
  public readonly activeSessions: number;
  public readonly averageSessionDuration: number;
  public readonly previousPeriodLogins: number;
  public readonly previousPeriodActions: number;
  public readonly loginChangePercentage: number;
  public readonly actionChangePercentage: number;

  constructor(data: ActivityStatsData) {
    this.totalLogins = data.totalLogins;
    this.todayLogins = data.todayLogins;
    this.thisWeekLogins = data.thisWeekLogins;
    this.thisMonthLogins = data.thisMonthLogins;
    this.uniqueAdminsToday = data.uniqueAdminsToday;
    this.totalActions = data.totalActions;
    this.todayActions = data.todayActions;
    this.thisWeekActions = data.thisWeekActions;
    this.thisMonthActions = data.thisMonthActions;
    this.activeSessions = data.activeSessions;
    this.averageSessionDuration = data.averageSessionDuration;
    this.previousPeriodLogins = data.previousPeriodLogins;
    this.previousPeriodActions = data.previousPeriodActions;
    this.loginChangePercentage = data.loginChangePercentage;
    this.actionChangePercentage = data.actionChangePercentage;
  }

  get formattedSessionDuration(): string {
    if (this.averageSessionDuration < 60) {
      return `${this.averageSessionDuration}m`;
    }
    const hours = Math.floor(this.averageSessionDuration / 60);
    const minutes = this.averageSessionDuration % 60;
    return `${hours}h ${minutes}m`;
  }

  get isLoginTrendUp(): boolean {
    return this.loginChangePercentage > 0;
  }

  get isActionTrendUp(): boolean {
    return this.actionChangePercentage > 0;
  }

  get formattedLoginChange(): string {
    const prefix = this.loginChangePercentage >= 0 ? '+' : '';
    return `${prefix}${this.loginChangePercentage.toFixed(1)}%`;
  }

  get formattedActionChange(): string {
    const prefix = this.actionChangePercentage >= 0 ? '+' : '';
    return `${prefix}${this.actionChangePercentage.toFixed(1)}%`;
  }
}

export class TopAdmin {
  public readonly adminId: string;
  public readonly fullName: string;
  public readonly username: string;
  public readonly profilePictureUrl?: string;
  public readonly adminType: string;
  public readonly totalActions: number;
  public readonly todayActions: number;
  public readonly loginCount: number;
  public readonly lastLogin: Date;
  public readonly lastAction: Date;
  public readonly rank: number;

  constructor(data: TopAdminData) {
    this.adminId = data.adminId;
    this.fullName = data.fullName;
    this.username = data.username;
    this.profilePictureUrl = data.profilePictureUrl;
    this.adminType = data.adminType;
    this.totalActions = data.totalActions;
    this.todayActions = data.todayActions;
    this.loginCount = data.loginCount;
    this.lastLogin = new Date(data.lastLogin);
    this.lastAction = new Date(data.lastAction);
    this.rank = data.rank;
  }

  get initials(): string {
    return this.fullName
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  get displayName(): string {
    return this.fullName || this.username;
  }

  get lastLoginAgo(): string {
    const now = new Date();
    const diff = now.getTime() - this.lastLogin.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return this.lastLogin.toLocaleDateString();
  }

  get isActive(): boolean {
    const now = new Date();
    const diff = now.getTime() - this.lastLogin.getTime();
    const days = Math.floor(diff / 86400000);
    return days < 7;
  }
}

export class TopAdmins {
  public readonly admins: TopAdmin[];
  public readonly totalActiveAdmins: number;
  public readonly averageActionsPerAdmin: number;

  constructor(data: TopAdminsData) {
    this.admins = data.admins.map(a => new TopAdmin(a));
    this.totalActiveAdmins = data.totalActiveAdmins;
    this.averageActionsPerAdmin = data.averageActionsPerAdmin;
  }

  get formattedAverageActions(): string {
    return this.averageActionsPerAdmin.toFixed(1);
  }

  get topPerformer(): TopAdmin | undefined {
    return this.admins[0];
  }
}

export class ActivityItem {
  public readonly id: string;
  public readonly adminId: string;
  public readonly adminName: string;
  public readonly adminProfilePictureUrl?: string;
  public readonly action: string;
  public readonly actionType: string;
  public readonly entityType: string;
  public readonly entityId: string;
  public readonly entityName: string;
  public readonly description: string;
  public readonly ipAddress?: string;
  public readonly userAgent?: string;
  public readonly timestamp: Date;
  public readonly icon: string;
  public readonly color: string;

  constructor(data: ActivityItemData) {
    this.id = data.id;
    this.adminId = data.adminId;
    this.adminName = data.adminName;
    this.adminProfilePictureUrl = data.adminProfilePictureUrl;
    this.action = data.action;
    this.actionType = data.actionType;
    this.entityType = data.entityType;
    this.entityId = data.entityId;
    this.entityName = data.entityName;
    this.description = data.description;
    this.ipAddress = data.ipAddress;
    this.userAgent = data.userAgent;
    this.timestamp = new Date(data.timestamp);
    this.icon = data.icon;
    this.color = data.color;
  }

  get timeAgo(): string {
    const now = new Date();
    const diff = now.getTime() - this.timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return this.timestamp.toLocaleDateString();
  }

  get displayText(): string {
    return `${this.adminName} ${this.action} ${this.entityType} "${this.entityName}"`;
  }
}

export class ActivityByEntityType {
  public readonly entityType: string;
  public readonly count: number;
  public readonly percentage: number;
  public readonly color: string;

  constructor(data: ActivityByEntityTypeData) {
    this.entityType = data.entityType;
    this.count = data.count;
    this.percentage = data.percentage;
    this.color = data.color;
  }

  get formattedPercentage(): string {
    return `${this.percentage.toFixed(1)}%`;
  }
}

export class ActivityByActionType {
  public readonly actionType: string;
  public readonly count: number;
  public readonly percentage: number;
  public readonly color: string;

  constructor(data: ActivityByActionTypeData) {
    this.actionType = data.actionType;
    this.count = data.count;
    this.percentage = data.percentage;
    this.color = data.color;
  }

  get formattedPercentage(): string {
    return `${this.percentage.toFixed(1)}%`;
  }
}

export class ActivityBreakdown {
  public readonly byEntityType: ActivityByEntityType[];
  public readonly byActionType: ActivityByActionType[];
  public readonly mostActiveEntityType: string;
  public readonly mostCommonAction: string;

  constructor(data: ActivityBreakdownData) {
    this.byEntityType = data.byEntityType.map(e => new ActivityByEntityType(e));
    this.byActionType = data.byActionType.map(a => new ActivityByActionType(a));
    this.mostActiveEntityType = data.mostActiveEntityType;
    this.mostCommonAction = data.mostCommonAction;
  }
}

export class ActivityTimelinePoint {
  public readonly date: Date;
  public readonly label: string;
  public readonly logins: number;
  public readonly actions: number;
  public readonly uniqueAdmins: number;

  constructor(data: ActivityTimelinePointData) {
    this.date = new Date(data.date);
    this.label = data.label;
    this.logins = data.logins;
    this.actions = data.actions;
    this.uniqueAdmins = data.uniqueAdmins;
  }

  get totalActivity(): number {
    return this.logins + this.actions;
  }
}

export class HourlyActivity {
  public readonly hour: number;
  public readonly label: string;
  public readonly count: number;
  public readonly averageCount: number;

  constructor(data: HourlyActivityData) {
    this.hour = data.hour;
    this.label = data.label;
    this.count = data.count;
    this.averageCount = data.averageCount;
  }

  get isPeakHour(): boolean {
    return this.count >= this.averageCount * 1.5;
  }
}

export class ActivityTimeline {
  public readonly dailyData: ActivityTimelinePoint[];
  public readonly hourlyDistribution: HourlyActivity[];
  public readonly peakHour: number;
  public readonly peakHourLabel: string;
  public readonly peakHourActivity: number;
  public readonly mostActiveDayOfWeek: string;

  constructor(data: ActivityTimelineData) {
    this.dailyData = data.dailyData.map(d => new ActivityTimelinePoint(d));
    this.hourlyDistribution = data.hourlyDistribution.map(h => new HourlyActivity(h));
    this.peakHour = data.peakHour;
    this.peakHourLabel = data.peakHourLabel;
    this.peakHourActivity = data.peakHourActivity;
    this.mostActiveDayOfWeek = data.mostActiveDayOfWeek;
  }

  get totalDailyActivity(): number {
    return this.dailyData.reduce((sum, d) => sum + d.totalActivity, 0);
  }
}

export class ActivityDashboard {
  public readonly stats: ActivityStats;
  public readonly topAdmins: TopAdmins;
  public readonly recentActivity: ActivityItem[];
  public readonly totalActivityCount: number;
  public readonly breakdown: ActivityBreakdown;
  public readonly byEntityTypeChart: DistributionItem[];
  public readonly byActionTypeChart: DistributionItem[];
  public readonly timeline: ActivityTimeline;
  public readonly generatedAt: Date;

  constructor(data: ActivityDashboardData) {
    this.stats = new ActivityStats(data.stats);
    this.topAdmins = new TopAdmins(data.topAdmins);
    this.recentActivity = data.recentActivity.map(a => new ActivityItem(a));
    this.totalActivityCount = data.totalActivityCount;
    this.breakdown = new ActivityBreakdown(data.breakdown);
    this.byEntityTypeChart = data.byEntityTypeChart.map(d => new DistributionItem(d));
    this.byActionTypeChart = data.byActionTypeChart.map(d => new DistributionItem(d));
    this.timeline = new ActivityTimeline(data.timeline);
    this.generatedAt = new Date(data.generatedAt);
  }

  get hasRecentActivity(): boolean {
    return this.recentActivity.length > 0;
  }

  get formattedGeneratedAt(): string {
    return this.generatedAt.toLocaleString();
  }
}
