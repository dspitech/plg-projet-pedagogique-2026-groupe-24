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
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource);

-- =========================================================
-- 8. Fonctions sécurisées
-- =========================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _resource TEXT, _action TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = _user_id AND p.resource = _resource AND p.action = _action
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_user(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND is_active = true AND is_suspended = false);
$$;

-- =========================================================
-- 9. Trigger handle_new_user
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE user_count INT;
BEGIN
  INSERT INTO public.profiles (id, name, email, must_change_password)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false)
  );
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'global_admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- 10. Helper de logging
-- =========================================================
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action TEXT, _resource TEXT, _resource_id TEXT DEFAULT NULL, _details JSONB DEFAULT '{}'::jsonb
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE log_id UUID; uid UUID; uemail TEXT;
BEGIN
  uid := auth.uid();
  SELECT email INTO uemail FROM public.profiles WHERE id = uid;
  INSERT INTO public.audit_logs (user_id, user_email, action, resource, resource_id, details)
  VALUES (uid, uemail, _action, _resource, _resource_id, _details) RETURNING id INTO log_id;
  RETURN log_id;
END;
$$;

-- =========================================================
-- 11. Politiques RLS
-- =========================================================
CREATE POLICY "Profiles: own read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profiles: global_admin read all" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'global_admin'));
CREATE POLICY "Profiles: own update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND is_suspended = false);
CREATE POLICY "Profiles: global_admin update all" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'global_admin')) WITH CHECK (public.has_role(auth.uid(), 'global_admin'));
CREATE POLICY "Profiles: global_admin delete" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'global_admin'));

CREATE POLICY "Roles: own read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Roles: global_admin read all" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'global_admin'));
CREATE POLICY "Roles: global_admin manage" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'global_admin')) WITH CHECK (public.has_role(auth.uid(), 'global_admin'));

CREATE POLICY "Permissions: authenticated read" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permissions: global_admin manage" ON public.permissions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'global_admin')) WITH CHECK (public.has_role(auth.uid(), 'global_admin'));

CREATE POLICY "RolePerms: authenticated read" ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "RolePerms: global_admin manage" ON public.role_permissions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'global_admin')) WITH CHECK (public.has_role(auth.uid(), 'global_admin'));

CREATE POLICY "Audit: own read" ON public.audit_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Audit: global_admin read all" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'global_admin'));
CREATE POLICY "Audit: authenticated insert own" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- 12. Seed permissions + role_permissions
-- =========================================================
INSERT INTO public.permissions (resource, action, description) VALUES
  ('site','read','Lire le contenu global du site'),('site','update','Modifier le contenu global'),
  ('resources','create','Ajouter une ressource'),('resources','read','Consulter les ressources'),
  ('resources','update','Modifier une ressource'),('resources','delete','Supprimer une ressource'),
  ('scripts','create','Créer un script'),('scripts','read','Consulter les scripts'),
  ('scripts','update','Modifier un script'),('scripts','delete','Supprimer un script'),
  ('users','create','Créer un administrateur'),('users','read','Consulter les administrateurs'),
  ('users','update','Modifier un administrateur'),('users','delete','Supprimer un administrateur'),
  ('contact','read','Lire les demandes de contact'),('contact','update','Traiter les demandes de contact'),
  ('contact','delete','Supprimer les demandes de contact'),('logs','read','Consulter les logs et audits'),
  ('profile','read','Lire son profil'),('profile','update','Modifier son profil');

INSERT INTO public.role_permissions (role, permission_id) SELECT 'global_admin'::public.app_role, id FROM public.permissions;
INSERT INTO public.role_permissions (role, permission_id) SELECT 'admin'::public.app_role, id FROM public.permissions WHERE resource <> 'users';
INSERT INTO public.role_permissions (role, permission_id) SELECT 'editor'::public.app_role, id FROM public.permissions
  WHERE (resource = 'scripts' AND action IN ('create','read','update'))
     OR (resource = 'resources' AND action IN ('create','read','update'))
     OR (resource = 'profile') OR (resource = 'site' AND action = 'read');
INSERT INTO public.role_permissions (role, permission_id) SELECT 'viewer'::public.app_role, id FROM public.permissions
  WHERE action = 'read' AND resource IN ('scripts','resources','site','profile');
```

</details>

#### Pages d'authentification

| Route | Description |
|-------|-------------|
| `/login` | Connexion email + mot de passe |
| `/signup` | Création du 1er administrateur global |
| `/forgot-password` | Demande d'email de réinitialisation |
| `/reset-password` | Nouveau mot de passe via lien sécurisé |
| `/set-password` | Première connexion : mot de passe obligatoire |
| `/forbidden` | Accès refusé |
| `/suspended` | Compte suspendu |

**Politique de mot de passe** (définie dans `src/lib/passwordPolicy.ts`) :
- ≥ 16 caractères
- Majuscule + minuscule + chiffre + caractère spécial
- Indicateur de force (4 niveaux) + checklist live

**Pages d'authentification**

![image](https://hackmd.io/_uploads/S1MLCc_Abg.png)
![image](https://hackmd.io/_uploads/r1-jCcdA-g.png)
![image](https://hackmd.io/_uploads/B163AqdRWx.png)
![image](https://hackmd.io/_uploads/ByaaC9d0-l.png)

#### Page administrateur global — `/admin/users`

- Liste tabulaire (nom, email, rôles, statut, dernière connexion)
- Recherche live nom/email
- **Invitation** d'un administrateur (nom + email + rôles multi-sélection) → email automatique
- Modification des rôles (multi-checkbox dans dialog)
- Suspension / réactivation
- Forcer la réinitialisation du mot de passe
- Suppression définitive (avec confirmation, blocage auto-suppression)

#### Logs & Audit — `/admin/audit-logs`

- Tableau horodaté des 500 dernières actions
- Recherche multi-critère + filtre par ressource
- Icône et couleur par type d'action
- Détails JSON par action

#### Edge Functions Supabase

| Fonction | Rôle |
|----------|------|
| `admin-invite-user` | Crée le compte via `auth.admin.inviteUserByEmail`, attribue les rôles, marque `must_change_password=true`, log audit |
| `admin-delete-user` | Supprime un utilisateur via `auth.admin.deleteUser`, log audit. Auto-suppression bloquée |

![image](https://hackmd.io/_uploads/rynMd5_0bx.png)

#### Sécurité

- Hashage des mots de passe géré par Supabase Auth (bcrypt)
- Tokens d'invitation et de reset **expirables**, à usage unique
- RLS strict sur toutes les tables, fonctions `SECURITY DEFINER` pour éviter la récursion
- Vérification des permissions **côté serveur** via RLS et Edge Functions
- `service_role_key` jamais exposée au frontend
- Audit logs pour login, logout, invite, suspend, reactivate, delete, update_roles, password reset
- Auto-suppression et auto-suspension bloquées

#### Templates d'email personnalisés

- Confirmation d'inscription
- Invitation d'un administrateur
- Réinitialisation de mot de passe

![image](https://hackmd.io/_uploads/HJlZ8jORZx.png)
![image](https://hackmd.io/_uploads/HJ1GIo_CZe.png)
![image](https://hackmd.io/_uploads/rkepLs_Abx.png)
![image](https://hackmd.io/_uploads/SJDNDs_0Zl.png)

#### Premier démarrage — Création du compte admin global

1. Aller sur `/signup`

![image](https://hackmd.io/_uploads/Hkt01jdCZx.png)
![image](https://hackmd.io/_uploads/ByYJxjORbx.png)

2. Créer un compte → devient automatiquement **Administrateur Global**

![image](https://hackmd.io/_uploads/SJ0tljuAWe.png)

3. Confirmer par email

![image](https://hackmd.io/_uploads/S1gebsu0Wx.png)

4. Accès au tableau de bord

![image](https://hackmd.io/_uploads/BkbI-iO0Ze.png)

5. Vérification en base de données

![image](https://hackmd.io/_uploads/r1Xc-juCbx.png)
![image](https://hackmd.io/_uploads/BJP6Zj_CZg.png)

#### Tests — Invitation d'un utilisateur

![image](https://hackmd.io/_uploads/HyyOdj_CWl.png)
![image](https://hackmd.io/_uploads/S1iytj_0-g.png)
![image](https://hackmd.io/_uploads/rkFlFjdCZe.png)
![image](https://hackmd.io/_uploads/r1nrFs_0We.png)
![image](https://hackmd.io/_uploads/rkIJl3uAWx.png)
![image](https://hackmd.io/_uploads/HyoGg2O0be.png)
![image](https://hackmd.io/_uploads/ByoVe2_C-x.png)
![image](https://hackmd.io/_uploads/HyaBx3O0Zg.png)
![image](https://hackmd.io/_uploads/BJn4-hO0Wx.png)

**Gestion d'un utilisateur : suspension, réactivation, suppression**

![image](https://hackmd.io/_uploads/rJpKZ3_0-e.png)
![image](https://hackmd.io/_uploads/HJTpW2uA-x.png)
![image](https://hackmd.io/_uploads/HkVxz3uRWx.png)
![image](https://hackmd.io/_uploads/ryBXfhdAZl.png)
![image](https://hackmd.io/_uploads/BJkKf3u0bl.png)
![image](https://hackmd.io/_uploads/HJZcG2dRZl.png)
![image](https://hackmd.io/_uploads/ByYoG2d0We.png)
![image](https://hackmd.io/_uploads/rk92M2dCZl.png)
![image](https://hackmd.io/_uploads/r1J0fhdRbe.png)

---

### Tâche 5 — Améliorations du dashboard : page utilisateur (06/05/2026)

#### Bloc Informations Temps Réel

Ajout d'un bloc informatif affiché à côté du dashboard principal :

- **Date actuelle**
- **Heure en temps réel** (heures / minutes / secondes, mise à jour chaque seconde)
- **Localisation utilisateur** (langue du système, fuseau horaire)

![image](https://hackmd.io/_uploads/HkFl_3uR-e.png)

#### Gestion des Notifications

- Icône de notification dynamique avec badge si nouvelles notifications
- Renvoie vers la page Logs & Audits

![image](https://hackmd.io/_uploads/SJlQ_hO0bg.png)
![image](https://hackmd.io/_uploads/B1YHdn_CZx.png)

#### Détails Utilisateur

Ajout d'une action **"Voir"** dans le tableau :

- Ouverture d'une **modale**
- Affichage des informations détaillées : nom, email, rôle(s), statut, métadonnées

![image](https://hackmd.io/_uploads/HyvwO3OR-g.png)
![image](https://hackmd.io/_uploads/S1qR_3_AZg.png)

#### Pagination du Tableau

- **5 lignes par page**
- Navigation entre les pages

![image](https://hackmd.io/_uploads/H1txYnO0-l.png)

---

### Tâche 6 — Configuration de la page Logs & Audits (06/05/2026)

#### KPIs

Cartes KPI en haut de page :

- Nombre total de logs
- Activités récentes
- Actions critiques (suppression, modification)

![image](https://hackmd.io/_uploads/HJ9mSaO0-g.png)

#### Tableau des Logs

- Actions disponibles par ligne (voir, supprimer, détail)
- Données enrichies (utilisateur, action, ressource, date)

![image](https://hackmd.io/_uploads/SyGLB6dRZl.png)

#### Pagination

- **10 lignes par page**
- Navigation fluide

![image](https://hackmd.io/_uploads/ByIwH6dAZl.png)

#### Sélection multiple & suppression en masse

- Case à cocher par ligne
- "Tout sélectionner / Tout désélectionner"
- Suppression en masse

![image](https://hackmd.io/_uploads/HkzKS6dAWx.png)

#### Export des Logs

Bouton **"Télécharger"** avec sélection du format :

- **CSV**
- **PDF** (header, métadonnées, tableau structuré, mise en forme rapport)

```bash
npm install jspdf jspdf-autotable
```

![image](https://hackmd.io/_uploads/SkK5Hp_Rbg.png)
![image](https://hackmd.io/_uploads/SJKsHTdRbe.png)
![image](https://hackmd.io/_uploads/Hycara_0Wl.png)
![image](https://hackmd.io/_uploads/Sy-GI6_0Wl.png)
![image](https://hackmd.io/_uploads/r17FIaOCWe.png)

---

## UML et documentation de conception

Le dossier `UML/` contient des diagrammes PlantUML :

- Diagrammes de contexte / cas d'utilisation
- Diagrammes d'activité
- Diagrammes de séquence
- Scénarios scripts (connexion, consultation, téléchargement, contact support…)

Ces documents servent de référence de conception et de support.

---

## Tâche 7 — Refonte de la page profil (07/05/2026)

## Objectif

Refonte totale de `src/pages/ProfilePage.tsx` afin de remplacer l'ancienne interface statique par une page de profil **professionnelle, dynamique et entièrement connectée à Supabase**.

Les objectifs principaux sont :

- Afficher et éditer les informations personnelles d'un utilisateur en temps réel
- Synchroniser toutes les données avec la table `profiles` de Supabase
- Permettre l'upload et la prévisualisation d'un avatar via Supabase Storage
- Garantir qu'un utilisateur ne peut modifier **que son propre profil** (Row Level Security)
- Offrir une expérience utilisateur fluide avec validation, retours visuels et gestion d'erreurs

---

## Schéma de la base de données

La table `profiles` a été étendue avec de nouveaux champs. Voici la définition SQL complète après migration :

```sql
create table public.profiles (
  id               uuid                     not null,
  name             text                     not null default ''::text,
  email            text                     not null,
  is_active        boolean                  not null default true,
  is_suspended     boolean                  not null default false,
  must_change_password boolean              not null default false,
  last_login       timestamp with time zone          null,
  created_at       timestamp with time zone not null default now(),
  updated_at       timestamp with time zone not null default now(),

  -- Nouveaux champs ajoutés lors de cette refonte
  first_name       text                              null,
  profession       text                              null,
  bio              text                              null,
  phone            text                              null,
  avatar_url       text                              null,
  address          text                              null,
  city             text                              null,
  country          text                              null,
  status           text                     not null default 'active'::text,

  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign key (id)
    references auth.users (id) on delete cascade
) tablespace pg_default;

-- Trigger de mise à jour automatique du champ updated_at
create trigger profiles_set_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();
```

---

## Nouveaux champs

| Champ        | Type   | Nullable | Description                                              |
|--------------|--------|----------|----------------------------------------------------------|
| `first_name` | `text` | Oui      | Prénom de l'utilisateur                                  |
| `profession` | `text` | Oui      | Intitulé du poste / métier                               |
| `bio`        | `text` | Oui      | Courte biographie (limitée en longueur côté client)      |
| `phone`      | `text` | Oui      | Numéro de téléphone (validé côté client)                 |
| `avatar_url` | `text` | Oui      | URL publique de l'image uploadée dans Supabase Storage   |
| `address`    | `text` | Oui      | Adresse postale                                          |
| `city`       | `text` | Oui      | Ville                                                    |
| `country`    | `text` | Oui      | Pays                                                     |
| `status`     | `text` | Non      | Statut de présence : `active`, `away`, `busy`, `offline` |


![image](https://hackmd.io/_uploads/HJ2xARKCbg.png)
![image](https://hackmd.io/_uploads/SykXARKRZx.png)
![image](https://hackmd.io/_uploads/rkuYCCtAWg.png)

## Fonctionnalités implémentées

### Chargement & sauvegarde

- Récupération du profil au montant du composant via `supabase.from('profiles').select()`
- Sauvegarde directe dans Supabase via `.update()` sur le profil de l'utilisateur connecté
- Mise à jour optimiste de l'interface avant confirmation serveur

### Validation côté utilisateur

| Champ    | Règle de validation                          |
|----------|----------------------------------------------|
| `name`   | Obligatoire, non vide                        |
| `phone`  | Format numérique, optionnel                  |
| `bio`    | Longueur maximale contrôlée (ex : 500 chars) |

### Retours utilisateur

- **Toasts** de succès et d'erreur pour chaque action (sauvegarde, upload, erreur réseau)
- Indicateurs visuels distincts pour les états `loading`, `saving` et `uploading`
- Prévisualisation instantanée des modifications avant sauvegarde

### statuts



| Valeur     | Affichage   | Couleur   |
|------------|-------------|-----------|
| `active`   | Actif    | Vert      |
| `away`     | Absent   | Jaune     |
| `busy`     | Occupé   | Rouge     |
| `offline`  | Hors ligne | Gris    |

---

## Architecture & UI

### Sections de la page

**Carte identité (panneau gauche)**
- Photo de profil avec bouton d'upload intégré
- Nom complet + prénom
- Profession
- Badge de statut interactif
- Badges de rôles

**Formulaire principal (panneau droit)**
- Section *Informations personnelles* : prénom, nom, profession, téléphone
- Section *Coordonnées* : adresse, ville, pays
- Section *Biographie* : textarea avec compteur de caractères
- Boutons Annuler / Sauvegarder

---

## Upload d'avatar

L'upload est géré via **Supabase Storage** :

- **Bucket** : `avatars` (accès public activé)
- **Chemin de stockage** : `{user.id}/{nom_du_fichier}`
- **Formats acceptés** : `image/png`, `image/jpeg`, `image/webp`
- **Flux** :
  1. L'utilisateur sélectionne une image via l'input file
  2. L'image est uploadée dans le bucket `avatars` sous le dossier `{user.id}/`
  3. L'URL publique générée est sauvegardée dans `profiles.avatar_url`
  4. La prévisualisation est mise à jour instantanément dans l'interface

```typescript
// Exemple d'upload
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${user.id}/${file.name}`, file, { upsert: true });

const { publicUrl } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${user.id}/${file.name}`).data;

await supabase.from('profiles').update({ avatar_url: publicUrl });
```

---

## Gestion des états

Le composant gère trois états de chargement distincts :

| État        | Description                                      | UI associée                  |
|-------------|--------------------------------------------------|------------------------------|
| `loading`   | Chargement initial du profil depuis Supabase     | Skeleton / spinner global    |
| `saving`    | Sauvegarde du formulaire en cours                | Bouton désactivé + spinner   |
| `uploading` | Upload de l'avatar en cours                      | Overlay sur l'avatar         |

---

## Sécurité & RLS

La page respecte la politique **Row Level Security (RLS)** de Supabase :

- Chaque utilisateur authentifié ne peut **lire et modifier que son propre profil**
- Les requêtes `.update()` sont filtrées automatiquement par `auth.uid() = id`
- Aucune donnée sensible (mot de passe, tokens) n'est exposée côté client

```sql
-- Exemple de politique RLS attendue sur la table profiles
create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);
```

---

## Tâche à venir (correction)
### Alertes de sécurité 

Les avertissements suivants ont été identifiés dans le dashboard Supabase et **doivent être traités en priorité** avant la mise en production.

> **Priorité haute** — Ces vulnérabilités peuvent permettre des escalades de privilèges ou des fuites de données.

---

### 1. Les utilisateurs authentifiés peuvent insérer des entrées arbitraires dans le journal d'audit

**Risque** : Un utilisateur connecté peut écrire dans la table d'audit, corrompant ainsi les logs de traçabilité.  
**Correctif** : Restreindre les politiques INSERT sur la table d'audit aux seuls rôles système (`service_role`). Supprimer toute politique RLS qui accorde un accès en écriture aux utilisateurs authentifiés sur cette table.

---

### 2. Tout utilisateur authentifié peut s'octroyer des rôles d'administrateur

**Risque** : Élévation de privilèges  un utilisateur standard peut se promouvoir administrateur.  
**Correctif** : Retirer les politiques RLS permettant aux utilisateurs de modifier leur propre colonne de rôle. Les changements de rôles doivent être effectués exclusivement via des fonctions `SECURITY DEFINER` appelées depuis le backend ou via le dashboard Supabase.

---

### 3. Le public peut exécuter une fonction `SECURITY DEFINER`

**Risque** : Des fonctions exécutées avec des privilèges élevés sont accessibles sans authentification.  
**Correctif** : Révoquer l'accès `EXECUTE` au rôle `anon` sur les fonctions concernées. Restreindre à `authenticated` ou `service_role` selon le besoin.

```sql
revoke execute on function nom_de_la_fonction from anon;
```

---

### 4. Protection par mot de passe désactivée suite à une fuite

**Risque** : Des mots de passe compromis peuvent toujours être utilisés pour se connecter.  
**Correctif** : Activer la vérification de mots de passe compromis dans les paramètres d'authentification Supabase (*Auth → Settings → Password Protection*). Forcer la réinitialisation des mots de passe concernés.

---

### 5. Les utilisateurs connectés peuvent exécuter une fonction `SECURITY DEFINER`

**Risque** : Des fonctions privilégiées sont exposées à tous les utilisateurs authentifiés, même non-admins.  
**Correctif** : Auditer toutes les fonctions `SECURITY DEFINER` et restreindre leur accès au minimum nécessaire. Utiliser des vérifications internes (`auth.uid()`, `auth.role()`) pour limiter les actions autorisées.

---

### 6. Le bucket public `avatars` ne supprime pas les liens des fichiers images

**Risque** : Même après suppression d'un fichier du bucket, son URL publique reste accessible (le CDN Supabase met en cache les fichiers publics).  
**Correctif** :
- Passer le bucket `avatars` en **mode privé** et générer des **signed URLs** à durée limitée pour afficher les avatars
- Ou implémenter une stratégie de nommage unique (ex : UUID) pour chaque upload afin que les anciennes URLs deviennent caduques naturellement

```typescript
// Alternative : génération d'une signed URL (bucket privé)
const { data } = await supabase.storage
  .from('avatars')
  .createSignedUrl(`${user.id}/${fileName}`, 3600); // expire dans 1h
```

---

## Fichiers concernés

| Fichier | Modification |
|--------|-------------|
| `src/pages/ProfilePage.tsx` | Refonte complète |
| `supabase/migrations/XXXXXX_add_profile_fields.sql` | Ajout des nouveaux champs |
| `supabase/storage/avatars` | Création du bucket |

---

## Tâche 8 — Création & configuration de la page catégorie (07/05/2026)

## Objectif

Dans cette partie, nous allons créer et configurer la page catégorie.

---

## Base de données : création de la table

### Table `public.categories`

```sql
create type category_status as enum ('active', 'inactive', 'archived');

create table public.categories (
  id          uuid                     not null default gen_random_uuid(),
  name        text                     not null,
  description text                              null,
  color       text                     not null default '#6366f1',
  icon        text                     not null default 'Folder',
  status      category_status          not null default 'active',
  is_visible  boolean                  not null default true,
  type        text                              null,
  position    integer                  not null default 0,
  created_by  uuid                              null references auth.users(id),
  created_at  timestamp with time zone not null default now(),
  updated_at  timestamp with time zone not null default now(),

  constraint categories_pkey primary key (id)
) tablespace pg_default;

-- Trigger de mise à jour automatique du champ updated_at
create trigger categories_set_updated_at
  before update on categories
  for each row
  execute function update_updated_at_column();
```
![image](https://hackmd.io/_uploads/ryebsxq0We.png)

### Détail des colonnes

| Colonne | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | Non | Identifiant unique auto-généré |
| `name` | `text` | Non | Nom affiché de la catégorie |
| `description` | `text` | Oui | Description courte |
| `color` | `text` | Non | Couleur hex (ex : `#3b82f6`) |
| `icon` | `text` | Non | Nom de l'icône Lucide |
| `status` | `category_status` | Non | `active`, `inactive` ou `archived` |
| `is_visible` | `boolean` | Non | Visibilité dans les listes publiques |
| `type` | `text` | Oui | Famille (cloud, security, devops…) |
| `position` | `integer` | Non | Ordre d'affichage |
| `created_by` | `uuid` | Oui | Référence à l'utilisateur créateur |

---

## Sécurité & RLS

Les politiques Row Level Security garantissent un accès différencié selon le rôle de l'utilisateur.

| Action            | Tous auth. | Editor | Admin / Global |
|------------------|------------|--------|-----------------|
| SELECT (lecture) | oui        | oui    | oui             |
| INSERT           | non        | oui    | oui             |
| UPDATE           | non        | oui    | oui             |
| DELETE           | non        | non    | oui             

**Code SQL**

```sql
-- Lecture : tout utilisateur authentifié
create policy "categories_select"
  on categories for select
  using (auth.role() = 'authenticated');

-- Écriture : editor, admin, global_admin
create policy "categories_insert"
  on categories for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('editor', 'admin', 'global_admin')
    )
  );

-- Suppression : admin et global_admin uniquement
create policy "categories_delete"
  on categories for delete
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin', 'global_admin')
    )
  );
```

---

## Interface utilisateur

### Composant principal

**Fichier** : `src/pages/CategoriesPage.tsx`

La page est organisée en plusieurs zones distinctes :

| Section                                                      |
|--------------------------------------------------------------|
| En-tête : Titre + boutons Import / Export / Modèle / +      |
| 6 Cartes statistiques                                        |
| Barre : Recherche | Filtre statut | Bascule vue             |
| Actions de sélection en masse (si éléments sélectionnés)     |
| Vue Grille OU Vue Tableau paginée                           |

![image](https://hackmd.io/_uploads/B19ZqgqA-x.png)

### États gérés

| État | Description | UI |
|---|---|---|
| `loading` | Chargement initial depuis Supabase | Skeletons animés |
| `empty` | Aucune catégorie trouvée | Illustration + message d'action |
| `saving` | Sauvegarde en cours | Bouton désactivé + spinner |
| `importing` | Import JSON en cours | Barre de progression 0→100% |
| `exporting` | Génération PDF/CSV | Barre de progression |

---

## Statistiques & Dashboard

Six cartes statistiques en haut de page offrent une vue instantanée du catalogue :

| Carte | Métrique | Couleur |
|---|---|---|
| **Total** | Nombre total de catégories | Neutre |
| **Actives** | `status = 'active'` | Vert |
| **Inactives** | `status = 'inactive'` | Jaune |
| **Archivées** | `status = 'archived'` | Gris |
| **Visibles** | `is_visible = true` | Bleu |
| **Masquées** | `is_visible = false` | Violet |


---

## Gestion des vues

### Recherche & Filtrage

- **Recherche instantanée** : filtrage en temps réel sur le `name` et la `description`
- **Filtre par statut** : menu déroulant `Tous | Actives | Inactives | Archivées`
- Les deux filtres sont combinables et réactifs sans rechargement
![image](https://hackmd.io/_uploads/ryVr9lqCZe.png)

### Vue Grille

Cartes colorées premium affichant pour chaque catégorie :
- Icône Lucide dans un rond de couleur
- Nom et description
- Badge de statut (`active` / `inactive` / `archived`)
- Badge de visibilité
- Menu d'actions (⋯) en overlay au hover

![image](https://hackmd.io/_uploads/S1TLcx9Cbx.png)

### Vue Tableau

Tableau dense avec une ligne par catégorie, incluant toutes les colonnes clés et un menu d'actions en ligne. Adapté aux administrateurs gérant de grands volumes.
![image](https://hackmd.io/_uploads/rk7O5lcCbe.png)

---

## Modal Création / Édition

Le formulaire est organisé en **2 sections distinctes** :

### Section 1 — Informations générales

| Champ | Type | Règle |
|---|---|---|
| `name` | Texte | Obligatoire |
| `description` | Textarea | Optionnel |
| `type` | Texte | Optionnel (cloud, devops…) |
| `status` | Select enum | `active` par défaut |
| `is_visible` | Toggle | `true` par défaut |

### Section 2 — Personnalisation visuelle

- **Color picker** : palette de couleurs prédéfinies + sélecteur natif HTML pour valeur personnalisée
- **Sélecteur d'icônes** : grille d'icônes Lucide filtrables par nom, prévisualisation en temps réel

La prévisualisation de la carte finale est mise à jour **instantanément** à chaque modification de couleur ou d'icône.

![image](https://hackmd.io/_uploads/B16c5g5A-e.png)

---

## Actions disponibles

Chaque catégorie expose les actions suivantes (menu contextuel en grille, boutons en tableau) :

| Action | Description | Confirmation requise |
|---|---|---|
| **Éditer** | Ouvre la modal pré-remplie | Non |
| **Activer** | Passe le statut à `active` | Non |
| **Désactiver** | Passe le statut à `inactive` | Non |
| **Afficher / Masquer** | Bascule `is_visible` | Non |
| **Dupliquer** | Crée une copie avec `(copie)` dans le nom | Non |
| **Archiver** | Passe le statut à `archived` | Non |
| **Supprimer** | Suppression définitive en base | Oui |

Chaque action déclenche un **toast** de succès ou d'erreur.
![image](https://hackmd.io/_uploads/Hy3uogc0Ze.png)

---

## Sélection en masse

Une barre d'actions collectives apparaît dès qu'au moins une catégorie est sélectionnée.

| Contrôle | Comportement |
|---|---|
| Case à cocher par ligne | Sélection individuelle |
| **Tout sélectionner** | Coche toutes les catégories de la page courante |
| **Désélectionner** | Décoche tous les éléments |
| **Archiver** | Archive en masse les éléments sélectionnés |
| **Supprimer** | Suppression en masse avec modal de confirmation |

![image](https://hackmd.io/_uploads/By76ogcRZe.png)


---

## Pagination

Le tableau est paginé par **10 éléments par page**.

```
  Affichage 1–10 sur 47 catégories
  [← Précédent]   Page 1 / 5   [Suivant →]
```

| Élément | Détail |
|---|---|
| Taille de page | 10 éléments |
| Navigation | Boutons Précédent / Suivant |
| Indicateur | `Page X / Y` |
| Compteur | `Affichage N–M sur Total` |

La pagination est réinitialisée à la page 1 lors de toute modification de recherche ou de filtre.

![image](https://hackmd.io/_uploads/Bkvk2xcRbe.png)

---

## Import JSON

Bouton **Importer JSON** en haut de page ouvrant une modal dédiée.

### Flux d'import

```
1. Ouverture de la modal d'import
        ↓
2. Dépôt du fichier (drag & drop) ou sélection via explorateur
        ↓
3. Validation JSON (structure, champs requis, types)
        ↓
4. Barre de progression 0% → 100% + statut en temps réel
        ↓
5. Insertion en base des catégories valides
        ↓
6. Modal de résumé final
```

### Gestion des cas particuliers

| Cas | Comportement |
|---|---|
| JSON invalide | Erreur affichée, import bloqué |
| Champ manquant | Ligne signalée avec message précis |
| Doublon détecté | Ligne ignorée, comptabilisée dans "ignorées" |
| Erreur Supabase | Ligne comptabilisée dans "erreurs" |


## Modèle JSON

Bouton **Modèle JSON** en haut de page pour faciliter la préparation d'imports.

### Flux

```
1. Clic sur Modèle JSON
        ↓
2. Modal de confirmation
        ↓
3. Barre de progression du téléchargement
        ↓
4. Modal de confirmation de fin (fichier téléchargé)
```

Le fichier téléchargé contient **2 à 3 exemples** de catégories avec tous les champs attendus et leurs valeurs types, prêt à être complété et réimporté.

![image](https://hackmd.io/_uploads/B14u3l90We.png)
![image](https://hackmd.io/_uploads/HJQKnx5Cbg.png)
![image](https://hackmd.io/_uploads/S1r53g5AWg.png)
le fichier du modèle Json.
![image](https://hackmd.io/_uploads/rJPa3g9RZe.png)

### Importer un modèle Json 

On peut importer un modèle Json afin d'automatiser la création des catégories.
![image](https://hackmd.io/_uploads/rJNSaxcRbg.png)
![image](https://hackmd.io/_uploads/BkHLTecRZl.png)
![image](https://hackmd.io/_uploads/ry4w6gqRWx.png)
![image](https://hackmd.io/_uploads/ByRvpx9C-g.png)
![image](https://hackmd.io/_uploads/BkOdpeqCbg.png)
![image](https://hackmd.io/_uploads/SkTKpxqRbx.png)
![image](https://hackmd.io/_uploads/HyZs6xcRWl.png)
![image](https://hackmd.io/_uploads/B1N36xqA-g.png)


---

## Export

Bouton **Télécharger** en haut de page proposant deux formats (PDF - CSV).

### Flux d'export

```
1. Clic sur Télécharger
        ↓
2. Modal de confirmation (format PDF ou CSV)
        ↓
3. Barre de progression pendant la génération
        ↓
4. Téléchargement automatique du fichier
```
![image](https://hackmd.io/_uploads/SkaZClqAbg.png)
![image](https://hackmd.io/_uploads/Bylm0lq0Ze.png)
![image](https://hackmd.io/_uploads/H19E0gqRbe.png)

### Export PDF

- Mise en page professionnelle avec entête et pied de page
- Tableau de toutes les catégories avec colonnes : Nom, Type, Statut, Visible, Couleur
- Pagination automatique des pages
- Date d'export incluse dans le pied de page
![image](https://hackmd.io/_uploads/Sk_DCx90-l.png)

### Export CSV

- Fichier plat compatible Excel / Google Sheets
- Encodage UTF-8 avec BOM pour les caractères spéciaux
- En-têtes de colonnes en première ligne
![image](https://hackmd.io/_uploads/BkY6CeqC-x.png)

---


## Migration Supabase

Une nouvelle migration de la base de donnée a été lancée.
![image](https://hackmd.io/_uploads/SJu7yb90Wx.png)


```
migrations/
└── XXXXXX_categories_and_profiles_update.sql
```

### Contenu de la migration

| Bloc | Description |
|---|---|
| **Colonnes `profiles`** | Ajout de `first_name`, `profession`, `bio`, `phone`, `avatar_url`, `address`, `city`, `country`, `status` |
| **Bucket `avatars`** | Création du bucket Supabase Storage avec lecture publique et écriture réservée au propriétaire |
| **Enum `category_status`** | Création du type `active \| inactive \| archived` |
| **Table `categories`** | Création avec toutes les colonnes et contraintes |
| **Policies RLS** | SELECT / INSERT / UPDATE / DELETE selon les rôles |
| **Trigger `updated_at`** | Application sur `profiles` et `categories` |

---

## Fichiers concernés

| Fichier | Modification |
|---|---|
| `src/pages/CategoriesPage.tsx` | Création complète du module |
| `src/components/CategoryModal.tsx` | Modal création / édition |
| `src/components/CategoryCard.tsx` | Carte vue grille |
| `supabase/migrations/XXXXXX_categories.sql` | Migration complète |
| `supabase/storage/avatars` | Bucket avatars (partagé avec ProfilePage) |

---

