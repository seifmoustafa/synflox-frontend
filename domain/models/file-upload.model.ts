export interface UploadSessionData {
  id: string;
  fileName: string;
  fileSize: number;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: number;
  status: UploadStatus;
  createdAt: string;
  expiresAt?: string;
}

export enum UploadStatus {
  Pending = 1,
  InProgress = 2,
  Completed = 3,
  Failed = 4,
  Cancelled = 5,
}

export class UploadSession {
  readonly id: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly chunkSize: number;
  readonly totalChunks: number;
  readonly uploadedChunks: number;
  readonly status: UploadStatus;
  readonly createdAt: Date;
  readonly expiresAt?: Date;

  constructor(data: UploadSessionData) {
    this.id = data.id;
    this.fileName = data.fileName;
    this.fileSize = data.fileSize;
    this.chunkSize = data.chunkSize;
    this.totalChunks = data.totalChunks;
    this.uploadedChunks = data.uploadedChunks;
    this.status = data.status;
    this.createdAt = new Date(data.createdAt);
    this.expiresAt = data.expiresAt ? new Date(data.expiresAt) : undefined;
  }

  get progress(): number {
    if (this.totalChunks === 0) return 0;
    return Math.round((this.uploadedChunks / this.totalChunks) * 100);
  }

  get isCompleted(): boolean {
    return this.status === UploadStatus.Completed;
  }

  get isFailed(): boolean {
    return this.status === UploadStatus.Failed;
  }

  get isInProgress(): boolean {
    return this.status === UploadStatus.InProgress;
  }
}

export interface DownloadSessionData {
  id: string;
  fileName: string;
  fileSize: number;
  chunkSize: number;
  totalChunks: number;
  downloadedChunks: number;
  status: DownloadStatus;
  createdAt: string;
  expiresAt?: string;
}

export enum DownloadStatus {
  Pending = 1,
  InProgress = 2,
  Completed = 3,
  Failed = 4,
  Cancelled = 5,
}

export class DownloadSession {
  readonly id: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly chunkSize: number;
  readonly totalChunks: number;
  readonly downloadedChunks: number;
  readonly status: DownloadStatus;
  readonly createdAt: Date;
  readonly expiresAt?: Date;

  constructor(data: DownloadSessionData) {
    this.id = data.id;
    this.fileName = data.fileName;
    this.fileSize = data.fileSize;
    this.chunkSize = data.chunkSize;
    this.totalChunks = data.totalChunks;
    this.downloadedChunks = data.downloadedChunks;
    this.status = data.status;
    this.createdAt = new Date(data.createdAt);
    this.expiresAt = data.expiresAt ? new Date(data.expiresAt) : undefined;
  }

  get progress(): number {
    if (this.totalChunks === 0) return 0;
    return Math.round((this.downloadedChunks / this.totalChunks) * 100);
  }

  get isCompleted(): boolean {
    return this.status === DownloadStatus.Completed;
  }

  get isFailed(): boolean {
    return this.status === DownloadStatus.Failed;
  }

  get isInProgress(): boolean {
    return this.status === DownloadStatus.InProgress;
  }
}

export interface InitiateUploadRequestData {
  fileName: string;
  fileSize: number;
  chunkSize?: number;
  metadata?: Record<string, any>;
}

export class InitiateUploadRequest {
  readonly fileName: string;
  readonly fileSize: number;
  readonly chunkSize: number;
  readonly metadata?: Record<string, any>;

  constructor(data: InitiateUploadRequestData) {
    this.fileName = data.fileName;
    this.fileSize = data.fileSize;
    this.chunkSize = data.chunkSize || 1024 * 1024; // Default 1MB
    this.metadata = data.metadata;
  }
}

export interface InitiateDownloadRequestData {
  fileId: string;
  chunkSize?: number;
}

export class InitiateDownloadRequest {
  readonly fileId: string;
  readonly chunkSize: number;

  constructor(data: InitiateDownloadRequestData) {
    this.fileId = data.fileId;
    this.chunkSize = data.chunkSize || 1024 * 1024; // Default 1MB
  }
}

export interface FileInfoData {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  uploadedBy?: string;
  metadata?: Record<string, any>;
}

export class FileInfo {
  readonly id: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly contentType: string;
  readonly uploadedAt: Date;
  readonly uploadedBy?: string;
  readonly metadata?: Record<string, any>;

  constructor(data: FileInfoData) {
    this.id = data.id;
    this.fileName = data.fileName;
    this.fileSize = data.fileSize;
    this.contentType = data.contentType;
    this.uploadedAt = new Date(data.uploadedAt);
    this.uploadedBy = data.uploadedBy;
    this.metadata = data.metadata;
  }

  get formattedSize(): string {
    if (this.fileSize < 1024) return `${this.fileSize} B`;
    if (this.fileSize < 1024 * 1024) return `${(this.fileSize / 1024).toFixed(2)} KB`;
    if (this.fileSize < 1024 * 1024 * 1024) return `${(this.fileSize / (1024 * 1024)).toFixed(2)} MB`;
    return `${(this.fileSize / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

