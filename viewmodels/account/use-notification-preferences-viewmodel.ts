/**
 * Notification Preferences ViewModel
 * Manages notification settings state and business logic
 */

import { useState, useEffect } from 'react';
import { useServices } from '@/providers/service-provider';
import { useI18n } from '@/providers/i18n-provider';
import { NotificationPreferences, UpdateNotificationPreferencesRequest } from '@/domain';
import { appLogger } from '@/lib/logger';

export interface INotificationPreferencesViewModel {
  // State
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  isSaving: boolean;
  hasChanges: boolean;

  // Actions
  toggleEmail: () => void;
  togglePush: () => void;
  toggleCompanyExpiry: () => void;
  toggleSubscriptionExpiry: () => void;
  toggleSystemAlerts: () => void;
  savePreferences: () => Promise<void>;
  resetChanges: () => void;
  loadPreferences: () => Promise<void>;
}

export function useNotificationPreferencesViewModel(): INotificationPreferencesViewModel {
  const { profileService } = useServices();
  const { t } = useI18n();

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [originalPreferences, setOriginalPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Check if there are unsaved changes
  const hasChanges = preferences !== null && originalPreferences !== null && (
    preferences.emailNotificationsEnabled !== originalPreferences.emailNotificationsEnabled ||
    preferences.pushNotificationsEnabled !== originalPreferences.pushNotificationsEnabled ||
    preferences.companyExpiryNotifications !== originalPreferences.companyExpiryNotifications ||
    preferences.subscriptionExpiryNotifications !== originalPreferences.subscriptionExpiryNotifications ||
    preferences.systemAlertsNotifications !== originalPreferences.systemAlertsNotifications
  );

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getNotificationPreferences();
      setPreferences(data);
      setOriginalPreferences(data);
    } catch (error) {
      appLogger.error('Failed to load notification preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEmail = () => {
    if (!preferences) return;
    setPreferences(preferences.update({
      emailNotificationsEnabled: !preferences.emailNotificationsEnabled
    }));
  };

  const togglePush = () => {
    if (!preferences) return;
    setPreferences(preferences.update({
      pushNotificationsEnabled: !preferences.pushNotificationsEnabled
    }));
  };

  const toggleCompanyExpiry = () => {
    if (!preferences) return;
    setPreferences(preferences.update({
      companyExpiryNotifications: !preferences.companyExpiryNotifications
    }));
  };

  const toggleSubscriptionExpiry = () => {
    if (!preferences) return;
    setPreferences(preferences.update({
      subscriptionExpiryNotifications: !preferences.subscriptionExpiryNotifications
    }));
  };

  const toggleSystemAlerts = () => {
    if (!preferences) return;
    setPreferences(preferences.update({
      systemAlertsNotifications: !preferences.systemAlertsNotifications
    }));
  };

  const savePreferences = async () => {
    if (!preferences || !hasChanges) return;

    try {
      setIsSaving(true);
      const request = preferences.toUpdateRequest();
      const updated = await profileService.updateNotificationPreferences(request);
      setPreferences(updated);
      setOriginalPreferences(updated);
    } catch (error) {
      appLogger.error('Failed to save notification preferences:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const resetChanges = () => {
    if (originalPreferences) {
      setPreferences(originalPreferences);
    }
  };

  return {
    preferences,
    isLoading,
    isSaving,
    hasChanges,
    toggleEmail,
    togglePush,
    toggleCompanyExpiry,
    toggleSubscriptionExpiry,
    toggleSystemAlerts,
    savePreferences,
    resetChanges,
    loadPreferences,
  };
}
