# Asset Management Service

> **Microservice ERP de Gestion des Actifs et de l'Inventaire**  
> Projet de Fin d'Année (PFA) 2024-2025 — Filière Génie Logiciel

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Academic-green.svg)]()

---

## 📋 Table des Matières

- [Description](#-description)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Stack Technologique](#-stack-technologique)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Documentation API](#-documentation-api)
- [Identifiants de Démonstration](#-identifiants-de-démonstration)
- [Tests](#-tests)
- [Conformité au Cahier des Charges](#-conformité-au-cahier-des-charges)
- [Structure du Projet](#-structure-du-projet)
- [Auteurs](#-auteurs)

---

## 📖 Description

**Asset Management Service** est un microservice RESTful conçu pour la gestion complète des actifs physiques d'une entreprise. Il s'inscrit dans un écosystème ERP modulaire et permet de :

- Gérer le cycle de vie complet des actifs (création, affectation, retour, suppression)
- Assurer la traçabilité de toutes les opérations via un journal d'audit automatique
- Contrôler les accès selon trois rôles distincts (Admin, Manager, Employé)
- Rechercher et filtrer les actifs selon divers critères
- Superviser l'état du service via un endpoint de santé

Le service est **dockerisé**, **stateless** et prêt à s'intégrer dans un système ERP plus large.

---

## ✨ Fonctionnalités

### Gestion des Utilisateurs (EF-01 à EF-05)
- ✅ Création de comptes utilisateurs avec rôles (Admin, Manager, Employé)
- ✅ Authentification JWT sécurisée
- ✅ Contrôle d'accès basé sur les rôles (RBAC)
- ✅ Modification et désactivation de comptes par l'admin
- ✅ Mise à jour du profil personnel par l'utilisateur

### Gestion des Catégories (EF-06 à EF-07)
- ✅ Création de catégories d'actifs (Informatique, Téléphonie, Mobilier, etc.)
- ✅ Modification et suppression avec vérification d'intégrité

### Gestion des Actifs (EF-08 à EF-12)
- ✅ CRUD complet avec soft delete
- ✅ 5 états possibles : Disponible, Affecté, Endommagé, Maintenance, Réformé
- ✅ Pagination et tri systématiques
- ✅ Consultation détaillée par identifiant

### Système d'Affectation (EF-13 à EF-17)
- ✅ Affectation d'un actif à un employé (Manager/Admin)
- ✅ Enregistrement du retour avec état constaté
- ✅ Changement automatique de statut
- ✅ Un seul employé par actif à la fois

### Audit et Traçabilité (EF-18 à EF-21)
- ✅ Journal d'audit automatique pour toutes les actions
- ✅ Historique complet des affectations par actif
- ✅ Données avant/après (diff) enregistrées
- ✅ Filtrage par date, utilisateur ou type d'action

### Recherche et Filtrage (EF-22 à EF-25)
- ✅ Recherche par nom, numéro de série ou catégorie
- ✅ Filtrage par état, catégorie ou employé affecté
- ✅ Pagination systématique des résultats

### Supervision (EF-29)
- ✅ Endpoint `/health` avec état du service et de la BDD
- ✅ Logs structurés au format JSON
- ✅ Métriques de performance (durée des requêtes)

---

## 🏗️ Architecture

Le service adopte une **architecture microservice REST** avec séparation en trois couches :

```
┌─────────────────────────────────────────────────────────┐
│                    Couche API (FastAPI)                  │
│   Routers, Schémas Pydantic, Middleware d'authentification │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 Couche Service (Métier)                  │
│   AssetService, UserService, AssignmentService, AuditService │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Couche Repository (Données)                 │
│        SQLAlchemy ORM, Migrations Alembic                │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │   PostgreSQL 15+        │
        │   (Base de données)     │
        └─────────────────────────┘
```

### Principes Directeurs
- **Responsabilité unique** : le service ne gère que les actifs et l'inventaire
- **Stateless** : aucune session serveur, état porté par le token JWT
- **Indépendance de déploiement** : base de données dédiée
- **Communication REST** : échanges via HTTP/JSON uniquement

---

## 🛠️ Stack Technologique

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **Langage** | Python 3.11+ | Écosystème riche, syntaxe claire |
| **Framework API** | FastAPI | Hautes performances, Swagger auto-généré |
| **Base de données** | PostgreSQL 15+ | SGBD robuste, support JSON, ACID |
| **ORM** | SQLAlchemy 2.0 | Protection contre injections SQL |
| **Authentification** | JWT (PyJWT) | Standard industrie, stateless |
| **Validation** | Pydantic | Validation stricte des données |
| **Conteneurisation** | Docker + Docker Compose | Reproductibilité, déploiement simplifié |
| **Frontend** | React / Next.js | Interface utilisateur moderne |

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Docker** & **Docker Compose** (v2.0+)
- **Git** (pour cloner le dépôt)
- Un navigateur web moderne

**Optionnel pour le développement :**
- Python 3.11+
- pip / virtualenv

---

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-repo/asset-management-service.git
cd asset-management-service
```

### 2. Démarrer les services

```bash
docker-compose up -d
```

Cette commande va automatiquement :
- Construire les images Docker
- Démarrer PostgreSQL
- Initialiser la base de données
- Exécuter le seeding des données de démonstration
- Lancer l'API FastAPI
- Lancer le frontend Next.js

### 3. Vérifier le démarrage

```bash
# Vérifier que tous les containers sont actifs
docker-compose ps

# Consulter les logs
docker-compose logs -f api
```

### 4. Arrêter les services

```bash
docker-compose down
```

---

## ⚙️ Configuration

Le fichier `.env` contient les variables de configuration :

```env
# Base de données
POSTGRES_USER=asset_user
POSTGRES_PASSWORD=asset_password
POSTGRES_DB=asset_management
DATABASE_URL=postgresql://asset_user:asset_password@db:5432/asset_management

# JWT
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=1

# API
API_HOST=0.0.0.0
API_PORT=8000
```

---

## 💻 Utilisation

### Accès aux Services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Interface utilisateur React |
| **API Swagger** | http://localhost:8000/docs | Documentation interactive |
| **API ReDoc** | http://localhost:8000/redoc | Documentation alternative |
| **Health Check** | http://localhost:8000/health | État du service |
| **API Root** | http://localhost:8000/ | Informations générales |

### Scénario de Démonstration Rapide

1. **Ouvrir** Swagger UI : http://localhost:8000/docs
2. **S'authentifier** : `POST /auth/login` avec `admin@test.com` / `admin123`
3. **Copier le token JWT** et l'ajouter à l'Authorization
4. **Créer un actif** : `POST /assets`
5. **Consulter la liste** : `GET /assets`
6. **Affecter à un employé** : `POST /assets/{id}/assign`
7. **Vérifier l'audit log** : `GET /audit-logs`

---

## 📚 Documentation API

L'API est entièrement documentée via **Swagger/OpenAPI** :

### Endpoints Principaux

#### Authentification
- `POST /auth/login` — Authentification (public)
- `GET /auth/me` — Profil de l'utilisateur connecté

#### Utilisateurs
- `GET /users` — Liste des utilisateurs (Admin)
- `POST /users` — Création d'utilisateur (Admin)
- `PUT /users/me` — Mise à jour de son profil (EF-05)
- `PUT /users/{id}` — Modification d'un utilisateur (Admin)
- `DELETE /users/{id}` — Suppression (Admin)

#### Catégories
- `GET /categories` — Liste des catégories
- `POST /categories` — Création (Admin)
- `PUT /categories/{id}` — Modification (Admin)
- `DELETE /categories/{id}` — Suppression (Admin)

#### Actifs
- `GET /assets` — Liste paginée avec filtres
- `POST /assets` — Création d'actif
- `GET /assets/{id}` — Détail d'un actif
- `PUT /assets/{id}` — Modification
- `DELETE /assets/{id}` — Suppression logique
- `POST /assets/{id}/assign` — Affectation
- `POST /assets/{id}/return` — Retour
- `GET /assets/{id}/history` — Historique des affectations

#### Affectations
- `GET /assignments/my-assets` — Actifs de l'employé connecté

#### Audit
- `GET /audit-logs` — Journal d'audit (Admin)

#### Supervision
- `GET /health` — État du service (public)

---

## 🔐 Identifiants de Démonstration

Les comptes suivants sont créés automatiquement au premier démarrage :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Administrateur** | `admin@test.com` | `admin123` |
| **Manager** | `manager@test.com` | `manager123` |
| **Employé 1** | `jean.dupont@test.com` | `employee123` |
| **Employé 2** | `marie.martin@test.com` | `employee123` |
| **Employé 3** | `ahmed.benali@test.com` | `employee123` |

⚠️ **Note de sécurité** : Ces identifiants sont destinés uniquement à l'environnement de développement/démonstration. **Ne jamais utiliser en production.**

---

## 🧪 Tests

### Exécuter les tests

```bash
# Via Docker
docker-compose exec api pytest

# Avec rapport de couverture
docker-compose exec api pytest --cov=app --cov-report=term-missing
```

### Types de tests
- **Tests unitaires** : validation de la logique métier
- **Tests d'intégration** : validation des endpoints API
- **Tests RBAC** : validation du contrôle d'accès

---

## ✅ Conformité au Cahier des Charges

Le projet implémente **100% des exigences fonctionnelles** du Cahier des Charges :

| Section | Exigences | Statut |
|---------|-----------|--------|
| 3.1 Gestion Utilisateurs | EF-01 à EF-05 | ✅ 100% |
| 3.2 Gestion Catégories | EF-06 à EF-07 | ✅ 100% |
| 3.3 Gestion Actifs | EF-08 à EF-12 | ✅ 100% |
| 3.4 États des Actifs | 5 états | ✅ 100% |
| 3.5 Affectation/Retour | EF-13 à EF-17 | ✅ 100% |
| 3.6 Audit & Historique | EF-18 à EF-21 | ✅ 100% |
| 3.7 Recherche/Filtres | EF-22 à EF-25 | ✅ 100% |
| 4.5 Logs JSON + /health | Section 4.5 | ✅ 100% |
| 6.7 Format Réponses | Section 6.7 | ✅ 100% |
| 9.2 Scénario Démo | Section 9.2 | ✅ Testé |

---

## 📁 Structure du Projet

```
asset-management-service/
├── app/
│   ├── api/                  # Endpoints REST
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── categories.py
│   │   ├── assets.py
│   │   ├── assignments.py
│   │   └── audit_logs.py
│   ├── core/                 # Configuration centrale
│   │   ├── database.py
│   │   ├── security.py
│   │   ├── dependencies.py
│   │   └── rbac.py
│   ├── models/               # Modèles SQLAlchemy
│   │   ├── user.py
│   │   ├── category.py
│   │   ├── asset.py
│   │   ├── assignment.py
│   │   └── audit_log.py
│   ├── schemas/              # Schémas Pydantic
│   │   ├── user.py
│   │   ├── category.py
│   │   ├── asset.py
│   │   └── assignment.py
│   ├── services/             # Logique métier
│   │   └── audit.py
│   ├── main.py               # Point d'entrée FastAPI
│   └── seed.py               # Seeding des données
├── frontend/                 # Application React/Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── audit-logs/
│   │   │   ├── my-assets/
│   │   │   └── assets/[id]/history/
│   │   └── lib/
│   │       └── api.ts
│   └── package.json
├── tests/                    # Tests unitaires et d'intégration
├── docker-compose.yml        # Orchestration Docker
├── Dockerfile                # Image API
├── requirements.txt          # Dépendances Python
├── .env                      # Variables d'environnement
└── README.md                 # Ce fichier
```

---

## 👥 Auteurs

**Projet réalisé dans le cadre du PFA 2024-2025**

- **[Votre Prénom NOM]** — Backend / Architecture
- **[Collègue Prénom NOM]** — Base de données / Tests / Documentation

**Encadrant** : [Nom de l'encadrant]  
**Établissement** : [Nom de l'établissement]  
**Filière** : Génie Logiciel / Informatique

---

## 📄 Licence

Ce projet est réalisé dans un cadre académique et est destiné à un usage éducatif uniquement.

---

## 🙏 Remerciements

- Merci à notre encadrant pour son suivi et ses conseils
- Merci à l'établissement pour les ressources mises à disposition
- Merci aux technologies open-source qui ont rendu ce projet possible

---

## 📸 Captures d'Écran

### Interface de Connexion
![Login Page](docs/screenshots/login.png)

### Tableau de Bord Administrateur
![Dashboard](docs/screenshots/dashboard.png)

### Gestion des Actifs avec Filtres
![Assets Management](docs/screenshots/assets-filters.png)

### Page "Mes Actifs" (Vue Employé)
![My Assets](docs/screenshots/my-assets.png)

### Journal d'Audit
![Audit Logs](docs/screenshots/audit-logs.png)

### Documentation Swagger Interactive
![Swagger UI](docs/screenshots/swagger.png)

> 💡 **Note** : Les captures d'écran sont disponibles dans le dossier `docs/screenshots/`
## 🛠️ Développement Local (sans Docker)

### Backend (FastAPI)

```bash
# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Lancer le serveur
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

**🎓 Projet prêt pour la soutenance — Juin 2026**