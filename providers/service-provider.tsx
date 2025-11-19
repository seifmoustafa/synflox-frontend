"use client";

import type React from "react";
import { createContext, useContext, useMemo } from "react";
import { ApiService } from "@/services/api.service";
import { NotificationService } from "@/services/notification.service";
import { NavigationService } from "@/services/navigation.service";
import { AuthService } from "@/services/auth.service";
import { AccountService } from "@/services/account.service";
import { AdminService } from "@/services/admin.service";
import { AdminTypeService } from "@/services/admin-type.service";
import { DashboardService } from "@/services/dashboard.service";

interface Services {
  apiService: ApiService;
  notificationService: NotificationService;
  navigationService: NavigationService;
  authService: AuthService;
  accountService: AccountService;
  adminService: AdminService;
  adminTypeService: AdminTypeService;
  dashboardService: DashboardService;
}

const ServiceContext = createContext<Services | null>(null);

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const services = useMemo(() => {
    const notificationService = new NotificationService();
    const apiService = new ApiService(process.env.NEXT_PUBLIC_API_URL || "");
    const authService = new AuthService(apiService);
    const accountService = new AccountService(apiService, notificationService);
    const navigationService = new NavigationService(apiService);
    const adminService = new AdminService(apiService, notificationService);
    const adminTypeService = new AdminTypeService(apiService, notificationService);
    const dashboardService = new DashboardService(apiService, notificationService);

    return {
      apiService,
      notificationService,
      navigationService,
      authService,
      accountService,
      adminService,
      adminTypeService,
      dashboardService,
    };
  }, []);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useServices must be used within a ServiceProvider");
  }
  return context;
}
