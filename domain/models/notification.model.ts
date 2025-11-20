/**
 * Notification Domain Models
 * 
 * Contains all notification-related domain models including
 * notifications, notification types, and related structures.
 */

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

export enum NotificationPosition {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  TOP_CENTER = 'top-center',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
  BOTTOM_CENTER = 'bottom-center',
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  position?: NotificationPosition;
  duration?: number;
  isVisible: boolean;
  timestamp: string;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export interface NotificationConfigData {
  position: NotificationPosition;
  duration: number;
  maxNotifications: number;
  enableSound: boolean;
  enableVibration: boolean;
}

export class Notification {
  public readonly id: string;
  public readonly title: string;
  public readonly message: string;
  public readonly type: NotificationType;
  public readonly position: NotificationPosition;
  public readonly duration: number;
  public readonly isVisible: boolean;
  public readonly timestamp: string;
  public readonly actions: NotificationAction[];

  constructor(data: NotificationData) {
    this.id = data.id;
    this.title = data.title;
    this.message = data.message;
    this.type = data.type;
    this.position = data.position || NotificationPosition.TOP_RIGHT;
    this.duration = data.duration || 5000;
    this.isVisible = data.isVisible;
    this.timestamp = data.timestamp;
    this.actions = data.actions || [];
  }

  /**
   * Check if notification is expired
   */
  get isExpired(): boolean {
    const now = new Date().getTime();
    const notificationTime = new Date(this.timestamp).getTime();
    return (now - notificationTime) > this.duration;
  }

  /**
   * Get display title
   */
  get displayTitle(): string {
    return this.title || this.getDefaultTitle();
  }

  /**
   * Get default title based on type
   */
  private getDefaultTitle(): string {
    switch (this.type) {
      case NotificationType.SUCCESS:
        return 'Success';
      case NotificationType.ERROR:
        return 'Error';
      case NotificationType.INFO:
        return 'Information';
      case NotificationType.WARNING:
        return 'Warning';
      default:
        return 'Notification';
    }
  }

  /**
   * Check if notification has actions
   */
  get hasActions(): boolean {
    return this.actions.length > 0;
  }

  /**
   * Get CSS classes for styling
   */
  get cssClasses(): string {
    return `notification notification-${this.type} notification-${this.position}`;
  }

  /**
   * Create a copy with updated visibility
   */
  withVisibility(isVisible: boolean): Notification {
    return new Notification({
      ...this,
      isVisible,
    });
  }

  /**
   * Create a copy with updated duration
   */
  withDuration(duration: number): Notification {
    return new Notification({
      ...this,
      duration,
    });
  }
}

export class NotificationConfig {
  public readonly position: NotificationPosition;
  public readonly duration: number;
  public readonly maxNotifications: number;
  public readonly enableSound: boolean;
  public readonly enableVibration: boolean;

  constructor(data: NotificationConfigData) {
    this.position = data.position;
    this.duration = data.duration;
    this.maxNotifications = data.maxNotifications;
    this.enableSound = data.enableSound;
    this.enableVibration = data.enableVibration;
  }

  /**
   * Get default configuration
   */
  static getDefault(): NotificationConfig {
    return new NotificationConfig({
      position: NotificationPosition.TOP_RIGHT,
      duration: 5000,
      maxNotifications: 5,
      enableSound: false,
      enableVibration: false,
    });
  }

  /**
   * Create a copy with updated position
   */
  withPosition(position: NotificationPosition): NotificationConfig {
    return new NotificationConfig({
      ...this,
      position,
    });
  }

  /**
   * Create a copy with updated duration
   */
  withDuration(duration: number): NotificationConfig {
    return new NotificationConfig({
      ...this,
      duration,
    });
  }
}

export class NotificationQueue {
  private notifications: Notification[] = [];
  private config: NotificationConfig;

  constructor(config: NotificationConfig = NotificationConfig.getDefault()) {
    this.config = config;
  }

  /**
   * Add notification to queue
   */
  add(notification: Notification): void {
    // Remove expired notifications
    this.removeExpired();
    
    // Add new notification
    this.notifications.push(notification);
    
    // Limit queue size
    if (this.notifications.length > this.config.maxNotifications) {
      this.notifications = this.notifications.slice(-this.config.maxNotifications);
    }
  }

  /**
   * Remove notification by ID
   */
  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  /**
   * Remove all notifications
   */
  clear(): void {
    this.notifications = [];
  }

  /**
   * Remove expired notifications
   */
  removeExpired(): void {
    this.notifications = this.notifications.filter(n => !n.isExpired);
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    this.removeExpired();
    return [...this.notifications];
  }

  /**
   * Get visible notifications
   */
  getVisible(): Notification[] {
    return this.getAll().filter(n => n.isVisible);
  }

  /**
   * Get notifications by type
   */
  getByType(type: NotificationType): Notification[] {
    return this.getAll().filter(n => n.type === type);
  }

  /**
   * Update configuration
   */
  updateConfig(config: NotificationConfig): void {
    this.config = config;
  }

  /**
   * Get current configuration
   */
  getConfig(): NotificationConfig {
    return this.config;
  }
}

// ===== User Notification Preferences =====

/**
 * User notification preferences data from API
 */
export interface NotificationPreferencesData {
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  companyExpiryNotifications: boolean;
  subscriptionExpiryNotifications: boolean;
  systemAlertsNotifications: boolean;
}

/**
 * Request to update notification preferences
 */
export interface UpdateNotificationPreferencesData {
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  companyExpiryNotifications: boolean;
  subscriptionExpiryNotifications: boolean;
  systemAlertsNotifications: boolean;
}

/**
 * User Notification Preferences Domain Model
 * Manages user's notification settings for different channels and types
 */
export class NotificationPreferences {
  public readonly emailNotificationsEnabled: boolean;
  public readonly pushNotificationsEnabled: boolean;
  public readonly companyExpiryNotifications: boolean;
  public readonly subscriptionExpiryNotifications: boolean;
  public readonly systemAlertsNotifications: boolean;

  constructor(data: NotificationPreferencesData) {
    this.emailNotificationsEnabled = data.emailNotificationsEnabled;
    this.pushNotificationsEnabled = data.pushNotificationsEnabled;
    this.companyExpiryNotifications = data.companyExpiryNotifications;
    this.subscriptionExpiryNotifications = data.subscriptionExpiryNotifications;
    this.systemAlertsNotifications = data.systemAlertsNotifications;
  }

  /**
   * Check if any notifications are enabled
   */
  get hasAnyEnabled(): boolean {
    return this.emailNotificationsEnabled ||
           this.pushNotificationsEnabled ||
           this.companyExpiryNotifications ||
           this.subscriptionExpiryNotifications ||
           this.systemAlertsNotifications;
  }

  /**
   * Count total enabled notifications
   */
  get enabledCount(): number {
    let count = 0;
    if (this.emailNotificationsEnabled) count++;
    if (this.pushNotificationsEnabled) count++;
    if (this.companyExpiryNotifications) count++;
    if (this.subscriptionExpiryNotifications) count++;
    if (this.systemAlertsNotifications) count++;
    return count;
  }

  /**
   * Create update request from current state
   */
  toUpdateRequest(): UpdateNotificationPreferencesRequest {
    return new UpdateNotificationPreferencesRequest({
      emailNotificationsEnabled: this.emailNotificationsEnabled,
      pushNotificationsEnabled: this.pushNotificationsEnabled,
      companyExpiryNotifications: this.companyExpiryNotifications,
      subscriptionExpiryNotifications: this.subscriptionExpiryNotifications,
      systemAlertsNotifications: this.systemAlertsNotifications,
    });
  }

  /**
   * Create a copy with updated values (immutability)
   */
  update(updates: Partial<NotificationPreferencesData>): NotificationPreferences {
    return new NotificationPreferences({
      emailNotificationsEnabled: updates.emailNotificationsEnabled ?? this.emailNotificationsEnabled,
      pushNotificationsEnabled: updates.pushNotificationsEnabled ?? this.pushNotificationsEnabled,
      companyExpiryNotifications: updates.companyExpiryNotifications ?? this.companyExpiryNotifications,
      subscriptionExpiryNotifications: updates.subscriptionExpiryNotifications ?? this.subscriptionExpiryNotifications,
      systemAlertsNotifications: updates.systemAlertsNotifications ?? this.systemAlertsNotifications,
    });
  }
}

/**
 * Request to update notification preferences
 */
export class UpdateNotificationPreferencesRequest {
  public readonly emailNotificationsEnabled: boolean;
  public readonly pushNotificationsEnabled: boolean;
  public readonly companyExpiryNotifications: boolean;
  public readonly subscriptionExpiryNotifications: boolean;
  public readonly systemAlertsNotifications: boolean;

  constructor(data: UpdateNotificationPreferencesData) {
    this.emailNotificationsEnabled = data.emailNotificationsEnabled;
    this.pushNotificationsEnabled = data.pushNotificationsEnabled;
    this.companyExpiryNotifications = data.companyExpiryNotifications;
    this.subscriptionExpiryNotifications = data.subscriptionExpiryNotifications;
    this.systemAlertsNotifications = data.systemAlertsNotifications;
  }

  /**
   * Check if request is valid
   */
  get isValid(): boolean {
    // All fields are boolean, so always valid
    return true;
  }
}
