"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { clientApiService, CLIENT_API_ENDPOINTS } from "@/services/client-api.service";

/**
 * Client Admin Context - For company admins using their ClientAdminToken
 */
export interface ClientAdminContext {
  isAuthenticated: boolean;
  token: string | null;
  companyId: string | null;
  companyName: string | null;
  permissions: {
    // Offline permissions
    canBindDevices: boolean;
    canUnbindDevices: boolean;
    canViewDevices: boolean;
    canApproveReplacements: boolean;
    // Online permissions
    canViewOnlineTokens: boolean;
    canManageOnlineTokens: boolean;
    canViewOnlineDevices: boolean;
    canUnbindOnlineDevices: boolean;
  };
  login: (token: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const defaultPermissions = {
  canBindDevices: false,
  canUnbindDevices: false,
  canViewDevices: false,
  canApproveReplacements: false,
  canViewOnlineTokens: false,
  canManageOnlineTokens: false,
  canViewOnlineDevices: false,
  canUnbindOnlineDevices: false,
};

const ClientAuthContext = createContext<ClientAdminContext>({
  isAuthenticated: false,
  token: null,
  companyId: null,
  companyName: null,
  permissions: defaultPermissions,
  login: async () => false,
  logout: () => {},
  isLoading: true,
});

const CLIENT_TOKEN_KEY = "synflox_client_token";
const CLIENT_DATA_KEY = "synflox_client_data";

interface ClientData {
  companyId: string;
  companyName: string;
  permissions: ClientAdminContext["permissions"];
}

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(CLIENT_TOKEN_KEY);
    const storedData = localStorage.getItem(CLIENT_DATA_KEY);

    if (storedToken && storedData) {
      try {
        const data = JSON.parse(storedData) as ClientData;
        setToken(storedToken);
        setClientData(data);
        setIsAuthenticated(true);
      } catch (e) {
        // Invalid stored data, clear it
        localStorage.removeItem(CLIENT_TOKEN_KEY);
        localStorage.removeItem(CLIENT_DATA_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (newToken: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Validate the token by calling the client API
      const data = await clientApiService.get<any>(
        CLIENT_API_ENDPOINTS.DEVICES.SUMMARY,
        newToken
      );

      // Extract company info from the response
      // The summary endpoint returns company info
      const newClientData: ClientData = {
        companyId: data.companyId || "",
        companyName: data.companyName || "Unknown Company",
        permissions: {
          // These are determined by the token's permissions
          // For now, assume all permissions since we got a valid response
          canBindDevices: true,
          canUnbindDevices: true,
          canViewDevices: true,
          canApproveReplacements: true,
          canViewOnlineTokens: true,
          canManageOnlineTokens: true,
          canViewOnlineDevices: true,
          canUnbindOnlineDevices: true,
        },
      };

      // Store in localStorage
      localStorage.setItem(CLIENT_TOKEN_KEY, newToken);
      localStorage.setItem(CLIENT_DATA_KEY, JSON.stringify(newClientData));

      setToken(newToken);
      setClientData(newClientData);
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CLIENT_TOKEN_KEY);
    localStorage.removeItem(CLIENT_DATA_KEY);
    setToken(null);
    setClientData(null);
    setIsAuthenticated(false);
  }, []);

  const value: ClientAdminContext = {
    isAuthenticated,
    token,
    companyId: clientData?.companyId ?? null,
    companyName: clientData?.companyName ?? null,
    permissions: clientData?.permissions ?? defaultPermissions,
    login,
    logout,
    isLoading,
  };

  return (
    <ClientAuthContext.Provider value={value}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error("useClientAuth must be used within ClientAuthProvider");
  }
  return context;
}

/**
 * Hook to check if user has specific client permission
 */
export function useClientPermission(permission: keyof ClientAdminContext["permissions"]) {
  const { permissions } = useClientAuth();
  return permissions[permission];
}
