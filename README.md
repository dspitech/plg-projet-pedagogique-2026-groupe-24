# PLG Projet Pedagogique 2026 - Groupe 24

## Groupe : 24

### Membres
- Amir Minihadji AMINA  
- LO Pape  
- Neylie NDJUMKENG-NGUEMO  

### Superviseur
- Mhand BOUFALA
---

Application web frontend de type dashboard pour centraliser, documenter et consulter des scripts cloud (Azure et AWS), avec pages metier, fiches detaillees et composants UI reutilisables.

## Sommaire

- [Objectif du projet](#objectif-du-projet)
- [Perimetre fonctionnel](#perimetre-fonctionnel)
- [Architecture du depot](#architecture-du-depot)
- [Stack technique](#stack-technique)
- [Installation et lancement](#installation-et-lancement)
- [Scripts disponibles](#scripts-disponibles)
- [Architecture applicative](#architecture-applicative)
- [Routing](#routing)
- [Gestion des donnees et de letat](#gestion-des-donnees-et-de-letat)
- [Tests](#tests)
- [Qualite et conventions](#qualite-et-conventions)
- [UML et documentation de conception](#uml-et-documentation-de-conception)
- [Etat actuel et limites connues](#etat-actuel-et-limites-connues)

## Objectif du projet

Le projet vise a fournir un point d'entree unique pour:

- organiser des scripts techniques par categories et providers cloud;
- standardiser la consultation de la documentation d'execution;
- simplifier la navigation entre usages courants (favoris, telechargements, historique, partages);
- preparer une evolution vers des donnees dynamiques et des workflows metier.

## Périmètre fonctionnel

Fonctionnalites visibles cote frontend:

- dashboard principal;
- navigation par categories et par provider;
- liste de scripts et pages de detail;
- pages utilisateur (profil, reglages, login);
- pages utilitaires (contact, ressources, favoris, telechargements, historique, partages).

## Architecture du depot

```text
.
|-- README.md
|-- Site-Web/                      # Application frontend (Vite + React + TS)
|   |-- package.json
|   |-- vite.config.ts
|   |-- vitest.config.ts
|   |-- eslint.config.js
|   |-- tailwind.config.ts
|   |-- src/
|   |   |-- App.tsx
|   |   |-- main.tsx
|   |   |-- pages/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- data/
|   |   `-- test/
|   `-- public/
`-- UML/                           # Diagrammes de conception (PlantUML)
```

## Stack technique

### Frontend

- React 18
- TypeScript 5
- Vite 8 + `@vitejs/plugin-react-swc`
- React Router DOM 6
- TanStack Query

### UI / UX

- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide React
- Recharts

### Formulaires et validation

- React Hook Form
- Zod
- `@hookform/resolvers`

### Qualite et tests

- ESLint 9 (config flat)
- Vitest
- Testing Library (`react`, `jest-dom`)
- environnement `jsdom`

## Installation et lancement

### Prerequis

- Node.js 18+ (Node 20 LTS recommande)
- npm

> Le frontend est dans `Site-Web/`. Les commandes doivent etre executees dans ce dossier.

## Tâche 1 -  01/04/2026 — Mise en place du Front End
### Installation

```bash
git clone https://github.com/dspitech/plg-projet-pedagogique-2026-groupe-24.git
cd plg-projet-pedagogique-2026-groupe-24/Site-Web
npm install
```

### Demarrage en local

```bash
npm run dev
```

Par defaut, Vite est configure sur le port `8080` (voir `Site-Web/vite.config.ts`).

## Scripts disponibles

Depuis `Site-Web/`:

- `npm run dev` : lance le serveur de developpement
- `npm run build` : build de production
- `npm run build:dev` : build en mode developpement
- `npm run preview` : previsualisation du build
- `npm run lint` : verification ESLint
- `npm run test` : execution des tests Vitest
- `npm run test:watch` : tests en mode watch

## Architecture applicative

### Entree et providers

- `src/main.tsx` monte l'application React.
- `src/App.tsx` configure les providers principaux:
  - `QueryClientProvider`
  - `TooltipProvider`
  - systeme de notifications (`toaster`/`sonner`)
  - `BrowserRouter`

### Organisation principale de `src/`

- `pages/` : pages routees de l'application
- `components/layout/` : structure globale (`DashboardLayout`, `Header`, `Sidebar`)
- `components/dashboard/` : cartes metier dashboard
- `components/scripts/` : detail de script
- `components/ui/` : composants UI generiques (shadcn/radix)
- `hooks/` : hooks custom (mobile, toasts, donnees utilisateur)
- `data/` : modeles/types et donnees de scripts
- `test/` : setup et tests unitaires

## Routing

Routes declarees dans `Site-Web/src/App.tsx`:

- `/`
- `/dashboard` (redirige vers `/`)
- `/scripts`
- `/script/:scriptId`
- `/categories`
- `/category/:categoryId`
- `/provider/:providerId`
- `/resources`
- `/favorites`
- `/shares`
- `/downloads`
- `/history`
- `/profile`
- `/contact`
- `/login`
- `/settings`
- `*` (page `NotFound`)

## Gestion des donnees et de l'etat

- Les donnees de scripts sont definies dans `Site-Web/src/data/scripts.ts`.
- Le hook `Site-Web/src/hooks/useUserData.ts` gere l'etat utilisateur local (profil, favoris, telechargements, partages, historique) via `localStorage`.
- Une couche TanStack Query est presente, mais l'application est actuellement orientee frontend local (pas de backend/API branche dans ce depot).

## Tests

- Configuration dans `Site-Web/vitest.config.ts`.
- Setup global dans `Site-Web/src/test/setup.ts` (dont mock `matchMedia`).
- Test d'exemple present dans `Site-Web/src/test/example.test.ts`.

Commande:

```bash
cd Site-Web
npm run test
```

## Qualite et conventions

- Linting: `Site-Web/eslint.config.js`
- Styling: `Site-Web/tailwind.config.ts` + `postcss.config.js`
- Alias TypeScript: `@/*` vers `src/*` (voir `tsconfig.app.json`)
- Bonnes pratiques recommandees:
  - lancer `npm run lint` avant commit;
  - ajouter des tests pour toute logique metier critique;
  - faire des commits atomiques avec messages explicites.

## UML et documentation de conception

Le dossier `UML/` contient des diagrammes PlantUML:

- diagrammes de contexte / cas d'utilisation;
- diagrammes d'activite;
- diagrammes de sequence;
- scenario scripts (connexion, consultation, telechargement, contact support, etc.).

Ces documents servent de reference de conception et de support pedagogique.

## Etat actuel et limites connues

- Seulement le frontend est mise en place.
- Les prochaines étapes est de mettre en place le Back-end 

# PHASE 5 — DÉVELOPPEMENT MVP 

Plateforme web centralisée pour la gestion, la documentation et l'exploitation de scripts cloud (Azure & AWS) à destination des équipes administrateurs.

![image](https://hackmd.io/_uploads/r1Cz5s4aWe.png)

---

##  Tâche 1 - 21/04/2026 : Refonte Pages (Dashboard / Catégories / Ressources)

Cette itération concerne **la refonte complète du style visuel** des trois pages clés de la plateforme afin d'atteindre un niveau **ultra professionnel**, dans la lignée des standards GitHub, Linear et Vercel.

### Pages refondues

#### 1. `/` — Dashboard (`src/pages/Index.tsx`)
- **Hero header** avec badge de statut animé (Opérationnel), version build et CTA primaires.
- **4 KPI cards** denses et tabulaires : Scripts disponibles, Azure, AWS, Validés — avec icônes colorées par tonalité et indicateur d'évolution.
- **Charts row** : barchart "Scripts par catégorie" + donut "Par provider" (Recharts) avec tooltips themés sur les tokens du design system.
- **Activity feed** chronologique (dernières actions) + **grille d'accès rapides** vers les sections principales.
- **System status** footer (API / Catalogue / Recherche / CDN) avec indicateurs animés.

![image](https://hackmd.io/_uploads/B1Qlcs4aWe.png)
![image](https://hackmd.io/_uploads/H1LWciVTWx.png)

#### 2. `/categories` — Catégories (`src/pages/CategoriesPage.tsx`)
- Header avec **breadcrumb**, description et **mini-stats** (nombre de catégories / scripts).
- Cards catégorie repensées : icône colorée par accent (blue/emerald/orange/rose), **slug en monospace**, compteur de scripts, **% du catalogue** et **barre de progression** dynamique.
- Bandeau d'astuce de recherche + footer "Demander une nouvelle catégorie".

![image](https://hackmd.io/_uploads/HkHV9sNpZl.png)

#### 3. `/resources` — Ressources (`src/pages/ResourcesPage.tsx`)
- Header avec icône `Library`, breadcrumb et stats (ressources totales / catégories).
- **Barre de recherche** live + **filtres par catégorie** sous forme de chips.
- Cards de ressources avec : icône thématisée par catégorie, **badge de type** (Doc / CLI / Repo / Vidéo / Guide), nom du domaine en monospace, et lien externe.
- Sections regroupées dynamiquement avec compteur, état vide explicite quand aucun résultat.

![image](https://hackmd.io/_uploads/HJRHqsN6Wg.png)

### Améliorations transverses
- 100 % **design tokens HSL** (`bg-card`, `border-border/60`, `text-primary`…) — aucun hex codé en dur dans les composants.
- Hover states unifiés (border primary + ombre primary/5 + transitions).
- Typographie tabulaire (`tabular-nums`) pour tous les chiffres.
- Spacing dense type GitHub (gap-3/4, padding compact).
- Composants accessibles : focus rings, contrastes respectés en thème sombre.

---

##  Structure du projet actuel

```
src/
├── components/
│   ├── dashboard/      # ScriptCard, CategoryCard, StatCard
│   ├── layout/         # DashboardLayout, Sidebar, Header
│   ├── scripts/        # ScriptDetail (vue détail GitHub-like)
│   └── ui/             # shadcn primitives
├── data/scripts.ts     # Modèle Script + helpers (catalogue)
├── hooks/useUserData.ts # Favoris / téléchargements / partages / historique
├── pages/
│   ├── Index.tsx              ← refondue
│   ├── CategoriesPage.tsx     ← refondue
│   ├── ResourcesPage.tsx      ← refondue
│   ├── CategoryPage.tsx
│   ├── ScriptsPage.tsx
│   ├── ScriptDetailPage.tsx
│   ├── ProviderPage.tsx       # Azure / AWS
│   ├── FavoritesPage.tsx
│   ├── DownloadsPage.tsx
│   ├── SharesPage.tsx
│   ├── HistoryPage.tsx
│   ├── ProfilePage.tsx
│   ├── ContactPage.tsx
│   └── LoginPage.tsx
└── index.css           # Design system (HSL tokens, glass-card, script-card…)
```

---

## Tâche 2 -  22/04/2026 — Formulaires de création (Catégories & Scripts)

Cette tâche introduit deux **formulaires professionnels** permettant aux utilisateurs de créer de nouvelles catégories et de nouveaux scripts directement depuis l'interface.

### 1. `/categories/new` — Nouvelle catégorie (`src/pages/NewCategoryPage.tsx`)

Formulaire en 2 colonnes (formulaire + **aperçu en direct sticky**).

**Champs :**
- **Nom** (obligatoire, 2-60 car., compteur live)
- **Description** (optionnelle, 280 car. max, compteur)
- **Couleur** : color picker natif + champ HEX synchronisé + 8 presets cliquables
- **Icône** : grille de 12 icônes Lucide sélectionnables
- **Statut** : `Actif` / `Inactif` avec pastille colorée

![image](https://hackmd.io/_uploads/Skxcqj46-x.png)
![image](https://hackmd.io/_uploads/SJ5jqj4pWx.png)

### 2. `/scripts/new` — Nouveau script (`src/pages/NewScriptPage.tsx`)

Dans cette partie, on crée un fomrulaire pour l'ajout d'un nouveau script.
**Identité :**
- **Nom** (obligatoire, 3-100 car.)
- **Description** : textarea avec **mini-toolbar WYSIWYG** (Gras / Italique / Liste / Lien — markdown) + compteur 2000 car.
- **Catégorie** : Select dynamique chargé depuis `categories`
- **Type de script** : Select (Bash, PowerShell, Python, Azure CLI, AWS CLI, Bicep, ARM, Terraform, CloudFormation, JS, TS)

**Code source :**
- Éditeur de code stylisé avec **chrome de fenêtre type IDE** (3 dots colorées + nom de fichier dynamique avec extension auto-détectée selon le langage)
- Police monospace, fond foncé, badge du langage sélectionné

**Documentation détaillée :**
- Fonctionnalités, Prérequis, Exemple (mono), Autres informations
- **Upload d'images** : zone **drag & drop** + parcourir, prévisualisation grille avec bouton suppression, validation type/taille (5MB max), `URL.createObjectURL` + `revokeObjectURL` au cleanup

**Sidebar métadonnées (sticky) :**
- **Criticité** : 4 boutons radio colorés (Faible / Moyenne / Élevée / Critique) avec couleurs sémantiques
- **Version** : champ avec regex (`v1.0.0`)
- **Statut** : Select avec pastille
- **Tags** : système de **chips** avec autocomplete (Entrée ou virgule pour ajouter, croix pour retirer, max 15)

**Validation & Accessibilité :**
- Schéma **Zod** complet avec règles métier
- Scroll automatique vers le premier champ en erreur
- Tous les `Label` liés à leur input via `htmlFor`
- `aria-invalid`, `aria-pressed`, `aria-label` sur les contrôles non-textuels
- Boutons `Enregistrer` / `Annuler` (sticky en sidebar)
- Persistance en `localStorage` (`custom_scripts`)
![image](https://hackmd.io/_uploads/HyGpciVTZg.png)
![image](https://hackmd.io/_uploads/S1BCcoNTZe.png)
![image](https://hackmd.io/_uploads/rkKyioNpZe.png)
![image](https://hackmd.io/_uploads/SyV-isV6bx.png)
![image](https://hackmd.io/_uploads/SJeMisEp-x.png)

---

##  Lancement du projet
Comment lancer le projet en local
```bash
git clone https://github.com/dspitech/plg-projet-pedagogique-2026-groupe-24.git
cd plg-projet-pedagogique-2026-groupe-24
npm install
npm run dev
```
Ouvrir [http://localhost:5173](http://localhost:5173).

---

# Tâche 3 - 01/05/2026 : Choix Plateforme Supabase 

# 1. Qu’est-ce que Supabase ?

Supabase est une **alternative open-source à Firebase** basée sur **PostgreSQL**.

Il fournit une **backend complète "as-a-service" (BaaS)** avec :
- Base de données
- Authentification
- API automatique
- Temps réel
- Stockage de fichiers
- Edge Functions

---

# 2. Architecture de Supabase

Supabase repose sur plusieurs briques solides :

## PostgreSQL (le cœur)
- Base de données relationnelle puissante
- Support des relations complexes
- JSON natif
- Indexation avancée

## Auth
- Gestion des utilisateurs intégrée
- JWT sécurisé
- OAuth (Google, GitHub, etc.)

## Realtime
- WebSockets
- Synchronisation instantanée des données

## Storage
- Gestion de fichiers (images, documents, etc.)

## Edge Functions
- Backend serverless
- Exécution proche de l’utilisateur

---

# 3. Pourquoi Choisir Supabase ?

##  1. Open Source

Contrairement à Firebase :
- Code transparent
- Auto-hébergeable
- Pas de verrouillage fournisseur (vendor lock-in)

Idéal pour :
- Entreprises
- Projets sensibles
- Souveraineté des données

---

## 2. Basé sur PostgreSQL

Avantages majeurs :

- SQL standard (facile à apprendre)
- Requêtes puissantes (JOIN, agrégations…)
- Transactions fiables
- Extensible (extensions PostgreSQL)

Tu gardes un **contrôle total sur tes données**

---

## 3. API Automatique

Supabase génère automatiquement :

- API REST
- API GraphQL (via extensions)

Gain de temps énorme :
- Pas besoin de créer un backend complet
- Accès direct aux données

---

## 4. Authentification Intégrée

Fonctionnalités :

- Email / mot de passe
- Magic link
- OAuth (Google, GitHub…)
- Gestion des sessions

Sécurité prête à l’emploi

---

## 5. Row Level Security (RLS)

**Gros avantage de Supabase**

Permet de :
- Contrôler l’accès aux données directement en base
- Appliquer des règles fines par utilisateur

Exemple :
```sql
CREATE POLICY "Users can see their own data"
ON users
FOR SELECT
USING (auth.uid() = id);
```
Sécurité côté base, pas seulement côté frontend.

## 6. Temps Réel (Realtime)
- Synchronisation automatique
- WebSockets intégrés

Exemples :
- Chat
- Dashboard live
- Notifications

## 7. Edge Functions
- Backend léger en TypeScript
- Exécution rapide (serverless)

Idéal pour :
- Logique métier
- Webhooks
- Automatisations

## 8. Simplicité de Développement

Supabase est developer-friendly :
- SDK JavaScript simple
- Documentation claire
- CLI puissante

## 4. Supabase vs Firebase

| Critère              | Supabase                | Firebase              |
|----------------------|------------------------|----------------------|
| Base de données      | PostgreSQL (SQL)       | NoSQL (Firestore)    |
| Open Source          | Oui                 | Non               |
| Requêtes complexes   | Très puissantes     | Limitées          |
| Vendor lock-in       | Faible              | Élevé             |
| Auth                 | Oui                 | Oui               |
| Realtime             | Oui                 | Oui               |

## 5. Cas d’Usage Idéaux

Supabase est parfait pour :

### Applications SaaS
- Gestion des utilisateurs  
- Permissions (RBAC)  
- Facturation  

### Plateformes sécurisées
- Dashboards administrateurs  
- Outils internes  

### Outils analytiques
- Logs  
- Reporting  

### Applications temps réel
- Chat  
- Collaboration  

---

## 6. Exemple d’Architecture avec Supabase

### Frontend
- React / Next.js  

### Backend
- Supabase (Database + Auth + API auto-générée)  

### Fonctions
- Edge Functions (logique métier, automatisation)  

### Sécurité
- RLS (Row Level Security)  
- JWT (authentification sécurisée)  

---

## 7. Limites de Supabase

Il faut aussi être lucide :

### Moins mature que Firebase
- Écosystème plus petit  

### Nécessite SQL
- Moins accessible pour les débutants  

### Realtime moins avancé que Firestore
- Mais suffisant dans **90% des cas**  

---

## 8. Pourquoi Supabase est un excellent choix ce projet

### Gestion des administrateurs
- Tables relationnelles (users, roles, permissions)  

### Sécurité avancée
- RLS pour contrôler chaque accès  

### Audit logs
- PostgreSQL idéal pour historiser les actions  

### Scalabilité
- Gère efficacement un grand volume de données  

### API rapide
- Pas besoin de backend lourd  

---

### Supabase correspond parfaitement à :

- Un système **RBAC (roles & permissions)**  
- Un **dashboard sécurisé**  
- Une **plateforme interne**  

---

## Résumé

Supabase est un choix stratégique :

- Sécurité avancée (RLS)  
- Backend rapide à mettre en place  
- Contrôle total des données  
- Scalabilité  
- Flexibilité (SQL + fonctions)  

C’est aujourd’hui **l’une des meilleures solutions pour construire un SaaS moderne**.

---

## 9. Principales commandes Supabase


###  Installation

```bash
npm install -g supabase
```
### Authentification

```bash
supabase login
supabase logout
```

### Initialisation d’un projet

```bash
supabase init
```

Cette commande crée :
- dossier `supabase/`
- configuration locale

### Lier un projet distant
```Bash
supabase link --project-ref <project-ref>
```

### Démarrer Supabase en local

```bash
supabase start
```

Cette commande lance :
- PostgreSQL
- API
- Auth
- Realtime
- Studio

### Arrêter Supabase
```bash
supabase stop
```

### Reset base de données locale

```Bash
supabase db reset
```

Cete commande supprime toutes les données locales.

### Pull schéma depuis le cloud

```bash
supabase db pull
```

### Créer une migration

```Bash
supabase migration new nom_de_la_migration
```

### Appliquer migrations

```Bash
supabase migration up
```

### Voir les migrations

```Bash
supabase migration list
```

### Créer une fonction

```Bash
supabase functions new nom-fonction
```

### Servir en local

```Bash
supabase functions serve
```

### Déployer une fonction

```Bash
supabase functions deploy nom-fonction
```

### Supprimer une fonction

```Bash
supabase functions delete nom-fonction
```

### Gestion des secrets (env)

```Bash
supabase secrets set NOM=valeur
supabase secrets list
```

### Storage (fichiers)
```Bash
supabase storage create nom-bucket
```

### Logs

```Bash
supabase logs
```

### Status du projet

```Bash
supabase status
```

## 10. Création d'une organisation + Projet dan supabase

### 10.1. Organisation

- Créer une nouvelle organisation 
![image](https://hackmd.io/_uploads/ryK9sOdR-x.png)
- Remplissage des infos de l'organisation
![image](https://hackmd.io/_uploads/B1V2o_uAbg.png)
![image](https://hackmd.io/_uploads/BJp3jd_0Wx.png)

### 10.2. Nouveau projet
- Création d'un nouveau projet
![image](https://hackmd.io/_uploads/rJAe3_uRWx.png)
- Remplissage des infos de ce nouveau projet
![image](https://hackmd.io/_uploads/rku_2u_0-l.png)
- Configuration de la sécurité
![image](https://hackmd.io/_uploads/rko32duRbe.png)

### 10.3. Déploiement 
![image](https://hackmd.io/_uploads/rk5lTduA-g.png)
![image](https://hackmd.io/_uploads/BJTa6dOC-e.png)

Dans cette capture on remarque que le projet a été déployé et prêt à recevoir notre base de données.

## 11. Installation de Supabase en local
Dans cette section, nous allons installer l'interface de ligne de commande (CLI) de Supabase sur une machine Linux locale. Cela permet de piloter, tester et synchroniser votre base de données et vos fonctions (Edge Functions) directement depuis votre environnement de développement.

### Prérequis
Avant de commencer, on s'assure que les outils suivants sont installés et configurés :
- `Node.js` (version LTS recommandée) : Pour la gestion des paquets et l'exécution des scripts.
- `Docker` : Indispensable, car Supabase s'exécute localement via des conteneurs (Database, Auth, Storage, etc.).
![image](https://hackmd.io/_uploads/rkGQQY_Abl.png)

### Installer Supabase CLI
- On lance l'installation de supabase.
```Bash
curl -L https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz -o supabase.tar.gz
```
![image](https://hackmd.io/_uploads/HkNzNF_R-l.png)
- Extraire
![image](https://hackmd.io/_uploads/BJaNNtdR-l.png)
- Installer le binaire
```Bash
sudo mv supabase /usr/local/bin/
```
![image](https://hackmd.io/_uploads/r1iu4tOAbx.png)
- Vérifier installation
![image](https://hackmd.io/_uploads/SyUqVK_0Zg.png)
- Se connecter 
![image](https://hackmd.io/_uploads/Hyx5Stu0-x.png)
- Lister les organisations
```Bash
supabase orgs list
```
![image](https://hackmd.io/_uploads/Hk7LItOCWx.png)
Cette commande va t'afficher un tableau avec :
>  Nom de l'organisation
>  ID de l'organisation (Slug)

- Lister les projets
```Bash
supabase projects list
```
Cette commande affiche :
- SERVICE ID (C'est le project-ref)
- NAME (Le nom de ton projet)
- REGION (Où il est hébergé)
- STATUS (Vérifie qu'il est bien ACTIVE)
![image](https://hackmd.io/_uploads/HJr-PYuRbx.png)

- Faire le lien (Link)
```Bash
supabase link --project-ref lmjxkuxruprjgiutdjvw
```
![image](https://hackmd.io/_uploads/HJJTPYOA-g.png)
- Tirer et récupérer les tables ou la structure de ce projet
![image](https://hackmd.io/_uploads/rkfM_KdAZl.png)
![image](https://hackmd.io/_uploads/SyktdYuRbl.png)
- Démarrer supabase
```Bash
supabase start
```
![image](https://hackmd.io/_uploads/SJnxKFuRbg.png)
![image](https://hackmd.io/_uploads/S150KtdAbg.png)

## 12. Types de clés API dans supabase


### 1. Publishable Key (ou "Publishable Secret")

### Définition
C’est la **clé publique** utilisée côté frontend.



### À quoi ça sert ?
- Identifier ton application auprès du service
- Permettre des actions **non sensibles**
- Exemple :
  - créer un token
  - initialiser une session
  - envoyer des données limitées


### Où l’utiliser ?
 **Côté client (frontend)** :
- React
- Next.js
- Vue
- Site web public


### Sécurité
- visible dans le code source
- sans danger si bien configurée
- ne permet pas de lire/modifier des données sensibles

Elle est conçue pour être exposée



### 2. Secret Key (ou "Private Key")

### Définition
C’est la **clé maîtresse privée** du système.



### À quoi ça sert ?
- Accès complet à l’API
- Gestion des données sensibles
- Actions critiques :
  - remboursements
  - suppression de données
  - gestion des utilisateurs
  - modification de comptes


### Où l’utiliser ?

UNIQUEMENT côté backend :
- Serveur Node.js
- Edge Functions
- API sécurisée
- Backend cloud


### Sécurité
- ne doit JAMAIS être dans le frontend
- ne doit JAMAIS être commit dans GitHub
- ne doit JAMAIS être exposée dans un navigateur

Si elle fuit :
- vol de données possible
- prise de contrôle du compte
- destruction de ressources



### 3. Access Key & Secret Key (AWS / S3)

### Définition
Ces clés sont utilisées pour les services AWS (IAM).



### Access Key ID
- Identifiant public de ton compte IAM
- Sert à t’authentifier



### Secret Access Key
- Mot de passe associé
- Donne un accès complet selon permissions IAM



### À quoi ça sert ?
- Accéder à AWS API
- Gérer S3 (stockage fichiers)
- Déployer des ressources cloud
- Automatiser des services backend



### Utilisation dans ton projet AzureHubScript
Tu en auras besoin si tu veux :
- stocker des fichiers (images, logs, backups)
- connecter Supabase à S3
- automatiser des déploiements cloud
- interagir avec AWS Lambda / services



### Sécurité AWS
- jamais dans le frontend
- jamais dans un repo public
- stockage sécurisé (env variables, secrets manager)


### Résumé global

| Type de clé | Usage | Sécurité |
|-------------|------|----------|
| Publishable Key | Frontend | publique |
| Secret Key | Backend | ultra sensible |
| AWS Access Key | API AWS | sensible |
| AWS Secret Key | AWS API auth | ultra sensible |


---

## Tâche 4 : 03/05/2026 : Système d'Authentification & Gestion des Administrateurs

## Objectif
Cette partie permet de mettre en place un **système d'authentification complet et sécurisé** avec **RBAC** (Role-Based Access Control), gestion des administrateurs, audit logs et invitations par email.

### Base de données (Supabase)

Migration créant 5 tables avec RLS strict :

| Table | Rôle |
|---|---|
| `profiles` | Données utilisateur (nom, email, actif, suspendu, must_change_password, last_login) |
| `user_roles` | Association user ↔ rôle (`global_admin`, `admin`, `editor`, `viewer`) |
| `permissions` | Catalogue de permissions (resource × action: create/read/update/delete) |
| `role_permissions` | Matrice rôle ↔ permissions (seed initial inclus) |
| `audit_logs` | Journal horodaté des actions (login, invite, suspend, delete, update_roles…) |

![image](https://hackmd.io/_uploads/r1JuU9uCZe.png)

**Fonctions sécurisées (`SECURITY DEFINER`) :**
- `has_role(user_id, role)` — évite la récursion RLS
- `has_permission(user_id, resource, action)` — résolution via les rôles
- `is_active_user(user_id)` — vérifie actif et non suspendu
- `handle_new_user()` — trigger `auth.users` : crée le profil et attribue le rôle initial. **Le tout premier utilisateur devient automatiquement Administrateur Global**, les suivants reçoivent `viewer`.
- `log_audit_event(action, resource, resource_id, details)` — helper de journalisation
![image](https://hackmd.io/_uploads/B1ZqL9dCWx.png)

## Rôles & Permissions 

## 1. Liste des rôles

## Rôles du système

- `global_admin`
- `admin`
- `editor`
- `viewer`
![image](https://hackmd.io/_uploads/BJPALqdAZx.png)
![image](https://hackmd.io/_uploads/BJcJvqO0Zl.png)
![image](https://hackmd.io/_uploads/B1G-v5dAWe.png)


## 2. Liste des permissions


### Users
- create
- read
- update
- delete

### Scripts
- create
- read
- update
- delete

### Resources
- create
- read
- update
- delete

### Contact
- read
- update
- delete

### Logs
- read

### Profile
- read
- update

### Site
- read
- update

![image](https://hackmd.io/_uploads/rynXPcORZg.png)


## 3. Mapping rôles → permissions

## global_admin
- Toutes les permissions (FULL ACCESS)

## admin
- Tout sauf gestion critique des utilisateurs
- Pas accès à `users.delete`

## editor
- scripts : create / read / update
- resources : create / read / update
- profile : read / update
- site : read

## viewer
- lecture uniquement (read-only)


## 4. SCRIPT SQL COMPLET (RBAC SYSTEM)

```sql id="rbac_full_sql"
-- =========================================================
-- 1. ENUM des rôles
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('global_admin', 'admin', 'editor', 'viewer');

-- =========================================================
-- 2. Trigger générique updated_at
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
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

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
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
-- 5. Table permissions (resource × action)
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
-- 8. Security-definer functions
-- =========================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _resource TEXT, _action TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = _user_id
      AND p.resource = _resource
      AND p.action = _action
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND is_active = true AND is_suspended = false
  );
$$;

-- =========================================================
-- 9. Trigger handle_new_user (profil + premier admin auto)
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INT;
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
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- 10. Helper de logging
-- =========================================================
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action TEXT,
  _resource TEXT,
  _resource_id TEXT DEFAULT NULL,
  _details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
  uid UUID;
  uemail TEXT;
BEGIN
  uid := auth.uid();
  SELECT email INTO uemail FROM public.profiles WHERE id = uid;

  INSERT INTO public.audit_logs (user_id, user_email, action, resource, resource_id, details)
  VALUES (uid, uemail, _action, _resource, _resource_id, _details)
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;

-- =========================================================
-- 11. RLS Policies
-- =========================================================

-- profiles
CREATE POLICY "Profiles: own read"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Profiles: global_admin read all"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'global_admin'));

CREATE POLICY "Profiles: own update"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND is_suspended = false);

CREATE POLICY "Profiles: global_admin update all"
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'global_admin'))
WITH CHECK (public.has_role(auth.uid(), 'global_admin'));

CREATE POLICY "Profiles: global_admin delete"
ON public.profiles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'global_admin'));

-- user_roles
CREATE POLICY "Roles: own read"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Roles: global_admin read all"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'global_admin'));

CREATE POLICY "Roles: global_admin manage"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'global_admin'))
WITH CHECK (public.has_role(auth.uid(), 'global_admin'));

-- permissions
CREATE POLICY "Permissions: authenticated read"
ON public.permissions FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Permissions: global_admin manage"
ON public.permissions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'global_admin'))
WITH CHECK (public.has_role(auth.uid(), 'global_admin'));

-- role_permissions
CREATE POLICY "RolePerms: authenticated read"
ON public.role_permissions FOR SELECT TO authenticated
USING (true);

CREATE POLICY "RolePerms: global_admin manage"
ON public.role_permissions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'global_admin'))
WITH CHECK (public.has_role(auth.uid(), 'global_admin'));

-- audit_logs
CREATE POLICY "Audit: own read"
ON public.audit_logs FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Audit: global_admin read all"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'global_admin'));

CREATE POLICY "Audit: authenticated insert own"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- 12. Seed permissions + role_permissions
-- =========================================================
INSERT INTO public.permissions (resource, action, description) VALUES
  ('site',      'read',   'Lire le contenu global du site'),
  ('site',      'update', 'Modifier le contenu global'),
  ('resources', 'create', 'Ajouter une ressource'),
  ('resources', 'read',   'Consulter les ressources'),
  ('resources', 'update', 'Modifier une ressource'),
  ('resources', 'delete', 'Supprimer une ressource'),
  ('scripts',   'create', 'Créer un script'),
  ('scripts',   'read',   'Consulter les scripts'),
  ('scripts',   'update', 'Modifier un script'),
  ('scripts',   'delete', 'Supprimer un script'),
  ('users',     'create', 'Créer un administrateur'),
  ('users',     'read',   'Consulter les administrateurs'),
  ('users',     'update', 'Modifier un administrateur'),
  ('users',     'delete', 'Supprimer un administrateur'),
  ('contact',   'read',   'Lire les demandes de contact'),
  ('contact',   'update', 'Traiter les demandes de contact'),
  ('contact',   'delete', 'Supprimer les demandes de contact'),
  ('logs',      'read',   'Consulter les logs et audits'),
  ('profile',   'read',   'Lire son profil'),
  ('profile',   'update', 'Modifier son profil');

-- global_admin → toutes les permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'global_admin'::public.app_role, id FROM public.permissions;

-- admin → tout sauf gestion users
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin'::public.app_role, id FROM public.permissions
WHERE resource <> 'users';

-- editor → lecture/édition scripts + ressources + profil
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'editor'::public.app_role, id FROM public.permissions
WHERE (resource = 'scripts' AND action IN ('create','read','update'))
   OR (resource = 'resources' AND action IN ('create','read','update'))
   OR (resource = 'profile')
   OR (resource = 'site' AND action = 'read');

-- viewer → lecture seule
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'viewer'::public.app_role, id FROM public.permissions
WHERE action = 'read' AND resource IN ('scripts','resources','site','profile');
```

### Pages d'authentification

| Route | Description |
|---|---|
| `/login` | Connexion email + mot de passe (avec show/hide, lien mot de passe oublié) |
| `/signup` | Création du **premier administrateur global** (auto-promu via trigger) |
| `/forgot-password` | Demande d'email de réinitialisation (token expirant Supabase) |
| `/reset-password` | Définition d'un nouveau mot de passe via lien sécurisé |
| `/set-password` | Première connexion : obligation de définir un mot de passe personnel |
| `/forbidden` / `/suspended` | Pages d'erreur d'accès |

**Politique de mot de passe (16 caractères minimum)** appliquée côté frontend dans `src/lib/passwordPolicy.ts` :
- ≥ 16 caractères
- Majuscule + minuscule + chiffre + caractère spécial
- Indicateur visuel de force (4 niveaux) + checklist live

### Page de connexion
![image](https://hackmd.io/_uploads/S1MLCc_Abg.png)

### Page d'inscription
![image](https://hackmd.io/_uploads/r1-jCcdA-g.png)

### Page mot de passe oublié
![image](https://hackmd.io/_uploads/B163AqdRWx.png)
![image](https://hackmd.io/_uploads/ByaaC9d0-l.png)

### Protection des routes

`<ProtectedRoute>` dans `src/components/auth/ProtectedRoute.tsx` :
- Redirige `/login` si non connecté (avec retour sur la page demandée)
- Redirige `/suspended` si compte suspendu
- Force `/set-password` à la première connexion
- Vérifie `role` ou `permission` requise → `/forbidden` sinon

Toutes les routes applicatives sont protégées dans `App.tsx`. Les routes `/admin/*` exigent `global_admin`. Les routes de création (`/scripts/new`, `/categories/new`) exigent les permissions correspondantes.

### Page administrateur Global — `/admin/users`

Page complète de gestion des comptes :
- Liste tabulaire (nom, email, rôles, statut, dernière connexion)
- Recherche live nom/email
- **Invitation** d'un administrateur (nom + email + rôles multi-sélection) → email automatique
- Modification des rôles (multi-checkbox dans dialog)
- Suspension / réactivation
- Forcer la réinitialisation du mot de passe (envoi d'email)
- Suppression définitive (avec confirmation, blocage de l'auto-suppression)

### Logs & Audit — `/admin/audit-logs`

- Tableau horodaté des 500 dernières actions
- Recherche multi-critère + filtre par ressource
- Icône et couleur par type d'action (login, suspend, invite, delete…)
- Détails JSON par action

### Edge Functions Supabase

Deux Edge Functions sécurisées (vérifient le rôle `global_admin` du caller) :

| Function | Rôle |
|---|---|
| `admin-invite-user` | Crée le compte via `auth.admin.inviteUserByEmail` (email d'invitation Supabase), attribue les rôles, marque `must_change_password=true`, log audit |
| `admin-delete-user` | Supprime un utilisateur via `auth.admin.deleteUser`, log audit. Auto-suppression bloquée. |

![image](https://hackmd.io/_uploads/rynMd5_0bx.png)

### Contexte global `AuthContext`

`src/contexts/AuthContext.tsx` expose :
- `user`, `session`, `profile`, `roles`, `permissions`
- `hasRole(role)` / `hasPermission(resource, action)` pour le rendu conditionnel
- `signIn`, `signOut` (avec audit log automatique)
- Listener `onAuthStateChange` configuré **avant** `getSession()` (best practice Supabase)

La sidebar affiche désormais le profil et le rôle de l'utilisateur connecté, et la section **Administration** n'apparaît que pour les `global_admin`.

### Sécurité

- Hashage des mots de passe géré par Supabase Auth (bcrypt)
- Tokens d'invitation et de reset **expirables**, à usage unique (Supabase Auth)
- RLS strict sur toutes les tables, fonctions `SECURITY DEFINER` pour éviter la récursion
- Vérification des permissions **côté serveur** via RLS et Edge Functions
- `service_role_key` jamais exposée au frontend
- Audit logs pour login, logout, invite, suspend, reactivate, delete, update_roles, password reset
- Auto-suppression et auto-suspension bloquées

### Premier démarrage : création du compte admin global

1. Aller sur `/signup`
![image](https://hackmd.io/_uploads/Hkt01jdCZx.png)
![image](https://hackmd.io/_uploads/ByYJxjORbx.png)
3. Créer un compte → devient automatiquement **Administrateur Global**
![image](https://hackmd.io/_uploads/SJ0tljuAWe.png)
Confirmation du compte par Email.
![image](https://hackmd.io/_uploads/S1gebsu0Wx.png)
Après cette confirmation l'admin aura accès au tableau de bord.
![image](https://hackmd.io/_uploads/BkbI-iO0Ze.png)
On vérifie le compte créé au niveau de la base de données.
![image](https://hackmd.io/_uploads/r1Xc-juCbx.png)
![image](https://hackmd.io/_uploads/BJP6Zj_CZg.png)


## Modification du template de mail de confirmation > inscription
![image](https://hackmd.io/_uploads/HJlZ8jORZx.png)
![image](https://hackmd.io/_uploads/HJ1GIo_CZe.png)

## Modification template Invite User (Invitation d'un administrateur)
![image](https://hackmd.io/_uploads/rkepLs_Abx.png)


## Modification template Réinitialisation de mot de passe
![image](https://hackmd.io/_uploads/SJDNDs_0Zl.png)

## Tester l'invitation d'un utilisateur
Accéder à `/admin/users` pour inviter d'autres administrateurs
![image](https://hackmd.io/_uploads/HyyOdj_CWl.png)
![image](https://hackmd.io/_uploads/S1iytj_0-g.png)
![image](https://hackmd.io/_uploads/rkFlFjdCZe.png)
![image](https://hackmd.io/_uploads/r1nrFs_0We.png)
![image](https://hackmd.io/_uploads/rkIJl3uAWx.png)
![image](https://hackmd.io/_uploads/HyoGg2O0be.png)
![image](https://hackmd.io/_uploads/ByoVe2_C-x.png)
Dans cette capture suivante on remarque bien que cet utlisateur n'as pas accès à la page gestion des utilisateurs et ni à la page des logs et audits; seul l'admin global à le droit d'accéder à cete page.
![image](https://hackmd.io/_uploads/HyaBx3O0Zg.png)
![image](https://hackmd.io/_uploads/BJn4-hO0Wx.png)

l'admin global peut suspendre un utilisateur, réinitialiser le mot de passe, changer son rôle ou le supprimer définitivement.
![image](https://hackmd.io/_uploads/rJpKZ3_0-e.png)
Par exemple : on suspend cet utilisateur ajouté; alors dans ce cas il ne pourra plus se connecter.
![image](https://hackmd.io/_uploads/HJTpW2uA-x.png)
![image](https://hackmd.io/_uploads/HkVxz3uRWx.png)
Si cet utilisateur souhaite se connecter il recevra un message 'Compte suspendu'.
![image](https://hackmd.io/_uploads/ryBXfhdAZl.png)

Si on l'admin débloque cet utilisateur, il pourra à nouveau se connecter.
![image](https://hackmd.io/_uploads/BJkKf3u0bl.png)
![image](https://hackmd.io/_uploads/HJZcG2dRZl.png)
![image](https://hackmd.io/_uploads/ByYoG2d0We.png)
![image](https://hackmd.io/_uploads/rk92M2dCZl.png)
![image](https://hackmd.io/_uploads/r1J0fhdRbe.png)


---


## Tâche 5 - 06/05/2026 : Améliorations du Dashboard : page utilisateur

## Objectif
Améliorer le rendu de la page gestion des utilisateurs

### Bloc Informations Temps Réel

Ajout d’un bloc informatif affiché à côté du dashboard principal avec :

- **Date actuelle**
- **Heure en temps réel**
  - Affichage : heures / minutes / secondes
  - Mise à jour automatique chaque seconde
- **Localisation utilisateur**
  - Langue du système
  - Fuseau horaire (timezone locale)

![image](https://hackmd.io/_uploads/HkFl_3uR-e.png)

### Gestion des Notifications

Mise en place d’un système de notifications incluant :

- Icône de notification dynamique
- Indicateur visuel (badge si nouvelles notifications)
![image](https://hackmd.io/_uploads/SJlQ_hO0bg.png)
- L'icône renvoie à la page logs e audits
![image](https://hackmd.io/_uploads/B1YHdn_CZx.png)



### Détails Utilisateur

Ajout d’une action **"Voir"** dans le tableau permettant :

- Ouverture d’une **modale**
- Affichage des **informations détaillées de l’utilisateur**
  - Nom
  - Email
  - Rôle(s)
  - Statut (actif / suspendu)
  - Autres métadonnées utiles

![image](https://hackmd.io/_uploads/HyvwO3OR-g.png)
![image](https://hackmd.io/_uploads/S1qR_3_AZg.png)


### Pagination du Tableau

Implémentation d’une pagination pour améliorer la lisibilité :

- **5 lignes par page**
- Navigation entre les pages
![image](https://hackmd.io/_uploads/H1txYnO0-l.png)


---

## Tâche 6 - 06/05/2026 : Configuration de la page Logs & Audits

## Objectif

Améliorer le rendu de la page Logs et Audits

### KPIs (Indicateurs clés)

Ajout de **cartes KPI en haut de page** permettant d’avoir une vue rapide sur :

- Nombre total de logs
- Activités récentes
- Actions critiques (suppression, modification)
- Autres métriques pertinentes
![image](https://hackmd.io/_uploads/HJ9mSaO0-g.png)


### Tableau des Logs

Amélioration du tableau principal avec :

- Actions disponibles par ligne (ex : voir, supprimer, détail)
- Structure plus lisible et optimisée UX
- Données enrichies (utilisateur, action, ressource, date, etc.)

![image](https://hackmd.io/_uploads/SyGLB6dRZl.png)

---

### Pagination

- Pagination mise en place avec :
  - **10 lignes par page**
  - Navigation fluide entre les pages

![image](https://hackmd.io/_uploads/ByIwH6dAZl.png)

---

### Sélection multiple & suppression

Ajout d’un système de sélection avancé :

- Case à cocher par ligne
- Option **“Tout sélectionner / Tout désélectionner”**
- Action de **suppression en masse**
- Positionnée sous la barre de recherche pour accessibilité optimale

![image](https://hackmd.io/_uploads/HkzKS6dAWx.png)



### Export des Logs

Ajout d’un bouton **“Télécharger”** permettant :

- Ouverture d’une **popup de sélection du format**
  - CSV
  - PDF

---

### Export PDF avancé

Implémentation d’un export PDF professionnel incluant :

- Header (nom de l’application, date, contexte)
- Métadonnées (utilisateur, période, filtres appliqués)
- Tableau structuré et lisible
- Mise en forme propre (type rapport)


### Dépendances nécessaires

Installation des librairies pour l’export PDF :

```bash
npm install jspdf jspdf-autotable
```
![image](https://hackmd.io/_uploads/SkK5Hp_Rbg.png)
![image](https://hackmd.io/_uploads/SJKsHTdRbe.png)
![image](https://hackmd.io/_uploads/Hycara_0Wl.png)
![image](https://hackmd.io/_uploads/Sy-GI6_0Wl.png)
![image](https://hackmd.io/_uploads/r17FIaOCWe.png)


