/**
 * Base API Service
 * 
 * Generic API service that can be extended by app-specific services.
 * Handles: URL building, response unwrapping, retry logic, language header.
 * 
 * Apps extend this class to add their specific auth handling:
 * - Admin: JWT Bearer token with refresh
 * - Client: Session ID header
 */

import { appLogger } from '../lib/logger';

export interface IApiService {
  get<T>(endpoint: string, params?: Record<string, any>, signal?: AbortSignal): Promise<T>;
  post<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<T>;
  put<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<T>;
  delete<T>(endpoint: string, signal?: AbortSignal): Promise<T>;
  deleteWithBody<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<T>;
}

export interface ApiError extends Error {
  statusCode?: number;
  response?: { status: number; data: any };
}

export abstract class BaseApiService implements IApiService {
  protected baseUrl: string;
  protected defaultHeaders: Record<string, string>;
  protected readonly MAX_RETRIES = 3;
  protected readonly RETRY_DELAY_MS = 1000;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "/api") {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  protected buildUrl(endpoint: string): string {
    const baseUrl = this.baseUrl.startsWith("http") ? this.baseUrl : `https://${this.baseUrl}`;
    return `${baseUrl}${endpoint}`;
  }

  /**
   * Unwrap SYNFLOX API response format: { statusCode, message, data, pagination? }
   */
  protected unwrap<T>(json: any): T {
    if (json && typeof json === "object" && "data" in json) {
      // Handle null data with statusCode/message (e.g., password reset)
      if (json.data === null && (json.statusCode || json.message)) {
        return json as T;
      }
      // Handle paginated responses
      if ("pagination" in json && json.pagination !== null) {
        return { data: json.data, pagination: json.pagination } as T;
      }
      return json.data as T;
    }
    return json as T;
  }

  protected getLanguage(): string {
    if (typeof window !== 'undefined') {
      const lang = localStorage.getItem("language");
      return lang === "en" ? "en" : "ar";
    }
    return "ar"; // Default for SSR
  }

  protected async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if error is retryable (network errors, 5xx)
   */
  protected isRetryableError(error: ApiError): boolean {
    if (error instanceof TypeError) {
      return true; // Network error
    }
    if (error.statusCode) {
      if (error.statusCode >= 400 && error.statusCode < 500) {
        return false; // Client error - don't retry
      }
      if (error.statusCode >= 500) {
        return true; // Server error - retry
      }
    }
    if (error.message.includes("Server error:") || error.message.includes("500")) {
      return true;
    }
    if (error.message.includes("Client error") || /4[0-9]{2}/.test(error.message)) {
      return false;
    }
    return true;
  }

  /**
   * Main request method with retry logic
   * Override getAuthHeaders() in subclass for auth-specific headers
   */
  protected async request<T>(endpoint: string, options: RequestInit = {}, signal?: AbortSignal): Promise<T> {
    const url = this.buildUrl(endpoint);
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          appLogger.api(`🔄 Retry ${attempt}/${this.MAX_RETRIES}:`, { method: options.method || "GET", url });
        }
        return await this.performRequest<T>(url, endpoint, options, signal);
      } catch (error) {
        lastError = error as Error;

        if (signal?.aborted || lastError.name === 'AbortError') {
          throw lastError;
        }

        const isRetryable = this.isRetryableError(lastError as ApiError);
        if (!isRetryable) {
          throw lastError;
        }

        if (attempt === this.MAX_RETRIES) {
          throw lastError;
        }

        const delayMs = this.RETRY_DELAY_MS * Math.pow(2, attempt);
        await this.sleep(delayMs);
      }
    }

    throw lastError || new Error("Request failed after all retries");
  }

  /**
   * Override this method in subclass to add auth headers
   */
  protected abstract getAuthHeaders(endpoint: string): Promise<Record<string, string>>;

  /**
   * Override this method in subclass to handle 401 errors
   */
  protected abstract handle401Error(endpoint: string, options: RequestInit, signal?: AbortSignal): Promise<any>;

  /**
   * Perform single HTTP request
   */
  protected async performRequest<T>(url: string, endpoint: string, options: RequestInit, signal?: AbortSignal): Promise<T> {
    if (signal?.aborted) {
      throw new Error('Request was aborted');
    }

    const language = this.getLanguage();
    const authHeaders = await this.getAuthHeaders(endpoint);
    
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      "Accept-Language": language,
      ...authHeaders,
      ...(options.headers as Record<string, string>),
    };

    // Add cache control in development
    if (process.env.NODE_ENV === 'development' && (options.method === "GET" || !options.method)) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
    }

    const config: RequestInit = {
      ...options,
      headers,
      mode: "cors",
      signal,
    };

    try {
      const response = await fetch(url, config);

      if (signal?.aborted) {
        throw new Error('Request was aborted');
      }

      if (!response.ok) {
        let errorMessage = response.statusText;
        let errorData: any = null;

        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              errorData = JSON.parse(errorText);
              if (errorData?.message) {
                errorMessage = errorData.message;
              }
            } catch {
              errorMessage = errorText;
            }
          }
        } catch {
          // Use status text
        }

        // 401 Unauthorized - let subclass handle it
        if (response.status === 401) {
          return this.handle401Error(endpoint, options, signal);
        }

        // Create error with status code
        const error = new Error(errorMessage) as ApiError;
        error.statusCode = response.status;
        error.response = { status: response.status, data: errorData };
        throw error;
      }

      if (response.status === 204) {
        return null as T;
      }

      const json = await response.json();
      return this.unwrap<T>(json);
    } catch (error) {
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>, signal?: AbortSignal): Promise<T> {
    const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request<T>(`${endpoint}${queryString}`, { method: "GET" }, signal);
  }

  async post<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }, signal);
  }

  async put<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }, signal);
  }

  async delete<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" }, signal);
  }

  async deleteWithBody<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    }, signal);
  }
}
