param(
  [switch]$SkipBuild,
  [string]$VmIp = "40.80.93.49",
  [string]$KeyPath = "$HOME\.ssh\azure_vm_key"
)

$ErrorActionPreference = "Stop"

function Invoke-Ssh {
  param([string]$Cmd)
  ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -i $KeyPath azureuser@$VmIp $Cmd
  if ($LASTEXITCODE -ne 0) { throw "SSH command failed: $Cmd" }
}

if (-not $SkipBuild) {
  Push-Location "C:\Users\varsh\Smart_campus_issue\frontend"
  try {
    npm ci
    if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }
    $env:VITE_API_BASE_URL = '/'
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
  } finally {
    Pop-Location
  }
} else {
  Write-Host "Skipping frontend build (using existing frontend/dist)"
}

Invoke-Ssh "sudo mkdir -p /var/www/smartcampus /opt/smartcampus && sudo chown -R azureuser:azureuser /var/www/smartcampus /opt/smartcampus"

scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -i $KeyPath -r "C:\Users\varsh\Smart_campus_issue\frontend\dist\*" "azureuser@${VmIp}:/var/www/smartcampus/"
if ($LASTEXITCODE -ne 0) { throw "SCP frontend failed" }

Invoke-Ssh "mkdir -p /opt/smartcampus/app"
scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -i $KeyPath -r "C:\Users\varsh\Smart_campus_issue\backend\app\*" "azureuser@${VmIp}:/opt/smartcampus/app/"
if ($LASTEXITCODE -ne 0) { throw "SCP app failed" }
scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -i $KeyPath "C:\Users\varsh\Smart_campus_issue\backend\requirements.txt" "azureuser@${VmIp}:/opt/smartcampus/requirements.txt"
if ($LASTEXITCODE -ne 0) { throw "SCP requirements failed" }

Invoke-Ssh "rm -rf /tmp/deploy && mkdir -p /tmp/deploy"
scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -i $KeyPath -r "C:\Users\varsh\Smart_campus_issue\deploy\nginx-smartcampus.conf" "C:\Users\varsh\Smart_campus_issue\deploy\smartcampus.service" "C:\Users\varsh\Smart_campus_issue\deploy\remote_setup.sh" "azureuser@${VmIp}:/tmp/deploy/"
if ($LASTEXITCODE -ne 0) { throw "SCP deploy failed" }

Invoke-Ssh "ls -l /tmp/deploy | grep -E 'nginx-smartcampus.conf|smartcampus.service|remote_setup.sh' || (echo 'Missing deploy files' && exit 1)"
if ($LASTEXITCODE -ne 0) { throw "Deploy files missing on VM" }

Invoke-Ssh "bash /tmp/deploy/remote_setup.sh"

Write-Host "Deployment completed."
