/**
 * In-App Notification Types
 * 
 * Types for backend in-app notifications system.
 * Different from toast notifications - these are persisted and come from the API.
 */

// ===== API Response Types =====

export interface InAppNotification {
      id: string;
      type: string;
      category: string;
      title: string;
      message: string;
      data?: string | null;
      priority: 'low' | 'normal' | 'high' | 'urgent';
      icon?: string | null;
      actionUrl?: string | null;
      isRead: boolean;
      readAtUtc?: string | null;
      createdAtUtc: string;
      timeAgo: string;
}

export interface InAppNotificationList {
      items: InAppNotification[];
      totalCount: number;
      unreadCount: number;
      page: number;
      pageSize: number;
      hasMore: boolean;
}

export interface InAppNotificationPreferences {
      inAppEnabled: boolean;
      emailEnabled: boolean;
      pushEnabled: boolean;
      smsEnabled: boolean;
      subscriptionNotifications: boolean;
      securityNotifications: boolean;
      systemNotifications: boolean;
      promotionalNotifications: boolean;
      deviceNotifications: boolean;
      quietHoursEnabled: boolean;
      quietHoursStart?: string | null;
      quietHoursEnd?: string | null;
      timezone?: string | null;
      emailDigestFrequency: string;
}

export interface RegisterPushSubscription {
      endpoint: string;
      platform: string;
      deviceName?: string;
      appVersion?: string;
      deviceFingerprint?: string;
      p256dhKey?: string;
      authKey?: string;
}

export interface RealTimeNotification {
      id: string;
      type: string;
      title: string;
      message: string;
      priority: string;
      icon?: string | null;
      actionUrl?: string | null;
      createdAtUtc: string;
      newUnreadCount: number;
}

// ===== Notification Category Icons =====

export const NOTIFICATION_ICONS: Record<string, string> = {
      subscription: 'credit-card',
      security: 'shield',
      device: 'monitor',
      system: 'cog',
      marketing: 'gift',
      general: 'bell',
};

export const NOTIFICATION_PRIORITY_COLORS: Record<string, string> = {
      low: 'text-muted-foreground',
      normal: 'text-foreground',
      high: 'text-orange-500',
      urgent: 'text-red-500',
};

// ===== Helper Functions =====

export function getNotificationIcon(type: string, icon?: string | null): string {
      if (icon) return icon;

      // Determine icon from type
      if (type.includes('subscription') || type.includes('expir')) return 'credit-card';
      if (type.includes('security') || type.includes('password') || type.includes('login')) return 'shield';
      if (type.includes('device') || type.includes('limit')) return 'monitor';
      if (type.includes('system') || type.includes('maintenance')) return 'cog';
      if (type.includes('promotional') || type.includes('offer')) return 'gift';

      return 'bell';
}

export function getPriorityBadgeClass(priority: string): string {
      switch (priority) {
            case 'urgent': return 'bg-red-500 animate-pulse';
            case 'high': return 'bg-orange-500';
            case 'normal': return 'bg-primary';
            case 'low': return 'bg-muted';
            default: return 'bg-primary';
      }
}
