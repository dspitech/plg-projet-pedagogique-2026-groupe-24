# ============================================================
# PLG - 2026 / Groupe 24 : ESTIAM - Paris
# outputs.tf — Valeurs exposées après terraform apply
# ============================================================

# ----------------------------
# Load Balancer
# ----------------------------
output "load_balancer_public_ip" {
  description = "IP publique du Load Balancer (point d'entrée web)"
  value       = azurerm_public_ip.lb_pip.ip_address
}

output "web_url" {
  description = "URL publique de l'application web"
  value       = "http://${azurerm_public_ip.lb_pip.ip_address}"
}

# ----------------------------
# Firewall
# ----------------------------
output "firewall_public_ip" {
  description = "IP publique du Firewall (à autoriser côté Supabase)"
  value       = azurerm_public_ip.fw_pip.ip_address
}

output "firewall_private_ip" {
  description = "IP privée du Firewall (next-hop des UDR)"
  value       = azurerm_firewall.firewall.ip_configuration[0].private_ip_address
}

# ----------------------------
# VMs
# ----------------------------
output "vm_spoke1_private_ip" {
  description = "IP privée de VM-SPOKE-1 (SubnetVM1 — 10.0.10.x)"
  value       = azurerm_network_interface.nic_spoke1.private_ip_address
}

output "vm_spoke2_private_ip" {
  description = "IP privée de VM-SPOKE-2 (SubnetVM2 — 10.0.11.x)"
  value       = azurerm_network_interface.nic_spoke2.private_ip_address
}

# ----------------------------
# Bastion
# ----------------------------
output "bastion_name" {
  description = "Nom du service Azure Bastion"
  value       = azurerm_bastion_host.bastion.name
}

output "bastion_public_ip" {
  description = "IP publique d'Azure Bastion"
  value       = azurerm_public_ip.bastion_pip.ip_address
}

# ----------------------------
# Réseau
# ----------------------------
output "hub_vnet_id" {
  description = "Resource ID du VNet Hub"
  value       = azurerm_virtual_network.hub.id
}

output "spoke1_vnet_id" {
  description = "Resource ID du VNet Spoke 1"
  value       = azurerm_virtual_network.spoke1.id
}

output "spoke2_vnet_id" {
  description = "Resource ID du VNet Spoke 2"
  value       = azurerm_virtual_network.spoke2.id
}

# ----------------------------
# Helpers / commandes utiles
# ----------------------------
output "ping_test_vm1_to_vm2" {
  description = "Commande ping depuis VM-SPOKE-1 vers VM-SPOKE-2 (depuis Bastion)"
  value       = "ping ${azurerm_network_interface.nic_spoke2.private_ip_address}"
}

output "ping_test_vm2_to_vm1" {
  description = "Commande ping depuis VM-SPOKE-2 vers VM-SPOKE-1 (depuis Bastion)"
  value       = "ping ${azurerm_network_interface.nic_spoke1.private_ip_address}"
}

output "lb_health_probe_url" {
  description = "URL de la health probe du Load Balancer"
  value       = "http://${azurerm_public_ip.lb_pip.ip_address}/health"
}

output "resource_group_name" {
  description = "Nom du Resource Group (utile pour les commandes az cli)"
  value       = azurerm_resource_group.rg.name
}
