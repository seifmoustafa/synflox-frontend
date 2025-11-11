import { handleError, getUserFriendlyErrorMessage } from "@/lib/error-handler";
import { appLogger } from "@/lib/logger";
import { secureTokenService } from "@/lib/secure-token-service";
import { toast } from "sonner";

export interface IApiService {
  get<T>(endpoint: string, params?: Record<string, any>, signal?: AbortSignal): Promise<T>;
  post<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<T>;
  put<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<T>;
  delete<T>(endpoint: string, signal?: AbortSignal): Promise<T>;
  putWithRefresh<T>(endpoint: string, data?: any, refreshEndpoint?: string, signal?: AbortSignal): Promise<T>;
}

export class ApiService implements IApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private isRefreshing: boolean = false;
  private failedRequestsQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "/api") {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  /**
   * Handle token refresh and queue management
   */
  private async handleTokenRefresh(): Promise<string | null> {
    if (this.isRefreshing) {
      // If already refreshing, wait for it to complete
      return new Promise((resolve, reject) => {
        this.failedRequestsQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = secureTokenService.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // Import AuthMapper and RefreshTokenRequest dynamically to avoid circular dependency
      const { AuthMapper } = await import("@/domain/mappers/auth.mapper");
      const { RefreshTokenRequest } = await import("@/domain/models/auth.model");

      const refreshRequest = new RefreshTokenRequest({ refreshToken });
      
      // Make refresh request WITHOUT going through the interceptor to avoid infinite loop
      const url = this.buildUrl("/admin/auth/refresh-token");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(AuthMapper.refreshTokenRequestToJson(refreshRequest)),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      const loginData = data?.data || data;
      const loginResponse = AuthMapper.loginResponseFromJson(loginData);

      if (loginResponse.isSuccessful && loginResponse.accessToken) {
        // Store tokens with automatic expiry calculation (5 minutes for access token)
        secureTokenService.setTokens({
          accessToken: loginResponse.accessToken,
          refreshToken: loginResponse.refreshToken,
        });

        // Process queued requests with new token
        this.failedRequestsQueue.forEach(({ resolve }) => {
          resolve(loginResponse.accessToken);
        });
        this.failedRequestsQueue = [];

        appLogger.api("Token refreshed successfully");
        return loginResponse.accessToken;
      }

      throw new Error("Invalid refresh response");
    } catch (error) {
      // Reject all queued requests
      this.failedRequestsQueue.forEach(({ reject }) => {
        reject(error);
      });
      this.failedRequestsQueue = [];

      appLogger.error("Token refresh failed:", error);
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  private buildUrl(endpoint: string) {
    const baseUrl = this.baseUrl.startsWith("http") ? this.baseUrl : `https://${this.baseUrl}`;
    return `${baseUrl}${endpoint}`;
  }

  private unwrap<T>(json: any): T {
    if (json && typeof json === "object" && "data" in json) {
      if ("pagination" in json) {
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

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    signal?: AbortSignal,
    isRetry: boolean = false
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    
    // Only log in development
    appLogger.api("Request:", { method: options.method || "GET", url, isRetry });

    // Check if request was aborted before making the request
    if (signal?.aborted) {
      const error = new Error('Request was aborted');
      const appError = handleError(error, `API Request: ${url}`);
      toast.error(getUserFriendlyErrorMessage(appError));
      throw error;
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
      appLogger.warn("No access token found");
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
        const appError = handleError(error, `API Response: ${url}`);
        toast.error(getUserFriendlyErrorMessage(appError));
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

        if (response.status === 401) {
          // Skip login page and refresh endpoint from auto-refresh
          const isLoginPage = typeof window !== 'undefined' && window.location.pathname === "/login";
          const isRefreshEndpoint = endpoint.includes("/refresh-token");
          
          if (!isLoginPage && !isRefreshEndpoint && !isRetry) {
            // Attempt token refresh for authenticated requests
            appLogger.api("Access token expired, attempting refresh...");
            const newToken = await this.handleTokenRefresh();
            
            if (newToken) {
              // Retry the original request with new token
              appLogger.api("Token refreshed, retrying request...");
              return this.request<T>(endpoint, options, signal, true);
            }
          }
          
          // Token refresh failed or not applicable - clear and redirect
          if (!isLoginPage) {
            const error = new Error(errorMessage || "Unauthorized - please login again");
            const appError = handleError(error, `API Request: ${url}`);
            toast.error("Session expired. Please login again.");
            secureTokenService.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = "/login";
            }
            throw error;
          } else {
            // For login page, don't show toast - let the form handle the error display
            const error = new Error(errorMessage);
            throw error;
          }
        }
        
        const error = new Error(errorMessage);
        const appError = handleError(error, `API Request: ${url}`);
        // Prefer backend message over generic error handler message
        toast.error(errorMessage || getUserFriendlyErrorMessage(appError));
        throw error;
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
      // Handle abort errors specifically
      if (error instanceof Error && error.name === 'AbortError') {
        appLogger.api("Request aborted:", url);
        const abortError = new Error('Request was aborted');
        const appError = handleError(abortError, `API Request: ${url}`);
        toast.error(getUserFriendlyErrorMessage(appError));
        throw abortError;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        const networkError = new Error("Network error");
        const appError = handleError(networkError, `API Request: ${url}`);
        toast.error(getUserFriendlyErrorMessage(appError));
        throw networkError;
      }
      
      // Handle other errors
      const appError = handleError(error as Error, `API Request: ${url}`);
      toast.error(getUserFriendlyErrorMessage(appError));
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
