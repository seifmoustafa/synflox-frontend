"use client";

import { useState, useMemo } from "react";
import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useSubscriptionHistoryViewModel } from "@/viewmodels/subscription-history-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GenericSelect from "@/components/ui/generic-select";
import type { SubscriptionHistory } from "@/domain";
import { SubscriptionHistoryActionType } from "@/domain";
import { Calendar, Filter, X } from "lucide-react";

interface SubscriptionHistoryViewProps {
  companyId?: string;
}

export function SubscriptionHistoryView({ companyId }: SubscriptionHistoryViewProps) {
  const { t } = useI18n();
  const { vm, config } = useSubscriptionHistoryViewModel(companyId);
  const [selectedHistory, setSelectedHistory] = useState<SubscriptionHistory | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    actionType: "",
  });

  const actionTypes = [
    { value: "", label: t("subscriptionHistory.filter.all") },
    { value: SubscriptionHistoryActionType.Created.toString(), label: t("subscriptionHistory.actionType.created") },
    { value: SubscriptionHistoryActionType.Activated.toString(), label: t("subscriptionHistory.actionType.activated") },
    { value: SubscriptionHistoryActionType.Suspended.toString(), label: t("subscriptionHistory.actionType.suspended") },
    { value: SubscriptionHistoryActionType.Resumed.toString(), label: t("subscriptionHistory.actionType.resumed") },
    { value: SubscriptionHistoryActionType.Extended.toString(), label: t("subscriptionHistory.actionType.extended") },
    { value: SubscriptionHistoryActionType.Expired.toString(), label: t("subscriptionHistory.actionType.expired") },
    { value: SubscriptionHistoryActionType.Deleted.toString(), label: t("subscriptionHistory.actionType.deleted") },
    { value: SubscriptionHistoryActionType.Updated.toString(), label: t("subscriptionHistory.actionType.updated") },
  ];

  const handleViewDetails = (history: SubscriptionHistory) => {
    setSelectedHistory(history);
    setShowDetails(true);
  };

  const handleApplyFilters = () => {
    // Filters will be applied when we refresh the data
    vm.refreshItems();
  };

  const handleClearFilters = () => {
    setFilters({ fromDate: "", toDate: "", actionType: "" });
    vm.refreshItems();
  };

  // Enhanced columns with view details action
  const enhancedColumns = useMemo(() => [
    ...config.columns,
    {
      key: "actions",
      label: t("common.actions"),
      render: (_val: unknown, history: SubscriptionHistory) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetails(history)}
        >
          {t("common.view")}
        </Button>
      ),
    },
  ], [config.columns, t]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("subscriptionHistory.filters")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>{t("subscriptionHistory.fromDate")}</Label>
              <Input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("subscriptionHistory.toDate")}</Label>
              <Input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("subscriptionHistory.actionType")}</Label>
              <GenericSelect
                type="single"
                options={actionTypes}
                value={filters.actionType}
                onValueChange={(value) => setFilters({ ...filters, actionType: Array.isArray(value) ? value[0] : value })}
                placeholder={t("subscriptionHistory.filter.all")}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleApplyFilters} variant="default">
                {t("common.apply")}
              </Button>
              <Button onClick={handleClearFilters} variant="outline">
                <X className="h-4 w-4 mr-2" />
                {t("common.clear")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <GenericCrudView
        viewModel={vm}
        config={{
          ...config,
          columns: enhancedColumns,
        }}
      />

      {/* Details Modal */}
      {showDetails && selectedHistory && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <CardContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-background p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <CardTitle>{t("subscriptionHistory.details")}</CardTitle>
              <Button variant="ghost" onClick={() => setShowDetails(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>{t("subscriptionHistory.actionType")}</Label>
                <Badge variant="secondary">{selectedHistory.actionTypeName}</Badge>
              </div>
              <div>
                <Label>{t("subscriptionHistory.timestamp")}</Label>
                <p>{selectedHistory.formattedTimestamp}</p>
              </div>
              {selectedHistory.performedBy && (
                <div>
                  <Label>{t("subscriptionHistory.performedBy")}</Label>
                  <p>{selectedHistory.performedBy}</p>
                </div>
              )}
              {selectedHistory.notes && (
                <div>
                  <Label>{t("subscriptionHistory.notes")}</Label>
                  <p>{selectedHistory.notes}</p>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                {selectedHistory.oldValue && (
                  <div>
                    <Label>{t("subscriptionHistory.oldValue")}</Label>
                    <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(selectedHistory.parsedOldValue, null, 2)}
                    </pre>
                  </div>
                )}
                {selectedHistory.newValue && (
                  <div>
                    <Label>{t("subscriptionHistory.newValue")}</Label>
                    <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(selectedHistory.parsedNewValue, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

