"use client";

import { useState } from "react";
import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { GenericModal } from "@/components/ui/generic-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { useCompanyViewModel } from "@/viewmodels/company-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { Copy, Check, Loader2, Calendar, Key } from "lucide-react";

export function CompanyView() {
  const { t } = useI18n();
  const { 
    vm, 
    config, 
    handleDelete,
    handleToggleActive,
    activateModalOpen,
    setActivateModalOpen,
    extendModalOpen,
    setExtendModalOpen,
    licenseKeyModalOpen,
    setLicenseKeyModalOpen,
    selectedCompany,
    licenseKey,
    handleActivate,
    handleExtend,
    handleCopyLicenseKey,
    copied,
    licensingLoading,
  } = useCompanyViewModel();

  const [activateExpiryDate, setActivateExpiryDate] = useState("");
  const [extendExpiryDate, setExtendExpiryDate] = useState("");

  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activateExpiryDate) {
      await handleActivate(new Date(activateExpiryDate).toISOString());
      setActivateExpiryDate("");
    }
  };

  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (extendExpiryDate) {
      await handleExtend(new Date(extendExpiryDate).toISOString());
      setExtendExpiryDate("");
    }
  };

  return (
    <>
      <GenericCrudView 
        viewModel={vm} 
        config={{
          ...config,
          getActions: (vm: any, t: any) => config.getActions?.(vm, t, handleDelete) || [],
        }} 
      />

      {/* Activate Company Modal */}
      <GenericModal
        open={activateModalOpen}
        onOpenChange={setActivateModalOpen}
        title={t("licensing.activate")}
        description={selectedCompany ? t("company.activateDescription").replace("{{name}}", selectedCompany.name) : ""}
        size="md"
      >
        <form onSubmit={handleActivateSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activateExpiryDate">{t("company.expiryDate")}</Label>
            <DatePicker
              id="activateExpiryDate"
              value={activateExpiryDate}
              onChange={(value) => setActivateExpiryDate(value)}
              placeholder={t("company.expiryDatePlaceholder")}
              required
              type="date"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setActivateModalOpen(false);
                setActivateExpiryDate("");
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={licensingLoading || !activateExpiryDate}
            >
              {licensingLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  {t("licensing.activate")}
                </>
              )}
            </Button>
          </div>
        </form>
      </GenericModal>

      {/* Extend Company Modal */}
      <GenericModal
        open={extendModalOpen}
        onOpenChange={setExtendModalOpen}
        title={t("licensing.extend")}
        description={selectedCompany ? t("company.extendDescription").replace("{{name}}", selectedCompany.name) : ""}
        size="md"
      >
        <form onSubmit={handleExtendSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="extendExpiryDate">{t("company.newExpiryDate")}</Label>
            <DatePicker
              id="extendExpiryDate"
              value={extendExpiryDate}
              onChange={(value) => setExtendExpiryDate(value)}
              placeholder={t("company.expiryDatePlaceholder")}
              required
              type="date"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setExtendModalOpen(false);
                setExtendExpiryDate("");
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={licensingLoading || !extendExpiryDate}
            >
              {licensingLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  {t("licensing.extend")}
                </>
              )}
            </Button>
          </div>
        </form>
      </GenericModal>

      {/* License Key Display Modal */}
      <Dialog open={licenseKeyModalOpen} onOpenChange={setLicenseKeyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              {t("licensing.viewKey")}
            </DialogTitle>
            <DialogDescription>
              {selectedCompany ? t("company.licenseKeyDescription").replace("{{name}}", selectedCompany.name) : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("company.licenseKey")}</Label>
              <div className="flex gap-2">
                <Input
                  value={licenseKey || ""}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLicenseKey}
                  title={t("common.copy")}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-sm text-green-600">{t("common.copied")}</p>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setLicenseKeyModalOpen(false)}>
                {t("common.close")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

