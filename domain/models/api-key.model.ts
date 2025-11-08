/**
 * API Key Domain Model
 * 
 * Represents API keys for company authentication.
 */

export interface ApiKeyData {
  id: string; // Encrypted GUID
  companyId: string; // Encrypted GUID
  keyPrefix: string; // First 8 characters of the key (for display)
  keyHash: string; // Hashed key (never shown)
  name: string; // User-friendly name for the key
  description?: string;
  isActive: boolean;
  lastUsedAt?: string; // ISO date string
  expiresAt?: string; // ISO date string
  createdAt: string;
  updatedAt?: string;
}

export class ApiKey {
  public readonly id: string;
  public readonly companyId: string;
  public readonly keyPrefix: string;
  public readonly keyHash: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly isActive: boolean;
  public readonly lastUsedAt?: string;
  public readonly expiresAt?: string;
  public readonly createdAt: string;
  public readonly updatedAt?: string;

  constructor(data: ApiKeyData) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.keyPrefix = data.keyPrefix;
    this.keyHash = data.keyHash;
    this.name = data.name;
    this.description = data.description;
    this.isActive = data.isActive;
    this.lastUsedAt = data.lastUsedAt;
    this.expiresAt = data.expiresAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Get display name
   */
  get displayName(): string {
    return this.name;
  }

  /**
   * Check if key is expired
   */
  get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date(this.expiresAt) < new Date();
  }

  /**
   * Get masked key for display (e.g., "sk_live_1234...")
   */
  get maskedKey(): string {
    return `${this.keyPrefix}...`;
  }

  /**
   * Create a copy with updated data
   */
  update(updates: Partial<ApiKeyData>): ApiKey {
    return new ApiKey({
      ...this,
      ...updates,
    });
  }
}

export interface CreateApiKeyRequestData {
  companyId: string;
  name: string;
  description?: string;
  expiresAt?: string; // ISO date string
}

export class CreateApiKeyRequest {
  public readonly companyId: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly expiresAt?: string;

  constructor(data: CreateApiKeyRequestData) {
    this.companyId = data.companyId;
    this.name = data.name;
    this.description = data.description;
    this.expiresAt = data.expiresAt;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.companyId && this.name && this.name.trim().length > 0);
  }
}

/**
 * Response when creating an API key - includes the full key (shown only once!)
 */
export interface CreateApiKeyResponseData {
  apiKey: ApiKey;
  fullKey: string; // The complete API key - ONLY shown once during creation!
}

export class CreateApiKeyResponse {
  public readonly apiKey: ApiKey;
  public readonly fullKey: string;

  constructor(data: CreateApiKeyResponseData) {
    this.apiKey = data.apiKey;
    this.fullKey = data.fullKey;
  }
}

export interface UpdateApiKeyRequestData {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  expiresAt?: string;
}

export class UpdateApiKeyRequest {
  public readonly id: string;
  public readonly name?: string;
  public readonly description?: string;
  public readonly isActive?: boolean;
  public readonly expiresAt?: string;

  constructor(data: UpdateApiKeyRequestData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.isActive = data.isActive;
    this.expiresAt = data.expiresAt;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.id && (this.name === undefined || this.name.trim().length > 0));
  }
}

/**
 * Response when regenerating an API key - includes the new full key
 */
export interface RegenerateApiKeyResponseData {
  apiKey: ApiKey;
  fullKey: string; // The new complete API key - ONLY shown once!
}

export class RegenerateApiKeyResponse {
  public readonly apiKey: ApiKey;
  public readonly fullKey: string;

  constructor(data: RegenerateApiKeyResponseData) {
    this.apiKey = data.apiKey;
    this.fullKey = data.fullKey;
  }
}

