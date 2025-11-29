"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/providers/i18n-provider";
import { useServices } from "@/providers/service-provider";

interface ExportHistoryButtonProps {
  companyId: string;
  companyName: string;
  subscriptions: any[];
}

export function ExportHistoryButton({ companyId, companyName, subscriptions }: ExportHistoryButtonProps) {
  const { t } = useI18n();
  const { notificationService } = useServices();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Generate CSV content
      const csvContent = generateCSV(subscriptions);
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `subscriptions-${companyName}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      notificationService.success(t("subscription.exportSuccess"));
    } catch (error) {
      console.error("Export error:", error);
      notificationService.error(t("subscription.exportError"));
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSV = (data: any[]): string => {
    if (!data || data.length === 0) {
      return "No data available";
    }

    // CSV Headers
    const headers = [
      "ID",
      "Plan Name",
      "Status",
      "Start Date",
      "Expiry Date",
      "Amount",
      "Currency",
      "Is Active",
      "Is Trial",
      "Is Expired",
      "Auto Renew",
      "Days Remaining",
      "Created At"
    ];

    // CSV Rows
    const rows = data.map(sub => [
      sub.id || "",
      sub.planName || "",
      sub.status || "",
      sub.startDateUtc ? new Date(sub.startDateUtc).toLocaleDateString() : "",
      sub.expiryDateUtc ? new Date(sub.expiryDateUtc).toLocaleDateString() : "",
      sub.amount || 0,
      sub.currency || "",
      sub.isActive ? "Yes" : "No",
      sub.isTrial ? "Yes" : "No",
      sub.isExpired ? "Yes" : "No",
      sub.autoRenew ? "Yes" : "No",
      sub.daysRemaining || 0,
      sub.createdTimestamp ? new Date(sub.createdTimestamp).toLocaleDateString() : ""
    ]);

    // Combine headers and rows
    const csvLines = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ];

    return csvLines.join("\n");
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleExport}
      disabled={isExporting || subscriptions.length === 0}
    >
      <Download className="h-4 w-4 me-2" />
      {isExporting ? t("common.exporting") : t("common.export")}
    </Button>
  );
}
