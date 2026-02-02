# Les Capuches d'Opale - Système de Gestion de Guilde

Application web full-stack pour la gestion d'une guilde d'aventuriers médiévale-fantastique.

## 📖 À propos

**Les Capuches d'Opale** est une guilde d'aventuriers de taille moyenne en pleine expansion. Nous regroupons de nombreux
mercenaires et artisans à travers une myriade de spécialités : archers, barbares, paladins, mages arcaniques, prêtres,
géomanciens, mais aussi alchimistes, forgerons, enchanteurs, messagers, etc.

D'abord sans grande envergure, notre guilde a gagné en renommée ces dernières années et peut à présent se targuer de
faire partie des **20 guildes les plus populaires du pays**, avec près de **70 aventuriers actifs**.

Nous accueillons régulièrement de nouveaux aventuriers quel que soit leur niveau d'expérience initial afin de résoudre
les problèmes de nos divers clients et les accompagnons dans leur progression, de novice à vétéran.

## 🎯 Objectif du Projet

Ce projet vise à développer une application web permettant de :

-   **Gérer les aventuriers** : Inscription, profils, spécialités et statuts (novice, intermédiaire, vétéran, retraité)
-   **Organiser les quêtes** : Création, attribution, suivi et validation des missions
-   **Gérer l'inventaire** : Équipements, consommables et stocks disponibles
-   **Administrer la guilde** : Interface d'administration pour la gestion complète

### Utilisateurs cibles

1. **Coordinateurs de la guilde** : Gestion opérationnelle des aventuriers, des quêtes
2. **Clients** : Création des quêtes et paiement des récompenses

## 🏗️ Architecture

Le projet est structuré en deux parties distinctes :

### Backend (`/back`)

API REST développée avec **NestJS** et **Prisma ORM**.

**Technologies :**

-   NestJS 11.0.1
-   TypeScript 5.7.3
-   Prisma 6.17.0 (PostgreSQL)
-   Passport JWT (authentification)
-   Swagger (documentation API)
-   Jest (tests)

**Fonctionnalités :**

-   Authentification JWT avec rôles (Assistant, client)
-   CRUD complet pour aventuriers, quêtes, équipements
-   Gestion des stocks et attribution d'équipements
-   Documentation API interactive avec Swagger
-   Tests unitaires et e2e

📚 [Documentation Backend](./back/README.md)

### Frontend (`/front`)

Application web développée avec **Angular**.

**Technologies :**

-   Angular 20.3.4
-   TypeScript 5.8.3
-   RxJS 7.8.0
-   Karma & Jasmine (tests)
-   SCSS

**Fonctionnalités :**

-   Interface responsive et intuitive
-   Authentification et gestion des sessions
-   Tableau de bord des quêtes et aventuriers
-   Gestion d'inventaire
-   Interface d'administration

📚 [Documentation Frontend](./front/README.md)

## 🚀 Installation Rapide

### Prérequis

- NodeJS  
- npm
- Docker

### 1. Cloner le repository

```bash
git clone https://github.com/MaxChevalier/LesCapucheDOpale.git
cd LesCapucheDOpale
```

### 2. Configuration de l'environnement

```bash
# Créer le fichier .env à la racine du projet
cp .env.example .env
# Éditer .env avec vos configurations (voir les variables nécessaires ci-dessous)
```

**Variables d'environnement requises :**

```env
POSTGRES_DB=capuches_opale
POSTGRES_USER=postgres
POSTGRES_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_secret_jwt
JWT_SECRET_ADMIN=votre_secret_jwt_admin
```

### 3. Lancer l'application avec Docker

```bash
# Construire et démarrer tous les services
docker compose up --build

# Ou en mode détaché
docker compose up -d
```

**Services disponibles :**

-   **Frontend** : `http://localhost` (via nginx)
-   **Backend API** : `http://localhost/api` (via nginx)
-   **Base de données PostgreSQL** : `localhost:5432` (disponible en local seulement)
-   **Documentation Swagger** : `http://localhost/api`

### 4. Gérer les conteneurs

```bash
# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker compose down -v

# Voir les logs
docker compose logs -f

# Voir les logs d'un service spécifique
docker compose logs -f api

# Reconstruire un service spécifique
docker compose up --build api
```

### 5. Développement local (sans Docker)

Si vous souhaitez développer sans Docker :

**Backend :**

```bash
cd back
npm install

# Configurer .env avec DATABASE_URL pointant vers votre PostgreSQL local
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

**Frontend :**

```bash
cd front
npm install
npm start
```

## 📊 Base de Données

### Modèle de données principal

**Entités principales :**

-   **User** : Utilisateurs du système (rôles : assistant, client)
-   **Adventurer** : Profils des aventuriers (nom, description, image)
-   **Speciality** : Spécialités des aventuriers (archer, mage, forgeron, etc.)
-   **Status** : Statuts des aventuriers (novice, intermédiaire, vétéran, retraité)
-   **Quest** : Quêtes disponibles avec participants et récompenses
-   **Equipment** : Équipements disponibles (armes, armures, outils)
-   **EquipmentType** : Types d'équipements
-   **ConsumableType** : Types de consommables
-   **EquipmentStock** : Stocks d'équipements disponibles
-   **QuestStockEquipment** : Attribution d'équipements aux quêtes

### Gestion avec Prisma

```bash
# Appliquer les migrations
npx prisma migrate dev

# Ouvrir Prisma Studio
npx prisma studio

# Vérifier le statut des migrations
npx prisma migrate status
```

## 🧪 Tests et Qualité

### Backend

```bash
cd back

# Tests unitaires
npm test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov

# Linting
npm run lint

# Formatage
npm run format
```

### Frontend

```bash
cd front

# Tests avec coverage
npm test

# Tests CI
npm run testCi

# Consulter le rapport
xdg-open coverage/index.html
```

## 📖 Documentation API

La documentation interactive Swagger est disponible une fois le backend démarré :

```
http://localhost:3000/api
```

Le fichier OpenAPI se trouve dans `back/docs/openapi.yaml`

## 🛠️ Développement

### Structure du projet

```
LesCapucheDOpale/
├── back/                  # Backend NestJS
│   ├── prisma/           # Schéma et migrations
│   ├── src/              # Code source
│   │   ├── controllers/  # Contrôleurs REST
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── guards/       # Guards d'authentification
│   │   ├── modules/      # Modules NestJS
│   │   └── services/     # Services métier
│   └── docs/             # Documentation OpenAPI
│
└── front/                # Frontend Angular
    └── src/
        ├── app/          # Code source Angular
        └── assets/       # Ressources statiques
```

### Conventions de code

-   **Backend** : Utilise ESLint et Prettier
-   **Frontend** : Suit le guide de style Angular
-   Tests requis pour les nouvelles fonctionnalités
-   Coverage minimum : 80%

## 🤝 Contribution

1. Créer une branche depuis `dev`
2. Implémenter vos changements
3. Ajouter/mettre à jour les tests
4. Vérifier le linting et le formatage
5. Créer une Pull Request vers `dev`

## 📝 Licence

Ce projet est sous licence privée - voir les détails avec les propriétaires.

## 👥 Équipe

Projet développé dans le cadre de la formation YNOV.

## 🔗 Liens Utiles

-   [Documentation NestJS](https://docs.nestjs.com)
-   [Documentation Angular](https://angular.dev)
-   [Documentation Prisma](https://www.prisma.io/docs)
-   [Spécification du projet](./mast-coordfb-projet-capuches-opale.pdf)
