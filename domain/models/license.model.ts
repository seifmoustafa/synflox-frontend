// ============================================================================
// License Domain Models - Clean Architecture
// ============================================================================

import { SubscriptionAccessMode } from './subscription.model';

// ============================================================================
// License Info (from OfflineLicenseDto)
// ============================================================================

export interface LicenseData {
  licenseId: string;
  subscriptionId: string;
  companyId: string;
  companyName: string;
  planName: string;
  licenseKey?: string | null;
  generatedAtUtc?: string | null;
  expiresAtUtc: string;
  daysUntilExpiry: number;
  keyVersion: number;
  entitlementsVersion: number;
  isActive: boolean;
  isExpired: boolean;
  isMachineBound: boolean;
  machineFingerprint?: string | null;
  authorizedMachineCount: number;
  accessMode: SubscriptionAccessMode | string;
  status: string;
  statusColor: string;
  hasValidKey: boolean;
  canRegenerate: boolean;
  canRevoke: boolean;
  lastValidationUtc?: string | null;
  validationCount: number;
}

export class License {
  readonly licenseId: string;
  readonly subscriptionId: string;
  readonly companyId: string;
  readonly companyName: string;
  readonly planName: string;
  readonly licenseKey?: string | null;
  readonly generatedAtUtc?: Date | null;
  readonly expiresAtUtc: Date;
  readonly daysUntilExpiry: number;
  readonly keyVersion: number;
  readonly entitlementsVersion: number;
  readonly isActive: boolean;
  readonly isExpired: boolean;
  readonly isMachineBound: boolean;
  readonly machineFingerprint?: string | null;
  readonly authorizedMachineCount: number;
  readonly accessMode: SubscriptionAccessMode;
  readonly status: string;
  readonly statusColor: string;
  readonly hasValidKey: boolean;
  readonly canRegenerate: boolean;
  readonly canRevoke: boolean;
  readonly lastValidationUtc?: Date | null;
  readonly validationCount: number;

  constructor(data: LicenseData) {
    this.licenseId = data.licenseId;
    this.subscriptionId = data.subscriptionId;
    this.companyId = data.companyId;
    this.companyName = data.companyName;
    this.planName = data.planName;
    this.licenseKey = data.licenseKey;
    this.generatedAtUtc = data.generatedAtUtc ? new Date(data.generatedAtUtc) : null;
    this.expiresAtUtc = new Date(data.expiresAtUtc);
    this.daysUntilExpiry = data.daysUntilExpiry;
    this.keyVersion = data.keyVersion;
    this.entitlementsVersion = data.entitlementsVersion;
    this.isActive = data.isActive;
    this.isExpired = data.isExpired;
    this.isMachineBound = data.isMachineBound;
    this.machineFingerprint = data.machineFingerprint;
    this.authorizedMachineCount = data.authorizedMachineCount;
    this.accessMode = data.accessMode as SubscriptionAccessMode;
    this.status = data.status;
    this.statusColor = data.statusColor;
    this.hasValidKey = data.hasValidKey;
    this.canRegenerate = data.canRegenerate;
    this.canRevoke = data.canRevoke;
    this.lastValidationUtc = data.lastValidationUtc ? new Date(data.lastValidationUtc) : null;
    this.validationCount = data.validationCount;
  }

  // Business logic getters
  get isValid(): boolean {
    return this.hasValidKey && this.isActive && !this.isExpired;
  }

  get displayStatus(): string {
    return this.status;
  }

  get formattedExpiryDate(): string {
    return this.expiresAtUtc.toLocaleDateString();
  }

  get formattedGeneratedDate(): string {
    return this.generatedAtUtc?.toLocaleDateString() ?? 'Never';
  }

  get expiryUrgency(): 'critical' | 'warning' | 'normal' | 'expired' {
    if (this.isExpired) return 'expired';
    if (this.daysUntilExpiry <= 7) return 'critical';
    if (this.daysUntilExpiry <= 30) return 'warning';
    return 'normal';
  }

  get truncatedLicenseKey(): string {
    if (!this.licenseKey) return '';
    if (this.licenseKey.length <= 20) return this.licenseKey;
    return `${this.licenseKey.slice(0, 10)}...${this.licenseKey.slice(-10)}`;
  }
}

// ============================================================================
// Company License Summary
// ============================================================================

export interface CompanyLicenseSummaryData {
  companyId: string;
  companyName: string;
  totalLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  expiringLicenses: number;
  licenses: LicenseData[];
}

export class CompanyLicenseSummary {
  readonly companyId: string;
  readonly companyName: string;
  readonly totalLicenses: number;
  readonly activeLicenses: number;
  readonly expiredLicenses: number;
  readonly expiringLicenses: number;
  readonly licenses: License[];

  constructor(data: CompanyLicenseSummaryData) {
    this.companyId = data.companyId;
    this.companyName = data.companyName;
    this.totalLicenses = data.totalLicenses;
    this.activeLicenses = data.activeLicenses;
    this.expiredLicenses = data.expiredLicenses;
    this.expiringLicenses = data.expiringLicenses;
    this.licenses = data.licenses.map(l => new License(l));
  }

  get hasIssues(): boolean {
    return this.expiredLicenses > 0 || this.expiringLicenses > 0;
  }
}

// ============================================================================
// Generate License Response
// ============================================================================

export interface GenerateLicenseResponseData {
  licenseKey: string;
  licenseId: string;
  generatedAtUtc: string;
  expiresAtUtc: string;
  daysUntilExpiry: number;
  version: number;
  entitlementsVersion: number;
  isMachineBound: boolean;
  machineFingerprint?: string | null;
  companyName: string;
  planName: string;
  message?: string;
}

export class GenerateLicenseResponse {
  readonly licenseKey: string;
  readonly licenseId: string;
  readonly generatedAtUtc: Date;
  readonly expiresAtUtc: Date;
  readonly daysUntilExpiry: number;
  readonly version: number;
  readonly entitlementsVersion: number;
  readonly isMachineBound: boolean;
  readonly machineFingerprint?: string | null;
  readonly companyName: string;
  readonly planName: string;
  readonly message: string;

  constructor(data: GenerateLicenseResponseData) {
    this.licenseKey = data.licenseKey;
    this.licenseId = data.licenseId;
    this.generatedAtUtc = new Date(data.generatedAtUtc);
    this.expiresAtUtc = new Date(data.expiresAtUtc);
    this.daysUntilExpiry = data.daysUntilExpiry;
    this.version = data.version;
    this.entitlementsVersion = data.entitlementsVersion;
    this.isMachineBound = data.isMachineBound;
    this.machineFingerprint = data.machineFingerprint;
    this.companyName = data.companyName;
    this.planName = data.planName;
    this.message = data.message || 'License generated successfully';
  }

  get truncatedKey(): string {
    if (this.licenseKey.length <= 30) return this.licenseKey;
    return `${this.licenseKey.slice(0, 15)}...${this.licenseKey.slice(-15)}`;
  }
}

// ============================================================================
// Validate License Response
// ============================================================================

export interface ValidateLicenseResponseData {
  isValid: boolean;
  status: string;
  message: string;
  licenseId?: string;
  companyId?: string;
  companyName?: string;
  subscriptionId?: string;
  planName?: string;
  expiresAtUtc?: string;
  daysUntilExpiry?: number;
  gracePeriodEndsAtUtc?: string;
  exportDeadlineUtc?: string;
  isTrial?: boolean;
  accessMode?: string;
  keyVersion?: number;
  entitlementsVersion?: number;
  machineAuthorized?: boolean;
  clockTamperingDetected?: boolean;
  isInGracePeriod?: boolean;
  isInExportOnly?: boolean;
  warnings: string[];
}

export class ValidateLicenseResponse {
  readonly isValid: boolean;
  readonly status: string;
  readonly message: string;
  readonly licenseId?: string;
  readonly companyId?: string;
  readonly companyName?: string;
  readonly subscriptionId?: string;
  readonly planName?: string;
  readonly expiresAtUtc?: Date;
  readonly daysUntilExpiry?: number;
  readonly gracePeriodEndsAtUtc?: Date;
  readonly exportDeadlineUtc?: Date;
  readonly isTrial?: boolean;
  readonly accessMode?: string;
  readonly keyVersion?: number;
  readonly entitlementsVersion?: number;
  readonly machineAuthorized?: boolean;
  readonly clockTamperingDetected?: boolean;
  readonly isInGracePeriod?: boolean;
  readonly isInExportOnly?: boolean;
  readonly warnings: string[];

  constructor(data: ValidateLicenseResponseData) {
    this.isValid = data.isValid;
    this.status = data.status;
    this.message = data.message;
    this.licenseId = data.licenseId;
    this.companyId = data.companyId;
    this.companyName = data.companyName;
    this.subscriptionId = data.subscriptionId;
    this.planName = data.planName;
    this.expiresAtUtc = data.expiresAtUtc ? new Date(data.expiresAtUtc) : undefined;
    this.daysUntilExpiry = data.daysUntilExpiry;
    this.gracePeriodEndsAtUtc = data.gracePeriodEndsAtUtc ? new Date(data.gracePeriodEndsAtUtc) : undefined;
    this.exportDeadlineUtc = data.exportDeadlineUtc ? new Date(data.exportDeadlineUtc) : undefined;
    this.isTrial = data.isTrial;
    this.accessMode = data.accessMode;
    this.keyVersion = data.keyVersion;
    this.entitlementsVersion = data.entitlementsVersion;
    this.machineAuthorized = data.machineAuthorized;
    this.clockTamperingDetected = data.clockTamperingDetected;
    this.isInGracePeriod = data.isInGracePeriod;
    this.isInExportOnly = data.isInExportOnly;
    this.warnings = data.warnings || [];
  }

  get hasWarnings(): boolean {
    return this.warnings.length > 0;
  }
}

// ============================================================================
// Request DTOs
// ============================================================================

export class GenerateLicenseRequest {
  subscriptionId?: string;
  machineFingerprint?: MachineFingerprint;
  notes?: string;
  allowMultipleMachines: boolean = false;
  forceRegenerate: boolean = false;

  constructor(data?: Partial<GenerateLicenseRequest>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  toJson(): Record<string, unknown> {
    return {
      subscriptionId: this.subscriptionId,
      machineFingerprint: this.machineFingerprint,
      notes: this.notes,
      allowMultipleMachines: this.allowMultipleMachines,
      forceRegenerate: this.forceRegenerate,
    };
  }
}

export interface MachineFingerprint {
  cpuId?: string;
  motherboardSerial?: string;
  diskSerial?: string;
  macAddress?: string;
  biosUuid?: string;
  osProductId?: string;
  hostname?: string;
}

export class ValidateLicenseRequest {
  licenseKey: string = '';
  machineFingerprint?: MachineFingerprint;
  validateOnline: boolean = false;
  updateLastValidation: boolean = false;
  clientTimestamp?: number;

  constructor(data?: Partial<ValidateLicenseRequest>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  toJson(): Record<string, unknown> {
    return {
      licenseKey: this.licenseKey,
      machineFingerprint: this.machineFingerprint,
      validateOnline: this.validateOnline,
      updateLastValidation: this.updateLastValidation,
      clientTimestamp: this.clientTimestamp,
    };
  }
}

// ============================================================================
// Device Activation Models
// ============================================================================

export interface DeviceActivationData {
  activationId: string;
  deviceName?: string | null;
  operatingSystem?: string | null;
  machineHashTruncated: string;
  activatedAtUtc: string;
  lastSeenAtUtc: string;
  lastIpAddress?: string | null;
  isActive: boolean;
  validationCount: number;
  hardwareChangeCount: number;
}

export class DeviceActivation {
  readonly activationId: string;
  readonly deviceName?: string | null;
  readonly operatingSystem?: string | null;
  readonly machineHashTruncated: string;
  readonly activatedAtUtc: Date;
  readonly lastSeenAtUtc: Date;
  readonly lastIpAddress?: string | null;
  readonly isActive: boolean;
  readonly validationCount: number;
  readonly hardwareChangeCount: number;

  constructor(data: DeviceActivationData) {
    this.activationId = data.activationId;
    this.deviceName = data.deviceName;
    this.operatingSystem = data.operatingSystem;
    this.machineHashTruncated = data.machineHashTruncated;
    this.activatedAtUtc = new Date(data.activatedAtUtc);
    this.lastSeenAtUtc = new Date(data.lastSeenAtUtc);
    this.lastIpAddress = data.lastIpAddress;
    this.isActive = data.isActive;
    this.validationCount = data.validationCount;
    this.hardwareChangeCount = data.hardwareChangeCount;
  }

  get displayName(): string {
    return this.deviceName || 'Unknown Device';
  }

  get formattedLastSeen(): string {
    return this.lastSeenAtUtc.toLocaleString();
  }
}

export interface ActivationSummaryData {
  subscriptionId: string;
  companyName: string;
  planName: string;
  maxDevices: number;
  activeDeviceCount: number;
  requireMachineBinding: boolean;
  allowConcurrentUsage: boolean;
  hardwareChangeTolerance: number;
  activations: DeviceActivationData[];
}

export class ActivationSummary {
  readonly subscriptionId: string;
  readonly companyName: string;
  readonly planName: string;
  readonly maxDevices: number;
  readonly activeDeviceCount: number;
  readonly requireMachineBinding: boolean;
  readonly allowConcurrentUsage: boolean;
  readonly hardwareChangeTolerance: number;
  readonly activations: DeviceActivation[];

  constructor(data: ActivationSummaryData) {
    this.subscriptionId = data.subscriptionId;
    this.companyName = data.companyName;
    this.planName = data.planName;
    this.maxDevices = data.maxDevices;
    this.activeDeviceCount = data.activeDeviceCount;
    this.requireMachineBinding = data.requireMachineBinding;
    this.allowConcurrentUsage = data.allowConcurrentUsage;
    this.hardwareChangeTolerance = data.hardwareChangeTolerance;
    this.activations = data.activations.map(a => new DeviceActivation(a));
  }

  get isUnlimited(): boolean {
    return this.maxDevices === 0;
  }

  get remainingSlots(): number {
    if (this.isUnlimited) return -1;
    return this.maxDevices - this.activeDeviceCount;
  }

  get usagePercentage(): number {
    if (this.isUnlimited) return 0;
    return Math.round((this.activeDeviceCount / this.maxDevices) * 100);
  }

  get hasDevices(): boolean {
    return this.activations.length > 0;
  }
}
