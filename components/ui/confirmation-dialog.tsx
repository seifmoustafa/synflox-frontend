"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { appLogger } from "@/lib/logger"
import { useI18n } from "@/providers/i18n-provider"

export interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  variant?: "destructive" | "warning" | "info" | "default"
  icon?: React.ReactNode
  isLoading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  variant = "default",
  icon,
  isLoading = false,
}: ConfirmationDialogProps) {
  const { t } = useI18n();
  
  const variantConfig = {
    destructive: {
      icon: Trash2,
      iconColor: "text-red-500",
      confirmVariant: "destructive" as const,
      title: t("confirmationDialog.deleteItem"),
      description: t("confirmationDialog.deleteDescription"),
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
      confirmVariant: "default" as const,
      title: t("confirmationDialog.warning"),
      description: t("confirmationDialog.warningDescription"),
    },
    info: {
      icon: Info,
      iconColor: "text-blue-500",
      confirmVariant: "default" as const,
      title: t("confirmationDialog.information"),
      description: t("confirmationDialog.infoDescription"),
    },
    default: {
      icon: CheckCircle,
      iconColor: "text-green-500",
      confirmVariant: "default" as const,
      title: t("confirmationDialog.confirmAction"),
      description: t("confirmationDialog.defaultDescription"),
    },
  };
  
  const config = variantConfig[variant]
  const IconComponent = config.icon
  const defaultConfirmText = confirmText || t("common.confirm");
  const defaultCancelText = cancelText || t("common.cancel");
  
  const handleConfirm = async () => {
    try {
      await onConfirm()
    } catch (error) {
      appLogger.error("Confirmation action failed:", error)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {icon || (
              <div className={cn("flex-shrink-0", config.iconColor)}>
                <IconComponent className="h-6 w-6" />
              </div>
            )}
            <AlertDialogTitle className="text-left">
              {title ?? config.title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left mt-2">
            {description ?? config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {defaultCancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={config.confirmVariant}
              onClick={handleConfirm}
              disabled={isLoading}
              className="min-w-[80px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Loading...
                </div>
              ) : (
                defaultConfirmText
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Hook for easier usage
export function useConfirmationDialog() {
  const [dialogState, setDialogState] = React.useState<{
    open: boolean
    props: Omit<ConfirmationDialogProps, "open" | "onOpenChange">
  }>({
    open: false,
    props: {
      onConfirm: () => {},
    },
  })

  const showConfirmation = React.useCallback(
    (props: Omit<ConfirmationDialogProps, "open" | "onOpenChange">) => {
      setDialogState({
        open: true,
        props,
      })
    },
    []
  )

  const hideConfirmation = React.useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      open: false,
    }))
  }, [])

  const ConfirmationDialogComponent = React.useCallback(
    () => (
      <ConfirmationDialog
        {...dialogState.props}
        open={dialogState.open}
        onOpenChange={hideConfirmation}
      />
    ),
    [dialogState, hideConfirmation]
  )

  return {
    showConfirmation,
    hideConfirmation,
    ConfirmationDialog: ConfirmationDialogComponent,
  }
}
