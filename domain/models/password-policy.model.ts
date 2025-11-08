/**
 * Password Policy Domain Model
 * 
 * Represents password policy configuration.
 */

export interface PasswordPolicyData {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialCharacters: boolean;
  maxAgeDays?: number; // Password expiration in days
  preventReuseCount?: number; // Number of previous passwords to prevent reuse
  lockoutAttempts?: number; // Failed attempts before lockout
  lockoutDurationMinutes?: number; // Lockout duration
}

export class PasswordPolicy {
  public readonly minLength: number;
  public readonly requireUppercase: boolean;
  public readonly requireLowercase: boolean;
  public readonly requireNumbers: boolean;
  public readonly requireSpecialCharacters: boolean;
  public readonly maxAgeDays?: number;
  public readonly preventReuseCount?: number;
  public readonly lockoutAttempts?: number;
  public readonly lockoutDurationMinutes?: number;

  constructor(data: PasswordPolicyData) {
    this.minLength = data.minLength;
    this.requireUppercase = data.requireUppercase;
    this.requireLowercase = data.requireLowercase;
    this.requireNumbers = data.requireNumbers;
    this.requireSpecialCharacters = data.requireSpecialCharacters;
    this.maxAgeDays = data.maxAgeDays;
    this.preventReuseCount = data.preventReuseCount;
    this.lockoutAttempts = data.lockoutAttempts;
    this.lockoutDurationMinutes = data.lockoutDurationMinutes;
  }

  /**
   * Validate password against policy
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.minLength) {
      errors.push(`Password must be at least ${this.minLength} characters`);
    }

    if (this.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (this.requireLowercase && !/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (this.requireNumbers && !/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (this.requireSpecialCharacters && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a copy with updated data
   */
  update(updates: Partial<PasswordPolicyData>): PasswordPolicy {
    return new PasswordPolicy({
      ...this,
      ...updates,
    });
  }
}

export interface UpdatePasswordPolicyRequestData {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialCharacters?: boolean;
  maxAgeDays?: number;
  preventReuseCount?: number;
  lockoutAttempts?: number;
  lockoutDurationMinutes?: number;
}

export class UpdatePasswordPolicyRequest {
  public readonly minLength?: number;
  public readonly requireUppercase?: boolean;
  public readonly requireLowercase?: boolean;
  public readonly requireNumbers?: boolean;
  public readonly requireSpecialCharacters?: boolean;
  public readonly maxAgeDays?: number;
  public readonly preventReuseCount?: number;
  public readonly lockoutAttempts?: number;
  public readonly lockoutDurationMinutes?: number;

  constructor(data: UpdatePasswordPolicyRequestData) {
    this.minLength = data.minLength;
    this.requireUppercase = data.requireUppercase;
    this.requireLowercase = data.requireLowercase;
    this.requireNumbers = data.requireNumbers;
    this.requireSpecialCharacters = data.requireSpecialCharacters;
    this.maxAgeDays = data.maxAgeDays;
    this.preventReuseCount = data.preventReuseCount;
    this.lockoutAttempts = data.lockoutAttempts;
    this.lockoutDurationMinutes = data.lockoutDurationMinutes;
  }
}

