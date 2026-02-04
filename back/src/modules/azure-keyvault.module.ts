import { Global, Module } from '@nestjs/common';
import { AzureKeyVaultService } from '../services/azure-keyvault.service';

@Global()
@Module({
  providers: [AzureKeyVaultService],
  exports: [AzureKeyVaultService],
})
export class AzureKeyVaultModule {}
