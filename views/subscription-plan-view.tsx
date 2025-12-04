"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useSubscriptionPlanViewModel } from "@/viewmodels/subscription-plan-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { AlertTriangle, Package, FolderOpen, ArrowRight } from "lucide-react";

/**
 * Subscription Plans Management View
 * Displays list of subscription plans with CRUD operations
 */
export function SubscriptionPlanView() {
  const { vm, config, conflictDialog } = useSubscriptionPlanViewModel();
  const { t } = useI18n();

  return (
    <>
      <GenericCrudView config={config} viewModel={vm} />
      
      {/* Module Conflict Confirmation Dialog for CREATE */}
      <ConfirmationDialog
        open={conflictDialog.show}
        onOpenChange={() => {}}
        title={t("plan.moduleConflictTitle")}
        confirmText={t("plan.confirmRemoveDuplicates")}
        cancelText={t("common.cancel")}
        onConfirm={conflictDialog.onConfirm}
        onCancel={conflictDialog.onCancel}
        variant="warning"
        icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />}
        isLoading={conflictDialog.isLoading}
      >
        {/* Custom conflict display */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("plan.moduleConflictDescription")}
          </p>
          
          {/* Conflict list */}
          <div className="bg-muted/50 rounded-lg border p-3 space-y-2 max-h-48 overflow-auto">
            {conflictDialog.conflicts.map((conflict, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 p-2 bg-background rounded-md border border-yellow-500/20"
              >
                <Package className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                <span className="font-medium text-sm">{conflict.moduleName}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <FolderOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{conflict.projectName}</span>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
            ⚠️ {t("plan.moduleConflictNote")}
          </p>
        </div>
      </ConfirmationDialog>
    </>
  );
}
