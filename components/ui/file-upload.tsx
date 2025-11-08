"use client";

import React, { useState, useCallback, useRef } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { InitiateUploadRequest } from "@/domain";
import type { UploadSession, FileInfo } from "@/domain";

export interface FileUploadProps {
  onUploadComplete?: (fileInfo: FileInfo) => void;
  onUploadError?: (error: string) => void;
  onCancel?: () => void;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
  chunkSize?: number; // in bytes, default 1MB
  className?: string;
  disabled?: boolean;
}

const DEFAULT_CHUNK_SIZE = 1024 * 1024; // 1MB

export function FileUpload({
  onUploadComplete,
  onUploadError,
  onCancel,
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  acceptedFileTypes,
  chunkSize = DEFAULT_CHUNK_SIZE,
  className,
  disabled = false,
}: FileUploadProps) {
  const { fileUploadService } = useServices();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSession, setUploadSession] = useState<UploadSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<FileInfo | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return t("fileUpload.error.fileTooLarge", { maxSize: formatFileSize(maxFileSize) }) || 
             `File size exceeds maximum allowed size of ${formatFileSize(maxFileSize)}`;
    }
    if (acceptedFileTypes && acceptedFileTypes.length > 0) {
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      const mimeType = file.type;
      const isAccepted = acceptedFileTypes.some(
        (type) => type === fileExtension || type === mimeType || type === file.type
      );
      if (!isAccepted) {
        return t("fileUpload.error.invalidFileType", { types: acceptedFileTypes.join(", ") }) ||
               `File type not allowed. Accepted types: ${acceptedFileTypes.join(", ")}`;
      }
    }
    return null;
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setUploadedFileInfo(null);
  }, [maxFileSize, acceptedFileTypes, t]);

  const uploadFile = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      // Step 1: Initiate upload
      const initiateRequest = new InitiateUploadRequest({
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        chunkSize: chunkSize,
        metadata: {
          contentType: selectedFile.type || "application/octet-stream",
        },
      });

      const session = await fileUploadService.initiateUpload(initiateRequest);
      setUploadSession(session);

      // Step 2: Upload chunks
      const totalChunks = Math.ceil(selectedFile.size / chunkSize);
      let uploadedBytes = 0;

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, selectedFile.size);
        const chunk = selectedFile.slice(start, end);

        await fileUploadService.uploadChunk(session.id, chunkIndex, chunk);
        
        uploadedBytes += chunk.size;
        const newProgress = Math.round((uploadedBytes / selectedFile.size) * 100);
        setProgress(newProgress);

        // Check status periodically
        if (chunkIndex % 5 === 0 || chunkIndex === totalChunks - 1) {
          const status = await fileUploadService.getUploadStatus(session.id);
          setUploadSession(status);
        }
      }

      // Step 3: Complete upload
      const fileInfo = await fileUploadService.completeUpload(session.id);
      setUploadedFileInfo(fileInfo);
      setProgress(100);
      onUploadComplete?.(fileInfo);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        t("fileUpload.error.uploadFailed") || "Upload failed";
      setError(errorMessage);
      onUploadError?.(errorMessage);
      
      // Cancel upload on error
      if (uploadSession) {
        try {
          await fileUploadService.cancelUpload(uploadSession.id);
        } catch (cancelErr) {
          // Ignore cancel errors
        }
      }
    } finally {
      setUploading(false);
    }
  }, [selectedFile, chunkSize, fileUploadService, uploadSession, onUploadComplete, onUploadError, t]);

  const handleCancel = useCallback(async () => {
    if (uploadSession && uploading) {
      try {
        await fileUploadService.cancelUpload(uploadSession.id);
      } catch (err) {
        // Ignore cancel errors
      }
    }
    setUploading(false);
    setProgress(0);
    setUploadSession(null);
    setSelectedFile(null);
    setError(null);
    setUploadedFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onCancel?.();
  }, [uploadSession, uploading, fileUploadService, onCancel]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setUploadedFileInfo(null);
    setError(null);
    setProgress(0);
    setUploadSession(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{t("fileUpload.title") || "File Upload"}</CardTitle>
        <CardDescription>
          {t("fileUpload.description") || "Upload files using chunked transfer for large files"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {uploadedFileInfo ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">
                  {t("fileUpload.success.uploadComplete") || "Upload completed successfully!"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("fileUpload.success.fileName") || "File"}: {uploadedFileInfo.fileName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("fileUpload.success.fileSize") || "Size"}: {formatFileSize(uploadedFileInfo.fileSize)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="mt-2"
                >
                  {t("fileUpload.uploadAnother") || "Upload Another File"}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                disabled={disabled || uploading}
                accept={acceptedFileTypes?.join(",")}
                className="hidden"
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input">
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled || uploading}
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {t("fileUpload.selectFile") || "Select File"}
                </Button>
              </label>
            </div>

            {selectedFile && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{selectedFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{t("fileUpload.uploading") || "Uploading..."}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={uploadFile}
                    disabled={disabled || uploading || !selectedFile}
                    className="flex-1"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("fileUpload.uploading") || "Uploading..."}
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {t("fileUpload.upload") || "Upload"}
                      </>
                    )}
                  </Button>
                  {uploading && (
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={!uploading}
                    >
                      {t("fileUpload.cancel") || "Cancel"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

