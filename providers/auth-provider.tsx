"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { handleError } from "@/lib/error-handler";
import { appLogger } from "@/lib/logger";
import { useServices } from "@/providers/service-provider";
import { User, AuthMapper } from "@/domain";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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

  const login = async (username: string, password: string) => {
    try {
      // Create LoginRequest domain model using mapper
      const loginRequest = AuthMapper.loginRequestFromJson({ username, password });
      const loggedInUser = await authService.login(loginRequest);
      setUser(loggedInUser);
      appLogger.info("Login successful", { userId: loggedInUser.id, username: loggedInUser.username });
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
