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
import {
  Building2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Key,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
} from "lucide-react";
import type { Company } from "@/domain";
import { cn } from "@/lib/utils";

interface CompanyDetailViewProps {
  companyId: string;
}

export function CompanyDetailView({ companyId }: CompanyDetailViewProps) {
  const router = useRouter();
  const { companyService } = useServices();
  const { t } = useI18n();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadCompany = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyService.getCompanyById(companyId);
      setCompany(data);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : t("company.error.loadFailed");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [companyId, companyService, t]);

  useEffect(() => {
    loadCompany();
  }, [loadCompany]);

  const handleCopyLicenseKey = useCallback(async () => {
    if (company?.licenseKey) {
      try {
        await navigator.clipboard.writeText(company.licenseKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy license key:", error);
      }
    }
  }, [company?.licenseKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t("company.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">
              {t("company.error.title")}
            </CardTitle>
            <CardDescription>
              {error || t("company.error.notFound")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={() => router.back()} variant="outline">
                {t("common.goBack")}
              </Button>
              <Button onClick={loadCompany}>{t("common.retry")}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = company.status;
  const statusConfig = {
    Active: {
      variant: "active" as const,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    Expired: {
      variant: "destructive" as const,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    Suspended: {
      variant: "secondary" as const,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <PageBreadcrumbs
        showHome={false}
        segments={[
          { label: t("nav.companies"), href: "/companies" },
          { label: company.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            {company.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("company.detail.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={statusConfig[status].variant}
            className="text-sm px-3 py-1"
          >
            <StatusIcon className="h-4 w-4 mr-1" />
            {t(`company.status.${status.toLowerCase()}`)}
          </Badge>
          <Button variant="outline" onClick={() => router.push(`/companies`)}>
            <Edit className="h-4 w-4 mr-2" />
            {t("common.edit")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("company.detail.basicInfo")}
            </CardTitle>
            <CardDescription>
              {t("company.detail.basicInfoDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("company.name")}
              </label>
              <p className="text-base font-semibold">{company.name}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("company.status.title")}
              </label>
              <div className="flex items-center gap-2">
                <Badge variant={statusConfig[status].variant}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {t(`company.status.${status.toLowerCase()}`)}
                </Badge>
                <Badge variant={company.isActive ? "active" : "inactive"}>
                  {company.isActive
                    ? t("company.active")
                    : t("company.inactive")}
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("company.expiryDate")}
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-base">
                  {company.expiryDate
                    ? new Date(company.expiryDate).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : t("company.detail.noExpiryDate")}
                </p>
                {company.expiryDate && (
                  <Badge
                    variant={
                      new Date(company.expiryDate) < new Date()
                        ? "destructive"
                        : "default"
                    }
                    className="ml-2"
                  >
                    {new Date(company.expiryDate) < new Date()
                      ? t("company.detail.expired")
                      : t("company.detail.valid")}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t("company.detail.contactInfo")}
            </CardTitle>
            <CardDescription>
              {t("company.detail.contactInfoDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t("company.contactEmail")}
              </label>
              <p className="text-base">
                {company.contactEmail || (
                  <span className="text-muted-foreground italic">
                    {t("company.detail.notProvided")}
                  </span>
                )}
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {t("company.contactPhone")}
              </label>
              <p className="text-base">
                {company.contactPhone || (
                  <span className="text-muted-foreground italic">
                    {t("company.detail.notProvided")}
                  </span>
                )}
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t("company.address")}
              </label>
              <p className="text-base">
                {company.address || (
                  <span className="text-muted-foreground italic">
                    {t("company.detail.notProvided")}
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* License Key Information - Only show if license key exists */}
        {company.licenseKey && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t("company.licenseKey")}
              </CardTitle>
              <CardDescription>
                {t("company.detail.licenseKeyDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      {t("company.licenseKey")}
                    </label>
                    <code className="text-sm font-mono break-all">
                      {company.licenseKey}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLicenseKey}
                    title={t("common.copy")}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    {t("common.copied")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t("company.detail.timestamps")}
            </CardTitle>
            <CardDescription>
              {t("company.detail.timestampsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {t("company.detail.createdAt")}
                </label>
                <p className="text-base">
                  {new Date(company.createdTimestamp).toLocaleString(
                    undefined,
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
              {company.updatedTimestamp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("company.detail.updatedAt")}
                  </label>
                  <p className="text-base">
                    {new Date(company.updatedTimestamp).toLocaleString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
