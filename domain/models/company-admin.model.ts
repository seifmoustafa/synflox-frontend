// ============================================================================
// SYNFLOX Company Admin Domain Models
// ============================================================================

import { AdminSessionPolicy } from './enums';

// ============================================================================
// Data Interfaces (API Response Shape)
// ============================================================================

export interface CompanyAdminData {
  id: string;
  companyId: string;
  companyName: string;
  username: string;
  displayName: string;
  email: string;
  phone: string;
  isActive: boolean;
  mustChangePassword: boolean;
  isLocked: boolean;
  lockedUntilUtc: string;
  sessionPolicy: AdminSessionPolicy;
  sessionTimeoutMinutes: number;
  lastLoginAtUtc: string;
  totalLogins: number;
  hasActiveSession: boolean;
  createdTimestamp: string;
}

export interface CompanyAdminDetailsData extends CompanyAdminData {
  // Permissions
  canManageDevices: boolean;
  canViewSubscriptions: boolean;
  canApproveReplacements: boolean;
  canGenerateLicenses: boolean;
  canViewUsageReports: boolean;
  canModifySessionSettings: boolean;
  // Session Configuration
  autoLogoutOnInactivity: boolean;
  inactivityTimeoutMinutes: number;
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  passwordExpiryDays: number;
  // Current Session Info
  currentDeviceName: string;
  currentSessionIp: string;
  sessionStartedAtUtc: string;
  lastActivityAtUtc: string;
}

export interface CompanyAdminSessionData {
  id: string;
  sessionId: string;
  deviceName: string;
  operatingSystem: string;
  ipAddress: string;
  location: string;
  startedAtUtc: string;
  expiresAtUtc: string;
  endedAtUtc: string;
  lastActivityAtUtc: string;
  isActive: boolean;
  endReason: string;
  actionCount: number;
  durationMinutes: number;
}

// ============================================================================
// Domain Classes
// ============================================================================

export class CompanyAdmin {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly companyName: string,
    public readonly username: string,
    public readonly displayName: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly isActive: boolean,
    public readonly mustChangePassword: boolean,
    public readonly isLocked: boolean,
    public readonly lockedUntilUtc: Date,
    public readonly sessionPolicy: AdminSessionPolicy,
    public readonly sessionTimeoutMinutes: number,
    public readonly lastLoginAtUtc: Date,
    public readonly totalLogins: number,
    public readonly hasActiveSession: boolean,
    public readonly createdTimestamp: Date
  ) {}

  get statusDisplay(): string {
    if (this.isLocked) return 'Locked';
    if (!this.isActive) return 'Inactive';
    if (this.hasActiveSession) return 'Online';
    return 'Active';
  }

  get statusColor(): 'success' | 'warning' | 'destructive' | 'secondary' {
    if (this.isLocked) return 'destructive';
    if (!this.isActive) return 'secondary';
    if (this.hasActiveSession) return 'success';
    return 'warning';
  }

  get lastLoginDisplay(): string {
    if (this.lastLoginAtUtc.getTime() === 0) return 'Never';
    return this.lastLoginAtUtc.toLocaleString();
  }

  get sessionPolicyDisplay(): string {
    switch (this.sessionPolicy) {
      case AdminSessionPolicy.SingleSession: return 'Single Session';
      case AdminSessionPolicy.MultipleWithWarning: return 'Multiple (With Warning)';
      case AdminSessionPolicy.MultipleAllowed: return 'Multiple Allowed';
      default: return 'Unknown';
    }
  }
}

export class CompanyAdminDetails extends CompanyAdmin {
  constructor(
    id: string,
    companyId: string,
    companyName: string,
    username: string,
    displayName: string,
    email: string,
    phone: string,
    isActive: boolean,
    mustChangePassword: boolean,
    isLocked: boolean,
    lockedUntilUtc: Date,
    sessionPolicy: AdminSessionPolicy,
    sessionTimeoutMinutes: number,
    lastLoginAtUtc: Date,
    totalLogins: number,
    hasActiveSession: boolean,
    createdTimestamp: Date,
    // Permissions
    public readonly canManageDevices: boolean,
    public readonly canViewSubscriptions: boolean,
    public readonly canApproveReplacements: boolean,
    public readonly canGenerateLicenses: boolean,
    public readonly canViewUsageReports: boolean,
    public readonly canModifySessionSettings: boolean,
    // Session Configuration
    public readonly autoLogoutOnInactivity: boolean,
    public readonly inactivityTimeoutMinutes: number,
    public readonly maxFailedAttempts: number,
    public readonly lockoutDurationMinutes: number,
    public readonly passwordExpiryDays: number,
    // Current Session Info
    public readonly currentDeviceName: string,
    public readonly currentSessionIp: string,
    public readonly sessionStartedAtUtc: Date,
    public readonly lastActivityAtUtc: Date
  ) {
    super(
      id, companyId, companyName, username, displayName, email, phone,
      isActive, mustChangePassword, isLocked, lockedUntilUtc, sessionPolicy,
      sessionTimeoutMinutes, lastLoginAtUtc, totalLogins, hasActiveSession, createdTimestamp
    );
  }

  get permissionsList(): string[] {
    const perms: string[] = [];
    if (this.canManageDevices) perms.push('Manage Devices');
    if (this.canViewSubscriptions) perms.push('View Subscriptions');
    if (this.canApproveReplacements) perms.push('Approve Replacements');
    if (this.canGenerateLicenses) perms.push('Generate Licenses');
    if (this.canViewUsageReports) perms.push('View Reports');
    if (this.canModifySessionSettings) perms.push('Modify Session Settings');
    return perms;
  }
}

export class CompanyAdminSession {
  constructor(
    public readonly id: string,
    public readonly sessionId: string,
    public readonly deviceName: string,
    public readonly operatingSystem: string,
    public readonly ipAddress: string,
    public readonly location: string,
    public readonly startedAtUtc: Date,
    public readonly expiresAtUtc: Date,
    public readonly endedAtUtc: Date,
    public readonly lastActivityAtUtc: Date,
    public readonly isActive: boolean,
    public readonly endReason: string,
    public readonly actionCount: number,
    public readonly durationMinutes: number
  ) {}

  get durationDisplay(): string {
    if (this.durationMinutes < 60) return `${Math.round(this.durationMinutes)}m`;
    const hours = Math.floor(this.durationMinutes / 60);
    const mins = Math.round(this.durationMinutes % 60);
    return `${hours}h ${mins}m`;
  }

  get statusDisplay(): string {
    if (this.isActive) return 'Active';
    return this.endReason || 'Ended';
  }
}

// ============================================================================
// Request Classes
// ============================================================================

export class CreateCompanyAdminRequest {
  constructor(
    public companyId: string,
    public username: string,
    public password: string,
    public displayName: string,
    public email: string,
    public phone: string,
    public canManageDevices: boolean = true,
    public canViewSubscriptions: boolean = true,
    public canApproveReplacements: boolean = false,
    public canGenerateLicenses: boolean = false,
    public canViewUsageReports: boolean = true
  ) {}

  get isValid(): boolean {
    return !!(
      this.companyId &&
      this.username?.trim() &&
      this.password?.trim() &&
      this.displayName?.trim() &&
      this.email?.trim()
    );
  }
}

export class UpdateCompanyAdminRequest {
  constructor(
    public displayName: string,
    public email: string,
    public phone: string,
    public isActive: boolean,
    // Permissions
    public canManageDevices: boolean,
    public canViewSubscriptions: boolean,
    public canApproveReplacements: boolean,
    public canGenerateLicenses: boolean,
    public canViewUsageReports: boolean,
    public canModifySessionSettings: boolean,
    // Session Configuration
    public sessionPolicy: AdminSessionPolicy,
    public sessionTimeoutMinutes: number,
    public autoLogoutOnInactivity: boolean,
    public inactivityTimeoutMinutes: number,
    public maxFailedAttempts: number,
    public lockoutDurationMinutes: number,
    public passwordExpiryDays: number
  ) {}

  get isValid(): boolean {
    return !!(
      this.displayName?.trim() &&
      this.email?.trim() &&
      this.sessionTimeoutMinutes >= 15 &&
      this.sessionTimeoutMinutes <= 1440
    );
  }
}

export class ResetAdminPasswordRequest {
  constructor(
    public newPassword: string,
    public mustChangeOnFirstLogin: boolean = true
  ) {}

  get isValid(): boolean {
    return !!(this.newPassword?.trim() && this.newPassword.length >= 8);
  }
}
