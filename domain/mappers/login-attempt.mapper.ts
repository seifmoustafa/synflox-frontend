/**
 * Login Attempt Mappers
 * 
 * Handles conversion between login attempt domain models and external data formats.
 */

import {
  LoginAttempt,
  LoginAttemptStatus,
  type LoginAttemptData,
} from '../models/login-attempt.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface LoginAttemptsResponse {
  data: LoginAttempt[];
  pagination: PaginationInfo;
}

export class LoginAttemptMapper {
  /**
   * Convert JSON/API response to LoginAttempt domain model
   */
  static fromJson(json: any): LoginAttempt {
    return new LoginAttempt({
      id: json.id || '',
      username: json.username || '',
      status: typeof json.status === 'number' 
        ? json.status 
        : LoginAttemptStatus[json.status as keyof typeof LoginAttemptStatus] || LoginAttemptStatus.Failed,
      ipAddress: json.ipAddress,
      userAgent: json.userAgent,
      failureReason: json.failureReason,
      attemptedAt: json.attemptedAt || json.timestamp || new Date().toISOString(),
      userId: json.userId,
    });
  }

  /**
   * Handle different API response formats and convert to LoginAttemptsResponse
   */
  static handleApiResponse(response: any): LoginAttemptsResponse {
    if (response && typeof response === 'object' && 'data' in response && 'pagination' in response) {
      if (Array.isArray(response.data)) {
        const pagination = response.pagination || {};
        return {
          data: response.data.map((item: any) => this.fromJson(item)),
          pagination: {
            itemsCount: pagination.itemsCount || 0,
            pageSize: pagination.pageSize || 10,
            page: pagination.currentPage || pagination.page || 1,
            pagesCount: pagination.pagesCount || 0,
          }
        };
      }
    }

    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data;
      if (Array.isArray(data)) {
        const pagination = response.pagination || {};
        return {
          data: data.map((item: any) => this.fromJson(item)),
          pagination: {
            itemsCount: pagination.itemsCount || pagination.totalItems || data.length,
            pageSize: pagination.pageSize || 10,
            page: pagination.currentPage || pagination.page || 1,
            pagesCount: pagination.pagesCount || pagination.totalPages || 1,
          }
        };
      }
      if ('loginAttempts' in data || 'attempts' in data) {
        const attempts = data.loginAttempts || data.attempts || [];
        const pagination = data.pagination || {};
        return {
          data: Array.isArray(attempts) 
            ? attempts.map((item: any) => this.fromJson(item))
            : [],
          pagination: {
            itemsCount: pagination.itemsCount || pagination.totalItems || 0,
            pageSize: pagination.pageSize || 10,
            page: pagination.currentPage || pagination.page || 1,
            pagesCount: pagination.pagesCount || pagination.totalPages || 0,
          }
        };
      }
    }

    if (Array.isArray(response)) {
      return {
        data: response.map((item: any) => this.fromJson(item)),
        pagination: {
          itemsCount: response.length,
          pageSize: response.length,
          page: 1,
          pagesCount: 1,
        }
      };
    }

    return {
      data: [],
      pagination: {
        itemsCount: 0,
        pageSize: 10,
        page: 1,
        pagesCount: 0,
      }
    };
  }
}

