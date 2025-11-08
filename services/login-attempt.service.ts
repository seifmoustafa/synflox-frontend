/**
 * Login Attempt Service
 *
 * Handles Login Attempt operations with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  LoginAttempt,
  LoginAttemptMapper,
  type LoginAttemptsResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface ILoginAttemptService {
  getLoginAttempts(params?: {
    page?: number;
    pageSize?: number;
    username?: string;
    status?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<LoginAttemptsResponse>;
  getFailedLoginAttempts(username: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<LoginAttemptsResponse>;
}

export class LoginAttemptService implements ILoginAttemptService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getLoginAttempts(params?: {
    page?: number;
    pageSize?: number;
    username?: string;
    status?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<LoginAttemptsResponse> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.LOGIN_ATTEMPTS_GET_ALL,
        params
      );
      return LoginAttemptMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async getFailedLoginAttempts(username: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<LoginAttemptsResponse> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.LOGIN_ATTEMPTS_GET_FAILED}/${username}/failed`,
        params
      );
      return LoginAttemptMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }
}

