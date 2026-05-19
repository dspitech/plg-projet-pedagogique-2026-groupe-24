# ============================================================
# PLG - 2026 / Groupe 24 : ESTIAM - Paris
# terraform.tfvars - Valeurs des variables
# ============================================================
# Ce fichier est chargé automatiquement par Terraform. Il contient les valeurs des variables déclarées dans variables.tf.
# ============================================================

# ----------------------------
# Général
# ----------------------------
rg_name  = "RG-PLG-ESTIAM-Paris-2026"
location = "norwayeast"

# ----------------------------
# Authentification VMs
# ----------------------------
admin_username      = "scripttools_plgEstiam"
ssh_public_key_path = "~/clouddrive/hubspoke_rsa.pub"

# ----------------------------
# VNets
# ----------------------------
hub_vnet_name        = "VnetHub"
hub_address_space    = ["10.0.0.0/16"]
spoke1_vnet_name     = "VnetSpoke1"
spoke1_address_space = ["192.168.0.0/24"]
spoke2_vnet_name     = "VnetSpoke2"
spoke2_address_space = ["172.16.0.0/24"]

# ----------------------------
# Subnets Hub
# ----------------------------
subnet_firewall_prefix = "10.0.2.0/24"
subnet_bastion_prefix  = "10.0.4.0/24"
subnet_hub_prod_prefix = "10.0.1.0/24"
subnet_vm1_prefix      = "10.0.10.0/24"
subnet_vm2_prefix      = "10.0.11.0/24"

# ----------------------------
# Subnets Spokes
# ----------------------------
spoke1_prod_prefix = "192.168.0.0/24"
spoke2_prod_prefix = "172.16.0.0/24"

# ----------------------------
# VMs
# ----------------------------
vm_size         = "Standard_B2s"
cloud_init_path = "cloud-init.yaml"

vm_image = {
  publisher = "Canonical"
  offer     = "0001-com-ubuntu-server-jammy"
  sku       = "22_04-lts-gen2"
  version   = "latest"
}

# ----------------------------
# Load Balancer
# ----------------------------
lb_name           = "LB-HUB-SPOKE"
lb_probe_interval = 15
lb_probe_count    = 2

# ----------------------------
# Firewall
# ----------------------------
firewall_name = "AzureFireWall"

# ----------------------------
# Tags
# ----------------------------
tags = {
  Project     = "Deployment-Script-Tools"
  Environment = "Production"
  ManagedBy   = "Terraform"
  Author      = "PLG-Groupe24-ESTIAM-2026"
}
