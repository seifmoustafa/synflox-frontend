/**
 * Account Profile Domain Models
 * Based on backend ProfileDto.cs
 */

import { getFullProfilePictureUrl } from "@/lib/url-helpers";

export enum Gender {
  Male = 0,
  Female = 1,
  Other = 2,
  PreferNotToSay = 3
}

// ============================================
// PROFILE DATA
// ============================================

export interface ProfileData {
  // Basic Information
  id: string;
  username: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  gender?: Gender | null;
  dateOfBirth?: string | null; // ISO date string
  bio?: string | null;

  // Profile Picture
  profilePictureUrl?: string | null;

  // Professional Information
  jobTitle?: string | null;
  department?: string | null;
  location?: string | null;

  // Preferences
  preferredLanguage?: string | null;
  timezone?: string | null;
  themePreference?: string | null;
  dateFormat?: string | null;
  timeFormat?: string | null;

  // Social & Contact
  linkedInUrl?: string | null;
  twitterUrl?: string | null;
  backupEmail?: string | null;

  // Security & Activity
  lastLoginAt?: string | null; // ISO date string
  lastPasswordChangeAt?: string | null; // ISO date string
  loginCount: number;
  isTwoFactorEnabled: boolean;

  // Notification Preferences
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  companyExpiryNotifications: boolean;
  subscriptionExpiryNotifications: boolean;
  systemAlertsNotifications: boolean;

  // Admin Type
  adminTypeId: string;
  adminTypeName?: string | null;

  // Audit
  createdTimestamp: string; // ISO date string
  updatedTimestamp: string; // ISO date string
}

export class Profile {
  public readonly id: string;
  public readonly username: string;
  public readonly email?: string | null;
  public readonly firstName?: string | null;
  public readonly lastName?: string | null;
  public readonly phoneNumber?: string | null;
  public readonly gender?: Gender | null;
  public readonly dateOfBirth?: Date | null;
  public readonly bio?: string | null;
  public readonly profilePictureUrl?: string | null;
  public readonly jobTitle?: string | null;
  public readonly department?: string | null;
  public readonly location?: string | null;
  public readonly preferredLanguage?: string | null;
  public readonly timezone?: string | null;
  public readonly themePreference?: string | null;
  public readonly dateFormat?: string | null;
  public readonly timeFormat?: string | null;
  public readonly linkedInUrl?: string | null;
  public readonly twitterUrl?: string | null;
  public readonly backupEmail?: string | null;
  public readonly lastLoginAt?: Date | null;
  public readonly lastPasswordChangeAt?: Date | null;
  public readonly loginCount: number;
  public readonly isTwoFactorEnabled: boolean;
  public readonly emailNotificationsEnabled: boolean;
  public readonly pushNotificationsEnabled: boolean;
  public readonly companyExpiryNotifications: boolean;
  public readonly subscriptionExpiryNotifications: boolean;
  public readonly systemAlertsNotifications: boolean;
  public readonly adminTypeId: string;
  public readonly adminTypeName?: string | null;
  public readonly createdTimestamp: Date;
  public readonly updatedTimestamp: Date;

  constructor(data: ProfileData) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phoneNumber = data.phoneNumber;
    this.gender = data.gender;
    this.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    this.bio = data.bio;
    this.profilePictureUrl = data.profilePictureUrl;
    this.jobTitle = data.jobTitle;
    this.department = data.department;
    this.location = data.location;
    this.preferredLanguage = data.preferredLanguage;
    this.timezone = data.timezone;
    this.themePreference = data.themePreference;
    this.dateFormat = data.dateFormat;
    this.timeFormat = data.timeFormat;
    this.linkedInUrl = data.linkedInUrl;
    this.twitterUrl = data.twitterUrl;
    this.backupEmail = data.backupEmail;
    this.lastLoginAt = data.lastLoginAt ? new Date(data.lastLoginAt) : null;
    this.lastPasswordChangeAt = data.lastPasswordChangeAt ? new Date(data.lastPasswordChangeAt) : null;
    this.loginCount = data.loginCount;
    this.isTwoFactorEnabled = data.isTwoFactorEnabled;
    this.emailNotificationsEnabled = data.emailNotificationsEnabled;
    this.pushNotificationsEnabled = data.pushNotificationsEnabled;
    this.companyExpiryNotifications = data.companyExpiryNotifications;
    this.subscriptionExpiryNotifications = data.subscriptionExpiryNotifications;
    this.systemAlertsNotifications = data.systemAlertsNotifications;
    this.adminTypeId = data.adminTypeId;
    this.adminTypeName = data.adminTypeName;
    this.createdTimestamp = new Date(data.createdTimestamp);
    this.updatedTimestamp = new Date(data.updatedTimestamp);
  }

  get fullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.firstName || this.lastName || this.username;
  }

  get displayName(): string {
    return this.fullName;
  }

  get hasProfilePicture(): boolean {
    return !!this.profilePictureUrl;
  }

  /**
   * Get the full URL for the profile picture
   * Converts relative path like "/profile/profile_username.jpg"
   * to full URL like "http://localhost:5035/profile/profile_username.jpg"
   */
  get fullProfilePictureUrl(): string | null {
    return getFullProfilePictureUrl(this.profilePictureUrl);
  }

  get daysSinceCreation(): number {
    const now = new Date();
    const diff = now.getTime() - this.createdTimestamp.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  get daysSinceLastPasswordChange(): number {
    if (!this.lastPasswordChangeAt) return 999;
    const now = new Date();
    const diff = now.getTime() - this.lastPasswordChangeAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  get isSecure(): boolean {
    return this.isTwoFactorEnabled && this.daysSinceLastPasswordChange < 90;
  }
}

// ============================================
// REQUEST MODELS
// ============================================

export interface UpdateProfileRequestData {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  gender?: Gender | null;
  dateOfBirth?: string | null;
  bio?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  location?: string | null;
  linkedInUrl?: string | null;
  twitterUrl?: string | null;
  backupEmail?: string | null;
}

export class UpdateProfileRequest {
  public readonly firstName?: string | null;
  public readonly lastName?: string | null;
  public readonly email?: string | null;
  public readonly phoneNumber?: string | null;
  public readonly gender?: Gender | null;
  public readonly dateOfBirth?: string | null;
  public readonly bio?: string | null;
  public readonly jobTitle?: string | null;
  public readonly department?: string | null;
  public readonly location?: string | null;
  public readonly linkedInUrl?: string | null;
  public readonly twitterUrl?: string | null;
  public readonly backupEmail?: string | null;

  constructor(data: UpdateProfileRequestData) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phoneNumber = data.phoneNumber;
    this.gender = data.gender;
    this.dateOfBirth = data.dateOfBirth;
    this.bio = data.bio;
    this.jobTitle = data.jobTitle;
    this.department = data.department;
    this.location = data.location;
    this.linkedInUrl = data.linkedInUrl;
    this.twitterUrl = data.twitterUrl;
    this.backupEmail = data.backupEmail;
  }

  get isValid(): boolean {
    return true; // All fields are optional
  }
}

export interface UpdatePreferencesRequestData {
  preferredLanguage?: string | null;
  timezone?: string | null;
  themePreference?: string | null;
  dateFormat?: string | null;
  timeFormat?: string | null;
}

export class UpdatePreferencesRequest {
  public readonly preferredLanguage?: string | null;
  public readonly timezone?: string | null;
  public readonly themePreference?: string | null;
  public readonly dateFormat?: string | null;
  public readonly timeFormat?: string | null;

  constructor(data: UpdatePreferencesRequestData) {
    this.preferredLanguage = data.preferredLanguage;
    this.timezone = data.timezone;
    this.themePreference = data.themePreference;
    this.dateFormat = data.dateFormat;
    this.timeFormat = data.timeFormat;
  }

  get isValid(): boolean {
    return true;
  }
}

export interface UpdateNotificationPreferencesRequestData {
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  companyExpiryNotifications: boolean;
  subscriptionExpiryNotifications: boolean;
  systemAlertsNotifications: boolean;
}

export class UpdateNotificationPreferencesRequest {
  public readonly emailNotificationsEnabled: boolean;
  public readonly pushNotificationsEnabled: boolean;
  public readonly companyExpiryNotifications: boolean;
  public readonly subscriptionExpiryNotifications: boolean;
  public readonly systemAlertsNotifications: boolean;

  constructor(data: UpdateNotificationPreferencesRequestData) {
    this.emailNotificationsEnabled = data.emailNotificationsEnabled;
    this.pushNotificationsEnabled = data.pushNotificationsEnabled;
    this.companyExpiryNotifications = data.companyExpiryNotifications;
    this.subscriptionExpiryNotifications = data.subscriptionExpiryNotifications;
    this.systemAlertsNotifications = data.systemAlertsNotifications;
  }

  get isValid(): boolean {
    return true;
  }
}

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
    return this.currentPassword.length >= 6 && this.newPassword.length >= 6;
  }
}

export interface ProfileStatisticsData {
  totalLogins: number;
  lastLoginAt?: string | null;
  daysSinceCreation: number;
  daysSinceLastPasswordChange: number;
  companiesManaged: number;
  subscriptionsManaged: number;
  adminsCreated: number;
}

export class ProfileStatistics {
  public readonly totalLogins: number;
  public readonly lastLoginAt?: Date | null;
  public readonly daysSinceCreation: number;
  public readonly daysSinceLastPasswordChange: number;
  public readonly companiesManaged: number;
  public readonly subscriptionsManaged: number;
  public readonly adminsCreated: number;

  constructor(data: ProfileStatisticsData) {
    this.totalLogins = data.totalLogins;
    this.lastLoginAt = data.lastLoginAt ? new Date(data.lastLoginAt) : null;
    this.daysSinceCreation = data.daysSinceCreation;
    this.daysSinceLastPasswordChange = data.daysSinceLastPasswordChange;
    this.companiesManaged = data.companiesManaged;
    this.subscriptionsManaged = data.subscriptionsManaged;
    this.adminsCreated = data.adminsCreated;
  }
}
