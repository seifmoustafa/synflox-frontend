import { appLogger } from "@/lib/logger";
import { secureTokenService } from "@/lib/secure-token-service";

export interface IApiService {
  get<T>(endpoint: string, params?: Record<string, any>, signal?: AbortSignal): Promise<T>;
  post<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<T>;
  put<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<T>;
  delete<T>(endpoint: string, signal?: AbortSignal): Promise<T>;
  deleteWithBody<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<T>;
  putWithRefresh<T>(endpoint: string, data?: any, refreshEndpoint?: string, signal?: AbortSignal): Promise<T>;
}

export class ApiService implements IApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000; // 1 second base delay
  private static isRefreshing = false; // Prevent recursive refresh attempts

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "/api") {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private buildUrl(endpoint: string) {
    const baseUrl = this.baseUrl.startsWith("http") ? this.baseUrl : `https://${this.baseUrl}`;
    return `${baseUrl}${endpoint}`;
  }

  private unwrap<T>(json: any): T {
    if (json && typeof json === "object" && "data" in json) {
      // CRITICAL: Check password reset case FIRST (before pagination check)
      // For password reset endpoints, if data is null but we have statusCode/message, return whole response
      if (json.data === null && (json.statusCode || json.message)) {
        return json as T;
      }
      
      if ("pagination" in json && json.pagination !== null) {
        return { data: json.data, pagination: json.pagination } as T;
      }
      
      return json.data as T;
    }
    
    return json as T;
  }

  private getLanguage(): string {
    // Get language from localStorage, default to 'ar' if not available
    if (typeof window !== 'undefined') {
      const lang = localStorage.getItem("language");
      return lang === "en" ? "en" : "ar";
    }
    return "ar"; // Default for SSR
  }

  /**
   * Internal retry helper with exponential backoff
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Determines if an error is retryable
   * - Network errors (fetch failures): YES
   * - 5xx server errors: YES
   * - 4xx client errors: NO (except 401 which has special handling)
   */
  private isRetryableError(error: Error & { statusCode?: number }): boolean {
    // Network errors (TypeError from fetch)
    if (error instanceof TypeError) {
      return true;
    }
    
    // Check if error has statusCode property (our custom errors)
    if (error.statusCode) {
      // 4xx = client error, don't retry
      if (error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      // 5xx = server error, retry
      if (error.statusCode >= 500) {
        return true;
      }
    }
    
    // Check error message for retryable status codes (fallback)
    if (error.message.includes("Server error:") || error.message.includes("500")) {
      return true;
    }
    
    // Don't retry client errors (400-499)
    if (error.message.includes("Client error") || /4[0-9]{2}/.test(error.message)) {
      return false;
    }
    
    // Default: retry
    return true;
  }

  /**
   * Makes HTTP request with automatic retry logic (up to 3 attempts)
   * - Retries on network errors (fetch failures)
   * - Retries on 5xx server errors
   * - Does NOT retry 4xx client errors (except 401 which has special handling)
   * - Uses exponential backoff: 1s, 2s, 4s
   */
  private async request<T>(endpoint: string, options: RequestInit = {}, signal?: AbortSignal): Promise<T> {
    const url = this.buildUrl(endpoint);
    let lastError: Error | null = null;
    
    // Retry loop: attempt 0 = first try, attempts 1-3 = retries
    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // Log attempt (only in development)
        if (attempt === 0) {
          appLogger.api("Request:", { method: options.method || "GET", url });
        } else {
          appLogger.api(`🔄 Retry ${attempt}/${this.MAX_RETRIES}:`, { method: options.method || "GET", url });
        }
        
        return await this.performRequest<T>(url, endpoint, options, signal);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if request was aborted
        if (signal?.aborted || lastError.name === 'AbortError') {
          appLogger.api("Request aborted - not retrying");
          throw lastError;
        }
        
        // Check if this is a retryable error
        const isRetryable = this.isRetryableError(lastError);
        
        // If not retryable, fail immediately
        if (!isRetryable) {
          appLogger.error("Non-retryable error:", lastError.message);
          throw lastError;
        }
        
        // Don't retry on last attempt
        if (attempt === this.MAX_RETRIES) {
          appLogger.error(`❌ All ${this.MAX_RETRIES} retries failed`);
          // Note: Error notification handled by caller (service/viewmodel)
          throw lastError;
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = this.RETRY_DELAY_MS * Math.pow(2, attempt);
        appLogger.api(`⏳ Retrying in ${delayMs}ms...`, { error: lastError.message });
        await this.sleep(delayMs);
      }
    }
    
    // Should never reach here, but TypeScript doesn't know that
    throw lastError || new Error("Request failed after all retries");
  }

  /**
   * Performs the actual HTTP request (separated for retry logic)
   */
  private async performRequest<T>(url: string, endpoint: string, options: RequestInit, signal?: AbortSignal): Promise<T> {

    // Check if request was aborted
    if (signal?.aborted) {
      throw new Error('Request was aborted');
    }

    const token = secureTokenService.getAccessToken();
    const language = this.getLanguage();
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      "Accept-Language": language,
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      // Only log token info in development mode
      if (process.env.NODE_ENV === 'development') {
        appLogger.api("Token added to request:", token.substring(0, 20) + "...");
      } else {
        appLogger.api("Request authenticated");
      }
    } else {
      appLogger.warn("No access token found - request will be unauthenticated");
      // In development, log more details about the missing token
      if (process.env.NODE_ENV === 'development') {
        appLogger.debug("Token check details:", {
          hasToken: !!token,
          endpoint,
          pathname: typeof window !== 'undefined' ? window.location.pathname : 'SSR'
        });
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
      mode: "cors",
      signal, // Add abort signal
    };

    try {
      const response = await fetch(url, config);
      
      // Check if request was aborted after response
      if (signal?.aborted) {
        const error = new Error('Request was aborted');
        appLogger.api('Request was aborted:', url);
        throw error;
      }
      
      appLogger.api("Response:", { status: response.status, statusText: response.statusText });

      if (!response.ok) {
        // Try to parse error response to get backend message
        let errorMessage = response.statusText;
        let errorData: any = null;
        
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              errorData = JSON.parse(errorText);
              // Extract message from SYNFLOX response format: { statusCode, message, data, errors }
              if (errorData?.message) {
                errorMessage = errorData.message;
              }
            } catch {
              // If not JSON, use the text as message
              errorMessage = errorText;
            }
          }
        } catch {
          // If parsing fails, use status text
        }

        // 401 Unauthorized - Special handling with token refresh
        if (response.status === 401) {
          // If on login page, don't try to refresh
          if (typeof window !== "undefined" && window.location.pathname === "/login") {
            throw new Error(errorMessage);
          }

          // Check if this IS the refresh token endpoint - prevent recursive refresh
          const isRefreshEndpoint = endpoint.includes("/refresh-token");
          
          if (isRefreshEndpoint) {
            // Refresh endpoint itself returned 401 - logout immediately
            appLogger.error("Refresh token endpoint returned 401 - session expired, logging out");
            const { secureTokenService } = await import("@/lib/secure-token-service");
            secureTokenService.clearTokens();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            throw new Error("Session expired - please login again");
          }

          // Prevent recursive refresh attempts
          if (ApiService.isRefreshing) {
            appLogger.warn("Already refreshing token - waiting...");
            throw new Error("Token refresh in progress");
          }

          appLogger.api("401 Unauthorized - attempting token refresh...");
          ApiService.isRefreshing = true;

          try {
            // Attempt token refresh using single-flight guard
            const { withRefreshSingleFlight } = await import("@/lib/refresh-guard");
            const { AuthService } = await import("@/services/auth.service");
            const auth = new AuthService(this);

            const newAccess = await withRefreshSingleFlight(async () => {
              const refreshResp = await auth.refreshToken();
              return refreshResp?.accessToken ?? null;
            });

            if (newAccess) {
              appLogger.api("Token refresh successful - retrying original request");
              
              // Retry original request ONCE with new token
              const retryHeaders: Record<string, string> = {
                ...(config.headers as Record<string, string>),
                Authorization: `Bearer ${newAccess}`,
              };
              const retryResponse = await fetch(url, { ...config, headers: retryHeaders });

              if (!retryResponse.ok) {
                appLogger.error("Request failed after token refresh - logging out");
                // If retry fails, log out
                const { secureTokenService } = await import("@/lib/secure-token-service");
                secureTokenService.clearTokens();
                if (typeof window !== "undefined") {
                  window.location.href = "/login";
                }
                throw new Error(await retryResponse.text() || retryResponse.statusText);
              }

              if (retryResponse.status === 204) {
                return null as T;
              }

              return this.unwrap<T>(await retryResponse.json());
            }

            // Refresh failed → logout
            appLogger.error("Token refresh failed - logging out");
            const { secureTokenService } = await import("@/lib/secure-token-service");
            secureTokenService.clearTokens();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            throw new Error(errorMessage || "Session expired - please login again");
          } finally {
            ApiService.isRefreshing = false;
          }
        }
        
        // 5xx Server errors - WILL BE RETRIED by retry loop
        if (response.status >= 500) {
          appLogger.error("Server error - will retry", { status: response.status, statusText: response.statusText });
          throw new Error(errorMessage || `Server error: ${response.status}`);
        }
        
        // 4xx Client errors (except 401) - DO NOT RETRY
        if (response.status >= 400 && response.status < 500) {
          appLogger.error("Client error - not retrying", { status: response.status, statusText: response.statusText });
          const error = new Error(errorMessage) as Error & { statusCode: number; response?: { status: number; data: any } };
          error.statusCode = response.status;  // Mark with status code so retry logic knows not to retry
          // Preserve response data for 409 Conflict and similar cases
          error.response = { status: response.status, data: errorData };
          // Note: Error notification handled by caller (service/viewmodel)
          throw error;
        }
        
        // Unknown error
        throw new Error(errorMessage);
      }

      if (response.status === 204) {
        appLogger.api("Success: 204 No Content");
        return null as T;
      }

      const json = await response.json();
      appLogger.api("Success (raw):", json);
      const unwrapped = this.unwrap<T>(json);
      appLogger.api("Success (unwrapped):", unwrapped);
      return unwrapped;
    } catch (error) {      
      // Just throw - let the retry loop handle it
      // Toast will be shown by request() on final failure
      throw error;
    }
  } // end of performRequest

  async get<T>(endpoint: string, params?: Record<string, any>, signal?: AbortSignal): Promise<T> {
    const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
    
    // Add cache control headers for development (more reliable than query params)
    const headers = process.env.NODE_ENV === 'development' 
      ? { 
          ...this.defaultHeaders,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      : this.defaultHeaders;
    
    return this.request<T>(`${endpoint}${queryString}`, { 
      method: "GET",
      headers 
    }, signal);
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

  /**
   * PUT request with automatic refresh for 200 and 204 responses
   * - 200: Returns the response data directly
   * - 204: Automatically fetches the updated data
   * @param endpoint - The PUT endpoint
   * @param data - The data to send
   * @param refreshEndpoint - The endpoint to fetch updated data (optional, defaults to GET on same endpoint)
   * @param signal - Abort signal
   * @returns The updated data
   */
  async putWithRefresh<T>(endpoint: string, data?: any, refreshEndpoint?: string, signal?: AbortSignal): Promise<T> {
    const response = await this.put<any>(endpoint, data, signal);
    
    // If response is null (204 No Content), fetch the updated data
    if (response === null) {
      appLogger.api("204 response detected, fetching updated data...");
      const refreshUrl = refreshEndpoint || endpoint.replace(/\/Put$/, '').replace(/\/Put\/.*$/, '');
      return this.get<T>(refreshUrl, undefined, signal);
    }
    
    // If response has data (200 OK), return it directly
    appLogger.api("200 response detected, returning response data directly");
    return response;
  }
}
