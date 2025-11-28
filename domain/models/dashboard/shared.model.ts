/**
 * Dashboard Shared Models
 * 
 * Common types used across all dashboard components.
 */

// ============================================================================
// Data Interfaces (for JSON mapping)
// ============================================================================

export interface DateRangeData {
  startDate: string;
  endDate: string;
}

export interface ChartDataPointData {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPointData {
  date: string;
  label: string;
  value: number;
}

export interface DistributionItemData {
  label?: string;
  name?: string; // Backend may return 'name' instead of 'label'
  count: number;
  percentage: number;
  color: string;
}

// ============================================================================
// Domain Classes
// ============================================================================

export class DateRange {
  public readonly startDate: Date;
  public readonly endDate: Date;

  constructor(data: DateRangeData) {
    this.startDate = new Date(data.startDate);
    this.endDate = new Date(data.endDate);
  }

  get displayRange(): string {
    return `${this.startDate.toLocaleDateString()} - ${this.endDate.toLocaleDateString()}`;
  }

  get daysInRange(): number {
    const diff = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}

export class ChartDataPoint {
  public readonly label: string;
  public readonly value: number;
  public readonly color: string;

  constructor(data: ChartDataPointData) {
    this.label = data.label;
    this.value = data.value;
    this.color = data.color || '#3b82f6';
  }
}

export class TimeSeriesDataPoint {
  public readonly date: Date;
  public readonly label: string;
  public readonly value: number;

  constructor(data: TimeSeriesDataPointData) {
    this.date = new Date(data.date);
    this.label = data.label;
    this.value = data.value;
  }
}

export class DistributionItem {
  public readonly label: string;
  public readonly count: number;
  public readonly percentage: number;
  public readonly color: string;

  constructor(data: DistributionItemData) {
    // Support both 'label' and 'name' from API
    this.label = data.label || data.name || '';
    this.count = data.count;
    this.percentage = data.percentage;
    this.color = data.color;
  }

  get formattedPercentage(): string {
    return `${this.percentage.toFixed(1)}%`;
  }
}

// ============================================================================
// Utility Types
// ============================================================================

export type ChangeDirection = 'up' | 'down' | 'unchanged';

export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';

export type AlertCategory = 
  | 'subscription_expiry'
  | 'subscription_status'
  | 'company_status'
  | 'admin_activity'
  | 'system_health'
  | 'revenue';

export type CompanyStatus = 'active' | 'inactive' | 'suspended' | 'at_risk';

export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'suspended' | 'cancelled' | 'paused';

// ============================================================================
// Helper Functions
// ============================================================================

export function getChangeDirectionIcon(direction: ChangeDirection): string {
  switch (direction) {
    case 'up': return '↑';
    case 'down': return '↓';
    default: return '→';
  }
}

export function getChangeDirectionColor(direction: ChangeDirection): string {
  switch (direction) {
    case 'up': return '#22c55e';
    case 'down': return '#ef4444';
    default: return '#6b7280';
  }
}

export function getAlertPriorityColor(priority: AlertPriority): string {
  switch (priority) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#3b82f6';
  }
}

export function formatCurrency(value: number, currency: string = 'EGP'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}
