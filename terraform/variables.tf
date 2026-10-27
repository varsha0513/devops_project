variable "subscription_id" {
  description = "Azure subscription ID from environment ARM_SUBSCRIPTION_ID"
  type        = string
  default     = null
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "centralindia"
}

variable "resource_group_name" {
  description = "Resource group name"
  type        = string
  default     = "rg-smartcampus-devops"
}

variable "prefix" {
  description = "Prefix for resources"
  type        = string
  default     = "smartcampus"
}

variable "vm_size" {
  description = "VM size"
  type        = string
  default     = "Standard_B2als_v2"
}

variable "admin_username" {
  description = "Admin username"
  type        = string
  default     = "azureuser"
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key"
  type        = string
  default     = "~/.ssh/azure_vm_key.pub"
}
