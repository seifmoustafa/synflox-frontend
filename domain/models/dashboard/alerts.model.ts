/**
 * Dashboard Alerts Models
 * 
 * Models for the system alerts dashboard.
 */

import {
  DistributionItem,
  DistributionItemData,
  AlertPriority,
  AlertCategory,
  getAlertPriorityColor,
} from './shared.model';

// ============================================================================
// Data Interfaces
// ============================================================================

export interface AlertCountsData {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
  unread: number;
  dismissed: number;
}

export interface AlertsByCategoryData {
  subscriptionExpiry: number;
  subscriptionStatus: number;
  companyStatus: number;
  adminActivity: number;
  systemHealth: number;
  revenue: number;
}

export interface AlertItemData {
  id: string;
  priority: string | number;  // Can be enum value (number) or string
  category: string | number;  // Can be enum value (number) or string
  title: string;
  message: string;
  description?: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  createdAt: string;
  dueDate?: string;
  daysRemaining?: number;
  timeAgo: string;
  primaryAction: string;
  primaryActionUrl: string;
  secondaryAction?: string;
  secondaryActionUrl?: string;
  icon: string;
  color: string;
  isRead: boolean;
  isDismissed: boolean;
  dismissedAt?: string;
  dismissedById?: string;
}

export interface AlertsDashboardData {
  counts: AlertCountsData;
  byCategory: AlertsByCategoryData;
  criticalAlerts: AlertItemData[];
  highPriorityAlerts: AlertItemData[];
  mediumPriorityAlerts: AlertItemData[];
  lowPriorityAlerts: AlertItemData[];
  byPriorityChart: DistributionItemData[];
  byCategoryChart: DistributionItemData[];
  recentlyDismissed: AlertItemData[];
  alertsCreatedToday: number;
  alertsResolvedToday: number;
  overdueAlerts: number;
  generatedAt: string;
}

// ============================================================================
// Domain Classes
// ============================================================================

export class AlertCounts {
  public readonly critical: number;
  public readonly high: number;
  public readonly medium: number;
  public readonly low: number;
  public readonly total: number;
  public readonly unread: number;
  public readonly dismissed: number;

  constructor(data: AlertCountsData) {
    this.critical = data.critical;
    this.high = data.high;
    this.medium = data.medium;
    this.low = data.low;
    this.total = data.total;
    this.unread = data.unread;
    this.dismissed = data.dismissed;
  }

  get urgentCount(): number {
    return this.critical + this.high;
  }

  get hasUrgent(): boolean {
    return this.urgentCount > 0;
  }

  get hasCritical(): boolean {
    return this.critical > 0;
  }

  get readCount(): number {
    return this.total - this.unread;
  }

  get readPercentage(): number {
    return this.total > 0 ? (this.readCount / this.total) * 100 : 0;
  }
}

export class AlertsByCategory {
  public readonly subscriptionExpiry: number;
  public readonly subscriptionStatus: number;
  public readonly companyStatus: number;
  public readonly adminActivity: number;
  public readonly systemHealth: number;
  public readonly revenue: number;

  constructor(data: AlertsByCategoryData) {
    this.subscriptionExpiry = data.subscriptionExpiry;
    this.subscriptionStatus = data.subscriptionStatus;
    this.companyStatus = data.companyStatus;
    this.adminActivity = data.adminActivity;
    this.systemHealth = data.systemHealth;
    this.revenue = data.revenue;
  }

  get total(): number {
    return this.subscriptionExpiry + this.subscriptionStatus + this.companyStatus + 
           this.adminActivity + this.systemHealth + this.revenue;
  }

  get topCategory(): string {
    const categories = [
      { name: 'Subscription Expiry', count: this.subscriptionExpiry },
      { name: 'Subscription Status', count: this.subscriptionStatus },
      { name: 'Company Status', count: this.companyStatus },
      { name: 'Admin Activity', count: this.adminActivity },
      { name: 'System Health', count: this.systemHealth },
      { name: 'Revenue', count: this.revenue },
    ];
    return categories.sort((a, b) => b.count - a.count)[0]?.name || 'None';
  }
}

export class AlertItem {
  public readonly id: string;
  public readonly priority: AlertPriority;
  public readonly category: AlertCategory;
  public readonly title: string;
  public readonly message: string;
  public readonly description?: string;
  public readonly entityType: string;
  public readonly entityId: string;
  public readonly entityName?: string;
  public readonly createdAt: Date;
  public readonly dueDate?: Date;
  public readonly daysRemaining?: number;
  public readonly timeAgo: string;
  public readonly primaryAction: string;
  public readonly primaryActionUrl: string;
  public readonly secondaryAction?: string;
  public readonly secondaryActionUrl?: string;
  public readonly icon: string;
  public readonly color: string;
  public readonly isRead: boolean;
  public readonly isDismissed: boolean;
  public readonly dismissedAt?: Date;
  public readonly dismissedById?: string;

  constructor(data: AlertItemData) {
    this.id = data.id;
    // Handle priority - can be number (enum) or string
    this.priority = AlertItem.parsePriority(data.priority);
    // Handle category - can be number (enum) or string
    this.category = AlertItem.parseCategory(data.category);
    this.title = data.title;
    this.message = data.message;
    this.description = data.description;
    this.entityType = data.entityType;
    this.entityId = data.entityId;
    this.entityName = data.entityName;
    this.createdAt = new Date(data.createdAt);
    this.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
    this.daysRemaining = data.daysRemaining;
    this.timeAgo = data.timeAgo;
    this.primaryAction = data.primaryAction;
    this.primaryActionUrl = data.primaryActionUrl;
    this.secondaryAction = data.secondaryAction;
    this.secondaryActionUrl = data.secondaryActionUrl;
    this.icon = data.icon;
    this.color = data.color;
    this.isRead = data.isRead;
    this.isDismissed = data.isDismissed;
    this.dismissedAt = data.dismissedAt ? new Date(data.dismissedAt) : undefined;
    this.dismissedById = data.dismissedById;
  }

  get isCritical(): boolean {
    return this.priority === 'critical';
  }

  get isUrgent(): boolean {
    return this.priority === 'critical' || this.priority === 'high';
  }

  get priorityColor(): string {
    return getAlertPriorityColor(this.priority);
  }

  get formattedDueDate(): string {
    return this.dueDate ? this.dueDate.toLocaleDateString() : 'N/A';
  }

  get isOverdue(): boolean {
    if (!this.dueDate) return false;
    return new Date() > this.dueDate;
  }

  get daysRemainingText(): string {
    if (this.daysRemaining === undefined || this.daysRemaining === null) return '';
    if (this.daysRemaining <= 0) return 'Today';
    if (this.daysRemaining === 1) return '1 day';
    return `${this.daysRemaining} days`;
  }

  get priorityBadge(): { text: string; variant: 'destructive' | 'warning' | 'default' | 'secondary' } {
    switch (this.priority) {
      case 'critical':
        return { text: 'Critical', variant: 'destructive' };
      case 'high':
        return { text: 'High', variant: 'warning' };
      case 'medium':
        return { text: 'Medium', variant: 'default' };
      case 'low':
        return { text: 'Low', variant: 'secondary' };
    }
  }

  // Static helpers to parse enum values (can be number or string)
  private static readonly PRIORITY_MAP: Record<number, AlertPriority> = {
    0: 'critical',
    1: 'high',
    2: 'medium',
    3: 'low',
  };

  private static readonly CATEGORY_MAP: Record<number, AlertCategory> = {
    0: 'subscription_expiry',
    1: 'subscription_status',
    2: 'company_status',
    3: 'admin_activity',
    4: 'system_health',
    5: 'revenue',
  };

  static parsePriority(value: string | number | undefined | null): AlertPriority {
    if (value === undefined || value === null) return 'low';
    
    // If it's a number, map from enum value
    if (typeof value === 'number') {
      return AlertItem.PRIORITY_MAP[value] || 'low';
    }
    
    // If it's a string, normalize it
    const normalized = String(value).toLowerCase().trim();
    if (['critical', 'high', 'medium', 'low'].includes(normalized)) {
      return normalized as AlertPriority;
    }
    
    return 'low';
  }

  static parseCategory(value: string | number | undefined | null): AlertCategory {
    if (value === undefined || value === null) return 'system_health';
    
    // If it's a number, map from enum value
    if (typeof value === 'number') {
      return AlertItem.CATEGORY_MAP[value] || 'system_health';
    }
    
    // If it's a string, normalize it
    const normalized = String(value).toLowerCase().trim().replace(/\s+/g, '_');
    const validCategories: AlertCategory[] = [
      'subscription_expiry', 'subscription_status', 'company_status',
      'admin_activity', 'system_health', 'revenue'
    ];
    
    // Try to match camelCase or PascalCase to snake_case
    const snakeCased = normalized.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    
    if (validCategories.includes(snakeCased as AlertCategory)) {
      return snakeCased as AlertCategory;
    }
    if (validCategories.includes(normalized as AlertCategory)) {
      return normalized as AlertCategory;
    }
    
    return 'system_health';
  }
}

export class AlertsDashboard {
  public readonly counts: AlertCounts;
  public readonly byCategory: AlertsByCategory;
  public readonly criticalAlerts: AlertItem[];
  public readonly highPriorityAlerts: AlertItem[];
  public readonly mediumPriorityAlerts: AlertItem[];
  public readonly lowPriorityAlerts: AlertItem[];
  public readonly byPriorityChart: DistributionItem[];
  public readonly byCategoryChart: DistributionItem[];
  public readonly recentlyDismissed: AlertItem[];
  public readonly alertsCreatedToday: number;
  public readonly alertsResolvedToday: number;
  public readonly overdueAlerts: number;
  public readonly generatedAt: Date;

  constructor(data: AlertsDashboardData) {
    this.counts = new AlertCounts(data.counts);
    this.byCategory = new AlertsByCategory(data.byCategory);
    this.criticalAlerts = data.criticalAlerts.map(a => new AlertItem(a));
    this.highPriorityAlerts = data.highPriorityAlerts.map(a => new AlertItem(a));
    this.mediumPriorityAlerts = data.mediumPriorityAlerts.map(a => new AlertItem(a));
    this.lowPriorityAlerts = data.lowPriorityAlerts.map(a => new AlertItem(a));
    this.byPriorityChart = data.byPriorityChart.map(d => new DistributionItem(d));
    this.byCategoryChart = data.byCategoryChart.map(d => new DistributionItem(d));
    this.recentlyDismissed = data.recentlyDismissed.map(a => new AlertItem(a));
    this.alertsCreatedToday = data.alertsCreatedToday;
    this.alertsResolvedToday = data.alertsResolvedToday;
    this.overdueAlerts = data.overdueAlerts;
    this.generatedAt = new Date(data.generatedAt);
  }

  get allAlerts(): AlertItem[] {
    return [
      ...this.criticalAlerts,
      ...this.highPriorityAlerts,
      ...this.mediumPriorityAlerts,
      ...this.lowPriorityAlerts,
    ];
  }

  get urgentAlerts(): AlertItem[] {
    return [...this.criticalAlerts, ...this.highPriorityAlerts];
  }

  get hasUrgent(): boolean {
    return this.counts.hasUrgent;
  }

  get hasCritical(): boolean {
    return this.counts.hasCritical;
  }

  get formattedGeneratedAt(): string {
    return this.generatedAt.toLocaleString();
  }

  get todayNetChange(): number {
    return this.alertsCreatedToday - this.alertsResolvedToday;
  }

  get alertsByPriority(): { priority: AlertPriority; alerts: AlertItem[] }[] {
    return [
      { priority: 'critical', alerts: this.criticalAlerts },
      { priority: 'high', alerts: this.highPriorityAlerts },
      { priority: 'medium', alerts: this.mediumPriorityAlerts },
      { priority: 'low', alerts: this.lowPriorityAlerts },
    ];
  }
}

// ============================================================================
// Request Models
// ============================================================================

export interface DismissAlertRequestData {
  alertId: string;
  reason?: string;
}

export class DismissAlertRequest {
  public readonly alertId: string;
  public readonly reason?: string;

  constructor(data: DismissAlertRequestData) {
    this.alertId = data.alertId;
    this.reason = data.reason;
  }

  get isValid(): boolean {
    return !!this.alertId;
  }
}

export interface MarkAlertReadRequestData {
  alertId: string;
}

export class MarkAlertReadRequest {
  public readonly alertId: string;

  constructor(data: MarkAlertReadRequestData) {
    this.alertId = data.alertId;
  }

  get isValid(): boolean {
    return !!this.alertId;
  }
}
