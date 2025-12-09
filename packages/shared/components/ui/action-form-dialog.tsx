"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import { Label } from "@shared/components/ui/label";
import { Switch } from "@shared/components/ui/switch";
import { GenericSelect, type GenericSelectOption } from "@shared/components/ui/generic-select";
import { cn } from "@shared/lib/utils";
import { appLogger } from "@shared/lib/logger";
import { AlertTriangle, CheckCircle, XCircle, Info, Loader2 } from "lucide-react";
import { useI18n } from "@shared/providers/i18n-provider";

/* ========================================
 * TYPE DEFINITIONS
 * ======================================== */

export interface ActionFormField {
  /** Unique field name */
  name: string;
  /** Display label */
  label: string;
  /** Field type */
  type: "text" | "textarea" | "select" | "switch";
  /** Placeholder text */
  placeholder?: string;
  /** Whether field is required */
  required?: boolean;
  /** Default value */
  defaultValue?: string | boolean;
  /** Options for select type */
  options?: { value: string; label: string }[];
  /** Help text below field */
  helpText?: string;
}

export interface ActionFormDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description?: string;
  /** Form fields to display */
  fields: ActionFormField[];
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Callback when form is submitted */
  onSubmit: (values: Record<string, string | boolean>) => void | Promise<void>;
  /** Callback when cancelled */
  onCancel?: () => void;
  /** Visual variant */
  variant?: "default" | "warning" | "destructive" | "info";
  /** Custom icon */
  icon?: React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Items count for bulk actions */
  itemCount?: number;
}

const variantConfig = {
  default: {
    icon: CheckCircle,
    iconColor: "text-green-500",
    confirmVariant: "default" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
    confirmVariant: "default" as const,
  },
  destructive: {
    icon: XCircle,
    iconColor: "text-red-500",
    confirmVariant: "destructive" as const,
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    confirmVariant: "default" as const,
  },
};

/* ========================================
 * COMPONENT
 * ======================================== */

export function ActionFormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  confirmText,
  cancelText,
  onSubmit,
  onCancel,
  variant = "default",
  icon,
  isLoading = false,
  itemCount,
}: ActionFormDialogProps) {
  const { t, language } = useI18n();
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  // Initialize form values from field defaults
  const getInitialValues = React.useCallback(() => {
    const values: Record<string, string | boolean> = {};
    fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        values[field.name] = field.defaultValue;
      } else if (field.type === "switch") {
        values[field.name] = true;
      } else {
        values[field.name] = "";
      }
    });
    return values;
  }, [fields]);

  const [formValues, setFormValues] = React.useState<Record<string, string | boolean>>(getInitialValues);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setFormValues(getInitialValues());
    }
  }, [open, getInitialValues]);

  const handleFieldChange = (name: string, value: string | boolean) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formValues);
      onOpenChange(false);
    } catch (error) {
      appLogger.error("Action form submit failed:", error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  // Replace {count} placeholder in description
  const processedDescription = description?.replace(
    "{count}",
    String(itemCount ?? 0)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {icon || (
              <div className={cn("flex-shrink-0", config.iconColor)}>
                <IconComponent className="h-6 w-6" />
              </div>
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          {processedDescription && (
            <DialogDescription className="mt-2">
              {processedDescription}
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>

              {field.type === "text" && (
                <Input
                  id={field.name}
                  placeholder={field.placeholder}
                  value={(formValues[field.name] as string) || ""}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  required={field.required}
                  disabled={isLoading}
                />
              )}

              {field.type === "textarea" && (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={(formValues[field.name] as string) || ""}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  required={field.required}
                  disabled={isLoading}
                  rows={3}
                />
              )}

              {field.type === "select" && (
                <GenericSelect
                  type="single"
                  options={field.options?.map(opt => ({ value: opt.value, label: opt.label })) || []}
                  value={(formValues[field.name] as string) || ""}
                  onValueChange={(value: string | string[]) => handleFieldChange(field.name, value as string)}
                  placeholder={field.placeholder || t("common.select")}
                  disabled={isLoading}
                />
              )}

              {field.type === "switch" && (
                <div className="flex items-center gap-3">
                  <Switch
                    id={field.name}
                    checked={(formValues[field.name] as boolean) ?? true}
                    onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
                    disabled={isLoading}
                  />
                  {field.helpText && (
                    <span className="text-sm text-muted-foreground">
                      {field.helpText}
                    </span>
                  )}
                </div>
              )}

              {field.type !== "switch" && field.helpText && (
                <p className="text-sm text-muted-foreground">{field.helpText}</p>
              )}
            </div>
          ))}

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelText || t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant={config.confirmVariant}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </div>
              ) : (
                confirmText || t("common.confirm")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ========================================
 * HOOK FOR EASIER USAGE
 * ======================================== */

export interface UseActionFormDialogOptions {
  title: string;
  description?: string;
  fields: ActionFormField[];
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "warning" | "destructive" | "info";
  icon?: React.ReactNode;
}

export function useActionFormDialog() {
  const [dialogState, setDialogState] = React.useState<{
    open: boolean;
    props: UseActionFormDialogOptions & {
      onSubmit: (values: Record<string, string | boolean>) => void | Promise<void>;
      itemCount?: number;
    };
  }>({
    open: false,
    props: {
      title: "",
      fields: [],
      onSubmit: () => {},
    },
  });

  const [isLoading, setIsLoading] = React.useState(false);

  const showActionForm = React.useCallback(
    (
      options: UseActionFormDialogOptions & {
        onSubmit: (values: Record<string, string | boolean>) => void | Promise<void>;
        itemCount?: number;
      }
    ) => {
      setDialogState({
        open: true,
        props: options,
      });
    },
    []
  );

  const hideActionForm = React.useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      open: false,
    }));
    setIsLoading(false);
  }, []);

  const handleSubmit = React.useCallback(
    async (values: Record<string, string | boolean>) => {
      setIsLoading(true);
      try {
        await dialogState.props.onSubmit(values);
        hideActionForm();
      } catch (error) {
        appLogger.error("Action form error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [dialogState.props, hideActionForm]
  );

  const ActionFormDialogComponent = React.useCallback(
    () => (
      <ActionFormDialog
        {...dialogState.props}
        open={dialogState.open}
        onOpenChange={hideActionForm}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    ),
    [dialogState, hideActionForm, handleSubmit, isLoading]
  );

  return {
    showActionForm,
    hideActionForm,
    ActionFormDialog: ActionFormDialogComponent,
    isLoading,
  };
}

/* ========================================
 * PRE-CONFIGURED ACTION DIALOGS
 * ======================================== */

export interface ActionDialogConfig {
  reason: boolean;
  notes: boolean;
  emailLanguage: boolean;
  sendEmail: boolean;
}

/**
 * Get standard fields for company/subscription actions
 */
export function getActionFormFields(
  t: (key: string) => string,
  config: Partial<ActionDialogConfig> = {}
): ActionFormField[] {
  const fields: ActionFormField[] = [];

  if (config.reason !== false) {
    fields.push({
      name: "reason",
      label: t("action.reason"),
      type: "text",
      placeholder: t("action.reasonPlaceholder"),
      required: true,
    });
  }

  if (config.notes) {
    fields.push({
      name: "notes",
      label: t("action.notes"),
      type: "textarea",
      placeholder: t("action.notesPlaceholder"),
      required: false,
    });
  }

  if (config.emailLanguage) {
    fields.push({
      name: "lang",
      label: t("action.emailLanguage"),
      type: "select",
      placeholder: t("action.selectLanguage"),
      defaultValue: "",
      options: [
        { value: "", label: t("action.useDefault") },
        { value: "en", label: "English" },
        { value: "ar", label: "العربية" },
      ],
    });
  }

  if (config.sendEmail !== false) {
    fields.push({
      name: "sendEmailNotification",
      label: t("action.sendEmail"),
      type: "switch",
      defaultValue: true,
      helpText: t("action.sendEmailHelp"),
    });
  }

  return fields;
}
