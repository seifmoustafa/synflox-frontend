/**
 * Online Token Mapper
 * Handles conversion between API data and domain models
 */

import {
  OnlineToken,
  OnlineTokenData,
  OnlineDevice,
  OnlineDeviceData,
  DeviceLimit,
  DeviceLimitData,
  GenerateOnlineTokenRequest,
  GenerateOnlineTokenResponse,
  GenerateOnlineTokenResponseData,
  SubscriptionChangeLog,
  SubscriptionChangeLogData,
  PendingChanges,
  PendingChangesData,
  ClientTokenStatus,
  OnlineDeviceStatus,
} from '../models/online-token.model';

// ========== Response Interfaces ==========
export interface OnlineTokensResponse {
  data: OnlineTokenData[];
}

export interface OnlineDevicesResponse {
  data: OnlineDeviceData[];
}

// Status enum numeric to string mapping (for backward compatibility)
const STATUS_MAP: Record<number, ClientTokenStatus> = {
  0: ClientTokenStatus.Active, // None maps to Active for safety
  1: ClientTokenStatus.Active,
  2: ClientTokenStatus.Expired,
  3: ClientTokenStatus.Revoked,
  4: ClientTokenStatus.Suspended,
};

// ========== Mapper Class ==========
export class OnlineTokenMapper {
  // Helper to convert numeric status to enum string
  private static parseStatus(status: string | number): ClientTokenStatus {
    if (typeof status === 'number') {
      return STATUS_MAP[status] ?? ClientTokenStatus.Active;
    }
    return status as ClientTokenStatus;
  }

  // ========== Token Mappings ==========
  static tokenFromJson(data: OnlineTokenData): OnlineToken {
    return new OnlineToken(
      data.id,
      data.companyId,
      data.subscriptionId,
      data.name,
      new Date(data.issuedAtUtc),
      new Date(data.expiresAtUtc),
      this.parseStatus(data.status),
      data.revocationReason,
      data.autoRefreshEnabled,
      data.maxDevices,
      data.boundDeviceCount,
      data.lastUsedAtUtc ? new Date(data.lastUsedAtUtc) : null,
      data.usageCount,
      data.lastUsedFromIp,
      data.notes,
      data.isValid,
      data.isExpired,
      data.daysUntilExpiry,
      data.companyName,
      data.subscriptionPlanName
    );
  }

  static tokensFromResponse(response: OnlineTokensResponse | OnlineTokenData[]): OnlineToken[] {
    // Handle both formats: wrapped { data: [...] } or raw array [...]
    const data = Array.isArray(response) ? response : response.data;
    return data?.map((d) => this.tokenFromJson(d)) ?? [];
  }

  static generateRequestToJson(request: GenerateOnlineTokenRequest): object {
    return request.toJSON();
  }

  static generateResponseFromJson(data: GenerateOnlineTokenResponseData): GenerateOnlineTokenResponse {
    return new GenerateOnlineTokenResponse(
      data.success,
      data.message,
      data.token,
      data.tokenInfo ? this.tokenFromJson(data.tokenInfo) : null
    );
  }

  // ========== Device Mappings ==========
  static deviceFromJson(data: OnlineDeviceData): OnlineDevice {
    return new OnlineDevice(
      data.id,
      data.tokenId,
      data.subscriptionId,
      data.deviceFingerprint,
      data.deviceName,
      data.deviceType,
      data.operatingSystem,
      data.status as OnlineDeviceStatus,
      new Date(data.firstSeenAtUtc),
      data.lastSeenAtUtc ? new Date(data.lastSeenAtUtc) : null,
      data.lastIpAddress,
      data.apiCallCount,
      data.statusReason
    );
  }

  static devicesFromResponse(response: OnlineDevicesResponse | OnlineDeviceData[]): OnlineDevice[] {
    // Handle both formats: wrapped { data: [...] } or raw array [...]
    const data = Array.isArray(response) ? response : response.data;
    return data?.map((d) => this.deviceFromJson(d)) ?? [];
  }

  // ========== Device Limit Mappings ==========
  static deviceLimitFromJson(data: DeviceLimitData): DeviceLimit {
    return new DeviceLimit(
      data.currentCount,
      data.maxAllowed,
      data.isUnlimited,
      data.canRegisterMore,
      data.remainingSlots,
      data.requiresAdminApproval ?? false,
      data.admissionMode ?? 'Open'
    );
  }

  // ========== Change Log Mappings ==========
  static changeLogFromJson(data: SubscriptionChangeLogData): SubscriptionChangeLog {
    return new SubscriptionChangeLog(
      data.id,
      data.subscriptionId,
      data.planId,
      data.changeType,
      data.changeDescription,
      data.oldValue,
      data.newValue,
      data.effectPolicy,
      new Date(data.effectiveDateUtc),
      data.isApplied,
      data.appliedAtUtc ? new Date(data.appliedAtUtc) : null,
      data.appliedBy,
      data.customerNotified,
      data.isCancelled,
      data.cancellationReason,
      data.daysUntilEffective,
      data.isReadyToApply,
      data.subscriptionName,
      data.planName
    );
  }

  static pendingChangesFromJson(data: PendingChangesData): PendingChanges {
    return new PendingChanges(
      data.subscriptionId,
      data.totalPendingChanges,
      data.nextChangeDate ? new Date(data.nextChangeDate) : null,
      data.changes?.map(this.changeLogFromJson) ?? []
    );
  }

  // ========== API Response Handler ==========
  static handleApiResponse<T>(
    response: any,
    mapper: (data: any) => T
  ): T {
    if (response?.data !== undefined) {
      return mapper(response.data);
    }
    return mapper(response);
  }
}
