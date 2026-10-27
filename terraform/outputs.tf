output "public_ip_address" {
  value       = azurerm_public_ip.pip.ip_address
  description = "Public IP of the VM"
}

output "vm_name" {
  value       = azurerm_linux_virtual_machine.vm.name
  description = "Name of the VM"
}

output "ssh_command" {
  value       = "ssh -i ~/.ssh/azure_vm_key @"
  description = "SSH command to connect"
}
