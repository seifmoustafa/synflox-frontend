"use client";

import type React from "react";
import { createContext, useContext, useMemo } from "react";
import { ApiService } from "@/services/api.service";
import { NotificationService } from "@/services/notification.service";
import { NavigationService } from "@/services/navigation.service";
import { AuthService } from "@/services/auth.service";
import { AccountService } from "@/services/account.service";
import { ProfileService } from "@/services/profile.service";
import { AdminService } from "@/services/admin.service";
import { AdminTypeService } from "@/services/admin-type.service";
import { CompanyService } from "@/services/company.service";
import { ProjectService } from "@/services/project.service";
import { ModuleService } from "@/services/module.service";
import { SubscriptionPlanService } from "@/services/subscription-plan.service";
import { SubscriptionService } from "@/services/subscription.service";
import { DashboardService } from "@/services/dashboard.service";
import { PlanEntitlementService } from "@/services/plan-entitlement.service";
import { LicenseService } from "@/services/license.service";
import { ClientAdminTokenService } from "@/services/client-admin-token.service";
import { CompanyAdminService } from "@/services/company-admin.service";
import { OnlineTokenService } from "@/services/online-token.service";

interface Services {
  apiService: ApiService;
  notificationService: NotificationService;
  navigationService: NavigationService;
  authService: AuthService;
  accountService: AccountService;
  profileService: ProfileService;
  adminService: AdminService;
  adminTypeService: AdminTypeService;
  companyService: CompanyService;
  projectService: ProjectService;
  moduleService: ModuleService;
  subscriptionPlanService: SubscriptionPlanService;
  subscriptionService: SubscriptionService;
  dashboardService: DashboardService;
  planEntitlementService: PlanEntitlementService;
  licenseService: LicenseService;
  clientAdminTokenService: ClientAdminTokenService;
  companyAdminService: CompanyAdminService;
  onlineTokenService: OnlineTokenService;
}

const ServiceContext = createContext<Services | null>(null);

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const services = useMemo(() => {
    const notificationService = new NotificationService();
    const apiService = new ApiService(process.env.NEXT_PUBLIC_API_URL || "");
    const authService = new AuthService(apiService);
    const accountService = new AccountService(apiService, notificationService);
    const profileService = new ProfileService(apiService, notificationService);
    const navigationService = new NavigationService(apiService);
    const adminService = new AdminService(apiService, notificationService);
    const adminTypeService = new AdminTypeService(apiService, notificationService);
    const companyService = new CompanyService(apiService, notificationService);
    const projectService = new ProjectService(apiService, notificationService);
    const moduleService = new ModuleService(apiService, notificationService);
    const subscriptionPlanService = new SubscriptionPlanService(apiService, notificationService);
    const subscriptionService = new SubscriptionService(apiService, notificationService);
    const dashboardService = new DashboardService(apiService, notificationService);
    const planEntitlementService = new PlanEntitlementService(apiService, notificationService);
    const licenseService = new LicenseService(apiService, notificationService);
    const clientAdminTokenService = new ClientAdminTokenService(apiService, notificationService);
    const companyAdminService = new CompanyAdminService(apiService, notificationService);
    const onlineTokenService = new OnlineTokenService(apiService, notificationService);

    return {
      apiService,
      notificationService,
      navigationService,
      authService,
      accountService,
      profileService,
      adminService,
      adminTypeService,
      companyService,
      projectService,
      moduleService,
      subscriptionPlanService,
      subscriptionService,
      dashboardService,
      planEntitlementService,
      licenseService,
      clientAdminTokenService,
      companyAdminService,
      onlineTokenService,
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
