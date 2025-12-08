/**
 * Online Client Token Domain Model
 * For managing thin JWT tokens used by online client applications
 */

// ========== Token Status Enum ==========
export enum ClientTokenStatus {
  Active = 'Active',
  Revoked = 'Revoked',
  Expired = 'Expired',
  Suspended = 'Suspended'
}

export enum OnlineDeviceStatus {
  Active = 'Active',
  Revoked = 'Revoked',
  Suspended = 'Suspended'
}

// ========== Online Token Data ==========
export interface OnlineTokenData {
  id: string;
  companyId: string;
  subscriptionId: string;
  name: string;
  issuedAtUtc: string;
  expiresAtUtc: string;
  status: string | number;  // Backend may return numeric or string
  revocationReason: string | null;
  autoRefreshEnabled: boolean;
  maxDevices: number | null;
  boundDeviceCount: number;
  lastUsedAtUtc: string | null;
  usageCount: number;
  lastUsedFromIp: string | null;
  notes: string | null;
  isValid: boolean;
  isExpired: boolean;
  daysUntilExpiry: number;
  companyName: string | null;
  subscriptionPlanName: string | null;
}

export class OnlineToken {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly subscriptionId: string,
    public readonly name: string,
    public readonly issuedAtUtc: Date,
    public readonly expiresAtUtc: Date,
    public readonly status: ClientTokenStatus,
    public readonly revocationReason: string | null,
    public readonly autoRefreshEnabled: boolean,
    public readonly maxDevices: number | null,
    public readonly boundDeviceCount: number,
    public readonly lastUsedAtUtc: Date | null,
    public readonly usageCount: number,
    public readonly lastUsedFromIp: string | null,
    public readonly notes: string | null,
    public readonly isValid: boolean,
    public readonly isExpired: boolean,
    public readonly daysUntilExpiry: number,
    public readonly companyName: string | null,
    public readonly subscriptionPlanName: string | null
  ) {}

  get displayName(): string {
    return this.name || 'Unnamed Token';
  }

  get formattedIssuedDate(): string {
    return this.issuedAtUtc.toLocaleDateString();
  }

  get formattedExpiryDate(): string {
    return this.expiresAtUtc.toLocaleDateString();
  }

  get formattedLastUsedDate(): string | null {
    return this.lastUsedAtUtc?.toLocaleDateString() ?? null;
  }

  get isExpiringSoon(): boolean {
    return this.daysUntilExpiry > 0 && this.daysUntilExpiry <= 7;
  }

  get isActive(): boolean {
    return this.status === ClientTokenStatus.Active && this.isValid;
  }

  get statusVariant(): 'default' | 'success' | 'warning' | 'destructive' {
    if (this.status === ClientTokenStatus.Revoked) return 'destructive';
    if (this.isExpired) return 'destructive';
    if (this.isExpiringSoon) return 'warning';
    if (this.isActive) return 'success';
    return 'default';
  }

  get deviceUsageText(): string {
    if (this.maxDevices === null || this.maxDevices === 0) {
      return `${this.boundDeviceCount} devices (unlimited)`;
    }
    return `${this.boundDeviceCount} / ${this.maxDevices} devices`;
  }

  get deviceLimitReached(): boolean {
    return this.maxDevices !== null && this.maxDevices > 0 && this.boundDeviceCount >= this.maxDevices;
  }
}

// ========== Generate Token Request ==========
export interface GenerateOnlineTokenRequestData {
  subscriptionId: string;
  name: string;
  expiryDays?: number;
  autoRefreshEnabled?: boolean;
  maxDevices?: number;
  notes?: string | null;
}

export class GenerateOnlineTokenRequest {
  public readonly subscriptionId: string;
  public readonly name: string;
  public readonly expiryDays: number;
  public readonly autoRefreshEnabled: boolean;
  public readonly maxDevices: number | null;
  public readonly notes: string | null;

  constructor(data: GenerateOnlineTokenRequestData) {
    this.subscriptionId = data.subscriptionId;
    this.name = data.name;
    this.expiryDays = data.expiryDays ?? 90;
    this.autoRefreshEnabled = data.autoRefreshEnabled ?? true;
    this.maxDevices = data.maxDevices ?? null;
    this.notes = data.notes ?? null;
  }

  get isValid(): boolean {
    return !!(
      this.subscriptionId &&
      this.name &&
      this.name.trim().length >= 2 &&
      this.expiryDays > 0 &&
      this.expiryDays <= 365
    );
  }

  toJSON() {
    return {
      subscriptionId: this.subscriptionId,
      name: this.name.trim(),
      expiryDays: this.expiryDays,
      autoRefreshEnabled: this.autoRefreshEnabled,
      maxDevices: this.maxDevices,
      notes: this.notes?.trim() || null,
    };
  }
}

// ========== Generate Token Response ==========
export interface GenerateOnlineTokenResponseData {
  success: boolean;
  message: string | null;
  token: string | null;
  tokenInfo: OnlineTokenData | null;
}

export class GenerateOnlineTokenResponse {
  constructor(
    public readonly success: boolean,
    public readonly message: string | null,
    public readonly token: string | null,
    public readonly tokenInfo: OnlineToken | null
  ) {}
}

// ========== Online Device ==========
export interface OnlineDeviceData {
  id: string;
  tokenId: string;
  subscriptionId: string;
  deviceFingerprint: string;
  deviceName: string | null;
  deviceType: string | null;
  operatingSystem: string | null;
  status: string;
  firstSeenAtUtc: string;
  lastSeenAtUtc: string | null;
  lastIpAddress: string | null;
  apiCallCount: number;
  statusReason: string | null;
}

export class OnlineDevice {
  constructor(
    public readonly id: string,
    public readonly tokenId: string,
    public readonly subscriptionId: string,
    public readonly deviceFingerprint: string,
    public readonly deviceName: string | null,
    public readonly deviceType: string | null,
    public readonly operatingSystem: string | null,
    public readonly status: OnlineDeviceStatus,
    public readonly firstSeenAtUtc: Date,
    public readonly lastSeenAtUtc: Date | null,
    public readonly lastIpAddress: string | null,
    public readonly apiCallCount: number,
    public readonly statusReason: string | null
  ) {}

  get displayName(): string {
    return this.deviceName || this.deviceFingerprint.substring(0, 12) + '...';
  }

  get formattedFirstSeen(): string {
    return this.firstSeenAtUtc.toLocaleDateString();
  }

  get formattedLastSeen(): string | null {
    return this.lastSeenAtUtc?.toLocaleDateString() ?? null;
  }

  get isActive(): boolean {
    return this.status === OnlineDeviceStatus.Active;
  }

  get statusVariant(): 'default' | 'success' | 'warning' | 'destructive' {
    if (this.status === OnlineDeviceStatus.Revoked) return 'destructive';
    if (this.status === OnlineDeviceStatus.Suspended) return 'warning';
    return 'success';
  }

  get deviceIcon(): string {
    const type = this.deviceType?.toLowerCase() ?? '';
    if (type.includes('mobile') || type.includes('phone')) return 'smartphone';
    if (type.includes('tablet')) return 'tablet';
    if (type.includes('server')) return 'server';
    return 'monitor';
  }
}

// ========== Device Limit ==========
export interface DeviceLimitData {
  currentCount: number;
  maxAllowed: number | null;
  isUnlimited: boolean;
  canRegisterMore: boolean;
  remainingSlots: number | null;
  requiresAdminApproval?: boolean;
  admissionMode?: string;
}

export class DeviceLimit {
  constructor(
    public readonly currentCount: number,
    public readonly maxAllowed: number | null,
    public readonly isUnlimited: boolean,
    public readonly canRegisterMore: boolean,
    public readonly remainingSlots: number | null,
    public readonly requiresAdminApproval: boolean = false,
    public readonly admissionMode: string = 'Open'
  ) {}

  get usageText(): string {
    if (this.isUnlimited) {
      return `${this.currentCount} devices (unlimited)`;
    }
    return `${this.currentCount} / ${this.maxAllowed} devices`;
  }

  get usagePercent(): number {
    if (this.isUnlimited || !this.maxAllowed) return 0;
    return Math.round((this.currentCount / this.maxAllowed) * 100);
  }

  get isAdminOnly(): boolean {
    return this.admissionMode === 'AdminOnly';
  }

  get modeDescription(): string {
    switch (this.admissionMode) {
      case 'Open': return 'Any device can register';
      case 'AdminOnly': return 'Admin approval required';
      case 'AutoWithQueue': return 'Auto-register, then queue';
      case 'HybridAutoAdmin': return 'Hybrid auto/admin';
      default: return this.admissionMode;
    }
  }
}

// ========== Subscription Change Log ==========
export interface SubscriptionChangeLogData {
  id: string;
  subscriptionId: string;
  planId: string | null;
  changeType: string;
  changeDescription: string;
  oldValue: string | null;
  newValue: string | null;
  effectPolicy: string;
  effectiveDateUtc: string;
  isApplied: boolean;
  appliedAtUtc: string | null;
  appliedBy: string | null;
  customerNotified: boolean;
  isCancelled: boolean;
  cancellationReason: string | null;
  daysUntilEffective: number;
  isReadyToApply: boolean;
  subscriptionName: string | null;
  planName: string | null;
}

export class SubscriptionChangeLog {
  constructor(
    public readonly id: string,
    public readonly subscriptionId: string,
    public readonly planId: string | null,
    public readonly changeType: string,
    public readonly changeDescription: string,
    public readonly oldValue: string | null,
    public readonly newValue: string | null,
    public readonly effectPolicy: string,
    public readonly effectiveDateUtc: Date,
    public readonly isApplied: boolean,
    public readonly appliedAtUtc: Date | null,
    public readonly appliedBy: string | null,
    public readonly customerNotified: boolean,
    public readonly isCancelled: boolean,
    public readonly cancellationReason: string | null,
    public readonly daysUntilEffective: number,
    public readonly isReadyToApply: boolean,
    public readonly subscriptionName: string | null,
    public readonly planName: string | null
  ) {}

  get formattedEffectiveDate(): string {
    return this.effectiveDateUtc.toLocaleDateString();
  }

  get statusVariant(): 'default' | 'success' | 'warning' | 'destructive' {
    if (this.isCancelled) return 'destructive';
    if (this.isApplied) return 'success';
    if (this.isReadyToApply) return 'warning';
    return 'default';
  }

  get statusText(): string {
    if (this.isCancelled) return 'Cancelled';
    if (this.isApplied) return 'Applied';
    if (this.isReadyToApply) return 'Ready';
    return `In ${this.daysUntilEffective} days`;
  }

  get changeTypeDisplay(): string {
    return this.changeType.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
  }
}

// ========== Pending Changes ==========
export interface PendingChangesData {
  subscriptionId: string;
  totalPendingChanges: number;
  nextChangeDate: string | null;
  changes: SubscriptionChangeLogData[];
}

export class PendingChanges {
  constructor(
    public readonly subscriptionId: string,
    public readonly totalPendingChanges: number,
    public readonly nextChangeDate: Date | null,
    public readonly changes: SubscriptionChangeLog[]
  ) {}

  get hasChanges(): boolean {
    return this.totalPendingChanges > 0;
  }

  get formattedNextChangeDate(): string | null {
    return this.nextChangeDate?.toLocaleDateString() ?? null;
  }
}
