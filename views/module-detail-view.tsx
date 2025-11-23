"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { useI18n } from "@/providers/i18n-provider";
import { useServices } from "@/providers/service-provider";
import { Edit, Trash2, Boxes, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Module } from "@/domain";

interface ModuleDetailViewProps {
  moduleId: string;
}

export function ModuleDetailView({ moduleId }: ModuleDetailViewProps) {
  const router = useRouter();
  const { t } = useI18n();
  const { moduleService } = useServices();
  const [module, setModule] = React.useState<Module | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch module details
  React.useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await moduleService.getModuleById(moduleId);
        setModule(data);
      } catch (err: any) {
        setError(err.message || "Failed to load module");
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId, moduleService]);

  const handleEdit = () => {
    // Navigate back to list to trigger edit modal
    router.push(`/modules`);
  };

  const handleDelete = async () => {
    // TODO: Add confirmation dialog
    try {
      await moduleService.deleteModule(moduleId);
      router.push("/modules");
    } catch (err: any) {
      setError(err.message || "Failed to delete module");
    }
  };

  const handleBack = () => {
    router.push("/modules");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumbs
          segments={[
            { label: t("module.items"), href: "/modules" },
            { label: t("common.loading") },
          ]}
          showBackButton
          onBack={handleBack}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="space-y-6">
        <PageBreadcrumbs
          segments={[
            { label: t("module.items"), href: "/modules" },
            { label: t("common.error") },
          ]}
          showBackButton
          onBack={handleBack}
        />
        <ErrorMessage message={error || t("module.notFound")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <PageBreadcrumbs
        segments={[
          { label: t("module.items"), href: "/modules" },
          { label: module.displayName },
        ]}
        // showBackButton
        showHome={false}
        onBack={handleBack}
      />

      {/* Header with Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleEdit}
          className="gap-2"
        >
          <Edit className="w-4 h-4" />
          {t("common.edit")}
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          {t("common.delete")}
        </Button>
      </div>

      {/* Module Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Boxes className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{module.displayName}</h1>
            <Badge variant={module.isActive ? "default" : "secondary"}>
              {module.isActive ? t("common.active") : t("common.inactive")}
            </Badge>
          </div>
          {module.description && (
            <p className="text-muted-foreground mt-2">{module.description}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("common.overview")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("module.name")}</p>
              <p className="font-medium">{module.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("common.status")}</p>
              <Badge variant={module.isActive ? "default" : "secondary"}>
                {module.statusText}
              </Badge>
            </div>
          </div>

          {module.description && (
            <div>
              <p className="text-sm text-muted-foreground">{t("module.moduleDescription")}</p>
              <p className="font-medium">{module.description}</p>
            </div>
          )}

          {module.createdTimestamp && (
            <div>
              <p className="text-sm text-muted-foreground">{t("common.created")}</p>
              <p className="font-medium">
                {new Date(module.createdTimestamp).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Card */}
      {module.features && module.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("module.features")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {module.features.map((feature, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {feature}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Removed Projects Card - modules don't own the project relationship! */}
      {/* Projects list their modules, not the other way around */}
    </div>
  );
}
