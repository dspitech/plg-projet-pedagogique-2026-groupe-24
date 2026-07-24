# Script Hub Manager

**Projet pédagogique 2025 – 2026 — Groupe 24**

Plateforme web centralisée destinée aux équipes IT (administrateurs systèmes, ingénieurs cloud, équipes DevOps et cybersécurité) pour regrouper, documenter, partager, valider et exploiter des scripts, outils et ressources techniques dans un environnement sécurisé, moderne et hautement disponible.

Projet mené dans le cadre du module *Projet pédagogique 2025/2026 - E4/E5*, en partenariat avec l'entreprise **DSPI-TECH**.

## Table des matières

- [Liens GitHub](#liens-github)
- [Remerciements](#remerciements)
- [Liste des abréviations et acronymes](#liste-des-abréviations-et-acronymes)
- [PARTIE I - INTRODUCTION GÉNÉRALE ET CADRAGE DU PROJET](#partie-i---introduction-générale-et-cadrage-du-projet)
  - [Chapitre 1 : introduction générale](#chapitre-1-introduction-générale)
  - [Chapitre 2 : contexte et cadre du projet](#chapitre-2-contexte-et-cadre-du-projet)
- [PARTIE II - CADRAGE STRATÉGIQUE ET MÉTHODOLOGIE DE GESTION DE PROJET](#partie-ii---cadrage-stratégique-et-méthodologie-de-gestion-de-projet)
  - [Chapitre 3 : Cadrage économique, périmètre et exigences du projet](#chapitre-3-cadrage-économique-périmètre-et-exigences-du-projet)
- [PARTIE III - CONCEPTION ET ARCHITECTURE DE LA SOLUTION](#partie-iii---conception-et-architecture-de-la-solution)
  - [Chapitre 4 : Conception et architecture logicielle](#chapitre-4-conception-et-architecture-logicielle)
  - [Chapitre 5 : Gestion des tâches et organisation des sprints](#chapitre-5-gestion-des-tâches-et-organisation-des-sprints)
  - [Chapitre 6 : Conception et gestion de la base de données PostgreSQL (Supabase)](#chapitre-6-conception-et-gestion-de-la-base-de-données-postgresql-supabase)
- [PARTIE IV - RÉALISATION, DÉPLOIEMENT ET INDUSTRIALISATION](#partie-iv---réalisation-déploiement-et-industrialisation)
  - [Chapitre 7 : Présentation des rendus du projet](#chapitre-7-présentation-des-rendus-du-projet)
  - [Chapitre 8 : Tests, Déploiement et Hébergement de la solution](#chapitre-8-tests-déploiement-et-hébergement-de-la-solution)
  - [Chapitre 9 : présentation détaillé du site](#chapitre-9-présentation-détaillé-du-site)
- [PARTIE V - DÉMONSTRATION ET ÉVALUATION CRITIQUE](#partie-v---démonstration-et-évaluation-critique)
  - [Chapitre 11 : Avantages, inconvénients et difficultés rencontrées](#chapitre-11-avantages-inconvénients-et-difficultés-rencontrées)
- [PARTIE VI - CONCLUSION GÉNÉRALE ET PERSPECTIVES](#partie-vi---conclusion-générale-et-perspectives)
  - [Chapitre 12 : Conclusion générale du projet](#chapitre-12-conclusion-générale-du-projet)
  - [Chapitre 13 : Ressources et bibliographie](#chapitre-13-ressources-et-bibliographie)

---

## Liens GitHub

- **Lien vers le code source du site.**

> [**Script Hub
> Manager**](https://github.com/dspitech/plg-projet-pedagogique-2026-groupe-24.git)

- **Lien vers le code de déploiement et d'hébergement.**

[**Déploiement Azure
Terraform**](https://github.com/dspitech/DeploimentAppHubScript.git)

## Remerciements

L'équipe du Groupe 24 tient à exprimer sa profonde gratitude à **M.
Mhand BOUFALA** pour son accompagnement, sa disponibilité et ses
précieux conseils tout au long de la réalisation de ce projet. Son
encadrement pédagogique, son expertise et ses orientations ont largement
contribué à la réussite de ce travail.

Nous remercions également l'ensemble du corps enseignant de **l'ESTIAM
Paris** pour la qualité des enseignements dispensés, le cadre
méthodologique mis à notre disposition ainsi que les compétences
techniques et professionnelles transmises durant notre formation.

Nos sincères remerciements s'adressent également à **DSPI-TECH**, qui
nous a offert un contexte professionnel concret ayant permis de mieux
comprendre les besoins des équipes informatiques et d'orienter le
développement de notre solution vers des problématiques réelles.

Nous souhaitons également remercier chacun des membres du **Groupe 24**
pour leur engagement, leur esprit d'équipe, leur collaboration et les
efforts fournis tout au long de ce projet.

La complémentarité de nos compétences, notre implication collective et
notre capacité à travailler ensemble ont été des éléments essentiels à
la réussite de cette réalisation.

Enfin, nous adressons nos remerciements à nos proches étudiants ainsi
qu'à toutes les personnes qui nous ont soutenus, encouragés et
accompagnés durant cette année académique. Leur confiance, leur patience
et leurs encouragements ont constitué une source de motivation tout au
long de ce parcours.

**Merci à tous**

## Liste des abréviations et acronymes

| Abréviation | Signification                                                                                                           |
|-------------|-------------------------------------------------------------------------------------------------------------------------|
| RBAC        | Role-Based Access Control (contrôle d'accès basé sur les rôles)                                                         |
| RLS         | Row Level Security (sécurité au niveau des lignes, PostgreSQL)                                                          |
| IaC         | Infrastructure as Code                                                                                                  |
| CI/CD       | Intégration continue / Déploiement continu                                                                              |
| PRA/PCA     | Plan de Reprise d'Activité / Plan de Continuité d'Activité                                                              |
| SOC         | Security Operations Center                                                                                              |
| SIEM        | Security Information and Event Management                                                                               |
| NSG         | Network Security Group                                                                                                  |
| BaaS        | Backend as a Service                                                                                                    |
| ROI         | Return On Investment                                                                                                    |
| VM          | Virtual Machine                                                                                                         |
| SPA         | Single Page Application                                                                                                 |
| API         | Application Programming Interface                                                                                       |
| REST        | Representational State Transfer                                                                                         |
| RPC         | Remote Procedure Call                                                                                                   |
| CRUD        | Create, Read, Update, Delete                                                                                            |
| SDK         | Software Development Kit                                                                                                |
| JWT         | JSON Web Token                                                                                                          |
| OTP         | One-Time Password                                                                                                       |
| MFA / 2FA   | Multi-Factor Authentication / Two-Factor Authentication                                                                 |
| SSO         | Single Sign-On                                                                                                          |
| IAM         | Identity and Access Management                                                                                          |
| CORS        | Cross-Origin Resource Sharing                                                                                           |
| CSRF        | Cross-Site Request Forgery                                                                                              |
| XSS         | Cross-Site Scripting                                                                                                    |
| SSRF        | Server-Side Request Forgery                                                                                             |
| XXE         | XML External Entity                                                                                                     |
| DDoS        | Distributed Denial of Service                                                                                           |
| WAF         | Web Application Firewall                                                                                                |
| TLS/SSL     | Transport Layer Security / Secure Sockets Layer                                                                         |
| HTTP/HTTPS  | HyperText Transfer Protocol (Secure)                                                                                    |
| DNS         | Domain Name System                                                                                                      |
| URL         | Uniform Resource Locator                                                                                                |
| UUID        | Universally Unique Identifier                                                                                           |
| CLI         | Command Line Interface                                                                                                  |
| ORM         | Object-Relational Mapping                                                                                               |
| SQL / NoSQL | Structured Query Language / Non-relational database                                                                     |
| JSON        | JavaScript Object Notation                                                                                              |
| CSV         | Comma-Separated Values                                                                                                  |
| YAML        | YAML Ain't Markup Language                                                                                              |
| PDF         | Portable Document Format                                                                                                |
| ZIP         | Zone Improvement Plan (format d'archive compressée)                                                                     |
| ARM         | Azure Resource Manager (modèle de déploiement Azure)                                                                    |
| ASVS        | Application Security Verification Standard (OWASP)                                                                      |
| OWASP       | Open Web Application Security Project                                                                                   |
| CIS         | Center for Internet Security                                                                                            |
| RGPD / GDPR | Règlement Général sur la Protection des Données / General Data Protection Regulation                                    |
| UI/UX       | User Interface / User Experience                                                                                        |
| SEO         | Search Engine Optimization                                                                                              |
| MVP         | Minimum Viable Product                                                                                                  |
| SLA         | Service Level Agreement                                                                                                 |
| STRIDE      | Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege (modèle de menaces) |

## PARTIE I - INTRODUCTION GÉNÉRALE ET CADRAGE DU PROJET

### Chapitre 1 : introduction générale

#### Vue d’ensemble 

**Script Hub Manager** est une plateforme web centralisée destinée aux
équipes IT (administrateurs systèmes, ingénieurs cloud, équipes DevOps
et cybersécurité) pour regrouper, documenter, partager, valider et
exploiter des scripts, outils et ressources techniques dans un
environnement sécurisé, moderne et hautement disponible.

Le projet est mené dans le cadre du module Projet pédagogique
2025/2026 - E4/E5, en partenariat avec l'entreprise DSPI-TECH, sur la
période janvier - septembre 2026, par une équipe de cinq étudiants
encadrés par un enseignant référent.

#### Résumé express 

- **Problème** : dispersion des scripts et outils IT sur des plateformes
  non centralisées, non sécurisées et non standardisées.

- **Solution** : Dashboard web unique (React.js + Supabase) déployé sur
  une infrastructure Azure sécurisée en haute disponibilité.

- **Impact attendu** : réduction de 30 à 40 % du temps de
  recherche/maintenance des scripts, standardisation des pratiques, ROI
  estimé entre 5 et 8 mois.

- **Périmètre technologique** : plus de 80 domaines IT couverts (Cloud,
  DevOps, Cybersécurité, Réseau, Virtualisation, Automatisation…).

### Chapitre 2 : contexte et cadre du projet

#### Présentation de l'équipe

Le projet **Script Hub Manager** a été réalisé par le **Groupe 24**, une
équipe pluridisciplinaire composée d'étudiants de la filière **CCSN** de
l'ESTIAM Paris. Chaque membre a apporté son expertise dans son domaine
de compétence, favorisant une approche collaborative et une répartition
efficace des responsabilités tout au long du projet.

L'encadrement du projet a été assuré par **M. Mhand BOUFALA**,
superviseur pédagogique à l'ESTIAM Paris, qui a accompagné l'équipe dans
les choix méthodologiques, techniques et organisationnels.

La composition de l'équipe est la suivante :

| Membre                       | Rôle                                                 | Description des responsabilités                                                                                                                                                                                                                              | Classe       |
|------------------------------|------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| **Amir Minihadji AMINA**     | Développeur & Administrateur Système                 | Participation au développement de la plateforme, mise en place et administration des environnements techniques, gestion des serveurs, des services et du déploiement de l'application.                                                                       | E5 - CCSN    |
| **LO Pape**                  | Chef de projet, Développeur Backend & Administrateur | Coordination générale du projet, planification des différentes phases, suivi des tâches de l'équipe, développement de l'architecture backend, conception des API, administration de la plateforme et supervision de l'intégration des différents composants. | E4 - CCSN    |
| **Neylie NDJUMKENG-NGUEMO**  | Architecte Logiciel                                  | Conception de l'architecture globale de la solution, définition des choix technologiques, modélisation des composants logiciels et garantie de la cohérence technique du projet.                                                                             | E4 - CCSN    |
| **Steve John BIAMOU HOUMGA** | Expert Cybersécurité                                 | Analyse des risques, définition des politiques de sécurité, mise en œuvre des mécanismes de protection, contrôle des accès, authentification et sécurisation des données de la plateforme.                                                                   | E4 - CCSN    |
| **Gauyet NGUEFACK-TCHAMI**   | Experte Cybersécurité                                | Participation à la conception de l'architecture de sécurité, réalisation des analyses de vulnérabilités, élaboration des bonnes pratiques de cybersécurité et contribution aux mécanismes de conformité et de gouvernance.                                   | E4 - CCSN    |
| **Mhand BOUFALA**            | Superviseur pédagogique                              | Accompagnement méthodologique et technique, validation des orientations du projet, suivi de l'avancement des travaux et encadrement de l'équipe durant toute la réalisation du projet.                                                                       | ESTIAM Paris |

Grâce à la complémentarité des compétences de ses membres, le Groupe 24
a pu mener à bien toutes les étapes du projet, depuis l'analyse des
besoins jusqu'à la conception, le développement, la sécurisation, le
déploiement et la validation de la solution Script Hub Manager. Cette
collaboration a permis d'allier expertise technique, organisation de
projet et bonnes pratiques en ingénierie logicielle afin de répondre
efficacement aux objectifs fixés.

#### Informations générales du projet

Cette section présente les principales informations relatives au projet
**Script Hub Manager**. Elle permet de situer le contexte de
réalisation, les technologies utilisées ainsi que les caractéristiques
générales du projet.

| **Élément**                  | **Détails**                                                                                                                                                                                                         |
|------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Titre du projet**          | Script Hub Manager                                                                                                                                                                                                  |
| **Domaine**                  | Cloud Computing, Architecture Microsoft Azure, AWS, Cybersécurité, DevOps, Administration Système et Développement Web                                                                                              |
| **Entreprise partenaire**    | DSPI-TECH                                                                                                                                                                                                           |
| **Description**              | Développement d'une plateforme centralisée permettant la gestion, le partage, le versionnement et la sécurisation des scripts, outils d'automatisation et ressources techniques destinés aux équipes informatiques. |
| **Technologies principales** | Microsoft Azure, React.js, Node.js, Docker, Linux, Azure Firewall, Azure App Service, Azure Storage, Azure Container Registry (ACR), Supabase, GitHub, GitHub Actions, Terraform, REST API                          |
| **Méthodologie**             | Gestion de projet Agile (Scrum), intégration et déploiement continus (CI/CD), développement collaboratif avec Git                                                                                                   |
| **Année académique**         | 2025 - 2026                                                                                                                                                                                                         |
| **Niveau**                   | Étudiants E4 et E5 - Filière Cloud Computing & Cyber Security Network (CCSN)                                                                                                                                        |
| **Établissement**            | ESTIAM Paris                                                                                                                                                                                                        |
| **Lieu de réalisation**      | Paris - France                                                                                                                                                                                                      |
| **Groupe**                   | Groupe 24                                                                                                                                                                                                           |
| **Nombre de membres**        | 5 étudiants                                                                                                                                                                                                         |
| **Date de début**            | Janvier 2026                                                                                                                                                                                                        |
| **Date de fin**              | Septembre 2026                                                                                                                                                                                                      |
| **Durée estimée**            | 9 mois                                                                                                                                                                                                              |
| **Encadrement**              | M. Mhand BOUFALA (Superviseur pédagogique)                                                                                                                                                                          |
| **Client / Contexte métier** | DSPI-TECH - Besoin de centraliser, sécuriser et industrialiser la gestion des scripts et ressources techniques dans un environnement cloud hybride.                                                                 |

Le projet **Script Hub Manager** s'inscrit dans une démarche de
transformation numérique des pratiques informatiques. Il vise à proposer
une plateforme moderne répondant aux exigences actuelles des équipes IT
en matière de collaboration, de sécurité, d'automatisation et de
gouvernance des ressources techniques. Sa conception repose sur des
technologies cloud natives et des pratiques DevOps afin d'assurer une
solution évolutive, performante et adaptée aux environnements
professionnels.

#### Résumé

Le projet **Script Hub Manager** est une initiative pédagogique réalisée
par le Groupe 24 dans le cadre de l'année académique **2025-2026**. Il
s'inscrit dans le cadre d'un projet de développement visant à concevoir
une plateforme centralisée dédiée à la gestion, au partage et à la
sécurisation des scripts et ressources techniques utilisés par les
équipes informatiques. Ce projet met en pratique les connaissances
acquises en développement logiciel, en architecture des systèmes
d'information, en sécurité informatique et en gestion de projet, tout en
répondant à une problématique concrète rencontrée dans les
environnements IT modernes.

#### Problématique centrale 

Dans les entreprises, les équipes informatiques s'appuient
quotidiennement sur un grand nombre de scripts, d'outils
d'automatisation, de modèles de configuration et de ressources
techniques pour administrer les infrastructures, automatiser les tâches
récurrentes et accélérer les déploiements. Cependant, ces ressources
sont souvent dispersées entre différentes plateformes telles que les
dépôts Git, les espaces de stockage partagés, les outils de
documentation, les postes de travail des collaborateurs ou encore les
plateformes cloud.

Cette dispersion crée plusieurs difficultés majeures. Les équipes
perdent un temps considérable à rechercher les scripts ou les versions
les plus récentes, ce qui réduit leur productivité et ralentit les
opérations. L'absence de centralisation favorise également la
duplication des ressources, la multiplication de versions différentes
d'un même script et le manque de visibilité sur les outils réellement
utilisés.

Sur le plan de la sécurité, cette situation représente un risque
important. Des scripts non validés, obsolètes ou insuffisamment
documentés peuvent être exécutés en production, entraînant des erreurs
de configuration, des interruptions de service ou des vulnérabilités de
sécurité. De plus, il est souvent difficile de garantir la traçabilité
des modifications, le contrôle des accès et le respect des bonnes
pratiques de gouvernance.

Cette fragmentation nuit également à la collaboration entre les équipes.
Les connaissances restent souvent dispersées ou dépendantes de certains
collaborateurs, ce qui complique le partage des bonnes pratiques,
l'intégration de nouveaux membres et la capitalisation des compétences
techniques. L'absence de processus standardisés limite la réutilisation
des ressources existantes et conduit à une perte d'efficacité globale.

Ces problématiques sont encore plus marquées dans les environnements
informatiques modernes, caractérisés par des infrastructures hybrides,
multi-cloud et multi-technologies, où coexistent différents systèmes,
langages de programmation, plateformes d'automatisation et outils
DevOps.

Concrètement, les équipes IT sont confrontées aux difficultés suivantes
:

| Problème        | Description                                                                                              |
|-----------------|----------------------------------------------------------------------------------------------------------|
| Dispersion      | Scripts, templates et procédures dispersés entre GitHub, forums, blogs et outils internes sans cohérence |
| Fiabilité       | Scripts parfois non testés, obsolètes ou incompatibles avec les environnements cibles                    |
| Documentation   | Documentation souvent incomplète, absente ou non maintenue dans le temps                                 |
| Sécurité        | Risques importants liés à l'exécution de scripts non vérifiés en environnement de production             |
| Standardisation | Difficulté à uniformiser les pratiques au sein des équipes distribuées                                   |
| Temps           | Temps considérable perdu à rechercher, tester et corriger les scripts existants                          |
| Collaboration   | Absence d'outil commun pour partager et centraliser les ressources entre équipes                         |
| Maintenance     | Complexité croissante de la mise à jour des scripts et automatisations dans le temps                     |
| Compatibilité   | Multiplication des environnements et des technologies hétérogènes difficiles à concilier                 |

Face à ces défis, il apparaît nécessaire de concevoir une solution
centralisée, sécurisée et collaborative permettant de regrouper
l'ensemble des scripts et ressources techniques au sein d'une plateforme
unique. Une telle solution doit faciliter la recherche, la validation,
le partage, le contrôle des accès, le versionnement et la réutilisation
des ressources, tout en garantissant un haut niveau de sécurité, de
gouvernance et de collaboration entre les équipes IT.

#### Objectif principal 

L'objectif principal du projet **Script Hub Manager** est de concevoir,
développer et déployer une plateforme web centralisée destinée à la
gestion des scripts, outils d'automatisation et ressources techniques
utilisés quotidiennement par les équipes informatiques. Cette plateforme
a pour vocation de devenir un référentiel unique permettant aux
administrateurs systèmes, ingénieurs cloud, experts DevOps, spécialistes
en cybersécurité et développeurs de collaborer efficacement autour d'un
patrimoine technique commun.

La solution vise à répondre aux problématiques liées à la dispersion des
ressources techniques en offrant un espace unique où les utilisateurs
peuvent stocker, organiser, documenter, rechercher, partager et
réutiliser des scripts et des outils de manière simple et sécurisée.
Elle doit également garantir la qualité des ressources mises à
disposition grâce à des mécanismes de validation, de contrôle des
versions, de gestion des droits d'accès et de traçabilité des
modifications.

Dans une logique de modernisation des pratiques IT, la plateforme
s'appuie sur une architecture cloud reposant sur Microsoft Azure et des
technologies DevOps afin d'assurer une haute disponibilité, une forte
évolutivité et une maintenance facilitée. L'intégration de mécanismes de
sécurité avancés permet de protéger les données, de contrôler les accès
selon les profils utilisateurs et de limiter les risques liés à
l'exécution de scripts non vérifiés.

Au-delà de la simple centralisation des ressources, **Script Hub
Manager** ambitionne de favoriser la collaboration entre les différentes
équipes techniques, de capitaliser les connaissances de l'entreprise et
de promouvoir la standardisation des pratiques. En facilitant le partage
des bonnes pratiques, la réutilisation des scripts validés et la
documentation des procédures, la plateforme contribue à améliorer la
productivité, la qualité des opérations et la gouvernance des systèmes
d'information.

Ainsi, le projet a pour finalité de fournir une solution moderne,
collaborative, sécurisée et évolutive, capable d'accompagner les
organisations dans la gestion de leurs ressources techniques au sein
d'environnements hybrides, multi-cloud et multi-technologies.

#### Objectifs spécifiques

| Objectif                     | Description                                                                  |
|------------------------------|------------------------------------------------------------------------------|
| Centralisation               | Dashboard unique regroupant scripts, procédures, documentations et outils IT |
| Fiabilité & sécurité         | Ressources validées, testées et sécurisées avant toute publication           |
| Collaboration                | Faciliter le partage de connaissances entre équipes IT distribuées           |
| Administration simplifiée    | Interface intuitive pour rechercher, gérer et utiliser les ressources        |
| Architecture professionnelle | Déploiement cloud moderne avec bonnes pratiques DevOps et sécurité           |
| Haute disponibilité          | Solution scalable, résiliente et hautement disponible                        |
| Multi-technologies           | Support de plusieurs environnements cloud, systèmes et outils                |
| Standardisation              | Uniformisation des pratiques et automatisations IT                           |
| Documentation                | Centralisation des guides techniques et tutoriels                            |

La plateforme couvrira plusieurs domaines technologiques : Cloud
Computing, Administration système, DevOps, Cybersécurité, Réseau,
Virtualisation, Automatisation IT, Infrastructure as Code (IaC),
Monitoring & Supervision, et Multi-Cloud.

#### Thèmes abordés

La plateforme Cloud Script Manager couvre plus de 80 domaines
technologiques, parmi lesquels :

- Linux, Windows Server, Active Directory

- PowerShell, Bash, Python Automation, Scripting avancé

- Microsoft Azure, AWS, Google Cloud Platform (GCP), Multi-Cloud

- Microsoft 365, Exchange Server, Microsoft Intune, SCCM / MECM

- Docker, Kubernetes, Docker Compose, OpenShift, Rancher

- Terraform, Ansible, Infrastructure as Code (IaC), GitOps

- DevOps, CI/CD, GitHub Actions, GitLab CI/CD, Jenkins, Azure DevOps

- Réseau, Firewall & VPN, DNS / DHCP, Reverse Proxy, SSL/TLS &
  Certificats

- Cybersécurité, Audit & Compliance, DevSecOps, Active Directory
  Security

- SIEM & Logs, Sentinel, Microsoft Defender, CrowdStrike

- Monitoring & Supervision : Grafana, Prometheus, Zabbix, Datadog,
  Elastic Stack (ELK), PRTG

- Virtualisation : VMware ESXi, Hyper-V, Proxmox

- PostgreSQL, MySQL, SQL Server, Redis

- Nginx, Apache, API & REST

- Backup & Restore, Disaster Recovery (PRA/PCA), Backup Cloud

- Cloud Security, Kubernetes Security, Linux Security, Windows Security

- FinOps / Cloud Cost Management, Monitoring Cloud, Observabilité

- AI & Automation, Azure OpenAI, MLOps

- Cisco, Fortinet, Palo Alto, pfSense, MikroTik

- Helpdesk & Support IT, SysAdmin Tools, Endpoint Management

- Storage & NAS, VPN, Office 365 Automation

#### Avantages du projet

- La plateforme centralise différents scripts, outils, templates et
  documentations IT dans un seul environnement cohérent et sécurisé.

- Elle réduit le temps de recherche et améliore significativement la
  productivité des équipes techniques.

- Les ressources sont validées, documentées et sécurisées avant toute
  utilisation en production.

- L'automatisation des tâches répétitives permet de réduire les erreurs
  humaines et d'accélérer les déploiements.

- L'application web offre une interface moderne, intuitive et
  entièrement responsive.

- L'architecture conteneurisée améliore la scalabilité, la portabilité
  et la résilience de la solution.

- La solution facilite l'intégration des pratiques DevOps et DevSecOps
  au sein des équipes.

- La standardisation des procédures améliore la qualité et la
  maintenabilité des infrastructures IT.

- La plateforme est conçue pour évoluer vers des fonctionnalités
  avancées : CI/CD intégré, GitOps, Intelligence artificielle,
  Automatisation avancée, Multi-cloud, Observabilité.

#### Solution apportée 

La solution développée dans le cadre du projet **Script Hub Manager**
est une plateforme web moderne conçue pour centraliser la gestion, le
partage et la sécurisation des scripts, outils d'automatisation et
ressources techniques utilisés par les équipes informatiques.
L'application a été développée avec **React.js**, offrant une interface
utilisateur dynamique, intuitive et réactive, afin de garantir une
expérience fluide et ergonomique pour les différents profils
d'utilisateurs.

La plateforme repose sur **Supabase** comme backend de données et
service d'authentification. Celui-ci assure la gestion sécurisée des
utilisateurs grâce à un système d'authentification robuste, complété par
un mécanisme de **Role-Based Access Control (RBAC)** permettant
d'attribuer des permissions spécifiques selon les responsabilités de
chaque utilisateur (administrateur, contributeur, lecteur, validateur,
etc.). La sécurité des données est renforcée par l'utilisation des
politiques de **Row-Level Security (RLS)**, qui limitent l'accès aux
informations en fonction des droits de chaque utilisateur et
garantissent la confidentialité des ressources.

L'infrastructure d'hébergement a été conçue selon une architecture
**Microsoft Azure Hub & Spoke**, largement utilisée dans les
environnements professionnels pour séparer les différents réseaux,
améliorer la sécurité et simplifier l'administration des infrastructures
cloud. Cette architecture assure une meilleure isolation des services
tout en facilitant leur évolutivité et leur maintenance.

Pour garantir la disponibilité et la résilience de la plateforme, le
déploiement s'appuie sur un **Azure Standard Load Balancer**, chargé de
répartir automatiquement le trafic entre deux machines virtuelles
**Ubuntu** configurées en haute disponibilité. Cette approche permet
d'assurer la continuité du service même en cas d'indisponibilité de
l'une des instances et d'améliorer les performances globales de
l'application.

La sécurité réseau est assurée par **Azure Firewall**, qui filtre le
trafic entrant et sortant selon des règles de sécurité définies, tandis
que **Azure Bastion** permet aux administrateurs d'accéder aux machines
virtuelles de manière sécurisée, directement depuis le portail Azure,
sans exposer les services SSH ou RDP sur Internet. Cette architecture
réduit considérablement la surface d'attaque et renforce la protection
de l'infrastructure.

Sur le plan fonctionnel, **Script Hub Manager** couvre plus de **80
domaines technologiques IT**, notamment l'administration système, le
Cloud Computing, les réseaux, la cybersécurité, DevOps, Kubernetes,
Docker, Microsoft Azure, Linux, Windows Server, PowerShell, Bash,
Python, Terraform, Ansible, Git, CI/CD, les bases de données, la
virtualisation et bien d'autres technologies utilisées dans les
environnements informatiques modernes.

La plateforme offre un ensemble complet de fonctionnalités destinées à
faciliter le travail des équipes techniques, notamment :

- la création, la consultation, la modification et la suppression (CRUD)
  des scripts et ressources techniques ;

- un moteur de recherche multicritère permettant de retrouver rapidement
  les contenus selon différents filtres (technologie, catégorie, auteur,
  mots-clés, date, etc.) ;

- des fonctionnalités d'importation et d'exportation de scripts et de
  documents afin de simplifier les échanges et les sauvegardes ;

- un système de documentation intégré permettant d'associer des
  descriptions, des procédures d'utilisation, des prérequis et des
  exemples d'exécution à chaque ressource ;

- une gestion avancée des utilisateurs, des rôles et des permissions
  garantissant un contrôle précis des accès ;

- un mécanisme de validation des ressources avant leur publication afin
  d'assurer leur qualité et leur conformité aux bonnes pratiques ;

- un système de journalisation (logs) assurant la traçabilité des
  actions réalisées sur la plateforme, facilitant les audits de sécurité
  et le suivi des modifications.

Grâce à cette architecture moderne, à son niveau élevé de sécurité et à
ses nombreuses fonctionnalités, **Script Hub Manager** constitue une
solution complète, collaborative et évolutive, capable de répondre aux
besoins des équipes IT souhaitant centraliser leurs connaissances
techniques, renforcer leur gouvernance et améliorer leur efficacité
opérationnelle dans des environnements cloud hybrides et
multi-technologies.

#### Valeur attendue 

Le projet **Script Hub Manager** a pour objectif de générer une réelle
valeur ajoutée pour les équipes informatiques en améliorant la gestion
des ressources techniques, la collaboration entre les différents métiers
de l'IT et la sécurité des processus d'automatisation. En centralisant
l'ensemble des scripts, outils et documentations au sein d'une
plateforme unique, la solution vise à réduire les inefficacités liées à
la dispersion des informations et à favoriser la réutilisation des
ressources existantes.

L'un des principaux bénéfices attendus est une diminution significative
du temps consacré à la recherche, à la validation et à la maintenance
des scripts techniques. Grâce à un moteur de recherche performant, à une
classification par domaines technologiques et à une documentation
centralisée, les équipes pourront accéder plus rapidement aux ressources
dont elles ont besoin. Selon les hypothèses du projet, cette
optimisation pourrait permettre une réduction d'environ **30 à 40 %** du
temps consacré à ces activités.

La plateforme contribuera également à la **standardisation des pratiques
IT** en mettant à disposition des scripts validés, documentés et
versionnés. Cette approche favorisera l'adoption de procédures homogènes
au sein des équipes, limitera la duplication des développements et
améliorera la qualité des opérations techniques réalisées sur les
infrastructures.

Sur le plan de la cybersécurité, **Script Hub Manager** renforcera la
protection des environnements informatiques grâce à des mécanismes de
contrôle d'accès basés sur les rôles (RBAC), des politiques de sécurité
des données (RLS), une authentification sécurisée et une traçabilité
complète des actions effectuées sur la plateforme. Ces fonctionnalités
permettront de réduire les risques liés à l'utilisation de scripts non
vérifiés, à la modification non autorisée des ressources ou à l'absence
de suivi des opérations.

Le projet vise également à améliorer la collaboration entre les
administrateurs systèmes, les ingénieurs cloud, les équipes DevOps, les
experts en cybersécurité et les développeurs. En partageant un
référentiel commun de connaissances techniques, les équipes pourront
capitaliser plus efficacement leur savoir-faire, faciliter l'intégration
de nouveaux collaborateurs et accélérer la résolution des incidents
ainsi que le déploiement de nouvelles solutions.

Enfin, d'un point de vue économique, l'automatisation des tâches
répétitives, la réduction des erreurs opérationnelles, la meilleure
réutilisation des scripts existants et les gains de productivité
attendus devraient permettre d'amortir l'investissement lié au
développement et au déploiement de la plateforme. Sur la base des
hypothèses retenues pour ce projet, le **retour sur investissement
(ROI)** est estimé entre **6 et 8 mois**, sous réserve d'une adoption
effective de la solution par les équipes et d'une utilisation régulière
de ses fonctionnalités.

Ainsi, **Script Hub Manager** ambitionne de devenir un véritable
référentiel technique d'entreprise, contribuant à renforcer la
productivité, la qualité des opérations, la gouvernance des ressources
informatiques et la sécurité des environnements IT dans un contexte de
transformation numérique et de généralisation des architectures cloud.


## PARTIE II - CADRAGE STRATÉGIQUE ET MÉTHODOLOGIE DE GESTION DE PROJET

### Chapitre 3 : Cadrage économique, périmètre et exigences du projet

#### Valeur économique

**1. <u>Réduction des coûts opérationnels</u>**

- **Automatisation des tâches IT**

La plateforme réduit de manière significative le temps passé par les
administrateurs à rechercher, tester et maintenir les scripts et
procédures techniques. Cette réduction est estimée entre 30 et 40 % du
temps de travail habituellement consacré à ces activités.

**b. Réduction des erreurs humaines**

En centralisant des ressources validées et documentées, la plateforme
diminue le nombre d'incidents techniques en production et les coûts
associés aux corrections et aux interruptions de service.

- **Optimisation des ressources**

Une meilleure gestion des infrastructures cloud, systèmes et services
grâce à la centralisation des outils d'automatisation permet d'optimiser
les dépenses IT et d'éviter les doublons.

- **Gain de productivité**

L'amélioration de la collaboration entre équipes techniques et l'accès
rapide aux ressources validées accélèrent les déploiements et réduisent
les cycles de livraison.

- **ROI (Retour sur investissement)**

La mise en place de la plateforme centralisée permet une réduction des
coûts à long terme. L'investissement initial couvre l'infrastructure
cloud, le développement applicatif, la mise en œuvre de la sécurité,
l'hébergement et la supervision. Le ROI est estimé entre **12 et 18
mois**, grâce aux gains de productivité mesurables et à l'automatisation
progressive des tâches IT.

#### Valeur côté marché

**1. <u>Différenciation du produit</u>**

- **Plateforme centralisée IT**

Solution unique regroupant scripts, automatisations, documentations et
outils techniques dans un seul espace unifié, accessible par toutes les
équipes de l'organisation.

- **Sécurité intégrée**

Respect rigoureux des bonnes pratiques de cybersécurité :
authentification sécurisée, contrôle d'accès basé sur les rôles (RBAC),
Row Level Security (RLS) Supabase, journalisation complète des actions.

- **Architecture scalable**

Plateforme évolutive déployée sur Azure, compatible avec des
environnements hybrides et multi-cloud, conçue pour accompagner la
croissance des organisations.

- **Support multi-domaines**

Prise en charge native de plus de 80 domaines technologiques : Cloud,
DevOps, Réseau, Cybersécurité, Virtualisation, Administration système.

**2. <u>Opportunités commerciales</u>**

**Marché cible :**

- PME et grandes entreprises avec des équipes IT distribuées

- ESN et sociétés de services numériques (SSII)

- Administrateurs systèmes et ingénieurs cloud

- Équipes DevOps et équipes cybersécurité

- Centres de formation IT et établissements académiques

#### Périmètre du projet

**Inclus dans le projet :**

- Centralisation des scripts et ressources IT dans une base de données
  PostgreSQL (Supabase)

- Développement d'un dashboard web React.js moderne et responsive

- Gestion des utilisateurs et des rôles (global_admin, admin, editor,
  reader)

- Recherche avancée et filtrage multicritères des ressources

- Documentation technique, tutoriels et guides intégrés

- Sécurisation réseau (Azure Firewall, NSG, Bastion) et applicative
  (HTTPS, RBAC, RLS)

- Déploiement cloud conteneurisé sur Azure avec Load Balancer Standard

- Supervision, journalisation et centralisation des logs

- Gestion des catégories et technologies

- Mise en place des bonnes pratiques DevOps et DevSecOps

**Hors périmètre :**

- Développement mobile natif (iOS / Android)

- Marketplace publique ouverte sans validation humaine

- Exécution automatique de scripts sans contrôle préalable

- Hébergement de contenus non vérifiés

- Gestion avancée de SOC/SIEM temps réel

- Administration complète d'infrastructures clients externes

#### Parties prenantes

| Rôle                      | Description                                                           |
|---------------------------|-----------------------------------------------------------------------|
| Équipe projet (Groupe 24) | Développement, cloud, cybersécurité, architecture et DevOps           |
| Administrateurs systèmes  | Utilisateurs finaux principaux de la plateforme                       |
| Équipes DevOps            | Utilisation des automatisations et pipelines CI/CD                    |
| Responsable sécurité      | Validation des politiques de sécurité et conformité                   |
| Développeurs Frontend     | Développement de l'interface utilisateur React.js                     |
| Développeurs Backend      | Développement des APIs et services Supabase                           |
| Architecte cloud          | Conception de l'infrastructure Azure et de l'architecture applicative |
| Chef de projet            | Coordination, suivi et planification (LO Pape)                        |
| Support IT                | Maintenance, assistance et monitoring                                 |
| Enseignant / Jury ESTIAM  | Encadrement pédagogique et évaluation académique                      |

#### Exigences fonctionnelles

| ID   | Exigence                                                                      |
|------|-------------------------------------------------------------------------------|
| EF1  | Authentification sécurisée des utilisateurs (Supabase Auth)                   |
| EF2  | Gestion des rôles et permissions (RBAC : global_admin, admin, editor, reader) |
| EF3  | Consultation, téléchargement et copie des scripts et ressources               |
| EF4  | Ajout, modification et suppression des ressources (CRUD complet)              |
| EF5  | Recherche dynamique par catégorie, technologie, tags et mot-clé               |
| EF6  | Affichage de documentations, tutoriels et guides techniques intégrés          |
| EF7  | Journalisation des actions utilisateurs (audit trail complet)                 |
| EF8  | Gestion des catégories et tags multi-technologies                             |
| EF9  | Support de plus de 80 technologies et domaines IT                             |
| EF10 | Tableau de bord d'administration avec statistiques en temps réel              |
| EF11 | Historique des modifications et versioning des ressources                     |
| EF12 | Gestion des favoris, compteurs de vues et téléchargements                     |

#### Exigences non fonctionnelles

| Critère        | Exigence                                                                                  |
|----------------|-------------------------------------------------------------------------------------------|
| Sécurité       | HTTPS obligatoire, RBAC complet, RLS Supabase, journalisation et contrôle des permissions |
| Performance    | Temps de réponse inférieur à 2 secondes pour les opérations courantes                     |
| Disponibilité  | Haute disponibilité via Load Balancer Standard (deux VMs en backend pool)                 |
| Scalabilité    | Architecture conteneurisée scalable compatible avec Azure Scale Sets                      |
| Maintenabilité | Architecture modulaire (composants React, services séparés, IaC Terraform)                |
| Portabilité    | Déploiement conteneurisé Docker compatible multi-environnements                           |
| Compatibilité  | Support des environnements cloud, hybrides et on-premise                                  |
| Observabilité  | Supervision Nginx/PM2, monitoring Azure, centralisation des logs                          |
| Résilience     | Sauvegarde Supabase, reprise après incident (PRA), failover automatique Load Balancer     |
| Extensibilité  | Architecture ouverte permettant l'ajout de nouvelles technologies et modules              |

#### Coût total estimatif du projet

L'estimation du coût du projet Script Hub Manager prend en compte les
différentes phases nécessaires à son développement, son déploiement et
son exploitation en environnement professionnel. Les coûts estimés
couvrent principalement les ressources d'infrastructure cloud, les
environnements de test, les services de production, la maintenance
technique ainsi que les actions de formation et de documentation.

L'objectif de cette estimation est d'évaluer le budget nécessaire pour
assurer le cycle de vie complet de la solution, depuis la phase de
validation du prototype jusqu'à son utilisation opérationnelle à long
terme.

| Phase / Poste                      | Description                                                                                                                                                                                                             | Coût mensuel estimé (€) | Durée estimée | Coût total estimatif (€) |
|------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------|---------------|--------------------------|
| Prototype et environnement de test | Mise en place de l'environnement initial, configuration des services cloud, déploiement des premières versions, tests fonctionnels, tests de sécurité et validation de l'architecture technique.                        | 200 - 400 € / mois      | 3 mois        | 600 - 1 200 €            |
| Environnement de production        | Déploiement de la solution en conditions réelles avec ressources Azure dimensionnées selon la charge utilisateur : machines virtuelles, stockage, réseau, sécurité, équilibrage de charge et services associés.         | 500 - 1 200 € / mois    | 6 mois        | 3 000 - 7 200 €          |
| Maintenance et support technique   | Maintenance corrective et évolutive, mises à jour des composants logiciels, supervision de l'infrastructure, sauvegardes, gestion des incidents, amélioration continue de la sécurité et optimisation des performances. | 150 - 300 € / mois      | 12 mois       | 1 800 - 3 600 €          |
| Formation et documentation         | Création de guides utilisateurs et administrateurs, rédaction de procédures techniques, préparation des supports de formation et accompagnement des utilisateurs lors de la prise en main de la plateforme.             | 50 - 150 € / mois       | 1 mois        | 50 - 150 €               |

##### Synthèse budgétaire

Le coût global estimatif du projet Script Hub Manager est évalué entre :

**5 450 € et 12 150 €**

Cette estimation inclut les principales dépenses liées à
l'infrastructure cloud, à l'exploitation de la plateforme et à son
accompagnement auprès des utilisateurs. Les variations de coût dépendent
principalement du niveau de ressources Azure nécessaires, du nombre
d'utilisateurs simultanés, du volume de données stockées ainsi que du
niveau de disponibilité et de sécurité attendu.

##### Estimation du retour sur investissement (ROI)

Le retour sur investissement du projet est estimé entre 6 et 8 mois.
Cette période d'amortissement repose sur plusieurs facteurs de gain
opérationnel :

- la réduction du temps consacré à la recherche et à la maintenance des
  scripts existants ;

- la diminution des erreurs liées à l'utilisation de scripts non
  documentés ou non validés ;

- l'amélioration de la productivité des équipes IT grâce à la
  centralisation des ressources techniques ;

- la réduction des coûts liés aux incidents, aux interventions
  répétitives et à la duplication des efforts ;

- la standardisation des pratiques d'automatisation et de gestion des
  ressources informatiques.

À moyen terme, Script Hub Manager représente donc un investissement
permettant d'améliorer l'efficacité opérationnelle des équipes IT tout
en renforçant la sécurité, la gouvernance et la qualité des processus
techniques.

## PARTIE III - CONCEPTION ET ARCHITECTURE DE LA SOLUTION

### Chapitre 4 : Conception et architecture logicielle

#### Choix technologiques

La conception de la plateforme Script Hub Manager repose sur une
sélection de technologies modernes répondant aux exigences du projet en
matière de performance, de sécurité, de maintenabilité et d'évolutivité.
Les choix technologiques ont été réalisés en tenant compte des besoins
fonctionnels de la solution, des contraintes d'un environnement cloud
hybride ainsi que des compétences attendues dans les domaines du Cloud
Computing, du DevOps et de la cybersécurité.

| Couche                 | Technologies retenues                                        | Justification du choix                                                                                                                                                                                                                                                                                                                                                                                                                |
|------------------------|--------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Frontend               | React.js                                                     | React.js a été choisi pour le développement de l'interface utilisateur grâce à son architecture basée sur des composants réutilisables, sa grande flexibilité et son écosystème mature. Cette technologie permet de concevoir une interface moderne, responsive et facilement maintenable, adaptée aux différents profils d'utilisateurs de la plateforme.                                                                            |
| Backend / BaaS         | Supabase (PostgreSQL, Authentication, Row-Level Security)    | Supabase fournit une solution Backend-as-a-Service complète reposant sur PostgreSQL. Il permet de gérer efficacement les données, l'authentification des utilisateurs ainsi que les mécanismes de sécurité avancés. L'utilisation de Row-Level Security (RLS) permet de contrôler précisément l'accès aux données selon les permissions utilisateurs, réduisant ainsi la nécessité de développer un backend entièrement personnalisé. |
| Infrastructure Cloud   | Microsoft Azure (architecture Hub & Spoke)                   | Azure a été retenu pour héberger l'infrastructure de la solution en raison de sa richesse fonctionnelle, de ses services de sécurité avancés et de son adéquation avec les compétences Cloud et DevOps développées dans le cursus E4/E5. L'architecture Hub & Spoke permet une meilleure organisation réseau, une isolation des ressources et une gestion centralisée des services de sécurité.                                       |
| Sécurité réseau        | Azure Firewall, Network Security Groups (NSG), Azure Bastion | Ces services permettent d'appliquer une stratégie de défense en profondeur. Azure Firewall assure le filtrage centralisé du trafic réseau, les NSG contrôlent les communications entre sous-réseaux et Azure Bastion sécurise les accès administrateurs aux machines virtuelles sans exposer directement les ports SSH ou RDP sur Internet.                                                                                           |
| Répartition de charge  | Azure Load Balancer Standard                                 | Le Load Balancer Standard assure la distribution du trafic entrant entre plusieurs instances applicatives. Il améliore la disponibilité de la plateforme grâce à des mécanismes de supervision et de bascule automatique en cas d'indisponibilité d'une instance.                                                                                                                                                                     |
| Système d'exploitation | Linux Ubuntu Server                                          | Ubuntu a été choisi pour les machines virtuelles hébergeant l'application en raison de sa stabilité, de sa sécurité, de son large support communautaire et de sa compatibilité avec les outils DevOps modernes. Son modèle open source permet également de maîtriser les coûts liés aux licences.                                                                                                                                     |
| Conteneurisation       | Docker                                                       | Docker permet d'encapsuler l'application et ses dépendances dans des conteneurs isolés. Cette approche garantit une meilleure portabilité, une cohérence entre les environnements de développement, de test et de production ainsi qu'une simplification des déploiements.                                                                                                                                                            |
| Infrastructure as Code | Terraform                                                    | Terraform permet d'automatiser la création et la gestion de l'infrastructure Azure sous forme de code. Cette approche améliore la reproductibilité des environnements, facilite le versioning des configurations et réduit les erreurs liées aux déploiements manuels.                                                                                                                                                                |

#### Architecture globale de la solution

L'architecture de Script Hub Manager a été conçue selon une approche
cloud moderne privilégiant la sécurité, la disponibilité et
l'évolutivité. Elle s'appuie sur Microsoft Azure pour l'hébergement de
l'application et sur Supabase pour la gestion des données et des
services d'authentification.

L'organisation générale de l'architecture est la suivante :

![Architecture globale de la solution (Azure)](media/image2.png)

Cette architecture repose sur plusieurs principes fondamentaux :

##### Haute disponibilité

Afin de garantir la continuité du service, l'application est déployée
sur deux machines virtuelles Ubuntu placées derrière un Azure Load
Balancer Standard. Le trafic utilisateur est automatiquement distribué
entre les différentes instances disponibles. En cas de panne d'une
machine virtuelle, le répartiteur de charge permet de maintenir l'accès
à la plateforme en dirigeant les requêtes vers l'instance
opérationnelle.

Cette approche limite les interruptions de service et constitue une
première étape vers une architecture plus avancée basée sur des Virtual
Machine Scale Sets ou des architectures multi-régions.

##### Défense en profondeur

La sécurité de l'infrastructure repose sur plusieurs niveaux de
protection complémentaires :

- **Azure Firewall** : placé en frontière réseau, il contrôle les flux
  entrants et sortants, applique des règles de filtrage et protège
  l'environnement contre les accès non autorisés.

- **Network Security Groups (NSG)** : utilisés au niveau des
  sous-réseaux afin de limiter précisément les communications autorisées
  entre les différents composants.

- **Azure Bastion** : fournit un accès sécurisé aux machines virtuelles
  depuis le portail Azure sans exposer publiquement les ports SSH ou
  RDP.

Cette stratégie permet de réduire la surface d'attaque et d'appliquer le
principe de moindre privilège.

##### Séparation des responsabilités

La conception de la solution distingue clairement les différentes
responsabilités techniques :

- React.js assure la gestion de l'interface utilisateur et des
  interactions côté client.

- Supabase prend en charge la gestion des utilisateurs,
  l'authentification et la protection des données.

- Azure assure l'hébergement, la sécurité réseau et la disponibilité de
  l'infrastructure.

Cette séparation facilite la maintenance et permet une évolution
indépendante des différents composants.

##### Modularité et évolutivité

L'architecture a été pensée pour permettre une évolution future de la
plateforme. Les composants peuvent être progressivement remplacés ou
renforcés afin d'accompagner une augmentation du nombre d'utilisateurs
ou du volume de ressources gérées.

Les évolutions possibles incluent :

- migration vers Azure Kubernetes Service (AKS) ;

- utilisation d'Azure Virtual Machine Scale Sets ;

- mise en place d'une architecture multi-région ;

- intégration complète d'une chaîne CI/CD DevOps.

#### Modèle de rôles applicatifs (RBAC)

La gestion des accès dans Script Hub Manager repose sur un modèle
Role-Based Access Control (RBAC) permettant d'attribuer des permissions
selon les responsabilités des utilisateurs.

Chaque utilisateur dispose d'un rôle déterminé qui définit les actions
autorisées sur les ressources de la plateforme.

| Rôle         | Droits et responsabilités                                                                                                                                                      |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| global_admin | Administration complète de la plateforme : gestion des utilisateurs, attribution des rôles, configuration globale, supervision des activités et contrôle total des ressources. |
| admin        | Gestion des ressources techniques dans son périmètre : validation des contenus, modération, gestion des catégories et supervision des contributions des utilisateurs.          |
| editor       | Création et modification des ressources : ajout de scripts, documentation technique, mise à jour des informations associées et enrichissement de la base de connaissances.     |
| reader       | Accès en lecture uniquement : consultation des scripts publiés, téléchargement des ressources autorisées et utilisation des contenus disponibles.                              |

Ce modèle RBAC est complété par les mécanismes de Row-Level Security
(RLS) fournis par Supabase afin d'assurer un contrôle plus fin au niveau
des données. Ainsi, même lorsqu'un utilisateur possède un accès à
l'application, les données auxquelles il peut accéder restent limitées
selon ses permissions.

Cette approche garantit une meilleure gouvernance des ressources, une
traçabilité renforcée et une sécurité adaptée aux environnements
professionnels.

### Chapitre 5 : Gestion des tâches et organisation des sprints

#### Introduction

La réussite du projet Script Hub Manager repose sur une organisation
efficace des activités, une bonne répartition des responsabilités et un
suivi régulier de l'avancement. En raison de la diversité des domaines
impliqués (développement web, Cloud Computing, cybersécurité,
infrastructure Azure et DevOps), l'équipe du Groupe 24 a adopté une
approche de gestion de projet structurée permettant de coordonner les
différentes missions techniques.

Pour assurer le pilotage du projet, l'équipe a choisi une approche
Agile, basée sur une organisation progressive du travail sous forme de
phases et de sprints. Cette méthode permet d'avancer par itérations, de
suivre régulièrement l'état d'avancement, d'identifier rapidement les
difficultés et d'adapter les priorités selon les besoins du projet.

L'outil **Microsoft Planner** a été utilisé comme plateforme principale
de gestion des tâches. Il a permis de centraliser le backlog,
d'attribuer les responsabilités aux membres de l'équipe, de suivre
l'évolution des tâches et de garantir une meilleure visibilité sur
l'ensemble du projet.

![Suivi des tâches avec Microsoft Planner](media/image3.png)

#### Méthodologie de gestion adoptée

Le projet Script Hub Manager s'appuie sur une organisation Agile adaptée
au contexte académique et professionnel. Contrairement à une approche
strictement linéaire, l'équipe a privilégié une progression par étapes
successives avec des objectifs précis pour chaque période de travail.

Cette organisation repose sur trois éléments principaux :

##### Le backlog produit

Le backlog représente l'ensemble des fonctionnalités, besoins techniques
et tâches nécessaires à la réalisation de la plateforme.

Chaque élément du backlog contient :

- un identifiant de tâche ;

- une description précise ;

- une priorité ;

- un responsable ;

- une estimation de charge ;

- un état d'avancement ;

- une échéance.

Les éléments du backlog ont été régulièrement réévalués afin de prendre
en compte les contraintes techniques, les retours de l'équipe et
l'évolution des besoins.

##### Les sprints

Les sprints correspondent à des périodes de travail durant lesquelles un
ensemble de tâches prioritaires est sélectionné depuis le backlog.

Chaque sprint possède :

- un objectif principal ;

- une liste de tâches associées ;

- des membres responsables ;

- des résultats attendus ;

- une validation en fin de période.

Cette organisation permet de mesurer progressivement l'avancement du
projet et de garantir une livraison continue des fonctionnalités.

##### Les revues d'avancement

À la fin de chaque sprint ou phase importante, l'équipe réalise un point
de suivi afin de :

- vérifier les objectifs atteints ;

- identifier les problèmes rencontrés ;

- ajuster les priorités ;

- mettre à jour le backlog ;

- préparer la prochaine étape du projet.

#### Utilisation de Microsoft Planner

Afin d'assurer une gestion collaborative et transparente du projet,
l'équipe a utilisé Microsoft Planner pour organiser l'ensemble des
tâches.

L'utilisation de cet outil a permis de représenter le projet sous forme
de tableau Kanban composé de plusieurs catégories :

| Liste         | Description                                               |
|---------------|-----------------------------------------------------------|
| À faire       | Tâches identifiées dans le backlog mais non commencées    |
| En cours      | Travaux actuellement réalisés par les membres de l'équipe |
| En validation | Fonctionnalités terminées nécessitant une vérification    |
| Terminé       | Tâches validées et clôturées                              |

Chaque tâche créée dans Planner pouvait contenir :

- le responsable de l'activité ;

- une description détaillée ;

- une date limite ;

- des pièces jointes ;

- des commentaires ;

- une checklist de validation.

Cette organisation a facilité la communication entre les membres de
l'équipe et a permis d'avoir une vision globale de l'état du projet.

#### Organisation des phases du projet

Le développement de Script Hub Manager a été structuré autour de huit
phases principales couvrant l'ensemble du cycle de vie du projet, depuis
l'analyse initiale jusqu'à la soutenance finale.

##### Phase 1 : Cadrage stratégique

**<u>Objectif :</u>**

Définir la vision du projet, analyser le besoin métier et établir les
bases nécessaires au développement.

Principales tâches :

- Analyse de la problématique liée à la dispersion des scripts IT ;

- Identification des utilisateurs cibles ;

- Définition des objectifs fonctionnels et techniques ;

- Analyse des contraintes de sécurité et d'infrastructure ;

- Définition du périmètre du projet ;

- Création du backlog initial.

Livrables :

- Document de cadrage ;

- Expression des besoins ;

- Planning prévisionnel ;

- Premier backlog projet.

##### Phase 2 : Modélisation et conception

**<u>Objectif</u>** :

Définir l'architecture fonctionnelle et technique de la solution.

Principales tâches :

- Conception de l'architecture globale ;

- Choix des technologies ;

- Modélisation de la base de données ;

- Définition des rôles utilisateurs ;

- Conception de l'architecture Azure ;

- Analyse des mécanismes de sécurité.

Livrables :

- Schéma d'architecture ;

- Modèle de données ;

- Modèle RBAC ;

- Documentation technique.

##### Phase 3 : Design et maquettes

**<u>Objectif</u>** :

Définir l'expérience utilisateur et concevoir les interfaces avant
développement.

Principales tâches :

- Création des maquettes graphiques ;

- Définition de la navigation ;

- Conception des interfaces React.js ;

- Validation de l'expérience utilisateur.

Livrables :

- Maquettes UI/UX ;

- Prototype des interfaces ;

- Validation du design.

##### Phase 4 : Préparation et validation technique

**<u>Objectif</u>** :

Préparer les environnements nécessaires et valider les choix techniques.

Principales tâches :

- Configuration des environnements de développement ;

- Mise en place du dépôt Git ;

- Configuration initiale Azure ;

- Préparation Supabase ;

- Validation de l'architecture ;

- Définition des standards de développement.

Livrables :

- Environnement prêt pour développement ;

- Configuration technique validée.

##### Phase 5 : Développement du MVP

**<u>Objectif</u>** :

Créer une première version fonctionnelle de la plateforme.

Principales tâches :

- Développement frontend React.js ;

- Intégration Supabase ;

- Mise en place de l'authentification ;

- Développement CRUD ;

- Gestion des rôles utilisateurs ;

- Implémentation de la recherche ;

- Gestion des scripts et ressources techniques.

Livrables :

- Version MVP fonctionnelle ;

- Première version de la plateforme.

##### Phase 6 : Tests, hébergement et déploiement Azure

**<u>Objectif</u>** :

Valider la solution et assurer son fonctionnement dans un environnement
cloud sécurisé.

Principales tâches :

- Tests fonctionnels ;

- Tests de sécurité ;

- Correction des anomalies ;

- Dockerisation de l'application ;

- Déploiement Azure ;

- Configuration :

  - Azure Firewall ;

  - Azure Load Balancer ;

  - Azure Bastion ;

  - Machines virtuelles Ubuntu.

Livrables :

- Application déployée ;

- Infrastructure Azure opérationnelle ;

- Rapport de tests.

##### Phase 7 : Clôture et livraison

**<u>Objectif :</u>**

Finaliser le projet et préparer la livraison officielle.

Principales tâches :

- Validation finale des fonctionnalités ;

- Correction des derniers problèmes ;

- Optimisation de la solution ;

- Préparation des documents utilisateurs ;

- Vérification des livrables.

Livrables :

- Version finale de Script Hub Manager ;

- Documentation technique ;

- Documentation utilisateur.

##### Phase 8 : Rapport général, bilan et soutenance

**<u>Objectif</u>** :

Présenter les résultats du projet et formaliser l'expérience acquise.

Principales tâches :

- Rédaction du rapport final ;

- Analyse des choix techniques ;

- Présentation des résultats ;

- Réalisation du bilan projet ;

- Préparation de la soutenance.

Livrables :

- Rapport final ;

- Support de présentation ;

- Démonstration de la plateforme.

#### Bilan de l'organisation projet

L'utilisation combinée de Microsoft Planner, du backlog et de
l'organisation en sprints a permis au Groupe 24 de structurer
efficacement le développement de Script Hub Manager.

Cette méthode a apporté plusieurs bénéfices :

- meilleure visibilité sur l'avancement du projet ;

- répartition claire des responsabilités ;

- réduction des risques liés aux retards ;

- amélioration de la communication entre les membres ;

- suivi continu des objectifs ;

- adaptation rapide face aux contraintes techniques.

Grâce à cette organisation, l'équipe a pu assurer une progression
maîtrisée du projet, depuis la définition du besoin jusqu'au déploiement
d'une solution cloud sécurisée répondant aux objectifs fixés.

### Chapitre 6 : Conception et gestion de la base de données PostgreSQL (Supabase)

#### Introduction

Dans le cadre du projet **Script Hub Manager**, la gestion des données
représente un élément central de l'architecture de la solution. La
plateforme doit permettre aux équipes IT de centraliser, organiser et
partager différentes ressources techniques telles que des scripts, des
documentations, des catégories technologiques et des informations liées
aux utilisateurs.

Afin de répondre à ces besoins, l'équipe a choisi d'utiliser
**Supabase** comme solution Backend-as-a-Service (BaaS). Supabase repose
sur une base de données relationnelle **PostgreSQL** et fournit
plusieurs services complémentaires comme l'authentification, la gestion
des utilisateurs, le stockage de fichiers et les mécanismes de sécurité
avancés.

Ce choix permet de réduire la complexité du développement backend tout
en bénéficiant d'une base de données robuste, performante et adaptée aux
environnements professionnels.

#### Présentation de Supabase

Supabase est une plateforme open source proposant un ensemble de
services backend prêts à l'emploi autour de PostgreSQL.

Dans le projet **Script Hub Manager**, Supabase est utilisé pour :

- stocker les données applicatives ;

- gérer l'authentification des utilisateurs ;

- contrôler les accès aux données ;

- stocker les ressources associées aux scripts ;

- assurer la traçabilité des actions réalisées sur la plateforme.

L'utilisation de Supabase permet d'obtenir une architecture simplifiée :

#### Choix de PostgreSQL

Le choix de PostgreSQL comme moteur de base de données repose sur
plusieurs critères :

- **Robustesse et fiabilité**

PostgreSQL est un système de gestion de base de données relationnelle
reconnu pour sa stabilité et son utilisation dans des environnements
professionnels critiques.

- **Modèle relationnel adapté**

Le projet manipule plusieurs entités liées entre elles :

- utilisateurs ;

- rôles ;

- scripts ;

- catégories ;

- ressources ;

- journaux d'audit.

Le modèle relationnel permet de garantir la cohérence des données grâce
aux contraintes :

- clés primaires ;

- clés étrangères ;

- contraintes d'intégrité.

<!-- -->

- **Sécurité avancée**

PostgreSQL fournit plusieurs mécanismes de sécurité utilisés dans le
projet :

- gestion des rôles ;

- contrôle des permissions ;

- chiffrement des connexions ;

- Row-Level Security.

#### Architecture de la base de données

La base de données de **Script Hub Manager** a été conçue selon une
approche relationnelle permettant d'organiser efficacement les
informations manipulées par la plateforme.

L'architecture logique repose sur plusieurs tables principales.

Voici la base de données :

> CREATE TABLE public.profiles (
>
>   id uuid NOT NULL,
>
>   name text NOT NULL DEFAULT ''::text,
>
>   email text NOT NULL,
>
>   is_active boolean NOT NULL DEFAULT true,
>
>   is_suspended boolean NOT NULL DEFAULT false,
>
>   must_change_password boolean NOT NULL DEFAULT false,
>
>   last_login timestamp with time zone,
>
>   created_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   updated_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   first_name text,
>
>   profession text,
>
>   bio text,
>
>   phone text,
>
>   avatar_url text,
>
>   address text,
>
>   city text,
>
>   country text,
>
>   status text NOT NULL DEFAULT 'active'::text,
>
>   CONSTRAINT profiles_pkey PRIMARY KEY (id),
>
>   CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES
> auth.users(id)
>
> );
>
> CREATE TABLE public.user_roles (
>
>   id uuid NOT NULL DEFAULT gen_random_uuid(),
>
>   user_id uuid NOT NULL,
>
>   role USER-DEFINED NOT NULL,
>
>   created_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   CONSTRAINT user_roles_pkey PRIMARY KEY (id),
>
>   CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES
> auth.users(id)
>
> );
>
> CREATE TABLE public.permissions (
>
>   id uuid NOT NULL DEFAULT gen_random_uuid(),
>
>   resource text NOT NULL,
>
>   action text NOT NULL CHECK (action = ANY (ARRAY\['create'::text,
> 'read'::text, 'update'::text, 'delete'::text\])),
>
>   description text,
>
>   created_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   CONSTRAINT permissions_pkey PRIMARY KEY (id)
>
> );
>
> CREATE TABLE public.role_permissions (
>
>   role USER-DEFINED NOT NULL,
>
>   permission_id uuid NOT NULL,
>
>   CONSTRAINT role_permissions_pkey PRIMARY KEY (role, permission_id),
>
>   CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY
> (permission_id) REFERENCES public.permissions(id)
>
> );
>
> CREATE TABLE public.audit_logs (
>
>   id uuid NOT NULL DEFAULT gen_random_uuid(),
>
>   user_id uuid,
>
>   user_email text,
>
>   action text NOT NULL,
>
>   resource text NOT NULL,
>
>   resource_id text,
>
>   details jsonb DEFAULT '{}'::jsonb,
>
>   ip_address text,
>
>   user_agent text,
>
>   created_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   category text NOT NULL DEFAULT 'system'::text,
>
>   CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
>
>   CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES
> auth.users(id)
>
> );
>
> CREATE TABLE public.categories (
>
>   id uuid NOT NULL DEFAULT gen_random_uuid(),
>
>   name text NOT NULL,
>
>   description text,
>
>   color text NOT NULL DEFAULT '#3b82f6'::text,
>
>   icon text NOT NULL DEFAULT 'Folder'::text,
>
>   status USER-DEFINED NOT NULL DEFAULT 'active'::category_status,
>
>   is_visible boolean NOT NULL DEFAULT true,
>
>   type text,
>
>   position integer NOT NULL DEFAULT 0,
>
>   created_by uuid,
>
>   created_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   updated_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   CONSTRAINT categories_pkey PRIMARY KEY (id),
>
>   CONSTRAINT categories_created_by_fkey FOREIGN KEY (created_by)
> REFERENCES auth.users(id)
>
> );
>
> CREATE TABLE public.scripts (
>
>   id uuid NOT NULL DEFAULT gen_random_uuid(),
>
>   name text NOT NULL,
>
>   description text CHECK (description IS NULL OR length(description)
> \<= 5000),
>
>   script_type USER-DEFINED NOT NULL DEFAULT 'powershell'::script_type,
>
>   content text NOT NULL DEFAULT ''::text CHECK (content IS NULL OR
> length(content) \<= 200000),
>
>   features text,
>
>   prerequisites text,
>
>   usage_example text,
>
>   screenshots ARRAY NOT NULL DEFAULT '{}'::text\[\],
>
>   criticality USER-DEFINED NOT NULL DEFAULT
> 'medium'::script_criticality,
>
>   version text NOT NULL DEFAULT '1.0.0'::text,
>
>   status USER-DEFINED NOT NULL DEFAULT 'draft'::script_status,
>
>   tags ARRAY NOT NULL DEFAULT '{}'::text\[\],
>
>   category_id uuid,
>
>   author_id uuid,
>
>   license text,
>
>   language text,
>
>   compatibility text,
>
>   dependencies text,
>
>   documentation text CHECK (documentation IS NULL OR
> length(documentation) \<= 100000),
>
>   version_history jsonb NOT NULL DEFAULT '\[\]'::jsonb,
>
>   downloads_count integer NOT NULL DEFAULT 0,
>
>   views_count integer NOT NULL DEFAULT 0,
>
>   average_rating numeric NOT NULL DEFAULT 0,
>
>   favorites_count integer NOT NULL DEFAULT 0,
>
>   visibility USER-DEFINED NOT NULL DEFAULT
> 'private'::script_visibility,
>
>   is_validated boolean NOT NULL DEFAULT false,
>
>   created_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   updated_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   likes_count integer NOT NULL DEFAULT 0,
>
>   shares_count integer NOT NULL DEFAULT 0,
>
>   CONSTRAINT scripts_pkey PRIMARY KEY (id),
>
>   CONSTRAINT scripts_category_id_fkey FOREIGN KEY (category_id)
> REFERENCES public.categories(id)
>
> );
>
> CREATE TABLE public.resources (
>
>   id uuid NOT NULL DEFAULT gen_random_uuid(),
>
>   name text NOT NULL,
>
>   description text,
>
>   resource_type USER-DEFINED NOT NULL DEFAULT 'link'::resource_type,
>
>   url text,
>
>   file_path text,
>
>   file_size bigint,
>
>   mime_type text,
>
>   category_id uuid,
>
>   tags ARRAY NOT NULL DEFAULT '{}'::text\[\],
>
>   visibility USER-DEFINED NOT NULL DEFAULT
> 'public'::resource_visibility,
>
>   status USER-DEFINED NOT NULL DEFAULT 'active'::resource_status,
>
>   criticality USER-DEFINED NOT NULL DEFAULT
> 'medium'::resource_criticality,
>
>   language text,
>
>   author_id uuid,
>
>   views_count integer NOT NULL DEFAULT 0,
>
>   downloads_count integer NOT NULL DEFAULT 0,
>
>   favorites_count integer NOT NULL DEFAULT 0,
>
>   version text NOT NULL DEFAULT '1.0.0'::text,
>
>   is_featured boolean NOT NULL DEFAULT false,
>
>   thumbnail_url text,
>
>   created_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   updated_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   CONSTRAINT resources_pkey PRIMARY KEY (id),
>
>   CONSTRAINT resources_category_id_fkey FOREIGN KEY (category_id)
> REFERENCES public.categories(id)
>
> );
>
> CREATE TABLE public.trash_items (
>
>   id uuid NOT NULL DEFAULT gen_random_uuid(),
>
>   resource_type text NOT NULL,
>
>   resource_id text NOT NULL,
>
>   payload jsonb NOT NULL,
>
>   deleted_by uuid,
>
>   deleted_by_email text,
>
>   reason text,
>
>   created_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   CONSTRAINT trash_items_pkey PRIMARY KEY (id)
>
> );
>
> CREATE TABLE public.archived_logs (
>
>   id uuid NOT NULL,
>
>   user_id uuid,
>
>   user_email text,
>
>   action text NOT NULL,
>
>   resource text NOT NULL,
>
>   resource_id text,
>
>   category text NOT NULL DEFAULT 'system'::text,
>
>   details jsonb DEFAULT '{}'::jsonb,
>
>   ip_address text,
>
>   user_agent text,
>
>   original_created_at timestamp with time zone NOT NULL,
>
>   archived_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   CONSTRAINT archived_logs_pkey PRIMARY KEY (id)
>
> );
>
> CREATE TABLE public.contact_messages (
>
>   id uuid NOT NULL DEFAULT gen_random_uuid(),
>
>   name text NOT NULL,
>
>   email text NOT NULL,
>
>   subject text NOT NULL,
>
>   category text NOT NULL DEFAULT 'general'::text,
>
>   phone text,
>
>   company text,
>
>   message text NOT NULL,
>
>   status text NOT NULL DEFAULT 'new'::text,
>
>   ip_address text,
>
>   user_agent text,
>
>   created_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   updated_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   CONSTRAINT contact_messages_pkey PRIMARY KEY (id)
>
> );
>
> CREATE TABLE public.script_likes (
>
>   id uuid NOT NULL DEFAULT gen_random_uuid(),
>
>   script_id uuid NOT NULL,
>
>   user_id uuid,
>
>   created_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   guest_id uuid,
>
>   CONSTRAINT script_likes_pkey PRIMARY KEY (id),
>
>   CONSTRAINT script_likes_guest_id_fkey FOREIGN KEY (guest_id)
> REFERENCES public.guest_users(id)
>
> );
>
> CREATE TABLE public.script_shares (
>
>   id uuid NOT NULL DEFAULT gen_random_uuid(),
>
>   script_id uuid NOT NULL,
>
>   user_id uuid,
>
>   channel text NOT NULL DEFAULT 'link'::text,
>
>   created_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   ip_address text,
>
>   guest_id uuid,
>
>   CONSTRAINT script_shares_pkey PRIMARY KEY (id),
>
>   CONSTRAINT script_shares_guest_id_fkey FOREIGN KEY (guest_id)
> REFERENCES public.guest_users(id)
>
> );
>
> CREATE TABLE public.guest_users (
>
>   id uuid NOT NULL DEFAULT gen_random_uuid(),
>
>   pseudo text NOT NULL CHECK (char_length(pseudo) \>= 6 AND
> char_length(pseudo) \<= 30),
>
>   pseudo_lower text DEFAULT lower(pseudo) UNIQUE,
>
>   ip_address text,
>
>   user_agent text,
>
>   created_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   last_seen_at timestamp with time zone NOT NULL DEFAULT now(),
>
>   CONSTRAINT guest_users_pkey PRIMARY KEY (id)
>
> );

Le choix de **PostgreSQL via Supabase** a permis de construire une base
de données moderne, sécurisée et adaptée aux besoins de **Script Hub
Manager**.

Grâce à l'association entre PostgreSQL, Supabase Auth et Row-Level
Security, la plateforme bénéficie d'une gestion fine des permissions,
d'une meilleure protection des données et d'une architecture facilement
évolutive.

Cette solution constitue un élément essentiel de l'architecture globale,
en assurant la centralisation, la fiabilité et la sécurité des
ressources techniques utilisées par les équipes IT.

## PARTIE IV - RÉALISATION, DÉPLOIEMENT ET INDUSTRIALISATION

### Chapitre 7 : Présentation des rendus du projet

#### Introduction

Dans le cadre de la réalisation du projet **Script Hub Manager**,
plusieurs rendus intermédiaires ont été produits afin de suivre
l'évolution du projet et de valider progressivement les différentes
étapes de conception, de développement, de déploiement et de
sécurisation de la solution.

Ces rendus représentent les différentes phases du cycle de vie du
projet, depuis l'étude initiale du besoin jusqu'à la mise en place d'une
architecture Cloud professionnelle intégrant des mécanismes avancés de
sécurité, d'automatisation et de supervision.

Chaque rendu a permis de formaliser les travaux réalisés, de documenter
les choix techniques effectués et de démontrer l'évolution de la
plateforme selon les objectifs définis dans le cahier des charges.

L'ensemble des livrables couvre les principaux domaines suivants :

- analyse fonctionnelle et conception ;

- architecture logicielle et réseau ;

- développement frontend et backend ;

- gestion des utilisateurs et des permissions ;

- déploiement Cloud Azure ;

- cybersécurité et audit ;

- industrialisation DevOps.

#### Rendus

##### Rendu N°1 - Cahier des charges et document de présentation

- **<u>Objectif du rendu</u>**

Le premier rendu constitue la phase de lancement du projet. Il a pour
objectif de présenter le contexte général, d'identifier la problématique
à résoudre et de définir les objectifs ainsi que le périmètre
fonctionnel de la solution.

- **<u>Travaux réalisés</u>**

Durant cette phase, l'équipe a réalisé :

- l'analyse du contexte métier ;

- l'identification de la problématique liée à la dispersion des scripts
  et ressources IT ;

- la définition des objectifs du projet ;

- la présentation de la solution proposée ;

- la présentation des membres de l'équipe et de leurs rôles ;

- l'identification des technologies envisagées ;

- la définition de l'organisation projet.

<!-- -->

- **<u>Livrables produits</u>**

<!-- -->

- Cahier des charges ;

- Document de présentation du projet ;

- Description des besoins fonctionnels et techniques.

<!-- -->

- **<u>Résultat obtenu</u>**

Ce rendu a permis de poser les bases du projet et de fournir une vision
claire de la solution **Script Hub Manager**, de ses objectifs et de sa
valeur ajoutée pour les équipes IT.

##### Rendus N°2 et N°3 - Analyse fonctionnelle et conception de la solution

- **<u>Objectif des rendus</u>**

Les deuxième et troisième rendus correspondent à la phase d'étude et de
conception. Leur objectif principal est de transformer les besoins
identifiés en une architecture fonctionnelle et technique détaillée.

- **<u>Analyse fonctionnelle</u>**

Les travaux réalisés comprennent :

- identification des acteurs du système ;

- définition des fonctionnalités principales ;

- création des cas d'utilisation ;

- rédaction des scénarios détaillés pour chaque fonctionnalité.

Les principaux acteurs identifiés sont :

- administrateur global ;

- administrateur ;

- éditeur ;

- utilisateur lecteur.

<!-- -->

- **<u>Modélisation UML</u>**

Afin de représenter le fonctionnement de la plateforme, plusieurs
diagrammes ont été réalisés :

- **Diagrammes de cas d'utilisation**

Ils permettent de représenter les interactions entre les utilisateurs et
la plateforme ainsi que les fonctionnalités accessibles selon les rôles.

- Utilisateur

![Diagramme de cas d'utilisation – Utilisateur](media/image4.png)

- Administrateur

![Diagramme de cas d'utilisation – Administrateur](media/image5.png)

- Cloud Azure

![Diagramme de cas d'utilisation – Cloud Azure](media/image6.png)

- Système de sécurité

![Diagramme de cas d'utilisation – Système de sécurité](media/image7.png)

- **Diagrammes d'activité**

Ils décrivent le déroulement des processus métiers et les différentes
étapes nécessaires à l'exécution d'une action.

Par exemple :

![Exemple de diagramme d'activité](media/image8.png)

- **Diagrammes de séquence**

Ils représentent les échanges entre les différents composants du système
lors de l'exécution d'une fonctionnalité.

Par exemple :

![Exemple de diagramme de séquence](media/image9.png)

- **Conception de la base de données**

Un travail de modélisation des données a également été effectué avec :

- conception du modèle conceptuel de données (MCD) ;

- définition des entités principales ;

- identification des relations entre les tables ;

- préparation de l'intégration PostgreSQL via Supabase.

<!-- -->

- **Conception des interfaces**

Une première version des interfaces utilisateur a été réalisée afin de
définir :

- l'organisation des pages ;

- la navigation ;

- l'expérience utilisateur ;

- la structure générale de la plateforme.

<!-- -->

- **Architecture technique**

Cette étape comprend également :

- définition de l'architecture réseau ;

- conception de l'architecture Cloud ;

- plan d'adressage réseau ;

- choix des environnements techniques ;

- identification des outils nécessaires au déploiement.

<!-- -->

- **Livrables produits**

<!-- -->

- Cas d'utilisation ;

- Scénarios fonctionnels ;

- Diagrammes UML ;

- Modèle de données ;

- Maquettes UI/UX ;

- Architecture réseau ;

- Documentation technique.

##### Rendu N°4 - Développement du MVP et fonctionnalités applicatives

- **<u>Objectif du rendu</u>**

Le quatrième rendu marque le début de la phase de développement.
L'objectif était de transformer les conceptions réalisées précédemment
en une première version fonctionnelle de la plateforme.

- **<u>Travaux réalisés</u>**

Les principales fonctionnalités développées sont :

- **Mise en place du frontend**

<!-- -->

- Initialisation du projet React.js ;

- Création des composants réutilisables ;

- Développement des interfaces principales ;

- Mise en place de la navigation.

<!-- -->

- **Intégration Supabase**

Le choix de Supabase a permis d'intégrer :

- PostgreSQL pour la gestion des données ;

- Auth pour l'authentification ;

- Row-Level Security pour la protection des données.

<!-- -->

- **Gestion des utilisateurs**

Développement :

- système d'inscription et connexion ;

- gestion des administrateurs ;

- gestion des rôles utilisateurs.

<!-- -->

- **Gestion des ressources techniques**

Mise en place :

- création des catégories ;

- création des scripts ;

- modification des ressources ;

- suppression des éléments ;

- consultation des contenus.

<!-- -->

- **Journalisation**

Début de l'intégration :

- page Logs & Audits ;

- suivi des actions utilisateurs.

<!-- -->

- **Livrables produits**

<!-- -->

- Première version fonctionnelle de Script Hub Manager ;

- Interface utilisateur développée ;

- Authentification opérationnelle ;

- Gestion des ressources.

##### Rendu N°5 - Architecture Cloud Azure et amélioration de la plateforme

- **<u>Objectif du rendu</u>**

Le cinquième rendu représente une étape majeure du projet avec
l'intégration d'une infrastructure Cloud complète et l'amélioration
avancée des fonctionnalités applicatives.

L'objectif était de rendre la plateforme plus sécurisée, disponible et
proche d'un environnement professionnel.

- **<u>Infrastructure Azure mise en place</u>**

L'architecture déployée repose sur :

- Microsoft Azure ;

- Architecture Hub & Spoke ;

- Terraform pour l'Infrastructure as Code ;

- Azure Firewall ;

- Azure Bastion ;

- Azure Load Balancer Standard ;

- Deux machines virtuelles Ubuntu en haute disponibilité.

Cette architecture permet :

- une meilleure isolation réseau ;

- une protection renforcée ;

- une haute disponibilité ;

- une gestion automatisée de l'infrastructure.

<!-- -->

- **Évolutions applicatives réalisées**

Les améliorations principales sont :

- refonte complète de la page Ressources ;

- amélioration de la gestion des utilisateurs ;

- sécurisation de l'inscription ;

- ajout de la fonction SQL global_admin_exists() ;

- gestion de la délégation du rôle global_admin ;

- création d'une page Archives ;

- mise en place d'une corbeille universelle ;

- création d'un système global Logs & Audit ;

- correction des politiques RLS ;

- ajout de nouvelles pages publiques :

  - Scripts ;

  - Catégories ;

  - Ressources ;

  - Contact ;

  - Présentation.

<!-- -->

- **Livrables produits**

<!-- -->

- Infrastructure Azure opérationnelle ;

- Nouvelle version applicative ;

- Documentation technique Cloud.

##### Rendu N°6 - Audit de sécurité et tests d'intrusion

- **<u>Objectif du rendu</u>**

Le sixième rendu avait pour objectif d'évaluer la sécurité globale de la
plateforme à travers une démarche professionnelle d'audit.

L'objectif était d'identifier les vulnérabilités, mesurer leurs impacts
et appliquer des mesures correctives.

- **<u>Méthodologie utilisée</u>**

L'audit a été réalisé selon une approche :

**Pentest boîte grise**

avec :

- accès au code source ;

- comptes utilisateurs de test ;

- analyse de l'application.

<!-- -->

- **<u>Référentiels utilisés</u>**

L'analyse s'est basée sur :

- OWASP Top 10 2021 ;

- OWASP ASVS niveau 2 ;

- CIS PostgreSQL Benchmark ;

- recommandations RGPD.

<!-- -->

- **Travaux réalisés**

Les actions effectuées :

- identification des vulnérabilités ;

- analyse des risques ;

- exploitation contrôlée des failles ;

- correction des problèmes détectés ;

- validation des correctifs ;

- recommandations d'amélioration.

<!-- -->

- **<u>Résultats</u>**

Cet audit a permis :

- d'améliorer la sécurité applicative ;

- de renforcer la protection des données ;

- de réduire la surface d'attaque ;

- d'améliorer la conformité de la plateforme.

##### Rendu N°7 - Industrialisation DevOps, supervision et optimisation

- **<u>Objectif du rendu</u>**

Le dernier rendu vise à améliorer la qualité globale de la solution en
renforçant la maintenabilité, l'automatisation et la supervision.

- **<u>Optimisation du code applicatif</u>**

Travaux réalisés :

- restructuration de l'arborescence frontend ;

- organisation du code selon une approche feature-based ;

- amélioration de la maintenabilité ;

- vérification de l'absence de régression.

<!-- -->

- **<u>Industrialisation Cloud et DevOps</u>**

Mise en place :

- modules Terraform réutilisables ;

- automatisation du provisioning avec cloud-init ;

- pipeline CI/CD GitHub Actions ;

- automatisation des déploiements ;

- supervision avec Prometheus et Grafana.

<!-- -->

- **<u>Résultats obtenus</u>**

Cette phase a permis d'obtenir une plateforme :

- plus maintenable ;

- plus automatisée ;

- plus observable ;

- plus résiliente ;

- mieux adaptée aux environnements professionnels.

##### Synthèse des rendus

Les différents rendus réalisés durant le projet illustrent l'évolution
complète de **Script Hub Manager**, depuis l'analyse du besoin jusqu'à
la mise en place d'une solution Cloud sécurisée et industrialisée.

| Rendu      | Domaine principal                                |
|------------|--------------------------------------------------|
| Rendu 1    | Cadrage et définition du projet                  |
| Rendus 2-3 | Analyse fonctionnelle et conception              |
| Rendu 4    | Développement MVP                                |
| Rendu 5    | Infrastructure Azure et fonctionnalités avancées |
| Rendu 6    | Audit cybersécurité                              |
| Rendu 7    | DevOps, automatisation et supervision            |

Cette progression démontre une approche complète couvrant les
différentes dimensions d'un projet informatique professionnel :
développement logiciel, architecture Cloud, cybersécurité,
administration système et pratiques DevOps.

##### Répartition estimative du projet par rendu

| Rendu             | Domaine                                                                                 | Pourcentage |
|-------------------|-----------------------------------------------------------------------------------------|-------------|
| Rendu N°1         | Cahier des charges et présentation du projet                                            | **10 %**    |
| Rendus N°2 et N°3 | Analyse fonctionnelle, conception, UML, base de données, architecture et maquettes      | **20 %**    |
| Rendu N°4         | Développement du MVP et fonctionnalités applicatives                                    | **25 %**    |
| Rendu N°5         | Infrastructure Azure, sécurité réseau, haute disponibilité et enrichissement applicatif | **25 %**    |
| Rendu N°6         | Audit cybersécurité, Pentest et remédiation                                             | **12 %**    |
| Rendu N°7         | DevOps, CI/CD, Terraform, supervision et optimisation                                   | **8 %**     |
| Total             |                                                                                         | **100 %**   |

##### Répartition de l'effort de réalisation par rendu

La répartition de l'effort du projet **Script Hub Manager** montre une
progression logique entre les différentes étapes de réalisation.

Les premiers rendus représentent les phases d'analyse et de conception,
avec environ **30 % de l'effort total**, correspondant à l'étude des
besoins, la modélisation UML, la conception de la base de données,
l'architecture réseau et la préparation des interfaces.

La phase de développement du MVP représente **25 % de la charge
globale**, car elle constitue le cœur de la réalisation applicative avec
le développement frontend React.js, l'intégration Supabase, la gestion
des utilisateurs et les fonctionnalités principales de la plateforme.

Le rendu N°5 représente également **25 % de l'effort total**, en raison
de la complexité de la mise en place de l'infrastructure Cloud Azure.
Cette étape comprend l'architecture Hub & Spoke, Terraform, Azure
Firewall, Azure Bastion, Load Balancer et la haute disponibilité des
machines virtuelles.

Les phases de sécurité et d'industrialisation représentent
respectivement **12 % et 8 %**. Elles correspondent à l'audit
cybersécurité, aux tests d'intrusion, à la correction des vulnérabilités
ainsi qu'à la mise en place des pratiques DevOps comme le CI/CD, la
supervision et l'automatisation.

Cette répartition met en évidence que le projet ne se limite pas au
développement d'une application web, mais couvre l'ensemble du cycle de
vie d'une solution professionnelle : conception, développement,
déploiement Cloud, sécurisation et exploitation.

### Chapitre 8 : Tests, Déploiement et Hébergement de la solution

#### Introduction

Dans le cadre du projet **Script Hub Manager**, une phase importante a
été consacrée au déploiement de la plateforme dans un environnement
Cloud professionnel basé sur **Microsoft Azure**.

L'objectif principal de cette étape était de mettre en place une
infrastructure capable de répondre aux exigences suivantes :

- assurer la disponibilité de l'application ;

- sécuriser les communications réseau ;

- protéger les accès administrateurs ;

- automatiser le déploiement de l'infrastructure ;

- garantir la supervision des services ;

- préparer l'évolution future de la plateforme.

Pour atteindre ces objectifs, une architecture Cloud basée sur le modèle
**Azure Hub & Spoke** a été mise en œuvre. Cette architecture intègre
plusieurs services Azure :

- Azure Load Balancer Standard ;

- Azure Firewall ;

- Azure Bastion ;

- deux machines virtuelles Ubuntu en haute disponibilité ;

- Network Security Groups (NSG) ;

- VNet Peering ;

- User Defined Routes (UDR) ;

- Terraform pour l'Infrastructure as Code ;

- Supabase PostgreSQL comme backend Cloud ;

- Prometheus et Grafana pour la supervision.

Voici quelques captures du déploiement dans azure :

- Groupe de ressources & ressources

![Azure – Groupe de ressources (1)](media/image10.png)

![Azure – Groupe de ressources (2)](media/image11.png)

- Load Balancer

![Azure – Load Balancer](media/image12.png)

- Les 3 VMs

![Azure – Les 3 machines virtuelles](media/image13.png)

- Dashboard Grafana

![Dashboard Grafana (1)](media/image14.png)

![Dashboard Grafana (2)](media/image15.png)

- Prometheus

![Dashboard Prometheus](media/image16.png)

#### Objectifs du déploiement

Les objectifs principaux de cette phase sont :

- **Haute disponibilité**

Garantir que l'application reste accessible même en cas de panne d'une
machine virtuelle grâce à :

- deux VM Ubuntu ;

- un Load Balancer Standard ;

- un système de Health Probe automatique.

  - **Sécurité réseau**

Mettre en place une défense en profondeur grâce à :

- Azure Firewall ;

- NSG ;

- Azure Bastion ;

- segmentation réseau ;

- absence d'exposition directe des VM sur Internet.

  - **Automatisation**

Déployer automatiquement l'infrastructure grâce à :

- Terraform ;

- cloud-init ;

- scripts d'installation automatisés.

  - **Supervision**

Surveiller l'état de l'infrastructure et des applications grâce à :

- Prometheus ;

- Grafana.

##### Architecture globale de déploiement

![Architecture globale de déploiement (Hub & Spoke)](media/image17.png)

L'architecture déployée repose sur un modèle **Hub & Spoke**.

Elle permet de séparer les responsabilités :

- le Hub centralise les services réseau et de sécurité ;

- les Spokes permettent l'isolation et l'évolution future de
  l'environnement.

#### Pourquoi le choix d'une architecture Hub & Spoke ?

L'architecture Hub & Spoke est un modèle réseau recommandé dans les
environnements Microsoft Azure professionnels.

Elle repose sur deux concepts :

- Hub : réseau central de contrôle

- Spokes : réseaux applicatifs isolés

**<u>Centralisation de la sécurité</u>**

Le Hub contient les composants critiques :

- Azure Firewall ;

- Azure Bastion ;

- routage ;

- règles de sécurité.

Cette organisation permet d'avoir un point unique de contrôle du trafic
réseau.

**<u>Isolation des environnements</u>**

Les Spokes permettent :

- de séparer les applications ;

- d'isoler les environnements ;

- de limiter les impacts en cas d'incident.

Cette approche facilite également l'ajout futur :

- d'un environnement de test ;

- d'un environnement production ;

- d'autres applications internes.

**<u>Sécurité renforcée</u>**

Les communications entre réseaux sont contrôlées grâce à :

- Azure Firewall ;

- UDR ;

- VNet Peering.

Les flux réseau ne circulent donc pas directement entre les
environnements.

#### Machines virtuelles Ubuntu

Deux machines virtuelles ont été déployées.

| Paramètre   | VM-SPOKE-1              | VM-SPOKE-2              |
|-------------|-------------------------|-------------------------|
| OS          | Ubuntu Server 22.04 LTS | Ubuntu Server 22.04 LTS |
| Taille      | Standard B2s            | Standard B2s            |
| CPU         | 2 vCPU                  | 2 vCPU                  |
| RAM         | 4 Go                    | 4 Go                    |
| Accès       | Azure Bastion           | Azure Bastion           |
| IP publique | Aucune                  | Aucune                  |

Chaque VM contient :

- Nginx ;

- Node.js ;

- PM2 ;

- application React/Vite ;

- services de monitoring.

Nginx est utilisé comme :

- serveur Web ;

- reverse proxy ;

- point d'entrée local.

PM2 permet :

- la gestion des processus Node.js ;

- le redémarrage automatique ;

- la persistance après reboot ;

- la supervision des applications.

#### Déploiement avec Terraform

Terraform a été utilisé comme outil d'Infrastructure as Code.

Il permet :

- d'automatiser la création Azure ;

- de versionner l'infrastructure ;

- de reproduire l'environnement ;

- de limiter les erreurs humaines.

#### Automatisation avec Cloud-init

Lors du déploiement des VM, cloud-init permet automatiquement :

- l'installation des paquets ;

- la configuration Nginx ;

- l'installation Node.js ;

- l'installation PM2 ;

- le déploiement de l'application.

Cela garantit :

- rapidité ;

- reproductibilité ;

- cohérence entre les VM.

#### Supervision avec Prometheus et Grafana

Afin d'assurer une meilleure visibilité sur l'état de l'infrastructure,
une solution de monitoring basée sur **Prometheus et Grafana** a été
intégrée.

Prometheus est utilisé pour :

- collecter les métriques système ;

- surveiller les performances ;

- enregistrer l'historique.

Les métriques collectées comprennent :

- utilisation CPU ;

- mémoire RAM ;

- utilisation disque ;

- disponibilité des services ;

- état des machines virtuelles.

Grafana permet la visualisation des données collectées.

Les tableaux de bord permettent de suivre :

- état des VM ;

- consommation ressources ;

- disponibilité application ;

- performances réseau.

Exemples de dashboards :

- Dashboard Infrastructure Azure ;

- Dashboard VM Linux ;

- Dashboard Application Web.

Le déploiement de **Script Hub Manager** sur Microsoft Azure a permis de
mettre en place une infrastructure Cloud moderne répondant aux exigences
professionnelles.

L'utilisation d'une architecture Hub & Spoke, associée à Azure Firewall,
Azure Bastion, Load Balancer Standard et Terraform, garantit :

- sécurité ;

- disponibilité ;

- automatisation ;

- évolutivité.

L'intégration de Prometheus et Grafana apporte une couche supplémentaire
d'observabilité permettant de surveiller l'état de l'infrastructure et
d'améliorer la maintenance opérationnelle.

### Chapitre 9 : présentation détaillé du site

#### Introduction

**Scripts Hub Manager** est une plateforme full-stack qui permet de :

- **Publier et cataloguer** des scripts d'infrastructure (PowerShell,
  Bash, Python, Terraform, Bicep, ARM, CloudFormation, Ansible,
  Kubernetes, Docker, SQL, JavaScript/TypeScript, YAML, JSON, Go, Ruby,
  Perl…) avec métadonnées riches (criticité, version, licence,
  compatibilité, dépendances, historique de versions, captures d'écran).

- **Organiser** ce contenu par **catégories** et associer des
  **ressources** complémentaires (liens, documents, fichiers).

- Offrir une **vitrine publique** (sans authentification) permettant à
  tout visiteur de parcourir, rechercher, aimer, partager, télécharger
  et consulter les scripts/ressources publics avec un mode **invité
  (pseudo)** pour interagir sans créer de compte.

- Offrir un **espace d'administration protégé** (dashboard, CRUD complet
  scripts/catégories/ressources, import/export CSV/PDF/JSON, gestion des
  utilisateurs et des rôles, journal d'audit, corbeille, archives).

- Garantir une **sécurité de bout en bout** : Row Level Security (RLS)
  Postgres, système de rôles/permissions granulaire, politique de mot de
  passe stricte, journalisation d'audit (IP + user-agent), Edge
  Functions validées côté serveur pour toute écriture sensible

#### Stack technique

| Couche                      | Technologie                                         | Détail                                                                                          |
|-----------------------------|-----------------------------------------------------|-------------------------------------------------------------------------------------------------|
| **Framework front-end**     | React 18.3 (TypeScript)                             | Composants fonctionnels + Hooks                                                                 |
| **Bundler / dev server**    | Vite 8                                              | @vitejs/plugin-react-swc (compilation SWC ultra-rapide)                                         |
| **Routing**                 | React Router DOM v6                                 | Routing déclaratif, routes publiques/privées                                                    |
| **Style / Design system**   | Tailwind CSS 3 + tailwindcss-animate                | Design tokens CSS via variables HSL, thèmes clair/sombre                                        |
| **Composants UI**           | shadcn/ui (Radix UI headless + Tailwind)            | Accordion, Dialog, AlertDialog, Dropdown, Tabs, Select, Toast, Tooltip, Popover, etc.           |
| **Gestion d'état serveur**  | TanStack React Query v5                             | Cache/synchronisation des données                                                               |
| **Formulaires**             | React Hook Form + Zod + @hookform/resolvers         | Validation de schémas typée                                                                     |
| **Backend-as-a-Service**    | Supabase                                            | PostgreSQL, Auth, Storage, Edge Functions (Deno)                                                |
| **Éditeur de code intégré** | Monaco Editor (@monaco-editor/react)                | Visualisation/édition syntaxique du contenu des scripts (thème clair/sombre, wrap, plein écran) |
| **Graphiques / dataviz**    | Recharts                                            | PieChart, BarChart sur le dashboard                                                             |
| **Génération de fichiers**  | jsPDF + jspdf-autotable, JSZip, file-saver          | Export PDF, ZIP, CSV, téléchargement de fichiers                                                |
| **Tests**                   | Vitest + Testing Library (React/jest-dom) + jsdom   | Tests unitaires/composants                                                                      |
| **Linting**                 | ESLint 9 (flat config) + typescript-eslint          | Qualité de code                                                                                 |
| **Gestionnaire de paquets** | Bun (bun.lock/bun.lockb) et npm (package-lock.json) | Double compatibilité                                                                            |
| **Langage**                 | TypeScript 5.8                                      | Typage strict sur tout le front-end                                                             |

#### Bibliothèques et dépendances

##### Dépendances principales

- **UI Radix (@radix-ui/react-\*)** : accordion, alert-dialog,
  aspect-ratio, avatar, checkbox, collapsible, context-menu, dialog,
  dropdown-menu, hover-card, label, menubar, navigation-menu, popover,
  progress, radio-group, scroll-area, select, separator, slider, slot,
  switch, tabs, toast, toggle, toggle-group, tooltip — la base headless
  de tous les composants shadcn/ui.

- **@supabase/supabase-js** : client officiel Supabase (Auth, base de
  données, Storage, RPC, Edge Functions).

- **@tanstack/react-query** : gestion de cache et de synchronisation des
  appels serveur.

- **@monaco-editor/react** + **monaco-editor** : éditeur de code
  (coloration syntaxique multi-langages) utilisé pour
  créer/éditer/visualiser les scripts.

- **react-hook-form** + **@hookform/resolvers** + **zod** : formulaires
  typés et validation de schéma.

- **react-router-dom** : routage SPA.

- **react-syntax-highlighter** (+ @types/react-syntax-highlighter) :
  mise en forme du code.

- **recharts** : graphiques du tableau de bord (répartition par
  type/statut, top scripts).

- **jspdf** + **jspdf-autotable** : génération de rapports PDF (export
  de scripts, catégories, logs).

- **jszip** + **file-saver** (+ @types/file-saver) : génération
  d'archives ZIP (export des logs d'audit, archives).

- **date-fns** : manipulation/formatage de dates.

- **embla-carousel-react** : carrousels.

- **cmdk** : palette de commande (command menu).

- **input-otp** : saisie de code OTP.

- **react-day-picker** : sélecteurs de date.

- **react-resizable-panels** : panneaux redimensionnables.

- **vaul** : tiroirs (drawers) mobiles.

- **sonner** + Toaster maison : notifications toast.

- **next-themes** : gestion du thème clair/sombre.

- **lucide-react** : bibliothèque d'icônes SVG (utilisée massivement
  dans toute l'application).

- **class-variance-authority**, **clsx**, **tailwind-merge** : gestion
  conditionnelle des classes Tailwind (helper cn()).

##### Dépendances de développement 

- **vite**, **@vitejs/plugin-react-swc** : build et dev server.

- **vitest**, **@testing-library/react**, **@testing-library/jest-dom**,
  **jsdom** : environnement de test.

- **eslint**, **@eslint/js**, **typescript-eslint**,
  **eslint-plugin-react-hooks**, **eslint-plugin-react-refresh**,
  **globals** : qualité/linting.

- **tailwindcss**, **postcss**, **autoprefixer**,
  **@tailwindcss/typography** : chaîne CSS.

- **typescript**, **@types/node**, **@types/react**,
  **@types/react-dom** : typage.

#### Modèle de données (Supabase / PostgreSQL)

Tables principales définies dans les migrations SQL
(supabase/migrations/) :

| Table            | Rôle                                                                                                                                                                                                                                                                |
|------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| profiles         | Profil étendu de chaque utilisateur (nom, email, statut actif/suspendu, must_change_password, dernière connexion…)                                                                                                                                                  |
| user_roles       | Association utilisateur ↔ rôle (global_admin, admin, editor, viewer) — **table séparée** de profiles pour éviter toute élévation de privilèges                                                                                                                      |
| permissions      | Référentiel des permissions (resource + action)                                                                                                                                                                                                                     |
| role_permissions | Association rôle ↔ permission (contrôle d'accès granulaire ressource/action)                                                                                                                                                                                        |
| audit_logs       | Journal d'audit (action, ressource, utilisateur, IP, user-agent, détails JSON, horodatage)                                                                                                                                                                          |
| categories       | Catégories de classement des scripts/ressources (nom, description, couleur, icône, visibilité, position)                                                                                                                                                            |
| scripts          | Scripts (nom, description, type, contenu, criticité, version, statut, tags, visibilité, licence, langage, compatibilité, dépendances, documentation, historique de versions, captures d'écran, compteurs vues/likes/partages/téléchargements/favoris, note moyenne) |
| resources        | Ressources (liens, documents, fichiers) avec type, URL ou fichier stocké, taille, mime-type, tags, criticité                                                                                                                                                        |
| script_likes     | Likes sur un script, par utilisateur connecté **ou** par invité (guest_id)                                                                                                                                                                                          |
| script_shares    | Partages de script (canal, utilisateur ou invité)                                                                                                                                                                                                                   |
| guest_users      | Identité "invité" (pseudo unique) permettant d'interagir sans créer de compte                                                                                                                                                                                       |
| contact_messages | Messages reçus via le formulaire de contact public                                                                                                                                                                                                                  |
| trash_items      | Corbeille générique (soft-delete) pour scripts/catégories/ressources/logs                                                                                                                                                                                           |
| archived_logs    | Logs d'audit archivés automatiquement après 90 jours                                                                                                                                                                                                                |

#### Fonctions PostgreSQL (RPC) notables

- has_role(uid, role) / has_permission(uid, resource, action) :
  fonctions SECURITY DEFINER avec search_path figé, utilisées par les
  policies RLS pour éviter toute récursion.

- is_active_user(uid) : vérifie qu'un compte n'est pas suspendu.

- handle_new_user() : trigger de création automatique du profil à
  l'inscription.

- log_audit_event(...) (plusieurs surcharges) : journalisation
  centralisée avec capture IP/User-Agent.

- global_admin_exists() : vérifie qu'il reste toujours au moins un
  administrateur global (garde-fou).

- archive_old_audit_logs() / archive_audit_logs_by_ids() : archivage
  manuel ou automatique des logs.

- increment_script_views(script_id) : incrémentation atomique des vues
  (évite les manipulations côté client).

- bump_script_likes() / bump_script_shares() : triggers de maintien des
  compteurs dénormalisés.

- guard_share_rate() : anti-flood sur les partages.

- register_guest(pseudo) / is_pseudo_available(pseudo) /
  touch_guest_last_seen() : gestion du mode invité.

Toutes les tables sont protégées par des policies Row Level Security
(RLS) strictes (lecture publique restreinte aux enregistrements
visibility = 'public', écriture réservée aux rôles autorisés,
has_role/has_permission en garde).

#### Sécurité et gestion des accès (RBAC)

- **4 rôles** : global_admin, admin, editor, viewer : stockés dans
  user_roles (jamais sur profiles, afin d'empêcher un utilisateur de
  s'auto-élever).

- **Permissions granulaires** resource:action (ex. scripts:create,
  resources:update) combinables par rôle via role_permissions.

- **AuthContext** (src/contexts/AuthContext.tsx) : expose session, user,
  profile, roles, permissions, ainsi que les helpers hasRole() et
  hasPermission(). Écoute les changements de session Supabase en temps
  réel.

- **ProtectedRoute** (src/components/auth/ProtectedRoute.tsx) : redirige
  vers /login si non connecté, vers /suspended si compte suspendu, vers
  /set-password si changement de mot de passe obligatoire, vers
  /forbidden si rôle/permission insuffisant.

- **Politique de mot de passe** (src/lib/passwordPolicy.ts) : minimum 16
  caractères, majuscule, minuscule, chiffre, caractère spécial ; calcul
  d'un score de robustesse (0 à 4).

- **Journal d'audit** : chaque action sensible (connexion, déconnexion,
  création/suppression, changement de rôle, suspension…) est tracée avec
  IP et user-agent.

- **Edge Functions** pour toute opération sensible côté serveur
  (invitation, suppression de compte, soumission de contact) plutôt que
  des écritures directes non contrôlées.

- **Mode invité sécurisé** : un visiteur peut liker/partager avec un
  simple pseudo unique (validé côté serveur via RPC), sans exposer de
  données personnelles.

- Rapport d'audit de sécurité détaillé (méthodologie OWASP Top 10, ASVS
  L2, CIS Postgres Benchmark, RGPD).

#### Cartographie des routes

##### Routes publiques (accessibles sans compte)

| Route                                                                                    | Page                                                   |
|------------------------------------------------------------------------------------------|--------------------------------------------------------|
| /                                                                                        | Accueil (HomePage)                                     |
| /qui-sommes-nous                                                                         | À propos (AboutPage)                                   |
| /nos-scripts                                                                             | Catalogue public des scripts (ScriptsPublicPage)       |
| /nos-scripts/:scriptId                                                                   | Détail public d'un script (ScriptPublicDetailPage)     |
| /nos-categories                                                                          | Catalogue public des catégories (CategoriesPublicPage) |
| /nos-categories/:categoryId                                                              | Détail public d'une catégorie (CategoryPublicPage)     |
| /nos-ressources                                                                          | Ressources publiques (ResourcesPublicPage)             |
| /nous-contacter                                                                          | Formulaire de contact public (ContactPublicPage)       |
| /mentions-legales, /conditions-generales, /politique-confidentialite, /politique-cookies | Pages légales (LegalPages)                             |

##### Routes d'authentification

| Route                              | Page                                              |
|------------------------------------|---------------------------------------------------|
| /login                             | Connexion                                         |
| /signup                            | Inscription                                       |
| /forgot-password                   | Mot de passe oublié                               |
| /reset-password                    | Réinitialisation du mot de passe                  |
| /set-password                      | Changement de mot de passe obligatoire (protégée) |
| /forbidden, /suspended, /no-signup | Pages d'accès restreint                           |

##### Routes protégées (back-office)

| Route                   | Page                                       | Contrainte                  |
|-------------------------|--------------------------------------------|-----------------------------|
| /admin                  | Index (redirection dashboard legacy)       | Connecté                    |
| /dashboard              | Tableau de bord temps réel                 | Connecté                    |
| /scripts                | Liste/gestion des scripts                  | Connecté                    |
| /scripts/new            | Création d'un script                       | Permission scripts:create   |
| /scripts/:scriptId/edit | Édition d'un script                        | Permission scripts:update   |
| /script/:scriptId       | Détail interne d'un script                 | Connecté                    |
| /categories             | Liste/gestion des catégories               | Connecté                    |
| /categories/new         | Création d'une catégorie                   | Permission resources:create |
| /category/:categoryId   | Détail d'une catégorie (vue historique)    | Connecté                    |
| /resources              | Liste/gestion des ressources               | Connecté                    |
| /profile                | Profil utilisateur                         | Connecté                    |
| /contact                | Boîte de réception des messages de contact | Connecté                    |
| /settings               | Paramètres                                 | Connecté                    |
| /admin/users            | Gestion des utilisateurs                   | Rôle global_admin           |
| /admin/audit-logs       | Journal d'audit                            | Rôle global_admin           |
| /admin/archives         | Archives des logs                          | Rôle global_admin           |
| /admin/trash            | Corbeille                                  | Rôle global_admin           |
| \*                      | Page 404 (NotFound)                        | Erreur                      |

#### Pages du site (côté visiteur)

##### Accueil (/ HomePage)

- **Hero** avec titre accrocheur, badge "Projet PLG ESTIAM", CTA vers le
  catalogue de scripts et vers la page "Qui sommes-nous".

- **4 cartes de statistiques dynamiques** (cliquables) calculées en
  direct depuis Supabase : nombre de scripts publiés, nombre de
  catégories visibles, nombre de ressources publiques, total cumulé des
  vues.

- **Section "Scripts récents"** : 6 derniers scripts publics avec badge
  type/criticité, description, compteurs vues/likes.

- **Section "Catégories populaires"** : les 6 catégories les plus riches
  en contenu (scripts + ressources), triées par volume total, avec
  compteurs détaillés.

- **Section "Ressources récentes"** : 4 dernières ressources publiques.

- **Section "Fonctionnalités"** : 6 points forts de la plateforme
  (sécurité RLS/audit, performance, scalabilité, multi-langages,
  centralisation, cloud-ready).

- **CTA final** : invitation à contacter l'équipe pour accéder à
  l'espace administrateur.

##### Qui sommes-nous (/qui-sommes-nous - AboutPage)

- **Hero** de présentation du projet.

- **Section "Le projet"** : pourquoi Scripts Hub Tools, avec liste de
  points méthodologiques (agilité, sécurité dès la conception, qualité
  de code…) et bloc "Notre vision".

- **Section école ESTIAM** : présentation de l'établissement avec lien
  externe, et grille de 6 domaines de compétences enseignés.

- **Section équipe** : 5 cartes membres (nom, rôle, classe, description)
  avec avatar généré (initiales).

- **Section superviseur** : mise en avant du superviseur du projet et
  remerciements.

- **Section "Nos valeurs"** : 6 valeurs (innovation, collaboration,
  sécurité, apprentissage continu, excellence technique, partage des
  connaissances).

- **Timeline du projet** : 5 étapes chronologiques (lancement,
  architecture/MVP, dashboard admin, déploiement/hébergement, interface
  publique) présentées en frise verticale alternée.

- **CTA final** vers contact et catalogue de scripts.

##### Catalogue public des scripts (/nos-scripts - ScriptsPublicPage)

- **Recherche texte libre** (nom, description, tags) + **filtres** par
  type de script et par criticité (menus déroulants dynamiques générés à
  partir des données réelles).

- **Grille de cartes** (2-3 colonnes responsive) avec badge type, badge
  criticité (couleur selon niveau), titre cliquable, description
  tronquée, tags (3 premiers affichés), compteurs vues/likes/partages,
  bouton "Détails".

- **Pagination** complète (jusqu'à 12 résultats par page, navigation
  précédent/suivant/numéros).

- Ne remonte que les scripts en visibility = 'public'.

##### Détail public d'un script (/nos-scripts/:scriptId - ScriptPublicDetailPage)

- **Fil d'Ariane** (Accueil \> Scripts \> Catégorie \> Nom du script).

- **En-tête** avec badges (type, criticité avec icône, version, "Validé"
  si applicable, visibilité, licence, catégorie), titre, description,
  méta-informations (date de création/mise à jour, langage, nombre de
  lignes et taille en Ko).

- **4 compteurs d'engagement** (vues, likes, partages, téléchargements)
  et **actions** :

  - **J'aime** (toggle, insert/delete dans script_likes, utilisateur
    connecté ou invité).

  - **Partager** (Web Share API native si disponible, sinon copie du
    lien dans le presse-papiers ; enregistrement dans script_shares).

  - **Télécharger** le script en tant que fichier avec l'extension
    adaptée au langage (.ps1, .sh, .py, .tf, .yml, .sql…), précédé d'une
    **boîte de dialogue de confirmation** rappelant la taille du fichier
    et un avertissement de sécurité.

  - **Copier le code** dans le presse-papiers.

<!-- -->

- **Mode invité** : une boîte de dialogue (GuestPseudoDialog) invite à
  choisir un pseudo unique avant de pouvoir aimer/partager sans compte.

- **Visualisation du code source** via **Monaco Editor** (coloration
  syntaxique adaptée au langage du script), avec bascule **thème
  clair/sombre** (synchronisée avec le thème de l'app), **retour à la
  ligne** (word-wrap) activable, et **mode plein écran**.

- **Onglets de contenu** : Vue d'ensemble, Fonctionnalités, Prérequis,
  Utilisation, Documentation, Historique des versions (frise
  chronologique par version avec date et changements).

- **Captures d'écran** : galerie d'images (URLs signées temporairement
  via Supabase Storage, 30 minutes de validité).

- **Panneau latéral (aside)** : détails techniques complets (type,
  langage, version, criticité, statut, visibilité, licence, catégorie,
  dates), bloc engagement (vues/likes/partages/téléchargements), tags
  cliquables (relient vers une recherche filtrée), avertissement de
  sécurité ("tester en environnement isolé avant tout déploiement"),
  bouton retour au catalogue.

##### Catalogue public des catégories (/nos-categories - CategoriesPublicPage)

- **Recherche** par nom/description.

- **Grille de cartes catégories** avec icône colorée, nombre de scripts,
  nombre de ressources, type, lien "Explorer".

- Tri par volume de contenu total (scripts + ressources) décroissant.

- **Pagination** (12 par page).

##### Détail public d'une catégorie (/nos-categories/:categoryId - CategoryPublicPage)

- Affiche la description de la catégorie et liste les scripts/ressources
  publics qui lui sont rattachés.

##### Ressources publiques (/nos-ressources - ResourcesPublicPage)

- **Recherche** (nom, description, tags) + **filtre par type de
  ressource** (lien, document, autre).

- **Bascule d'affichage** grille/liste.

- **Ouverture** d'une ressource : redirection vers l'URL externe si type
  "lien", ou génération d'une **URL signée Supabase Storage**
  (téléchargement sécurisé et temporaire) si fichier hébergé.

- Incrémentation des compteurs de vues/téléchargements à l'ouverture.

##### Contact public (/nous-contacter - ContactPublicPage)

- **Formulaire complet** validé par schéma **Zod** : nom, email, sujet,
  catégorie de demande (question générale, support technique,
  partenariat, signalement de bug, suggestion de fonctionnalité, autre),
  téléphone (optionnel), société (optionnel), message.

- **Champ honeypot invisible** anti-spam (bloque les soumissions
  automatisées).

- Soumission via l'**Edge Function public-contact-submit** (validation
  serveur, insertion sécurisée en base, protection CORS).

- **Boîte de dialogue de confirmation** de succès après envoi.

- Coordonnées de contact et liens réseaux sociaux affichés en
  complément.

##### Pages légales (LegalPages.tsx)

Quatre pages générées via un composant Section/SubSection réutilisable :

- **/mentions-legales** : Mentions légales.

- **/conditions-generales** : Conditions générales d'utilisation (objet,
  accès au service, propriété intellectuelle, responsabilité, précaution
  d'usage, usage acceptable, modifications, droit applicable).

- **/politique-confidentialite **: Politique de confidentialité RGPD
  (responsable du traitement, données collectées navigation anonymisées,
  IP partielle, formulaire de contact, compteurs d'engagement,
  finalités, base légale, durée de conservation, droits des
  utilisateurs, partage/sous-traitance, sécurité).

- **/politique-cookies** Politique des cookies.

##### Connexion (/login - LoginPage)

- Formulaire email/mot de passe, appel signIn() du contexte
  d'authentification.

- Journalisation automatique de l'événement de connexion (audit).

- Gestion des erreurs (identifiants invalides).

##### Inscription (/signup - SignupPage)

- Formulaire nom/email/mot de passe/confirmation.

- **Validation de la robustesse du mot de passe** en temps réel (via
  validatePasswordStrength) et vérification de correspondance des deux
  mots de passe.

- Création du compte via Supabase Auth ; email de confirmation envoyé.

##### Mot de passe oublié (/forgot-password - ForgotPasswordPage)

- Saisie de l'email, envoi d'un lien de réinitialisation par email.

##### Réinitialisation du mot de passe (/reset-password - ResetPasswordPage)

- Saisie du nouveau mot de passe + confirmation, avec la même politique
  de robustesse.

##### Changement de mot de passe obligatoire (/set-password - SetPasswordPage, protégée)

- Forcé lorsque profile.must_change_password = true (ex. après une
  invitation admin) ; bloque l'accès au reste de l'application tant que
  non complété.

##### Pages d'accès restreint (AccessPages.tsx)

- **/forbidden** : Accès refusé (permissions insuffisantes), retour à
  l'accueil.

- **/suspended** : Compte suspendu, invite à contacter un administrateur
  global, bouton de déconnexion.

- **/no-signup** : Inscription libre désactivée, redirige vers la
  connexion ou le support par email.

#### Dashboard - pages et fonctionnalités (côté admin)

Toutes les pages de cette section utilisent le composant
**DashboardLayout**, qui assemble une **Sidebar** rétractable (icônes +
libellés, sections "Navigation", "Administration" visible uniquement
pour les global_admin, et "Compte") et un **Header** interne.

##### Tableau de bord (/dashboard - DashboardPage)

Tableau de bord temps réel avec bandeau "Live" animé, organisé en
sections :

- **Vue principale** : cartes indicateurs (scripts, ressources,
  catégories, utilisateurs, logs…) cliquables vers les pages concernées.

- **Statistiques détaillées** : scripts
  actifs/brouillons/archivés/publics/validés, ressources
  actives/archivées/publiques/mises en avant, catégories
  actives/visibles, utilisateurs actifs/suspendus, logs
  (24h/7j/aujourd'hui), éléments en corbeille/archivés, total des
  téléchargements.

- **3 graphiques circulaires (PieChart Recharts)** : répartition des
  scripts par type, par statut, et des ressources par type.

- **Graphique en barres** : Top scripts par vues et téléchargements.

- **Flux d'activité récente** : derniers événements du journal d'audit
  (action, ressource, auteur, horodatage), avec lien vers la page
  complète des logs.

##### Index legacy (/admin - Index.tsx)

- Ancienne page d'accueil du dashboard (période de
  transition/démonstration), conservée en tant que route d'entrée
  /admin.

##### Gestion des scripts (/scripts - ScriptsPage, le fichier le plus volumineux du projet)

Fonctionnalités complètes de gestion de contenu :

- **3 modes d'affichage** : grille (cartes), liste, tableau (LayoutGrid
  / List / Table2).

- **Recherche** + **filtres avancés** (statut, criticité, type,
  visibilité, catégorie…) avec **sauvegarde des filtres préférés** et
  **réinitialisation**.

- **Tri** dynamique (ArrowUpDown).

- **Statistiques rapides** en haut de page (cartes StatCard).

- **Création** (/scripts/new), **édition** (/scripts/:scriptId/edit),
  **suppression → corbeille** (soft delete), **duplication**,
  **archivage** (unitaire et **en masse** via sélection multiple),
  **mise à la corbeille en masse**.

- **Bascule rapide** du statut (actif/inactif) et de la visibilité
  (public/privé) directement depuis la liste.

- **Export** : CSV, **PDF** (mise en page tableau via jsPDF +
  jspdf-autotable), modèle **JSON** téléchargeable.

- **Import JSON** : détection/prévisualisation des scripts contenus dans
  un fichier avant création en masse, avec rapport du nombre d'éléments
  créés.

- **Menu d'actions contextuel** par script (ActionsMenu : éditer,
  activer/désactiver, dupliquer, archiver, supprimer) avec contrôle des
  permissions (canWrite, canDelete).

- Composants de rendu dédiés : ScriptGridCard, ScriptListCard,
  ScriptTable, EmptyState.

##### Création d'un script (/scripts/new - NewScriptPage)

Formulaire complet en plusieurs sections :

- Nom, description, catégorie (liste dynamique depuis Supabase), type de
  script (20 types supportés : PowerShell, Bash, Python, Azure CLI, AWS
  CLI, Terraform, Bicep, ARM, CloudFormation, Ansible, Kubernetes,
  Docker, SQL, JavaScript, TypeScript, Go, Ruby, Perl, YAML, JSON,
  Autre), version, statut, visibilité, licence, criticité, tags.

- **Éditeur de code Monaco** intégré (coloration syntaxique selon le
  type choisi) pour saisir le contenu du script.

- Langage/runtime, compatibilité, dépendances.

- Champs enrichis : fonctionnalités, prérequis, exemple d'utilisation,
  documentation complémentaire, autres informations.

- **Upload de captures d'écran**.

- **Import via modèle JSON complet** prêt à l'emploi (alternative à la
  saisie manuelle, pour import automatisé).

##### Édition d'un script (/scripts/:scriptId/edit - EditScriptPage)

- Même formulaire que la création, pré-rempli avec les données
  existantes, éditeur Monaco avec bascule de thème clair/sombre.

##### Détail interne d'un script (/script/:scriptId - ScriptDetailPage)

- Vue détaillée côté back-office (hors contexte public), avec les
  informations complètes du script pour les utilisateurs authentifiés.

##### Gestion des catégories (/categories - CategoriesPage)

Fonctionnalités quasi symétriques à la gestion des scripts :

- Création/édition/suppression (corbeille)/duplication/archivage
  (unitaire et en masse).

- Activation/désactivation.

- **Export CSV, PDF, modèle JSON**, **import JSON** avec
  prévisualisation.

- Boîtes de dialogue multiples pour chaque action (création, édition,
  suppression, archivage en masse, import…).

##### Création d'une catégorie (/categories/new - NewCategoryPage)

- Formulaire dédié : nom, description, couleur, icône, type, position
  d'affichage, visibilité.

##### Détail d'une catégorie - vue historique (/category/:categoryId - CategoryPage)

- Version historique/démonstration utilisant les données statiques de
  src/data/scripts.ts (catégories users, resources, deployment, network)
  plutôt que Supabase affiche les scripts associés via ScriptCard.

##### Gestion des ressources (/resources - ResourcesPage)

- CRUD complet (création/édition/suppression - corbeille).

- Deux types de ressources : **lien externe** (URL) ou **fichier
  uploadé** (stocké dans Supabase Storage, avec taille et type MIME
  calculés).

- Publication/masquage (visibilité publique/privée), archivage
  (unitaire/en masse), mise à la corbeille en masse.

- **Téléchargement sécurisé** des fichiers via URL signée temporaire.

- Export CSV des ressources.

##### Profil utilisateur (/profile - ProfilePage)

- Édition des informations personnelles : nom, prénom, email,
  profession, biographie, téléphone, adresse, ville, pays, statut.

- **Upload de photo de profil** (avatar).

- Affichage du rôle et de la date d'inscription.

##### Paramètres (/settings - SettingsPage)

- Page de configuration présentant : profil utilisateur (nom/email),
  préférences de notifications (nouveaux scripts, mises à jour, alertes
  de sécurité), état de la sécurité du compte (MFA, sessions actives),
  informations d'infrastructure (région, région de secours, état des
  services App Service/Load Balancer).

##### Boîte de réception des messages de contact (/contact - ContactPage)

Véritable messagerie interne pour traiter les messages soumis depuis le
formulaire public :

- Vue **tableau** avec tri, recherche, **filtres par statut** (nouveau,
  lu, traité, archivé…) et **priorité calculée**.

- **Sélection multiple** et **actions en masse** (changement de statut
  par lot).

- **Marquage lu/non lu**, **mise en favori (étoile)**, **archivage**,
  **suppression**.

- **Réponse rapide** : préparation d'un email de réponse (ouverture du
  client mail par défaut) et **copie de réponse** dans le
  presse-papiers.

- Statistiques rapides (nombre de messages par statut).

#### Administration globale 

Ces pages sont réservées au rôle **global_admin**.

##### Gestion des utilisateurs (/admin/users - AdminUsersPage)

- **Statistiques** : utilisateurs actifs, suspendus, nombre
  d'administrateurs globaux.

- **Invitation d'un nouvel utilisateur** (nom, email, rôles) via
  l'**Edge Function admin-invite-user** envoi d'un email d'invitation.

- **Modification des rôles** d'un utilisateur (remplacement complet des
  rôles attribués).

- **Suspension / réactivation** d'un compte (impossible de se suspendre
  soi-même).

- **Réinitialisation du mot de passe** d'un utilisateur (envoi d'email
  dédié).

- **Suppression d'un utilisateur** via l'**Edge Function
  admin-delete-user**.

- **Délégation du rôle d'administrateur global** à un autre utilisateur,
  avec une séquence transactionnelle soigneusement ordonnée pour
  garantir qu'il existe **toujours au moins un** global_admin (insertion
  du nouveau rôle avant suppression de l'ancien).

- **Suppression de son propre compte**.

- Vue détaillée par utilisateur (rôles, statut, dates).

##### Journal d'audit (/admin/audit-logs - AuditLogsPage)

- Liste paginée et filtrable des événements journalisés, avec catégories
  rapides (authentification, utilisateurs, scripts, système) et compteur
  "aujourd'hui".

- **Sélection multiple** de logs.

- **Suppression - corbeille** des logs sélectionnés.

- **Archivage** des logs sélectionnés (manuel) ou **automatique des logs
  de plus de 90 jours**.

- **Export ZIP** des logs (tous / filtrés / sélectionnés).

##### Archives (/admin/archives - ArchivesPage)

- Consultation des logs d'audit archivés automatiquement après 90 jours.

- **Export ZIP** de l'archive.

- **Suppression définitive** d'archives.

##### Corbeille (/admin/trash - TrashPage)

- Vue centralisée des éléments supprimés (scripts, catégories,
  ressources, logs) avec traçabilité (qui a supprimé, quand).

- **Restauration** individuelle ou **en masse** (restoreFromTrash).

- **Suppression définitive (purge)** individuelle ou en masse
  (purgeFromTrash).

#### Pages d'erreur et d'accès restreint

- **NotFound.tsx** (route \*) - page 404 générique pour toute URL non
  reconnue.

#### Fonctions Edge (Supabase Functions)

Fonctions serverless **Deno** exécutées côté serveur pour sécuriser les
opérations sensibles (validation, contrôle CORS strict avec liste
blanche d'origines, clé de service Supabase jamais exposée au client) :

| Fonction              | Rôle                                                                                                                                  |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| admin-invite-user     | Invite un nouvel utilisateur (création de compte + envoi d'email + attribution de rôles initiaux), réservé aux administrateurs        |
| admin-delete-user     | Supprime définitivement un compte utilisateur et ses données associées                                                                |
| public-contact-submit | Valide (schéma Zod côté serveur) et enregistre en base un message soumis depuis le formulaire de contact public, avec protection CORS |

#### Autres fonctionnalités du site

- **Multi-format d'export** : CSV, PDF (mise en page tabulaire), JSON
  (modèle + import), ZIP (archives de logs) disponibles sur la plupart
  des modules d'administration (scripts, catégories, ressources, logs).

- **Import en masse** : détection et prévisualisation avant création,
  pour scripts et catégories, via fichier JSON.

- **Soft delete généralisé** : rien n'est supprimé directement en base
  tout passe par une corbeille (trash_items) avec restauration ou purge
  définitive.

- **Archivage automatique** : les logs d'audit de plus de 90 jours
  basculent automatiquement en archive consultable.

- **Compteurs d'engagement dénormalisés et protégés** : vues, likes,
  partages, téléchargements gérés par des fonctions/triggers serveur
  (increment_script_views, bump_script_likes, bump_script_shares) plutôt
  que par des mises à jour directes côté client, afin d'empêcher toute
  manipulation.

- **Mode invité** : navigation, like et partage possibles sans création
  de compte, via un pseudo unique validé côté serveur et persistant en
  localStorage.

- **Thème clair/sombre** : pris en charge globalement (via next-themes)
  et synchronisé avec le thème de l'éditeur Monaco.

- **Responsive design complet** : mise en page adaptative
  mobile/tablette/desktop sur l'ensemble des pages (menus mobiles,
  grilles adaptatives).

- **Accessibilité et SEO basique** : titres/descriptions dynamiques par
  page publique (PublicLayout), structure sémantique des fils d'Ariane.

## PARTIE V - DÉMONSTRATION ET ÉVALUATION CRITIQUE

### Chapitre 11 : Avantages, inconvénients et difficultés rencontrées

#### Introduction

La réalisation du projet **Script Hub Manager** a représenté une
expérience complète combinant plusieurs domaines techniques :
développement web, gestion de bases de données, Cloud Computing,
cybersécurité et DevOps.

Au-delà du résultat final obtenu, ce projet a permis à l'équipe de
développer de nouvelles compétences, de découvrir de nouvelles
technologies et de mieux comprendre les contraintes liées à la
réalisation d'une solution professionnelle.

Cependant, plusieurs limites et difficultés ont également été
rencontrées durant les différentes phases du projet, notamment lors de
la conception de l'architecture, du développement de la plateforme, du
déploiement Azure et de la sécurisation de l'application.

#### Avantages du projet

- **Acquisition de nouvelles compétences techniques**

Le projet nous a permis de découvrir et de maîtriser de nouvelles
technologies qui n'étaient pas toutes connues au début du projet.

Les principaux apprentissages concernent :

- **Microsoft Azure** pour la conception et le déploiement d'une
  infrastructure Cloud ;

- **Terraform** pour l'automatisation de l'infrastructure avec
  l'approche Infrastructure as Code (IaC) ;

- **Supabase PostgreSQL** pour la gestion d'une base de données Cloud
  sécurisée ;

- **React.js** pour le développement d'une interface web moderne ;

- **Docker** pour la gestion et la portabilité des environnements ;

- **Prometheus et Grafana** pour la supervision et l'observabilité ;

- **Azure Firewall et Azure Bastion** pour la sécurisation des accès
  réseau.

Ce projet nous a permis de passer d'une approche théorique à une mise en
pratique dans un environnement proche d'un contexte professionnel.

- **Mise en pratique des connaissances acquises en formation**

Le projet a permis d'appliquer concrètement plusieurs notions étudiées
durant notre formation :

- architecture réseau ;

- administration système Linux ;

- développement web ;

- gestion de bases de données ;

- cybersécurité ;

- virtualisation ;

- Cloud Computing ;

- méthodologies DevOps.

Cette expérience a permis de mieux comprendre les interactions entre les
différents domaines IT.

- **Découverte d'une approche professionnelle de gestion de projet**

Le projet nous a permis d'améliorer notre organisation grâce à
l'utilisation de méthodes et d'outils professionnels :

- découpage du projet en phases ;

- création de Sprint Backlogs ;

- suivi des tâches avec Microsoft Planner ;

- organisation des rendus ;

- répartition des responsabilités entre les membres.

Cette organisation nous a permis d'améliorer la collaboration et le
suivi de l'avancement du projet.

- **Travail collaboratif en équipe**

La réalisation du projet a renforcé notre capacité à travailler en
équipe.

Chaque membre a pu contribuer selon son domaine de compétence :

- développement frontend ;

- administration système ;

- architecture Cloud ;

- cybersécurité ;

- gestion de projet.

Cette répartition des rôles a permis de simuler le fonctionnement d'une
véritable équipe IT.

- **Création d'une solution complète de bout en bout**

Le projet nous a permis de réaliser une solution complète intégrant
plusieurs couches techniques :

- conception fonctionnelle ;

- développement de l'application ;

- conception de la base de données ;

- sécurisation ;

- déploiement Cloud ;

- supervision.

Cette vision globale permet de mieux comprendre le cycle de vie complet
d'un projet informatique.

- **Amélioration des compétences en cybersécurité**

Le projet a renforcé nos connaissances dans le domaine de la sécurité
informatique grâce à :

- la mise en place du RBAC ;

- l'utilisation des politiques RLS Supabase ;

- la configuration Azure Firewall ;

- la sécurisation des accès avec Azure Bastion ;

- la réalisation d'un audit de sécurité basé sur OWASP.

Nous avons appris à intégrer la sécurité dès la conception de la
solution.

- **Compréhension des architectures Cloud modernes**

La mise en place d'une architecture Azure Hub & Spoke nous a permis de
comprendre :

- la segmentation réseau Cloud ;

- la gestion des flux ;

- le routage sécurisé ;

- la haute disponibilité ;

- la répartition de charge.

Ces connaissances sont directement applicables dans des environnements
professionnels.

- **Développement des compétences en résolution de problèmes**

Le projet nous a confrontés à plusieurs problèmes techniques nécessitant
:

- recherche de documentation ;

- analyse des erreurs ;

- tests de différentes solutions ;

- collaboration entre membres.

Cela a amélioré notre capacité d'analyse et notre autonomie technique.

#### Inconvénients du projet

- **Temps limité pour développer toutes les fonctionnalités souhaitées**

La durée du projet était limitée, ce qui nous a obligés à prioriser
certaines fonctionnalités.

Certaines améliorations auraient pu être développées dans une version
future :

- recherche intelligente avec IA ;

- intégration Git complète ;

- système avancé de versioning ;

- automatisation supplémentaire.

<!-- -->

- **Complexité technique importante**

Le projet regroupait plusieurs domaines techniques différents :

- frontend ;

- backend ;

- base de données ;

- Cloud ;

- sécurité ;

- supervision.

Cette diversité a augmenté la complexité globale et nécessité beaucoup
de temps d'apprentissage.

- **Dépendance aux services Cloud externes**

L'utilisation de services comme :

- Microsoft Azure ;

- Supabase ;

- GitHub ;

<!-- -->

- **Coût potentiel en environnement réel**

Une architecture professionnelle Azure comprenant :

- Azure Firewall ;

- Azure Bastion ;

- Load Balancer Standard ;

- machines virtuelles ;

Peut représenter un coût important lorsqu'elle est utilisée à grande
échelle.

Une optimisation des ressources serait nécessaire pour une mise en
production complète.

- **Courbe d'apprentissage importante**

Certaines technologies utilisées nécessitent un temps d'apprentissage
conséquent :

- Terraform ;

- Azure Networking ;

- Supabase RLS ;

- Prometheus ;

- Grafana.

La prise en main de ces outils a demandé beaucoup de recherches et de
tests.

#### Difficultés rencontrées durant le projet

- **Compréhension et mise en place de l'architecture Azure Hub & Spoke**

La conception de l'architecture réseau Azure a été l'une des principales
difficultés.

Les problèmes rencontrés concernaient :

- la compréhension du rôle du Hub et des Spokes ;

- la configuration des VNets ;

- la gestion des subnets ;

- la mise en place du routage avec les UDR ;

- la communication sécurisée entre réseaux.

<!-- -->

- **Configuration du Load Balancer Azure**

La configuration du Load Balancer Standard a présenté plusieurs
contraintes techniques.

Une difficulté importante concernait l'association des machines
virtuelles au Backend Pool.

Azure impose que les ressources associées respectent certaines
contraintes réseau, ce qui nous a obligés à revoir l'organisation
initiale de l'infrastructure.

- **Mise en place des règles de sécurité réseau**

La configuration des éléments de sécurité a nécessité plusieurs phases
de tests :

- Network Security Groups ;

- Azure Firewall ;

- règles entrantes et sortantes ;

- routage sécurisé.

Trouver le bon équilibre entre sécurité et accessibilité a été un défi
important.

- **Configuration de Supabase et des politiques RLS**

La sécurisation de la base PostgreSQL a demandé un travail approfondi.

Les difficultés principales étaient :

- comprendre le fonctionnement de Row Level Security ;

- gérer les permissions selon les rôles ;

- éviter les accès non autorisés ;

- synchroniser les rôles applicatifs avec la base de données.

<!-- -->

- **Déploiement automatisé avec Terraform**

L'utilisation de Terraform a représenté un changement important par
rapport aux déploiements manuels.

Les difficultés rencontrées :

- organisation des fichiers Terraform ;

- gestion des dépendances entre ressources ;

- correction des erreurs de déploiement ;

- adaptation de l'infrastructure aux besoins du projet.

<!-- -->

- **Mise en place de la supervision Prometheus et Grafana**

La configuration de la supervision a nécessité :

- installation des outils ;

- collecte des métriques ;

- configuration des dashboards ;

- interprétation des données.

Cette partie demandait une compréhension du fonctionnement interne des
systèmes Linux et Cloud.

- **Coordination entre les différents membres de l'équipe**

Le travail en groupe sur un projet multi-technologies a nécessité une
bonne communication.

Les principales difficultés étaient :

- synchroniser les développements ;

- partager les informations techniques ;

- gérer les dépendances entre tâches ;

- respecter les délais des différents rendus.

Malgré les difficultés rencontrées, le projet **Script Hub Manager** a
constitué une expérience très enrichissante.

Il nous a permis d'acquérir de nouvelles compétences techniques,
d'améliorer notre capacité à travailler en équipe et de comprendre les
exigences d'un projet informatique professionnel.

Les contraintes rencontrées durant le développement ont également permis
de renforcer notre autonomie, notre capacité d'analyse et notre aptitude
à résoudre des problèmes complexes dans un environnement Cloud moderne.

## PARTIE VI - CONCLUSION GÉNÉRALE ET PERSPECTIVES

### Chapitre 12 : Conclusion générale du projet

#### Introduction

Le projet **Script Hub Manager**, réalisé par le **Groupe 24** dans le
cadre de l'année académique **2025 - 2026**, avait pour objectif de
concevoir et déployer une plateforme web centralisée permettant aux
équipes IT de gérer, partager et sécuriser leurs scripts ainsi que leurs
ressources techniques.

Ce projet s'inscrit dans un contexte professionnel combinant plusieurs
domaines stratégiques de l'informatique moderne :

- Cloud Computing ;

- Architecture Microsoft Azure ;

- Développement Web ;

- DevOps ;

- Cybersécurité ;

- Administration système.

L'objectif principal était de répondre à une problématique réelle
rencontrée dans les environnements IT : la dispersion des scripts et
outils techniques entre différentes plateformes, rendant leur gestion,
leur partage et leur sécurisation plus complexes.

#### Bilan des objectifs atteints

Au cours du projet, l'ensemble des objectifs définis au départ a été
réalisé.

La plateforme développée permet aujourd'hui :

- de centraliser les scripts et ressources techniques ;

- de structurer les contenus par catégories ;

- de gérer les utilisateurs selon différents niveaux d'accès ;

- de sécuriser les données grâce aux mécanismes d'authentification et
  d'autorisation ;

- de suivre les actions effectuées grâce au système de logs et d'audit ;

- de proposer une interface moderne et intuitive.

Sur le plan technique, l'équipe a également réussi à mettre en place une
infrastructure Cloud complète basée sur Microsoft Azure comprenant :

- une architecture Hub & Spoke ;

- un Azure Load Balancer Standard ;

- deux machines virtuelles Ubuntu en haute disponibilité ;

- Azure Firewall ;

- Azure Bastion ;

- une connexion sécurisée avec Supabase PostgreSQL.

#### Apports techniques et professionnels

La réalisation de ce projet a constitué une expérience enrichissante
permettant de développer plusieurs compétences essentielles dans le
domaine informatique.

L'équipe a pu approfondir ses connaissances dans :

- **Développement applicatif**

<!-- -->

- conception d'une application React.js ;

- création d'interfaces modernes ;

- gestion des fonctionnalités CRUD ;

- intégration avec une base de données Cloud.

<!-- -->

- **Administration Cloud**

<!-- -->

- conception d'une architecture Azure ;

- gestion des réseaux virtuels ;

- configuration de la sécurité réseau ;

- déploiement automatisé avec Terraform.

<!-- -->

- **Cybersécurité**

<!-- -->

- mise en place d'un système RBAC ;

- configuration des politiques RLS Supabase ;

- réalisation d'un audit de sécurité ;

- application des recommandations OWASP.

<!-- -->

- **DevOps**

<!-- -->

- automatisation des déploiements ;

- utilisation de l'Infrastructure as Code ;

- supervision avec Prometheus et Grafana ;

- amélioration de la maintenabilité de l'infrastructure.

#### Valeur ajoutée de la solution développée

La solution **Script Hub Manager** apporte une réelle valeur aux équipes
IT en proposant un environnement unique permettant de mieux organiser
leurs connaissances techniques.

Les principaux bénéfices sont :

- réduction du temps consacré à la recherche des scripts ;

- amélioration de la collaboration entre équipes ;

- standardisation des pratiques ;

- meilleure traçabilité des modifications ;

- amélioration de la sécurité des automatisations.

La plateforme représente une première version professionnelle pouvant
évoluer vers une solution plus avancée intégrant davantage
d'automatisation et d'intelligence.

#### Perspectives d'évolution

Même si les objectifs principaux ont été atteints, plusieurs
améliorations peuvent être envisagées dans les futures versions.

- **Évolution fonctionnelle**

<!-- -->

- ajout d'un moteur de recherche intelligent basé sur l'intelligence
  artificielle ;

- suggestion automatique de scripts selon les besoins utilisateurs ;

- analyse automatique du contenu des scripts ;

- intégration d'un système de notation et de commentaires avancés ;

- gestion avancée des versions.

<!-- -->

- **Évolution DevOps**

<!-- -->

- intégration complète avec GitHub ou GitLab ;

- automatisation des tests avant publication d'un script ;

- mise en place d'une chaîne CI/CD complète ;

- utilisation d'Azure Kubernetes Service (AKS).

<!-- -->

- **Évolution Cloud**

<!-- -->

- mise en place d'un système d'auto-scaling ;

- déploiement multi-régions ;

- amélioration de la stratégie de sauvegarde ;

- ajout d'une solution de Disaster Recovery.

<!-- -->

- **Évolution cybersécurité**

<!-- -->

- intégration d'un Security Information and Event Management (SIEM) ;

- analyse comportementale des utilisateurs ;

- renforcement des contrôles d'accès ;

- ajout d'une authentification multi-facteurs avancée.

Le projet **Script Hub Manager** représente une réalisation complète
combinant développement logiciel, Cloud Computing, cybersécurité et
pratiques DevOps.

Grâce à ce projet, l'équipe a pu transformer une problématique théorique
en une solution fonctionnelle répondant aux besoins d'un environnement
IT moderne.

Au-delà du développement de la plateforme, ce projet nous a permis
d'acquérir une meilleure compréhension du cycle de vie complet d'une
solution informatique professionnelle : de l'analyse du besoin jusqu'au
déploiement, en passant par la conception, le développement, la
sécurisation et la supervision.

Les différentes difficultés rencontrées ont constitué des opportunités
d'apprentissage et ont permis d'améliorer notre autonomie, notre
capacité à travailler en équipe et notre aptitude à résoudre des
problèmes techniques complexes.

Ainsi, **Script Hub Manager** constitue une base solide pouvant évoluer
vers une solution industrielle complète destinée aux équipes IT
souhaitant centraliser, sécuriser et valoriser leurs ressources
techniques.

### Chapitre 13 : Ressources et bibliographie

Les ressources ci-dessous constituent les principales références
techniques et méthodologiques mobilisées tout au long du projet,
couvrant l'infrastructure cloud, le développement applicatif, la
sécurité et les outils de suivi/collaboration.

#### Infrastructure et cloud

- Microsoft Azure Documentation : <https://learn.microsoft.com/azure/>

- Azure Architecture Center :
  <https://learn.microsoft.com/azure/architecture/>

- Microsoft Security Documentation :
  <https://learn.microsoft.com/security/>

- Terraform Documentation :
  <https://developer.hashicorp.com/terraform/docs>

- Ubuntu Server Documentation :
  <https://documentation.ubuntu.com/server/>

#### Développement applicatif

- React Documentation : <https://react.dev/>

- Vite Documentation : <https://vitejs.dev/>

- TypeScript Documentation : <https://www.typescriptlang.org/docs/>

- Supabase Documentation : <https://supabase.com/docs>

- PostgreSQL Documentation : <https://www.postgresql.org/docs/>

- Node.js Documentation : <https://nodejs.org/docs/>

#### Conteneurisation, exploitation et supervision

- Docker Documentation : <https://docs.docker.com/>

- Nginx Documentation : <https://nginx.org/en/docs/>

- PM2 Documentation : <https://pm2.keymetrics.io/>

- Prometheus Documentation : <https://prometheus.io/docs/>

- Grafana Documentation : <https://grafana.com/docs/>

#### Sécurité et bonnes pratiques

- OWASP Top 10 : <https://owasp.org/www-project-top-ten/>

- OWASP Application Security Verification Standard (ASVS) :
  <https://owasp.org/www-project-application-security-verification-standard/>

- CIS Security Benchmarks : <https://www.cisecurity.org/cis-benchmarks>

#### Outils de collaboration et de gestion de projet

- GitHub Documentation : <https://docs.github.com/>

- Git Documentation : <https://git-scm.com/doc>

- Microsoft Planner Documentation :
  <https://support.microsoft.com/planner>

#### Établissement académique

- ESTIAM Paris : <https://www.estiam.education/>
