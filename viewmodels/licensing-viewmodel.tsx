"use client";

import { useState, useCallback } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import type { Company } from "@/domain";
import { ActivateCompanyRequest, ExtendCompanyRequest, StartTrialRequest, ConvertTrialRequest, BulkOperationResponse } from "@/domain";

export function useLicensingViewModel() {
  const { licensingService } = useServices();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const activateCompany = useCallback(async (companyId: string, expiryDate: string) => {
    setLoading(true);
    try {
      const request = new ActivateCompanyRequest({ expiryDate });
      await licensingService.activateCompany(companyId, request);
      return true;
    } catch (e) {
      return false;
    } finally {
      setLoading(false);
    }
  }, [licensingService]);

  const suspendCompany = useCallback(async (companyId: string) => {
    setLoading(true);
    try {
      await licensingService.suspendCompany(companyId);
      return true;
    } catch (e) {
      return false;
    } finally {
      setLoading(false);
    }
  }, [licensingService]);

  const resumeCompany = useCallback(async (companyId: string) => {
    setLoading(true);
    try {
      await licensingService.resumeCompany(companyId);
      return true;
    } catch (e) {
      return false;
    } finally {
      setLoading(false);
    }
  }, [licensingService]);

  const extendCompany = useCallback(async (companyId: string, newExpiryDate: string) => {
    setLoading(true);
    try {
      const request = new ExtendCompanyRequest({ newExpiryDate });
      await licensingService.extendCompany(companyId, request);
      return true;
    } catch (e) {
      return false;
    } finally {
      setLoading(false);
    }
  }, [licensingService]);

  const generateLicenseKey = useCallback(async (companyId: string) => {
    setLoading(true);
    try {
      const response = await licensingService.generateLicenseKey(companyId);
      return response.licenseKey;
    } catch (e) {
      return null;
    } finally {
      setLoading(false);
    }
  }, [licensingService]);

  const regenerateLicenseKey = useCallback(async (companyId: string) => {
    setLoading(true);
    try {
      const response = await licensingService.regenerateLicenseKey(companyId);
      return response.licenseKey;
    } catch (e) {
      return null;
    } finally {
      setLoading(false);
    }
  }, [licensingService]);

  const startTrial = useCallback(async (companyId: string, trialDays: number) => {
    setLoading(true);
    try {
      const request = new StartTrialRequest({ trialDays });
      await licensingService.startTrial(companyId, request);
      return true;
    } catch (e) {
      return false;
    } finally {
      setLoading(false);
    }
  }, [licensingService]);

  const convertTrial = useCallback(async (companyId: string, expiryDate: string) => {
    setLoading(true);
    try {
      const request = new ConvertTrialRequest({ expiryDate });
      await licensingService.convertTrial(companyId, request);
      return true;
    } catch (e) {
      return false;
    } finally {
      setLoading(false);
    }
  }, [licensingService]);

  const bulkActivate = useCallback(async (companyIds: string[], expiryDate?: string): Promise<BulkOperationResponse | null> => {
    setLoading(true);
    try {
      return await licensingService.bulkActivate(companyIds, expiryDate);
    } catch (e) {
      return null;
    } finally {
      setLoading(false);
    }
  }, [licensingService]);

  const bulkSuspend = useCallback(async (companyIds: string[]): Promise<BulkOperationResponse | null> => {
    setLoading(true);
    try {
      return await licensingService.bulkSuspend(companyIds);
    } catch (e) {
      return null;
    } finally {
      setLoading(false);
    }
  }, [licensingService]);

  const bulkResume = useCallback(async (companyIds: string[]): Promise<BulkOperationResponse | null> => {
    setLoading(true);
    try {
      return await licensingService.bulkResume(companyIds);
    } catch (e) {
      return null;
    } finally {
      setLoading(false);
    }
  }, [licensingService]);

  const bulkExtend = useCallback(async (companyIds: string[], expiryDate: string): Promise<BulkOperationResponse | null> => {
    setLoading(true);
    try {
      return await licensingService.bulkExtend(companyIds, expiryDate);
    } catch (e) {
      return null;
    } finally {
      setLoading(false);
    }
  }, [licensingService]);

  return {
    loading,
    activateCompany,
    suspendCompany,
    resumeCompany,
    extendCompany,
    generateLicenseKey,
    regenerateLicenseKey,
    startTrial,
    convertTrial,
    bulkActivate,
    bulkSuspend,
    bulkResume,
    bulkExtend,
  };
}

