/**
 * Subscription Mapper
 * Handles conversion between API JSON and Subscription domain models
 */

import { appLogger } from "@/lib/logger";
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionData,
  SubscriptionStatusData,
} from "../models/subscription.model";

// ============================================================================
// RESPONSE INTERFACES
// ============================================================================

/**
 * Get all subscriptions response from API
 */
export interface SubscriptionsResponse {
  data: Subscription[];
  pagination?: any;
}

/**
 * Get subscriptions by company response from API
 */
export interface CompanySubscriptionsResponse {
  data: Subscription[];
}

/**
 * Upgrade response from API
 */
export interface UpgradeResponse {
  newSubscription: Subscription | null;
  oldSubscription: Subscription | null;
  summary: {
    proratedCredit?: number;
    additionalCharge?: number;
    effectiveDate?: string;
    message: string;
  };
}

// ============================================================================
// MAPPER CLASS
// ============================================================================

export class SubscriptionMapper {
  /**
   * Convert API JSON to Subscription domain model
   */
  static fromJson(json: any): Subscription {
    // Debug: Check if required fields are present
    if (!json) {
      appLogger.error("SubscriptionMapper.fromJson: json is null/undefined");
      throw new Error("Cannot create subscription from null data");
    }

    const data: SubscriptionData = {
      id: json.id,
      companyId: json.companyId,
      companyName: json.companyName || "Unknown Company",
      planId: json.planId,
      planName: json.planName || "Unknown Plan",
      planDescription: json.planDescription || null,
      startDateUtc: json.startDateUtc,
      expiryDateUtc: json.expiryDateUtc,
      isActive: json.isActive ?? false,
      isTrial: json.isTrial ?? false,
      isExpired: json.isExpired ?? false,
      isLifetime: json.isLifetime ?? false,
      autoRenew: json.autoRenew ?? false,
      // Pause state
      isPaused: json.isPaused ?? false,
      pausedAtUtc: json.pausedAtUtc || null,
      remainingDaysWhenPaused: json.remainingDaysWhenPaused ?? null,
      currency: json.currency ?? 1, // Default to USD
      amount: json.amount ?? 0,
      statusReason: json.statusReason || null,
      // Next subscription for deferred upgrades
      nextSubscriptionId: json.nextSubscriptionId || null,
      nextSubscriptionPlanName: json.nextSubscriptionPlanName || null,
      nextSubscriptionActivationDateUtc: json.nextSubscriptionActivationDateUtc || null,
      // Subscription chain
      parentSubscriptionId: json.parentSubscriptionId || null,
      parentSubscriptionDisplayName: json.parentSubscriptionDisplayName || null,
      offlineLicenseKey: json.offlineLicenseKey || null,
      licenseKeyGeneratedAt: json.licenseKeyGeneratedAt || null,
      licenseKeyVersion: json.licenseKeyVersion || 0,
      // Backend computed properties
      status: json.status,
      daysRemaining: json.daysRemaining,
      canRenew: json.canRenew,
      canSuspend: json.canSuspend,
      canResume: json.canResume,
      canCancel: json.canCancel,
      canUpgrade: json.canUpgrade,
      canExtend: json.canExtend,
      canReactivate: json.canReactivate,
      canPause: json.canPause,
      canUnpause: json.canUnpause,
      // Plan features - handle both camelCase and PascalCase
      projects: json.projects || json.Projects || [],
      modules: json.modules || json.Modules || [],
      customFeatures: json.customFeatures || json.CustomFeatures || [],
      // Enterprise Entitlement System fields
      accessMode: json.accessMode ?? json.AccessMode ?? 1, // Default to Full
      accessModeDisplay: json.accessModeDisplay || json.AccessModeDisplay || 'Full Access',
      defaultFallbackPlanId: json.defaultFallbackPlanId || json.DefaultFallbackPlanId || null,
      defaultFallbackPlanName: json.defaultFallbackPlanName || json.DefaultFallbackPlanName || null,
      exportDeadlineUtc: json.exportDeadlineUtc || json.ExportDeadlineUtc || null,
      entitlementsVersion: json.entitlementsVersion ?? json.EntitlementsVersion ?? 1,
      accessRestrictionMessage: json.accessRestrictionMessage || json.AccessRestrictionMessage || null,
      entitlementCount: json.entitlementCount ?? json.EntitlementCount ?? 0,
      gracePeriodDays: json.gracePeriodDays ?? json.GracePeriodDays ?? 0,
      exportGraceDays: json.exportGraceDays ?? json.ExportGraceDays ?? 30,
    };

    const subscription = new Subscription(data);
    return subscription;
  }

  /**
   * Convert Subscription domain model to API JSON
   */
  static toJson(subscription: Subscription): any {
    return {
      id: subscription.id,
      companyId: subscription.companyId,
      planId: subscription.planId,
      planName: subscription.planName,
      startDateUtc: subscription.startDateUtc.toISOString(),
      expiryDateUtc: subscription.expiryDateUtc.toISOString(),
      isActive: subscription.isActive,
      isTrial: subscription.isTrial,
      isExpired: subscription.isExpired,
      isLifetime: subscription.isLifetime,
      autoRenew: subscription.autoRenew,
      currency: subscription.currency,
      amount: subscription.amount,
      statusReason: subscription.statusReason,
      // Next subscription for deferred upgrades
      nextSubscriptionId: subscription.nextSubscriptionId,
      nextSubscriptionPlanName: subscription.nextSubscriptionPlanName,
      nextSubscriptionActivationDateUtc: subscription.nextSubscriptionActivationDateUtc?.toISOString() || null,
      // Subscription chain
      parentSubscriptionId: subscription.parentSubscriptionId,
      parentSubscriptionDisplayName: subscription.parentSubscriptionDisplayName,
      offlineLicenseKey: subscription.offlineLicenseKey,
      licenseKeyGeneratedAt: subscription.licenseKeyGeneratedAt?.toISOString() || null,
      licenseKeyVersion: subscription.licenseKeyVersion,
      // Entitlement fields
      accessMode: subscription.accessMode,
      accessModeDisplay: subscription.accessModeDisplay,
      defaultFallbackPlanId: subscription.defaultFallbackPlanId,
      defaultFallbackPlanName: subscription.defaultFallbackPlanName,
      exportDeadlineUtc: subscription.exportDeadlineUtc?.toISOString() || null,
      entitlementsVersion: subscription.entitlementsVersion,
      accessRestrictionMessage: subscription.accessRestrictionMessage,
      entitlementCount: subscription.entitlementCount,
      gracePeriodDays: subscription.gracePeriodDays,
      exportGraceDays: subscription.exportGraceDays,
    };
  }

  /**
   * Convert API JSON to SubscriptionStatus domain model
   */
  static statusFromJson(json: any): SubscriptionStatus {
    const data: SubscriptionStatusData = {
      subscriptionId: json.subscriptionId,
      companyId: json.companyId,
      planId: json.planId,
      planName: json.planName,
      isActive: json.isActive,
      isExpired: json.isExpired,
      isTrial: json.isTrial,
      startDateUtc: json.startDateUtc,
      expiryDateUtc: json.expiryDateUtc,
      gracePeriodDays: json.gracePeriodDays,
      graceEndDateUtc: json.graceEndDateUtc,
      nextPlanId: json.nextPlanId || null,
      nextPlanName: json.nextPlanName || null,
      nextPlanStartDateUtc: json.nextPlanStartDateUtc || null,
      statusReason: json.statusReason || null,
      currency: json.currency,
      amount: json.amount,
      statusMessage: json.statusMessage,
    };

    return new SubscriptionStatus(data);
  }

  /**
   * Handle GetAll subscriptions API response
   */
  static handleGetAllResponse(response: any): SubscriptionsResponse {
    console.log("🗺️ Mapper: handleGetAllResponse called with:", response);
    
    if (!response || !response.data) {
      appLogger.warn("SubscriptionMapper: No response data", response);
      return { data: [] };
    }

    console.log("🗺️ Mapper: Response data is array:", Array.isArray(response.data));
    console.log("🗺️ Mapper: Response data length:", response.data?.length);

    const subscriptions = Array.isArray(response.data)
      ? response.data.map((item: any, index: number) => {
          console.log(`🗺️ Mapper: Processing item ${index}:`, item);
          const mapped = this.fromJson(item);
          console.log(`🗺️ Mapper: Mapped item ${index}:`, mapped);
          return mapped;
        })
      : [];

    const result = { 
      data: subscriptions,
      pagination: response.pagination 
    };
    
    console.log("🗺️ Mapper: Final result:", result);
    return result;
  }

  /**
   * Handle GetByCompany subscriptions API response
   * Note: ApiService.unwrap() already extracts .data, so response is the array directly
   */
  static handleGetByCompanyResponse(response: any): CompanySubscriptionsResponse {
    if (!response) {
      return { data: [] };
    }

    // Handle both cases: response is array directly (after unwrap) or has .data property
    const dataArray = Array.isArray(response) ? response : (response.data || []);
    
    const subscriptions = Array.isArray(dataArray)
      ? dataArray.map((item: any) => this.fromJson(item))
      : [];

    return { data: subscriptions };
  }

  /**
   * Handle single subscription API response
   */
  static handleApiResponse(response: any): Subscription {
    if (!response) {
      throw new Error("Invalid API response: response is null or undefined");
    }

    return this.fromJson(response);
  }

  /**
   * Handle upgrade API response
   */
  static handleUpgradeResponse(response: any): UpgradeResponse {
    if (!response) {
      throw new Error("Invalid upgrade response");
    }

    // Handle both camelCase and PascalCase from backend
    const data = response.data || response;
    
    return {
      newSubscription: data.newSubscription || data.NewSubscription 
        ? this.fromJson(data.newSubscription || data.NewSubscription) 
        : null,
      oldSubscription: null, // Not returned by backend
      summary: {
        proratedCredit: data.prorationSuggestion?.suggestedCredit || data.ProrationSuggestion?.SuggestedCredit,
        additionalCharge: data.prorationSuggestion?.netDue || data.ProrationSuggestion?.NetDue,
        effectiveDate: data.newWindow?.startDateUtc || data.NewWindow?.StartDateUtc,
        message: data.message || data.Message || "Upgrade completed",
      },
    };
  }

  /**
   * Handle status API response
   */
  static handleStatusResponse(response: any): SubscriptionStatus {
    console.log("📊 Status response:", response);
    
    if (!response) {
      throw new Error("Invalid status response");
    }

    // Handle both wrapped { data: {...} } and direct object response
    const statusData = response.data || response;
    return this.statusFromJson(statusData);
  }

  /**
   * Handle subscription history response
   * Returns raw history items (not Subscription objects)
   */
  static handleHistoryResponse(response: any): any[] {
    console.log("📜 History response:", response);
    
    if (!response) {
      return [];
    }

    // Handle both wrapped { data: [...] } and direct array response
    const historyData = response.data || response;
    
    if (Array.isArray(historyData)) {
      // Normalize property names (backend uses PascalCase, frontend uses camelCase)
      return historyData.map((item: any) => ({
        action: item.action || item.Action,
        timestamp: item.timestamp || item.Timestamp,
        reason: item.reason || item.Reason,
        details: item.details || item.Details,
      }));
    }
    
    return [];
  }

  /**
   * Handle analytics response
   */
  static handleAnalyticsResponse(response: any): any {
    console.log("📈 Analytics response:", response);
    
    if (!response) {
      return null;
    }
    
    // Handle both wrapped { data: {...} } and direct object response
    const analyticsData = response.data || response;
    
    // Normalize property names
    return {
      subscriptionId: analyticsData.subscriptionId || analyticsData.SubscriptionId,
      companyName: analyticsData.companyName || analyticsData.CompanyName,
      planName: analyticsData.planName || analyticsData.PlanName,
      period: analyticsData.period || analyticsData.Period || {},
      status: analyticsData.status || analyticsData.Status || {},
      usage: analyticsData.usage || analyticsData.Usage || {},
    };
  }

  /**
   * Handle action responses (Cancel, Suspend, Resume, etc.)
   */
  static handleActionResponse(response: any): { message: string; timestamp: string } {
    return {
      message: response?.message || "Action completed successfully",
      timestamp: response?.timestamp || new Date().toISOString(),
    };
  }
}
