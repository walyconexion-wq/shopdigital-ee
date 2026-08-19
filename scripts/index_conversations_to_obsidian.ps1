# SCRIPT DE INDEXACIÓN NEURONAL A OBSIDIAN - LUZ 01
$VaultDir = "C:\Users\walya\.gemini\antigravity\scratch\ShopDigital_Vault"
$BrainDir = "C:\Users\walya\.gemini\antigravity\brain"
$ConvVaultDir = "$VaultDir\CONVERSACIONES_ANTIGRAVITY"

if (-not (Test-Path $ConvVaultDir)) {
    New-Item -ItemType Directory -Path $ConvVaultDir | Out-Null
}

Write-Host "🧠 Sincronizando Conversaciones a la Red Neuronal de Obsidian..." -ForegroundColor Cyan

$ConvFolders = Get-ChildItem -Path $BrainDir -Directory | Where-Object { $_.Name -notlike ".*" }
$IndexedCount = 0

foreach ($folder in $ConvFolders) {
    $ConvId = $folder.Name
    $TranscriptPath = "$BrainDir\$ConvId\.system_generated\logs\transcript.jsonl"
    $MdPath = "$ConvVaultDir\CONV_$ConvId.md"
    
    $Content = @"
# 🧠 FICHA DE CONVERSACIÓN: $ConvId

- **ID de Conversación:** `$ConvId`
- **Entorno:** Google Antigravity Engine
- **Estado:** Indexado en Red Neuronal de Obsidian

## 🔗 Vinculación a Búnkeres & Enjambre
- [[BK01_Core_Bruno]]
- [[BK02_Frontend_Luz01]]
- [[BK03_SecOps_Thor]]
- [[BK08_Ventas_CRM]]
- [[BK11_Vortex_QA]]
- [[BK12_Comando_Waly]]

## 📜 Registro de Logs & Transcripción
- Archivo de Logs Local: [transcript.jsonl](file:///$($TranscriptPath.Replace('\', '/')))

---
*Indexado automáticamente por el Script de Red Neuronal de Luz 01.*
"@
    Set-Content -Path $MdPath -Value $Content -Encoding UTF8
    $IndexedCount++
}

Write-Host "✅ ¡Red Neuronal de Obsidian Actualizada! $IndexedCount Fichas de Conversación Indexadas." -ForegroundColor Green
