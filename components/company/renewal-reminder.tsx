"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/providers/i18n-provider";

interface RenewalReminderProps {
  subscription: {
    id: string;
    planName: string;
    daysRemaining: number;
  };
}

export function RenewalReminder({ subscription }: RenewalReminderProps) {
  const { t } = useI18n();
  const router = useRouter();

  if (subscription.daysRemaining > 7) {
    return null;
  }

  return (
    <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{t("subscription.expiringWarning")}</AlertTitle>
      <AlertDescription>
        {t("subscription.expiringWarningDesc")
          .replace("{plan}", subscription.planName)
          .replace("{days}", subscription.daysRemaining.toString())}
      </AlertDescription>
      <div className="mt-3 flex gap-2">
        <Button 
          size="sm" 
          onClick={() => router.push(`/subscriptions/${subscription.id}`)}
        >
          <RefreshCw className="h-4 w-4 me-2" />
          {t("subscription.renewNow")}
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => router.push(`/subscriptions/${subscription.id}`)}
        >
          {t("common.viewDetails")}
        </Button>
      </div>
    </Alert>
  );
}
