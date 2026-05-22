# ============================================================
# PLG - 2026 / Groupe 24 : ESTIAM - Paris
# variables.tf - Déclarations des variables 
# ============================================================

# ----------------------------
# Général
# ----------------------------
variable "rg_name" {
  description = "Nom du Resource Group Azure"
  type        = string
  default     = "RG-PLG-ESTIAM-Paris-2026"
}


variable "location" {
  description = "Région Azure cible"
  type        = string
  default     = "norwayeast"
}

# ----------------------------
# Authentification VMs
# ----------------------------
variable "admin_username" {
  description = "Nom du compte administrateur sur les VMs Linux"
  type        = string
  default     = "scripttools_plgEstiam"
}

variable "ssh_public_key_path" {
  description = "Chemin vers la clé publique SSH pour les VMs"
  type        = string
  default     = "~/clouddrive/hubspoke_rsa.pub"
}

# ----------------------------
# Réseau - VNets
# ----------------------------
variable "hub_vnet_name" {
  description = "Nom du VNet Hub"
  type        = string
  default     = "VnetHub"
}

variable "hub_address_space" {
  description = "Espace d'adressage du VNet Hub"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "spoke1_vnet_name" {
  description = "Nom du VNet Spoke 1"
  type        = string
  default     = "VnetSpoke1"
}

variable "spoke1_address_space" {
  description = "Espace d'adressage du VNet Spoke 1"
  type        = list(string)
  default     = ["192.168.0.0/24"]
}

variable "spoke2_vnet_name" {
  description = "Nom du VNet Spoke 2"
  type        = string
  default     = "VnetSpoke2"
}

variable "spoke2_address_space" {
  description = "Espace d'adressage du VNet Spoke 2"
  type        = list(string)
  default     = ["172.16.0.0/24"]
}

# ----------------------------
# Réseau - Subnets Hub
# ----------------------------
variable "subnet_firewall_prefix" {
  description = "CIDR du subnet Azure Firewall (nom imposé par Azure : AzureFirewallSubnet)"
  type        = string
  default     = "10.0.2.0/24"
}

variable "subnet_bastion_prefix" {
  description = "CIDR du subnet Azure Bastion (nom imposé par Azure : AzureBastionSubnet)"
  type        = string
  default     = "10.0.4.0/24"
}

variable "subnet_hub_prod_prefix" {
  description = "CIDR du subnet Prod du Hub (ressources communes)"
  type        = string
  default     = "10.0.1.0/24"
}

variable "subnet_vm1_prefix" {
  description = "CIDR du subnet hébergeant VM-SPOKE-1 (dans Hub)"
  type        = string
  default     = "10.0.10.0/24"
}

variable "subnet_vm2_prefix" {
  description = "CIDR du subnet hébergeant VM-SPOKE-2 (dans Hub)"
  type        = string
  default     = "10.0.11.0/24"
}

# ----------------------------
# Réseau - Subnets Spokes
# ----------------------------
variable "spoke1_prod_prefix" {
  description = "CIDR du subnet Prod dans VNet Spoke 1"
  type        = string
  default     = "192.168.0.0/24"
}

variable "spoke2_prod_prefix" {
  description = "CIDR du subnet Prod dans VNet Spoke 2"
  type        = string
  default     = "172.16.0.0/24"
}

# ----------------------------
# Machines Virtuelles
# ----------------------------
variable "vm_size" {
  description = "Taille des VMs Azure (SKU)"
  type        = string
  default     = "Standard_B2s"
}

variable "vm_image" {
  description = "Image source des VMs Linux"
  type = object({
    publisher = string
    offer     = string
    sku       = string
    version   = string
  })
  default = {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }
}

variable "cloud_init_path" {
  description = "Chemin vers le fichier cloud-init.yaml"
  type        = string
  default     = "cloud-init.yaml"
}

# ----------------------------
# Load Balancer
# ----------------------------
variable "lb_name" {
  description = "Nom du Load Balancer Standard"
  type        = string
  default     = "LB-HUB-SPOKE"
}

variable "lb_probe_interval" {
  description = "Intervalle en secondes entre les health probes"
  type        = number
  default     = 15
}

variable "lb_probe_count" {
  description = "Nombre de sondes en échec avant de marquer le backend unhealthy"
  type        = number
  default     = 2
}

# ----------------------------
# Firewall
# ----------------------------
variable "firewall_name" {
  description = "Nom de l'Azure Firewall"
  type        = string
  default     = "AzureFireWall"
}

# ----------------------------
# Tags communs
# ----------------------------
variable "tags" {
  description = "Tags appliqués à toutes les ressources"
  type        = map(string)
  default = {
    Project     = "HUB-SPOKE-NORWAY"
    Environment = "Production"
    ManagedBy   = "Terraform"
    Author      = "DSPI-TECH"
  }
}
