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
import { Edit, Trash2, FolderKanban, Boxes } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/domain";

interface ProjectDetailViewProps {
  projectId: string;
}

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const router = useRouter();
  const { t } = useI18n();
  const { projectService } = useServices();
  const [project, setProject] = React.useState<Project | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch project details
  React.useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await projectService.getProjectById(projectId);
        setProject(data);
      } catch (err: any) {
        setError(err.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, projectService]);

  const handleEdit = () => {
    // TODO: Open edit modal or navigate to edit page
    router.push(`/projects`);
  };

  const handleDelete = async () => {
    // TODO: Add confirmation dialog
    try {
      await projectService.deleteProject(projectId);
      router.push("/projects");
    } catch (err: any) {
      setError(err.message || "Failed to delete project");
    }
  };

  const handleBack = () => {
    router.push("/projects");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumbs
          segments={[
            { label: t("project.items"), href: "/projects" },
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

  if (error || !project) {
    return (
      <div className="space-y-6">
        <PageBreadcrumbs
          segments={[
            { label: t("project.items"), href: "/projects" },
            { label: t("common.error") },
          ]}
          showBackButton
          onBack={handleBack}
        />
        <ErrorMessage message={error || t("project.notFound")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <PageBreadcrumbs
        segments={[
          { label: t("project.items"), href: "/projects" },
          { label: project.displayName },
        ]}
        showHome={false}
        // showBackButton
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

      {/* Project Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <FolderKanban className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{project.displayName}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-2">{project.description}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("project.name")}</p>
              <p className="font-medium">{project.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("project.moduleCount")}</p>
              <p className="font-medium">{project.moduleCount} {t("project.modules")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("project.featureCount")}</p>
              <p className="font-medium">{project.featureCount} {t("project.features")}</p>
            </div>
          </div>

          {project.createdTimestamp && (
            <div>
              <p className="text-sm text-muted-foreground">{t("common.created")}</p>
              <p className="font-medium">
                {new Date(project.createdTimestamp).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Card */}
      {project.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>{t("project.features")}</span>
              <Badge variant="secondary">{project.features.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {project.features.map((feature, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="px-3 py-1.5 text-sm"
                >
                  {feature}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modules Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Boxes className="w-5 h-5" />
              <span>{t("project.modules")}</span>
              <Badge variant="secondary">{project.moduleCount}</Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {project.modules.length > 0 ? (
            <div className="space-y-2">
              {project.modules.map((module) => (
                <div
                  key={module.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    "hover:bg-muted/50 transition-colors cursor-pointer"
                  )}
                  onClick={() => router.push(`/modules/${module.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Boxes className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{module.name}</p>
                      {module.description && (
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={module.isActive ? "default" : "secondary"}>
                    {module.isActive ? t("common.active") : t("common.inactive")}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Boxes className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t("project.noModules")}</p>
              <p className="text-sm mt-2">{t("project.noModulesDescription")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
