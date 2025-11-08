"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type { ErrorLog } from "@/domain";
import { ErrorLogLevel } from "@/domain";
import type { CrudConfig } from "@/components/ui/generic-crud-view";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Info, Bug, XCircle } from "lucide-react";

export function useErrorLogViewModel() {
  const router = useRouter();
  const { errorLogService } = useServices();
  const { t } = useI18n();

  const vm = useGenericCrudViewModel<
    ErrorLog,
    never, // No create
    never, // No update
    { data: ErrorLog[]; pagination: any }
  >(
    {
      getData: errorLogService.getErrorLogs.bind(errorLogService),
      create: async () => { throw new Error("Not supported"); },
      update: async () => { throw new Error("Not supported"); },
      delete: async () => { throw new Error("Not supported"); },
    },
    {
      itemTypeName: t("errorLog.item"),
      itemTypeNamePlural: t("errorLog.items"),
      getItemDisplayName: (error: ErrorLog) => error.displayName,
      searchParamName: "search",
    }
  );

  const getLevelIcon = (level: ErrorLogLevel) => {
    switch (level) {
      case ErrorLogLevel.Critical:
        return <XCircle className="h-4 w-4 text-red-600" />;
      case ErrorLogLevel.Error:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case ErrorLogLevel.Warning:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case ErrorLogLevel.Info:
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Bug className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLevelVariant = (level: ErrorLogLevel) => {
    switch (level) {
      case ErrorLogLevel.Critical:
      case ErrorLogLevel.Error:
        return "destructive" as const;
      case ErrorLogLevel.Warning:
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const config: CrudConfig<ErrorLog> = useMemo(
    () => ({
      titleKey: "errorLog.title",
      subtitleKey: "errorLog.description",
      createFields: [], // Error logs are read-only
      editFields: [], // Error logs are read-only
      columns: [
        {
          key: "level",
          label: t("errorLog.level"),
          render: (_val: unknown, error: ErrorLog) => (
            <div className="flex items-center gap-2">
              {getLevelIcon(error.level)}
              <Badge variant={getLevelVariant(error.level)}>
                {t(`errorLog.levels.${ErrorLogLevel[error.level]?.toLowerCase() || 'error'}`)}
              </Badge>
            </div>
          ),
        },
        {
          key: "message",
          label: t("errorLog.message"),
          render: (_val: unknown, error: ErrorLog) => (
            <div className="max-w-md">
              <div className="font-medium truncate">{error.message}</div>
              {error.source && (
                <div className="text-xs text-muted-foreground">{error.source}</div>
              )}
            </div>
          ),
        },
        {
          key: "timestamp",
          label: t("errorLog.timestamp"),
          render: (_val: unknown, error: ErrorLog) => (
            <span className="text-sm text-muted-foreground">
              {new Date(error.timestamp).toLocaleString()}
            </span>
          ),
        },
        {
          key: "resolved",
          label: t("errorLog.status"),
          render: (_val: unknown, error: ErrorLog) => (
            <Badge variant={error.resolved ? "active" : "destructive"}>
              {error.resolved ? t("errorLog.resolved") : t("errorLog.unresolved")}
            </Badge>
          ),
        },
        {
          key: "requestPath",
          label: t("errorLog.requestPath"),
          render: (_val: unknown, error: ErrorLog) => (
            <code className="text-xs text-muted-foreground">
              {error.requestMethod} {error.requestPath || '-'}
            </code>
          ),
        },
      ],
      getActions: (vm: any, t: any, handleDelete) => {
        return [
          {
            label: t("common.view"),
            onClick: (item: ErrorLog) => router.push(`/error-logs/${item.id}`),
            variant: "ghost" as const,
          },
        ];
      },
      customActions: [
        {
          label: t("errorLog.cleanup"),
          onClick: async () => {
            const days = prompt(t("errorLog.cleanupPrompt"));
            if (days && !isNaN(parseInt(days))) {
              await errorLogService.cleanupErrorLogs(parseInt(days));
              await vm.refreshItems();
            }
          },
          variant: "default" as const,
        },
      ],
    }),
    [t, router]
  );

  return {
    vm,
    config,
  };
}

