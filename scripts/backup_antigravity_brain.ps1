# SCRIPT DE RESPALDO TOTAL DE SEGURIDAD - SHOPDIGITAL & ANTIGRAVITY BRAIN
$BackupDir = "C:\Users\walya\Desktop\SHOPDIGITAL_BACKUP_TOTAL"
if (-not (Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir }

$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$Destination = "$BackupDir\Backup_$Timestamp"

New-Item -ItemType Directory -Path $Destination | Out-Null

Write-Host "🛡️ INICIANDO RESPALDO DE SEGURIDAD TOTAL DE LUZ 01..." -ForegroundColor Cyan

# 1. Respaldar Proyectos Codebase
Copy-Item -Path "C:\Users\walya\.gemini\antigravity\scratch\shopdigital-ar" -Destination "$Destination\shopdigital-ar" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "C:\Users\walya\.gemini\antigravity\scratch\shopdigital-ee" -Destination "$Destination\shopdigital-ee" -Recurse -Force -ErrorAction SilentlyContinue

# 2. Respaldar Bóveda de Obsidian (Los 12 Búnkeres)
Copy-Item -Path "C:\Users\walya\.gemini\antigravity\scratch\ShopDigital_Vault" -Destination "$Destination\ShopDigital_Vault" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Respaldar Historial de Conversaciones & Brain de Antigravity
Copy-Item -Path "C:\Users\walya\.gemini\antigravity\brain" -Destination "$Destination\antigravity_brain" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ RESPALDO COMPLETADO EXITOSAMENTE EN: $Destination" -ForegroundColor Green
