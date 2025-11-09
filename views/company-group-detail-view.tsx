"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  ArrowLeft,
  Building2,
  Plus,
  Trash2,
  BarChart3,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";
import type { CompanyGroup, Company } from "@/domain";
import { cn } from "@/lib/utils";
import { GenericModal } from "@/components/ui/generic-modal";
import { GenericTable } from "@/components/ui/generic-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DatePickerModal } from "@/components/ui/date-picker-modal";

interface CompanyGroupDetailViewProps {
  groupId: string;
}

export function CompanyGroupDetailView({ groupId }: CompanyGroupDetailViewProps) {
  const router = useRouter();
  const { companyGroupService, companyService } = useServices();
  const { t } = useI18n();
  const [group, setGroup] = useState<CompanyGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [addCompaniesModalOpen, setAddCompaniesModalOpen] = useState(false);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Date picker modal for bulk operations
  const [datePickerModalOpen, setDatePickerModalOpen] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState<{
    action: 'activate' | 'extend';
  } | null>(null);

  const loadGroup = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyGroupService.getGroupById(groupId);
      setGroup(data);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : t("companyGroup.error.loadFailed");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [groupId, companyGroupService, t]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  const loadGroupCompanies = useCallback(async () => {
    try {
      setCompaniesLoading(true);
      const response = await companyGroupService.getGroupCompanies(groupId, { pageSize: 1000 });
      setCompanies(response.data);
    } catch (e) {
      // Error already shown by service
    } finally {
      setCompaniesLoading(false);
    }
  }, [groupId, companyGroupService]);

  const loadAllCompanies = useCallback(async () => {
    try {
      const response = await companyService.getCompanies({ pageSize: 1000 });
      // Filter out companies already in group
      const existingCompanyIds = new Set(companies.map(c => c.id));
      const filtered = response.data.filter(c => !existingCompanyIds.has(c.id));
      setAllCompanies(filtered);
    } catch (e) {
      // Error already shown by service
    }
  }, [companyService, companies]);

  useEffect(() => {
    if (addCompaniesModalOpen) {
      loadAllCompanies();
      setSelectedCompanyIds(new Set());
      setSearchQuery("");
    }
  }, [addCompaniesModalOpen, loadAllCompanies]);

  useEffect(() => {
    if (activeTab === "companies" && companies.length === 0 && !companiesLoading) {
      loadGroupCompanies();
    }
  }, [activeTab, companies.length, companiesLoading, loadGroupCompanies]);

  const handleAddCompanies = async () => {
    if (!group || selectedCompanyIds.size === 0) return;
    try {
      const companyIds = Array.from(selectedCompanyIds);
      await companyGroupService.addCompanies(group.id, companyIds);
      setAddCompaniesModalOpen(false);
      setSelectedCompanyIds(new Set());
      await loadGroupCompanies();
    } catch (e) {
      // Error already shown by service
    }
  };

  const handleRemoveCompanies = async (companyIds: string[]) => {
    if (!group) return;
    try {
      await companyGroupService.removeCompanies(group.id, companyIds);
      await loadGroupCompanies();
    } catch (e) {
      // Error already shown by service
    }
  };

  const handleBulkActivate = async (date: string) => {
    if (!group) return;
    try {
      await companyGroupService.bulkActivateGroup(group.id, date);
      await loadGroupCompanies();
    } catch (e) {
      // Error already shown by service
    }
  };

  const handleBulkSuspend = async () => {
    if (!group) return;
    try {
      await companyGroupService.bulkSuspendGroup(group.id);
      await loadGroupCompanies();
    } catch (e) {
      // Error already shown by service
    }
  };

  const handleBulkResume = async () => {
    if (!group) return;
    try {
      await companyGroupService.bulkResumeGroup(group.id);
      await loadGroupCompanies();
    } catch (e) {
      // Error already shown by service
    }
  };

  const handleBulkExtend = async (date: string) => {
    if (!group) return;
    try {
      await companyGroupService.bulkExtendGroup(group.id, date);
      await loadGroupCompanies();
    } catch (e) {
      // Error already shown by service
    }
  };

  const handleDatePickerConfirm = useCallback(async (date: string) => {
    if (!pendingBulkAction || !group) return;
    
    if (pendingBulkAction.action === 'activate') {
      await handleBulkActivate(date);
    } else if (pendingBulkAction.action === 'extend') {
      await handleBulkExtend(date);
    }
    
    setPendingBulkAction(null);
  }, [pendingBulkAction, group, handleBulkActivate, handleBulkExtend]);

  const filteredCompanies = allCompanies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.contactEmail || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusBreakdown = {
    active: companies.filter(c => c.isActiveStatus).length,
    expired: companies.filter(c => c.status.toLowerCase() === 'expired').length,
    suspended: companies.filter(c => c.status.toLowerCase() === 'suspended').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">{t("companyGroup.error.title")}</h2>
          <p className="text-muted-foreground">
            {error || t("companyGroup.error.notFound")}
          </p>
        </div>
        <Button onClick={() => router.push("/company-groups")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common.goBack")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <PageBreadcrumbs
        showHome={false}
        segments={[
          { label: t("nav.companyGroups"), href: "/company-groups" },
          { label: group.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="text-muted-foreground mt-1">
              {group.description || t("companyGroup.detail.description")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/company-groups")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.goBack")}
          </Button>
          <Button
            variant="default"
            onClick={() => router.push(`/company-groups?edit=${group.id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {t("common.edit")}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t("companyGroup.detail.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="companies">
            {t("companyGroup.detail.tabs.companies")}
            {companies.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {companies.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="statistics">{t("companyGroup.detail.tabs.statistics")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t("companyGroup.detail.basicInfo")}
                </CardTitle>
                <CardDescription>
                  {t("companyGroup.detail.basicInfoDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("companyGroup.name")}
                  </label>
                  <p className="text-base font-semibold">{group.name}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("companyGroup.description")}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {group.description || t("companyGroup.detail.noDescription")}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("companyGroup.status")}
                  </label>
                  <Badge variant={group.isActive ? "active" : "secondary"}>
                    {group.isActive ? t("common.active") : t("common.inactive")}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>{t("companyGroup.detail.metadata")}</CardTitle>
                <CardDescription>
                  {t("companyGroup.detail.metadataDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{t("companyGroup.detail.createdAt")}</span>
                    </div>
                    <p className="text-sm font-medium">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {group.updatedAt && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{t("companyGroup.detail.updatedAt")}</span>
                      </div>
                      <p className="text-sm font-medium">
                        {new Date(group.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{t("companyGroup.detail.companyCount")}</span>
                    </div>
                    <p className="text-sm font-medium">{companies.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("companyGroup.detail.tabs.companies")}</CardTitle>
                  <CardDescription>
                    {t("companyGroup.detail.companiesDescription", { count: companies.length })}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    onClick={() => setAddCompaniesModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("companyGroup.detail.addCompanies")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Bulk Operations Toolbar */}
              {companies.length > 0 && (
                <div className="mb-4 p-4 bg-muted rounded-lg flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{t("companyGroup.detail.bulkOperations")}:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPendingBulkAction({ action: 'activate' });
                      setDatePickerModalOpen(true);
                    }}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    {t("companyGroup.detail.bulkActivate")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkSuspend}
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    {t("companyGroup.detail.bulkSuspend")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkResume}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {t("companyGroup.detail.bulkResume")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPendingBulkAction({ action: 'extend' });
                      setDatePickerModalOpen(true);
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    {t("companyGroup.detail.bulkExtend")}
                  </Button>
                </div>
              )}

              {companiesLoading ? (
                <div className="p-4 text-center">{t("common.loading")}</div>
              ) : companies.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {t("companyGroup.detail.noCompanies")}
                </div>
              ) : (
                <GenericTable
                  data={companies}
                  columns={[
                    {
                      key: "name",
                      label: t("company.name"),
                      render: (_val: unknown, company: Company) => (
                        <button
                          onClick={() => router.push(`/companies/${company.id}`)}
                          className="font-medium text-left hover:text-primary transition-colors"
                        >
                          {company.name}
                        </button>
                      ),
                    },
                    {
                      key: "status",
                      label: t("company.status.title"),
                      render: (_val: unknown, company: Company) => {
                        const status = company.status;
                        const statusConfig: Record<string, { variant: "active" | "secondary" | "destructive"; label: string }> = {
                          active: { variant: "active", label: t("company.status.active") },
                          expired: { variant: "destructive", label: t("company.status.expired") },
                          suspended: { variant: "secondary", label: t("company.status.suspended") },
                        };
                        const config = statusConfig[status.toLowerCase()] || statusConfig.active;
                        return (
                          <Badge variant={config.variant}>
                            {config.label}
                          </Badge>
                        );
                      },
                    },
                    {
                      key: "expiryDate",
                      label: t("company.expiryDate"),
                      render: (_val: unknown, company: Company) => (
                        <span className="text-sm">
                          {company.expiryDate 
                            ? new Date(company.expiryDate).toLocaleDateString()
                            : "-"}
                        </span>
                      ),
                    },
                  ]}
                  actions={[
                    {
                      label: t("companyGroup.detail.removeCompany"),
                      icon: Trash2,
                      onClick: (company: Company) => {
                        if (confirm(t("companyGroup.detail.confirmRemoveCompany", { name: company.name }))) {
                          handleRemoveCompanies([company.id]);
                        }
                      },
                      variant: "destructive",
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t("companyGroup.detail.statistics")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("companyGroup.detail.totalCompanies")}
                  </label>
                  <p className="text-2xl font-bold">{companies.length}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("companyGroup.detail.activeCompanies")}
                  </label>
                  <p className="text-2xl font-bold">{statusBreakdown.active}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("companyGroup.detail.expiredCompanies")}
                  </label>
                  <p className="text-2xl font-bold">{statusBreakdown.expired}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("companyGroup.detail.suspendedCompanies")}
                  </label>
                  <p className="text-2xl font-bold">{statusBreakdown.suspended}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Companies Modal */}
      <GenericModal
        open={addCompaniesModalOpen}
        onOpenChange={setAddCompaniesModalOpen}
        title={t("companyGroup.detail.addCompanies")}
        description={t("companyGroup.detail.addCompaniesDescription", { groupName: group.name })}
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredCompanies.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {t("companyGroup.detail.noCompaniesAvailable")}
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <div key={company.id} className="flex items-center space-x-2 p-2 border rounded">
                  <Checkbox
                    checked={selectedCompanyIds.has(company.id)}
                    onCheckedChange={(checked) => {
                      setSelectedCompanyIds(prev => {
                        const newSet = new Set(prev);
                        if (checked) {
                          newSet.add(company.id);
                        } else {
                          newSet.delete(company.id);
                        }
                        return newSet;
                      });
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{company.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {company.contactEmail || "-"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setAddCompaniesModalOpen(false);
                setSelectedCompanyIds(new Set());
                setSearchQuery("");
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleAddCompanies}
              disabled={selectedCompanyIds.size === 0}
            >
              {t("companyGroup.detail.addSelected")}
            </Button>
          </div>
        </div>
      </GenericModal>

      {/* Date Picker Modal for Bulk Operations */}
      <DatePickerModal
        open={datePickerModalOpen}
        onOpenChange={setDatePickerModalOpen}
        onConfirm={handleDatePickerConfirm}
        title={t("datePickerModal.title")}
        description={t("datePickerModal.selectDate")}
        required
      />
    </div>
  );
}


