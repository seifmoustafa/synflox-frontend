/**
 * Client Admin Token Domain Model
 * For managing client administrator tokens used for device binding
 */

/**
 * Admin token data from API
 */
export interface AdminTokenData {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  issuedAtUtc: string;
  expiresAtUtc: string;
  daysUntilExpiry: number;
  status: string;
  isValid: boolean;
  isExpired: boolean;
  lastUsedAtUtc: string | null;
  usageCount: number;
  lastUsedFromIp: string | null;
  // Permissions
  canBindDevices: boolean;
  canUnbindDevices: boolean;
  canViewDevices: boolean;
  canApproveReplacements: boolean;
  // Limits
  dailyApiLimit: number;
  todayApiCalls: number;
  notes: string | null;
}

/**
 * Admin Token domain model
 */
export class AdminToken {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly companyName: string,
    public readonly name: string,
    public readonly issuedAtUtc: Date,
    public readonly expiresAtUtc: Date,
    public readonly daysUntilExpiry: number,
    public readonly status: string,
    public readonly isValid: boolean,
    public readonly isExpired: boolean,
    public readonly lastUsedAtUtc: Date | null,
    public readonly usageCount: number,
    public readonly lastUsedFromIp: string | null,
    // Permissions
    public readonly canBindDevices: boolean,
    public readonly canUnbindDevices: boolean,
    public readonly canViewDevices: boolean,
    public readonly canApproveReplacements: boolean,
    // Limits
    public readonly dailyApiLimit: number,
    public readonly todayApiCalls: number,
    public readonly notes: string | null
  ) {}

  /**
   * Display name for the token
   */
  get displayName(): string {
    return this.name || 'Unnamed Token';
  }

  /**
   * Formatted issue date
   */
  get formattedIssuedDate(): string {
    return this.issuedAtUtc.toLocaleDateString();
  }

  /**
   * Formatted expiry date
   */
  get formattedExpiryDate(): string {
    return this.expiresAtUtc.toLocaleDateString();
  }

  /**
   * Formatted last used date
   */
  get formattedLastUsedDate(): string | null {
    return this.lastUsedAtUtc?.toLocaleDateString() ?? null;
  }

  /**
   * Check if token is about to expire (within 30 days)
   */
  get isExpiringSoon(): boolean {
    return this.daysUntilExpiry > 0 && this.daysUntilExpiry <= 30;
  }

  /**
   * Check if daily limit is reached
   */
  get isDailyLimitReached(): boolean {
    return this.dailyApiLimit > 0 && this.todayApiCalls >= this.dailyApiLimit;
  }

  /**
   * Get status badge variant
   */
  get statusVariant(): 'default' | 'success' | 'warning' | 'destructive' {
    if (this.isExpired || !this.isValid) return 'destructive';
    if (this.isExpiringSoon) return 'warning';
    return 'success';
  }

  /**
   * Get permissions summary
   */
  get permissionsSummary(): string[] {
    const perms: string[] = [];
    if (this.canBindDevices) perms.push('Bind');
    if (this.canUnbindDevices) perms.push('Unbind');
    if (this.canViewDevices) perms.push('View');
    if (this.canApproveReplacements) perms.push('Approve');
    return perms;
  }
}

/**
 * Request to generate a new admin token
 */
export interface GenerateAdminTokenRequestData {
  companyId: string;
  name: string;
  expiryDays?: number;
  canBindDevices?: boolean;
  canUnbindDevices?: boolean;
  canViewDevices?: boolean;
  canApproveReplacements?: boolean;
  dailyApiLimit?: number;
  notes?: string | null;
}

export class GenerateAdminTokenRequest {
  public readonly companyId: string;
  public readonly name: string;
  public readonly expiryDays: number;
  public readonly canBindDevices: boolean;
  public readonly canUnbindDevices: boolean;
  public readonly canViewDevices: boolean;
  public readonly canApproveReplacements: boolean;
  public readonly dailyApiLimit: number;
  public readonly notes: string | null;

  constructor(data: GenerateAdminTokenRequestData) {
    this.companyId = data.companyId;
    this.name = data.name;
    this.expiryDays = data.expiryDays ?? 365;
    this.canBindDevices = data.canBindDevices ?? true;
    this.canUnbindDevices = data.canUnbindDevices ?? true;
    this.canViewDevices = data.canViewDevices ?? true;
    this.canApproveReplacements = data.canApproveReplacements ?? true;
    this.dailyApiLimit = data.dailyApiLimit ?? 0;
    this.notes = data.notes ?? null;
  }

  get isValid(): boolean {
    return !!(
      this.companyId &&
      this.name &&
      this.name.trim().length >= 2 &&
      this.expiryDays > 0
    );
  }

  toJSON() {
    return {
      companyId: this.companyId,
      name: this.name.trim(),
      expiryDays: this.expiryDays,
      canBindDevices: this.canBindDevices,
      canUnbindDevices: this.canUnbindDevices,
      canViewDevices: this.canViewDevices,
      canApproveReplacements: this.canApproveReplacements,
      dailyApiLimit: this.dailyApiLimit,
      notes: this.notes?.trim() || null,
    };
  }
}

/**
 * Response from token generation
 */
export interface GenerateAdminTokenResponseData {
  success: boolean;
  message: string | null;
  token: string | null;  // The actual JWT - only returned once!
  tokenInfo: AdminTokenData | null;
}

export class GenerateAdminTokenResponse {
  constructor(
    public readonly success: boolean,
    public readonly message: string | null,
    public readonly token: string | null,
    public readonly tokenInfo: AdminToken | null
  ) {}
}
