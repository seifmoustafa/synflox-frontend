"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useReportViewModel } from "@/viewmodels/report-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { GenericModal } from "@/components/ui/generic-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import GenericSelect from "@/components/ui/generic-select";
import { ReportType } from "@/domain";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function ReportView() {
  const { t } = useI18n();
  const { 
    vm, 
    config, 
    availableReports,
    generateModalOpen, 
    setGenerateModalOpen,
    selectedReportType,
    setSelectedReportType,
    generating,
    handleGenerateReport
  } = useReportViewModel();
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'excel' | 'pdf'>('excel');
  const [selectedReportTypeValue, setSelectedReportTypeValue] = useState<string>("");

  const handleOpenGenerateModal = () => {
    setGenerateModalOpen(true);
    setSelectedReportTypeValue("");
    setSelectedFormat('excel');
  };

  const handleGenerate = () => {
    const reportType = parseInt(selectedReportTypeValue) as ReportType;
    if (reportType && selectedFormat) {
      handleGenerateReport(reportType, selectedFormat);
    }
  };

  const selectedReport = availableReports.find(r => r.reportType.toString() === selectedReportTypeValue);

  return (
    <>
      <GenericCrudView viewModel={vm} config={config} />
      
      {/* Generate Report Modal */}
      <GenericModal
        open={generateModalOpen}
        onOpenChange={setGenerateModalOpen}
        title={t("report.generate")}
        description={t("report.generateDescription")}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("report.selectReport")}</Label>
            <GenericSelect
              options={availableReports.map(r => ({
                value: r.reportType.toString(),
                label: r.name,
              }))}
              value={selectedReportTypeValue}
              onValueChange={(value: string | string[]) => {
                setSelectedReportTypeValue(Array.isArray(value) ? value[0] : value);
                const report = availableReports.find(r => r.reportType.toString() === (Array.isArray(value) ? value[0] : value));
                setSelectedReportType(report || null);
              }}
              placeholder={t("report.selectReportPlaceholder")}
            />
            {selectedReport && (
              <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
            )}
          </div>

          {selectedReport && (
            <div className="space-y-2">
              <Label>{t("report.format")}</Label>
              <GenericSelect
                options={selectedReport.availableFormats.map(f => ({
                  value: f,
                  label: t(`report.formats.${f}`),
                }))}
                value={selectedFormat}
                onValueChange={(value: string | string[]) => setSelectedFormat((Array.isArray(value) ? value[0] : value) as 'csv' | 'excel' | 'pdf')}
                placeholder={t("report.formatPlaceholder")}
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setGenerateModalOpen(false);
                setSelectedReportType(null);
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={!selectedReportTypeValue || !selectedFormat || generating}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("report.generating")}
                </>
              ) : (
                t("report.generate")
              )}
            </Button>
          </div>
        </div>
      </GenericModal>
    </>
  );
}

