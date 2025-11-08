"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type {
  Report,
  AvailableReport,
  ReportType,
} from "@/domain";
import { GenerateReportRequest } from "@/domain";
import { ReportType as ReportTypeEnum, ReportStatus } from "@/domain";
import type { CrudConfig } from "@/components/ui/generic-crud-view";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

export function useReportViewModel() {
  const router = useRouter();
  const { reportService } = useServices();
  const { t } = useI18n();
  const [availableReports, setAvailableReports] = useState<AvailableReport[]>([]);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<AvailableReport | null>(null);
  const [generating, setGenerating] = useState(false);

  // Load available reports
  useEffect(() => {
    const loadAvailableReports = async () => {
      try {
        const response = await reportService.getAvailableReports();
        setAvailableReports(response.data);
      } catch (e) {
        // Error already shown by service
      }
    };
    loadAvailableReports();
  }, [reportService]);

  const vm = useGenericCrudViewModel<
    Report,
    never, // No create via standard form
    never, // No update
    { data: Report[]; pagination: any }
  >(
    {
      getData: reportService.getReports.bind(reportService),
      create: async () => { throw new Error(t("report.useGenerateReport")); },
      update: async () => { throw new Error(t("common.notSupported")); },
      delete: async () => { throw new Error(t("common.notSupported")); },
    },
    {
      itemTypeName: t("report.item"),
      itemTypeNamePlural: t("report.items"),
      getItemDisplayName: (report: Report) => report.displayName,
      searchParamName: "search",
    }
  );

  const handleGenerateReport = useCallback(async (reportType: ReportType, format: 'csv' | 'excel' | 'pdf', parameters?: Record<string, any>) => {
    try {
      setGenerating(true);
      const request = new GenerateReportRequest({
        reportType,
        format,
        parameters,
      });
      await reportService.generateReport(request);
      setGenerateModalOpen(false);
      setSelectedReportType(null);
      await vm.refreshItems();
    } catch (e) {
      // Error already shown by service
    } finally {
      setGenerating(false);
    }
  }, [reportService, vm]);

  const handleDownloadReport = useCallback(async (reportType: ReportType, format: 'csv' | 'excel' | 'pdf', parameters?: Record<string, any>) => {
    try {
      const blob = await reportService.downloadReport(reportType, format, parameters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportType}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      // Error already shown by service
    }
  }, [reportService]);

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.Completed:
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case ReportStatus.Failed:
        return <XCircle className="h-4 w-4 text-red-600" />;
      case ReportStatus.Generating:
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const config: CrudConfig<Report> = useMemo(
    () => ({
      titleKey: "report.title",
      subtitleKey: "report.description",
      createFields: [], // Reports are generated, not created via form
      editFields: [], // Reports are read-only
      createInitialValues: {},
      editInitialValues: () => ({}),
      columns: [
        {
          key: "name",
          label: t("report.name"),
          render: (_val: unknown, report: Report) => (
            <div className="font-medium">{report.name}</div>
          ),
        },
        {
          key: "reportType",
          label: t("report.type"),
          render: (_val: unknown, report: Report) => (
            <Badge variant="secondary">
              {t(`report.types.${ReportTypeEnum[report.reportType]?.toLowerCase() || 'unknown'}`)}
            </Badge>
          ),
        },
        {
          key: "format",
          label: t("report.format"),
          render: (_val: unknown, report: Report) => (
            <Badge variant="outline">
              {report.format ? t(`report.formats.${report.format}`) : '-'}
            </Badge>
          ),
        },
        {
          key: "status",
          label: t("report.status"),
          render: (_val: unknown, report: Report) => (
            <div className="flex items-center gap-2">
              {getStatusIcon(report.status)}
              <Badge 
                variant={
                  report.status === ReportStatus.Completed 
                    ? "active" 
                    : report.status === ReportStatus.Failed
                    ? "destructive"
                    : "secondary"
                }
              >
                {t(`report.status.${ReportStatus[report.status]?.toLowerCase() || 'pending'}`)}
              </Badge>
            </div>
          ),
        },
        {
          key: "fileSize",
          label: t("report.fileSize"),
          render: (_val: unknown, report: Report) => (
            <span className="text-sm text-muted-foreground">
              {report.formattedFileSize}
            </span>
          ),
        },
        {
          key: "generatedAt",
          label: t("report.generatedAt"),
          render: (_val: unknown, report: Report) => (
            <span className="text-sm text-muted-foreground">
              {report.generatedAt 
                ? new Date(report.generatedAt).toLocaleString()
                : t("report.notGenerated")}
            </span>
          ),
        },
      ],
      getActions: (vm: any, t: any, handleDelete) => {
        return [
          {
            label: t("report.download"),
            onClick: (item: Report) => {
              if (item.isReady && item.fileUrl) {
                window.open(item.fileUrl, '_blank');
              } else {
                handleDownloadReport(item.reportType, item.format || 'excel', item.parameters);
              }
            },
            variant: "ghost" as const,
            disabled: (item: Report) => !item.isReady && item.status !== ReportStatus.Completed,
          },
        ];
      },
      customActions: [
        {
          label: t("report.generate"),
          onClick: async () => { setGenerateModalOpen(true); },
          variant: "default" as const,
        },
      ],
    }),
    [t, handleDownloadReport]
  );

  return {
    vm,
    config,
    availableReports,
    generateModalOpen,
    setGenerateModalOpen,
    selectedReportType,
    setSelectedReportType,
    generating,
    handleGenerateReport,
    handleDownloadReport,
  };
}

