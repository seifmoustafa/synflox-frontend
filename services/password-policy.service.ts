/**
 * Password Policy Service
 *
 * Handles Password Policy operations with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  PasswordPolicy,
  PasswordPolicyMapper,
  UpdatePasswordPolicyRequest,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface IPasswordPolicyService {
  getPasswordPolicy(): Promise<PasswordPolicy>;
  updatePasswordPolicy(data: UpdatePasswordPolicyRequest): Promise<PasswordPolicy>;
  validatePassword(password: string): Promise<{ valid: boolean; errors: string[] }>;
}

export class PasswordPolicyService implements IPasswordPolicyService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getPasswordPolicy(): Promise<PasswordPolicy> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.PASSWORD_POLICY_GET
      );
      const policyData = response?.data || response;
      return PasswordPolicyMapper.fromJson(policyData);
    } catch (e) {
      throw e;
    }
  }

  async updatePasswordPolicy(data: UpdatePasswordPolicyRequest): Promise<PasswordPolicy> {
    try {
      const json = PasswordPolicyMapper.updateRequestToJson(data);
      const response = await this.apiService.put<any>(
        API_ENDPOINTS.PASSWORD_POLICY_UPDATE,
        json
      );
      const policyData = response?.data || response;
      const message = response?.message || "Password policy updated successfully";
      this.notificationService.success(message);
      return PasswordPolicyMapper.fromJson(policyData);
    } catch (e) {
      throw e;
    }
  }

  async validatePassword(password: string): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.PASSWORD_POLICY_VALIDATE,
        { password }
      );
      return response?.data || { valid: true, errors: [] };
    } catch (e) {
      throw e;
    }
  }
}

