# Infrastructure Azure - Les Capuches d'Opale

Ce dossier contient les templates **Bicep** pour le déploiement automatisé de l'infrastructure Azure.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Azure Resource Group                              │
│  rg-capuchesdopale-{env}                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                 Container Apps Environment                        │   │
│  │  cae-capuchesdopale-{env}                                        │   │
│  │  ┌─────────────────────┐    ┌─────────────────────┐            │   │
│  │  │   Frontend (Web)    │    │   Backend (API)     │            │   │
│  │  │   Angular + Nginx   │───▶│   NestJS + Prisma   │            │   │
│  │  │   Port: 80          │    │   Port: 3000        │            │   │
│  │  └─────────────────────┘    └──────────┬──────────┘            │   │
│  └─────────────────────────────────────────┼────────────────────────┘   │
│                                            │                             │
│  ┌─────────────────┐   ┌─────────────────┐│   ┌─────────────────────┐  │
│  │   Key Vault     │   │  App Config     ││   │   Azure SQL         │  │
│  │   kv-...        │   │  appconfig-...  ││   │   sql-...-{env}     │  │
│  │   • JWT Secrets │   │  • Feature Flags│◀──│   • guild-db        │  │
│  │   • DB Password │   │  • App Settings ││   └─────────────────────┘  │
│  └─────────────────┘   └─────────────────┘│                             │
│                                            │                             │
│  ┌─────────────────┐   ┌─────────────────┐│   ┌─────────────────────┐  │
│  │  Storage Acct   │   │  Function App   │◀──│   Log Analytics      │  │
│  │  st...          │   │  func-...       │    │   log-...           │  │
│  │  • Blob: uploads│   │  • Log Receiver │    │   • Monitoring      │  │
│  │  • Table: logs  │   │  • HTTP Trigger │    │   • Alerts          │  │
│  └─────────────────┘   └─────────────────┘    └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## 📁 Structure des fichiers

```
infra/
├── main.bicep                      # Template principal (orchestrateur)
├── modules/
│   ├── keyvault.bicep             # Azure Key Vault (secrets)
│   ├── appconfig.bicep            # Azure App Configuration
│   ├── storage.bicep              # Storage Account (Blob + Table)
│   ├── sqldatabase.bicep          # Azure SQL Database
│   ├── loganalytics.bicep         # Log Analytics Workspace
│   ├── container-apps-env.bicep   # Container Apps Environment
│   ├── container-app-backend.bicep # Backend Container App
│   ├── container-app-frontend.bicep# Frontend Container App
│   └── function-app.bicep         # Azure Function App
└── parameters/
    ├── parameters.dev.bicepparam  # Paramètres environnement DEV
    └── parameters.prod.bicepparam # Paramètres environnement PROD
```

## 🚀 Déploiement

### Prérequis

1. **Azure CLI** installé et connecté (`az login`)
2. **Bicep CLI** installé (`az bicep install`)
3. Un **Azure Container Registry** avec les images Docker

### Déploiement manuel

```bash
# 1. Créer le groupe de ressources
az group create --name rg-capuchesdopale-dev --location westeurope

# 2. Déployer l'infrastructure
az deployment group create \
  --resource-group rg-capuchesdopale-dev \
  --template-file infra/main.bicep \
  --parameters \
    projectName=capuchesdopale \
    environment=dev \
    sqlAdminUsername=<USERNAME> \
    sqlAdminPassword=<PASSWORD> \
    jwtSecret=<JWT_SECRET> \
    jwtSecretAdmin=<JWT_ADMIN_SECRET> \
    containerRegistryUrl=<ACR_URL> \
    containerRegistryUsername=<ACR_USER> \
    containerRegistryPassword=<ACR_PASSWORD>
```

### Déploiement via CI/CD (recommandé)

Le déploiement est automatisé via GitHub Actions. Voir `.github/workflows/azure-deploy.yml`.

## 🔐 Secrets GitHub requis

Configurez ces secrets dans les paramètres de votre repository GitHub :

| Secret | Description |
|--------|-------------|
| `AZURE_CREDENTIALS` | Service Principal JSON pour Azure |
| `ACR_LOGIN_SERVER` | URL du Container Registry (ex: `myacr.azurecr.io`) |
| `ACR_USERNAME` | Username du Container Registry |
| `ACR_PASSWORD` | Password du Container Registry |
| `SQL_ADMIN_USERNAME` | Username administrateur SQL |
| `SQL_ADMIN_PASSWORD` | Password administrateur SQL |
| `JWT_SECRET` | Secret pour les tokens JWT |
| `JWT_SECRET_ADMIN` | Secret pour les tokens JWT admin |

### Créer le Service Principal Azure

```bash
az ad sp create-for-rbac \
  --name "sp-capuchesdopale-github" \
  --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID> \
  --sdk-auth
```

Copiez la sortie JSON dans le secret `AZURE_CREDENTIALS`.

## 📊 Services Azure déployés

| Service | SKU | Description | Coût estimé/mois |
|---------|-----|-------------|------------------|
| Container Apps | Consumption | Frontend + Backend | ~15-30€ |
| Azure SQL | Basic (5 DTU) | Base de données | ~5€ |
| Storage Account | Standard LRS | Blob + Table | ~1-5€ |
| Function App | Consumption | Log receiver | ~0-5€ |
| Key Vault | Standard | Secrets | ~0.03€/10k ops |
| App Configuration | Free | Config centralisée | Gratuit |
| Log Analytics | Pay-per-GB | Monitoring | ~2-5€ |

**Coût total estimé : 25-50€/mois** (environnement dev)

## 🔧 Personnalisation

### Modifier les Feature Flags

Les feature flags sont définis dans `modules/appconfig.bicep` :

- `LoggingEnabled` : Active/désactive le logging Azure Function
- `MaintenanceMode` : Mode maintenance
- `NewQuestSystem` : Nouvelle fonctionnalité (dev only)

### Ajouter un nouveau secret

1. Ajouter le paramètre dans `main.bicep`
2. Ajouter le secret dans `modules/keyvault.bicep`
3. Mettre à jour le pipeline CI/CD

## 📝 Outputs

Après déploiement, les URLs suivantes sont disponibles :

- **Frontend** : `https://ca-capuchesdopale-{env}-web.{region}.azurecontainerapps.io`
- **Backend API** : `https://ca-capuchesdopale-{env}-api.{region}.azurecontainerapps.io`
- **Swagger** : `https://ca-capuchesdopale-{env}-api.{region}.azurecontainerapps.io/api`
- **Function App** : `https://func-capuchesdopale-{env}.azurewebsites.net`
