import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

@Injectable()
export class AzureKeyVaultService implements OnModuleInit {
  private readonly logger = new Logger(AzureKeyVaultService.name);
  private secretClient: SecretClient | null = null;
  private readonly secrets: Map<string, string> = new Map();

  async onModuleInit(): Promise<void> {
    await this.initialize();
  }

  private async initialize(): Promise<void> {
    const vaultUrl = process.env.AZURE_KEYVAULT_URI;

    if (!vaultUrl) {
      this.logger.warn(
        'AZURE_KEYVAULT_URI not set. Key Vault integration disabled.',
      );
      return;
    }

    try {
      const credential = new DefaultAzureCredential();
      this.secretClient = new SecretClient(vaultUrl, credential);
      this.logger.log(`Connected to Key Vault: ${vaultUrl}`);

      await this.preloadSecrets();
    } catch (error) {
      this.logger.error('Failed to initialize Key Vault client:', error);
      throw error;
    }
  }

  private async preloadSecrets(): Promise<void> {
    const secretNames = [
      'SqlConnectionString',
      'JwtSecret',
      'StorageConnectionString',
    ];

    for (const name of secretNames) {
      try {
        const value = await this.getSecret(name);
        if (value) {
          this.logger.log(`Loaded secret: ${name}`);
        }
      } catch (error) {
        this.logger.warn(`Could not load secret ${name}: ${error}`);
      }
    }
  }

  async getSecret(secretName: string): Promise<string | null> {
    if (this.secrets.has(secretName)) {
      return this.secrets.get(secretName) || null;
    }

    if (!this.secretClient) {
      this.logger.warn('Key Vault client not initialized');
      return null;
    }

    try {
      const secret = await this.secretClient.getSecret(secretName);
      if (secret.value) {
        this.secrets.set(secretName, secret.value);
        return secret.value;
      }
      return null;
    } catch (error) {
      this.logger.error(`Failed to get secret ${secretName}:`, error);
      return null;
    }
  }

  async setEnvFromSecret(
    secretName: string,
    envVarName: string,
  ): Promise<void> {
    const value = await this.getSecret(secretName);
    if (value) {
      process.env[envVarName] = value;
      this.logger.log(`Set env ${envVarName} from Key Vault secret`);
    }
  }

  isAvailable(): boolean {
    return this.secretClient !== null;
  }
}
