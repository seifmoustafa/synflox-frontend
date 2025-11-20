"use client";

import { useRef } from "react";
import { useProfileEditViewModel } from "@/viewmodels/account/use-profile-edit-viewmodel";
import { useI18n } from "@/providers/i18n-provider";
import { useSettings } from "@/providers/settings-provider";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-picker";
import { GenericSelect } from "@/components/ui/generic-select";
import { 
  User, 
  Camera, 
  X, 
  Loader2, 
  Save, 
  ArrowLeft, 
  RotateCcw,
  Mail,
  Phone,
  Calendar,
  FileText,
  Briefcase,
  MapPin,
  Link,
  Twitter,
  Linkedin,
  Building2,
  ArrowRight
} from "lucide-react";
import NextLink from "next/link";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Gender } from "@/domain";

export function ProfileEditView() {
  const vm = useProfileEditViewModel();
  const { t, direction } = useI18n();
  const settings = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRTL = direction === "rtl";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      vm.handlePhotoUpload(file);
    }
    e.target.value = "";
  };

  // Loading state
  if (vm.isLoading) {
    return (
      <div className="space-y-6 p-6" dir={isRTL ? "rtl" : "ltr"}>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!vm.profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" dir={isRTL ? "rtl" : "ltr"}>
        <p className="text-muted-foreground">{t("account.errors.loadProfile")}</p>
      </div>
    );
  }

  const { profile, formData } = vm;

  return (
    <div className="min-h-screen pb-12" dir={isRTL ? "rtl" : "ltr"}>
      {/* Breadcrumbs */}
      <div className="mx-6 mt-6 mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <NextLink href="/account">
                  {t('nav.account') || 'Account'}
                </NextLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold">
                {t('account.editProfile') || 'Edit Profile'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-6 mb-8 mx-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={vm.handleCancel}
              className="rounded-full"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t("account.editProfile")}</h1>
              <p className="text-muted-foreground mt-1">{t("account.editProfileDescription")}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {vm.hasChanges && (
              <Button variant="outline" onClick={vm.resetForm}>
                <X className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                {t("common.reset")}
              </Button>
            )}
            <Button 
              onClick={vm.handleSave}
              disabled={!vm.hasChanges || vm.isSaving}
            >
              {vm.isSaving ? (
                <Loader2 className={cn("w-4 h-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
              ) : (
                <Save className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
              )}
              {t("common.save")}
            </Button>
          </div>
        </div>

        {/* Profile Picture Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              {t("account.profilePicture")}
            </CardTitle>
            <CardDescription>{t("account.profilePictureDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div 
                  className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg cursor-pointer relative overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {vm.isUploadingPhoto ? (
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                  ) : profile.hasProfilePicture ? (
                    <>
                      <img 
                        src={profile.fullProfilePictureUrl!} 
                        alt={profile.displayName}
                        className="w-full h-full rounded-2xl object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center">
                      <User className="w-12 h-12 text-white mb-2" />
                      <Camera className="w-6 h-6 text-white/70" />
                    </div>
                  )}
                </div>
                
                {/* Remove Button */}
                {profile.hasProfilePicture && !vm.isUploadingPhoto && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      vm.handlePhotoRemove();
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg"
                    title={t("account.removePhoto")}
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>

              {/* Instructions */}
              <div className="flex-1">
                <h3 className="font-semibold mb-2">{t("account.uploadNewPhoto")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("account.photoRequirements")}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={vm.isUploadingPhoto}
                  >
                    <Camera className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                    {t("account.uploadPhoto")}
                  </Button>
                  {profile.hasProfilePicture && (
                    <Button
                      variant="destructive"
                      onClick={vm.handlePhotoRemove}
                      disabled={vm.isUploadingPhoto}
                    >
                      <X className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                      {t("account.removePhoto")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="px-6 space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {t("account.personalInformation")}
            </CardTitle>
            <CardDescription>{t("account.personalInformationDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("account.firstName")}</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => vm.updateFormField("firstName", e.target.value)}
                  placeholder={t("account.firstNamePlaceholder")}
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("account.lastName")}</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => vm.updateFormField("lastName", e.target.value)}
                  placeholder={t("account.lastNamePlaceholder")}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t("account.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => vm.updateFormField("email", e.target.value)}
                  placeholder={t("account.emailPlaceholder")}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {t("account.phoneNumber")}
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => vm.updateFormField("phoneNumber", e.target.value)}
                  placeholder={t("account.phoneNumberPlaceholder")}
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">{t("account.gender")}</Label>
                <GenericSelect
                  type="single"
                  options={[
                    { value: "0", label: t("account.male") },
                    { value: "1", label: t("account.female") },
                    { value: "2", label: t("account.other") },
                    { value: "3", label: t("account.preferNotToSay") }
                  ]}
                  value={formData.gender?.toString() ?? ""}
                  onValueChange={(value: string | string[]) => {
                    const stringValue = Array.isArray(value) ? value[0] : value;
                    vm.updateFormField("gender", stringValue ? parseInt(stringValue) as Gender : null);
                  }}
                  placeholder={t("account.genderPlaceholder")}
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t("account.dateOfBirth")}
                </Label>
                <DatePicker
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(date) => vm.updateFormField("dateOfBirth", date)}
                  placeholder={t("account.dateOfBirth")}
                  type="date"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t("account.bio")}
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => vm.updateFormField("bio", e.target.value)}
                placeholder={t("account.bioPlaceholder")}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              {t("account.professionalInformation")}
            </CardTitle>
            <CardDescription>{t("account.professionalInformationDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {t("account.jobTitle")}
                </Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => vm.updateFormField("jobTitle", e.target.value)}
                  placeholder={t("account.jobTitlePlaceholder")}
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {t("account.department")}
                </Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => vm.updateFormField("department", e.target.value)}
                  placeholder={t("account.departmentPlaceholder")}
                />
              </div>

              {/* Location */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t("account.workLocation")}
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => vm.updateFormField("location", e.target.value)}
                  placeholder={t("account.workLocationPlaceholder")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social & Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              {t("account.socialAndContact")}
            </CardTitle>
            <CardDescription>{t("account.socialAndContactDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LinkedIn */}
              <div className="space-y-2">
                <Label htmlFor="linkedInUrl" className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  {t("account.linkedIn")}
                </Label>
                <Input
                  id="linkedInUrl"
                  type="url"
                  value={formData.linkedInUrl}
                  onChange={(e) => vm.updateFormField("linkedInUrl", e.target.value)}
                  placeholder={t("account.linkedInPlaceholder")}
                />
              </div>

              {/* Twitter */}
              <div className="space-y-2">
                <Label htmlFor="twitterUrl" className="flex items-center gap-2">
                  <Twitter className="w-4 h-4" />
                  {t("account.twitter")}
                </Label>
                <Input
                  id="twitterUrl"
                  type="url"
                  value={formData.twitterUrl}
                  onChange={(e) => vm.updateFormField("twitterUrl", e.target.value)}
                  placeholder={t("account.twitterPlaceholder")}
                />
              </div>

              {/* Backup Email */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="backupEmail" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t("account.backupEmail")}
                </Label>
                <Input
                  id="backupEmail"
                  type="email"
                  value={formData.backupEmail}
                  onChange={(e) => vm.updateFormField("backupEmail", e.target.value)}
                  placeholder={t("account.backupEmailPlaceholder")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
