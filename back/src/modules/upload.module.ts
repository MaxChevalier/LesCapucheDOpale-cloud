import { Module } from '@nestjs/common';
import { UploadController } from '../controllers/upload.controller';
import { AzureStorageService } from '../services/azure-storage.service';

@Module({
  controllers: [UploadController],
  providers: [AzureStorageService],
  exports: [AzureStorageService],
})
export class UploadModule {}
