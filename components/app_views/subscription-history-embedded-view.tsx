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
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
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
  const { t } = useI18n();
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
                      <div className="mt-3 space-y-3 pt-3 border-t">
                        {entry.oldValue && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              {t("subscriptionHistory.oldValue")}
                            </p>
                            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                              {JSON.stringify(entry.parsedOldValue, null, 2)}
                            </pre>
                          </div>
                        )}
                        {entry.newValue && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              {t("subscriptionHistory.newValue")}
                            </p>
                            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                              {JSON.stringify(entry.parsedNewValue, null, 2)}
                            </pre>
                          </div>
                        )}
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


