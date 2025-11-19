"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { handleError } from "@/lib/error-handler";
import { appLogger } from "@/lib/logger";
import { useServices } from "@/providers/service-provider";
import { Profile, AuthMapper, LoginResponse } from "@/domain";

interface AuthContextType {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<Profile | LoginResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { authService } = useServices();

  const isAuthenticated = !!user;

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    if (authService.hasToken()) {
      try {
        const currentUser = await authService.getMe();
        setUser(currentUser);
        appLogger.info("User authenticated successfully", { userId: currentUser.id });
      } catch (error) {
        const appError = handleError(error as Error, 'AuthProvider.checkAuth');
        appLogger.error("Failed to fetch user during checkAuth", { error, appError });
        
        // ⭐ ApiService handles 401 + token refresh automatically
        // If we're here, either:
        // 1. ApiService already refreshed tokens and retried (we have the error after retry)
        // 2. Refresh failed and tokens were cleared
        // 3. Network error or other non-401 error
        
        // Check if tokens were cleared by ApiService
        if (!authService.hasToken()) {
          appLogger.info("Tokens cleared by ApiService - user logged out");
          setUser(null);
        } else {
          // Tokens still exist - might be network error
          appLogger.warn("GetMe failed but tokens exist - might be network error");
          setUser(null);
        }
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [authService]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string): Promise<Profile | LoginResponse> => {
    try {
      // Create LoginRequest domain model using mapper
      const loginRequest = AuthMapper.loginRequestFromJson({ username, password });
      const result = await authService.login(loginRequest);
      
      // Check if 2FA is required
      if (result instanceof LoginResponse && result.needs2FA) {
        appLogger.info("2FA required for user", { username });
        return result; // Return the LoginResponse to trigger 2FA UI
      }
      
      // Standard login success - result is Profile
      const loggedInUser = result as Profile;
      setUser(loggedInUser);
      appLogger.info("Login successful", { userId: loggedInUser.id, username: loggedInUser.username });
      return loggedInUser;
    } catch (error) {
      const appError = handleError(error as Error, 'AuthProvider.login');
      appLogger.error("Login failed in provider:", { error, appError });
      // Ensure user state is cleared on login failure
      setUser(null);
      throw error; 
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      // Only clear user state and redirect if logout was successful
      setUser(null);
      appLogger.info("Logout successful");
      router.push("/login");
    } catch (error) {
      const appError = handleError(error as Error, 'AuthProvider.logout');
      appLogger.error("Logout failed in provider:", { error, appError });
      // Clear user state even if logout fails to prevent inconsistent state
      setUser(null);
      router.push("/login");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
