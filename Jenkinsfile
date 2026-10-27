pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        VM_IP = '40.80.93.49'
        VM_USER = 'azureuser'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test Backend') {
            steps {
                powershell '''
                    $ErrorActionPreference = "Stop"
                    Set-Location backend
                    if (Test-Path ./.venv-ci) { Remove-Item ./.venv-ci -Recurse -Force }
                    python -m venv ./.venv-ci
                    ./.venv-ci/Scripts/pip.exe install -r requirements.txt
                    if ($LASTEXITCODE -ne 0) { exit 1 }
                    ./.venv-ci/Scripts/python.exe -m pytest -q
                    if ($LASTEXITCODE -ne 0) { exit 1 }
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                powershell '''
                    $ErrorActionPreference = "Stop"
                    Set-Location frontend
                    npm ci
                    if ($LASTEXITCODE -ne 0) { exit 1 }
                    $env:VITE_API_BASE_URL = '/'
                    npm run build
                    if ($LASTEXITCODE -ne 0) { exit 1 }
                '''
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'azure-vm-ssh', keyFileVariable: 'SSH_KEY')]) {
                    powershell '''
                        $ErrorActionPreference = "Stop"
                        $sid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value
                        icacls $env:SSH_KEY /inheritance:r
                        if ($LASTEXITCODE -ne 0) { exit 1 }
                        icacls $env:SSH_KEY /grant:r "*$sid:(R)"
                        if ($LASTEXITCODE -ne 0) { exit 1 }
                        icacls $env:SSH_KEY
                        if ($LASTEXITCODE -ne 0) { exit 1 }
                        powershell -ExecutionPolicy Bypass -File deploy/deploy.ps1 -VmIp $env:VM_IP -KeyPath $env:SSH_KEY -SkipBuild
                        if ($LASTEXITCODE -ne 0) { exit 1 }
                    '''
                }
            }
        }

        stage('Verify') {
            steps {
                powershell '''
                    $ErrorActionPreference = "Stop"
                    $max = 60
                    $interval = 5
                    $elapsed = 0
                    $ok = $false
                    while ($elapsed -lt $max) {
                        try {
                            $r1 = Invoke-WebRequest -Uri "http://$env:VM_IP/health" -UseBasicParsing -TimeoutSec 10
                            $r2 = Invoke-WebRequest -Uri "http://$env:VM_IP/" -UseBasicParsing -TimeoutSec 10
                            if ($r1.StatusCode -eq 200 -and $r2.StatusCode -eq 200) { $ok = $true; break }
                        } catch {}
                        Start-Sleep -Seconds $interval
                        $elapsed += $interval
                    }
                    if (-not $ok) { exit 1 }
                '''
            }
        }
    }

    post {
        success {
            echo "Application deployed successfully at http://$env:VM_IP"
        }
        failure {
            echo "Deployment failed. Check logs."
        }
    }
}