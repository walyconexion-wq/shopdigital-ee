$json = Get-Content -Raw -Path scenario_5260209.json | ConvertFrom-Json
Write-Host "=== Top-level Keys ==="
$json | Get-Member -MemberType NoteProperty | ForEach-Object { $_.Name }

Write-Host "`n=== Module 1 Keys ==="
$json.flow[0] | Get-Member -MemberType NoteProperty | ForEach-Object { $_.Name }

Write-Host "`n=== Module 2 Keys ==="
$json.flow[1] | Get-Member -MemberType NoteProperty | ForEach-Object { $_.Name }
