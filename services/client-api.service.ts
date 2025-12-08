/**
 * Client API Service
 * Handles API calls for the Client Portal using Client Admin Tokens
 * Mirrors the admin ApiService but with client-specific authentication
 */

// Get API base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5035/api";

export interface IClientApiService {
  get<T>(endpoint: string, token: string, signal?: AbortSignal): Promise<T>;
  post<T>(endpoint: string, token: string, data?: any, signal?: AbortSignal): Promise<T>;
  put<T>(endpoint: string, token: string, data?: any, signal?: AbortSignal): Promise<T>;
  delete<T>(endpoint: string, token: string, signal?: AbortSignal): Promise<T>;
}

export class ClientApiService implements IClientApiService {
  private defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  private buildUrl(endpoint: string): string {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${normalizedEndpoint}`;
  }

  private getHeaders(token: string): Record<string, string> {
    return {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`,
    };
  }

  private unwrap<T>(json: any): T {
    // Handle ApiResponse wrapper from backend
    if (json && typeof json === "object" && "data" in json) {
      if ("pagination" in json && json.pagination !== null) {
        return { data: json.data, pagination: json.pagination } as T;
      }
      return json.data as T;
    }
    return json as T;
  }

  async get<T>(endpoint: string, token: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "GET",
      headers: this.getHeaders(token),
      signal,
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(error);
    }

    const json = await response.json();
    return this.unwrap<T>(json);
  }

  async post<T>(endpoint: string, token: string, data?: any, signal?: AbortSignal): Promise<T> {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "POST",
      headers: this.getHeaders(token),
      body: data ? JSON.stringify(data) : undefined,
      signal,
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(error);
    }

    const json = await response.json();
    return this.unwrap<T>(json);
  }

  async put<T>(endpoint: string, token: string, data?: any, signal?: AbortSignal): Promise<T> {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "PUT",
      headers: this.getHeaders(token),
      body: data ? JSON.stringify(data) : undefined,
      signal,
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(error);
    }

    const json = await response.json();
    return this.unwrap<T>(json);
  }

  async delete<T>(endpoint: string, token: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "DELETE",
      headers: this.getHeaders(token),
      signal,
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(error);
    }

    const json = await response.json();
    return this.unwrap<T>(json);
  }

  private async parseError(response: Response): Promise<string> {
    try {
      const json = await response.json();
      return json.message || json.error || `Request failed with status ${response.status}`;
    } catch {
      return `Request failed with status ${response.status}`;
    }
  }
}

// Singleton instance
export const clientApiService = new ClientApiService();

// API Endpoints for Client Portal
export const CLIENT_API_ENDPOINTS = {
  // Device Management
  DEVICES: {
    SUMMARY: "/client/devices/summary",
    BY_SUBSCRIPTION: (subscriptionId: string) => `/client/devices/subscription/${subscriptionId}`,
    BIND: "/client/devices/bind",
    BIND_BULK: "/client/devices/bind-bulk",
    UNBIND: "/client/devices/unbind",
  },
  
  // Replacement Requests
  REPLACEMENTS: {
    PENDING: "/client/devices/replacements/pending",
    APPROVE: (requestId: string) => `/client/devices/replacements/${requestId}/approve`,
    REJECT: (requestId: string) => `/client/devices/replacements/${requestId}/reject`,
    REQUEST: "/client/devices/replacements/request",
  },
  
  // Online Token Management
  ONLINE_TOKENS: {
    LIST: "/client/online/tokens",
    GENERATE: "/client/online/tokens/generate",
    BY_ID: (tokenId: string) => `/client/online/tokens/${tokenId}`,
    REVOKE: (tokenId: string) => `/client/online/tokens/${tokenId}/revoke`,
    REGENERATE: (tokenId: string) => `/client/online/tokens/${tokenId}/regenerate`,
  },
  
  // Online Device Management
  ONLINE_DEVICES: {
    BY_SUBSCRIPTION: (subscriptionId: string) => `/client/online/devices/subscription/${subscriptionId}`,
    LIMIT: (subscriptionId: string) => `/client/online/devices/subscription/${subscriptionId}/limit`,
    UNBIND: (deviceId: string) => `/client/online/devices/${deviceId}`,
  },
};
