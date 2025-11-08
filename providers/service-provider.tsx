"use client";

import type React from "react";
import { createContext, useContext, useMemo } from "react";
import { ApiService } from "@/services/api.service";
import { NotificationService } from "@/services/notification.service";
import { NavigationService } from "@/services/navigation.service";
import { AuthService } from "@/services/auth.service";
import { UserService } from "@/services/user.service";
import { CompanyService } from "@/services/company.service";
import { LicensingService } from "@/services/licensing.service";
import { AdminService } from "@/services/admin.service";
import { AdminTypeService } from "@/services/admin-type.service";
import { DashboardService } from "@/services/dashboard.service";
import { SubscriptionHistoryService } from "@/services/subscription-history.service";
import { NotificationSystemService } from "@/services/notification-system.service";
import { SubscriptionPlanService } from "@/services/subscription-plan.service";
import { ProjectService } from "@/services/project.service";
import { ModuleService } from "@/services/module.service";
import { ProjectModuleService } from "@/services/project-module.service";
import { CompanyGroupService } from "@/services/company-group.service";
import { CompanyCustomFieldService } from "@/services/company-custom-field.service";
import { ApiKeyService } from "@/services/api-key.service";
import { WebhookService } from "@/services/webhook.service";
import { AnalyticsService } from "@/services/analytics.service";
import { ReportService } from "@/services/report.service";
import { MetricService } from "@/services/metric.service";
import { ErrorLogService } from "@/services/error-log.service";
import { PasswordPolicyService } from "@/services/password-policy.service";
import { LoginAttemptService } from "@/services/login-attempt.service";
import { HealthService } from "@/services/health.service";
import { SearchService } from "@/services/search.service";
import { FileUploadService } from "@/services/file-upload.service";

interface Services {
  apiService: ApiService;
  notificationService: NotificationService;
  navigationService: NavigationService;
  authService: AuthService;
  userService: UserService;
  companyService: CompanyService;
  licensingService: LicensingService;
  adminService: AdminService;
  adminTypeService: AdminTypeService;
  dashboardService: DashboardService;
  subscriptionHistoryService: SubscriptionHistoryService;
  notificationSystemService: NotificationSystemService;
  subscriptionPlanService: SubscriptionPlanService;
  projectService: ProjectService;
  moduleService: ModuleService;
  projectModuleService: ProjectModuleService;
  companyGroupService: CompanyGroupService;
  companyCustomFieldService: CompanyCustomFieldService;
  apiKeyService: ApiKeyService;
  webhookService: WebhookService;
  analyticsService: AnalyticsService;
  reportService: ReportService;
  metricService: MetricService;
  errorLogService: ErrorLogService;
  passwordPolicyService: PasswordPolicyService;
  loginAttemptService: LoginAttemptService;
  healthService: HealthService;
  searchService: SearchService;
  fileUploadService: FileUploadService;
}

const ServiceContext = createContext<Services | null>(null);

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const services = useMemo(() => {
    const notificationService = new NotificationService();
    const apiService = new ApiService(process.env.NEXT_PUBLIC_API_URL || "");
    const authService = new AuthService(apiService);
    const userService = new UserService(apiService);
    const navigationService = new NavigationService(apiService);
    const companyService = new CompanyService(apiService, notificationService);
    const licensingService = new LicensingService(apiService, notificationService);
    const adminService = new AdminService(apiService, notificationService);
    const adminTypeService = new AdminTypeService(apiService, notificationService);
    const dashboardService = new DashboardService(apiService, notificationService);
    const subscriptionHistoryService = new SubscriptionHistoryService(apiService, notificationService);
    const notificationSystemService = new NotificationSystemService(apiService, notificationService);
    const subscriptionPlanService = new SubscriptionPlanService(apiService, notificationService);
    const projectService = new ProjectService(apiService, notificationService);
    const moduleService = new ModuleService(apiService, notificationService);
    const projectModuleService = new ProjectModuleService(apiService, notificationService);
    const companyGroupService = new CompanyGroupService(apiService, notificationService);
    const companyCustomFieldService = new CompanyCustomFieldService(apiService, notificationService);
    const apiKeyService = new ApiKeyService(apiService, notificationService);
    const webhookService = new WebhookService(apiService, notificationService);
    const analyticsService = new AnalyticsService(apiService, notificationService);
    const reportService = new ReportService(apiService, notificationService);
    const metricService = new MetricService(apiService, notificationService);
    const errorLogService = new ErrorLogService(apiService, notificationService);
    const passwordPolicyService = new PasswordPolicyService(apiService, notificationService);
    const loginAttemptService = new LoginAttemptService(apiService, notificationService);
    const healthService = new HealthService(apiService, notificationService);
    const searchService = new SearchService(apiService, notificationService);
    const fileUploadService = new FileUploadService(apiService, notificationService);

    return {
      apiService,
      notificationService,
      navigationService,
      authService,
      userService,
      companyService,
      licensingService,
      adminService,
      adminTypeService,
      dashboardService,
      subscriptionHistoryService,
      notificationSystemService,
      subscriptionPlanService,
      projectService,
      moduleService,
      projectModuleService,
      companyGroupService,
      companyCustomFieldService,
      apiKeyService,
      webhookService,
      analyticsService,
      reportService,
      metricService,
      errorLogService,
      passwordPolicyService,
      loginAttemptService,
      healthService,
      searchService,
      fileUploadService,
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
