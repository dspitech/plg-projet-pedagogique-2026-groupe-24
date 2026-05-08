# PLG Projet Pédagogique 2026 — Groupe 24

> **Application web dashboard** pour centraliser, documenter et consulter des scripts cloud Azure & AWS, avec pages métier, fiches détaillées et composants UI réutilisables.

---

## Équipe

| Membre | 
|--------|
| Amir Minihadji AMINA |
| LO Pape | 
| Neylie NDJUMKENG-NGUEMO |
| **Mhand BOUFALA** - (**Superviseur**) |

---

## Table des matières

- [Objectif du projet](#objectif-du-projet)
- [Périmètre fonctionnel](#périmètre-fonctionnel)
- [Stack technique](#stack-technique)
- [Architecture du dépôt](#architecture-du-dépôt)
- [Architecture applicative](#architecture-applicative)
- [Routing](#routing)
- [Gestion des données et de l'état](#gestion-des-données-et-de-létat)
- [Installation et lancement](#installation-et-lancement)
- [Scripts disponibles](#scripts-disponibles)
- [Tests](#tests)
- [Qualité et conventions](#qualité-et-conventions)
- [Journal des tâches](#journal-des-tâches)
  - [Tâche 1 — Mise en place du frontend (01/04/2026)](#tâche-1--mise-en-place-du-frontend-01042026)
  - [Phase 5 — Développement MVP](#phase-5--développement-mvp)
    - [Tâche 1 — Refonte des pages Dashboard / Catégories / Ressources (21/04/2026)](#tâche-1--refonte-des-pages-dashboard--catégories--ressources-21042026)
    - [Tâche 2 — Formulaires de création Catégories & Scripts (22/04/2026)](#tâche-2--formulaires-de-création-catégories--scripts-22042026)
    - [Tâche 3 — Choix de la plateforme Supabase (01/05/2026)](#tâche-3--choix-de-la-plateforme-supabase-01052026)
    - [Tâche 4 — Système d'authentification & gestion des administrateurs (03/05/2026)](#tâche-4--système-dauthentification--gestion-des-administrateurs-03052026)
    - [Tâche 5 — Améliorations du dashboard : page utilisateur (06/05/2026)](#tâche-5--améliorations-du-dashboard--page-utilisateur-06052026)
    - [Tâche 6 — Configuration de la page Logs & Audits (06/05/2026)](#tâche-6--configuration-de-la-page-logs--audits-06052026)
    - [Tâche 7 — Refonte de la page profil (07/05/2026)](#tâche-7--refonte-de-la-page-profil-06052027)
    - [Tâche 8 — Création & configuration de la page catégorie (07/05/2026)](#tâche-8--Page-catégorie-06052028)
- [UML et documentation de conception](#uml-et-documentation-de-conception)


---

## Objectif du projet

Le projet vise à fournir un point d'entrée unique pour :

- organiser des scripts techniques par catégories et providers cloud ;
- standardiser la consultation de la documentation d'exécution ;
- simplifier la navigation entre usages courants (favoris, téléchargements, historique, partages) ;
- préparer une évolution vers des données dynamiques et des workflows métier.

---

## Périmètre fonctionnel

Fonctionnalités côté frontend :

- Dashboard principal
- Navigation par catégories et par provider
- Liste de scripts et pages de détail
- Pages utilisateur (profil, réglages, login)
- Pages utilitaires (contact, ressources, favoris, téléchargements, historique, partages)

---

## Stack technique

### Frontend

| Technologie | Version |
|-------------|---------|
| React | 18 |
| TypeScript | 5 |
| Vite + `@vitejs/plugin-react-swc` | 8 |
| React Router DOM | 6 |
| TanStack Query | — |

### UI / UX

- Tailwind CSS
- shadcn/ui + Radix UI
- Lucide React
- Recharts

### Formulaires et validation

- React Hook Form
- Zod + `@hookform/resolvers`

### Qualité et tests

- ESLint 9 (config flat)
- Vitest
- Testing Library (`react`, `jest-dom`)
- Environnement `jsdom`

---

## Architecture du dépôt

```text
.
├── README.md
├── Site-Web/                      # Application frontend (Vite + React + TS)
│   ├── package.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── eslint.config.js
│   ├── tailwind.config.ts
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       ├── data/
│       └── test/
└── UML/                           # Diagrammes de conception (PlantUML)
```

---

## Architecture applicative

### Entrée et providers

- `src/main.tsx` monte l'application React.
- `src/App.tsx` configure les providers principaux : `QueryClientProvider`, `TooltipProvider`, système de notifications (`toaster`/`sonner`), `BrowserRouter`.

### Organisation de `src/`

```text
src/
├── components/
│   ├── dashboard/      # ScriptCard, CategoryCard, StatCard
│   ├── layout/         # DashboardLayout, Sidebar, Header
│   ├── scripts/        # ScriptDetail (vue détail GitHub-like)
│   └── ui/             # shadcn primitives
├── contexts/
│   └── AuthContext.tsx  # Auth, rôles, permissions globaux
├── data/scripts.ts      # Modèle Script + helpers (catalogue)
├── hooks/useUserData.ts # Favoris / téléchargements / partages / historique
├── lib/passwordPolicy.ts
└── pages/
    ├── Index.tsx
    ├── CategoriesPage.tsx
    ├── ResourcesPage.tsx
    ├── CategoryPage.tsx
    ├── ScriptsPage.tsx
    ├── ScriptDetailPage.tsx
    ├── ProviderPage.tsx
    ├── FavoritesPage.tsx
    ├── DownloadsPage.tsx
    ├── SharesPage.tsx
    ├── HistoryPage.tsx
    ├── ProfilePage.tsx
    ├── ContactPage.tsx
    ├── LoginPage.tsx
    ├── NewCategoryPage.tsx
    ├── NewScriptPage.tsx
    └── admin/
        ├── UsersPage.tsx
        └── AuditLogsPage.tsx
```

---

## Routing

Routes déclarées dans `Site-Web/src/App.tsx` :

| Route | Description |
|-------|-------------|
| `/` | Dashboard principal |
| `/dashboard` | Redirige vers `/` |
| `/scripts` | Liste des scripts |
| `/script/:scriptId` | Détail d'un script |
| `/scripts/new` | Création d'un script |
| `/categories` | Liste des catégories |
| `/category/:categoryId` | Catégorie spécifique |
| `/categories/new` | Création d'une catégorie |
| `/provider/:providerId` | Scripts par provider |
| `/resources` | Ressources |
| `/favorites` | Favoris |
| `/shares` | Partages |
| `/downloads` | Téléchargements |
| `/history` | Historique |
| `/profile` | Profil utilisateur |
| `/contact` | Contact |
| `/login` | Connexion |
| `/signup` | Inscription (1er admin global) |
| `/forgot-password` | Réinitialisation mot de passe |
| `/reset-password` | Nouveau mot de passe (via lien) |
| `/set-password` | Première connexion obligatoire |
| `/admin/users` | Gestion des utilisateurs (global_admin) |
| `/admin/audit-logs` | Logs & audits (global_admin) |
| `/forbidden` | Accès refusé |
| `/suspended` | Compte suspendu |
| `*` | Page 404 NotFound |

### Protection des routes

`<ProtectedRoute>` dans `src/components/auth/ProtectedRoute.tsx` :

- Redirige vers `/login` si non connecté
- Redirige vers `/suspended` si compte suspendu
- Force `/set-password` à la première connexion
- Vérifie le `role` ou la `permission` requise → `/forbidden` sinon

---

## Gestion des données et de l'état

- Les données de scripts sont définies dans `Site-Web/src/data/scripts.ts`.
- Le hook `useUserData.ts` gère l'état utilisateur local (profil, favoris, téléchargements, partages, historique) via `localStorage`.
- `AuthContext.tsx` expose `user`, `session`, `profile`, `roles`, `permissions`, `hasRole()`, `hasPermission()`, `signIn`, `signOut`.
- Une couche TanStack Query est présente pour les futures intégrations API.

---

## Installation et lancement

### Prérequis

- Node.js 18+ (Node 20 LTS recommandé)
- npm

> Le frontend est dans `Site-Web/`. Les commandes doivent être exécutées dans ce dossier.

### Cloner et installer

```bash
git clone https://github.com/dspitech/plg-projet-pedagogique-2026-groupe-24.git
cd plg-projet-pedagogique-2026-groupe-24/Site-Web
npm install
```

### Démarrage en local

```bash
npm run dev
```

Par défaut, Vite est configuré sur le port `8080` (voir `Site-Web/vite.config.ts`).  
Ouvrir [http://localhost:8080](http://localhost:8080).

---

## Scripts disponibles

Depuis `Site-Web/` :

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Build de production |
| `npm run build:dev` | Build en mode développement |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` | Vérification ESLint |
| `npm run test` | Exécution des tests Vitest |
| `npm run test:watch` | Tests en mode watch |

---

## Tests

- Configuration dans `Site-Web/vitest.config.ts`
- Setup global dans `Site-Web/src/test/setup.ts` (dont mock `matchMedia`)
- Test d'exemple présent dans `Site-Web/src/test/example.test.ts`

```bash
cd Site-Web
npm run test
```

---

## Qualité et conventions

- **Linting** : `Site-Web/eslint.config.js`
- **Styling** : `Site-Web/tailwind.config.ts` + `postcss.config.js`
- **Alias TypeScript** : `@/*` vers `src/*` (voir `tsconfig.app.json`)

Bonnes pratiques recommandées :
- Lancer `npm run lint` avant chaque commit
- Ajouter des tests pour toute logique métier critique
- Faire des commits atomiques avec messages explicites

---

## Journal des tâches

---

### Tâche 1 — Mise en place du frontend (01/04/2026)

Mise en place initiale du projet frontend avec Vite + React + TypeScript. Configuration du routing, des composants de layout, du dashboard de base et de la structure de données des scripts.

**État à cette étape :** frontend seul, pas de backend branché.

---

### Phase 5 — Développement MVP

Plateforme web centralisée pour la gestion, la documentation et l'exploitation de scripts cloud (Azure & AWS) à destination des équipes administrateurs.

![image](https://hackmd.io/_uploads/r1Cz5s4aWe.png)

---

### Tâche 1 — Refonte des pages Dashboard / Catégories / Ressources (21/04/2026)

Refonte complète du style visuel des trois pages clés de la plateforme, dans la lignée des standards GitHub, Linear et Vercel.

#### Dashboard — `/` (`src/pages/Index.tsx`)

- **Hero header** avec badge de statut animé (Opérationnel), version build et CTA primaires
- **4 KPI cards** : Scripts disponibles, Azure, AWS, Validés — avec icônes colorées et indicateur d'évolution
- **Charts row** : barchart "Scripts par catégorie" + donut "Par provider" (Recharts) avec tooltips thémés
- **Activity feed** chronologique + **grille d'accès rapides**
- **System status** footer (API / Catalogue / Recherche / CDN) avec indicateurs animés

![image](https://hackmd.io/_uploads/B1Qlcs4aWe.png)
![image](https://hackmd.io/_uploads/H1LWciVTWx.png)

#### Catégories — `/categories` (`src/pages/CategoriesPage.tsx`)

- Header avec **breadcrumb**, description et **mini-stats** (nombre de catégories / scripts)
- Cards catégorie : icône colorée par accent, **slug en monospace**, compteur de scripts, **% du catalogue** et **barre de progression** dynamique
- Bandeau d'astuce de recherche + footer "Demander une nouvelle catégorie"

![image](https://hackmd.io/_uploads/HkHV9sNpZl.png)

#### Ressources — `/resources` (`src/pages/ResourcesPage.tsx`)

- Header avec icône `Library`, breadcrumb et stats (ressources totales / catégories)
- **Barre de recherche** live + **filtres par catégorie** sous forme de chips
- Cards avec : icône thématisée, **badge de type** (Doc / CLI / Repo / Vidéo / Guide), nom de domaine en monospace, lien externe
- Sections regroupées dynamiquement avec compteur, état vide explicite

![image](https://hackmd.io/_uploads/HJRHqsN6Wg.png)

#### Améliorations transverses

- 100 % **design tokens HSL** — aucun hex codé en dur dans les composants
- Hover states unifiés (border primary + ombre primary/5 + transitions)
- Typographie tabulaire (`tabular-nums`) pour tous les chiffres
- Spacing dense type GitHub (gap-3/4, padding compact)
- Composants accessibles : focus rings, contrastes respectés en thème sombre

---

### Tâche 2 — Formulaires de création Catégories & Scripts (22/04/2026)

Introduction de deux formulaires professionnels de création.

#### Nouvelle catégorie — `/categories/new` (`src/pages/NewCategoryPage.tsx`)

Formulaire en 2 colonnes (formulaire + **aperçu en direct sticky**).

**Champs :**
- **Nom** (obligatoire, 2-60 car., compteur live)
- **Description** (optionnelle, 280 car. max)
- **Couleur** : color picker natif + champ HEX synchronisé + 8 presets cliquables
- **Icône** : grille de 12 icônes Lucide sélectionnables
- **Statut** : `Actif` / `Inactif` avec pastille colorée

![image](https://hackmd.io/_uploads/Skxcqj46-x.png)
![image](https://hackmd.io/_uploads/SJ5jqj4pWx.png)

#### Nouveau script — `/scripts/new` (`src/pages/NewScriptPage.tsx`)

**Identité :**
- **Nom** (obligatoire, 3-100 car.)
- **Description** : textarea avec **mini-toolbar WYSIWYG** (Gras / Italique / Liste / Lien — markdown) + compteur 2000 car.
- **Catégorie** : Select dynamique chargé depuis `categories`
- **Type** : Bash, PowerShell, Python, Azure CLI, AWS CLI, Bicep, ARM, Terraform, CloudFormation, JS, TS

**Code source :**
- Éditeur stylisé avec **chrome de fenêtre type IDE** (3 dots colorées + nom de fichier dynamique avec extension auto-détectée)
- Police monospace, fond foncé, badge du langage sélectionné

**Documentation détaillée :**
- Fonctionnalités, Prérequis, Exemple (mono), Autres informations
- **Upload d'images** : zone **drag & drop** + parcourir, prévisualisation grille, validation type/taille (5 MB max)

**Sidebar métadonnées (sticky) :**
- **Criticité** : 4 boutons radio colorés (Faible / Moyenne / Élevée / Critique)
- **Version** : champ avec regex (`v1.0.0`)
- **Statut** : Select avec pastille
- **Tags** : système de **chips** avec autocomplete (max 15, Entrée ou virgule pour ajouter)

**Validation & Accessibilité :**
- Schéma **Zod** complet avec règles métier
- Scroll automatique vers le premier champ en erreur
- `aria-invalid`, `aria-pressed`, `aria-label` sur les contrôles non-textuels
- Persistance en `localStorage` (`custom_scripts`)

![image](https://hackmd.io/_uploads/HyGpciVTZg.png)
![image](https://hackmd.io/_uploads/S1BCcoNTZe.png)
![image](https://hackmd.io/_uploads/rkKyioNpZe.png)
![image](https://hackmd.io/_uploads/SyV-isV6bx.png)
![image](https://hackmd.io/_uploads/SJeMisEp-x.png)

---

### Tâche 3 — Choix de la plateforme Supabase (01/05/2026)

#### Qu'est-ce que Supabase ?

Supabase est une **alternative open-source à Firebase** basée sur **PostgreSQL**. Il fournit un **backend complet "as-a-service" (BaaS)** comprenant base de données, authentification, API automatique, temps réel, stockage de fichiers et Edge Functions.

#### Architecture de Supabase

| Brique | Description |
|--------|-------------|
| **PostgreSQL** | Base de données relationnelle, JSON natif, indexation avancée |
| **Auth** | JWT sécurisé, OAuth (Google, GitHub…), gestion des utilisateurs |
| **Realtime** | WebSockets, synchronisation instantanée |
| **Storage** | Gestion de fichiers (images, documents…) |
| **Edge Functions** | Backend serverless, exécution proche de l'utilisateur |

#### Pourquoi Supabase ?

- **Open Source** : code transparent, auto-hébergeable, pas de vendor lock-in
- **PostgreSQL** : SQL standard, requêtes puissantes (JOIN, agrégations), transactions fiables
- **API automatique** : REST + GraphQL générés automatiquement, sans backend à développer
- **Auth intégrée** : email/mot de passe, magic link, OAuth, gestion des sessions
- **Row Level Security (RLS)** : contrôle d'accès directement en base, par utilisateur
- **Realtime** : WebSockets intégrés, idéal pour dashboards live et notifications
- **Edge Functions** : logique métier serverless en TypeScript

#### Supabase vs Firebase

| Critère | Supabase | Firebase |
|---------|----------|----------|
| Base de données | PostgreSQL (SQL) | NoSQL (Firestore) |
| Open Source | ✅ | ❌ |
| Requêtes complexes | Très puissantes | Limitées |
| Vendor lock-in | Faible | Élevé |
| Auth | ✅ | ✅ |
| Realtime | ✅ | ✅ |

#### Limites de Supabase

- Moins mature que Firebase (écosystème plus petit)
- Nécessite SQL — moins accessible pour les débutants
- Realtime moins avancé que Firestore, mais suffisant dans 90 % des cas

#### Principales commandes Supabase CLI

**Installation**

```bash
npm install -g supabase
```

**Authentification**

```bash
supabase login
supabase logout
```

**Initialisation et liaison**

```bash
supabase init
supabase link --project-ref <project-ref>
```

**Développement local**

```bash
supabase start          # Lance PostgreSQL, API, Auth, Realtime, Studio
supabase stop
supabase db reset       # Supprime toutes les données locales
supabase db pull        # Pull schéma depuis le cloud
```

**Migrations**

```bash
supabase migration new nom_de_la_migration
supabase migration up
supabase migration list
```

**Edge Functions**

```bash
supabase functions new nom-fonction
supabase functions serve
supabase functions deploy nom-fonction
supabase functions delete nom-fonction
```

**Divers**

```bash
supabase secrets set NOM=valeur
supabase secrets list
supabase storage create nom-bucket
supabase logs
supabase status
```

#### Création de l'organisation et du projet

**Organisation**

![image](https://hackmd.io/_uploads/ryK9sOdR-x.png)
![image](https://hackmd.io/_uploads/B1V2o_uAbg.png)
![image](https://hackmd.io/_uploads/BJp3jd_0Wx.png)

**Nouveau projet**

![image](https://hackmd.io/_uploads/rJAe3_uRWx.png)
![image](https://hackmd.io/_uploads/rku_2u_0-l.png)
![image](https://hackmd.io/_uploads/rko32duRbe.png)

**Déploiement**

![image](https://hackmd.io/_uploads/rk5lTduA-g.png)
![image](https://hackmd.io/_uploads/BJTa6dOC-e.png)

#### Installation de la CLI Supabase en local

**Prérequis** : Node.js (LTS) + Docker installé et configuré.

![image](https://hackmd.io/_uploads/rkGQQY_Abl.png)

```bash
# Télécharger
curl -L https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz -o supabase.tar.gz
# Extraire et installer
sudo mv supabase /usr/local/bin/
```

![image](https://hackmd.io/_uploads/HkNzNF_R-l.png)
![image](https://hackmd.io/_uploads/BJaNNtdR-l.png)
![image](https://hackmd.io/_uploads/r1iu4tOAbx.png)
![image](https://hackmd.io/_uploads/SyUqVK_0Zg.png)
![image](https://hackmd.io/_uploads/Hyx5Stu0-x.png)

```bash
supabase orgs list
supabase projects list
supabase link --project-ref lmjxkuxruprjgiutdjvw
supabase start
```

![image](https://hackmd.io/_uploads/Hk7LItOCWx.png)
![image](https://hackmd.io/_uploads/HJr-PYuRbx.png)
![image](https://hackmd.io/_uploads/HJJTPYOA-g.png)
![image](https://hackmd.io/_uploads/rkfM_KdAZl.png)
![image](https://hackmd.io/_uploads/SyktdYuRbl.png)
![image](https://hackmd.io/_uploads/SJnxKFuRbg.png)
![image](https://hackmd.io/_uploads/S150KtdAbg.png)

#### Types de clés API Supabase

| Type de clé | Usage | Sécurité |
|-------------|-------|----------|
| **Publishable Key** | Frontend (React, Next.js…) | Publique, sans danger |
| **Secret Key** | Backend uniquement (Edge Functions, serveur) | Ultra sensible — ne jamais exposer |
| **AWS Access Key ID** | Identification IAM AWS | Sensible |
| **AWS Secret Access Key** | Auth AWS API | Ultra sensible |

>  La `service_role_key` (Secret Key) ne doit **jamais** être dans le frontend, ni committée sur GitHub.

---

### Tâche 4 — Système d'authentification & gestion des administrateurs (03/05/2026)

#### Base de données — Schéma RBAC

Migration créant 5 tables avec RLS strict :

| Table | Rôle |
|-------|------|
| `profiles` | Données utilisateur (nom, email, actif, suspendu, must_change_password, last_login) |
| `user_roles` | Association user ↔ rôle (`global_admin`, `admin`, `editor`, `viewer`) |
| `permissions` | Catalogue de permissions (resource × action : create/read/update/delete) |
| `role_permissions` | Matrice rôle ↔ permissions (seed initial inclus) |
| `audit_logs` | Journal horodaté des actions (login, invite, suspend, delete, update_roles…) |

![image](https://hackmd.io/_uploads/r1JuU9uCZe.png)

**Fonctions sécurisées (`SECURITY DEFINER`) :**
- `has_role(user_id, role)` — évite la récursion RLS
- `has_permission(user_id, resource, action)` — résolution via les rôles
- `is_active_user(user_id)` — vérifie actif et non suspendu
- `handle_new_user()` — trigger `auth.users` : crée le profil et attribue le rôle initial. Le **1er utilisateur** devient automatiquement `global_admin`, les suivants reçoivent `viewer`
- `log_audit_event(action, resource, resource_id, details)` — helper de journalisation

![image](https://hackmd.io/_uploads/B1ZqL9dCWx.png)

#### Rôles & Permissions

**Rôles disponibles**

| Rôle | Description |
|------|-------------|
| `global_admin` | Accès total (FULL ACCESS) |
| `admin` | Tout sauf `users.delete` |
| `editor` | Lecture/édition scripts, ressources, profil |
| `viewer` | Lecture seule |

![image](https://hackmd.io/_uploads/BJPALqdAZx.png)
![image](https://hackmd.io/_uploads/BJcJvqO0Zl.png)
![image](https://hackmd.io/_uploads/B1G-v5dAWe.png)

**Permissions disponibles**

| Ressource | Actions |
|-----------|---------|
| `users` | create, read, update, delete |
| `scripts` | create, read, update, delete |
| `resources` | create, read, update, delete |
| `contact` | read, update, delete |
| `logs` | read |
| `profile` | read, update |
| `site` | read, update |

![image](https://hackmd.io/_uploads/rynXPcORZg.png)

#### Script SQL complet — Système RBAC

<details>
<summary>Voir le script SQL complet</summary>

```sql
-- =========================================================
-- 1. ENUM des rôles
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('global_admin', 'admin', 'editor', 'viewer');

-- =========================================================
-- 2. Trigger générique updated_at
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- 3. Table profiles
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 4. Table user_roles
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);

-- =========================================================
-- 5. Table permissions
-- =========================================================
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create','read','update','delete')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (resource, action)
);
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 6. Table role_permissions
-- =========================================================
CREATE TABLE public.role_permissions (
  role public.app_role NOT NULL,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role, permission_id)
);
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 7. Table audit_logs
-- =========================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '

---

### Tâche — Refonte complète de la page Scripts (CRUD + dashboard pro)

**Objectif** : transformer la bibliothèque de scripts en un véritable centre de gestion professionnel, dynamique et connecté à Supabase, calqué sur le standard de la page Catégories.

**Base de données — table `scripts`**
- Colonnes : `name`, `description`, `script_type` (enum : powershell, bash, python, azure_cli, aws_cli, terraform, bicep, arm, cloudformation, ansible, kubernetes, docker, sql, javascript, typescript, go, ruby, perl, yaml, json, other), `content`, `features`, `prerequisites`, `usage_example`, `screenshots[]`, `criticality` (low/medium/high/critical), `version`, `status` (draft/active/inactive/archived/deprecated), `tags[]`, `category_id` (FK → categories), `author_id`, `license`, `language`, `compatibility`, `dependencies`, `documentation`, `version_history` (jsonb), `downloads_count`, `views_count`, `average_rating`, `favorites_count`, `visibility` (public/private), `is_validated`, `created_at`, `updated_at`.
- Trigger `updated_at` automatique.
- RLS : lecture des scripts publics, des scripts dont on est l'auteur, ou pour les rôles editor/admin/global_admin ; écriture réservée aux rôles editor/admin/global_admin (ou propriétaire pour update) ; suppression réservée aux admins.

**UI / UX**
- Header gradient + 6 cards statistiques animées (Total, Actifs, Archivés, Critiques, Publics, Téléchargements) avec animations `fade-in`, hover translate / blur glow.
- 3 modes d'affichage : **Grille** (cards riches), **Cards** (vue liste compacte), **Tableau** (dense avec sélection multiple).
- Pagination 10 éléments / page, navigation Précédent/Suivant.
- Tri configurable : MAJ, création, nom A-Z/Z-A, téléchargements, vues, note moyenne.

**Recherche & filtres**
- Recherche dynamique en temps réel (nom, description, tags).
- Filtres rapides : statut, type, catégorie.
- Panneau **Recherche avancée** : criticité, visibilité, auteur, tag, plage de dates.
- **Sauvegarde des filtres** dans `localStorage` + bouton de réinitialisation.

**Actions globales (avant le tableau)**
- Sélectionner tout / Désélectionner / Archiver / Supprimer (avec confirmation).

**Actions rapides par script**
- Modifier, Activer/Désactiver, Public/Privé, Dupliquer, Archiver, Supprimer.

**Modèle JSON & Import**
- Téléchargement d'un modèle JSON pré-rempli.
- Import JSON en drag & drop avec validation, prévisualisation, barre de progression et rapport d'erreurs ligne par ligne (doublons ignorés).

**Export**
- Export PDF (en-tête branded + tableau autotable + pagination).
- Export CSV (toutes les colonnes essentielles).

**Formulaire de création/édition**
- Dialog 2 colonnes responsive : Informations (nom, description, type, catégorie, criticité, statut, visibilité, version, licence, tags) + Contenu & Documentation (code source mono, fonctionnalités, prérequis, exemple, langage, compatibilité, dépendances, documentation).
- Validation client + retour Supabase géré via `sonner`.

**Sécurité & qualité**
- Toutes les opérations passent par `supabase` avec RLS.
- Auteur enregistré automatiquement à la création (`author_id = auth.uid()`).
- Loaders et états vides traités, design 100 % responsive (mobile + desktop).
