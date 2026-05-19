# Projet pédagogique 2026 : Mise en place de l'insfrastructure Azure

## Groupe : 24

### Membres
- Amir Minihadji AMINA  
- LO Pape  
- Neylie NDJUMKENG-NGUEMO  

### Superviseur
- Mhand BOUFALA
---

![Azure](https://img.shields.io/badge/Cloud-Microsoft%20Azure-0089D6?style=flat&logo=microsoftazure)
![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC?style=flat&logo=terraform)
![Linux](https://img.shields.io/badge/OS-Ubuntu_22.04_LTS-E95420?style=flat&logo=ubuntu)
![Bastion](https://img.shields.io/badge/Security-Azure_Bastion-0078D4?style=flat)
![Azure Firewall](https://img.shields.io/badge/Security-Azure_Firewall-0C6F82?style=flat)
![Load Balancer](https://img.shields.io/badge/Network-Load_Balancer_Standard-0078D4?style=flat)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat&logo=supabase)
![VNet Peering](https://img.shields.io/badge/Network-VNet_Peering-0078D4?style=flat)
![Cloud Shell](https://img.shields.io/badge/Environnement-Cloud_Shell_PowerShell-5391FE?style=flat&logo=powershell)

## Objectif
Dans ce rendu N°5
> **Projet** : Architecture Script HUB tools avec Load Balancer - Hébergement web avec backend Supabase
> **Environnement** : Azure Cloud Shell (PowerShell)
> **Région** : `norwayeast`
> **Auteur** : PLG - 2026 / Groupe - 24 / ESTIAM Paris
> **Date** : Main 2026

---

## Table des matières

1. [Architecture](#-architecture)
2. [Infrastructure déployée](#-infrastructure-déployée)
3. [Prérequis](#-prérequis)
4. [Structure du projet](#-structure-du-projet)
5. [Description des fichiers Terraform](#-description-des-fichiers-terraform)
6. [Déploiement pas à pas](#-déploiement-pas-à-pas)
   - [Étape 1 — Répertoire de travail](#étape-1--répertoire-de-travail)
   - [Étape 2 — Clé SSH](#étape-2--clé-ssh)
   - [Étape 3 — Vérification pré-déploiement](#étape-3--vérification-pré-déploiement)
   - [Étape 4 — Initialisation Terraform](#étape-4--initialisation-terraform)
   - [Étape 5 — Formater et valider](#étape-5--formater-et-valider)
   - [Étape 6 — Plan](#étape-6--prévisualiser-le-déploiement)
   - [Étape 7 — Déploiement](#étape-7--déployer-linfrastructure)
   - [Étape 8 — Connexion Bastion](#étape-8--connexion-via-azure-bastion)
   - [Étape 9 — Déployer l'application web](#étape-9--déployer-lapplication-web)
   - [Étape 10 — Vérification logiciels](#étape-10--vérifier-les-logiciels)
   - [Étape 11 — Tester le Load Balancer](#étape-11--tester-le-load-balancer)
   - [Étape 12 — Connectivité inter-spoke](#étape-12--tester-la-connectivité-inter-spoke)
   - [Étape 13 — Inspection Terraform](#étape-13--inspecter-létat-terraform)
7. [Logiciels installés](#-logiciels-installés-via-cloud-init)
8. [Ports ouverts](#-ports-ouverts-nsg)
9. [Résumé des commandes](#-résumé-des-commandes)
10. [Dépannage](#-dépannage)
11. [Nettoyage](#-nettoyage)

---

## Architecture

```
                              Internet
                                 │
                    ┌────────────▼────────────┐
                    │   Load Balancer Standard │
                    │   IP Publique Statique   │
                    │   Frontend :80 / :443    │
                    │   Health Probe : HTTP/80 │
                    └────────────┬────────────┘
                                 │ BackEndPool
                    ┌────────────▼──────────────────────────────────────┐
                    │                 VNet HUB (10.0.0.0/16)             │
                    │                                                    │
                    │  ┌──────────────┐   ┌──────────────────┐         │
         Browser ───┼──│ Azure Bastion│   │  Azure Firewall  │         │
                    │  │ 10.0.4.0/24  │   │  10.0.2.0/24     │         │
                    │  └──────────────┘   └────────┬─────────┘         │
                    │                              │ next-hop UDR        │
                    │  ┌───────────────────┐  ┌───────────────────┐    │
                    │  │   SubnetVM1       │  │   SubnetVM2       │    │
                    │  │   10.0.10.0/24    │  │   10.0.11.0/24    │    │
                    │  │  ┌─────────────┐  │  │  ┌─────────────┐  │    │
                    │  │  │ VM-SPOKE-1  │  │  │  │ VM-SPOKE-2  │  │    │
                    │  │  │ Ubuntu 22.04│  │  │  │ Ubuntu 22.04│  │    │
                    │  │  │ Nginx + PM2 │  │  │  │ Nginx + PM2 │  │    │
                    │  │  │ App → :3000 │  │  │  │ App → :3000 │  │    │
                    │  │  └─────────────┘  │  │  └─────────────┘  │    │
                    │  │  NSG-VM1          │  │  NSG-VM2           │    │
                    │  └───────────────────┘  └───────────────────┘    │
                    └───────────────────────────────────────────────────┘
                                    │ VNet Peering
              ┌─────────────────────┼──────────────────────┐
              │                                              │
  ┌───────────▼──────────┐                    ┌────────────▼───────────┐
  │   VNet SPOKE 1        │                    │   VNet SPOKE 2          │
  │   192.168.0.0/24      │◄──────────────────►│   172.16.0.0/24         │
  │   Subnet Prod         │    (Topologie      │   Subnet Prod           │
  │   (sans VM)           │   Hub & Spoke)     │   (sans VM)             │
  │   UDR → Firewall      │                    │   UDR → Firewall        │
  └───────────────────────┘                    └─────────────────────────┘
                    │                                        │
                    └───────────────┬────────────────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │      Supabase        │
                         │  (PostgreSQL Cloud)  │
                         │  Port 5432 / HTTPS   │
                         └─────────────────────┘
```

**Pourquoi les VMs sont dans le Hub et non dans les Spokes ?**

Azure Load Balancer Standard impose que **toutes les NICs du Backend Pool appartiennent au même VNet**. Placer VM-SPOKE-1 dans `VnetSpoke1` et VM-SPOKE-2 dans `VnetSpoke2` provoque l'erreur `BackendIPConfigurationsDontUseSameVnet`. La solution retenue est d'héberger les deux VMs dans `VnetHub`, chacune dans son propre subnet dédié (`SubnetVM1` et `SubnetVM2`). Les VNets Spoke1 et Spoke2 sont conservés pour la topologie Hub & Spoke et le routage inter-spoke via le Firewall.

**Principes de sécurité :**
- **Aucune IP publique** sur les VMs → accès uniquement via Bastion (admin) ou Load Balancer (web)
- **Trafic entrant web** (HTTP/HTTPS) distribué par le Load Balancer Standard sur les deux VMs
- **Nginx** fait office de reverse proxy sur chaque VM (port 80 → app Node.js :3000)
- **PM2** gère les processus Node.js avec auto-restart et persistence au reboot
- **Trafic inter-spoke** inspecté par Azure Firewall via UDR
- **NSG** ouvrent les ports nécessaires à l'application web et à Supabase

---

## Infrastructure déployée

### Ressources globales

| Ressource | Nom | Description |
|---|---|---|
| Resource Group | `RG-HUB-SPOKE-PROJECT` | Conteneur logique de toutes les ressources |
| Région | `norwayeast` | Zone de déploiement |

### Réseau

| Ressource | Nom | CIDR | Rôle |
|---|---|---|---|
| VNet Hub | `VnetHub` | `10.0.0.0/16` | Réseau central |
| Subnet Firewall | `AzureFirewallSubnet` | `10.0.2.0/24` | Réservé Azure Firewall |
| Subnet Bastion | `AzureBastionSubnet` | `10.0.4.0/24` | Réservé Azure Bastion |
| Subnet Hub Prod | `Prod` | `10.0.1.0/24` | Ressources communes Hub |
| **Subnet VM1** | **`SubnetVM1`** | **`10.0.10.0/24`** | **VM-SPOKE-1 (Hub)** |
| **Subnet VM2** | **`SubnetVM2`** | **`10.0.11.0/24`** | **VM-SPOKE-2 (Hub)** |
| VNet Spoke 1 | `VnetSpoke1` | `192.168.0.0/24` | Topologie Hub & Spoke |
| Subnet Spoke 1 | `Prod` (Spoke1) | `192.168.0.0/24` | Routage inter-spoke |
| VNet Spoke 2 | `VnetSpoke2` | `172.16.0.0/24` | Topologie Hub & Spoke |
| Subnet Spoke 2 | `Prod` (Spoke2) | `172.16.0.0/24` | Routage inter-spoke |

### Sécurité & routage

| Ressource | Nom | Rôle |
|---|---|---|
| NSG | `NSG-VM1` | Filtrage L4 SubnetVM1 |
| NSG | `NSG-VM2` | Filtrage L4 SubnetVM2 |
| Azure Firewall | `AzureFireWall` | Inspection trafic inter-spoke (Standard) |
| IP Publique Firewall | `IP-Firewall` | Point de sortie Internet unique |
| Azure Bastion | `AzureBastion` | Accès SSH sans IP publique |
| IP Publique Bastion | `IP-Bastion` | Tunnel SSL navigateur → VM |
| Route Table | `UdrSpoke1` | Next-hop → Firewall (Spoke1 → Spoke2) |
| Route Table | `UdrSpoke2` | Next-hop → Firewall (Spoke2 → Spoke1) |
| VNet Peering | `HubToSpoke1` / `Spoke1ToHub` | Interconnexion Hub ↔ Spoke1 |
| VNet Peering | `HubToSpoke2` / `Spoke2ToHub` | Interconnexion Hub ↔ Spoke2 |

### Load Balancer

| Ressource | Nom | Valeur |
|---|---|---|
| IP Publique LB | `IP-LoadBalancer` | Statique, SKU Standard |
| Load Balancer | `LB-HUB-SPOKE` | SKU Standard |
| Frontend IP | `FrontEnd` | Liée à `IP-LoadBalancer` |
| Backend Pool | `BackEndPool` | VM-SPOKE-1 (10.0.10.x) + VM-SPOKE-2 (10.0.11.x) |
| Health Probe | `HttpProbe` | HTTP :80 `/health` toutes les 15 s |
| LB Rule HTTP | `LBRuleHTTP` | TCP :80 → :80 |
| LB Rule HTTPS | `LBRuleHTTPS` | TCP :443 → :443 |

### Machines Virtuelles

| Ressource | VM-SPOKE-1 | VM-SPOKE-2 |
|---|---|---|
| Image | Ubuntu Server 22.04 LTS | Ubuntu Server 22.04 LTS |
| Taille | `Standard_B2s` (2 vCPU / 4 Go) | `Standard_B2s` (2 vCPU / 4 Go) |
| Subnet | `SubnetVM1` — `10.0.10.0/24` | `SubnetVM2` — `10.0.11.0/24` |
| IP privée | `10.0.10.x` (dynamique) | `10.0.11.x` (dynamique) |
| IP publique | **Aucune** | **Aucune** |
| Auth | Clé SSH | Clé SSH |
| Provisionnement | cloud-init (Nginx + PM2 + outils) | cloud-init (Nginx + PM2 + outils) |

---

## Prérequis

- Un **abonnement Azure** actif avec les droits **Contributor**
- Être connecté à **Azure Cloud Shell en mode PowerShell**
- Un projet **Supabase** configuré avec :
  - L'URL du projet (`SUPABASE_URL`)
  - La clé anonyme (`SUPABASE_ANON_KEY`)
  - Les identifiants PostgreSQL si connexion directe nécessaire

> Azure CLI, Terraform et l'authentification sont déjà pris en charge par Cloud Shell. Aucune installation supplémentaire n'est nécessaire.

---

## Structure du projet

```
hub-spoke-norway/
├── providers.tf         # Provider AzureRM + contrainte de version Terraform
├── variables.tf         # Déclarations typées de toutes les variables
├── terraform.tfvars     # Valeurs des variables (à adapter par environnement)
├── main.tf              # Ressources Azure : réseau, sécurité, VMs, LB
├── outputs.tf           # Valeurs exposées après terraform apply
├── cloud-init.yaml      # Provisionnement automatique des VMs au démarrage
├── pre-check.sh         # Script de validation pré-déploiement (bash)
├── .gitignore           # Exclusions Git (tfstate, clés SSH, .env…)
└── README.md            # Ce fichier
```

---

## Description des fichiers Terraform

### `providers.tf`
Configure le provider HashiCorp AzureRM et fixe la version minimale de Terraform requise (`>= 1.2.0`). C'est le point d'entrée de l'initialisation (`terraform init`).

### `variables.tf`
Déclare toutes les variables avec leur type, description et valeur par défaut. Les variables couvrent :
- Le Resource Group et la région
- Les noms et CIDRs de tous les VNets et subnets
- L'image VM, la taille et le chemin de la clé SSH
- Les paramètres du Load Balancer (nom, intervalle de probe, seuil)
- Le nom du Firewall
- Un bloc de tags communs appliqués à toutes les ressources

### `terraform.tfvars`
Surcharge les valeurs par défaut des variables pour l'environnement cible. **Ce fichier est chargé automatiquement** par Terraform. À adapter pour chaque déploiement (région, noms, tailles…). Ne commitez jamais ce fichier s'il contient des secrets.

### `main.tf`
Contient l'intégralité des ressources Azure :
- Resource Group
- VNets Hub, Spoke1, Spoke2 et leurs subnets
- NSG VM1 et VM2 avec toutes les règles entrantes
- Azure Firewall avec règles inter-spoke
- Tables de routage UDR Spoke1 et Spoke2
- VNet Peerings Hub ↔ Spoke1 et Hub ↔ Spoke2
- Azure Bastion
- Load Balancer Standard (frontend, backend pool, probe, règles HTTP/HTTPS)
- NICs des VMs et leur association au backend pool
- VMs Linux VM-SPOKE-1 et VM-SPOKE-2

### `outputs.tf`
Expose après `terraform apply` les valeurs utiles :
- IP publique et URL du Load Balancer
- IP publique et privée du Firewall
- IPs privées des deux VMs
- Nom et IP publique du Bastion
- IDs des VNets
- Commandes ping prêtes à l'emploi
- URL de la health probe

### `cloud-init.yaml`
Script de provisionnement exécuté automatiquement au premier démarrage des VMs. Installe et configure : Docker, Node.js LTS, PM2, Nginx (reverse proxy :80 → :3000 + endpoint `/health`), Python 3, Azure CLI, GitHub CLI, Supabase CLI, Terraform, ufw et fail2ban.

### `pre-check.sh`
Script bash de validation pré-déploiement en 8 étapes (voir section dédiée ci-dessous). Détecte les problèmes avant `terraform apply` pour éviter les erreurs en cours de déploiement.

---

##  Déploiement pas à pas

### Étape 1 - Répertoire de travail

```powershell
New-Item -Path "$HOME/clouddrive/hub-spoke-norway" -ItemType Directory
Set-Location "$HOME/clouddrive/hub-spoke-norway"
```

Copiez tous les fichiers du projet dans ce répertoire (`providers.tf`, `variables.tf`, `terraform.tfvars`, `main.tf`, `outputs.tf`, `cloud-init.yaml`, `pre-check.sh`).

> On travaille dans `clouddrive` pour que tous les fichiers (clés SSH, config Terraform) persistent entre les sessions Cloud Shell et soient téléchargeables.

---

### Étape 2 - Clé SSH

```powershell
ssh-keygen -t rsa -b 4096 -f "$HOME/clouddrive/hubspoke_rsa" -N ""
```

Vérifiez qu'aucune passphrase n'est requise lors de la connexion à la VM :

```powershell
ssh-keygen -y -f "$HOME/clouddrive/hubspoke_rsa"
# Affiche la clé publique sans demander de passphrase
```

> Note : La syntaxe `-N '""'` crée une passphrase non vide et bloque la connexion SSH ainsi que la lecture par Terraform.

---

### Étape 3 - Vérification pré-déploiement

Le script `pre-check.sh` effectue **8 catégories de vérifications** avant que vous n'exécutiez `terraform apply` :

| Étape | Vérifications |
|---|---|
| 1. Outils | terraform, az cli, ssh-keygen, git, curl, jq |
| 2. Fichiers | providers.tf, variables.tf, main.tf, outputs.tf, terraform.tfvars, cloud-init.yaml |
| 3. Clé SSH | Existence, permissions 600, format RSA, absence de passphrase |
| 4. terraform.tfvars | Cohérence des valeurs clés (rg_name, location, admin_username…) |
| 5. cloud-init.yaml | En-tête `#cloud-config`, endpoint `/health`, proxy_pass :3000, syntaxe YAML |
| 6. Terraform | `terraform fmt --check`, `terraform init`, `terraform validate` |
| 7. Azure | Authentification, région, conflits de noms (VNets, Firewall, LB, Bastion) |
| 8. CIDRs | Plan d'adressage affiché, détection de chevauchements |

```bash
# Rendre le script exécutable
chmod +x pre-check.sh

# Lancer avec vérifications Azure 
./pre-check.sh

# Lancer sans les vérifications Azure CLI
./pre-check.sh --skip-azure
```

**Codes de sortie :**
- `0` - Tous les checks passés → vous pouvez continuer
- `0` avec avertissements - Des warnings détectés, relisez-les
- `1` - Des erreurs bloquantes → corrigez avant de continuer

**Exemple de sortie réussie :**
```
1. **Outils requis**
  ✔  Terraform — Terraform v1.8.5
  ✔  Azure CLI — azure-cli 2.x.x
  ✔  ssh-keygen — OpenSSH_8.9p1

3. **Clé SSH**
  ✔  Clé privée trouvée : /home/user/clouddrive/hubspoke_rsa
  ✔  Permissions clé privée : 600
  ✔  Clé privée sans passphrase (compatible Terraform/Bastion)

6. **Validation Terraform**
  ✔  terraform fmt : fichiers correctement formatés
  ✔  terraform init réussi
  ✔  terraform validate : configuration valide

  ✔ Succès   : 28
  ⚠ Avertissements : 0
  ✘ Erreurs  : 0

  ✔ Tous les checks sont passés - prêt pour terraform plan !
```

---

### Étape 4 - Initialisation Terraform

```powershell
terraform init
```
---

### Étape 5 - Formater et valider

```powershell
terraform fmt
terraform validate
```
---

### Étape 6 - Prévisualiser le déploiement

```powershell
terraform plan
```

On peut sauvegarder le plan pour un apply déterministe :

```powershell
terraform plan -out=hub-spoke.tfplan
```

---

### Étape 7 - Déployer l'infrastructure

```powershell
terraform apply -auto-approve
# ou, avec le plan sauvegardé :
terraform apply hub-spoke.tfplan
```

Confirmez avec `yes` si vous n'avez pas utilisé `-auto-approve`. Le déploiement prend **15 à 25 minutes**.

> Note : Les VMs sont créées, mais **l'installation des logiciels continue en arrière-plan** au niveau des 2 VMs pendant 5 à 8 minutes via cloud-init.

#### Note  : le`firewall_public_ip`  a été ajouté dans les règles réseau du projet Supabase pour autoriser les connexions PostgreSQL depuis Azure.

---

### Étape 8 - Connexion via Azure Bastion

1. Ouvrez le **portail Azure** → **Machines virtuelles**
2. Sélectionnez `VM-SPOKE-1`
3. Cliquez sur **Se connecter** → **Bastion**
4. Renseignez :
   - **Nom d'utilisateur** : `scripttools_plgEstiam`
   - **Type d'authentification** : Clé privée SSH
   - **Clé privée** : contenu de `hubspoke_rsa`
5. Cliquez sur **Se connecter**

> Pour télécharger la clé privée depuis Cloud Shell : icône ⬆⬇ → **Télécharger** → `clouddrive/hubspoke_rsa`

On vérifie l'état d'installation des logiciels sur chaque VM.

```bash
sudo cloud-init status --wait
```

## Logiciels installés via cloud-init

| Catégorie | Logiciel | Usage |
|---|---|---|
| Process Manager | **PM2** | Gestion Node.js en production — auto-restart, logs, persist reboot |
| Web Server | **Nginx** | Reverse proxy HTTP :80 → app Node.js :3000 + endpoint `/health` |
| Conteneurs | Docker Engine | Conteneurisation |
| Conteneurs | Docker Compose v2 | Orchestration multi-conteneurs |
| Runtime | Node.js LTS + npm | JavaScript / backend |
| Runtime | Python 3 + pip + venv | Scripts / API |
| Versioning | Git | Contrôle de source |
| CLI Git | GitHub CLI (`gh`) | PRs, issues, releases |
| Base de données | PostgreSQL client (`psql`) | Connexion directe Supabase |
| Base de données | Redis client | Cache / queues |
| CLI Cloud | Supabase CLI | Gestion projets Supabase |
| CLI Cloud | Azure CLI | Ressources Azure |
| IaC | Terraform 1.8.5 | Infrastructure as Code |
| npm global | pm2, nodemon, typescript, ts-node, prettier, eslint | Dev Node.js |
| pip global | httpie, rich, fastapi, uvicorn, black, flake8, requests | Dev Python |
| Éditeur | Vim + Nano | Édition terminal |
| Réseau | curl, wget, nmap, dnsutils, netcat, traceroute | Diagnostic |
| Utilitaires | htop, jq, unzip, tree, tmux | Monitoring / productivité |
| Build | build-essential, make | Compilation |
| Sécurité | ufw | Pare-feu applicatif Linux |
| Sécurité | fail2ban | Protection anti brute-force SSH |

Résultat attendu : status: **done**

Pour inspecter les logs d'installation :

```bash
sudo cat /var/log/cloud-init-output.log | tail -50
```

---

### Étape 9- Vérifier les logiciels

```bash
node --version && npm --version
python3 --version
pm2 --version && pm2 status
docker --version && docker compose version
git --version
gh --version
supabase --version
terraform --version
az --version
nginx -v
sudo ufw status

# Test connexion Supabase (PostgreSQL direct)
psql "postgresql://postgres:votre_password@db.xxxxxxxxxxxx.supabase.co:5432/postgres" -c "\l"

# Test Docker 
docker run hello-world
```

---
### Étape 10 - Déployer l'application web

À répéter sur **chaque VM** (VM-SPOKE-1 puis VM-SPOKE-2) via Bastion.

#### Cloner et configurer l'application

```bash
cd ~/projects
git clone https://github.com/votre-org/votre-app.git
cd votre-app

# Variables d'environnement Supabase
cat > .env << EOF
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=votre_anon_key
DATABASE_URL=postgresql://postgres:votre_password@db.xxxxxxxxxxxx.supabase.co:5432/postgres
PORT=3000
NODE_ENV=production
EOF

npm install
npm run build   
```

#### Lancer avec PM2

```bash
# Démarrer l'application
pm2 start npm --name "webapp" -- start
# ou pour une app Express/Node classique :
# pm2 start server.js --name "webapp"

# Persister la liste PM2 au reboot
pm2 save

# Vérifier
pm2 status
pm2 logs webapp --lines 50
```

#### Vérifier le reverse proxy Nginx

```bash
curl http://localhost/health   # doit retourner OK
curl http://localhost          # doit retourner l'app
sudo nginx -t                  # vérifie la configuration Nginx
```

> Une fois l'app déployée sur les deux VMs, le Load Balancer distribue automatiquement le trafic entre elles.


---

### Étape 11 - Tester le Load Balancer

Depuis **Cloud Shell PowerShell** :

```powershell
$LB_IP = terraform output -raw load_balancer_public_ip

# Test Health Probe
Invoke-WebRequest -Uri "http://$LB_IP/health" -UseBasicParsing

# Plusieurs appels pour vérifier la distribution
1..5 | ForEach-Object {
    $r = Invoke-WebRequest -Uri "http://$LB_IP" -UseBasicParsing
    Write-Host "Appel $_ : $($r.StatusCode)"
    Start-Sleep 1
}
```

Depuis un **navigateur** : ouvrez `http://<LB_IP>`

On vérifie l'état du backend pool :

```powershell
az network lb show `
  -g RG-HUB-SPOKE-PROJECT `
  -n LB-HUB-SPOKE `
  --query "backendAddressPools[0].backendIPConfigurations[*].id" `
  -o table
```

> Le Health Probe sonde `/health` toutes les 15 secondes. Si une VM est indisponible, tout le trafic bascule automatiquement sur l'autre.

---

### Étape 12 - Tester la connectivité inter-spoke

Les VMs sont dans `VnetHub`. On teste le routage inter-spoke via le Firewall, depuis `VM-SPOKE-1` :

```bash
# Ping vers VM-SPOKE-2
ping 10.0.11.4

# Ping vers un subnet Spoke pour valider les UDR + Firewall
ping 192.168.0.1
```

---

### Étape 13 - Inspecter l'état Terraform

```powershell
terraform state list

terraform output load_balancer_public_ip
terraform output web_url
terraform output vm_spoke1_private_ip
terraform output vm_spoke2_private_ip

terraform state show azurerm_lb.lb
terraform state show azurerm_linux_virtual_machine.vm_spoke1
terraform state show azurerm_subnet.hub_vm1
```

---

## Ports ouverts (NSG)

| Port | Protocole | Usage | Priorité |
|---|---|---|---|
| 22 | TCP | SSH — accès via Azure Bastion | 100 |
| 80 | TCP | HTTP — Load Balancer + Health Probe Nginx | 110 |
| 443 | TCP | HTTPS | 120 |
| 3000 | TCP | Application Node.js (accès direct / debug) | 130 |
| 3001 | TCP | Application Node.js secondaire | 135 |
| 5432 | TCP | PostgreSQL / Supabase connexion directe | 140 |
| 54321 | TCP | Supabase Studio / API locale | 150 |
| 8080 | TCP | HTTP alternatif | 160 |
| 8443 | TCP | HTTPS alternatif | 165 |
| ICMP | — | Ping inter-VM | 200 |
| `*` | `*` | Health Probe Azure Load Balancer | 210 |

---

## Résumé des commandes

| Étape | Commande clé | Durée |
|---|---|---|
| 1 - Répertoire | `New-Item` / `Set-Location` | < 1 min |
| 2 - Clé SSH | `ssh-keygen -t rsa -b 4096 -N ""` | < 1 min |
| 3 - Pre-check | `./pre-check.sh` | 1–2 min |
| 4 - Init | `terraform init` | 1 min |
| 5 - Validation | `terraform fmt && terraform validate` | < 1 min |
| 6 - Plan | `terraform plan -out=hub-spoke.tfplan` | 1 min |
| 7 - Déploiement | `terraform apply hub-spoke.tfplan` | **15–25 min** |
| 8 - Bastion | Portail Azure → Se connecter → Bastion | 2 min |
| 9 - App web | `pm2 start npm --name "webapp" -- start && pm2 save` | 5 min |
| 10 - Logiciels | `pm2 status && docker --version` | < 1 min |
| 11 - LB test | `Invoke-WebRequest -Uri "http://<LB_IP>/health"` | < 1 min |
| 12 - Ping | `ping 10.0.11.4` (VM1 → VM2) | < 1 min |
| 13 - Inspection | `terraform state list` | < 1 min |

---

## Dépannage

| Problème | Cause probable | Solution |
|---|---|---|
| `Enter passphrase for key` | Clé générée avec `-N '""'` | Régénérez avec `-N ""` |
| `Permission denied (publickey)` | Mauvaise clé dans Bastion | Chargez `hubspoke_rsa` (clé **privée**) |
| `file: no such file` Terraform | Clé publique introuvable | `ls ~/clouddrive/hubspoke_rsa.pub` |
| Health Probe LB en échec | Nginx ou app non démarrée | `pm2 status` + `sudo systemctl status nginx` |
| `502 Bad Gateway` | App Node.js non démarrée sur :3000 | `pm2 logs webapp` |
| LB ne route pas le trafic | NIC non dans le Backend Pool | Vérifiez `azurerm_network_interface_backend_address_pool_association` |
| `BackendIPConfigurationsDontUseSameVnet` | NICs dans des VNets différents | Corrigé : VMs dans `SubnetVM1` / `SubnetVM2` du Hub |
| Connexion Supabase refusée | IP non autorisée côté Supabase | Ajoutez `firewall_public_ip` dans les règles réseau Supabase |
| `cloud-init: running` après 15 min | Erreur d'installation | `sudo cat /var/log/cloud-init-output.log` |
| `docker: permission denied` | Groupe docker non rechargé | Déconnectez et reconnectez la session Bastion |
| App PM2 perdue au reboot | `pm2 save` oublié | `pm2 save && sudo systemctl enable pm2-azure_admin` |
| `Error: resource already exists` | RG déjà existant | `terraform destroy` puis `terraform apply` |
| pre-check.sh : erreurs de fmt | Formatage incorrect | `terraform fmt` puis relancez le script |
| pre-check.sh : validate échoué | Erreur de syntaxe HCL | Lisez l'output détaillé dans le terminal |

---

## Nettoyage

Pour supprimer **toutes les ressources** et stopper la facturation :

```powershell
terraform destroy
```

Confirmez avec `yes`. Terraform supprime les 36 ressources dans le bon ordre de dépendances.

> Les fichiers `hubspoke_rsa`, `hubspoke_rsa.pub`, `cloud-init.yaml` et tous les fichiers `.tf` dans `clouddrive` ne sont **pas supprimés** par Terraform. Vous pouvez les réutiliser pour un prochain déploiement.

Pour supprimer uniquement le Resource Group via Azure CLI (Choix 2) :

```powershell
az group delete --name RG-HUB-SPOKE-PROJECT --yes --no-wait
```

> Cette commande supprime les ressources Azure mais **ne met pas à jour le state Terraform**. On utilise `terraform destroy` pour maintenir la cohérence du state.


Pour supprimer le répertoire de travail : 

```powershell
Remove-Item -Recurse -Force ./clouddrive
```

## FIN DU DEPLOIEMENT : SCRIPT HUB TOOLS / PLG - 2026 / Groupe - 24 / ESTIAM Paris
---


