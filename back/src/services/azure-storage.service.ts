import { Injectable, Logger } from '@nestjs/common';
import {
  BlobServiceClient,
  ContainerClient,
  BlockBlobClient,
} from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  success: boolean;
  url?: string;
  blobName?: string;
  error?: string;
}

export interface UploadOptions {
  containerName?: string;
  customBlobName?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

@Injectable()
export class AzureStorageService {
  private readonly logger = new Logger(AzureStorageService.name);
  private blobServiceClient: BlobServiceClient | null = null;
  private readonly defaultContainerName = 'uploads';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;

    try {
      if (connectionString) {
        this.blobServiceClient =
          BlobServiceClient.fromConnectionString(connectionString);
        this.logger.log('Azure Storage initialized with connection string');
      } else if (accountName) {
        const credential = new DefaultAzureCredential();
        this.blobServiceClient = new BlobServiceClient(
          `https://${accountName}.blob.core.windows.net`,
          credential,
        );
        this.logger.log(
          `Azure Storage initialized with Managed Identity: ${accountName}`,
        );
      } else {
        this.logger.warn(
          'Azure Storage not configured. Set AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_NAME',
        );
      }
    } catch (error) {
      this.logger.error('Failed to initialize Azure Storage:', error);
    }
  }

  isAvailable(): boolean {
    return this.blobServiceClient !== null;
  }

  private async getContainerClient(
    containerName: string,
  ): Promise<ContainerClient> {
    if (!this.blobServiceClient) {
      throw new Error('Azure Storage client not initialized');
    }

    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);

    await containerClient.createIfNotExists({
      access: 'blob',
    });

    return containerClient;
  }

  private generateBlobName(originalFileName: string): string {
    const extension = originalFileName.split('.').pop() || '';
    const uniqueId = uuidv4();
    const timestamp = Date.now();
    return `${timestamp}-${uniqueId}.${extension}`;
  }

  async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    if (!this.blobServiceClient) {
      return {
        success: false,
        error: 'Azure Storage not configured',
      };
    }

    try {
      const containerName = options.containerName || this.defaultContainerName;
      const containerClient = await this.getContainerClient(containerName);

      const blobName =
        options.customBlobName || this.generateBlobName(file.originalname);
      const blockBlobClient: BlockBlobClient =
        containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: options.contentType || file.mimetype,
        },
        metadata: options.metadata,
      });

      const url = blockBlobClient.url;

      this.logger.log(`File uploaded successfully: ${blobName}`);

      return {
        success: true,
        url,
        blobName,
      };
    } catch (error) {
      this.logger.error('Failed to upload file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    if (!this.blobServiceClient) {
      return {
        success: false,
        error: 'Azure Storage not configured',
      };
    }

    try {
      const containerName = options.containerName || this.defaultContainerName;
      const containerClient = await this.getContainerClient(containerName);

      const blobName = options.customBlobName || this.generateBlobName(fileName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: {
          blobContentType: contentType,
        },
        metadata: options.metadata,
      });

      const url = blockBlobClient.url;

      this.logger.log(`Buffer uploaded successfully: ${blobName}`);

      return {
        success: true,
        url,
        blobName,
      };
    } catch (error) {
      this.logger.error('Failed to upload buffer:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  async deleteBlob(
    blobName: string,
    containerName?: string,
  ): Promise<boolean> {
    if (!this.blobServiceClient) {
      return false;
    }

    try {
      const container = containerName || this.defaultContainerName;
      const containerClient = this.blobServiceClient.getContainerClient(container);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.deleteIfExists();
      this.logger.log(`Blob deleted: ${blobName}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to delete blob:', error);
      return false;
    }
  }

  async listBlobs(containerName?: string): Promise<string[]> {
    if (!this.blobServiceClient) {
      return [];
    }

    try {
      const container = containerName || this.defaultContainerName;
      const containerClient = this.blobServiceClient.getContainerClient(container);
      const blobs: string[] = [];

      for await (const blob of containerClient.listBlobsFlat()) {
        blobs.push(blob.name);
      }

      return blobs;
    } catch (error) {
      this.logger.error('Failed to list blobs:', error);
      return [];
    }
  }
}

