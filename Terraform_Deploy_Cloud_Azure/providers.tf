# ============================================================
# PLG - 2026 / Groupe 24 : ESTIAM - Paris
# providers.tf - Configuration du provider Azure
# ============================================================

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  required_version = ">= 1.2.0"
}

provider "azurerm" {
  features {}
}
