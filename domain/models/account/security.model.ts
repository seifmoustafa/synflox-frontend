/**
 * Account Security Domain Models
 * Based on backend SecurityDashboardDto.cs and AdvancedSecurityAnalyticsDto.cs
 */

// ============================================
// 2FA MODELS
// ============================================

export interface TwoFactorSetupData {
  secret: string;
  qrCodeBase64: string;
  manualEntryKey: string;
  accountName: string;
  issuer: string;
}

export class TwoFactorSetup {
  public readonly secret: string;
  public readonly qrCodeBase64: string;
  public readonly manualEntryKey: string;
  public readonly accountName: string;
  public readonly issuer: string;

  constructor(data: TwoFactorSetupData) {
    this.secret = data.secret;
    this.qrCodeBase64 = data.qrCodeBase64;
    this.manualEntryKey = data.manualEntryKey;
    this.accountName = data.accountName;
    this.issuer = data.issuer;
  }

  get qrCodeDataUrl(): string {
    return `data:image/png;base64,${this.qrCodeBase64}`;
  }
}

export interface Enable2FARequestData {
  verificationCode: string;
}

export class Enable2FARequest {
  public readonly verificationCode: string;

  constructor(data: Enable2FARequestData) {
    this.verificationCode = data.verificationCode;
  }

  get isValid(): boolean {
    return /^\d{6}$/.test(this.verificationCode);
  }
}

export interface Disable2FARequestData {
  currentPassword: string;
}

export class Disable2FARequest {
  public readonly currentPassword: string;

  constructor(data: Disable2FARequestData) {
    this.currentPassword = data.currentPassword;
  }

  get isValid(): boolean {
    return this.currentPassword.length >= 6;
  }
}

export interface Reset2FARequestData {
  currentPassword: string;
}

export class Reset2FARequest {
  public readonly currentPassword: string;

  constructor(data: Reset2FARequestData) {
    this.currentPassword = data.currentPassword;
  }

  get isValid(): boolean {
    return this.currentPassword.length >= 6;
  }
}

// ============================================
// SECURITY DASHBOARD MODELS
// ============================================

export interface TwoFactorStatsData {
  isEnabled: boolean;
  enabledDate?: string | null;
  lastVerification?: string | null;
  totalVerifications: number;
  failedAttemptsLast30Days: number;
}

export class TwoFactorStats {
  public readonly isEnabled: boolean;
  public readonly enabledDate?: Date | null;
  public readonly lastVerification?: Date | null;
  public readonly totalVerifications: number;
  public readonly failedAttemptsLast30Days: number;

  constructor(data: TwoFactorStatsData) {
    this.isEnabled = data.isEnabled;
    this.enabledDate = data.enabledDate ? new Date(data.enabledDate) : null;
    this.lastVerification = data.lastVerification ? new Date(data.lastVerification) : null;
    this.totalVerifications = data.totalVerifications;
    this.failedAttemptsLast30Days = data.failedAttemptsLast30Days;
  }

  get daysSinceEnabled(): number | null {
    if (!this.enabledDate) return null;
    const now = new Date();
    const diff = now.getTime() - this.enabledDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

export interface BackupCodesStatsData {
  totalGenerated: number;
  remainingCodes: number;
  usedCodes: number;
  expiredCodes: number;
  lastGenerationDate?: string | null;
  nextExpiryDate?: string | null;
  daysUntilExpiry?: number | null;
  needsRegeneration: boolean;
}

export class BackupCodesStats {
  public readonly totalGenerated: number;
  public readonly remainingCodes: number;
  public readonly usedCodes: number;
  public readonly expiredCodes: number;
  public readonly lastGenerationDate?: Date | null;
  public readonly nextExpiryDate?: Date | null;
  public readonly daysUntilExpiry?: number | null;
  public readonly needsRegeneration: boolean;

  constructor(data: BackupCodesStatsData) {
    this.totalGenerated = data.totalGenerated;
    this.remainingCodes = data.remainingCodes;
    this.usedCodes = data.usedCodes;
    this.expiredCodes = data.expiredCodes;
    this.lastGenerationDate = data.lastGenerationDate ? new Date(data.lastGenerationDate) : null;
    this.nextExpiryDate = data.nextExpiryDate ? new Date(data.nextExpiryDate) : null;
    this.daysUntilExpiry = data.daysUntilExpiry;
    this.needsRegeneration = data.needsRegeneration;
  }

  get isLow(): boolean {
    return this.remainingCodes <= 2;
  }

  get isHealthy(): boolean {
    return this.remainingCodes >= 5 && !this.needsRegeneration;
  }
}

export interface SecurityEventData {
  eventType: string;
  description: string;
  timestamp: string;
  ipAddress?: string | null;
  success: boolean;
  severity: string;
}

export class SecurityEvent {
  public readonly eventType: string;
  public readonly description: string;
  public readonly timestamp: Date;
  public readonly ipAddress?: string | null;
  public readonly success: boolean;
  public readonly severity: string;

  constructor(data: SecurityEventData) {
    this.eventType = data.eventType;
    this.description = data.description;
    this.timestamp = new Date(data.timestamp);
    this.ipAddress = data.ipAddress;
    this.success = data.success;
    this.severity = data.severity;
  }

  get isCritical(): boolean {
    return this.severity.toLowerCase() === 'critical';
  }

  get isWarning(): boolean {
    return this.severity.toLowerCase() === 'warning';
  }

  get timeAgo(): string {
    const now = new Date();
    const diff = now.getTime() - this.timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  get location(): string {
    return this.ipAddress || 'Unknown';
  }

  get relativeTime(): string {
    return this.timeAgo;
  }
}

export interface FailedLoginStatsData {
  last24Hours: number;
  last7Days: number;
  last30Days: number;
  mostRecentAttempt?: string | null;
  suspiciousActivity: boolean;
  suspiciousIps: string[];
}

export class FailedLoginStats {
  public readonly last24Hours: number;
  public readonly last7Days: number;
  public readonly last30Days: number;
  public readonly mostRecentAttempt?: Date | null;
  public readonly suspiciousActivity: boolean;
  public readonly suspiciousIps: string[];

  constructor(data: FailedLoginStatsData) {
    this.last24Hours = data.last24Hours;
    this.last7Days = data.last7Days;
    this.last30Days = data.last30Days;
    this.mostRecentAttempt = data.mostRecentAttempt ? new Date(data.mostRecentAttempt) : null;
    this.suspiciousActivity = data.suspiciousActivity;
    this.suspiciousIps = data.suspiciousIps;
  }

  get hasSuspiciousActivity(): boolean {
    return this.suspiciousActivity || this.last24Hours > 5;
  }
}

export interface SecurityDashboardData {
  securityScore: number;
  securityLevel: string;
  twoFactorStats: TwoFactorStatsData;
  backupCodesStats: BackupCodesStatsData;
  recentEvents: SecurityEventData[];
  failedLoginStats: FailedLoginStatsData;
  recommendations: string[];
  lastAuditDate: string;
}

export class SecurityDashboard {
  public readonly securityScore: number;
  public readonly securityLevel: string;
  public readonly twoFactorStats: TwoFactorStats;
  public readonly backupCodesStats: BackupCodesStats;
  public readonly recentEvents: SecurityEvent[];
  public readonly failedLoginStats: FailedLoginStats;
  public readonly recommendations: string[];
  public readonly lastAuditDate: Date;

  constructor(data: SecurityDashboardData) {
    this.securityScore = data.securityScore;
    this.securityLevel = data.securityLevel;
    this.twoFactorStats = new TwoFactorStats(data.twoFactorStats);
    this.backupCodesStats = new BackupCodesStats(data.backupCodesStats);
    this.recentEvents = data.recentEvents.map(e => new SecurityEvent(e));
    this.failedLoginStats = new FailedLoginStats(data.failedLoginStats);
    this.recommendations = data.recommendations;
    this.lastAuditDate = new Date(data.lastAuditDate);
  }

  get isSecure(): boolean {
    return this.securityScore >= 80;
  }

  get needsAttention(): boolean {
    return this.securityScore < 60 || this.recommendations.length > 3;
  }

  get scoreColor(): string {
    if (this.securityScore >= 80) return 'green';
    if (this.securityScore >= 60) return 'yellow';
    return 'red';
  }

  // Convenience getters for UI
  get is2FAEnabled(): boolean {
    return this.twoFactorStats.isEnabled;
  }

  get hasBackupCodes(): boolean {
    return this.backupCodesStats.remainingCodes > 0;
  }

  get backupCodesRemaining(): number {
    return this.backupCodesStats.remainingCodes;
  }

  get scoreLevel(): string {
    return this.securityLevel;
  }

  get failedLoginAttempts(): number {
    return this.failedLoginStats.last24Hours;
  }

  get daysSincePasswordChange(): number {
    // This should come from profile, not security dashboard
    // Return 0 as placeholder
    return 0;
  }

  get passwordChangeNeeded(): boolean {
    return this.recommendations.some(r => r.toLowerCase().includes('password'));
  }

  get highPriorityRecommendations(): string[] {
    return this.recommendations;
  }
}
