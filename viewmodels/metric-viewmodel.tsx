"use client";

import { useState, useCallback, useEffect } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import type {
  MetricsSummary,
  MetricHistory,
} from "@/domain";

export function useMetricViewModel() {
  const { metricService } = useServices();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [history, setHistory] = useState<MetricHistory | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>("");

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await metricService.getSummary();
      setSummary(data);
    } catch (e) {
      // Error already shown by service
    } finally {
      setLoading(false);
    }
  }, [metricService]);

  const loadHistory = useCallback(async (metricName?: string, startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      const data = await metricService.getHistory({ metricName, startDate, endDate });
      setHistory(data);
    } catch (e) {
      // Error already shown by service
    } finally {
      setLoading(false);
    }
  }, [metricService]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return {
    loading,
    summary,
    history,
    selectedMetric,
    setSelectedMetric,
    loadSummary,
    loadHistory,
  };
}

