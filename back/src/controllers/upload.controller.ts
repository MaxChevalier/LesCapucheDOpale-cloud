import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
  Delete,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  AzureStorageService,
  UploadResult,
} from '../services/azure-storage.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly azureStorageService: AzureStorageService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a file to Azure Blob Storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        container: {
          type: 'string',
          description: 'Optional container name (default: uploads)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        url: { type: 'string' },
        blobName: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - No file provided or upload failed',
  })
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
      fileFilter: (_req, file, callback) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/json',
          'text/plain',
          'text/csv',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              `File type ${file.mimetype} is not allowed`,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('container') containerName?: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.azureStorageService.isAvailable()) {
      throw new BadRequestException(
        'Azure Storage is not configured. Please set AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_NAME',
      );
    }

    const result = await this.azureStorageService.uploadFile(file, {
      containerName,
    });

    if (!result.success) {
      throw new BadRequestException(result.error || 'Upload failed');
    }

    return result;
  }

  @Post('image')
  @ApiOperation({ summary: 'Upload an image to Azure Blob Storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
  })
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max for images
      },
      fileFilter: (_req, file, callback) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    if (!this.azureStorageService.isAvailable()) {
      throw new BadRequestException('Azure Storage is not configured');
    }

    const result = await this.azureStorageService.uploadFile(file, {
      containerName: 'images',
    });

    if (!result.success) {
      throw new BadRequestException(result.error || 'Image upload failed');
    }

    return result;
  }

  @Delete(':blobName')
  @ApiOperation({ summary: 'Delete a file from Azure Blob Storage' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 400, description: 'Delete failed' })
  @ApiBearerAuth()
  async deleteBlob(
    @Param('blobName') blobName: string,
    @Query('container') containerName?: string,
  ): Promise<{ success: boolean; message: string }> {
    const deleted = await this.azureStorageService.deleteBlob(
      blobName,
      containerName,
    );

    if (!deleted) {
      throw new BadRequestException('Failed to delete blob');
    }

    return {
      success: true,
      message: `Blob ${blobName} deleted successfully`,
    };
  }

  @Get('list')
  @ApiOperation({ summary: 'List files in a container' })
  @ApiResponse({
    status: 200,
    description: 'List of blob names',
    schema: {
      type: 'array',
      items: { type: 'string' },
    },
  })
  @ApiBearerAuth()
  async listBlobs(
    @Query('container') containerName?: string,
  ): Promise<string[]> {
    return this.azureStorageService.listBlobs(containerName);
  }

  @Get('status')
  @ApiOperation({ summary: 'Check Azure Storage connection status' })
  @ApiResponse({
    status: 200,
    description: 'Storage status',
  })
  getStatus(): { available: boolean; message: string } {
    const available = this.azureStorageService.isAvailable();
    return {
      available,
      message: available
        ? 'Azure Storage is connected'
        : 'Azure Storage is not configured',
    };
  }
}
