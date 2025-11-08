import {
  UploadSession,
  UploadSessionData,
  UploadStatus,
  DownloadSession,
  DownloadSessionData,
  DownloadStatus,
  InitiateUploadRequest,
  InitiateDownloadRequest,
  FileInfo,
  FileInfoData,
} from "../models/file-upload.model";

export interface UploadSessionResponse {
  data?: UploadSessionData;
  uploadSession?: UploadSessionData;
  id?: string;
  fileName?: string;
  fileSize?: number;
  chunkSize?: number;
  totalChunks?: number;
  uploadedChunks?: number;
  status?: number;
  createdAt?: string;
  expiresAt?: string;
}

export interface DownloadSessionResponse {
  data?: DownloadSessionData;
  downloadSession?: DownloadSessionData;
  id?: string;
  fileName?: string;
  fileSize?: number;
  chunkSize?: number;
  totalChunks?: number;
  downloadedChunks?: number;
  status?: number;
  createdAt?: string;
  expiresAt?: string;
}

export interface FileInfoResponse {
  data?: FileInfoData;
  fileInfo?: FileInfoData;
  id?: string;
  fileName?: string;
  fileSize?: number;
  contentType?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  metadata?: Record<string, any>;
}

export class FileUploadMapper {
  static uploadSessionFromJson(json: any): UploadSession {
    const data = this.extractUploadSessionData(json);
    return new UploadSession(data);
  }

  static extractUploadSessionData(json: any): UploadSessionData {
    // Handle different response formats
    if (json.data) {
      json = json.data;
    }
    if (json.uploadSession) {
      json = json.uploadSession;
    }

    return {
      id: json.id || json.uploadId || "",
      fileName: json.fileName || json.name || "",
      fileSize: json.fileSize || json.size || 0,
      chunkSize: json.chunkSize || json.chunk_size || 1024 * 1024,
      totalChunks: json.totalChunks || json.total_chunks || 0,
      uploadedChunks: json.uploadedChunks || json.uploaded_chunks || 0,
      status: json.status || UploadStatus.Pending,
      createdAt: json.createdAt || json.created_at || new Date().toISOString(),
      expiresAt: json.expiresAt || json.expires_at,
    };
  }

  static downloadSessionFromJson(json: any): DownloadSession {
    const data = this.extractDownloadSessionData(json);
    return new DownloadSession(data);
  }

  static extractDownloadSessionData(json: any): DownloadSessionData {
    // Handle different response formats
    if (json.data) {
      json = json.data;
    }
    if (json.downloadSession) {
      json = json.downloadSession;
    }

    return {
      id: json.id || json.downloadId || "",
      fileName: json.fileName || json.name || "",
      fileSize: json.fileSize || json.size || 0,
      chunkSize: json.chunkSize || json.chunk_size || 1024 * 1024,
      totalChunks: json.totalChunks || json.total_chunks || 0,
      downloadedChunks: json.downloadedChunks || json.downloaded_chunks || 0,
      status: json.status || DownloadStatus.Pending,
      createdAt: json.createdAt || json.created_at || new Date().toISOString(),
      expiresAt: json.expiresAt || json.expires_at,
    };
  }

  static fileInfoFromJson(json: any): FileInfo {
    const data = this.extractFileInfoData(json);
    return new FileInfo(data);
  }

  static extractFileInfoData(json: any): FileInfoData {
    // Handle different response formats
    if (json.data) {
      json = json.data;
    }
    if (json.fileInfo) {
      json = json.fileInfo;
    }

    return {
      id: json.id || json.fileId || "",
      fileName: json.fileName || json.name || "",
      fileSize: json.fileSize || json.size || 0,
      contentType: json.contentType || json.content_type || json.mimeType || json.mime_type || "application/octet-stream",
      uploadedAt: json.uploadedAt || json.uploaded_at || new Date().toISOString(),
      uploadedBy: json.uploadedBy || json.uploaded_by,
      metadata: json.metadata || json.meta || {},
    };
  }

  static initiateUploadRequestToJson(request: InitiateUploadRequest): any {
    return {
      fileName: request.fileName,
      fileSize: request.fileSize,
      chunkSize: request.chunkSize,
      metadata: request.metadata,
    };
  }

  static initiateDownloadRequestToJson(request: InitiateDownloadRequest): any {
    return {
      fileId: request.fileId,
      chunkSize: request.chunkSize,
    };
  }

  static handleApiResponse<T>(response: any): T {
    // Handle different API response formats
    if (response.data !== undefined) {
      return response.data as T;
    }
    if (response.result !== undefined) {
      return response.result as T;
    }
    return response as T;
  }
}

