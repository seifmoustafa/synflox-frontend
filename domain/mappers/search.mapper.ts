/**
 * Search Mappers
 * 
 * Handles conversion between search domain models and external data formats.
 */

import {
  SearchResult,
  SearchSuggestion,
  SearchEntityType,
  type SearchResultData,
  type SearchSuggestionData,
} from '../models/search.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface SearchResponse {
  data: SearchResult[];
  pagination: PaginationInfo;
}

export interface SearchSuggestionsResponse {
  data: SearchSuggestion[];
}

export class SearchMapper {
  /**
   * Convert JSON/API response to SearchResult domain model
   */
  static resultFromJson(json: any): SearchResult {
    let metadata: Record<string, any> | undefined;
    if (json.metadata) {
      if (typeof json.metadata === 'string') {
        try {
          metadata = JSON.parse(json.metadata);
        } catch {
          metadata = {};
        }
      } else {
        metadata = json.metadata;
      }
    }

    return new SearchResult({
      id: json.id || '',
      entityType: typeof json.entityType === 'number' 
        ? json.entityType 
        : SearchEntityType[json.entityType as keyof typeof SearchEntityType] || SearchEntityType.Company,
      title: json.title || json.name || '',
      description: json.description,
      url: json.url || '',
      metadata,
      relevanceScore: json.relevanceScore,
    });
  }

  /**
   * Convert JSON/API response to SearchSuggestion domain model
   */
  static suggestionFromJson(json: any): SearchSuggestion {
    return new SearchSuggestion({
      text: json.text || json.suggestion || '',
      entityType: typeof json.entityType === 'number' 
        ? json.entityType 
        : json.entityType 
          ? SearchEntityType[json.entityType as keyof typeof SearchEntityType]
          : undefined,
      count: json.count,
    });
  }

  /**
   * Convert SearchRequest domain model to JSON for API requests
   */
  static requestToJson(request: any): any {
    const json: any = {
      query: request.query,
      limit: request.limit || 20,
    };
    if (request.entityTypes && request.entityTypes.length > 0) {
      json.entityTypes = request.entityTypes;
    }
    return json;
  }

  /**
   * Handle different API response formats and convert to SearchResponse
   */
  static handleApiResponse(response: any): SearchResponse {
    if (response && typeof response === 'object' && 'data' in response && 'pagination' in response) {
      if (Array.isArray(response.data)) {
        const pagination = response.pagination || {};
        return {
          data: response.data.map((item: any) => this.resultFromJson(item)),
          pagination: {
            itemsCount: pagination.itemsCount || 0,
            pageSize: pagination.pageSize || 10,
            page: pagination.currentPage || pagination.page || 1,
            pagesCount: pagination.pagesCount || 0,
          }
        };
      }
    }

    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data;
      if (Array.isArray(data)) {
        const pagination = response.pagination || {};
        return {
          data: data.map((item: any) => this.resultFromJson(item)),
          pagination: {
            itemsCount: pagination.itemsCount || pagination.totalItems || data.length,
            pageSize: pagination.pageSize || 10,
            page: pagination.currentPage || pagination.page || 1,
            pagesCount: pagination.pagesCount || pagination.totalPages || 1,
          }
        };
      }
      if ('results' in data || 'searchResults' in data) {
        const results = data.results || data.searchResults || [];
        const pagination = data.pagination || {};
        return {
          data: Array.isArray(results) 
            ? results.map((item: any) => this.resultFromJson(item))
            : [],
          pagination: {
            itemsCount: pagination.itemsCount || pagination.totalItems || 0,
            pageSize: pagination.pageSize || 10,
            page: pagination.currentPage || pagination.page || 1,
            pagesCount: pagination.pagesCount || pagination.totalPages || 0,
          }
        };
      }
    }

    if (Array.isArray(response)) {
      return {
        data: response.map((item: any) => this.resultFromJson(item)),
        pagination: {
          itemsCount: response.length,
          pageSize: response.length,
          page: 1,
          pagesCount: 1,
        }
      };
    }

    return {
      data: [],
      pagination: {
        itemsCount: 0,
        pageSize: 10,
        page: 1,
        pagesCount: 0,
      }
    };
  }

  /**
   * Handle suggestions response
   */
  static handleSuggestionsResponse(response: any): SearchSuggestionsResponse {
    const data = response?.data || response;
    if (Array.isArray(data)) {
      return {
        data: data.map((item: any) => this.suggestionFromJson(item)),
      };
    }
    if (data && typeof data === 'object' && 'suggestions' in data) {
      return {
        data: Array.isArray(data.suggestions) 
          ? data.suggestions.map((item: any) => this.suggestionFromJson(item))
          : [],
      };
    }
    return { data: [] };
  }
}

