#!/usr/bin/env bash
# ============================================================
# pre-check.sh - Vérification pré-déploiement PLG - 2026 Groupe-24 ESTIAM - Paris
# ============================================================
# Ce fichier permet de détecter les problèmes courants : fichiers manquants, clés SSH, outils,
# conflits de noms Azure, CIDR, etc.
#
# Usage :
#   chmod +x pre-check.sh          
#   ./pre-check.sh                 # exécute tous les checks
#   ./pre-check.sh --skip-azure    # ignore les checks Azure CLI
# ============================================================

set -euo pipefail

# ---- Couleurs -----------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ---- Compteurs ----------------------------------------------
ERRORS=0
WARNINGS=0
PASSED=0

# ---- Options ------------------------------------------------
SKIP_AZURE=false
for arg in "$@"; do
  [[ "$arg" == "--skip-azure" ]] && SKIP_AZURE=true
done

# ============================================================
# Helpers
# ============================================================
pass()    { echo -e "  ${GREEN}✔${RESET}  $*"; ((PASSED++)); }
warn()    { echo -e "  ${YELLOW}⚠${RESET}  $*"; ((WARNINGS++)); }
fail()    { echo -e "  ${RED}✘${RESET}  $*"; ((ERRORS++)); }
section() { echo -e "\n${CYAN}${BOLD}▶ $*${RESET}"; }
info()    { echo -e "  ${BLUE}ℹ${RESET}  $*"; }

# ============================================================
# Ces variables doivent correspondre à terraform.tfvars)
# ============================================================
RG_NAME="RG-PLG-ESTIAM-Paris-2026"
LOCATION="norwayeast"
SSH_KEY_PATH="${HOME}/clouddrive/hubspoke_rsa"
CLOUD_INIT_FILE="cloud-init.yaml"
TFVARS_FILE="terraform.tfvars"

HUB_VNET="VnetHub"
SPOKE1_VNET="VnetSpoke1"
SPOKE2_VNET="VnetSpoke2"
FIREWALL_NAME="AzureFireWall"
LB_NAME="LB-HUB-SPOKE"
BASTION_NAME="AzureBastion"

# CIDR (IP)
HUB_CIDR="10.0.0.0/16"
SPOKE1_CIDR="192.168.0.0/24"
SPOKE2_CIDR="172.16.0.0/24"
SUBNET_FW="10.0.2.0/24"
SUBNET_BASTION="10.0.4.0/24"
SUBNET_HUB_PROD="10.0.1.0/24"
SUBNET_VM1="10.0.10.0/24"
SUBNET_VM2="10.0.11.0/24"

# ============================================================
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║   PRE-CHECK — AZ-PRO-HUB-SPOKE-NORWAY               ║${RESET}"
echo -e "${BOLD}║   Vérification avant terraform apply                 ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""

# ============================================================
section "1. Outils requis"
# ============================================================

check_tool() {
  local cmd="$1"
  local label="${2:-$1}"
  if command -v "$cmd" &>/dev/null; then
    local version
    version=$("$cmd" --version 2>&1 | head -1 | tr -d '\n')
    pass "$label — $version"
  else
    fail "$label introuvable (installez-le ou lancez depuis Azure Cloud Shell)"
  fi
}

check_tool terraform  "Terraform"
check_tool az         "Azure CLI"
check_tool ssh-keygen "ssh-keygen"
check_tool git        "Git"
check_tool curl       "curl"
check_tool jq         "jq"

# ============================================================
section "2. Fichiers du projet"
# ============================================================

check_file() {
  local f="$1"
  local label="${2:-$f}"
  if [[ -f "$f" ]]; then
    local size
    size=$(wc -c < "$f")
    pass "$label (${size} octets)"
  else
    fail "$label introuvable — chemin : $f"
  fi
}

check_file "providers.tf"     "providers.tf"
check_file "variables.tf"     "variables.tf"
check_file "main.tf"          "main.tf"
check_file "outputs.tf"       "outputs.tf"
check_file "$TFVARS_FILE"     "terraform.tfvars"
check_file "$CLOUD_INIT_FILE" "cloud-init.yaml"

# Vérification taille minimale du cloud-init (> 500 octets)
if [[ -f "$CLOUD_INIT_FILE" ]]; then
  CI_SIZE=$(wc -c < "$CLOUD_INIT_FILE")
  if (( CI_SIZE < 500 )); then
    warn "cloud-init.yaml semble trop petit (${CI_SIZE} octets) — vérifiez le contenu"
  fi
  # Vérifie l'en-tête obligatoire
  if head -1 "$CLOUD_INIT_FILE" | grep -q "^#cloud-config"; then
    pass "cloud-init.yaml commence par #cloud-config"
  else
    fail "cloud-init.yaml ne commence pas par '#cloud-config' (ligne 1)"
  fi
fi

# ============================================================
section "3. Clé SSH"
# ============================================================

if [[ -f "${SSH_KEY_PATH}" ]]; then
  pass "Clé privée trouvée : ${SSH_KEY_PATH}"
  # Vérifier permissions (600)
  PERMS=$(stat -c "%a" "${SSH_KEY_PATH}" 2>/dev/null || stat -f "%Lp" "${SSH_KEY_PATH}" 2>/dev/null || echo "unknown")
  if [[ "$PERMS" == "600" ]]; then
    pass "Permissions clé privée : 600"
  else
    warn "Permissions clé privée : ${PERMS} (recommandé : 600) — corrigez avec : chmod 600 ${SSH_KEY_PATH}"
  fi
else
  fail "Clé privée introuvable : ${SSH_KEY_PATH}"
  info "Générez-la avec : ssh-keygen -t rsa -b 4096 -f ${SSH_KEY_PATH} -N \"\""
fi

if [[ -f "${SSH_KEY_PATH}.pub" ]]; then
  pass "Clé publique trouvée : ${SSH_KEY_PATH}.pub"
  # Vérification format RSA
  if head -1 "${SSH_KEY_PATH}.pub" | grep -q "^ssh-rsa "; then
    pass "Format clé publique : RSA valide"
  else
    warn "La clé publique ne semble pas être au format RSA — vérifiez avec : cat ${SSH_KEY_PATH}.pub"
  fi
else
  fail "Clé publique introuvable : ${SSH_KEY_PATH}.pub"
fi

# Test passphrase (ne doit PAS en demander)
if [[ -f "${SSH_KEY_PATH}" ]]; then
  if ssh-keygen -y -P "" -f "${SSH_KEY_PATH}" &>/dev/null; then
    pass "Clé privée sans passphrase (compatible Terraform/Bastion)"
  else
    fail "Clé privée protégée par passphrase — Terraform ne peut pas la lire automatiquement"
    info "Régénérez avec : ssh-keygen -t rsa -b 4096 -f ${SSH_KEY_PATH} -N \"\""
  fi
fi

# ============================================================
section "4. Cohérence terraform.tfvars"
# ============================================================

check_tfvar() {
  local key="$1"
  local expected="$2"
  local actual
  actual=$(grep -E "^\s*${key}\s*=" "$TFVARS_FILE" 2>/dev/null | head -1 | sed 's/.*=\s*//' | tr -d '"' | tr -d ' ' | tr -d '\r' || echo "")
  if [[ -z "$actual" ]]; then
    warn "Variable '$key' absente de terraform.tfvars"
  elif [[ "$actual" == "$expected" ]]; then
    pass "$key = \"$actual\""
  else
    warn "$key = \"$actual\" (attendu : \"$expected\")"
  fi
}

if [[ -f "$TFVARS_FILE" ]]; then
  check_tfvar "rg_name"       "$RG_NAME"
  check_tfvar "location"      "$LOCATION"
  check_tfvar "admin_username" "scripttools_plgEstiam"
  check_tfvar "lb_name"       "$LB_NAME"
  check_tfvar "firewall_name" "$FIREWALL_NAME"
else
  warn "terraform.tfvars introuvable — checks de cohérence ignorés"
fi

# ============================================================
section "5. Validation YAML cloud-init"
# ============================================================

if [[ -f "$CLOUD_INIT_FILE" ]]; then
  # Vérification des sections critiques
  for section_name in "package_update" "packages" "runcmd" "nginx" "pm2" "ufw"; do
    if grep -q "$section_name" "$CLOUD_INIT_FILE"; then
      pass "Section/mot-clé '$section_name' présent dans cloud-init.yaml"
    else
      warn "Section/mot-clé '$section_name' absente de cloud-init.yaml"
    fi
  done

  # Vérification du endpoint /health Nginx
  if grep -q "/health" "$CLOUD_INIT_FILE"; then
    pass "Endpoint Nginx /health présent (requis pour le health probe LB)"
  else
    fail "Endpoint Nginx /health manquant — le Load Balancer ne pourra pas sonder les backends"
  fi

  # Vérification proxy_pass vers :3000
  if grep -q "proxy_pass.*3000" "$CLOUD_INIT_FILE"; then
    pass "Nginx reverse proxy → :3000 configuré"
  else
    warn "proxy_pass vers :3000 non trouvé dans cloud-init.yaml"
  fi

  # Validation syntaxe YAML si python3/PyYAML disponible
  if command -v python3 &>/dev/null; then
    if python3 -c "import yaml; yaml.safe_load(open('$CLOUD_INIT_FILE'))" 2>/dev/null; then
      pass "Syntaxe YAML valide (python3 yaml)"
    else
      fail "Syntaxe YAML invalide dans cloud-init.yaml — corrigez avant de déployer"
    fi
  else
    warn "python3 non disponible — validation YAML ignorée"
  fi
fi

# ============================================================
section "6. Validation Terraform (fmt + validate)"
# ============================================================

if command -v terraform &>/dev/null; then

  # terraform fmt --verification (formatage)
  if terraform fmt -check -recursive . &>/dev/null; then
    pass "terraform fmt : fichiers correctement formatés"
  else
    warn "terraform fmt : formatage à corriger — lancez : terraform fmt"
  fi

  # terraform init (mode silencieux)
  info "Initialisation Terraform (terraform init)..."
  if terraform init -input=false -no-color &>/dev/null; then
    pass "terraform init réussi"
  else
    fail "terraform init échoué - vérifiez la connectivité réseau et le provider"
  fi

  # terraform validate
  info "Validation de la configuration (terraform validate)..."
  VALIDATE_OUTPUT=$(terraform validate -no-color 2>&1)
  if echo "$VALIDATE_OUTPUT" | grep -q "Success"; then
    pass "terraform validate : configuration valide"
  else
    fail "terraform validate échoué :"
    echo "$VALIDATE_OUTPUT" | sed 's/^/      /'
  fi
else
  warn "Terraform non disponible — validation ignorée"
fi

# ============================================================
section "7. Vérifications Azure (az cli)"
# ============================================================

if [[ "$SKIP_AZURE" == "true" ]]; then
  warn "Checks Azure ignorés (--skip-azure)"
else
  # Authentification
  if az account show &>/dev/null; then
    ACCOUNT=$(az account show --query "{name:name, id:id, user:user.name}" -o tsv 2>/dev/null | tr '\t' ' ')
    pass "Connecté à Azure : $ACCOUNT"
  else
    fail "Non connecté à Azure — lancez : az login"
    info "Les checks Azure suivants sont ignorés"
    SKIP_AZURE=true
  fi
fi

if [[ "$SKIP_AZURE" != "true" ]]; then

  # Région valide
  if az account list-locations --query "[?name=='${LOCATION}'].name" -o tsv 2>/dev/null | grep -q "$LOCATION"; then
    pass "Région '$LOCATION' disponible"
  else
    fail "Région '$LOCATION' introuvable dans votre abonnement"
  fi

  # Resource Group existant ?
  if az group show -n "$RG_NAME" &>/dev/null; then
    warn "Resource Group '$RG_NAME' existe déjà — terraform apply pourrait échouer si les ressources dedans sont en conflit"
    info "Pour repartir de zéro : terraform destroy, puis terraform apply"
  else
    pass "Resource Group '$RG_NAME' n'existe pas encore (sera créé)"
  fi

  # Quotas Firewall (Standard) - vérifie que le SKU est disponible
  info "Vérification quota Azure Firewall Standard..."
  FW_QUOTA=$(az vm list-usage --location "$LOCATION" --query "[?name.value=='standardBSFamily'].currentValue" -o tsv 2>/dev/null || echo "N/A")
  if [[ "$FW_QUOTA" != "N/A" ]]; then
    pass "Quota région accessible (Standard_B family : ${FW_QUOTA} utilisés)"
  else
    warn "Impossible de vérifier les quotas — vérifiez manuellement dans le portail Azure"
  fi

  # VNets en conflit ?
  for vnet in "$HUB_VNET" "$SPOKE1_VNET" "$SPOKE2_VNET"; do
    if az network vnet show -g "$RG_NAME" -n "$vnet" &>/dev/null 2>&1; then
      warn "VNet '$vnet' existe déjà dans '$RG_NAME'"
    else
      pass "VNet '$vnet' disponible (pas de conflit)"
    fi
  done

  # Firewall existant ?
  if az network firewall show -g "$RG_NAME" -n "$FIREWALL_NAME" &>/dev/null 2>&1; then
    warn "Firewall '$FIREWALL_NAME' existe déjà dans '$RG_NAME'"
  else
    pass "Firewall '$FIREWALL_NAME' disponible (pas de conflit)"
  fi

  # Load Balancer existant ?
  if az network lb show -g "$RG_NAME" -n "$LB_NAME" &>/dev/null 2>&1; then
    warn "Load Balancer '$LB_NAME' existe déjà dans '$RG_NAME'"
  else
    pass "Load Balancer '$LB_NAME' disponible (pas de conflit)"
  fi

  # Bastion existant ?
  if az network bastion show -g "$RG_NAME" -n "$BASTION_NAME" &>/dev/null 2>&1; then
    warn "Bastion '$BASTION_NAME' existe déjà dans '$RG_NAME'"
  else
    pass "Bastion '$BASTION_NAME' disponible (pas de conflit)"
  fi

fi

# ============================================================
section "8. Résumé des CIDRs"
# ============================================================

info "Plan d'adressage attendu :"
echo ""
printf "  %-30s %s\n" "VNet Hub"          "$HUB_CIDR"
printf "  %-30s %s\n" "  └─ AzureFirewallSubnet"   "$SUBNET_FW"
printf "  %-30s %s\n" "  └─ AzureBastionSubnet"    "$SUBNET_BASTION"
printf "  %-30s %s\n" "  └─ Prod (Hub)"             "$SUBNET_HUB_PROD"
printf "  %-30s %s\n" "  └─ SubnetVM1 (VM-SPOKE-1)" "$SUBNET_VM1"
printf "  %-30s %s\n" "  └─ SubnetVM2 (VM-SPOKE-2)" "$SUBNET_VM2"
printf "  %-30s %s\n" "VNet Spoke 1"      "$SPOKE1_CIDR"
printf "  %-30s %s\n" "  └─ Prod (Spoke1)"          "$SPOKE1_CIDR"
printf "  %-30s %s\n" "VNet Spoke 2"      "$SPOKE2_CIDR"
printf "  %-30s %s\n" "  └─ Prod (Spoke2)"          "$SPOKE2_CIDR"
echo ""

# Vérification chevauchement basique
overlap_check() {
  local name1="$1" cidr1="$2" name2="$3" cidr2="$4"
  # Comparaison simple : même préfixe de classe
  local prefix1 prefix2
  prefix1=$(echo "$cidr1" | cut -d'.' -f1-2)
  prefix2=$(echo "$cidr2" | cut -d'.' -f1-2)
  if [[ "$prefix1" == "$prefix2" && "$cidr1" != "$cidr2" ]]; then
    warn "Possible chevauchement entre $name1 ($cidr1) et $name2 ($cidr2)"
  fi
}

overlap_check "Hub" "$HUB_CIDR" "Spoke1" "$SPOKE1_CIDR"
overlap_check "Hub" "$HUB_CIDR" "Spoke2" "$SPOKE2_CIDR"
overlap_check "Spoke1" "$SPOKE1_CIDR" "Spoke2" "$SPOKE2_CIDR"
pass "Vérification chevauchement CIDR (basique) terminée"

# ============================================================
# Résumé final
# ============================================================
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║   RÉSUMÉ                                             ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${GREEN}✔ Succès   :${RESET} $PASSED"
echo -e "  ${YELLOW}⚠ Avertissements :${RESET} $WARNINGS"
echo -e "  ${RED}✘ Erreurs  :${RESET} $ERRORS"
echo ""

if (( ERRORS > 0 )); then
  echo -e "${RED}${BOLD}  ✘ Corrigez les erreurs ci-dessus avant de continuer.${RESET}"
  echo ""
  exit 1
elif (( WARNINGS > 0 )); then
  echo -e "${YELLOW}${BOLD}  ⚠ Des avertissements ont été détectés — relisez-les.${RESET}"
  echo -e "${GREEN}  Vous pouvez continuer avec : terraform plan${RESET}"
  echo ""
  exit 0
else
  echo -e "${GREEN}${BOLD}  ✔ Tous les checks sont passés — prêt pour terraform plan !${RESET}"
  echo ""
  echo -e "  Lancez maintenant :"
  echo -e "  ${CYAN}  terraform plan${RESET}"
  echo -e "  ${CYAN}  terraform apply${RESET}"
  echo ""
  exit 0
fi
