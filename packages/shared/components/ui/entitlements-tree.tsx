"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
  Shield,
  Eye,
  Pencil,
  Trash2,
  Download,
  Plus,
  Check,
  X,
} from "lucide-react";
import { useI18n } from "@/providers/i18n-provider";
import { useSettings } from "@/providers/settings-provider";
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

/**
 * Access Level Presets - defines what permissions each level has
 */
function getPermissionsForAccessLevel(level: EntitlementAccessLevel) {
  switch (level) {
    case EntitlementAccessLevel.Full:
      return { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canExport: true };
    case EntitlementAccessLevel.ReadOnly:
      return { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canExport: true };
    case EntitlementAccessLevel.ExportOnly:
      return { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canExport: true };
    case EntitlementAccessLevel.Blocked:
    case EntitlementAccessLevel.None:
    default:
      return { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canExport: false };
  }
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

  const handleAccessLevelChange = useCallback(async (
    entitlement: PlanEntitlement, 
    level: EntitlementAccessLevel
  ) => {
    if (!onUpdate || readonly) return;

    // Get permissions for this access level
    const permissions = getPermissionsForAccessLevel(level);

    // Check if this is a project with overridden children
    if (entitlement.isProjectEntitlement) {
      const children = entitlements.filter(e => e.parentProjectId === entitlement.projectId);
      const hasOverrides = children.some(c => c.isOverride);
      
      if (hasOverrides) {
        setConfirmDialog({
          open: true,
          type: 'cascade',
          entitlement,
          pendingUpdate: new UpdatePlanEntitlementRequest({
            id: entitlement.id,
            accessLevel: level,
            ...permissions,
            resetChildOverrides: true,
          }),
        });
        return;
      }
    }

    // Update with new access level AND corresponding permissions
    await onUpdate(new UpdatePlanEntitlementRequest({
      id: entitlement.id,
      accessLevel: level,
      ...permissions,
    }));
  }, [onUpdate, readonly, entitlements]);

  const handleConfirmCascade = async () => {
    if (confirmDialog.pendingUpdate && onUpdate) {
      await onUpdate(confirmDialog.pendingUpdate);
    }
    setConfirmDialog({ open: false, type: 'cascade', entitlement: null });
  };

  const handleConfirmDelete = async () => {
    if (confirmDialog.entitlement && onDelete) {
      await onDelete(confirmDialog.entitlement.id);
    }
    setConfirmDialog({ open: false, type: 'cascade', entitlement: null });
  };

  // Access level options for dropdown
  const accessLevelOptions = [
    { value: String(EntitlementAccessLevel.Full), label: t("entitlements.accessFull") || "Full Access" },
    { value: String(EntitlementAccessLevel.ReadOnly), label: t("entitlements.accessReadOnly") || "Read Only" },
    { value: String(EntitlementAccessLevel.ExportOnly), label: t("entitlements.accessExportOnly") || "Export Only" },
    { value: String(EntitlementAccessLevel.Blocked), label: t("entitlements.accessBlocked") || "Blocked" },
  ];

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!entitlements.length) {
    return (
      <div className={cn("text-center py-12 text-muted-foreground", className)}>
        <Shield className="h-16 w-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">{t("entitlements.planNoEntitlements") || "No Entitlements"}</p>
        <p className="text-sm mt-2 max-w-md mx-auto">
          {t("entitlements.addProjectsFirst") || "Add projects or modules to this plan to configure access permissions"}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            <Shield className="h-3.5 w-3.5" />
            <span className="font-medium">{entitlements.length}</span>
            <span className="text-muted-foreground">{t("entitlements.items") || "items"}</span>
          </Badge>
        </div>

        {/* Tree Items */}
        <div className="space-y-3">
          {tree.map(node => (
            <EntitlementCard
              key={node.entitlement.id}
              node={node}
              level={0}
              expanded={expanded}
              onToggle={toggleNode}
              onAccessLevelChange={handleAccessLevelChange}
              readonly={readonly}
              direction={direction}
              t={t}
              accessLevelOptions={accessLevelOptions}
            />
          ))}
        </div>

        {/* Dialogs */}
        <AlertDialog 
          open={confirmDialog.open && confirmDialog.type === 'cascade'} 
          onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, open: false })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                {t("entitlements.cascadeWarningTitle") || "Reset Child Permissions?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("entitlements.cascadeWarningMessage") || 
                  "Some modules under this project have custom permissions. Changing this will reset all child permissions."}
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
                  `Delete entitlement for "${confirmDialog.entitlement?.targetName}"?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

// ============ Entitlement Card Component ============

interface EntitlementCardProps {
  node: EntitlementTreeNode;
  level: number;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  onAccessLevelChange: (entitlement: PlanEntitlement, level: EntitlementAccessLevel) => void;
  readonly: boolean;
  direction: 'ltr' | 'rtl';
  t: (key: string) => string;
  accessLevelOptions: { value: string; label: string }[];
}

function EntitlementCard({
  node,
  level,
  expanded,
  onToggle,
  onAccessLevelChange,
  readonly,
  direction,
  t,
  accessLevelOptions,
}: EntitlementCardProps) {
  const { entitlement, children } = node;
  const isOpen = expanded[entitlement.id] ?? true;
  const hasChildren = children.length > 0;
  const isRtl = direction === 'rtl';
  
  // Get permissions based on access level
  const permissions = getPermissionsForAccessLevel(entitlement.accessLevel);

  // Permission indicator - shows what's enabled by the access level
  const PermissionIndicator = ({ 
    enabled, 
    icon: Icon, 
    label,
  }: { 
    enabled: boolean;
    icon: React.ElementType;
    label: string;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "h-7 w-7 rounded flex items-center justify-center transition-all",
          enabled 
            ? "text-primary bg-primary/10" 
            : "text-muted-foreground/40 bg-muted/40"
        )}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <div className="flex items-center gap-2">
          {enabled ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <X className="h-3 w-3 text-red-400" />
          )}
          <span>{label}</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div className="space-y-1">
      {/* Node Row - matches tree-view style */}
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors",
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

        {/* Type Icon */}
        {entitlement.isProjectEntitlement ? (
          isOpen && hasChildren ? (
            <FolderOpen className="h-5 w-5 text-primary shrink-0" />
          ) : (
            <Folder className="h-5 w-5 text-primary shrink-0" />
          )
        ) : (
          <Package className="h-5 w-5 text-muted-foreground shrink-0" />
        )}

        {/* Name & Badge */}
        <div className="flex-1 min-w-[120px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "font-medium",
              entitlement.isProjectEntitlement ? "text-primary" : "text-foreground"
            )}>
              {entitlement.targetName || entitlement.projectName || entitlement.moduleName || "Unknown"}
            </span>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {entitlement.isProjectEntitlement 
                ? (t("entitlements.projectType") || "Project")
                : entitlement.isStandaloneModule 
                  ? (t("entitlements.standalone") || "Standalone") 
                  : (t("entitlements.moduleType") || "Module")}
            </Badge>
          </div>
        </div>

        {/* Access Level Dropdown */}
        <GenericSelect
          type="single"
          options={accessLevelOptions}
          value={String(entitlement.accessLevel)}
          onValueChange={(value: string | string[]) => {
            const val = typeof value === 'string' ? value : value[0];
            onAccessLevelChange(entitlement, Number(val) as EntitlementAccessLevel);
          }}
          disabled={readonly}
          className="w-[130px] h-8 text-xs"
          allowClear={false}
        />

        {/* Permission Indicators - visual only, controlled by access level */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">
          <PermissionIndicator
            enabled={permissions.canCreate}
            icon={Plus}
            label={t("entitlements.createPerm") || "Create"}
          />
          <PermissionIndicator
            enabled={permissions.canRead}
            icon={Eye}
            label={t("entitlements.readPerm") || "Read"}
          />
          <PermissionIndicator
            enabled={permissions.canUpdate}
            icon={Pencil}
            label={t("entitlements.updatePerm") || "Update"}
          />
          <PermissionIndicator
            enabled={permissions.canDelete}
            icon={Trash2}
            label={t("entitlements.deletePerm") || "Delete"}
          />
          <PermissionIndicator
            enabled={permissions.canExport}
            icon={Download}
            label={t("entitlements.exportPerm") || "Export"}
          />
        </div>
      </div>

      {/* Children */}
      {hasChildren && isOpen && (
        <div className="space-y-1">
          {children.map(child => (
            <EntitlementCard
              key={child.entitlement.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              onToggle={onToggle}
              onAccessLevelChange={onAccessLevelChange}
              readonly={readonly}
              direction={direction}
              t={t}
              accessLevelOptions={accessLevelOptions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
