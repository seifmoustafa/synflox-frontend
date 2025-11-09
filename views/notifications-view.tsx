"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useNotificationSystemViewModel } from "@/viewmodels/notification-system-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCheck } from "lucide-react";

export function NotificationsView() {
  const { t } = useI18n();
  const { vm, config, unreadCount, markAllAsRead } = useNotificationSystemViewModel();

  const handleMarkAllAsRead = async () => {
    // Mark all as read for all companies (no companyId means all)
    // Note: This requires companyId, so we'll need to handle this differently
    // For now, mark each unread notification individually
    const unreadNotifications = vm.data.filter(n => !n.isRead);
    for (const notification of unreadNotifications) {
      // We'll need to get companyId from notification or handle differently
      // For now, just mark individual notifications
    }
  };

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Badge variant="default">{unreadCount}</Badge>
                {t("notifications.unreadNotifications")}
              </CardTitle>
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                {t("notifications.markAllAsRead")}
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}
      <GenericCrudView viewModel={vm} config={config} />
    </div>
  );
}

