/**
 * Webhook Domain Model
 * 
 * Represents webhooks for event notifications.
 */

export enum WebhookEventType {
  CompanyActivated = 1,
  CompanySuspended = 2,
  CompanyResumed = 3,
  CompanyExpired = 4,
  CompanyExtended = 5,
  CompanyDeleted = 6,
  LicenseKeyGenerated = 7,
  TrialStarted = 8,
  TrialConverted = 9,
}

export enum WebhookDeliveryStatus {
  Pending = 1,
  Success = 2,
  Failed = 3,
  Retrying = 4,
}

export interface WebhookData {
  id: string; // Encrypted GUID
  companyId: string; // Encrypted GUID
  url: string;
  secret?: string; // Optional secret for signing
  eventTypes: WebhookEventType[]; // Array of event types
  isActive: boolean;
  retryCount: number;
  timeoutSeconds: number;
  lastDeliveryAt?: string; // ISO date string
  lastDeliveryStatus?: WebhookDeliveryStatus;
  createdAt: string;
  updatedAt?: string;
}

export class Webhook {
  public readonly id: string;
  public readonly companyId: string;
  public readonly url: string;
  public readonly secret?: string;
  public readonly eventTypes: WebhookEventType[];
  public readonly isActive: boolean;
  public readonly retryCount: number;
  public readonly timeoutSeconds: number;
  public readonly lastDeliveryAt?: string;
  public readonly lastDeliveryStatus?: WebhookDeliveryStatus;
  public readonly createdAt: string;
  public readonly updatedAt?: string;

  constructor(data: WebhookData) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.url = data.url;
    this.secret = data.secret;
    this.eventTypes = data.eventTypes || [];
    this.isActive = data.isActive;
    this.retryCount = data.retryCount ?? 3;
    this.timeoutSeconds = data.timeoutSeconds ?? 30;
    this.lastDeliveryAt = data.lastDeliveryAt;
    this.lastDeliveryStatus = data.lastDeliveryStatus;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Get display name
   */
  get displayName(): string {
    return this.url;
  }

  /**
   * Check if webhook has specific event type
   */
  hasEventType(eventType: WebhookEventType): boolean {
    return this.eventTypes.includes(eventType);
  }

  /**
   * Get formatted event types string
   */
  get eventTypesString(): string {
    return this.eventTypes.map(et => WebhookEventType[et]).join(", ");
  }

  /**
   * Create a copy with updated data
   */
  update(updates: Partial<WebhookData>): Webhook {
    return new Webhook({
      ...this,
      ...updates,
    });
  }
}

export interface WebhookDeliveryData {
  id: string; // Encrypted GUID
  webhookId: string; // Encrypted GUID
  eventType: WebhookEventType;
  payload: string; // JSON string
  responseCode?: number;
  responseBody?: string;
  status: WebhookDeliveryStatus;
  attemptedAt: string; // ISO date string
  deliveredAt?: string; // ISO date string
  errorMessage?: string;
  retryCount: number;
}

export class WebhookDelivery {
  public readonly id: string;
  public readonly webhookId: string;
  public readonly eventType: WebhookEventType;
  public readonly payload: string;
  public readonly responseCode?: number;
  public readonly responseBody?: string;
  public readonly status: WebhookDeliveryStatus;
  public readonly attemptedAt: string;
  public readonly deliveredAt?: string;
  public readonly errorMessage?: string;
  public readonly retryCount: number;

  constructor(data: WebhookDeliveryData) {
    this.id = data.id;
    this.webhookId = data.webhookId;
    this.eventType = data.eventType;
    this.payload = data.payload;
    this.responseCode = data.responseCode;
    this.responseBody = data.responseBody;
    this.status = data.status;
    this.attemptedAt = data.attemptedAt;
    this.deliveredAt = data.deliveredAt;
    this.errorMessage = data.errorMessage;
    this.retryCount = data.retryCount ?? 0;
  }

  /**
   * Get parsed payload
   */
  get parsedPayload(): any {
    try {
      return JSON.parse(this.payload);
    } catch {
      return null;
    }
  }

  /**
   * Check if delivery was successful
   */
  get isSuccess(): boolean {
    return this.status === WebhookDeliveryStatus.Success;
  }

  /**
   * Check if delivery failed
   */
  get isFailed(): boolean {
    return this.status === WebhookDeliveryStatus.Failed;
  }
}

export interface CreateWebhookRequestData {
  companyId: string;
  url: string;
  secret?: string;
  eventTypes: WebhookEventType[];
  isActive?: boolean;
  retryCount?: number;
  timeoutSeconds?: number;
}

export class CreateWebhookRequest {
  public readonly companyId: string;
  public readonly url: string;
  public readonly secret?: string;
  public readonly eventTypes: WebhookEventType[];
  public readonly isActive?: boolean;
  public readonly retryCount?: number;
  public readonly timeoutSeconds?: number;

  constructor(data: CreateWebhookRequestData) {
    this.companyId = data.companyId;
    this.url = data.url;
    this.secret = data.secret;
    this.eventTypes = data.eventTypes || [];
    this.isActive = data.isActive ?? true;
    this.retryCount = data.retryCount ?? 3;
    this.timeoutSeconds = data.timeoutSeconds ?? 30;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.companyId && this.url && this.url.trim().length > 0 && this.eventTypes.length > 0);
  }
}

export interface UpdateWebhookRequestData {
  id: string;
  url?: string;
  secret?: string;
  eventTypes?: WebhookEventType[];
  isActive?: boolean;
  retryCount?: number;
  timeoutSeconds?: number;
}

export class UpdateWebhookRequest {
  public readonly id: string;
  public readonly url?: string;
  public readonly secret?: string;
  public readonly eventTypes?: WebhookEventType[];
  public readonly isActive?: boolean;
  public readonly retryCount?: number;
  public readonly timeoutSeconds?: number;

  constructor(data: UpdateWebhookRequestData) {
    this.id = data.id;
    this.url = data.url;
    this.secret = data.secret;
    this.eventTypes = data.eventTypes;
    this.isActive = data.isActive;
    this.retryCount = data.retryCount;
    this.timeoutSeconds = data.timeoutSeconds;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.id && (this.url === undefined || this.url.trim().length > 0));
  }
}

