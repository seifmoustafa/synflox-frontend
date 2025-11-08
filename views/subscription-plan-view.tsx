"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useSubscriptionPlanViewModel } from "@/viewmodels/subscription-plan-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { GenericModal } from "@/components/ui/generic-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useServices } from "@/providers/service-provider";

export function SubscriptionPlanView() {
  const { t } = useI18n();
  const { subscriptionPlanService } = useServices();
  const { vm, config, moduleAssignmentOpen, setModuleAssignmentOpen, selectedPlan, setSelectedPlan } = useSubscriptionPlanViewModel();
  const [projectModules, setProjectModules] = useState<Array<{projectModuleId: string, projectName: string, moduleName: string, isEnabled: boolean}>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (moduleAssignmentOpen && selectedPlan) {
      loadProjectModules();
    }
  }, [moduleAssignmentOpen, selectedPlan]);

  const loadProjectModules = async () => {
    if (!selectedPlan) return;
    try {
      setLoading(true);
      const modules = await subscriptionPlanService.getPlanModules(selectedPlan.id);
      setProjectModules(modules);
    } catch (e) {
      // Error already shown by service
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModule = (projectModuleId: string) => {
    setProjectModules(prev => prev.map(pm => 
      pm.projectModuleId === projectModuleId 
        ? { ...pm, isEnabled: !pm.isEnabled }
        : pm
    ));
  };

  const handleSaveModules = async () => {
    if (!selectedPlan) return;
    try {
      setLoading(true);
      await subscriptionPlanService.assignModules(
        selectedPlan.id,
        projectModules.map(pm => ({
          projectModuleId: pm.projectModuleId,
          isEnabled: pm.isEnabled,
        }))
      );
      setModuleAssignmentOpen(false);
      setSelectedPlan(null);
    } catch (e) {
      // Error already shown by service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GenericCrudView viewModel={vm} config={config} />
      
      {/* Module Assignment Modal */}
      <GenericModal
        open={moduleAssignmentOpen}
        onOpenChange={setModuleAssignmentOpen}
        title={t("subscriptionPlan.assignModules")}
        description={t("subscriptionPlan.assignModulesDescription", { planName: selectedPlan?.name || "" })}
      >
        {loading ? (
          <div className="p-4 text-center">{t("common.loading")}</div>
        ) : projectModules.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {t("subscriptionPlan.noModulesAvailable")}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-2">
              {projectModules.map((pm) => (
                <div key={pm.projectModuleId} className="flex items-center space-x-2 p-2 border rounded">
                  <Checkbox
                    checked={pm.isEnabled}
                    onCheckedChange={() => handleToggleModule(pm.projectModuleId)}
                  />
                  <Label className="flex-1 cursor-pointer">
                    <div className="font-medium">{pm.moduleName}</div>
                    <div className="text-sm text-muted-foreground">{pm.projectName}</div>
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setModuleAssignmentOpen(false);
                  setSelectedPlan(null);
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSaveModules} disabled={loading}>
                {t("common.save")}
              </Button>
            </div>
          </div>
        )}
      </GenericModal>
    </>
  );
}

