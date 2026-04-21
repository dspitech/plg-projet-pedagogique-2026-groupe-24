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

## Perimetre fonctionnel

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


