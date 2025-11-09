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
  Folder,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  ArrowLeft,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import type { Project, ProjectModule, Module } from "@/domain";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenericModal } from "@/components/ui/generic-modal";
import { GenericTable } from "@/components/ui/generic-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface ProjectDetailViewProps {
  projectId: string;
}

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const router = useRouter();
  const { projectService, projectModuleService, moduleService } = useServices();
  const { t } = useI18n();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectModules, setProjectModules] = useState<ProjectModule[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [addModuleModalOpen, setAddModuleModalOpen] = useState(false);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const loadProject = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getProjectById(projectId);
      setProject(data);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : t("project.error.loadFailed");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId, projectService, t]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const loadProjectModules = useCallback(async () => {
    try {
      setModulesLoading(true);
      const response = await projectModuleService.getProjectModules(projectId);
      setProjectModules(response.data);
    } catch (e) {
      // Error already shown by service
    } finally {
      setModulesLoading(false);
    }
  }, [projectId, projectModuleService]);

  const loadAllModules = useCallback(async () => {
    try {
      const response = await moduleService.getModules({ pageSize: 1000, isActive: true });
      // Filter out modules already in project
      const existingModuleIds = new Set(projectModules.map(pm => pm.moduleId));
      const filtered = response.data.filter(m => !existingModuleIds.has(m.id));
      setAllModules(filtered);
    } catch (e) {
      // Error already shown by service
    }
  }, [moduleService, projectModules]);

  useEffect(() => {
    if (addModuleModalOpen) {
      loadAllModules();
      setSelectedModuleIds(new Set());
      setSearchQuery("");
    }
  }, [addModuleModalOpen, loadAllModules]);

  const handleAddModules = async () => {
    if (!project || selectedModuleIds.size === 0) return;
    try {
      const moduleIds = Array.from(selectedModuleIds);
      for (const moduleId of moduleIds) {
        await projectModuleService.createAssociation(project.id, moduleId);
      }
      setAddModuleModalOpen(false);
      await loadProjectModules();
    } catch (e) {
      // Error already shown by service
    }
  };

  const handleRemoveModule = async (moduleId: string) => {
    if (!project) return;
    try {
      await projectModuleService.removeAssociation(project.id, moduleId);
      await loadProjectModules();
    } catch (e) {
      // Error already shown by service
    }
  };

  const filteredModules = allModules.filter(module =>
    module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (module.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">{t("project.error.title")}</h2>
          <p className="text-muted-foreground">
            {error || t("project.error.notFound")}
          </p>
        </div>
        <Button onClick={() => router.push("/projects")} variant="outline">
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
          { label: t("nav.projects"), href: "/projects" },
          { label: project.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Folder className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground mt-1">
              {t("project.detail.description")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/projects")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.goBack")}
          </Button>
          <Button
            variant="default"
            onClick={() => router.push(`/projects?edit=${project.id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {t("common.edit")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t("project.detail.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="modules">
            {t("project.detail.tabs.modules")}
            {projectModules.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {projectModules.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("project.detail.overview")}</CardTitle>
              <CardDescription>
                {t("project.detail.overviewDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {project.isActive ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="text-sm font-medium">{t("project.status")}</span>
                </div>
                <Badge variant={project.isActive ? "active" : "secondary"}>
                  {project.isActive ? t("common.active") : t("common.inactive")}
                </Badge>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">{t("project.descriptionLabel")}</h3>
                <p className="text-sm text-muted-foreground">
                  {project.description || t("project.detail.noDescription")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Metadata Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("project.detail.metadata")}</CardTitle>
              <CardDescription>
                {t("project.detail.metadataDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{t("project.detail.createdAt")}</span>
                  </div>
                  <p className="text-sm font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {project.updatedAt && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{t("project.detail.updatedAt")}</span>
                    </div>
                    <p className="text-sm font-medium">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Folder className="h-4 w-4" />
                    <span>{t("project.detail.projectId")}</span>
                  </div>
                  <p className="text-sm font-mono">{project.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6" onFocus={loadProjectModules}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("project.detail.tabs.modules")}</CardTitle>
                  <CardDescription>
                    {t("project.detail.modulesDescription")}
                  </CardDescription>
                </div>
                <Button
                  variant="default"
                  onClick={() => setAddModuleModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("project.detail.addModule")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {modulesLoading ? (
                <div className="p-4 text-center">{t("common.loading")}</div>
              ) : projectModules.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {t("project.detail.noModules")}
                </div>
              ) : (
                <GenericTable
                  data={projectModules}
                  columns={[
                    {
                      key: "moduleName",
                      label: t("module.name"),
                      render: (_val: unknown, pm: ProjectModule) => (
                        <button
                          onClick={() => router.push(`/modules/${pm.moduleId}`)}
                          className="font-medium text-left hover:text-primary transition-colors"
                        >
                          {pm.moduleName || t("module.unknown")}
                        </button>
                      ),
                    },
                    {
                      key: "createdAt",
                      label: t("project.detail.addedAt"),
                      render: (_val: unknown, pm: ProjectModule) => (
                        <span className="text-sm text-muted-foreground">
                          {new Date(pm.createdAt).toLocaleDateString()}
                        </span>
                      ),
                    },
                  ]}
                  actions={[
                    {
                      label: t("project.detail.removeModule"),
                      icon: Trash2,
                      onClick: (pm: ProjectModule) => handleRemoveModule(pm.moduleId),
                      variant: "destructive",
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Module Modal */}
      <GenericModal
        open={addModuleModalOpen}
        onOpenChange={setAddModuleModalOpen}
        title={t("project.detail.addModule")}
        description={t("project.detail.addModuleDescription", { projectName: project.name })}
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
            {filteredModules.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {t("project.detail.noModulesAvailable")}
              </div>
            ) : (
              filteredModules.map((module) => (
                <div key={module.id} className="flex items-center space-x-2 p-2 border rounded">
                  <Checkbox
                    checked={selectedModuleIds.has(module.id)}
                    onCheckedChange={(checked) => {
                      setSelectedModuleIds(prev => {
                        const newSet = new Set(prev);
                        if (checked) {
                          newSet.add(module.id);
                        } else {
                          newSet.delete(module.id);
                        }
                        return newSet;
                      });
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{module.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {module.description || "-"}
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
                setAddModuleModalOpen(false);
                setSelectedModuleIds(new Set());
                setSearchQuery("");
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleAddModules}
              disabled={selectedModuleIds.size === 0}
            >
              {t("project.detail.addSelected")}
            </Button>
          </div>
        </div>
      </GenericModal>
    </div>
  );
}

