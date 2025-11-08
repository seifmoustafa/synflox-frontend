/**
 * Search Domain Model
 * 
 * Represents global search functionality.
 */

export enum SearchEntityType {
  Company = 1,
  Admin = 2,
  SubscriptionPlan = 3,
  Project = 4,
  Module = 5,
  CompanyGroup = 6,
  ApiKey = 7,
  Webhook = 8,
}

export interface SearchResultData {
  id: string; // Encrypted GUID
  entityType: SearchEntityType;
  title: string;
  description?: string;
  url: string;
  metadata?: Record<string, any>;
  relevanceScore?: number;
}

export class SearchResult {
  public readonly id: string;
  public readonly entityType: SearchEntityType;
  public readonly title: string;
  public readonly description?: string;
  public readonly url: string;
  public readonly metadata?: Record<string, any>;
  public readonly relevanceScore?: number;

  constructor(data: SearchResultData) {
    this.id = data.id;
    this.entityType = data.entityType;
    this.title = data.title;
    this.description = data.description;
    this.url = data.url;
    this.metadata = data.metadata;
    this.relevanceScore = data.relevanceScore;
  }

  /**
   * Get display name
   */
  get displayName(): string {
    return this.title;
  }
}

export interface SearchRequestData {
  query: string;
  entityTypes?: SearchEntityType[];
  limit?: number;
}

export class SearchRequest {
  public readonly query: string;
  public readonly entityTypes?: SearchEntityType[];
  public readonly limit?: number;

  constructor(data: SearchRequestData) {
    this.query = data.query;
    this.entityTypes = data.entityTypes;
    this.limit = data.limit || 20;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.query && this.query.trim().length > 0);
  }
}

export interface SearchSuggestionData {
  text: string;
  entityType?: SearchEntityType;
  count?: number;
}

export class SearchSuggestion {
  public readonly text: string;
  public readonly entityType?: SearchEntityType;
  public readonly count?: number;

  constructor(data: SearchSuggestionData) {
    this.text = data.text;
    this.entityType = data.entityType;
    this.count = data.count;
  }
}

