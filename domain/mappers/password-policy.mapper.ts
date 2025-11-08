/**
 * Password Policy Mappers
 * 
 * Handles conversion between password policy domain models and external data formats.
 */

import {
  PasswordPolicy,
  UpdatePasswordPolicyRequest,
  type PasswordPolicyData,
  type UpdatePasswordPolicyRequestData,
} from '../models/password-policy.model';

export class PasswordPolicyMapper {
  /**
   * Convert JSON/API response to PasswordPolicy domain model
   */
  static fromJson(json: any): PasswordPolicy {
    return new PasswordPolicy({
      minLength: json.minLength ?? 8,
      requireUppercase: json.requireUppercase ?? false,
      requireLowercase: json.requireLowercase ?? false,
      requireNumbers: json.requireNumbers ?? false,
      requireSpecialCharacters: json.requireSpecialCharacters ?? false,
      maxAgeDays: json.maxAgeDays,
      preventReuseCount: json.preventReuseCount,
      lockoutAttempts: json.lockoutAttempts,
      lockoutDurationMinutes: json.lockoutDurationMinutes,
    });
  }

  /**
   * Convert PasswordPolicy domain model to JSON for API requests
   */
  static toJson(policy: PasswordPolicy): any {
    return {
      minLength: policy.minLength,
      requireUppercase: policy.requireUppercase,
      requireLowercase: policy.requireLowercase,
      requireNumbers: policy.requireNumbers,
      requireSpecialCharacters: policy.requireSpecialCharacters,
      maxAgeDays: policy.maxAgeDays,
      preventReuseCount: policy.preventReuseCount,
      lockoutAttempts: policy.lockoutAttempts,
      lockoutDurationMinutes: policy.lockoutDurationMinutes,
    };
  }

  /**
   * Convert UpdatePasswordPolicyRequest domain model to JSON for API requests
   */
  static updateRequestToJson(request: UpdatePasswordPolicyRequest): any {
    const json: any = {};
    if (request.minLength !== undefined) json.minLength = request.minLength;
    if (request.requireUppercase !== undefined) json.requireUppercase = request.requireUppercase;
    if (request.requireLowercase !== undefined) json.requireLowercase = request.requireLowercase;
    if (request.requireNumbers !== undefined) json.requireNumbers = request.requireNumbers;
    if (request.requireSpecialCharacters !== undefined) json.requireSpecialCharacters = request.requireSpecialCharacters;
    if (request.maxAgeDays !== undefined) json.maxAgeDays = request.maxAgeDays;
    if (request.preventReuseCount !== undefined) json.preventReuseCount = request.preventReuseCount;
    if (request.lockoutAttempts !== undefined) json.lockoutAttempts = request.lockoutAttempts;
    if (request.lockoutDurationMinutes !== undefined) json.lockoutDurationMinutes = request.lockoutDurationMinutes;
    return json;
  }
}

