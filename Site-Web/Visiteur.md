# Visiteur.md — Interface publique CloudScripts

Documentation complète de l'interface visiteur (frontend public) du projet **CloudScripts**, séparée et complémentaire au Dashboard administrateur.

---

## 🎯 Vision & Architecture

Le site est désormais structuré en **deux univers distincts** :

| Univers | Public cible | Route racine | Layout |
|---|---|---|---|
| **Frontend public** | Visiteurs anonymes & utilisateurs | `/` | `PublicLayout` (header sticky + footer) |
| **Dashboard admin** | Administrateurs & éditeurs | `/dashboard`, `/admin/*`, `/scripts`, etc. | `DashboardLayout` (sidebar) |

Les deux espaces partagent la même base de données Supabase mais exposent des vues différentes, filtrées par les politiques RLS (`visibility = 'public'` pour les visiteurs).

---

## 🧩 Composants publics réutilisables

| Composant | Rôle |
|---|---|
| `src/components/public/PublicLayout.tsx` | Layout global (header + main + footer) + injection dynamique SEO (`title`, `description`, `canonical`). |
| `src/components/public/PublicHeader.tsx` | Header sticky responsive, blur au scroll, navigation animée, menu mobile, bouton **Connexion**. |
| `src/components/public/PublicFooter.tsx` | Footer multi-colonnes (branding, navigation, contact, réseaux sociaux). |

### Caractéristiques transverses

- Sticky header avec effet **glassmorphism** déclenché au scroll.
- Indicateur de route actif animé (underline `after:` Tailwind).
- 100 % responsive (mobile / tablette / desktop).
- Animations `animate-fade-in`, transitions hover (translate, glow, ring).
- Cohérence visuelle parfaite avec le Dashboard (mêmes tokens HSL).

---

## 🗺️ Routes publiques

| URL | Composant | Description |
|---|---|---|
| `/` | `HomePage` | Page d'accueil avec hero, stats live, scripts/catégories/ressources récents, features et CTA. |
| `/qui-sommes-nous` | `AboutPage` | Présentation équipe, école ESTIAM, supervision, valeurs, timeline. |
| `/nos-scripts` | `ScriptsPublicPage` | Catalogue dynamique des scripts publics. |
| `/nos-scripts/:scriptId` | `ScriptPublicDetailPage` | Fiche détaillée avec like / share / téléchargement / copie. |
| `/nos-categories` | `CategoriesPublicPage` | Grille des catégories visibles + nombre de scripts. |
| `/nos-categories/:categoryId` | `CategoryPublicPage` | Liste filtrée des scripts d'une catégorie. |
| `/nos-ressources` | `ResourcesPublicPage` | Bibliothèque (liens, documents, fichiers) avec vue Grille / Liste. |
| `/nous-contacter` | `ContactPublicPage` | Formulaire de contact persisté en base. |
| `/login` | `LoginPage` (existant) | Accès Dashboard administrateur. |

---

## 📄 Détail des pages

### 1. Page Accueil (`HomePage.tsx`)

- **Hero immersif** : grand titre dégradé, badge "Projet Master ESTIAM", deux CTA, fond radial + grille.
- **Statistiques temps réel** chargées depuis Supabase : nombre de scripts, catégories, ressources, vues cumulées.
- **6 cartes de fonctionnalités** (Sécurité, Performance, Scalabilité, Multi-langages, Centralisation, Cloud-ready).
- **Sections dynamiques** : 6 derniers scripts, 6 catégories populaires, 4 ressources récentes.
- **CTA final** vers Dashboard / Contact.
- Animations en cascade (`animationDelay` progressif).

### 2. Page "Qui sommes-nous ?" (`AboutPage.tsx`)

- Hero éditorial.
- Section "Pourquoi ce projet ?" avec checklist méthodologique.
- Section **Vision** dans une carte premium.
- Bloc dédié à **ESTIAM** avec 6 compétences clés (icônes).
- **Notre équipe** : 5 cartes membres avec avatar initiales, rôle, classe, description.
- Bloc **Supervision** valorisant Mhand BOUFALA.
- **6 valeurs** sous forme de cartes animées.
- **Timeline** verticale en zigzag (4 étapes clés du projet).
- CTA final vers Contact / Scripts.

### 3. Page "Scripts" (`ScriptsPublicPage.tsx`)

- Récupère les scripts `visibility = 'public'` triés par date.
- **Recherche dynamique** : nom, description, tags.
- **Filtres** : type de script, criticité (dynamiques selon données).
- Cartes avec badges de type & criticité (criticité colorée), tags `#`, compteurs (vues, likes, partages), CTA vers le détail.

### 4. Page Détail Script (`ScriptPublicDetailPage.tsx`)

- Incrément automatique des **vues** à l'ouverture.
- **Bouton Like** persisté dans `script_likes` (auth requise). Toggle on/off avec trigger SQL de comptage automatique.
- **Bouton Partager** : Web Share API native si dispo, sinon copie du lien — chaque partage enregistré dans `script_shares`.
- **Bouton Télécharger** : génère un fichier `.ps1` / `.sh` / `.txt` selon le type et incrémente `downloads_count`.
- **Bouton Copier le code** : copie le contenu dans le presse-papier.
- Bloc code source monospace dans une zone scrollable.
- Sections Fonctionnalités, Exemple d'utilisation, Prérequis, Métadonnées, Tags.

### 5. Page Catégories (`CategoriesPublicPage.tsx`)

- Récupération des catégories `is_visible = true` + comptage des scripts publics par catégorie (requête parallèle).
- Recherche dynamique.
- Cartes avec couleur dynamique (variable `c.color`), badge nombre de scripts.

### 6. Page Catégorie (`CategoryPublicPage.tsx`)

- En-tête de catégorie (icône colorée + description + badge nombre de scripts).
- Liste des scripts publics liés.

### 7. Page Ressources (`ResourcesPublicPage.tsx`)

- Catalogue complet des ressources `visibility = 'public'` et `status = 'active'`.
- **Recherche** + filtre par type.
- **Double mode d'affichage** : Grille / Liste (toggle).
- Action **Ouvrir** (lien externe) ou **Télécharger** (URL signée Supabase Storage privée, valable 60 s).
- Compteurs vues/téléchargements incrémentés à chaque interaction.

### 8. Page Contact (`ContactPublicPage.tsx`)

- Formulaire complet : Nom, Email, Téléphone, Société, **Catégorie** (6 options), Sujet, Message.
- **Validation Zod** côté client (longueurs, formats).
- **Anti-spam honeypot** : champ caché `honeypot`, rejeté si rempli.
- Indicateur de longueur dynamique pour le message.
- Persistance dans `contact_messages` (insert public, lecture admin uniquement).
- User-agent et IP captés automatiquement (côté serveur via le trigger d'audit existant).
- Sidebar contact (4 infos + réseaux sociaux + carte sécurité).

---

## 🗄️ Modifications base de données

### Nouvelle table `contact_messages`

Champs : `name`, `email`, `subject`, `category`, `phone`, `company`, `message`, `status`, `ip_address`, `user_agent`.

**Politiques RLS** :
- Tout le monde (anonyme inclus) peut **soumettre** un message.
- Seuls les **Global Admins / Admins** peuvent lire, modifier ou supprimer les messages.

### Système de likes & partages de scripts

- Table `script_likes` : tracking (user_id, script_id) unique. RLS : lecture publique, écriture authentifiée.
- Table `script_shares` : tracking des événements de partage (channel, user optionnel). Lecture/insertion publiques pour les compteurs.
- Colonnes `likes_count` et `shares_count` ajoutées à `scripts`.
- **Triggers SQL** `bump_script_likes` et `bump_script_shares` qui maintiennent les compteurs en temps réel (INSERT/DELETE).

---

## 🎨 Design System & UX

- Tokens HSL semantiques (`--primary`, `--background`, `--card`, `--gradient-primary`, `--shadow-glow`).
- Police **Inter** (corps) + **JetBrains Mono** (code).
- Effets : blur, radial-gradient, grid-mask, glow primary, hover translate-y -1, scale 1.05 sur icônes.
- Animations : `fade-in` cascade, transitions 200-300 ms, indicateurs actifs animés.
- Accessibilité : aria-labels sur les actions sans texte (menu mobile, boutons sociaux), focus-visible préservé.

---

## 🔍 SEO

`PublicLayout` injecte dynamiquement par route :
- `<title>` formaté `{Page} — CloudScripts`.
- `<meta name="description">` adaptée à la page.
- `<link rel="canonical">` mis à jour selon le pathname courant.

Structure HTML sémantique (`<header>`, `<main>`, `<footer>`, `<section>`, `<nav>`, `<h1>` unique par page).

---

## 🛡️ Sécurité

- Validation Zod sur tous les champs formulaire.
- Anti-spam honeypot sur Contact.
- Aucune fuite d'informations privées : seuls les scripts/ressources `visibility = 'public'` sont exposés grâce aux politiques RLS existantes.
- Storage `resources` reste privé : accès via **URL signée** courte (60 s).
- Likes uniques par utilisateur (contrainte SQL `UNIQUE(script_id, user_id)`).

---

## 📂 Fichiers créés / modifiés

**Créés**
- `src/components/public/PublicLayout.tsx`
- `src/components/public/PublicHeader.tsx`
- `src/components/public/PublicFooter.tsx`
- `src/pages/public/HomePage.tsx`
- `src/pages/public/AboutPage.tsx`
- `src/pages/public/ScriptsPublicPage.tsx`
- `src/pages/public/ScriptPublicDetailPage.tsx`
- `src/pages/public/CategoriesPublicPage.tsx`
- `src/pages/public/CategoryPublicPage.tsx`
- `src/pages/public/ResourcesPublicPage.tsx`
- `src/pages/public/ContactPublicPage.tsx`
- `Visiteur.md`

**Modifiés**
- `src/App.tsx` : nouvelles routes publiques + dashboard déplacé sur `/admin`.
- `src/lib/auditLogs.ts` : nettoyage des erreurs TypeScript (RPC obsolète, typage `details`).

**Base de données** (migration appliquée)
- Table `contact_messages` + RLS.
- Tables `script_likes` / `script_shares` + colonnes `likes_count` / `shares_count`.
- Triggers `bump_script_likes` / `bump_script_shares`.

---

## ✅ Vérifications recommandées

1. Visiter `/` puis naviguer dans tout le menu pour valider l'expérience visiteur.
2. Tester le formulaire `/nous-contacter` → message visible côté admin (table `contact_messages`).
3. Se connecter et liker / partager un script public depuis `/nos-scripts/:id` → vérifier l'incrément des compteurs en temps réel.
4. Télécharger une ressource depuis `/nos-ressources` (URL signée Supabase Storage).
5. Vérifier la responsivité mobile (menu burger, grilles, hero).
