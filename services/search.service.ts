/**
 * Search Service
 *
 * Handles Global Search operations with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  SearchResult,
  SearchSuggestion,
  SearchRequest,
  SearchMapper,
  type SearchResponse,
  type SearchSuggestionsResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface ISearchService {
  search(query: string, params?: {
    entityTypes?: number[];
    limit?: number;
  }): Promise<SearchResponse>;
  getSuggestions(query: string, limit?: number): Promise<SearchSuggestionsResponse>;
  getEntityTypes(): Promise<Array<{ value: number; label: string }>>;
  getSearchStats(): Promise<any>;
}

export class SearchService implements ISearchService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async search(query: string, params?: {
    entityTypes?: number[];
    limit?: number;
  }): Promise<SearchResponse> {
    try {
      const request = new SearchRequest({
        query,
        entityTypes: params?.entityTypes,
        limit: params?.limit,
      });
      const json = SearchMapper.requestToJson(request);
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.SEARCH_POST,
        json
      );
      return SearchMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async getSuggestions(query: string, limit?: number): Promise<SearchSuggestionsResponse> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.SEARCH_SUGGESTIONS,
        { query, limit: limit || 10 }
      );
      return SearchMapper.handleSuggestionsResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async getEntityTypes(): Promise<Array<{ value: number; label: string }>> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.SEARCH_ENTITY_TYPES
      );
      const data = response?.data || response;
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          value: typeof item.value === 'number' ? item.value : item.id,
          label: item.label || item.name || '',
        }));
      }
      return [];
    } catch (e) {
      throw e;
    }
  }

  async getSearchStats(): Promise<any> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.SEARCH_STATS
      );
      return response?.data || response;
    } catch (e) {
      throw e;
    }
  }
}

