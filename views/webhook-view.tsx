"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useWebhookViewModel } from "@/viewmodels/webhook-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { GenericModal } from "@/components/ui/generic-modal";
import { Badge } from "@/components/ui/badge";
import { WebhookDeliveryStatus } from "@/domain";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

export function WebhookView() {
  const { t } = useI18n();
  const { 
    vm, 
    config, 
    deliveriesModalOpen, 
    setDeliveriesModalOpen, 
    selectedWebhook,
    deliveries,
    deliveriesLoading
  } = useWebhookViewModel();

  const getStatusIcon = (status: WebhookDeliveryStatus) => {
    switch (status) {
      case WebhookDeliveryStatus.Success:
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case WebhookDeliveryStatus.Failed:
        return <XCircle className="h-4 w-4 text-red-600" />;
      case WebhookDeliveryStatus.Retrying:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <>
      <GenericCrudView viewModel={vm} config={config} />
      
      {/* Deliveries History Modal */}
      <GenericModal
        open={deliveriesModalOpen}
        onOpenChange={setDeliveriesModalOpen}
        title={t("webhook.deliveries.title")}
        description={t("webhook.deliveries.description", { url: selectedWebhook?.url || "" })}
      >
        {deliveriesLoading ? (
          <div className="p-4 text-center">{t("common.loading")}</div>
        ) : deliveries.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {t("webhook.deliveries.noDeliveries")}
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(delivery.status)}
                    <Badge 
                      variant={
                        delivery.status === WebhookDeliveryStatus.Success 
                          ? "active" 
                          : delivery.status === WebhookDeliveryStatus.Failed
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {t(`webhook.deliveryStatus.${WebhookDeliveryStatus[delivery.status]?.toLowerCase() || 'pending'}`)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {t(`webhook.eventTypes.${delivery.eventType}`)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(delivery.attemptedAt).toLocaleString()}
                  </span>
                </div>
                
                {delivery.responseCode && (
                  <div className="text-sm">
                    <span className="font-medium">{t("webhook.deliveries.responseCode")}:</span>{" "}
                    <code className="text-xs">{delivery.responseCode}</code>
                  </div>
                )}
                
                {delivery.errorMessage && (
                  <div className="text-sm text-red-600">
                    <span className="font-medium">{t("webhook.deliveries.error")}:</span>{" "}
                    {delivery.errorMessage}
                  </div>
                )}
                
                {delivery.retryCount > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {t("webhook.deliveries.retryCount")}: {delivery.retryCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </GenericModal>
    </>
  );
}

