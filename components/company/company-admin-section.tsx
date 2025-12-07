"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { GenericModal } from "@/components/ui/generic-modal";
import { GenericForm, FieldConfig } from "@/components/forms/generic-form";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Lock,
  Unlock,
  LogOut,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  UserCog,
  Monitor,
  Eye,
} from "lucide-react";
import type {
  CompanyAdminDetails,
  CompanyAdminSession,
} from "@/domain/models/company-admin.model";
import {
  CreateCompanyAdminRequest as CreateRequest,
  UpdateCompanyAdminRequest as UpdateRequest,
  ResetAdminPasswordRequest as ResetRequest,
} from "@/domain/models/company-admin.model";
import { AdminSessionPolicy } from "@/domain/models/enums";

interface CompanyAdminSectionProps {
  companyId: string;
  companyName: string;
}

export function CompanyAdminSection({ companyId, companyName }: CompanyAdminSectionProps) {
  const { companyAdminService } = useServices();
  const { t } = useI18n();

  // State
  const [admin, setAdmin] = useState<CompanyAdminDetails | null>(null);
  const [sessions, setSessions] = useState<CompanyAdminSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(false);

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================================
  // Field Configurations
  // ============================================================================

  const createFormFields: FieldConfig[] = useMemo(() => [
    {
      name: "username",
      label: t("companyAdmin.username"),
      type: "text",
      required: true,
      placeholder: t("companyAdmin.usernamePlaceholder"),
      minLength: 3,
      maxLength: 100,
    },
    {
      name: "password",
      label: t("companyAdmin.password"),
      type: "password",
      required: true,
      placeholder: t("companyAdmin.passwordPlaceholder"),
      minLength: 8,
      maxLength: 100,
    },
    {
      name: "displayName",
      label: t("companyAdmin.displayName"),
      type: "text",
      required: true,
      maxLength: 150,
    },
    {
      name: "email",
      label: t("companyAdmin.email"),
      type: "email",
      required: true,
      maxLength: 200,
    },
    {
      name: "phone",
      label: t("companyAdmin.phone"),
      type: "tel",
      required: true,
      maxLength: 50,
    },
    // Permissions
    {
      name: "canManageDevices",
      label: t("companyAdmin.permissions.manageDevices"),
      type: "switch",
      defaultValue: true,
    },
    {
      name: "canViewSubscriptions",
      label: t("companyAdmin.permissions.viewSubscriptions"),
      type: "switch",
      defaultValue: true,
    },
    {
      name: "canApproveReplacements",
      label: t("companyAdmin.permissions.approveReplacements"),
      type: "switch",
      defaultValue: false,
    },
    {
      name: "canGenerateLicenses",
      label: t("companyAdmin.permissions.generateLicenses"),
      type: "switch",
      defaultValue: false,
    },
    {
      name: "canViewUsageReports",
      label: t("companyAdmin.permissions.viewReports"),
      type: "switch",
      defaultValue: true,
    },
  ], [t]);

  const editFormFields: FieldConfig[] = useMemo(() => [
    {
      name: "displayName",
      label: t("companyAdmin.displayName"),
      type: "text",
      required: true,
      maxLength: 150,
    },
    {
      name: "email",
      label: t("companyAdmin.email"),
      type: "email",
      required: true,
      maxLength: 200,
    },
    {
      name: "phone",
      label: t("companyAdmin.phone"),
      type: "tel",
      required: true,
      maxLength: 50,
    },
    {
      name: "isActive",
      label: t("common.active"),
      type: "switch",
    },
    // Permissions
    {
      name: "canManageDevices",
      label: t("companyAdmin.permissions.manageDevices"),
      type: "switch",
    },
    {
      name: "canViewSubscriptions",
      label: t("companyAdmin.permissions.viewSubscriptions"),
      type: "switch",
    },
    {
      name: "canApproveReplacements",
      label: t("companyAdmin.permissions.approveReplacements"),
      type: "switch",
    },
    {
      name: "canGenerateLicenses",
      label: t("companyAdmin.permissions.generateLicenses"),
      type: "switch",
    },
    {
      name: "canViewUsageReports",
      label: t("companyAdmin.permissions.viewReports"),
      type: "switch",
    },
  ], [t]);

  const resetPasswordFields: FieldConfig[] = useMemo(() => [
    {
      name: "newPassword",
      label: t("companyAdmin.newPassword"),
      type: "password",
      required: true,
      placeholder: t("companyAdmin.newPasswordPlaceholder"),
      minLength: 8,
      maxLength: 100,
    },
    {
      name: "mustChangeOnFirstLogin",
      label: t("companyAdmin.mustChangeOnFirstLogin"),
      type: "switch",
      defaultValue: true,
    },
  ], [t]);

  // ============================================================================
  // Initial Values
  // ============================================================================

  const createInitialValues = useMemo(() => ({
    username: "",
    password: "",
    displayName: "",
    email: "",
    phone: "",
    canManageDevices: true,
    canViewSubscriptions: true,
    canApproveReplacements: false,
    canGenerateLicenses: false,
    canViewUsageReports: true,
  }), []);

  const editInitialValues = useMemo(() => {
    if (!admin) return {};
    return {
      displayName: admin.displayName,
      email: admin.email,
      phone: admin.phone,
      isActive: admin.isActive,
      canManageDevices: admin.canManageDevices,
      canViewSubscriptions: admin.canViewSubscriptions,
      canApproveReplacements: admin.canApproveReplacements,
      canGenerateLicenses: admin.canGenerateLicenses,
      canViewUsageReports: admin.canViewUsageReports,
    };
  }, [admin]);

  const resetPasswordInitialValues = useMemo(() => ({
    newPassword: "",
    mustChangeOnFirstLogin: true,
  }), []);

  // ============================================================================
  // Data Loading
  // ============================================================================

  const loadAdmin = useCallback(async () => {
    setIsLoading(true);
    console.log('[CompanyAdminSection] Loading admin for company:', companyId);
    try {
      // Single API call that returns admin data or null
      const adminData = await companyAdminService.getCompanyAdmin(companyId);
      console.log('[CompanyAdminSection] Received adminData:', adminData);
      console.log('[CompanyAdminSection] adminData is null?', adminData === null);
      console.log('[CompanyAdminSection] adminData type:', typeof adminData);
      
      setAdmin(adminData);
      setHasAdmin(adminData !== null);
      
      console.log('[CompanyAdminSection] State set - hasAdmin:', adminData !== null);
      
      if (adminData) {
        const activeSessions = await companyAdminService.getActiveSessions(adminData.id);
        setSessions(activeSessions);
      }
    } catch (error) {
      console.error('[CompanyAdminSection] Error loading admin:', error);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, companyAdminService]);

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleCreate = async (data: Record<string, any>) => {
    const request = new CreateRequest(
      companyId,
      data.username,
      data.password,
      data.displayName,
      data.email,
      data.phone,
      data.canManageDevices,
      data.canViewSubscriptions,
      data.canApproveReplacements,
      data.canGenerateLicenses,
      data.canViewUsageReports
    );

    const success = await companyAdminService.create(request);
    if (success) {
      setIsCreateOpen(false);
      await loadAdmin();
    }
  };

  const handleUpdate = async (data: Record<string, any>) => {
    if (!admin) return;

    const request = new UpdateRequest(
      data.displayName,
      data.email,
      data.phone,
      data.isActive,
      data.canManageDevices,
      data.canViewSubscriptions,
      data.canApproveReplacements,
      data.canGenerateLicenses,
      data.canViewUsageReports,
      false, // canModifySessionSettings
      AdminSessionPolicy.SingleSession,
      60,
      true,
      30,
      5,
      30,
      90
    );

    const success = await companyAdminService.update(admin.id, request);
    if (success) {
      setIsEditOpen(false);
      await loadAdmin();
    }
  };

  const handleResetPassword = async (data: Record<string, any>) => {
    if (!admin) return;

    const request = new ResetRequest(
      data.newPassword,
      data.mustChangeOnFirstLogin
    );

    const success = await companyAdminService.resetPassword(admin.id, request);
    if (success) {
      setIsResetPasswordOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!admin) return;
    setIsSubmitting(true);
    try {
      const success = await companyAdminService.delete(admin.id);
      if (success) {
        setIsDeleteOpen(false);
        setAdmin(null);
        setHasAdmin(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlock = async () => {
    if (!admin) return;
    const success = await companyAdminService.unlockAccount(admin.id);
    if (success) {
      await loadAdmin();
    }
  };

  const handleTerminateSessions = async () => {
    if (!admin) return;
    const count = await companyAdminService.terminateSessions(admin.id);
    if (count && count > 0) {
      await loadAdmin();
    }
  };

  const handleViewSessions = async () => {
    if (!admin) return;
    const allSessions = await companyAdminService.getSessions(admin.id);
    setSessions(allSessions);
    setIsSessionsOpen(true);
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  // No admin exists - show create option
  if (!hasAdmin || !admin) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              {t("companyAdmin.title")}
            </CardTitle>
            <CardDescription>
              {t("companyAdmin.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <User className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">{t("companyAdmin.noAdmin")}</p>
              <p className="text-muted-foreground mb-6">
                {t("companyAdmin.noAdminDescription", { companyName })}
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 me-2" />
                {t("companyAdmin.createAdmin")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Admin Modal */}
        <GenericModal
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          title={t("companyAdmin.createAdmin")}
          description={t("companyAdmin.createAdminDescription", { companyName })}
          size="md"
          formKey={isCreateOpen ? "create-admin" : undefined}
        >
          <GenericForm
            fields={createFormFields}
            initialValues={createInitialValues}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </GenericModal>
      </>
    );
  }

  // Admin exists - show details
  return (
    <>
      <div className="space-y-6">
        {/* Admin Info Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                {t("companyAdmin.title")}
              </CardTitle>
              <CardDescription>
                {t("companyAdmin.description")}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                <Edit className="h-4 w-4 me-1" />
                {t("common.edit")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Section */}
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{admin.displayName}</h3>
                  <Badge variant={admin.statusColor}>
                    {admin.isLocked ? (
                      <><Lock className="h-3 w-3 me-1" />{t("companyAdmin.status.locked")}</>
                    ) : admin.hasActiveSession ? (
                      <><CheckCircle2 className="h-3 w-3 me-1" />{t("companyAdmin.status.online")}</>
                    ) : admin.isActive ? (
                      t("companyAdmin.status.active")
                    ) : (
                      t("companyAdmin.status.inactive")
                    )}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">@{admin.username}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {admin.email}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {admin.phone}
              </div>
            </div>

            {/* Login Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg border text-center">
                <p className="text-sm font-medium">{admin.lastLoginDisplay}</p>
                <p className="text-xs text-muted-foreground">{t("companyAdmin.lastLogin")}</p>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <p className="text-sm font-medium">{admin.totalLogins}</p>
                <p className="text-xs text-muted-foreground">{t("companyAdmin.totalLogins")}</p>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <p className="text-sm font-medium">{sessions.length}</p>
                <p className="text-xs text-muted-foreground">{t("companyAdmin.activeSessions")}</p>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <p className="text-sm font-medium">{admin.maxFailedAttempts}</p>
                <p className="text-xs text-muted-foreground">{t("companyAdmin.maxFailedAttempts")}</p>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t("companyAdmin.permissions.title")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {admin.canManageDevices && (
                  <Badge variant="secondary">
                    <Monitor className="h-3 w-3 me-1" />
                    {t("companyAdmin.permissions.manageDevices")}
                  </Badge>
                )}
                {admin.canViewSubscriptions && (
                  <Badge variant="secondary">
                    <Eye className="h-3 w-3 me-1" />
                    {t("companyAdmin.permissions.viewSubscriptions")}
                  </Badge>
                )}
                {admin.canApproveReplacements && (
                  <Badge variant="secondary">
                    <CheckCircle2 className="h-3 w-3 me-1" />
                    {t("companyAdmin.permissions.approveReplacements")}
                  </Badge>
                )}
                {admin.canGenerateLicenses && (
                  <Badge variant="secondary">
                    <Key className="h-3 w-3 me-1" />
                    {t("companyAdmin.permissions.generateLicenses")}
                  </Badge>
                )}
                {admin.canViewUsageReports && (
                  <Badge variant="secondary">
                    <Activity className="h-3 w-3 me-1" />
                    {t("companyAdmin.permissions.viewReports")}
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsResetPasswordOpen(true)}>
                <Key className="h-4 w-4 me-1" />
                {t("companyAdmin.resetPassword")}
              </Button>
              {admin.isLocked && (
                <Button variant="outline" size="sm" onClick={handleUnlock}>
                  <Unlock className="h-4 w-4 me-1" />
                  {t("companyAdmin.unlockAccount")}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleViewSessions}>
                <Clock className="h-4 w-4 me-1" />
                {t("companyAdmin.viewSessions")}
              </Button>
              {sessions.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleTerminateSessions}>
                  <LogOut className="h-4 w-4 me-1" />
                  {t("companyAdmin.terminateSessions")}
                </Button>
              )}
              <Button variant="destructive" size="sm" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 className="h-4 w-4 me-1" />
                {t("common.delete")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Admin Modal */}
      <GenericModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title={t("companyAdmin.editAdmin")}
        description={t("companyAdmin.editAdminDescription", { companyName })}
        size="md"
        formKey={isEditOpen ? `edit-admin-${admin.id}` : undefined}
      >
        <GenericForm
          fields={editFormFields}
          initialValues={editInitialValues}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditOpen(false)}
        />
      </GenericModal>

      {/* Reset Password Modal */}
      <GenericModal
        open={isResetPasswordOpen}
        onOpenChange={setIsResetPasswordOpen}
        title={t("companyAdmin.resetPassword")}
        description={t("companyAdmin.resetPasswordDescription", { adminName: admin.displayName })}
        size="sm"
        formKey={isResetPasswordOpen ? "reset-password" : undefined}
      >
        <GenericForm
          fields={resetPasswordFields}
          initialValues={resetPasswordInitialValues}
          onSubmit={handleResetPassword}
          onCancel={() => setIsResetPasswordOpen(false)}
        />
      </GenericModal>

      {/* Sessions Dialog - Keep as Dialog since it's read-only data display */}
      <Dialog open={isSessionsOpen} onOpenChange={setIsSessionsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("companyAdmin.sessionHistory")}</DialogTitle>
            <DialogDescription>
              {t("companyAdmin.sessionHistoryDescription", { adminName: admin.displayName })}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("companyAdmin.noSessions")}
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div key={session.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{session.deviceName} ({session.operatingSystem})</span>
                      </div>
                      <Badge variant={session.isActive ? "default" : "secondary"}>
                        {session.isActive ? "Active" : session.endReason || "Ended"}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>IP: {session.ipAddress} • {session.location}</p>
                      <p>Started: {formatDate(session.startedAtUtc)}</p>
                      {session.endedAtUtc && session.endedAtUtc.getTime() > 0 && (
                        <p>Ended: {formatDate(session.endedAtUtc)}</p>
                      )}
                      <p>Duration: {session.durationDisplay} • {session.actionCount} actions</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSessionsOpen(false)}>
              {t("common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation - Keep as AlertDialog for confirmations */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t("companyAdmin.deleteAdmin")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("companyAdmin.deleteAdminConfirmation", { adminName: admin.displayName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? <LoadingSpinner size="sm" className="me-2" /> : null}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
