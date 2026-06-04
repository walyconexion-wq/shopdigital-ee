$json1 = Get-Content -Raw -Path scenario_5260209.json | ConvertFrom-Json
Write-Host "=== Top-level keys ==="
$json1 | Get-Member -MemberType NoteProperty | ForEach-Object { $_.Name }

# Let's inspect the keys inside metadata
Write-Host "`n=== Metadata keys ==="
$json1.metadata | Get-Member -MemberType NoteProperty | ForEach-Object { $_.Name }

# Let's check if there is an orphans array or something
Write-Host "`n=== Orphans: $($json1.metadata.designer.orphans | ConvertTo-Json -Compress)"
