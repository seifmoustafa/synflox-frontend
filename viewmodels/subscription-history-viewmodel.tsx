"use client";

import { useCallback, useMemo } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type {
  SubscriptionHistory,
} from "@/domain";
import type { CrudConfig } from "@/components/ui/generic-crud-view";
import { Badge } from "@/components/ui/badge";
import { SubscriptionHistoryActionType } from "@/domain";

export function useSubscriptionHistoryViewModel(companyId?: string) {
  const { subscriptionHistoryService } = useServices();
  const { t } = useI18n();

  const vm = useGenericCrudViewModel<
    SubscriptionHistory,
    never, // No create
    never, // No update
    { data: SubscriptionHistory[]; pagination: any }
  >(
    {
      getData: companyId 
        ? subscriptionHistoryService.getHistory.bind(subscriptionHistoryService, companyId)
        : subscriptionHistoryService.getAllHistory.bind(subscriptionHistoryService),
      create: async () => { throw new Error("Not supported"); },
      update: async () => { throw new Error("Not supported"); },
      delete: async () => { throw new Error("Not supported"); },
    },
    {
      itemTypeName: t("subscriptionHistory.item"),
      itemTypeNamePlural: t("subscriptionHistory.items"),
      getItemDisplayName: (history: SubscriptionHistory) => history.displayName,
      searchParamName: "search",
    }
  );

  const getActionTypeName = useCallback((actionType: SubscriptionHistoryActionType): string => {
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
  }, [t]);

  const config: CrudConfig<SubscriptionHistory> = useMemo(
    () => ({
      titleKey: "subscriptionHistory.title",
      subtitleKey: "subscriptionHistory.description",
      columns: [
        {
          key: "actionType",
          label: t("subscriptionHistory.actionType"),
          render: (_val: unknown, history: SubscriptionHistory) => (
            <Badge variant="secondary">
              {getActionTypeName(history.actionType)}
            </Badge>
          ),
        },
        {
          key: "timestamp",
          label: t("subscriptionHistory.timestamp"),
          render: (_val: unknown, history: SubscriptionHistory) => (
            <span className="text-sm">
              {history.formattedTimestamp}
            </span>
          ),
        },
        {
          key: "performedBy",
          label: t("subscriptionHistory.performedBy"),
          render: (_val: unknown, history: SubscriptionHistory) => (
            <span className="text-sm text-muted-foreground">
              {history.performedBy || t("subscriptionHistory.system")}
            </span>
          ),
        },
        {
          key: "notes",
          label: t("subscriptionHistory.notes"),
          render: (_val: unknown, history: SubscriptionHistory) => (
            <span className="text-sm text-muted-foreground">
              {history.notes || "-"}
            </span>
          ),
        },
      ],
      createFields: [], // No create
      editFields: [], // No edit
      createInitialValues: {},
      editInitialValues: () => ({}),
      getActions: () => [], // No actions for history (read-only)
      enableBulkActions: false,
      enableCreate: false,
      enableEdit: false,
      enableDelete: false,
    }),
    [t, getActionTypeName]
  );

  return { vm, config };
}

