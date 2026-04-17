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
git clone <URL_DU_REPO>
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

