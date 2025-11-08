"use client";

import React, { useState, useCallback } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InitiateDownloadRequest, DownloadSession, FileInfo } from "@/domain";

export interface FileDownloadProps {
  fileId: string;
  fileName?: string;
  onDownloadComplete?: (blob: Blob, fileName: string) => void;
  onDownloadError?: (error: string) => void;
  chunkSize?: number; // in bytes, default 1MB
  className?: string;
  disabled?: boolean;
  useDirectDownload?: boolean; // If true, use direct download endpoint instead of chunked
}

const DEFAULT_CHUNK_SIZE = 1024 * 1024; // 1MB

export function FileDownload({
  fileId,
  fileName,
  onDownloadComplete,
  onDownloadError,
  chunkSize = DEFAULT_CHUNK_SIZE,
  className,
  disabled = false,
  useDirectDownload = false,
}: FileDownloadProps) {
  const { fileUploadService } = useServices();
  const { t } = useI18n();
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadSession, setDownloadSession] = useState<DownloadSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const downloadFile = useCallback(async () => {
    try {
      setDownloading(true);
      setError(null);
      setProgress(0);

      if (useDirectDownload) {
        // Direct download (simpler, for smaller files)
        const blob = await fileUploadService.downloadFile(fileId);
        const info = await fileUploadService.getFileInfo(fileId);
        setFileInfo(info);
        
        // Trigger browser download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName || info.fileName || "download";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setProgress(100);
        onDownloadComplete?.(blob, fileName || info.fileName);
      } else {
        // Chunked download (for large files)
        const info = await fileUploadService.getFileInfo(fileId);
        setFileInfo(info);

        const initiateRequest = new InitiateDownloadRequest({
          fileId: fileId,
          chunkSize: chunkSize,
        });

        const session = await fileUploadService.initiateDownload(initiateRequest);
        setDownloadSession(session);

        const totalChunks = Math.ceil(info.fileSize / chunkSize);
        const chunks: Blob[] = [];

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          const chunk = await fileUploadService.downloadChunk(session.id, chunkIndex);
          chunks.push(chunk);
          
          const downloadedBytes = chunks.reduce((sum, c) => sum + c.size, 0);
          const newProgress = Math.round((downloadedBytes / info.fileSize) * 100);
          setProgress(newProgress);

          // Check status periodically
          if (chunkIndex % 5 === 0 || chunkIndex === totalChunks - 1) {
            const status = await fileUploadService.getDownloadStatus(session.id);
            setDownloadSession(status);
          }
        }

        // Combine chunks into single blob
        const blob = new Blob(chunks, { type: info.contentType || "application/octet-stream" });
        
        // Trigger browser download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName || info.fileName || "download";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setProgress(100);
        onDownloadComplete?.(blob, fileName || info.fileName);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        t("fileDownload.error.downloadFailed") || "Download failed";
      setError(errorMessage);
      onDownloadError?.(errorMessage);
    } finally {
      setDownloading(false);
    }
  }, [fileId, fileName, chunkSize, useDirectDownload, fileUploadService, onDownloadComplete, onDownloadError, t]);

  const loadFileInfo = useCallback(async () => {
    try {
      const info = await fileUploadService.getFileInfo(fileId);
      setFileInfo(info);
    } catch (err) {
      // Ignore errors when loading file info
    }
  }, [fileId, fileUploadService]);

  React.useEffect(() => {
    if (fileId && !fileInfo) {
      loadFileInfo();
    }
  }, [fileId, fileInfo, loadFileInfo]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{t("fileDownload.title") || "File Download"}</CardTitle>
        <CardDescription>
          {t("fileDownload.description") || "Download files using chunked transfer for large files"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {fileInfo && (
          <div className="p-4 border rounded-lg space-y-2">
            <div className="font-medium">{fileInfo.fileName}</div>
            <div className="text-sm text-muted-foreground">
              {t("fileDownload.fileSize") || "Size"}: {formatFileSize(fileInfo.fileSize)}
            </div>
            {fileInfo.contentType && (
              <div className="text-sm text-muted-foreground">
                {t("fileDownload.contentType") || "Type"}: {fileInfo.contentType}
              </div>
            )}
          </div>
        )}

        {downloading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{t("fileDownload.downloading") || "Downloading..."}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <Button
          onClick={downloadFile}
          disabled={disabled || downloading || !fileId}
          className="w-full"
        >
          {downloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("fileDownload.downloading") || "Downloading..."}
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              {t("fileDownload.download") || "Download"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

