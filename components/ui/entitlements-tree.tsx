"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import GenericSelect from "@/components/ui/generic-select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Package,
  AlertTriangle,
  Check,
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Pencil,
  Trash2,
  Download,
  Plus,
} from "lucide-react";
import { useI18n } from "@/providers/i18n-provider";
import {
  PlanEntitlement,
  EntitlementAccessLevel,
  EntitlementTreeNode,
  buildEntitlementTree,
  UpdatePlanEntitlementRequest,
} from "@/domain";

export interface EntitlementsTreeProps {
  entitlements: PlanEntitlement[];
  loading?: boolean;
  onUpdate?: (request: UpdatePlanEntitlementRequest) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  readonly?: boolean;
  className?: string;
}

export function EntitlementsTree({
  entitlements,
  loading = false,
  onUpdate,
  onDelete,
  readonly = false,
  className,
}: EntitlementsTreeProps) {
  const { t, direction } = useI18n();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isAllExpanded, setIsAllExpanded] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'cascade' | 'delete';
    entitlement: PlanEntitlement | null;
    pendingUpdate?: UpdatePlanEntitlementRequest;
  }>({ open: false, type: 'cascade', entitlement: null });

  // Build tree structure
  const tree = useMemo(() => buildEntitlementTree(entitlements), [entitlements]);

  // Initialize expansion state
  useMemo(() => {
    const initial: Record<string, boolean> = {};
    tree.forEach(node => {
      initial[node.entitlement.id] = true;
    });
    setExpanded(initial);
  }, [tree]);

  const toggleNode = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    tree.forEach(node => {
      all[node.entitlement.id] = true;
    });
    setExpanded(all);
    setIsAllExpanded(true);
  };

  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    tree.forEach(node => {
      all[node.entitlement.id] = false;
    });
    setExpanded(all);
    setIsAllExpanded(false);
  };

  const handleAccessLevelChange = async (entitlement: PlanEntitlement, level: EntitlementAccessLevel) => {
    if (!onUpdate || readonly) return;

    // Check if this is a project with overridden children
    if (entitlement.isProjectEntitlement) {
      const children = entitlements.filter(e => e.parentProjectId === entitlement.projectId);
      const hasOverrides = children.some(c => c.isOverride);
      
      if (hasOverrides) {
        // Show confirmation dialog
        setConfirmDialog({
          open: true,
          type: 'cascade',
          entitlement,
          pendingUpdate: new UpdatePlanEntitlementRequest({
            id: entitlement.id,
            accessLevel: level,
            resetChildOverrides: true,
          }),
        });
        return;
      }
    }

    await onUpdate(new UpdatePlanEntitlementRequest({
      id: entitlement.id,
      accessLevel: level,
    }));
  };

  const handlePermissionChange = async (
    entitlement: PlanEntitlement,
    permission: 'canCreate' | 'canRead' | 'canUpdate' | 'canDelete' | 'canExport' | 'displayInMenu',
    value: boolean
  ) => {
    if (!onUpdate || readonly) return;

    await onUpdate(new UpdatePlanEntitlementRequest({
      id: entitlement.id,
      [permission]: value,
    }));
  };

  const handleConfirmCascade = async () => {
    if (confirmDialog.pendingUpdate && onUpdate) {
      await onUpdate(confirmDialog.pendingUpdate);
    }
    setConfirmDialog({ open: false, type: 'cascade', entitlement: null });
  };

  const handleDelete = async (entitlement: PlanEntitlement) => {
    setConfirmDialog({
      open: true,
      type: 'delete',
      entitlement,
    });
  };

  const handleConfirmDelete = async () => {
    if (confirmDialog.entitlement && onDelete) {
      await onDelete(confirmDialog.entitlement.id);
    }
    setConfirmDialog({ open: false, type: 'cascade', entitlement: null });
  };

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-10 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (!entitlements.length) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>{t("entitlements.planNoEntitlements") || "No entitlements configured"}</p>
        <p className="text-sm mt-1">
          {t("entitlements.addProjectsFirst") || "Add projects or modules to this plan first"}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              {entitlements.length} {t("entitlements.items") || "items"}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={isAllExpanded ? collapseAll : expandAll}
          >
            {isAllExpanded ? t("common.collapseAll") : t("common.expandAll")}
          </Button>
        </div>

        {/* Tree */}
        <div className="space-y-2">
          {tree.map(node => (
            <EntitlementNode
              key={node.entitlement.id}
              node={node}
              level={0}
              expanded={expanded}
              onToggle={toggleNode}
              onAccessLevelChange={handleAccessLevelChange}
              onPermissionChange={handlePermissionChange}
              onDelete={handleDelete}
              readonly={readonly}
              direction={direction}
              t={t}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Folder className="h-3 w-3 text-primary" />
            <span>{t("entitlements.projectType") || "Project"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3 text-muted-foreground" />
            <span>{t("entitlements.moduleType") || "Module"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="h-4 text-[10px]">
              {t("entitlements.inherited") || "Inherited"}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="destructive" className="h-4 text-[10px]">
              {t("entitlements.override") || "Override"}
            </Badge>
          </div>
        </div>

        {/* Confirmation Dialogs */}
        <AlertDialog 
          open={confirmDialog.open && confirmDialog.type === 'cascade'} 
          onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, open: false })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                {t("entitlements.cascadeWarningTitle") || "Override Warning"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("entitlements.cascadeWarningMessage") || 
                  "Some child modules have custom permissions. Changing this project's permission will reset all child overrides."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmCascade}>
                {t("entitlements.resetAndApply") || "Reset & Apply"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog 
          open={confirmDialog.open && confirmDialog.type === 'delete'} 
          onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, open: false })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("common.confirmDelete")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("entitlements.deleteWarning") || 
                  `Are you sure you want to delete this entitlement for "${confirmDialog.entitlement?.targetName}"?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

interface EntitlementNodeProps {
  node: EntitlementTreeNode;
  level: number;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  onAccessLevelChange: (entitlement: PlanEntitlement, level: EntitlementAccessLevel) => void;
  onPermissionChange: (
    entitlement: PlanEntitlement,
    permission: 'canCreate' | 'canRead' | 'canUpdate' | 'canDelete' | 'canExport' | 'displayInMenu',
    value: boolean
  ) => void;
  onDelete: (entitlement: PlanEntitlement) => void;
  readonly: boolean;
  direction: 'ltr' | 'rtl';
  t: (key: string) => string;
}

function EntitlementNode({
  node,
  level,
  expanded,
  onToggle,
  onAccessLevelChange,
  onPermissionChange,
  onDelete,
  readonly,
  direction,
  t,
}: EntitlementNodeProps) {
  const { entitlement, children } = node;
  const isOpen = expanded[entitlement.id] ?? true;
  const hasChildren = children.length > 0;
  const isRtl = direction === 'rtl';

  const accessLevelOptions = [
    { value: EntitlementAccessLevel.None, label: t("entitlements.accessNone") || "None" },
    { value: EntitlementAccessLevel.ReadOnly, label: t("entitlements.accessReadOnly") || "Read Only" },
    { value: EntitlementAccessLevel.Limited, label: t("entitlements.accessLimited") || "Limited" },
    { value: EntitlementAccessLevel.Standard, label: t("entitlements.accessStandard") || "Standard" },
    { value: EntitlementAccessLevel.Full, label: t("entitlements.accessFull") || "Full Access" },
  ];

  const getStatusBadge = () => {
    switch (entitlement.statusType) {
      case 'project':
        return (
          <Badge variant="default" className="gap-1 bg-primary/10 text-primary border-primary/20">
            <Folder className="h-3 w-3" />
            {t("entitlements.projectType") || "Project"}
          </Badge>
        );
      case 'standalone':
        return (
          <Badge variant="secondary" className="gap-1">
            <Package className="h-3 w-3" />
            {t("entitlements.standalone") || "Standalone"}
          </Badge>
        );
      case 'override':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="destructive" className="gap-1">
                <ShieldAlert className="h-3 w-3" />
                {t("entitlements.override") || "Override"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {t("entitlements.overrideTooltip") || "This module has custom permissions different from its parent project"}
            </TooltipContent>
          </Tooltip>
        );
      case 'inherited':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <ShieldCheck className="h-3 w-3" />
                {t("entitlements.inherited") || "Inherited"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {t("entitlements.inheritedTooltip") || `Inherits permissions from ${entitlement.parentProjectName}`}
            </TooltipContent>
          </Tooltip>
        );
    }
  };

  const PermissionToggle = ({ 
    permission, 
    value, 
    icon: Icon, 
    label 
  }: { 
    permission: 'canCreate' | 'canRead' | 'canUpdate' | 'canDelete' | 'canExport';
    value: boolean;
    icon: React.ElementType;
    label: string;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onPermissionChange(entitlement, permission, !value)}
          className={cn(
            "h-7 w-7 rounded flex items-center justify-center transition-colors",
            value 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "bg-muted text-muted-foreground hover:bg-muted/80",
            readonly && "opacity-50 cursor-not-allowed"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {label}: {value ? t("common.yes") : t("common.no")}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div className="space-y-1">
      {/* Node Row */}
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors",
          level > 0 && (isRtl ? "mr-6 border-r-2 border-r-primary/20" : "ml-6 border-l-2 border-l-primary/20"),
          entitlement.isProjectEntitlement && "bg-primary/5 border-primary/20"
        )}
      >
        {/* Expand/Collapse Toggle */}
        <button
          type="button"
          onClick={() => hasChildren && onToggle(entitlement.id)}
          className={cn(
            "h-7 w-7 flex items-center justify-center rounded hover:bg-muted transition-colors shrink-0",
            !hasChildren && "opacity-40 cursor-default"
          )}
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isOpen ? (
              <ChevronDown className="h-4 w-4 text-primary" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          )}
        </button>

        {/* Icon */}
        {entitlement.isProjectEntitlement ? (
          isOpen && hasChildren ? (
            <FolderOpen className="h-5 w-5 text-primary shrink-0" />
          ) : (
            <Folder className="h-5 w-5 text-primary shrink-0" />
          )
        ) : (
          <Package className="h-5 w-5 text-muted-foreground shrink-0" />
        )}

        {/* Name */}
        <div className="flex-1 min-w-[120px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "font-medium",
              entitlement.isProjectEntitlement ? "text-primary" : "text-foreground"
            )}>
              {entitlement.targetName || entitlement.projectName || entitlement.moduleName || "Unknown"}
            </span>
            {getStatusBadge()}
          </div>
        </div>

        {/* Access Level Dropdown */}
        <GenericSelect
          type="single"
          options={accessLevelOptions.map(opt => ({
            value: String(opt.value),
            label: opt.label,
          }))}
          value={String(entitlement.accessLevel)}
          onValueChange={(value: string | string[]) => {
            const val = typeof value === 'string' ? value : value[0];
            onAccessLevelChange(entitlement, Number(val) as EntitlementAccessLevel);
          }}
          disabled={readonly}
          className="w-[130px] h-8 text-xs"
          allowClear={false}
        />

        {/* Permission Toggles */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">
          <PermissionToggle
            permission="canCreate"
            value={entitlement.canCreate}
            icon={Plus}
            label={t("entitlements.createPerm") || "Create"}
          />
          <PermissionToggle
            permission="canRead"
            value={entitlement.canRead}
            icon={Eye}
            label={t("entitlements.readPerm") || "Read"}
          />
          <PermissionToggle
            permission="canUpdate"
            value={entitlement.canUpdate}
            icon={Pencil}
            label={t("entitlements.updatePerm") || "Update"}
          />
          <PermissionToggle
            permission="canDelete"
            value={entitlement.canDelete}
            icon={Trash2}
            label={t("entitlements.deletePerm") || "Delete"}
          />
          <PermissionToggle
            permission="canExport"
            value={entitlement.canExport}
            icon={Download}
            label={t("entitlements.exportPerm") || "Export"}
          />
        </div>

        {/* Menu Visibility Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <Switch
                checked={entitlement.displayInMenu}
                onCheckedChange={(checked: boolean) => !readonly && onPermissionChange(entitlement, 'displayInMenu', checked)}
                disabled={readonly}
                className="h-5 w-9"
              />
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {t("entitlements.showInMenu") || "Show in menu"}: {entitlement.displayInMenu ? t("common.yes") : t("common.no")}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Children */}
      {hasChildren && isOpen && (
        <div className="space-y-1">
          {children.map(child => (
            <EntitlementNode
              key={child.entitlement.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              onToggle={onToggle}
              onAccessLevelChange={onAccessLevelChange}
              onPermissionChange={onPermissionChange}
              onDelete={onDelete}
              readonly={readonly}
              direction={direction}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
