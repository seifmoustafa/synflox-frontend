/**
 * Subscription History Domain Model
 * 
 * Represents subscription history/audit log entries for tracking
 * all changes made to company subscriptions.
 */

export enum SubscriptionHistoryActionType {
  Created = 1,
  Activated = 2,
  Suspended = 3,
  Resumed = 4,
  Extended = 5,
  Expired = 6,
  Deleted = 7,
  Updated = 8,
}

export interface SubscriptionHistoryData {
  id: string; // Encrypted GUID
  companyId: string; // Encrypted GUID
  actionType: SubscriptionHistoryActionType;
  actionTypeName: string; // "Activated", "Suspended", etc.
  oldValue: string | null; // JSON string of old state
  newValue: string | null; // JSON string of new state
  performedBy: string | null; // Encrypted Admin ID
  timestamp: string; // ISO 8601 date
  notes: string | null;
}

export class SubscriptionHistory {
  public readonly id: string;
  public readonly companyId: string;
  public readonly actionType: SubscriptionHistoryActionType;
  public readonly actionTypeName: string;
  public readonly oldValue: string | null;
  public readonly newValue: string | null;
  public readonly performedBy: string | null;
  public readonly timestamp: string;
  public readonly notes: string | null;

  constructor(data: SubscriptionHistoryData) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.actionType = data.actionType;
    this.actionTypeName = data.actionTypeName;
    this.oldValue = data.oldValue;
    this.newValue = data.newValue;
    this.performedBy = data.performedBy;
    this.timestamp = data.timestamp;
    this.notes = data.notes;
  }

  /**
   * Get display name for the history entry
   */
  get displayName(): string {
    return `${this.actionTypeName} - ${new Date(this.timestamp).toLocaleString()}`;
  }

  /**
   * Parse old value JSON
   */
  get parsedOldValue(): any {
    if (!this.oldValue) return null;
    try {
      return JSON.parse(this.oldValue);
    } catch {
      return null;
    }
  }

  /**
   * Parse new value JSON
   */
  get parsedNewValue(): any {
    if (!this.newValue) return null;
    try {
      return JSON.parse(this.newValue);
    } catch {
      return null;
    }
  }

  /**
   * Get formatted timestamp
   */
  get formattedTimestamp(): string {
    return new Date(this.timestamp).toLocaleString();
  }
}

export interface SubscriptionHistoryResponseData {
  data: SubscriptionHistory[];
  pagination: any;
}

