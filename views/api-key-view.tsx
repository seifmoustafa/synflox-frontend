"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useApiKeyViewModel } from "@/viewmodels/api-key-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { GenericModal } from "@/components/ui/generic-modal";
import { Button } from "@/components/ui/button";
import { Copy, Check, AlertTriangle } from "lucide-react";

export function ApiKeyView() {
  const { t } = useI18n();
  const { 
    vm, 
    config, 
    showKeyModalOpen, 
    setShowKeyModalOpen, 
    fullKey, 
    copied, 
    handleCopyKey 
  } = useApiKeyViewModel();

  return (
    <>
      <GenericCrudView viewModel={vm} config={config} />
      
      {/* Show Key Modal - Only shown once after creation/regeneration */}
      <GenericModal
        open={showKeyModalOpen}
        onOpenChange={setShowKeyModalOpen}
        title={t("apiKey.showKey.title")}
        description={t("apiKey.showKey.description")}
      >
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {t("apiKey.showKey.warning")}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t("apiKey.fullKey")}
            </label>
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <code className="flex-1 text-sm font-mono break-all">
                {fullKey}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyKey}
                title={t("common.copy")}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <Check className="h-3 w-3" />
                {t("common.copied")}
              </p>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => setShowKeyModalOpen(false)}>
              {t("common.close")}
            </Button>
          </div>
        </div>
      </GenericModal>
    </>
  );
}

