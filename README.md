# Script Hub Manager

**Projet pédagogique 2025 – 2026 · Groupe 24 · ESTIAM Paris**
*En partenariat avec l'entreprise DSPI-TECH* 

Plateforme web centralisée destinée aux équipes IT (administrateurs systèmes, ingénieurs cloud, DevOps, cybersécurité) pour **cataloguer, documenter, partager, valider et exploiter** des scripts, outils et ressources techniques dans un environnement sécurisé, moderne et hautement disponible.

---

## Sommaire

- [Aperçu](#aperçu)
- [Équipe](#équipe)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Modèle de données](#modèle-de-données)
- [Routes principales](#routes-principales)
- [Architecture & sécurité](#architecture--sécurité)
- [Déploiement](#déploiement)
- [Installation locale](#installation-locale)
- [Variables d'environnement](#variables-denvironnement)
- [Tests & qualité de code](#tests--qualité-de-code)
- [Structure du projet](#structure-du-projet)
- [Roadmap / perspectives d'évolution](#roadmap--perspectives-dévolution)
- [Contribuer](#contribuer)
- [Licence](#licence)
- [Liens](#liens)
- [Remerciements](#remerciements)

---

## Aperçu

Le site se compose de deux espaces :

- **Une vitrine publique** (sans compte requis) où tout visiteur peut parcourir, rechercher, aimer, partager et télécharger les scripts et ressources publics - avec un **mode invité** (simple pseudo) pour interagir sans créer de compte.
- **Un espace d'administration protégé** (dashboard, gestion complète des scripts/catégories/ressources, import/export CSV/PDF/JSON, gestion des utilisateurs et des rôles, journal d'audit, corbeille, archives).

Les scripts pris en charge couvrent un large spectre : PowerShell, Bash, Python, Terraform, Bicep, ARM, CloudFormation, Ansible, Kubernetes, Docker, SQL, JavaScript/TypeScript, YAML, JSON, Go, Ruby, Perl…

## Équipe

Projet réalisé par le **Groupe 24**, filière Cloud Computing & Cyber Security Network (CCSN) de l'ESTIAM Paris, sous l'encadrement de **M. Mhand BOUFALA**.

| Membre | Rôle | Classe |
|---|---|---|
| **Amir Minihadji AMINA** | Développeur & Administrateur Système | E5 - CCSN |
| **LO Pape** | Chef de projet, Développeur Backend & Administrateur | E4 - CCSN |
| **Neylie NDJUMKENG-NGUEMO** | Architecte Logiciel | E4 - CCSN |
| **Steve John BIAMOU HOUMGA** | Expert Cybersécurité | E4 - CCSN |
| **Gauyet NGUEFACK-TCHAMI** | Experte Cybersécurité | E4 - CCSN |
| **Mhand BOUFALA** | Superviseur pédagogique | ESTIAM Paris |

## Fonctionnalités

**Côté visiteur**
- Catalogue public de scripts et de ressources, recherche et filtres
- Page catégories, statistiques dynamiques (vues, likes, partages, téléchargements)
- Mode invité (pseudo unique, sans création de compte)
- Formulaire de contact, pages légales
- Thème clair/sombre, design responsive (mobile/tablette/desktop)

**Côté administration**
- CRUD complet : scripts, catégories, ressources
- Éditeur de code intégré (Monaco Editor) avec coloration syntaxique multi-langages
- Import en masse (JSON) et export multi-format (CSV, PDF, JSON, ZIP)
- Gestion des utilisateurs et des rôles (RBAC)
- Journal d'audit (IP, user-agent) avec archivage automatique
- Corbeille (soft delete) et restauration
- Tableau de bord temps réel avec graphiques (Recharts)

## Stack technique

| Couche | Technologie |
|---|---|
| Front-end | React 18.3 + TypeScript, Vite 8 |
| Routing | React Router DOM v6 |
| UI / Design system | Tailwind CSS 3 + shadcn/ui (Radix UI) |
| État serveur | TanStack React Query v5 |
| Formulaires | React Hook Form + Zod |
| Backend-as-a-Service | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Éditeur de code | Monaco Editor |
| Data visualisation | Recharts |
| Export de fichiers | jsPDF, JSZip, file-saver |
| Tests | Vitest + Testing Library |
| Qualité de code | ESLint 9 (flat config) + typescript-eslint |
| Package manager | Bun / npm |

## Modèle de données

Tables principales définies dans les migrations SQL (`supabase/migrations/`) :

| Table | Rôle |
|---|---|
| `profiles` | Profil étendu de chaque utilisateur (statut actif/suspendu, changement de mot de passe requis, dernière connexion…) |
| `user_roles` | Association utilisateur ↔ rôle - table séparée de `profiles` pour empêcher toute auto-élévation de privilèges |
| `permissions` / `role_permissions` | Référentiel des permissions et association rôle ↔ permission (granularité ressource/action) |
| `audit_logs` / `archived_logs` | Journal d'audit (action, IP, user-agent, horodatage) et logs archivés automatiquement après 90 jours |
| `categories` | Catégories de classement des scripts/ressources |
| `scripts` | Scripts avec métadonnées riches : criticité, version, licence, compatibilité, dépendances, historique, compteurs d'engagement |
| `resources` | Ressources complémentaires (liens, documents, fichiers) |
| `script_likes` / `script_shares` | Interactions (utilisateur connecté ou invité) |
| `guest_users` | Identité invité (pseudo unique) pour interagir sans compte |
| `contact_messages` | Messages du formulaire de contact public |
| `trash_items` | Corbeille générique (soft delete) pour tous les modules |

Quelques fonctions PostgreSQL (RPC) notables : `has_role` / `has_permission` (SECURITY DEFINER, utilisées par les policies RLS), `handle_new_user` (création automatique du profil), `log_audit_event`, `increment_script_views`, `bump_script_likes` / `bump_script_shares`, `register_guest`.

## Routes principales

| Type | Exemples de routes |
|---|---|
| **Publiques** | `/`, `/qui-sommes-nous`, `/nos-scripts`, `/nos-scripts/:scriptId`, `/nos-categories`, `/nos-ressources`, `/nous-contacter`, pages légales |
| **Authentification** | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/set-password`, `/forbidden`, `/suspended` |
| **Back-office (connecté)** | `/dashboard`, `/scripts`, `/scripts/new`, `/scripts/:id/edit`, `/categories`, `/resources`, `/profile`, `/contact`, `/settings` |
| **Administration (`global_admin`)** | `/admin/users`, `/admin/audit-logs`, `/admin/archives`, `/admin/trash` |

L'accès aux routes protégées est contrôlé par un composant `ProtectedRoute` qui redirige selon l'état de connexion, le rôle et les permissions de l'utilisateur.

## Architecture & sécurité

- **RBAC** à 4 rôles (`global_admin`, `admin`, `editor`, `viewer`) stockés séparément des profils utilisateurs, avec permissions granulaires par ressource/action.
- **Row Level Security (RLS)** PostgreSQL sur toutes les tables : lecture publique restreinte au contenu visible, écriture réservée aux rôles autorisés.
- **Edge Functions** Supabase pour toute opération sensible côté serveur (invitations, suppression de compte, contact).
- **Politique de mot de passe stricte** (16 caractères min., score de robustesse) et journalisation d'audit complète.
- Infrastructure Cloud **Microsoft Azure** en architecture **Hub & Spoke** : Load Balancer, Firewall, Bastion, VMs Ubuntu en haute disponibilité, NSG, VNet Peering - provisionnée en **Infrastructure as Code (Terraform)**.
- Supervision via **Prometheus & Grafana**, CI/CD via **GitHub Actions**.

## Déploiement

Le déploiement de l'infrastructure Azure (Terraform, cloud-init, supervision) est géré dans un dépôt dédié : voir [Liens](#liens).

Sur chaque VM, le script [`scripts/deploy.sh`](./scripts/deploy.sh) automatise le build et le redémarrage de l'application via un runner GitHub Actions auto-hébergé (build Vite, `pm2 reload`).

## Installation locale

Prérequis : Node.js 18+ (ou Bun) et un projet Supabase configuré.

```bash
# Installation des dépendances
npm install
# ou
bun install

# Variables d'environnement (URL et clé Supabase)
cp .env.example .env

# Lancement en développement
npm run dev

# Build de production
npm run build

# Tests
npm run test
```

## Variables d'environnement

L'application nécessite un projet Supabase configuré. Créez un fichier `.env` à la racine avec au minimum :

```bash
VITE_SUPABASE_URL=https://<votre-projet>.supabase.co
VITE_SUPABASE_ANON_KEY=<votre-clé-anon>
```

> Ces variables sont injectées **au moment du build** (Vite), et non au runtime : le fichier `.env` doit donc être présent avant `npm run build`.

## Tests & qualité de code

```bash
# Tests unitaires et de composants
npm run test

# Mode watch
npm run test:watch

# Linting
npm run lint
```

- **Vitest** + **Testing Library** (React / jest-dom) + **jsdom** pour les tests unitaires et de composants.
- **ESLint 9** (flat config) + **typescript-eslint** pour la qualité et la cohérence du code TypeScript.

## Structure du projet

```
├── src/                # Code source de l'application React
├── public/             # Assets statiques
├── supabase/
│   ├── migrations/      # Schéma et policies RLS PostgreSQL
│   └── functions/       # Edge Functions (Deno)
├── scripts/
│   └── deploy.sh        # Script de déploiement (runner auto-hébergé)
├── RAPPORT.md           # Rapport pédagogique complet du projet
└── README.md
```

## Roadmap / perspectives d'évolution

Quelques pistes d'évolution identifiées pour les prochaines versions :

- **Fonctionnel** : recherche intelligente (IA), suggestions automatiques de scripts, analyse automatique du contenu, notation/commentaires avancés.
- **DevOps** : intégration GitHub/GitLab, tests automatisés avant publication, chaîne CI/CD complète, migration vers Azure Kubernetes Service (AKS).
- **Cloud** : auto-scaling, déploiement multi-régions, stratégie de sauvegarde et Disaster Recovery.
- **Cybersécurité** : intégration d'un SIEM, analyse comportementale des utilisateurs, authentification multi-facteurs avancée.

Le détail complet (avantages, limites, difficultés rencontrées) est disponible dans [`RAPPORT.md`](./RAPPORT.md).

## Contribuer

Ce dépôt est un projet pédagogique réalisé dans le cadre du cursus ESTIAM Paris. Les contributions externes ne sont pas ouvertes, mais toute suggestion ou retour peut être partagé via une issue GitHub.

Pour les membres de l'équipe :
1. Créer une branche depuis `main` (`feature/nom-de-la-fonctionnalité`)
2. Committer avec des messages clairs et atomiques
3. Ouvrir une Pull Request pour revue avant merge

## Licence

Projet réalisé à des fins pédagogiques dans le cadre du module *Projet pédagogique 2025/2026* de l'ESTIAM Paris, en partenariat avec DSPI-TECH. Usage éducatif - aucune licence open-source n'est actuellement associée à ce dépôt.

## Liens

- **Code source du site** : [plg-projet-pedagogique-2026-groupe-24](https://github.com/dspitech/plg-projet-pedagogique-2026-groupe-24.git)
- **Déploiement & infrastructure Azure/Terraform** : [DeploimentAppHubScript](https://github.com/dspitech/DeploimentAppHubScript.git)

## Remerciements

L'équipe du Groupe 24 remercie **M. Mhand BOUFALA** pour son accompagnement, l'ensemble du corps enseignant de l'**ESTIAM Paris**, ainsi que **DSPI-TECH** pour le contexte professionnel apporté à ce projet.
