/**
 * Login Attempt Domain Model
 * 
 * Represents login attempt tracking data.
 */

export enum LoginAttemptStatus {
  Success = 1,
  Failed = 2,
  Blocked = 3,
}

export interface LoginAttemptData {
  id: string; // Encrypted GUID
  username: string;
  status: LoginAttemptStatus;
  ipAddress?: string;
  userAgent?: string;
  failureReason?: string;
  attemptedAt: string; // ISO date string
  userId?: string; // Encrypted GUID (if successful)
}

export class LoginAttempt {
  public readonly id: string;
  public readonly username: string;
  public readonly status: LoginAttemptStatus;
  public readonly ipAddress?: string;
  public readonly userAgent?: string;
  public readonly failureReason?: string;
  public readonly attemptedAt: string;
  public readonly userId?: string;

  constructor(data: LoginAttemptData) {
    this.id = data.id;
    this.username = data.username;
    this.status = data.status;
    this.ipAddress = data.ipAddress;
    this.userAgent = data.userAgent;
    this.failureReason = data.failureReason;
    this.attemptedAt = data.attemptedAt;
    this.userId = data.userId;
  }

  /**
   * Get display name
   */
  get displayName(): string {
    return `${this.username} - ${this.status === LoginAttemptStatus.Success ? 'Success' : 'Failed'}`;
  }

  /**
   * Check if attempt was successful
   */
  get isSuccess(): boolean {
    return this.status === LoginAttemptStatus.Success;
  }

  /**
   * Check if attempt was blocked
   */
  get isBlocked(): boolean {
    return this.status === LoginAttemptStatus.Blocked;
  }
}

