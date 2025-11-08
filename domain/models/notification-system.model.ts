/**
 * Notification System Domain Model
 * 
 * Represents in-system notifications for subscription events.
 * This is different from the UI Notification model used for toast notifications.
 */

export enum SystemNotificationType {
  ExpiryWarning = 1,
  Expired = 2,
  Suspended = 3,
  Activated = 4,
  Resumed = 5,
  Extended = 6,
  General = 7,
}

export interface SystemNotificationData {
  id: string; // Encrypted GUID
  companyId: string; // Encrypted GUID
  type: SystemNotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null; // ISO 8601 date
  createdAt: string; // ISO 8601 date
}

export class SystemNotification {
  public readonly id: string;
  public readonly companyId: string;
  public readonly type: SystemNotificationType;
  public readonly title: string;
  public readonly message: string;
  public readonly isRead: boolean;
  public readonly readAt: string | null;
  public readonly createdAt: string;

  constructor(data: SystemNotificationData) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.type = data.type;
    this.title = data.title;
    this.message = data.message;
    this.isRead = data.isRead;
    this.readAt = data.readAt;
    this.createdAt = data.createdAt;
  }

  /**
   * Get display name for the notification
   */
  get displayName(): string {
    return this.title;
  }

  /**
   * Get formatted created date
   */
  get formattedCreatedAt(): string {
    return new Date(this.createdAt).toLocaleString();
  }

  /**
   * Get formatted read date
   */
  get formattedReadAt(): string | null {
    return this.readAt ? new Date(this.readAt).toLocaleString() : null;
  }

  /**
   * Check if notification is unread
   */
  get isUnread(): boolean {
    return !this.isRead;
  }
}

export interface SystemNotificationsResponseData {
  data: SystemNotification[];
  pagination?: any;
}

export interface UnreadCountResponseData {
  count: number;
}

export class UnreadCountResponse {
  public readonly count: number;

  constructor(data: UnreadCountResponseData) {
    this.count = data.count || 0;
  }
}

