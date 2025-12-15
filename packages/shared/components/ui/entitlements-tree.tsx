"use client";

import * as React from "react";
import { ChevronRight, ChevronDown, Check, Minus, Package, Layers, Loader2, Trash2, Edit } from "lucide-react";
import { cn } from "@shared/lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";

export interface EntitlementNode {
  id: string;
  name: string;
  type: "project" | "module" | "feature";
  accessLevel?: "full" | "read" | "none";
  children?: EntitlementNode[];
  description?: string;
}

interface EntitlementsTreeProps {
  data?: EntitlementNode[];
  entitlements?: any[];
  className?: string;
  onNodeClick?: (node: EntitlementNode) => void;
  selectedNodeId?: string;
  showAccessLevel?: boolean;
  loading?: boolean;
  readonly?: boolean;
  onUpdate?: (request: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

interface TreeNodeProps {
  node: EntitlementNode;
  level: number;
  onNodeClick?: (node: EntitlementNode) => void;
  selectedNodeId?: string;
  showAccessLevel?: boolean;
}

function TreeNode({ node, level, onNodeClick, selectedNodeId, showAccessLevel = true }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNodeId === node.id;

  const getAccessLevelColor = (level?: string) => {
    switch (level) {
      case "full":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "read":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "none":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getTypeIcon = () => {
    switch (node.type) {
      case "project":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "module":
        return <Layers className="h-4 w-4 text-purple-500" />;
      case "feature":
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors",
          "hover:bg-muted/50",
          isSelected && "bg-primary/10 border border-primary/20"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          }
          onNodeClick?.(node);
        }}
      >
        {hasChildren ? (
          <button
            className="p-0.5 hover:bg-muted rounded"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        
        {getTypeIcon()}
        
        <span className="flex-1 text-sm font-medium truncate">{node.name}</span>
        
        {showAccessLevel && node.accessLevel && (
          <Badge variant="secondary" className={cn("text-xs", getAccessLevelColor(node.accessLevel))}>
            {node.accessLevel}
          </Badge>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onNodeClick={onNodeClick}
              selectedNodeId={selectedNodeId}
              showAccessLevel={showAccessLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function EntitlementsTree({
  data,
  entitlements,
  className,
  onNodeClick,
  selectedNodeId,
  showAccessLevel = true,
  loading = false,
  readonly = false,
  onUpdate,
  onDelete,
}: EntitlementsTreeProps) {
  // Support both data and entitlements props
  const items = data || entitlements || [];

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground p-4 text-center", className)}>
        No entitlements available
      </div>
    );
  }

  // If entitlements are passed (flat array format from API), render a simple list
  if (entitlements && !data) {
    return (
      <div className={cn("rounded-md border divide-y", className)}>
        {entitlements.map((item: any) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Package className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">{item.projectName || item.moduleName || item.name}</p>
                {item.moduleName && item.projectName && (
                  <p className="text-xs text-muted-foreground">{item.projectName}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {item.accessLevel || "full"}
              </Badge>
              {onUpdate && (
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border p-2", className)}>
      {items.map((node: any) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
          showAccessLevel={showAccessLevel}
        />
      ))}
    </div>
  );
}
