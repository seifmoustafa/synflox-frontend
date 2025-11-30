/**
 * Subscription Domain Models
 * Represents customer instances of subscription plans with lifecycle management
 */

import { Currency } from "./subscription-plan.model";

// ============================================================================
// ENUMS - Access Mode
// ============================================================================

/**
 * Subscription access mode - defines current access level
 * Matches backend SubscriptionAccessMode enum
 */
export enum SubscriptionAccessMode {
  /** Default/uninitialized value */
  None = 0,
  /** Full access to all entitled features */
  Full = 1,
  /** Grace period - full access but subscription expiring soon */
  GracePeriod = 2,
  /** Read-only access - view and export only */
  ReadOnly = 3,
  /** Export-only access - data export before full block */
  ExportOnly = 4,
  /** Completely blocked - upgrade required */
  Blocked = 5
}

// ============================================================================
// INTERFACES - API Response Data
// ============================================================================

/**
 * Subscription project data from API
 */
export interface SubscriptionProjectData {
  id: string;
  name: string;
  description?: string | null;
  modules?: SubscriptionModuleData[];
}

/**
 * Subscription module data from API
 */
export interface SubscriptionModuleData {
  id: string;
  name: string;
  description?: string | null;
}

/**
 * Subscription data from API responses
 */
export interface SubscriptionData {
  id: string;
  companyId: string;
  companyName: string;
  planId: string;
  planName: string;
  planDescription?: string | null;
  startDateUtc: string;
  expiryDateUtc: string;
  isActive: boolean;
  isTrial: boolean;
  isExpired: boolean;
  isLifetime: boolean;
  autoRenew: boolean;
  currency: Currency;
  amount: number;
  statusReason?: string | null;
  nextPlanId?: string | null;
  nextPlanName?: string | null;
  nextPlanStartDateUtc?: string | null;
  offlineLicenseKey?: string | null;
  licenseKeyGeneratedAt?: string | null;
  licenseKeyVersion: number;
  // Backend computed properties
  status?: string;
  daysRemaining?: number;
  canRenew?: boolean;
  canSuspend?: boolean;
  canResume?: boolean;
  canCancel?: boolean;
  canUpgrade?: boolean;
  canExtend?: boolean;
  canReactivate?: boolean;
  // Plan features
  projects?: SubscriptionProjectData[];
  modules?: SubscriptionModuleData[];
  customFeatures?: string[];
  // Enterprise Entitlement System fields
  accessMode?: SubscriptionAccessMode;
  accessModeDisplay?: string;
  fallbackPlanId?: string | null;
  fallbackPlanName?: string | null;
  exportDeadlineUtc?: string | null;
  entitlementsVersion?: number;
  accessRestrictionMessage?: string | null;
  entitlementCount?: number;
  gracePeriodDays?: number;
  exportGraceDays?: number;
}

/**
 * Detailed subscription status data from API
 */
export interface SubscriptionStatusData {
  subscriptionId: string;
  companyId: string;
  planId: string;
  planName: string;
  isActive: boolean;
  isExpired: boolean;
  isTrial: boolean;
  startDateUtc: string;
  expiryDateUtc: string;
  gracePeriodDays: number;
  graceEndDateUtc: string;
  nextPlanId?: string | null;
  nextPlanName?: string | null;
  nextPlanStartDateUtc?: string | null;
  statusReason?: string | null;
  currency: Currency;
  amount: number;
  statusMessage: string;
}

// ============================================================================
// MAIN DOMAIN MODEL - Subscription
// ============================================================================

/**
 * Subscription domain model with business logic
 */
export class Subscription {
  readonly id: string;
  readonly companyId: string;
  readonly companyName: string;
  readonly planId: string;
  readonly planName: string;
  readonly startDateUtc: Date;
  readonly expiryDateUtc: Date;
  readonly isActive: boolean;
  readonly isTrial: boolean;
  readonly isExpired: boolean;
  readonly isLifetime: boolean;
  readonly autoRenew: boolean;
  readonly currency: Currency;
  readonly amount: number;
  readonly statusReason?: string | null;
  readonly nextPlanId?: string | null;
  readonly nextPlanName?: string | null;
  readonly nextPlanStartDateUtc?: Date | null;
  readonly offlineLicenseKey?: string | null;
  readonly licenseKeyGeneratedAt?: Date | null;
  readonly licenseKeyVersion: number;
  
  // Plan features
  readonly planDescription?: string | null;
  readonly projects: SubscriptionProjectData[];
  readonly modules: SubscriptionModuleData[];
  readonly customFeatures: string[];
  
  // Enterprise Entitlement System fields
  readonly accessMode: SubscriptionAccessMode;
  readonly accessModeDisplay: string;
  readonly fallbackPlanId?: string | null;
  readonly fallbackPlanName?: string | null;
  readonly exportDeadlineUtc?: Date | null;
  readonly entitlementsVersion: number;
  readonly accessRestrictionMessage?: string | null;
  readonly entitlementCount: number;
  readonly gracePeriodDays: number;
  readonly exportGraceDays: number;
  
  // Backend computed properties
  private _status?: string;
  private _daysRemaining?: number;
  private _canRenew?: boolean;
  private _canSuspend?: boolean;
  private _canResume?: boolean;
  private _canCancel?: boolean;
  private _canUpgrade?: boolean;
  private _canExtend?: boolean;
  private _canReactivate?: boolean;

  constructor(data: SubscriptionData) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.companyName = data.companyName;
    this.planId = data.planId;
    this.planName = data.planName;
    this.startDateUtc = new Date(data.startDateUtc);
    this.expiryDateUtc = new Date(data.expiryDateUtc);
    this.isActive = data.isActive;
    this.isTrial = data.isTrial;
    this.isExpired = data.isExpired;
    this.isLifetime = data.isLifetime;
    this.autoRenew = data.autoRenew;
    this.currency = data.currency;
    this.amount = data.amount;
    this.statusReason = data.statusReason;
    this.nextPlanId = data.nextPlanId;
    this.nextPlanName = data.nextPlanName;
    this.nextPlanStartDateUtc = data.nextPlanStartDateUtc
      ? new Date(data.nextPlanStartDateUtc)
      : null;
    this.offlineLicenseKey = data.offlineLicenseKey;
    this.licenseKeyGeneratedAt = data.licenseKeyGeneratedAt
      ? new Date(data.licenseKeyGeneratedAt)
      : null;
    this.licenseKeyVersion = data.licenseKeyVersion;
    
    // Set plan features
    this.planDescription = data.planDescription;
    this.projects = data.projects || [];
    this.modules = data.modules || [];
    this.customFeatures = data.customFeatures || [];
    
    // Set entitlement system fields
    this.accessMode = data.accessMode ?? SubscriptionAccessMode.Full;
    this.accessModeDisplay = data.accessModeDisplay || 'Full Access';
    this.fallbackPlanId = data.fallbackPlanId || null;
    this.fallbackPlanName = data.fallbackPlanName || null;
    this.exportDeadlineUtc = data.exportDeadlineUtc ? new Date(data.exportDeadlineUtc) : null;
    this.entitlementsVersion = data.entitlementsVersion ?? 1;
    this.accessRestrictionMessage = data.accessRestrictionMessage || null;
    this.entitlementCount = data.entitlementCount ?? 0;
    this.gracePeriodDays = data.gracePeriodDays ?? 0;
    this.exportGraceDays = data.exportGraceDays ?? 30;
    
    // Set backend computed properties
    this._status = data.status;
    this._daysRemaining = data.daysRemaining;
    this._canRenew = data.canRenew;
    this._canSuspend = data.canSuspend;
    this._canResume = data.canResume;
    this._canCancel = data.canCancel;
    this._canUpgrade = data.canUpgrade;
    this._canExtend = data.canExtend;
    this._canReactivate = data.canReactivate;
  }

  // ============================================================================
  // BUSINESS LOGIC - Status Calculations
  // ============================================================================

  /**
   * Get human-readable status (prefer backend computed value)
   */
  get status(): string {
    // Use backend computed status if available
    if (this._status) return this._status;
    
    // Fallback to frontend calculation
    if (this.isLifetime) return "Lifetime";
    if (this.isExpired) return "Expired";
    if (!this.isActive && this.statusReason?.includes("suspend")) return "Suspended";
    if (!this.isActive && this.statusReason?.includes("cancel")) return "Cancelled";
    if (this.isTrial) return "Trial";
    if (this.isExpiring) return "Expiring";
    return "Active";
  }

  /**
   * Check if subscription is expiring soon (within 7 days)
   */
  get isExpiring(): boolean {
    if (this.isLifetime || this.isExpired) return false;
    const now = new Date();
    const daysLeft = Math.ceil(
      (this.expiryDateUtc.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft > 0 && daysLeft <= 7;
  }

  /**
   * Days remaining until expiry (prefer backend computed value)
   */
  get daysRemaining(): number {
    // Use backend computed value if available
    if (this._daysRemaining !== undefined) return this._daysRemaining;
    
    // Fallback to frontend calculation
    if (this.isLifetime) return Infinity;
    if (this.isExpired) return 0;
    const now = new Date();
    const days = Math.ceil(
      (this.expiryDateUtc.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, days);
  }

  /**
   * Check if has offline license key
   */
  get hasLicenseKey(): boolean {
    return !!this.offlineLicenseKey && this.offlineLicenseKey.length > 0;
  }

  /**
   * Check if has scheduled upgrade (deferred)
   */
  get hasScheduledUpgrade(): boolean {
    return !!this.nextPlanId && !!this.nextPlanStartDateUtc;
  }

  /**
   * Display name with status
   */
  get displayName(): string {
    return `${this.planName} - ${this.status}`;
  }

  /**
   * Status badge color
   */
  get statusColor(): "blue" | "green" | "yellow" | "red" | "orange" | "gray" | "purple" {
    switch (this.status) {
      case "Trial":
        return "blue";
      case "Active":
        return "green";
      case "Expiring":
        return "yellow";
      case "Expired":
        return "red";
      case "Suspended":
        return "orange";
      case "Cancelled":
        return "gray";
      case "Lifetime":
        return "purple";
      default:
        return "gray";
    }
  }

  /**
   * Check if subscription is valid (active and not expired)
   */
  get isValid(): boolean {
    return this.isActive && !this.isExpired;
  }

  /**
   * Check if can be renewed (prefer backend computed value)
   */
  get canRenew(): boolean {
    if (this._canRenew !== undefined) return this._canRenew;
    return (this.isActive || this.isExpired) && !this.isLifetime;
  }

  /**
   * Check if can be upgraded (prefer backend computed value)
   */
  get canUpgrade(): boolean {
    if (this._canUpgrade !== undefined) return this._canUpgrade;
    return this.isActive && !this.isExpired;
  }

  /**
   * Check if can be cancelled (prefer backend computed value)
   */
  get canCancel(): boolean {
    if (this._canCancel !== undefined) return this._canCancel;
    return this.isActive && !this.isExpired;
  }

  /**
   * Check if can be suspended (prefer backend computed value)
   */
  get canSuspend(): boolean {
    if (this._canSuspend !== undefined) return this._canSuspend;
    return this.isActive && !this.isExpired && this.status !== "Suspended";
  }

  /**
   * Check if can be resumed (prefer backend computed value)
   */
  get canResume(): boolean {
    if (this._canResume !== undefined) return this._canResume;
    return !this.isActive && this.status === "Suspended";
  }

  /**
   * Check if can be extended (prefer backend computed value)
   */
  get canExtend(): boolean {
    if (this._canExtend !== undefined) return this._canExtend;
    return this.isActive && !this.isLifetime;
  }

  /**
   * Check if can be reactivated (prefer backend computed value)
   */
  get canReactivate(): boolean {
    if (this._canReactivate !== undefined) return this._canReactivate;
    return this.isExpired && !this.isLifetime;
  }

  // ============================================================================
  // BUSINESS LOGIC - Access Mode
  // ============================================================================

  /**
   * Check if subscription has restricted access (not full)
   */
  get isRestrictedAccess(): boolean {
    return this.accessMode !== SubscriptionAccessMode.Full && 
           this.accessMode !== SubscriptionAccessMode.None;
  }

  /**
   * Check if subscription is in grace period
   */
  get isInGracePeriod(): boolean {
    return this.accessMode === SubscriptionAccessMode.GracePeriod;
  }

  /**
   * Check if subscription is blocked
   */
  get isBlocked(): boolean {
    return this.accessMode === SubscriptionAccessMode.Blocked;
  }

  /**
   * Check if subscription is in export-only mode
   */
  get isExportOnly(): boolean {
    return this.accessMode === SubscriptionAccessMode.ExportOnly;
  }

  /**
   * Check if subscription is read-only
   */
  get isReadOnly(): boolean {
    return this.accessMode === SubscriptionAccessMode.ReadOnly;
  }

  /**
   * Get access mode badge color
   */
  get accessModeColor(): "green" | "yellow" | "blue" | "orange" | "red" | "gray" {
    switch (this.accessMode) {
      case SubscriptionAccessMode.Full:
        return "green";
      case SubscriptionAccessMode.GracePeriod:
        return "yellow";
      case SubscriptionAccessMode.ReadOnly:
        return "blue";
      case SubscriptionAccessMode.ExportOnly:
        return "orange";
      case SubscriptionAccessMode.Blocked:
        return "red";
      default:
        return "gray";
    }
  }

  /**
   * Days until export deadline (if in export-only mode)
   */
  get daysUntilExportDeadline(): number | null {
    if (!this.exportDeadlineUtc) return null;
    const now = new Date();
    const days = Math.ceil(
      (this.exportDeadlineUtc.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, days);
  }

  /**
   * Check if has entitlements
   */
  get hasEntitlements(): boolean {
    return this.entitlementCount > 0;
  }

  /**
   * Immutable update
   */
  update(updates: Partial<SubscriptionData>): Subscription {
    return new Subscription({ ...this.toData(), ...updates });
  }

  /**
   * Convert to data object
   */
  toData(): SubscriptionData {
    return {
      id: this.id,
      companyId: this.companyId,
      companyName: this.companyName,
      planId: this.planId,
      planName: this.planName,
      startDateUtc: this.startDateUtc.toISOString(),
      expiryDateUtc: this.expiryDateUtc.toISOString(),
      isActive: this.isActive,
      isTrial: this.isTrial,
      isExpired: this.isExpired,
      isLifetime: this.isLifetime,
      autoRenew: this.autoRenew,
      currency: this.currency,
      amount: this.amount,
      statusReason: this.statusReason,
      nextPlanId: this.nextPlanId,
      nextPlanName: this.nextPlanName,
      nextPlanStartDateUtc: this.nextPlanStartDateUtc?.toISOString() || null,
      offlineLicenseKey: this.offlineLicenseKey,
      licenseKeyGeneratedAt: this.licenseKeyGeneratedAt?.toISOString() || null,
      licenseKeyVersion: this.licenseKeyVersion,
      // Entitlement fields
      accessMode: this.accessMode,
      accessModeDisplay: this.accessModeDisplay,
      fallbackPlanId: this.fallbackPlanId,
      fallbackPlanName: this.fallbackPlanName,
      exportDeadlineUtc: this.exportDeadlineUtc?.toISOString() || null,
      entitlementsVersion: this.entitlementsVersion,
      accessRestrictionMessage: this.accessRestrictionMessage,
      entitlementCount: this.entitlementCount,
      gracePeriodDays: this.gracePeriodDays,
      exportGraceDays: this.exportGraceDays,
    };
  }
}

// ============================================================================
// STATUS MODEL
// ============================================================================

/**
 * Detailed subscription status with computed messages
 */
export class SubscriptionStatus {
  readonly subscriptionId: string;
  readonly companyId: string;
  readonly planId: string;
  readonly planName: string;
  readonly isActive: boolean;
  readonly isExpired: boolean;
  readonly isTrial: boolean;
  readonly startDateUtc: Date;
  readonly expiryDateUtc: Date;
  readonly gracePeriodDays: number;
  readonly graceEndDateUtc: Date;
  readonly nextPlanId?: string | null;
  readonly nextPlanName?: string | null;
  readonly nextPlanStartDateUtc?: Date | null;
  readonly statusReason?: string | null;
  readonly currency: Currency;
  readonly amount: number;
  readonly statusMessage: string;

  constructor(data: SubscriptionStatusData) {
    this.subscriptionId = data.subscriptionId;
    this.companyId = data.companyId;
    this.planId = data.planId;
    this.planName = data.planName;
    this.isActive = data.isActive;
    this.isExpired = data.isExpired;
    this.isTrial = data.isTrial;
    this.startDateUtc = new Date(data.startDateUtc);
    this.expiryDateUtc = new Date(data.expiryDateUtc);
    this.gracePeriodDays = data.gracePeriodDays;
    this.graceEndDateUtc = new Date(data.graceEndDateUtc);
    this.nextPlanId = data.nextPlanId;
    this.nextPlanName = data.nextPlanName;
    this.nextPlanStartDateUtc = data.nextPlanStartDateUtc
      ? new Date(data.nextPlanStartDateUtc)
      : null;
    this.statusReason = data.statusReason;
    this.currency = data.currency;
    this.amount = data.amount;
    this.statusMessage = data.statusMessage;
  }
}

// ============================================================================
// REQUEST MODELS
// ============================================================================

/**
 * Create subscription request
 */
export class CreateSubscriptionRequest {
  readonly companyId: string;
  readonly planId: string;
  readonly currency?: Currency | null; // Optional - backend will auto-select from plan
  readonly startWithTrial: boolean;
  readonly autoRenew?: boolean | null;
  readonly nextPlanId?: string | null;
  readonly nextPlanStartDateUtc?: string | null;

  constructor(data: {
    companyId: string;
    planId: string;
    currency?: Currency | null; // Optional - backend will auto-select from plan
    startWithTrial?: boolean;
    autoRenew?: boolean | null;
    nextPlanId?: string | null;
    nextPlanStartDateUtc?: string | null;
  }) {
    this.companyId = data.companyId;
    this.planId = data.planId;
    this.currency = data.currency;
    this.startWithTrial = data.startWithTrial ?? false;
    this.autoRenew = data.autoRenew;
    this.nextPlanId = data.nextPlanId;
    this.nextPlanStartDateUtc = data.nextPlanStartDateUtc;
  }

  /**
   * Validate request
   */
  get isValid(): boolean {
    return (
      !!this.companyId &&
      !!this.planId
    );
  }

  /**
   * Convert to API format
   */
  toJson(): any {
    return {
      companyId: this.companyId,
      planId: this.planId,
      currency: this.currency,
      startWithTrial: this.startWithTrial,
      autoRenew: this.autoRenew,
      nextPlanId: this.nextPlanId,
      nextPlanStartDateUtc: this.nextPlanStartDateUtc,
    };
  }
}

/**
 * Upgrade subscription request
 */
export class UpgradeSubscriptionRequest {
  readonly id: string;
  readonly newPlanId: string;
  readonly mode: "FullReplace" | "Prorated" | "Deferred" | "DefaultFromPolicy";
  readonly newAutoRenew?: boolean | null;

  constructor(data: {
    id: string;
    newPlanId: string;
    mode?: "FullReplace" | "Prorated" | "Deferred" | "DefaultFromPolicy";
    newAutoRenew?: boolean | null;
  }) {
    this.id = data.id;
    this.newPlanId = data.newPlanId;
    this.mode = data.mode ?? "DefaultFromPolicy";
    this.newAutoRenew = data.newAutoRenew;
  }

  get isValid(): boolean {
    return !!this.id && !!this.newPlanId && !!this.mode;
  }

  toJson(): any {
    return {
      newPlanId: this.newPlanId,
      mode: this.mode,
      newAutoRenew: this.newAutoRenew,
    };
  }
}

/**
 * Renew subscription request
 */
export class RenewSubscriptionRequest {
  readonly id: string;
  readonly renewStrategy: "CreateFollowUp" | "ExtendInPlace";
  readonly newAutoRenew?: boolean | null;
  readonly nextPlanId?: string | null;
  readonly nextPlanStartDateUtc?: string | null;

  constructor(data: {
    id: string;
    renewStrategy?: "CreateFollowUp" | "ExtendInPlace";
    newAutoRenew?: boolean | null;
    nextPlanId?: string | null;
    nextPlanStartDateUtc?: string | null;
  }) {
    this.id = data.id;
    this.renewStrategy = data.renewStrategy ?? "CreateFollowUp";
    this.newAutoRenew = data.newAutoRenew;
    this.nextPlanId = data.nextPlanId;
    this.nextPlanStartDateUtc = data.nextPlanStartDateUtc;
  }

  get isValid(): boolean {
    return !!this.id && !!this.renewStrategy;
  }

  toJson(): any {
    return {
      renewStrategy: this.renewStrategy,
      newAutoRenew: this.newAutoRenew,
      nextPlanId: this.nextPlanId,
      nextPlanStartDateUtc: this.nextPlanStartDateUtc,
    };
  }
}

/**
 * Extend subscription request
 */
export class ExtendSubscriptionRequest {
  readonly id: string;
  readonly extensionDays: number;
  readonly reason?: string | null;
  readonly sendEmailNotification: boolean;
  readonly notes?: string | null;

  constructor(data: {
    id: string;
    extensionDays: number;
    reason?: string | null;
    sendEmailNotification?: boolean;
    notes?: string | null;
  }) {
    this.id = data.id;
    this.extensionDays = data.extensionDays;
    this.reason = data.reason;
    this.sendEmailNotification = data.sendEmailNotification ?? true;
    this.notes = data.notes;
  }

  get isValid(): boolean {
    return (
      !!this.id &&
      this.extensionDays > 0 &&
      this.extensionDays <= 3650 // Max 10 years
    );
  }

  toJson(): any {
    return {
      extensionDays: this.extensionDays,
      reason: this.reason,
      sendEmailNotification: this.sendEmailNotification,
      notes: this.notes,
    };
  }
}

/**
 * Subscription action request (Cancel, Suspend, Resume, etc.)
 */
export class SubscriptionActionRequest {
  readonly id: string;
  readonly reason?: string | null;
  readonly notes?: string | null;
  readonly sendEmailNotification: boolean;

  constructor(data: {
    id: string;
    reason?: string | null;
    notes?: string | null;
    sendEmailNotification?: boolean;
  }) {
    this.id = data.id;
    this.reason = data.reason;
    this.notes = data.notes;
    this.sendEmailNotification = data.sendEmailNotification ?? true;
  }

  get isValid(): boolean {
    return !!this.id;
  }

  toJson(): any {
    return {
      reason: this.reason,
      notes: this.notes,
      sendEmailNotification: this.sendEmailNotification,
    };
  }
}
