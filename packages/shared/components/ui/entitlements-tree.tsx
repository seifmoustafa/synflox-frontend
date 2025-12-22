"use client";

import * as React from "react";
import {
  ChevronRight,
  ChevronDown,
  Package,
  Layers,
  Loader2,
  Trash2,
  Plus,
  Eye,
  Pencil,
  Trash,
  Download,
  Menu,
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Copy,
  Settings2,
  Unlock,
  Lock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@shared/lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { Switch } from "./switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { Separator } from "./separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

// Entitlement data structure from API
export interface PlanEntitlementData {
  id: string;
  planId: string;
  planName?: string;
  projectId?: string | null;
  projectName?: string | null;
  moduleId?: string | null;
  moduleName?: string | null;
  parentProjectId?: string | null;
  parentProjectName?: string | null;
  isOverride?: boolean;
  targetType: string;
  targetName: string;
  isModuleUnderProject?: boolean;
  isStandaloneModule?: boolean;
  isProjectEntitlement?: boolean;
  accessLevel: number | string;
  accessLevelDisplay?: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
  displayInMenu: boolean;
  features?: string | null;
  hasFullAccess?: boolean;
  isActive?: boolean;
}

interface EntitlementsTreeProps {
  entitlements?: PlanEntitlementData[];
  className?: string;
  loading?: boolean;
  readonly?: boolean;
  planId?: string;
  onUpdate?: (id: string, updates: Partial<PlanEntitlementData>) => Promise<void>;
  onBulkUpdate?: (ids: string[], updates: Partial<PlanEntitlementData>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCreate?: () => void;
}

// Permission toggle component
function PermissionToggle({
  enabled,
  icon: Icon,
  label,
  onToggle,
  disabled = false,
  size = "md"
}: {
  enabled: boolean;
  icon: React.ElementType;
  label: string;
  onToggle?: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  const sizeClasses = size === "sm" ? "w-6 h-6" : "w-8 h-8";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onToggle}
            disabled={disabled}
            className={cn(
              "flex items-center justify-center rounded-md transition-all duration-200",
              sizeClasses,
              enabled
                ? "bg-green-500/20 text-green-500 hover:bg-green-500/30 ring-1 ring-green-500/30"
                : "bg-muted/50 text-muted-foreground/40 hover:bg-muted hover:text-muted-foreground/70",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Icon className={iconSize} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">
            {enabled ? "Enabled" : "Disabled"} - Click to toggle
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Permission group header for bulk actions
function PermissionGroupHeader({
  entitlement,
  onBulkApply,
  onToggleAll,
  isUpdating,
}: {
  entitlement: PlanEntitlementData;
  onBulkApply?: () => void;
  onToggleAll?: (enabled: boolean) => void;
  isUpdating?: boolean;
}) {
  const allEnabled = entitlement.canCreate && entitlement.canRead &&
    entitlement.canUpdate && entitlement.canDelete &&
    entitlement.canExport && entitlement.displayInMenu;

  return (
    <div className="flex items-center gap-2 mb-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={allEnabled ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => onToggleAll?.(!allEnabled)}
              disabled={isUpdating}
            >
              {allEnabled ? (
                <>
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Full Access
                </>
              ) : (
                <>
                  <Shield className="h-3 w-3 mr-1" />
                  Grant All
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {allEnabled ? "Click to revoke all permissions" : "Click to grant all permissions"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {onBulkApply && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={onBulkApply}
                disabled={isUpdating}
              >
                <Copy className="h-3 w-3 mr-1" />
                Apply to Children
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Apply these permissions to all child modules
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

// Single module row component
function ModuleRow({
  entitlement,
  parentPermissions,
  onUpdate,
  onDelete,
  readonly = false,
}: {
  entitlement: PlanEntitlementData;
  parentPermissions?: PlanEntitlementData;
  onUpdate?: (id: string, updates: Partial<PlanEntitlementData>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  readonly?: boolean;
}) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [localState, setLocalState] = React.useState(entitlement);

  React.useEffect(() => {
    setLocalState(entitlement);
  }, [entitlement]);

  const handlePermissionToggle = async (field: keyof PlanEntitlementData) => {
    if (!onUpdate || readonly) return;
    const newValue = !localState[field as keyof typeof localState];
    setLocalState(prev => ({ ...prev, [field]: newValue }));
    setIsUpdating(true);
    try {
      await onUpdate(entitlement.id, { [field]: newValue });
    } catch {
      // Revert on error
      setLocalState(entitlement);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOverrideToggle = async () => {
    if (!onUpdate || readonly) return;
    const newValue = !localState.isOverride;
    setLocalState(prev => ({ ...prev, isOverride: newValue }));
    setIsUpdating(true);
    try {
      await onUpdate(entitlement.id, { isOverride: newValue });
    } catch {
      // Revert on error
      setLocalState(entitlement);
    } finally {
      setIsUpdating(false);
    }
  };

  const inheritsFromParent = parentPermissions && !localState.isOverride;

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ml-8 border-l-2",
      inheritsFromParent
        ? "border-blue-500/30 bg-blue-500/5"
        : "border-muted hover:bg-muted/50",
      isUpdating && "opacity-60"
    )}>
      {/* Module Icon */}
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500">
        <Layers className="h-4 w-4" />
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">
            {localState.moduleName || localState.targetName}
          </span>
          {localState.isOverride && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-orange-500/10 text-orange-600 border-orange-500/20">
              <Unlock className="h-2.5 w-2.5 mr-0.5" />
              Override
            </Badge>
          )}
          {inheritsFromParent && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-600 border-blue-500/20">
              <Lock className="h-2.5 w-2.5 mr-0.5" />
              Inherited
            </Badge>
          )}
        </div>
      </div>

      {/* Override Toggle - only for modules under projects */}
      {parentPermissions && !readonly && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={localState.isOverride ? "default" : "outline"}
                className="h-7 text-xs"
                onClick={handleOverrideToggle}
                disabled={isUpdating}
              >
                {localState.isOverride ? (
                  <>
                    <Unlock className="h-3 w-3 mr-1" />
                    Custom
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Inherit
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {localState.isOverride
                ? "Using custom permissions - click to inherit from project"
                : "Inheriting from project - click to customize"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Permissions Grid */}
      <div className={cn(
        "flex items-center gap-1 rounded-lg p-1",
        inheritsFromParent ? "bg-blue-500/10" : "bg-muted/30"
      )}>
        <PermissionToggle
          enabled={inheritsFromParent ? parentPermissions!.canCreate : localState.canCreate}
          icon={Plus}
          label="Create"
          onToggle={() => handlePermissionToggle('canCreate')}
          disabled={readonly || isUpdating || inheritsFromParent}
          size="sm"
        />
        <PermissionToggle
          enabled={inheritsFromParent ? parentPermissions!.canRead : localState.canRead}
          icon={Eye}
          label="Read"
          onToggle={() => handlePermissionToggle('canRead')}
          disabled={readonly || isUpdating || inheritsFromParent}
          size="sm"
        />
        <PermissionToggle
          enabled={inheritsFromParent ? parentPermissions!.canUpdate : localState.canUpdate}
          icon={Pencil}
          label="Update"
          onToggle={() => handlePermissionToggle('canUpdate')}
          disabled={readonly || isUpdating || inheritsFromParent}
          size="sm"
        />
        <PermissionToggle
          enabled={inheritsFromParent ? parentPermissions!.canDelete : localState.canDelete}
          icon={Trash}
          label="Delete"
          onToggle={() => handlePermissionToggle('canDelete')}
          disabled={readonly || isUpdating || inheritsFromParent}
          size="sm"
        />
        <PermissionToggle
          enabled={inheritsFromParent ? parentPermissions!.canExport : localState.canExport}
          icon={Download}
          label="Export"
          onToggle={() => handlePermissionToggle('canExport')}
          disabled={readonly || isUpdating || inheritsFromParent}
          size="sm"
        />
        <div className="w-px h-4 bg-border mx-0.5" />
        <PermissionToggle
          enabled={inheritsFromParent ? parentPermissions!.displayInMenu : localState.displayInMenu}
          icon={Menu}
          label="Show in Menu"
          onToggle={() => handlePermissionToggle('displayInMenu')}
          disabled={readonly || isUpdating || inheritsFromParent}
          size="sm"
        />
      </div>

      {/* Delete Button */}
      {!readonly && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete?.(entitlement.id)}
                disabled={isUpdating}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove this module</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {isUpdating && (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}

// Project row component with expandable modules
function ProjectRow({
  entitlement,
  childModules = [],
  onUpdate,
  onBulkUpdate,
  onDelete,
  readonly = false,
}: {
  entitlement: PlanEntitlementData;
  childModules?: PlanEntitlementData[];
  onUpdate?: (id: string, updates: Partial<PlanEntitlementData>) => Promise<void>;
  onBulkUpdate?: (ids: string[], updates: Partial<PlanEntitlementData>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  readonly?: boolean;
}) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [localState, setLocalState] = React.useState(entitlement);

  React.useEffect(() => {
    setLocalState(entitlement);
  }, [entitlement]);

  const handlePermissionToggle = async (field: keyof PlanEntitlementData) => {
    if (!onUpdate || readonly) return;
    const newValue = !localState[field as keyof typeof localState];
    setLocalState(prev => ({ ...prev, [field]: newValue }));
    setIsUpdating(true);
    try {
      await onUpdate(entitlement.id, { [field]: newValue });
    } catch {
      setLocalState(entitlement);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleAll = async (enabled: boolean) => {
    if (!onUpdate || readonly) return;
    const updates = {
      canCreate: enabled,
      canRead: enabled,
      canUpdate: enabled,
      canDelete: enabled,
      canExport: enabled,
      displayInMenu: enabled,
    };
    setLocalState(prev => ({ ...prev, ...updates }));
    setIsUpdating(true);
    try {
      await onUpdate(entitlement.id, updates);
    } catch {
      setLocalState(entitlement);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApplyToChildren = async () => {
    if (!onBulkUpdate || readonly || childModules.length === 0) return;
    const childIds = childModules.map(m => m.id);
    const updates = {
      canCreate: localState.canCreate,
      canRead: localState.canRead,
      canUpdate: localState.canUpdate,
      canDelete: localState.canDelete,
      canExport: localState.canExport,
      displayInMenu: localState.displayInMenu,
      isOverride: false, // Reset to inherit
    };
    setIsUpdating(true);
    try {
      await onBulkUpdate(childIds, updates);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className={cn(
        "rounded-lg border bg-card transition-all duration-200",
        isExpanded && "ring-1 ring-primary/20",
        isUpdating && "opacity-60"
      )}>
        {/* Project Header */}
        <div className="flex items-center gap-3 p-4">
          {/* Expand/Collapse */}
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>

          {/* Project Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500">
            <Package className="h-5 w-5" />
          </div>

          {/* Name and Module Count */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">
                {localState.projectName || localState.targetName}
              </span>
              <Badge variant="secondary" className="text-xs">
                {childModules.length} modules
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Permissions cascade to child modules unless overridden
            </p>
          </div>

          {/* Bulk Actions */}
          {!readonly && (
            <div className="flex items-center gap-2">
              <PermissionGroupHeader
                entitlement={localState}
                onToggleAll={handleToggleAll}
                onBulkApply={childModules.length > 0 ? handleApplyToChildren : undefined}
                isUpdating={isUpdating}
              />
            </div>
          )}

          {/* Permissions Grid */}
          <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1.5">
            <PermissionToggle
              enabled={localState.canCreate}
              icon={Plus}
              label="Create"
              onToggle={() => handlePermissionToggle('canCreate')}
              disabled={readonly || isUpdating}
            />
            <PermissionToggle
              enabled={localState.canRead}
              icon={Eye}
              label="Read"
              onToggle={() => handlePermissionToggle('canRead')}
              disabled={readonly || isUpdating}
            />
            <PermissionToggle
              enabled={localState.canUpdate}
              icon={Pencil}
              label="Update"
              onToggle={() => handlePermissionToggle('canUpdate')}
              disabled={readonly || isUpdating}
            />
            <PermissionToggle
              enabled={localState.canDelete}
              icon={Trash}
              label="Delete"
              onToggle={() => handlePermissionToggle('canDelete')}
              disabled={readonly || isUpdating}
            />
            <PermissionToggle
              enabled={localState.canExport}
              icon={Download}
              label="Export"
              onToggle={() => handlePermissionToggle('canExport')}
              disabled={readonly || isUpdating}
            />
            <div className="w-px h-6 bg-border mx-1" />
            <PermissionToggle
              enabled={localState.displayInMenu}
              icon={Menu}
              label="Show in Menu"
              onToggle={() => handlePermissionToggle('displayInMenu')}
              disabled={readonly || isUpdating}
            />
          </div>

          {/* Delete Button */}
          {!readonly && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete?.(entitlement.id)}
                    disabled={isUpdating}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove project and all modules</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {isUpdating && (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          )}
        </div>

        {/* Child Modules */}
        <CollapsibleContent>
          {childModules.length > 0 && (
            <div className="px-4 pb-4 space-y-2">
              <Separator className="mb-3" />
              <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                <Layers className="h-3 w-3" />
                Child Modules
              </div>
              {childModules.map((module) => (
                <ModuleRow
                  key={module.id}
                  entitlement={module}
                  parentPermissions={localState}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  readonly={readonly}
                />
              ))}
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// Standalone module row
function StandaloneModuleRow({
  entitlement,
  onUpdate,
  onDelete,
  readonly = false,
}: {
  entitlement: PlanEntitlementData;
  onUpdate?: (id: string, updates: Partial<PlanEntitlementData>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  readonly?: boolean;
}) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [localState, setLocalState] = React.useState(entitlement);

  React.useEffect(() => {
    setLocalState(entitlement);
  }, [entitlement]);

  const handlePermissionToggle = async (field: keyof PlanEntitlementData) => {
    if (!onUpdate || readonly) return;
    const newValue = !localState[field as keyof typeof localState];
    setLocalState(prev => ({ ...prev, [field]: newValue }));
    setIsUpdating(true);
    try {
      await onUpdate(entitlement.id, { [field]: newValue });
    } catch {
      setLocalState(entitlement);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleAll = async (enabled: boolean) => {
    if (!onUpdate || readonly) return;
    const updates = {
      canCreate: enabled,
      canRead: enabled,
      canUpdate: enabled,
      canDelete: enabled,
      canExport: enabled,
      displayInMenu: enabled,
    };
    setLocalState(prev => ({ ...prev, ...updates }));
    setIsUpdating(true);
    try {
      await onUpdate(entitlement.id, updates);
    } catch {
      setLocalState(entitlement);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-lg border bg-card transition-all duration-200 hover:shadow-sm",
      isUpdating && "opacity-60"
    )}>
      {/* Module Icon */}
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500">
        <Layers className="h-5 w-5" />
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold truncate">
            {localState.moduleName || localState.targetName}
          </span>
          <Badge variant="outline" className="text-xs">
            Standalone
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Independent module - not part of any project
        </p>
      </div>

      {/* Quick Actions */}
      {!readonly && (
        <PermissionGroupHeader
          entitlement={localState}
          onToggleAll={handleToggleAll}
          isUpdating={isUpdating}
        />
      )}

      {/* Permissions Grid */}
      <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1.5">
        <PermissionToggle
          enabled={localState.canCreate}
          icon={Plus}
          label="Create"
          onToggle={() => handlePermissionToggle('canCreate')}
          disabled={readonly || isUpdating}
        />
        <PermissionToggle
          enabled={localState.canRead}
          icon={Eye}
          label="Read"
          onToggle={() => handlePermissionToggle('canRead')}
          disabled={readonly || isUpdating}
        />
        <PermissionToggle
          enabled={localState.canUpdate}
          icon={Pencil}
          label="Update"
          onToggle={() => handlePermissionToggle('canUpdate')}
          disabled={readonly || isUpdating}
        />
        <PermissionToggle
          enabled={localState.canDelete}
          icon={Trash}
          label="Delete"
          onToggle={() => handlePermissionToggle('canDelete')}
          disabled={readonly || isUpdating}
        />
        <PermissionToggle
          enabled={localState.canExport}
          icon={Download}
          label="Export"
          onToggle={() => handlePermissionToggle('canExport')}
          disabled={readonly || isUpdating}
        />
        <div className="w-px h-6 bg-border mx-1" />
        <PermissionToggle
          enabled={localState.displayInMenu}
          icon={Menu}
          label="Show in Menu"
          onToggle={() => handlePermissionToggle('displayInMenu')}
          disabled={readonly || isUpdating}
        />
      </div>

      {/* Delete Button */}
      {!readonly && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete?.(entitlement.id)}
                disabled={isUpdating}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove module</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {isUpdating && (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      )}
    </div>
  );
}

export function EntitlementsTree({
  entitlements,
  className,
  loading = false,
  readonly = false,
  planId,
  onUpdate,
  onBulkUpdate,
  onDelete,
  onCreate,
}: EntitlementsTreeProps) {
  const items = entitlements || [];

  // Group entitlements
  const groupedEntitlements = React.useMemo(() => {
    const projects = items.filter(e => e.isProjectEntitlement || e.targetType === "Project");
    const standaloneModules = items.filter(e =>
      (e.isStandaloneModule || e.targetType === "Module") && !e.parentProjectId
    );

    // Build a map of project ID to child modules
    const projectModulesMap = new Map<string, PlanEntitlementData[]>();
    items.forEach(e => {
      if (e.targetType === "Module" && e.parentProjectId) {
        const existing = projectModulesMap.get(e.parentProjectId) || [];
        existing.push(e);
        projectModulesMap.set(e.parentProjectId, existing);
      }
    });

    return { projects, standaloneModules, projectModulesMap };
  }, [items]);

  if (loading) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-16", className)}>
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading entitlements...</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-16 border-2 border-dashed rounded-xl",
        className
      )}>
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Entitlements Configured</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          Add projects and modules to this plan to configure granular access permissions.
          Each entitlement can have Create, Read, Update, Delete, and Export permissions.
        </p>
        {onCreate && (
          <Button onClick={onCreate} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add First Entitlement
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground border rounded-lg px-3 py-1.5">
            <span className="font-medium">Legend:</span>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center">
                <Plus className="h-3 w-3 text-green-500" />
              </div>
              <span>C</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center">
                <Eye className="h-3 w-3 text-green-500" />
              </div>
              <span>R</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center">
                <Pencil className="h-3 w-3 text-green-500" />
              </div>
              <span>U</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center">
                <Trash className="h-3 w-3 text-green-500" />
              </div>
              <span>D</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center">
                <Download className="h-3 w-3 text-green-500" />
              </div>
              <span>E</span>
            </div>
          </div>
        </div>
        {onCreate && !readonly && (
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entitlement
          </Button>
        )}
      </div>

      {/* Projects */}
      {groupedEntitlements.projects.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Package className="h-4 w-4" />
            Projects ({groupedEntitlements.projects.length})
          </div>
          {groupedEntitlements.projects.map((project) => (
            <ProjectRow
              key={project.id}
              entitlement={project}
              childModules={groupedEntitlements.projectModulesMap.get(project.projectId || '') || []}
              onUpdate={onUpdate}
              onBulkUpdate={onBulkUpdate}
              onDelete={onDelete}
              readonly={readonly}
            />
          ))}
        </div>
      )}

      {/* Standalone Modules */}
      {groupedEntitlements.standaloneModules.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mt-6">
            <Layers className="h-4 w-4" />
            Standalone Modules ({groupedEntitlements.standaloneModules.length})
          </div>
          {groupedEntitlements.standaloneModules.map((module) => (
            <StandaloneModuleRow
              key={module.id}
              entitlement={module}
              onUpdate={onUpdate}
              onDelete={onDelete}
              readonly={readonly}
            />
          ))}
        </div>
      )}
    </div>
  );
}
