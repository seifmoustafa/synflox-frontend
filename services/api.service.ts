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

  // Removed - using withRefreshSingleFlight from refresh-guard.ts instead

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
          const isLoginPage = typeof window !== 'undefined' && window.location.pathname === "/login";
          const isRefreshEndpoint = endpoint.includes("/refresh-token");
          
          appLogger.api("⭐ 401 Unauthorized detected", { 
            endpoint, 
            isLoginPage, 
            isRefreshEndpoint
          });
          
          // If already on login page, let it handle the error
          if (isLoginPage) {
            appLogger.api("401 on login page - not refreshing");
            throw new Error(errorMessage);
          }
          
          // Don't try to refresh the refresh endpoint itself
          if (isRefreshEndpoint) {
            appLogger.error("❌ Refresh endpoint returned 401 - refresh token expired");
            secureTokenService.clearTokens();
            if (typeof window !== 'undefined') window.location.href = "/login";
            throw new Error("Refresh token expired");
          }
          
          // ⭐ Attempt token refresh using single-flight pattern
          appLogger.api("🔄 Attempting token refresh with single-flight guard...");
          
          const { withRefreshSingleFlight } = await import("@/lib/refresh-guard");
          
          const newAccessToken = await withRefreshSingleFlight(async () => {
            const refreshToken = secureTokenService.getRefreshToken();
            if (!refreshToken) {
              appLogger.error("❌ No refresh token found");
              return null;
            }
            
            appLogger.api("📡 Calling refresh endpoint...");
            
            // Import dynamically to avoid circular dependency
            const { AuthMapper } = await import("@/domain/mappers/auth.mapper");
            const { RefreshTokenRequest } = await import("@/domain/models/auth.model");
            
            const refreshRequest = new RefreshTokenRequest({ refreshToken });
            const refreshUrl = this.buildUrl("/admin/auth/refresh-token");
            
            try {
              const refreshResponse = await fetch(refreshUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify(AuthMapper.refreshTokenRequestToJson(refreshRequest)),
              });
              
              appLogger.api("📥 Refresh response", { status: refreshResponse.status });
              
              if (!refreshResponse.ok) {
                appLogger.error("❌ Refresh failed", { status: refreshResponse.status });
                return null;
              }
              
              const refreshData = await refreshResponse.json();
              const loginData = refreshData?.data || refreshData;
              const loginResponse = AuthMapper.loginResponseFromJson(loginData);
              
              if (loginResponse.isSuccessful && loginResponse.accessToken) {
                appLogger.api("✅ Got new access token!");
                
                // Store new tokens
                secureTokenService.setTokens({
                  accessToken: loginResponse.accessToken,
                  refreshToken: loginResponse.refreshToken,
                });
                
                appLogger.api("💾 Tokens stored in localStorage");
                return loginResponse.accessToken;
              }
              
              appLogger.error("❌ Invalid refresh response");
              return null;
            } catch (error) {
              appLogger.error("💥 Refresh request failed", { error });
              return null;
            }
          });
          
          // ⭐ If refresh succeeded, retry the original request
          if (newAccessToken) {
            appLogger.api("🔄 Retrying original request with new token...");
            
            const retryHeaders: Record<string, string> = {
              ...headers,
              Authorization: `Bearer ${newAccessToken}`,
            };
            
            const retryResponse = await fetch(url, { ...config, headers: retryHeaders });
            
            if (!retryResponse.ok) {
              appLogger.error("❌ Retry failed after refresh", { status: retryResponse.status });
              // If retry fails, logout
              secureTokenService.clearTokens();
              if (typeof window !== 'undefined') window.location.href = "/login";
              const errTxt = await retryResponse.text();
              throw new Error(errTxt || retryResponse.statusText);
            }
            
            if (retryResponse.status === 204) {
              appLogger.api("✅ Retry succeeded (204)");
              return null as T;
            }
            
            const retryJson = await retryResponse.json();
            appLogger.api("✅ Retry succeeded!");
            return this.unwrap<T>(retryJson);
          }
          
          // ❌ Refresh failed - logout and redirect
          appLogger.error("🚪 Refresh failed - redirecting to login");
          toast.error("Session expired. Please login again.");
          secureTokenService.clearTokens();
          if (typeof window !== 'undefined') window.location.href = "/login";
          throw new Error(errorMessage || "Unauthorized - please login again");
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
