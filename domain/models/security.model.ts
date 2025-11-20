/**
 * SYNFLOX Security Domain Models
 * Handles password management, 2FA, backup codes, and security analytics
 */

// ==================== PASSWORD MANAGEMENT ====================

export interface ChangePasswordRequestData {
  currentPassword: string;
  newPassword: string;
}

export class ChangePasswordRequest {
  public readonly currentPassword: string;
  public readonly newPassword: string;

  constructor(data: ChangePasswordRequestData) {
    this.currentPassword = data.currentPassword;
    this.newPassword = data.newPassword;
  }

  get isValid(): boolean {
    return (
      this.currentPassword.length > 0 &&
      this.newPassword.length >= 8 &&
      this.hasUpperCase &&
      this.hasLowerCase &&
      this.hasDigit &&
      this.hasSpecialChar
    );
  }

  get hasUpperCase(): boolean {
    return /[A-Z]/.test(this.newPassword);
  }

  get hasLowerCase(): boolean {
    return /[a-z]/.test(this.newPassword);
  }

  get hasDigit(): boolean {
    return /\d/.test(this.newPassword);
  }

  get hasSpecialChar(): boolean {
    return /[@$!%*?&#]/.test(this.newPassword);
  }

  get passwordStrength(): 'weak' | 'medium' | 'strong' {
    let score = 0;
    if (this.newPassword.length >= 8) score++;
    if (this.newPassword.length >= 12) score++;
    if (this.hasUpperCase) score++;
    if (this.hasLowerCase) score++;
    if (this.hasDigit) score++;
    if (this.hasSpecialChar) score++;

    if (score <= 3) return 'weak';
    if (score <= 5) return 'medium';
    return 'strong';
  }
}

export interface ChangePasswordWith2FARequestData {
  currentPassword: string;
  newPassword: string;
  twoFactorCode?: string;
  backupCode?: string;
}

export class ChangePasswordWith2FARequest {
  public readonly currentPassword: string;
  public readonly newPassword: string;
  public readonly twoFactorCode?: string;
  public readonly backupCode?: string;

  constructor(data: ChangePasswordWith2FARequestData) {
    this.currentPassword = data.currentPassword;
    this.newPassword = data.newPassword;
    this.twoFactorCode = data.twoFactorCode?.replace(/\s/g, '');
    this.backupCode = data.backupCode?.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  get isValid(): boolean {
    const passwordValid = 
      this.currentPassword.length > 0 &&
      this.newPassword.length >= 8;
    
    const verificationValid = 
      (!!this.twoFactorCode && this.twoFactorCode.length === 6) ||
      (!!this.backupCode && this.backupCode.length === 8);

    return passwordValid && verificationValid;
  }

  get passwordStrength(): 'weak' | 'medium' | 'strong' {
    const password = this.newPassword;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&#]/.test(password)) score++;

    if (score <= 3) return 'weak';
    if (score <= 5) return 'medium';
    return 'strong';
  }
}

// ==================== TWO-FACTOR AUTHENTICATION ====================

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
    // Backend already includes 'data:image/png;base64,' prefix
    if (this.qrCodeBase64.startsWith('data:')) {
      return this.qrCodeBase64;
    }
    return `data:image/png;base64,${this.qrCodeBase64}`;
  }

  get formattedManualKey(): string {
    // Format: XXXX XXXX XXXX XXXX
    return this.manualEntryKey.match(/.{1,4}/g)?.join(' ') || this.manualEntryKey;
  }
}

export interface Enable2FARequestData {
  verificationCode: string;
}

export class Enable2FARequest {
  public readonly verificationCode: string;

  constructor(data: Enable2FARequestData) {
    this.verificationCode = data.verificationCode.replace(/\s/g, '');
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
    return this.currentPassword.length > 0;
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
    return this.currentPassword.length > 0;
  }
}

// ==================== BACKUP CODES ====================

export interface GenerateBackupCodesRequestData {
  currentPassword: string;
}

export class GenerateBackupCodesRequest {
  public readonly currentPassword: string;

  constructor(data: GenerateBackupCodesRequestData) {
    this.currentPassword = data.currentPassword;
  }

  get isValid(): boolean {
    return this.currentPassword.length > 0;
  }
}

export interface GenerateBackupCodesResponseData {
  codes: string[];
  message: string;
}

export class GenerateBackupCodesResponse {
  public readonly codes: string[];
  public readonly message: string;

  constructor(data: GenerateBackupCodesResponseData) {
    this.codes = data.codes;
    this.message = data.message;
  }

  get formattedCodes(): string[] {
    // Format: ABCD-1234
    return this.codes.map(code => {
      if (code.length === 8) {
        return `${code.slice(0, 4)}-${code.slice(4)}`;
      }
      return code;
    });
  }

  get codesAsText(): string {
    return this.formattedCodes.join('\n');
  }

  get totalCount(): number {
    return this.codes.length;
  }
}

export interface BackupCodesStatusData {
  remainingCodes: number;
  totalCodes: number;
  expiredCodes: number;
  nextExpiryDate: string | null;
  daysUntilExpiry: number | null;
  hasBackupCodes: boolean;
  lowCodesWarning: boolean;
  expiryWarning: boolean;
  needsRegeneration: boolean;
}

export class BackupCodesStatus {
  public readonly remainingCodes: number;
  public readonly totalCodes: number;
  public readonly expiredCodes: number;
  public readonly nextExpiryDate: Date | null;
  public readonly daysUntilExpiry: number | null;
  public readonly hasBackupCodes: boolean;
  public readonly lowCodesWarning: boolean;
  public readonly expiryWarning: boolean;
  public readonly needsRegeneration: boolean;

  constructor(data: BackupCodesStatusData) {
    this.remainingCodes = data.remainingCodes;
    this.totalCodes = data.totalCodes;
    this.expiredCodes = data.expiredCodes;
    this.nextExpiryDate = data.nextExpiryDate ? new Date(data.nextExpiryDate) : null;
    this.daysUntilExpiry = data.daysUntilExpiry;
    this.hasBackupCodes = data.hasBackupCodes;
    this.lowCodesWarning = data.lowCodesWarning;
    this.expiryWarning = data.expiryWarning;
    this.needsRegeneration = data.needsRegeneration;
  }

  get usedCodes(): number {
    return this.totalCodes - this.remainingCodes - this.expiredCodes;
  }

  get statusLevel(): 'success' | 'warning' | 'danger' {
    if (this.needsRegeneration) return 'danger';
    if (this.lowCodesWarning || this.expiryWarning) return 'warning';
    return 'success';
  }

  get statusMessage(): string {
    if (this.needsRegeneration) {
      return 'All backup codes used - Generate new codes immediately';
    }
    if (this.lowCodesWarning) {
      return `Only ${this.remainingCodes} backup codes remaining`;
    }
    if (this.expiryWarning) {
      return `Backup codes expire in ${this.daysUntilExpiry} days`;
    }
    return `${this.remainingCodes} of ${this.totalCodes} backup codes available`;
  }

  get progressPercentage(): number {
    if (this.totalCodes === 0) return 0;
    return (this.remainingCodes / this.totalCodes) * 100;
  }
}

export interface ExportBackupCodesRequestData {
  codes: string[];
  format: 'json' | 'txt' | 'text' | 'pdf' | 'docx' | 'doc';
}

export class ExportBackupCodesRequest {
  public readonly codes: string[];
  public readonly format: string;

  constructor(data: ExportBackupCodesRequestData) {
    this.codes = data.codes;
    this.format = data.format.toLowerCase();
  }

  get isValid(): boolean {
    const validFormats = ['json', 'txt', 'text', 'pdf', 'docx', 'doc'];
    return this.codes.length > 0 && validFormats.includes(this.format);
  }
}

export interface ExportBackupCodesResponseData {
  fileContent: string; // Now contains the URL from backend
  contentType: string;
  fileName: string;
  unusedCodesCount: number;
  format: string;
  exportedAt: string;
  message?: string;
}

export class ExportBackupCodesResponse {
  public readonly fileContent: string; // URL from backend
  public readonly contentType: string;
  public readonly fileName: string;
  public readonly unusedCodesCount: number;
  public readonly format: string;
  public readonly exportedAt: Date;
  public readonly message?: string;

  constructor(data: ExportBackupCodesResponseData) {
    this.fileContent = data.fileContent;
    this.contentType = data.contentType;
    this.fileName = data.fileName;
    this.unusedCodesCount = data.unusedCodesCount;
    this.format = data.format;
    this.exportedAt = new Date(data.exportedAt);
    this.message = data.message;
  }

  get downloadUrl(): string {
    // Backend returns URL directly (e.g., http://localhost:5035/pdfs/...)
    // If it starts with http, use it as-is, otherwise treat as base64
    if (this.fileContent.startsWith('http://') || this.fileContent.startsWith('https://')) {
      return this.fileContent;
    }
    return `data:${this.contentType};base64,${this.fileContent}`;
  }

  get fileExtension(): string {
    return this.fileName.split('.').pop() || this.format;
  }
}

// ==================== SECURITY DASHBOARD ====================

export interface SecurityEventData {
  eventType: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export class SecurityEvent {
  public readonly eventType: string;
  public readonly description: string;
  public readonly ipAddress: string;
  public readonly userAgent: string;
  public readonly location: string;
  public readonly timestamp: Date;
  public readonly severity: 'low' | 'medium' | 'high';

  constructor(data: SecurityEventData) {
    this.eventType = data.eventType;
    this.description = data.description;
    this.ipAddress = data.ipAddress;
    this.userAgent = data.userAgent;
    this.location = data.location;
    this.timestamp = new Date(data.timestamp);
    this.severity = data.severity;
  }

  get severityColor(): string {
    switch (this.severity) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
    }
  }

  get relativeTime(): string {
    const now = new Date();
    const diff = now.getTime() - this.timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}

export interface SecurityRecommendationData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  action: string;
}

export class SecurityRecommendation {
  public readonly title: string;
  public readonly description: string;
  public readonly priority: 'low' | 'medium' | 'high';
  public readonly action: string;

  constructor(data: SecurityRecommendationData) {
    this.title = data.title;
    this.description = data.description;
    this.priority = data.priority;
    this.action = data.action;
  }

  get priorityColor(): string {
    switch (this.priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'blue';
    }
  }
}

export interface SecurityDashboardData {
  securityScore: number;
  is2FAEnabled: boolean;
  hasBackupCodes: boolean;
  backupCodesRemaining: number;
  lastPasswordChange: string | null;
  daysSincePasswordChange: number;
  recentEvents: SecurityEventData[];
  failedLoginAttempts: number;
  recommendations: SecurityRecommendationData[];
  trustedDevicesCount: number;
  activeSessionsCount: number;
}

export class SecurityDashboard {
  public readonly securityScore: number;
  public readonly is2FAEnabled: boolean;
  public readonly hasBackupCodes: boolean;
  public readonly backupCodesRemaining: number;
  public readonly lastPasswordChange: Date | null;
  public readonly daysSincePasswordChange: number;
  public readonly recentEvents: SecurityEvent[];
  public readonly failedLoginAttempts: number;
  public readonly recommendations: SecurityRecommendation[];
  public readonly trustedDevicesCount: number;
  public readonly activeSessionsCount: number;

  constructor(data: SecurityDashboardData) {
    this.securityScore = data.securityScore;
    this.is2FAEnabled = data.is2FAEnabled;
    this.hasBackupCodes = data.hasBackupCodes;
    this.backupCodesRemaining = data.backupCodesRemaining;
    this.lastPasswordChange = data.lastPasswordChange ? new Date(data.lastPasswordChange) : null;
    this.daysSincePasswordChange = data.daysSincePasswordChange;
    this.recentEvents = data.recentEvents.map(e => new SecurityEvent(e));
    this.failedLoginAttempts = data.failedLoginAttempts;
    this.recommendations = data.recommendations.map(r => new SecurityRecommendation(r));
    this.trustedDevicesCount = data.trustedDevicesCount;
    this.activeSessionsCount = data.activeSessionsCount;
  }

  get scoreLevel(): 'poor' | 'fair' | 'good' | 'excellent' {
    if (this.securityScore < 40) return 'poor';
    if (this.securityScore < 60) return 'fair';
    if (this.securityScore < 80) return 'good';
    return 'excellent';
  }

  get scoreColor(): string {
    switch (this.scoreLevel) {
      case 'poor': return 'red';
      case 'fair': return 'orange';
      case 'good': return 'blue';
      case 'excellent': return 'green';
    }
  }

  get needsAttention(): boolean {
    return this.securityScore < 60 || !this.is2FAEnabled || this.failedLoginAttempts > 5;
  }

  get highPriorityRecommendations(): SecurityRecommendation[] {
    return this.recommendations.filter(r => r.priority === 'high');
  }

  get passwordChangeNeeded(): boolean {
    return this.daysSincePasswordChange > 90;
  }
}
