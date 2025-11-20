/**
 * Profile Edit ViewModel
 * Handles profile editing, picture upload/remove, and form validation
 */

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { Profile, UpdateProfileRequest, Gender } from "@/domain";

export interface ProfileEditFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: Gender | null;
  dateOfBirth: string;
  bio: string;
  jobTitle: string;
  department: string;
  location: string;
  linkedInUrl: string;
  twitterUrl: string;
  backupEmail: string;
}

export interface ProfileEditViewModelReturn {
  // State
  profile: Profile | null;
  formData: ProfileEditFormData;
  isLoading: boolean;
  isSaving: boolean;
  isUploadingPhoto: boolean;
  hasChanges: boolean;
  
  // Form Actions
  updateFormField: (field: keyof ProfileEditFormData, value: any) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  resetForm: () => void;
  
  // Photo Actions
  handlePhotoUpload: (file: File) => Promise<void>;
  handlePhotoRemove: () => Promise<void>;
}

export function useProfileEditViewModel(): ProfileEditViewModelReturn {
  const { accountService } = useServices();
  const { t } = useI18n();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<ProfileEditFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: null,
    dateOfBirth: "",
    bio: "",
    jobTitle: "",
    department: "",
    location: "",
    linkedInUrl: "",
    twitterUrl: "",
    backupEmail: "",
  });
  const [originalFormData, setOriginalFormData] = useState<ProfileEditFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  /**
   * Load profile data
   */
  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const profileData = await accountService.getProfile();
      setProfile(profileData);

      // Populate form data
      const data: ProfileEditFormData = {
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        email: profileData.email || "",
        phoneNumber: profileData.phoneNumber || "",
        gender: profileData.gender ?? null,
        dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.toISOString().split("T")[0] : "",
        bio: profileData.bio || "",
        jobTitle: profileData.jobTitle || "",
        department: profileData.department || "",
        location: profileData.location || "",
        linkedInUrl: profileData.linkedInUrl || "",
        twitterUrl: profileData.twitterUrl || "",
        backupEmail: profileData.backupEmail || "",
      };
      setFormData(data);
      setOriginalFormData(data);
    } catch (error) {
      // Error already handled by service
    } finally {
      setIsLoading(false);
    }
  }, [accountService]);

  /**
   * Check if form has changes
   */
  const hasChanges = useCallback(() => {
    if (!originalFormData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  }, [formData, originalFormData]);

  /**
   * Update form field
   */
  const updateFormField = useCallback((field: keyof ProfileEditFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Handle save
   */
  const handleSave = useCallback(async () => {
    if (!hasChanges()) return;

    setIsSaving(true);
    try {
      const request = new UpdateProfileRequest({
        firstName: formData.firstName.trim() || null,
        lastName: formData.lastName.trim() || null,
        email: formData.email.trim() || null,
        phoneNumber: formData.phoneNumber.trim() || null,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || null,
        bio: formData.bio.trim() || null,
        jobTitle: formData.jobTitle.trim() || null,
        department: formData.department.trim() || null,
        location: formData.location.trim() || null,
        linkedInUrl: formData.linkedInUrl.trim() || null,
        twitterUrl: formData.twitterUrl.trim() || null,
        backupEmail: formData.backupEmail.trim() || null,
      });

      const updatedProfile = await accountService.updateProfile(request);
      setProfile(updatedProfile);
      setOriginalFormData(formData);
    } catch (error) {
      // Error already handled by service
    } finally {
      setIsSaving(false);
    }
  }, [formData, hasChanges, accountService]);

  /**
   * Handle cancel
   */
  const handleCancel = useCallback(() => {
    router.push("/account");
  }, [router]);

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    if (originalFormData) {
      setFormData(originalFormData);
    }
  }, [originalFormData]);

  /**
   * Handle profile photo upload
   */
  const handlePhotoUpload = useCallback(async (file: File) => {
    // Validate file
    if (!file.type.startsWith("image/")) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB max
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const base64 = await base64Promise;
      const updatedProfile = await accountService.uploadProfilePicture(base64);
      setProfile(updatedProfile);
    } catch (error) {
      // Error already handled by service with notification
    } finally {
      setIsUploadingPhoto(false);
    }
  }, [accountService]);

  /**
   * Handle profile photo removal
   */
  const handlePhotoRemove = useCallback(async () => {
    try {
      const updatedProfile = await accountService.deleteProfilePicture();
      setProfile(updatedProfile);
    } catch (error) {
      // Error already handled by service with notification
    }
  }, [accountService]);

  // Load data on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    formData,
    isLoading,
    isSaving,
    isUploadingPhoto,
    hasChanges: hasChanges(),
    updateFormField,
    handleSave,
    handleCancel,
    resetForm,
    handlePhotoUpload,
    handlePhotoRemove,
  };
}
