"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type { LoginAttempt } from "@/domain";
import { LoginAttemptStatus } from "@/domain";
import type { CrudConfig } from "@/components/ui/generic-crud-view";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Shield } from "lucide-react";

export function useLoginAttemptViewModel() {
  const router = useRouter();
  const { loginAttemptService } = useServices();
  const { t } = useI18n();

  const vm = useGenericCrudViewModel<
    LoginAttempt,
    never, // No create
    never, // No update
    { data: LoginAttempt[]; pagination: any }
  >(
    {
      getData: loginAttemptService.getLoginAttempts.bind(loginAttemptService),
      create: async () => { throw new Error("Not supported"); },
      update: async () => { throw new Error("Not supported"); },
      delete: async () => { throw new Error("Not supported"); },
    },
    {
      itemTypeName: t("loginAttempt.item"),
      itemTypeNamePlural: t("loginAttempt.items"),
      getItemDisplayName: (attempt: LoginAttempt) => attempt.displayName,
      searchParamName: "search",
    }
  );

  const getStatusIcon = (status: LoginAttemptStatus) => {
    switch (status) {
      case LoginAttemptStatus.Success:
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case LoginAttemptStatus.Blocked:
        return <Shield className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusVariant = (status: LoginAttemptStatus) => {
    switch (status) {
      case LoginAttemptStatus.Success:
        return "active" as const;
      case LoginAttemptStatus.Blocked:
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  const config: CrudConfig<LoginAttempt> = useMemo(
    () => ({
      titleKey: "loginAttempt.title",
      subtitleKey: "loginAttempt.description",
      columns: [
        {
          key: "username",
          label: t("loginAttempt.username"),
          render: (_val: unknown, attempt: LoginAttempt) => (
            <div className="font-medium">{attempt.username}</div>
          ),
        },
        {
          key: "status",
          label: t("loginAttempt.status"),
          render: (_val: unknown, attempt: LoginAttempt) => (
            <div className="flex items-center gap-2">
              {getStatusIcon(attempt.status)}
              <Badge variant={getStatusVariant(attempt.status)}>
                {t(`loginAttempt.status.${LoginAttemptStatus[attempt.status]?.toLowerCase() || 'failed'}`)}
              </Badge>
            </div>
          ),
        },
        {
          key: "ipAddress",
          label: t("loginAttempt.ipAddress"),
          render: (_val: unknown, attempt: LoginAttempt) => (
            <code className="text-sm text-muted-foreground">
              {attempt.ipAddress || '-'}
            </code>
          ),
        },
        {
          key: "attemptedAt",
          label: t("loginAttempt.attemptedAt"),
          render: (_val: unknown, attempt: LoginAttempt) => (
            <span className="text-sm text-muted-foreground">
              {new Date(attempt.attemptedAt).toLocaleString()}
            </span>
          ),
        },
        {
          key: "failureReason",
          label: t("loginAttempt.failureReason"),
          render: (_val: unknown, attempt: LoginAttempt) => (
            <span className="text-sm text-muted-foreground">
              {attempt.failureReason || '-'}
            </span>
          ),
        },
      ],
      getActions: (vm: any, t: any, handleDelete) => {
        return [
          {
            label: t("common.view"),
            onClick: (item: LoginAttempt) => router.push(`/login-attempts/${item.id}`),
            variant: "ghost" as const,
          },
        ];
      },
    }),
    [t, router]
  );

  return {
    vm,
    config,
  };
}

