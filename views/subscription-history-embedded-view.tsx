"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { SubscriptionHistory } from "@/domain";
import { SubscriptionHistoryActionType } from "@/domain";
import { Clock, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionHistoryEmbeddedViewProps {
  companyId: string;
  limit?: number;
}

export function SubscriptionHistoryEmbeddedView({ 
  companyId, 
  limit = 10 
}: SubscriptionHistoryEmbeddedViewProps) {
  const { subscriptionHistoryService } = useServices();
  const { t, language } = useI18n();
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subscriptionHistoryService.getHistory(companyId, {
        page: 1,
        pageSize: limit,
      });
      setHistory(response.data);
    } catch (e) {
      // Error already shown by service
    } finally {
      setLoading(false);
    }
  }, [companyId, limit, subscriptionHistoryService]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const getActionTypeName = (actionType: SubscriptionHistoryActionType): string => {
    const names: Record<SubscriptionHistoryActionType, string> = {
      [SubscriptionHistoryActionType.Created]: t("subscriptionHistory.actionType.created"),
      [SubscriptionHistoryActionType.Activated]: t("subscriptionHistory.actionType.activated"),
      [SubscriptionHistoryActionType.Suspended]: t("subscriptionHistory.actionType.suspended"),
      [SubscriptionHistoryActionType.Resumed]: t("subscriptionHistory.actionType.resumed"),
      [SubscriptionHistoryActionType.Extended]: t("subscriptionHistory.actionType.extended"),
      [SubscriptionHistoryActionType.Expired]: t("subscriptionHistory.actionType.expired"),
      [SubscriptionHistoryActionType.Deleted]: t("subscriptionHistory.actionType.deleted"),
      [SubscriptionHistoryActionType.Updated]: t("subscriptionHistory.actionType.updated"),
    };
    return names[actionType] || t("subscriptionHistory.actionType.unknown");
  };

  const getActionTypeVariant = (actionType: SubscriptionHistoryActionType): "default" | "secondary" | "destructive" | "active" => {
    switch (actionType) {
      case SubscriptionHistoryActionType.Activated:
      case SubscriptionHistoryActionType.Resumed:
        return "active";
      case SubscriptionHistoryActionType.Suspended:
      case SubscriptionHistoryActionType.Expired:
      case SubscriptionHistoryActionType.Deleted:
        return "destructive";
      default:
        return "secondary";
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Format a value based on its type and key
  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined) {
      return t("common.empty") || "-";
    }

    // Handle dates
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('timestamp')) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString(language === "ar" ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            calendar: "gregory",
          });
        }
      } catch {
        // Not a valid date
      }
    }

    // Handle booleans
    if (typeof value === 'boolean') {
      return value ? t("common.yes") || "Yes" : t("common.no") || "No";
    }

    // Handle numbers
    if (typeof value === 'number') {
      return value.toString();
    }

    // Handle strings
    return String(value);
  };

  // Get human-readable field name
  const getFieldLabel = (key: string): string => {
    // Map backend field names to translation keys
    const fieldLabelMap: Record<string, string> = {
      'Name': "company.name",
      'IsActive': "company.isActive",
      'IsTrial': "company.isTrial",
      'ExpiryDate': "company.expiryDate",
      'TrialEndDate': "company.trialEndDate",
      'ContactEmail': "company.contactEmail",
      'ContactPhone': "company.contactPhone",
      'Address': "company.address",
      'SubscriptionPlanId': "company.subscriptionPlan",
    };
    
    const translationKey = fieldLabelMap[key];
    if (translationKey) {
      const translated = t(translationKey);
      // If translation exists and is not the key itself, return it
      if (translated && translated !== translationKey) {
        return translated;
      }
    }
    
    // Fallback to key if no translation found
    return key;
  };

  // Render field changes in a readable format
  const renderFieldChanges = (oldValue: any, newValue: any) => {
    if (!oldValue && !newValue) return null;

    const old = oldValue || {};
    const new_ = newValue || {};
    
    // Get all unique keys from both objects
    const allKeys = new Set([...Object.keys(old), ...Object.keys(new_)]);
    
    // Filter to only show changed fields
    const changedFields = Array.from(allKeys).filter(key => {
      const oldVal = old[key];
      const newVal = new_[key];
      
      // Handle null/undefined comparison
      if (oldVal === null || oldVal === undefined) {
        return newVal !== null && newVal !== undefined;
      }
      if (newVal === null || newVal === undefined) {
        return oldVal !== null && oldVal !== undefined;
      }
      
      // Compare values
      return JSON.stringify(oldVal) !== JSON.stringify(newVal);
    });

    if (changedFields.length === 0) {
      return (
        <div className="text-sm text-muted-foreground italic">
          {t("subscriptionHistory.noChanges") || "No field changes detected"}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {changedFields.map((key) => {
          const oldVal = old[key];
          const newVal = new_[key];
          const hasOld = oldVal !== null && oldVal !== undefined;
          const hasNew = newVal !== null && newVal !== undefined;

          return (
            <div 
              key={key} 
              className="flex items-start gap-3 p-2 rounded-md bg-muted/50 border border-border"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  {getFieldLabel(key)}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {hasOld ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-600 dark:text-red-400">
                        {formatValue(key, oldVal)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      {t("subscriptionHistory.empty") || "Empty"}
                    </span>
                  )}
                  
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  
                  {hasNew ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-600 dark:text-green-400">
                        {formatValue(key, newVal)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      {t("subscriptionHistory.empty") || "Empty"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t("company.detail.history.noHistory")}</p>
      </div>
    );
  }

  const displayedHistory = showAll ? history : history.slice(0, limit);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {displayedHistory.map((entry) => {
          const isExpanded = expandedIds.has(entry.id);
          const hasDetails = entry.oldValue || entry.newValue || entry.notes;

          return (
            <Card key={entry.id} className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant={getActionTypeVariant(entry.actionType)}>
                        {getActionTypeName(entry.actionType)}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{entry.formattedTimestamp}</span>
                      </div>
                      {entry.performedBy && (
                        <span className="text-sm text-muted-foreground">
                          {t("subscriptionHistory.performedBy")}: {entry.performedBy}
                        </span>
                      )}
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-foreground">{entry.notes}</p>
                    )}
                    {hasDetails && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(entry.id)}
                        className="h-6 px-2"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            {t("common.hide")}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            {t("common.show")}
                          </>
                        )}
                      </Button>
                    )}
                    {isExpanded && hasDetails && (
                      <div className="mt-3 pt-3 border-t">
                        {entry.oldValue || entry.newValue ? (
                          renderFieldChanges(entry.parsedOldValue, entry.parsedNewValue)
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {history.length > limit && (
        <div className="text-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll 
              ? t("company.detail.history.showLess") 
              : t("company.detail.history.showMore", { count: history.length - limit })
            }
          </Button>
        </div>
      )}
    </div>
  );
}


