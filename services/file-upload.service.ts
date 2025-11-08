import { type IApiService } from "./api.service";
import { type INotificationService } from "./notification.service";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { SecureTokenService } from "@/lib/secure-token-service";
import {
  UploadSession,
  DownloadSession,
  FileInfo,
  InitiateUploadRequest,
  InitiateDownloadRequest,
  UploadStatus,
  DownloadStatus,
  FileUploadMapper,
} from "@/domain";

export interface IFileUploadService {
  initiateUpload(request: InitiateUploadRequest): Promise<UploadSession>;
  uploadChunk(uploadId: string, chunkIndex: number, chunk: Blob): Promise<void>;
  getUploadStatus(uploadId: string): Promise<UploadSession>;
  completeUpload(uploadId: string): Promise<FileInfo>;
  cancelUpload(uploadId: string): Promise<void>;
  initiateDownload(request: InitiateDownloadRequest): Promise<DownloadSession>;
  getDownloadStatus(downloadId: string): Promise<DownloadSession>;
  downloadChunk(downloadId: string, chunkIndex: number): Promise<Blob>;
  downloadFile(fileId: string): Promise<Blob>;
  getFileInfo(fileId: string): Promise<FileInfo>;
}

export class FileUploadService implements IFileUploadService {
  constructor(
    private readonly apiService: IApiService,
    private readonly notificationService: INotificationService
  ) {}

  async initiateUpload(request: InitiateUploadRequest): Promise<UploadSession> {
    try {
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.FILE_UPLOAD_INITIATE,
        FileUploadMapper.initiateUploadRequestToJson(request)
      );
      return FileUploadMapper.uploadSessionFromJson(response);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to initiate upload";
      this.notificationService.error(errorMessage);
      throw e;
    }
  }

  async uploadChunk(uploadId: string, chunkIndex: number, chunk: Blob): Promise<void> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const url = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
      const token = SecureTokenService.getAccessToken();
      const language = typeof window !== "undefined" ? localStorage.getItem("language") || "ar" : "ar";

      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("chunkIndex", chunkIndex.toString());

      const response = await fetch(
        `${url}${API_ENDPOINTS.FILE_UPLOAD_CHUNK.replace("{uploadId}", uploadId)}`,
        {
          method: "PUT",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Accept-Language": language,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to upload chunk");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to upload chunk";
      this.notificationService.error(errorMessage);
      throw e;
    }
  }

  async getUploadStatus(uploadId: string): Promise<UploadSession> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.FILE_UPLOAD_STATUS.replace("{uploadId}", uploadId)
      );
      return FileUploadMapper.uploadSessionFromJson(response);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to get upload status";
      this.notificationService.error(errorMessage);
      throw e;
    }
  }

  async completeUpload(uploadId: string): Promise<FileInfo> {
    try {
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.FILE_UPLOAD_COMPLETE.replace("{uploadId}", uploadId),
        {}
      );
      const fileInfo = FileUploadMapper.fileInfoFromJson(response);
      this.notificationService.success("File uploaded successfully");
      return fileInfo;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to complete upload";
      this.notificationService.error(errorMessage);
      throw e;
    }
  }

  async cancelUpload(uploadId: string): Promise<void> {
    try {
      await this.apiService.delete(API_ENDPOINTS.FILE_UPLOAD_DELETE.replace("{uploadId}", uploadId));
      this.notificationService.success("Upload cancelled");
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to cancel upload";
      this.notificationService.error(errorMessage);
      throw e;
    }
  }

  async initiateDownload(request: InitiateDownloadRequest): Promise<DownloadSession> {
    try {
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.FILE_DOWNLOAD_INITIATE,
        FileUploadMapper.initiateDownloadRequestToJson(request)
      );
      return FileUploadMapper.downloadSessionFromJson(response);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to initiate download";
      this.notificationService.error(errorMessage);
      throw e;
    }
  }

  async getDownloadStatus(downloadId: string): Promise<DownloadSession> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.FILE_DOWNLOAD_STATUS.replace("{downloadId}", downloadId)
      );
      return FileUploadMapper.downloadSessionFromJson(response);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to get download status";
      this.notificationService.error(errorMessage);
      throw e;
    }
  }

  async downloadChunk(downloadId: string, chunkIndex: number): Promise<Blob> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const url = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
      const token = SecureTokenService.getAccessToken();
      const language = typeof window !== "undefined" ? localStorage.getItem("language") || "ar" : "ar";

      const response = await fetch(
        `${url}${API_ENDPOINTS.FILE_DOWNLOAD_CHUNK.replace("{downloadId}", downloadId)}?chunkIndex=${chunkIndex}`,
        {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Accept-Language": language,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to download chunk");
      }

      return await response.blob();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to download chunk";
      this.notificationService.error(errorMessage);
      throw e;
    }
  }

  async downloadFile(fileId: string): Promise<Blob> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const url = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
      const token = SecureTokenService.getAccessToken();
      const language = typeof window !== "undefined" ? localStorage.getItem("language") || "ar" : "ar";

      const response = await fetch(
        `${url}${API_ENDPOINTS.FILE_DOWNLOAD_FILE.replace("{fileId}", fileId)}`,
        {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Accept-Language": language,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to download file");
      }

      const blob = await response.blob();
      this.notificationService.success("File downloaded successfully");
      return blob;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to download file";
      this.notificationService.error(errorMessage);
      throw e;
    }
  }

  async getFileInfo(fileId: string): Promise<FileInfo> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.FILE_DOWNLOAD_INFO.replace("{fileId}", fileId)
      );
      return FileUploadMapper.fileInfoFromJson(response);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to get file info";
      this.notificationService.error(errorMessage);
      throw e;
    }
  }
}

