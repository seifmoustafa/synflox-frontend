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
  Key,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  ArrowLeft,
  Building2,
  RefreshCw,
  Trash2,
  BarChart3,
  Copy,
  Check,
} from "lucide-react";
import type { ApiKey, Company } from "@/domain";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApiKeyDetailViewProps {
  apiKeyId: string;
}

export function ApiKeyDetailView({ apiKeyId }: ApiKeyDetailViewProps) {
  const router = useRouter();
  const { apiKeyService, companyService } = useServices();
  const { t } = useI18n();
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
  const [regeneratedKey, setRegeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadApiKey = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiKeyService.getApiKeyById(apiKeyId);
      setApiKey(data);
      
      // Load company
      if (data.companyId) {
        try {
          const companyData = await companyService.getCompanyById(data.companyId);
          setCompany(companyData);
        } catch (e) {
          // Company might not exist, ignore
        }
      }
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : t("apiKey.error.loadFailed");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiKeyId, apiKeyService, companyService, t]);

  useEffect(() => {
    loadApiKey();
  }, [loadApiKey]);

  const handleRegenerate = async () => {
    if (!apiKey) return;
    try {
      const response = await apiKeyService.regenerateApiKey(apiKey.id);
      setRegeneratedKey(response.fullKey);
      setRegenerateModalOpen(true);
      await loadApiKey();
    } catch (e) {
      // Error already shown by service
    }
  };

  const handleDelete = async () => {
    if (!apiKey) return;
    if (!confirm(t("apiKey.detail.confirmDelete", { name: apiKey.name }))) return;
    try {
      await apiKeyService.deleteApiKey(apiKey.id);
      router.push("/api-keys");
    } catch (e) {
      // Error already shown by service
    }
  };

  const handleCopyKey = async () => {
    if (regeneratedKey) {
      await navigator.clipboard.writeText(regeneratedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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

  if (error || !apiKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">{t("apiKey.error.title")}</h2>
          <p className="text-muted-foreground">
            {error || t("apiKey.error.notFound")}
          </p>
        </div>
        <Button onClick={() => router.push("/api-keys")} variant="outline">
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
          { label: t("nav.apiKeys"), href: "/api-keys" },
          { label: apiKey.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{apiKey.name}</h1>
            <p className="text-muted-foreground mt-1">
              {apiKey.description || t("apiKey.detail.description")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/api-keys")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.goBack")}
          </Button>
          <Button
            variant="outline"
            onClick={handleRegenerate}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("apiKey.detail.regenerate")}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/api-keys?edit=${apiKey.id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {t("common.edit")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("apiKey.detail.revoke")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t("apiKey.detail.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="usage">{t("apiKey.detail.tabs.usage")}</TabsTrigger>
          <TabsTrigger value="settings">{t("apiKey.detail.tabs.settings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  {t("apiKey.detail.basicInfo")}
                </CardTitle>
                <CardDescription>
                  {t("apiKey.detail.basicInfoDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("apiKey.name")}
                  </label>
                  <p className="text-base font-semibold">{apiKey.name}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("apiKey.description")}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {apiKey.description || t("apiKey.detail.noDescription")}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("apiKey.key")}
                  </label>
                  <code className="text-sm font-mono bg-muted p-2 rounded block">
                    {apiKey.maskedKey}
                  </code>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("apiKey.status")}
                  </label>
                  <div className="flex items-center gap-2">
                    <Badge variant={apiKey.isActive ? "active" : "secondary"}>
                      {apiKey.isActive ? t("common.active") : t("common.inactive")}
                    </Badge>
                    {apiKey.isExpired && (
                      <Badge variant="destructive">
                        {t("apiKey.expired")}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company & Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>{t("apiKey.detail.metadata")}</CardTitle>
                <CardDescription>
                  {t("apiKey.detail.metadataDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  {company && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{t("apiKey.company")}</span>
                      </div>
                      <button
                        onClick={() => router.push(`/companies/${company.id}`)}
                        className="text-sm font-medium hover:text-primary transition-colors"
                      >
                        {company.name}
                      </button>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{t("apiKey.detail.createdAt")}</span>
                    </div>
                    <p className="text-sm font-medium">
                      {new Date(apiKey.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {apiKey.updatedAt && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{t("apiKey.detail.updatedAt")}</span>
                      </div>
                      <p className="text-sm font-medium">
                        {new Date(apiKey.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {apiKey.expiresAt && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{t("apiKey.expiresAt")}</span>
                      </div>
                      <p className="text-sm font-medium">
                        {new Date(apiKey.expiresAt).toLocaleDateString()}
                        {apiKey.isExpired && (
                          <Badge variant="destructive" className="ml-2">
                            {t("apiKey.expired")}
                          </Badge>
                        )}
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{t("apiKey.lastUsedAt")}</span>
                    </div>
                    <p className="text-sm font-medium">
                      {apiKey.lastUsedAt 
                        ? new Date(apiKey.lastUsedAt).toLocaleString()
                        : t("apiKey.detail.neverUsed")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t("apiKey.detail.tabs.usage")}
              </CardTitle>
              <CardDescription>
                {t("apiKey.detail.usageDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("apiKey.lastUsedAt")}
                  </label>
                  <p className="text-base">
                    {apiKey.lastUsedAt 
                      ? new Date(apiKey.lastUsedAt).toLocaleString()
                      : t("apiKey.detail.neverUsed")}
                  </p>
                </div>
                <Separator />
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t("apiKey.detail.usageStatsNote")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("apiKey.detail.tabs.settings")}</CardTitle>
              <CardDescription>
                {t("apiKey.detail.settingsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t("apiKey.detail.settingsNote")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Regenerate Key Modal */}
      <Dialog open={regenerateModalOpen} onOpenChange={setRegenerateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              {t("apiKey.detail.regenerate")}
            </DialogTitle>
            <DialogDescription>
              {t("apiKey.detail.regenerateDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("apiKey.key")}</Label>
              <div className="flex gap-2">
                <Input
                  value={regeneratedKey || ""}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyKey}
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
              <Button onClick={() => setRegenerateModalOpen(false)}>
                {t("common.close")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


