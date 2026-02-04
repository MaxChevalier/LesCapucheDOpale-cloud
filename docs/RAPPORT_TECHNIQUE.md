# Rapport Technique - Les Capuches d'Opale
## Application Web 3-Tiers sur Microsoft Azure

---

**Projet** : Les Capuches d'Opale - Système de Gestion de Guilde  
**Date** : Février 2026  
**Auteurs** : [Équipe du projet]  
**Repository** : https://github.com/MaxChevalier/LesCapucheDOpale-cloud

---

## Table des matières

1. [Introduction](#1-introduction)
2. [Choix techniques et justifications](#2-choix-techniques-et-justifications)
3. [Architecture déployée sur Azure](#3-architecture-déployée-sur-azure)
4. [Infrastructure as Code (Bicep)](#4-infrastructure-as-code-bicep)
5. [Pipeline CI/CD](#5-pipeline-cicd)
6. [Fonctionnalité de Logging (FaaS)](#6-fonctionnalité-de-logging-faas)
7. [Gestion des secrets et configurations](#7-gestion-des-secrets-et-configurations)
8. [Difficultés rencontrées et solutions](#8-difficultés-rencontrées-et-solutions)
9. [Estimation des coûts Azure](#9-estimation-des-coûts-azure)
10. [Conclusion](#10-conclusion)

---

## 1. Introduction

### 1.1 Contexte du projet

Les Capuches d'Opale est une application web de gestion d'une guilde d'aventuriers médiévale-fantastique. L'application permet de :

- Gérer les aventuriers (inscription, profils, spécialités)
- Organiser les quêtes (création, attribution, suivi)
- Gérer l'inventaire (équipements, consommables)
- Administrer la guilde (interface d'administration)

### 1.2 Objectifs du déploiement Azure

- Déployer une architecture 3-tiers complète et fonctionnelle
- Utiliser l'Infrastructure as Code avec Bicep
- Implémenter un pipeline CI/CD automatisé
- Utiliser les services PaaS/CaaS d'Azure
- Sécuriser l'application avec Key Vault et App Configuration

---

## 2. Choix techniques et justifications

### 2.1 Frontend : Angular

| Critère | Choix | Justification |
|---------|-------|---------------|
| Framework | Angular 20 | Framework robuste avec TypeScript natif, architecture modulaire, CLI puissante |
| Styling | SCSS | Préprocesseur CSS avec variables et mixins |
| Tests | Karma + Jasmine | Intégration native avec Angular CLI |
| Build | Angular CLI | Optimisation de production automatique |

**Avantages** :
- Architecture MVC claire et maintenable
- Injection de dépendances native
- RxJS pour la gestion des flux asynchrones
- Large écosystème et documentation

### 2.2 Backend : NestJS

| Critère | Choix | Justification |
|---------|-------|---------------|
| Framework | NestJS 11 | Architecture modulaire inspirée d'Angular, TypeScript natif |
| ORM | Prisma 6 | Type-safe, migrations automatiques, excellent DX |
| Auth | Passport JWT | Standard de l'industrie pour l'authentification stateless |
| Documentation | Swagger | Documentation API interactive générée automatiquement |

**Avantages** :
- Architecture modulaire et testable
- Décorateurs pour une syntaxe claire
- Support natif de TypeScript
- Intégration facile avec Azure services

### 2.3 Base de données : Azure SQL Database

| Critère | Choix | Justification |
|---------|-------|---------------|
| Service | Azure SQL Database | Service managé, haute disponibilité, sauvegardes automatiques |
| Tier | Basic (5 DTU) | Suffisant pour le développement, coût minimal |
| Connexion | Prisma + SQL Server driver | Support natif dans Prisma |

**Avantages** :
- Compatibilité SQL Server (existant dans le schéma Prisma)
- Service entièrement managé
- Scaling facile vers des tiers supérieurs
- Sécurité intégrée (TLS, firewall)

### 2.4 Modèle de déploiement : CaaS (Azure Container Apps)

| Option | Azure Container Apps | Azure Kubernetes Service | Azure App Service |
|--------|---------------------|-------------------------|-------------------|
| Complexité | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ |
| Flexibilité | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Coût | 💰💰 | 💰💰💰💰 | 💰💰 |
| Scaling | Auto | Manuel/Auto | Auto |
| **Choix** | ✅ | | |

**Justification du choix Container Apps** :
- Serverless containers : pas de gestion d'infrastructure
- Auto-scaling basé sur HTTP ou événements
- Support natif des révisions pour le blue-green deployment
- Coût optimisé (facturation à la consommation)
- Intégration native avec DAPR (si besoin futur)

### 2.5 Blob Storage : Azure Storage Account

| Fonctionnalité | Implementation |
|----------------|----------------|
| Upload fichiers | Controller NestJS + Azure SDK |
| Containers | `uploads`, `avatars`, `documents`, `quest-files` |
| Accès | Public pour avatars, privé pour documents |
| SDK | `@azure/storage-blob` |

---

## 3. Architecture déployée sur Azure

### 3.1 Diagramme d'architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Azure Container Apps Environment                          │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                         HTTPS Ingress                                  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                    │                              │                         │
│                    ▼                              ▼                         │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────┐ │
│  │      Frontend (Angular)     │  │        Backend (NestJS)             │ │
│  │      ca-...-web             │  │        ca-...-api                   │ │
│  │  ┌─────────────────────┐   │  │  ┌─────────────────────────────┐   │ │
│  │  │  Angular App        │   │  │  │  REST API                   │   │ │
│  │  │  + Nginx            │   │──▶│  │  + Swagger                  │   │ │
│  │  │                     │   │  │  │  + JWT Auth                  │   │ │
│  │  │  Port: 80           │   │  │  │  Port: 3000                  │   │ │
│  │  └─────────────────────┘   │  │  └─────────────────────────────┘   │ │
│  │  Scale: 1-3 replicas       │  │  Scale: 1-3 replicas               │ │
│  └─────────────────────────────┘  └────────────────┬────────────────────┘ │
└─────────────────────────────────────────────────────┼───────────────────────┘
                                                      │
              ┌───────────────────────────────────────┼───────────────────┐
              │                                       │                   │
              ▼                                       ▼                   ▼
┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────┐
│    Azure SQL Database   │   │    Azure Storage        │   │ Azure Function  │
│    sql-...-dev          │   │    Account              │   │ func-...-dev    │
│  ┌───────────────────┐  │   │  ┌─────────────────┐   │   │ ┌─────────────┐ │
│  │ guild-db          │  │   │  │ Blob Containers │   │   │ │log-receiver │ │
│  │ - Users           │  │   │  │ - uploads       │   │   │ │ HTTP Trigger│ │
│  │ - Adventurers     │  │   │  │ - avatars       │   │   │ └──────┬──────┘ │
│  │ - Quests          │  │   │  │ - documents     │   │   │        │        │
│  │ - Equipment       │  │   │  │ - quest-files   │   │   │        ▼        │
│  │ - ...             │  │   │  ├─────────────────┤   │   │ ┌─────────────┐ │
│  └───────────────────┘  │   │  │ Table Storage   │   │◀──│ │ApplicationLo│ │
│  Tier: Basic (5 DTU)    │   │  │ - Logs          │   │   │ │gs Table     │ │
└─────────────────────────┘   │  └─────────────────┘   │   │ └─────────────┘ │
                              └─────────────────────────┘   └─────────────────┘
              ┌───────────────────────────────────────┐
              │          Services Transversaux         │
              │  ┌─────────────┐  ┌────────────────┐  │
              │  │  Key Vault  │  │ App Config     │  │
              │  │  - Secrets  │  │ - Settings     │  │
              │  │  - Keys     │  │ - Feature Flags│  │
              │  └─────────────┘  └────────────────┘  │
              │  ┌─────────────────────────────────┐  │
              │  │       Log Analytics Workspace   │  │
              │  │       - Container Logs          │  │
              │  │       - Metrics                 │  │
              │  └─────────────────────────────────┘  │
              └───────────────────────────────────────┘
```

### 3.2 Flux de données

1. **Requête utilisateur** → Frontend (Angular)
2. **Appel API** → Backend (NestJS) via HTTPS
3. **Authentification** → Vérification JWT
4. **Données** → Azure SQL Database via Prisma
5. **Fichiers** → Azure Blob Storage
6. **Logs** → Azure Function → Table Storage

---

## 4. Infrastructure as Code (Bicep)

### 4.1 Structure des modules Bicep

```
infra/
├── main.bicep                    # Orchestrateur principal
└── modules/
    ├── keyvault.bicep           # Azure Key Vault
    ├── appconfig.bicep          # Azure App Configuration
    ├── storage.bicep            # Storage Account
    ├── sqldatabase.bicep        # Azure SQL Database
    ├── loganalytics.bicep       # Log Analytics
    ├── container-apps-env.bicep # Container Apps Environment
    ├── container-app-backend.bicep
    ├── container-app-frontend.bicep
    └── function-app.bicep       # Azure Function
```

### 4.2 Avantages de la modularisation

| Avantage | Description |
|----------|-------------|
| **Réutilisabilité** | Modules indépendants réutilisables |
| **Maintenabilité** | Modifications isolées par composant |
| **Testabilité** | Validation individuelle des modules |
| **Lisibilité** | Code organisé et documenté |
| **Paramétrage** | Environnements via fichiers de paramètres |

### 4.3 Exemple de déploiement

```bash
# Validation du template
az bicep build --file infra/main.bicep

# What-If (prévisualisation)
az deployment group what-if \
  --resource-group rg-capuchesdopale-dev \
  --template-file infra/main.bicep \
  --parameters @infra/parameters/parameters.dev.bicepparam

# Déploiement
az deployment group create \
  --resource-group rg-capuchesdopale-dev \
  --template-file infra/main.bicep \
  --parameters @infra/parameters/parameters.dev.bicepparam
```

---

## 5. Pipeline CI/CD

### 5.1 Workflows GitHub Actions

| Workflow | Fichier | Déclencheur | Description |
|----------|---------|-------------|-------------|
| CI Main | `workflow_pr_main.yml` | PR → main | Tests Frontend + Backend |
| Deploy | `azure-deploy.yml` | Push main / Manuel | Build + Deploy complet |
| Infra Only | `deploy-infra-only.yml` | Manuel | Déploiement Bicep seul |

### 5.2 Pipeline de déploiement complet

```
┌─────────────────────────────────────────────────────────────────┐
│                      azure-deploy.yml                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐                                           │
│  │ 1. Build & Test  │ ◀── Lint, Unit Tests (Front + Back)      │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                           │
│  │ 2. Docker Build  │ ◀── Build & Push vers ACR                │
│  │    & Push        │     (Frontend + Backend images)          │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                           │
│  │ 3. Deploy Infra  │ ◀── Déploiement templates Bicep          │
│  │    (Bicep)       │     (Tous les services Azure)            │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           ├──────────────────────────────────────┐              │
│           ▼                                      ▼              │
│  ┌──────────────────┐               ┌──────────────────┐       │
│  │ 4. Deploy        │               │ 5. DB Migration  │       │
│  │    Function App  │               │    (Prisma)      │       │
│  └────────┬─────────┘               └────────┬─────────┘       │
│           │                                   │                 │
│           └───────────────┬───────────────────┘                 │
│                           ▼                                      │
│                  ┌──────────────────┐                           │
│                  │ 6. Smoke Tests   │ ◀── Health checks        │
│                  └────────┬─────────┘                           │
│                           │                                      │
│                           ▼                                      │
│                  ┌──────────────────┐                           │
│                  │ 7. Notification  │ ◀── Summary dans PR      │
│                  └──────────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Secrets GitHub requis

| Secret | Description |
|--------|-------------|
| `AZURE_CREDENTIALS` | Service Principal JSON |
| `ACR_LOGIN_SERVER` | URL Container Registry |
| `ACR_USERNAME` | Username ACR |
| `ACR_PASSWORD` | Password ACR |
| `SQL_ADMIN_USERNAME` | Admin SQL |
| `SQL_ADMIN_PASSWORD` | Password SQL |
| `JWT_SECRET` | Secret JWT |
| `JWT_SECRET_ADMIN` | Secret JWT Admin |

---

## 6. Fonctionnalité de Logging (FaaS)

### 6.1 Azure Function : Log Receiver

**Technologie** : Azure Functions v4 avec Node.js 20

**Fonctionnalités** :
- Réception de logs via HTTP POST
- Stockage dans Azure Table Storage
- Partitionnement par date
- Support de plusieurs niveaux de log (debug, info, warn, error)

### 6.2 Structure des logs

```typescript
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp?: string;
  context?: string;
  service?: string;
  traceId?: string;
  metadata?: Record<string, unknown>;
}
```

### 6.3 Exemple d'utilisation

```typescript
// Côté Backend NestJS
await fetch('https://func-capuchesdopale-dev.azurewebsites.net/api/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    level: 'info',
    message: 'User login successful',
    context: 'AuthController',
    service: 'guild-backend',
    metadata: { userId: 123 }
  })
});
```

---

## 7. Gestion des secrets et configurations

### 7.1 Azure Key Vault

| Secret | Utilisation |
|--------|-------------|
| `sql-admin-username` | Connexion base de données |
| `sql-admin-password` | Connexion base de données |
| `jwt-secret` | Signature des tokens JWT |
| `jwt-secret-admin` | Signature des tokens admin |

**Intégration Backend** :
```typescript
// main.ts - Chargement automatique des secrets
const credential = new DefaultAzureCredential();
const client = new SecretClient(vaultUrl, credential);
const secret = await client.getSecret('jwt-secret');
process.env.JWT_SECRET = secret.value;
```

### 7.2 Azure App Configuration

| Configuration | Valeur | Description |
|---------------|--------|-------------|
| `App:Environment` | dev/prod | Environnement courant |
| `App:Pagination:DefaultPageSize` | 20 | Taille de page par défaut |
| `App:Upload:MaxFileSizeMB` | 10 | Taille max upload |

**Feature Flags** :
| Flag | Description | État par défaut |
|------|-------------|-----------------|
| `LoggingEnabled` | Active le logging FaaS | ✅ Activé |
| `MaintenanceMode` | Mode maintenance | ❌ Désactivé |
| `NewQuestSystem` | Nouveau système de quêtes | Dev uniquement |

---

## 8. Difficultés rencontrées et solutions

### 8.1 Problème : Connexion Prisma avec SQL Server Azure

**Symptôme** : Erreur de connexion TLS avec Azure SQL

**Solution** :
```
DATABASE_URL="sqlserver://server.database.windows.net:1433;database=db;user=user;password=pass;encrypt=true;trustServerCertificate=false"
```

### 8.2 Problème : CORS entre Container Apps

**Symptôme** : Erreurs CORS lors des appels API

**Solution** : Configuration CORS dans le module Bicep :
```bicep
corsPolicy: {
  allowedOrigins: ['*']
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  allowedHeaders: ['*']
  allowCredentials: true
}
```

### 8.3 Problème : Temps de démarrage des Container Apps

**Symptôme** : Health checks échouent au démarrage

**Solution** : Ajustement des probes :
```bicep
probes: [
  {
    type: 'Liveness'
    initialDelaySeconds: 30  // Augmenté
    periodSeconds: 10
    failureThreshold: 3
  }
]
```

### 8.4 Problème : Migration Prisma en CI/CD

**Symptôme** : `prisma migrate` nécessite une BDD vide

**Solution** : Utiliser `prisma db push` pour les environnements cloud :
```yaml
- name: Run Prisma migrations
  run: npx prisma db push --accept-data-loss
```

---

## 9. Estimation des coûts Azure

### 9.1 Environnement de développement

| Service | SKU | Coût estimé/mois |
|---------|-----|------------------|
| Container Apps (Frontend) | Consumption | ~5-10€ |
| Container Apps (Backend) | Consumption | ~10-20€ |
| Azure SQL Database | Basic (5 DTU) | ~5€ |
| Storage Account | Standard LRS | ~1-3€ |
| Function App | Consumption | ~0-2€ |
| Key Vault | Standard | ~1€ |
| App Configuration | Free | 0€ |
| Log Analytics | Per-GB | ~2-5€ |
| **TOTAL DEV** | | **~25-45€/mois** |

### 9.2 Environnement de production (estimation)

| Service | SKU | Coût estimé/mois |
|---------|-----|------------------|
| Container Apps (Frontend) | Consumption (3 replicas) | ~15-30€ |
| Container Apps (Backend) | Consumption (3 replicas) | ~30-60€ |
| Azure SQL Database | Standard S0 | ~15€ |
| Storage Account | Standard GRS | ~5-10€ |
| Function App | Consumption | ~5-10€ |
| Key Vault | Standard | ~2€ |
| App Configuration | Standard | ~0€ |
| Log Analytics | Per-GB | ~10-20€ |
| **TOTAL PROD** | | **~80-150€/mois** |

### 9.3 Optimisations possibles

1. **Reserved Instances** : -30% sur SQL Database
2. **Spot Instances** : Pour les workloads non-critiques
3. **Auto-scaling** : Réduire les replicas hors heures de pointe
4. **Retention logs** : Réduire la durée de rétention

---

## 10. Conclusion

### 10.1 Objectifs atteints

| Exigence | Statut | Commentaire |
|----------|--------|-------------|
| Architecture 3-tiers | ✅ | Frontend + Backend + Database |
| Déploiement CaaS | ✅ | Azure Container Apps |
| Infrastructure as Code | ✅ | Templates Bicep modulaires |
| CI/CD | ✅ | GitHub Actions complet |
| Blob Storage | ✅ | Upload fonctionnel |
| Key Vault | ✅ | Secrets centralisés |
| App Configuration | ✅ | Feature Flags inclus |
| FaaS Logging | ✅ | Azure Function opérationnelle |

### 10.2 Points d'amélioration

1. **Sécurité** : Implémenter Managed Identity pour tous les services
2. **Monitoring** : Ajouter des alertes Azure Monitor
3. **Performance** : Ajouter Azure Front Door/CDN
4. **Disaster Recovery** : Configurer la géo-réplication SQL

### 10.3 URLs de l'application déployée

- **Frontend** : `https://ca-capuchesdopale-dev-web.[region].azurecontainerapps.io`
- **Backend API** : `https://ca-capuchesdopale-dev-api.[region].azurecontainerapps.io`
- **Swagger** : `https://ca-capuchesdopale-dev-api.[region].azurecontainerapps.io/api`

---

## Annexes

### A. Commandes utiles

```bash
# Voir les logs des Container Apps
az containerapp logs show --name ca-capuchesdopale-dev-api --resource-group rg-capuchesdopale-dev

# Redémarrer un Container App
az containerapp revision restart --name ca-capuchesdopale-dev-api --resource-group rg-capuchesdopale-dev

# Voir les secrets Key Vault
az keyvault secret list --vault-name kv-capuchesdopaledev

# Exécuter une migration Prisma
npx prisma db push --schema=./back/prisma/schema.prisma
```

### B. Références

- [Documentation Azure Container Apps](https://learn.microsoft.com/azure/container-apps/)
- [Documentation Bicep](https://learn.microsoft.com/azure/azure-resource-manager/bicep/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma with SQL Server](https://www.prisma.io/docs/concepts/database-connectors/sql-server)
