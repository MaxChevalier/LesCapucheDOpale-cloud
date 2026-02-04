# Azure Functions - Log Receiver

Cette Azure Function reçoit les logs de l'application NestJS backend et les stocke dans Azure Table Storage.

## Structure

```
azure-functions/
├── host.json           # Configuration Azure Functions
├── local.settings.json # Variables d'environnement locales
├── package.json        # Dépendances Node.js
├── tsconfig.json       # Configuration TypeScript
└── src/
    └── functions/
        └── log-receiver.ts  # Fonction HTTP pour recevoir les logs
```

## Prérequis

- Node.js 18+ ou 20+
- Azure Functions Core Tools v4
- Un compte Azure Storage (ou l'émulateur Azurite pour le développement local)

## Installation

```bash
cd azure-functions
npm install
```

## Développement local

1. Démarrer l'émulateur de stockage Azurite :
```bash
npx azurite --silent --location ./azurite --debug ./azurite/debug.log
```

2. Lancer la fonction :
```bash
npm start
```

3. L'endpoint sera disponible sur : `http://localhost:7071/api/log-receiver`

## Utilisation

### Envoyer un log unique

```bash
curl -X POST http://localhost:7071/api/log-receiver \
  -H "Content-Type: application/json" \
  -d '{
    "level": "info",
    "message": "User logged in",
    "context": "AuthService",
    "service": "guild-backend",
    "metadata": {
      "userId": 123
    }
  }'
```

### Envoyer plusieurs logs (batch)

```bash
curl -X POST http://localhost:7071/api/log-receiver \
  -H "Content-Type: application/json" \
  -d '[
    {"level": "info", "message": "Request started", "context": "API"},
    {"level": "debug", "message": "Processing data", "context": "Service"},
    {"level": "info", "message": "Request completed", "context": "API"}
  ]'
```

## Déploiement sur Azure

1. Créer une Function App dans Azure Portal
2. Configurer les variables d'environnement :
   - `AzureWebJobsStorage` : Connection string du compte de stockage
   - `APPLICATIONINSIGHTS_CONNECTION_STRING` : (optionnel) Pour Application Insights

3. Déployer :
```bash
func azure functionapp publish <NOM_DE_VOTRE_FUNCTION_APP>
```

## Format des logs

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| level | string | ✅ | `debug`, `info`, `warn`, ou `error` |
| message | string | ✅ | Message du log |
| timestamp | string | ❌ | ISO 8601 timestamp (auto-généré si absent) |
| context | string | ❌ | Contexte/module du log |
| service | string | ❌ | Nom du service (default: guild-backend) |
| traceId | string | ❌ | ID de trace pour la corrélation |
| metadata | object | ❌ | Données supplémentaires |

## Intégration avec NestJS

Pour envoyer les logs depuis NestJS, vous pouvez créer un service de logging :

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RemoteLoggerService {
  private readonly functionUrl = process.env.LOG_FUNCTION_URL;
  
  async log(level: string, message: string, context?: string, metadata?: any) {
    if (!this.functionUrl) return;
    
    try {
      await fetch(this.functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          message,
          context,
          service: 'guild-backend',
          timestamp: new Date().toISOString(),
          metadata,
        }),
      });
    } catch (error) {
      Logger.warn('Failed to send log to Azure Function', error);
    }
  }
}
```
