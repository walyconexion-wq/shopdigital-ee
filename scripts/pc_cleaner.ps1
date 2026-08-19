# SCRIPT DE DIAGNÓSTICO, LIMPIEZA & SEGURIDAD DE WINDOWS - LUZ 01
$TempUser = [System.IO.Path]::GetTempPath()
$TempWin = "C:\Windows\Temp"

$BytesCleaned = 0
$FilesCleaned = 0

foreach ($dir in @($TempUser, $TempWin)) {
    if (Test-Path $dir) {
        Get-ChildItem -Path $dir -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
            try {
                $BytesCleaned += $_.Length
                Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
                $FilesCleaned++
            } catch {}
        }
    }
}

$MbCleaned = [math]::Round($BytesCleaned / 1MB, 2)
$Disk = Get-Volume -DriveLetter C
$DiskFreeGb = [math]::Round($Disk.SizeRemaining / 1GB, 2)
$DiskTotalGb = [math]::Round($Disk.Size / 1GB, 2)

Write-Host "✅ Limpieza de Windows completada:"
Write-Host "• Archivos temporales eliminados: $FilesCleaned"
Write-Host "• Espacio liberado: $MbCleaned MB"
Write-Host "• Espacio libre en Disco C: $DiskFreeGb GB de $DiskTotalGb GB"
