"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useCompanyGroupViewModel } from "@/viewmodels/company-group-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { GenericModal } from "@/components/ui/generic-modal";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useServices } from "@/providers/service-provider";
import { GenericTable } from "@/components/ui/generic-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Company } from "@/domain";

export function CompanyGroupView() {
  const { t } = useI18n();
  const { companyGroupService, companyService } = useServices();
  const { vm, config, manageCompaniesOpen, setManageCompaniesOpen, selectedGroup, setSelectedGroup } = useCompanyGroupViewModel();
  const [groupCompanies, setGroupCompanies] = useState<Company[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (manageCompaniesOpen && selectedGroup) {
      loadData();
    }
  }, [manageCompaniesOpen, selectedGroup]);

  const loadData = async () => {
    if (!selectedGroup) return;
    try {
      setLoading(true);
      const [groupResponse, allResponse] = await Promise.all([
        companyGroupService.getGroupCompanies(selectedGroup.id, { pageSize: 1000 }),
        companyService.getCompanies({ pageSize: 1000 }),
      ]);
      setGroupCompanies(groupResponse.data);
      setAllCompanies(allResponse.data);
      setSelectedCompanyIds(new Set(groupResponse.data.map(c => c.id)));
    } catch (e) {
      // Error already shown by service
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompany = (companyId: string) => {
    setSelectedCompanyIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!selectedGroup) return;
    try {
      setLoading(true);
      const currentIds = new Set(groupCompanies.map(c => c.id));
      const newIds = Array.from(selectedCompanyIds);
      const toAdd = newIds.filter(id => !currentIds.has(id));
      const toRemove = Array.from(currentIds).filter(id => !selectedCompanyIds.has(id));

      if (toAdd.length > 0) {
        await companyGroupService.addCompanies(selectedGroup.id, toAdd);
      }
      if (toRemove.length > 0) {
        await companyGroupService.removeCompanies(selectedGroup.id, toRemove);
      }

      setManageCompaniesOpen(false);
      setSelectedGroup(null);
      await vm.refreshItems();
    } catch (e) {
      // Error already shown by service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GenericCrudView viewModel={vm} config={config} />
      
      {/* Manage Companies Modal */}
      <GenericModal
        open={manageCompaniesOpen}
        onOpenChange={setManageCompaniesOpen}
        title={t("companyGroup.manageCompanies")}
        description={t("companyGroup.manageCompaniesDescription", { groupName: selectedGroup?.name || "" })}
      >
        {loading ? (
          <div className="p-4 text-center">{t("common.loading")}</div>
        ) : (
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-2">
              {allCompanies.map((company) => (
                <div key={company.id} className="flex items-center space-x-2 p-2 border rounded">
                  <Checkbox
                    checked={selectedCompanyIds.has(company.id)}
                    onCheckedChange={() => handleToggleCompany(company.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{company.name}</div>
                    <div className="text-sm text-muted-foreground">{company.contactEmail || "-"}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setManageCompaniesOpen(false);
                  setSelectedGroup(null);
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {t("common.save")}
              </Button>
            </div>
          </div>
        )}
      </GenericModal>
    </>
  );
}

