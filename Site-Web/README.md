# Azure Scripts Dashboard

Plateforme web centralisée pour la gestion, la documentation et l'exploitation de scripts cloud (Azure & AWS) à destination des équipes Cloud Ops, SecOps et DevOps.

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

#### 2. `/categories` — Catégories (`src/pages/CategoriesPage.tsx`)
- Header avec **breadcrumb**, description et **mini-stats** (nombre de catégories / scripts).
- Cards catégorie repensées : icône colorée par accent (blue/emerald/orange/rose), **slug en monospace**, compteur de scripts, **% du catalogue** et **barre de progression** dynamique.
- Bandeau d'astuce de recherche + footer "Demander une nouvelle catégorie".

#### 3. `/resources` — Ressources (`src/pages/ResourcesPage.tsx`)
- Header avec icône `Library`, breadcrumb et stats (ressources totales / catégories).
- **Barre de recherche** live + **filtres par catégorie** sous forme de chips.
- Cards de ressources avec : icône thématisée par catégorie, **badge de type** (Doc / CLI / Repo / Vidéo / Guide), nom du domaine en monospace, et lien externe.
- Sections regroupées dynamiquement avec compteur, état vide explicite quand aucun résultat.

### Améliorations transverses
- 100 % **design tokens HSL** (`bg-card`, `border-border/60`, `text-primary`…) — aucun hex codé en dur dans les composants.
- Hover states unifiés (border primary + ombre primary/5 + transitions).
- Typographie tabulaire (`tabular-nums`) pour tous les chiffres.
- Spacing dense type GitHub (gap-3/4, padding compact).
- Composants accessibles : focus rings, contrastes respectés en thème sombre.

---

## 🛠 Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18 + TypeScript 5 + Vite 5 |
| Styling | Tailwind CSS v3 + design tokens HSL custom |
| UI primitives | shadcn/ui + Radix |
| Routing | react-router-dom |
| Charts | Recharts |
| Icons | lucide-react |
| Code highlight | react-syntax-highlighter (Prism) |
| Dates | date-fns |
| State user | localStorage via `useUserData` hook |

---

## 📁 Structure du projet

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


---

##  Lancer le projet

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173).


---

## Tâche 2 : 22/04/2026 — Formulaires de création (Catégories & Scripts)

Cette tâche introduit deux **formulaires professionnels** permettant aux utilisateurs de créer de nouvelles catégories et de nouveaux scripts directement depuis l'interface.

### 1. `/categories/new` — Nouvelle catégorie (`src/pages/NewCategoryPage.tsx`)

Formulaire en 2 colonnes (formulaire + **aperçu en direct sticky**).

**Champs :**
- **Nom** (obligatoire, 2-60 car., compteur live)
- **Description** (optionnelle, 280 car. max, compteur)
- **Couleur** : color picker natif + champ HEX synchronisé + 8 presets cliquables
- **Icône** : grille de 12 icônes Lucide sélectionnables
- **Statut** : `Actif` / `Inactif` avec pastille colorée

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

### Intégration
- Routes ajoutées dans `src/App.tsx` : `/categories/new` et `/scripts/new`
- CTAs `+ Nouvelle` / `+ Nouveau script` dans les en-têtes de `CategoriesPage` et `ScriptsPage`
- Dépendance ajoutée : **`zod`** pour la validation

---


