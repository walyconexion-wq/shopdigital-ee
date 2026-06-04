$content = Get-Content -Raw -Path scenario_4064964.json
if ($content -match "filter") {
    Write-Host "Found 'filter' in scenario_4064964.json!"
    $lines = Get-Content -Path scenario_4064964.json
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "filter") {
            Write-Host "Line ${i}: $($lines[$i])"
        }
    }
} else {
    Write-Host "No match for 'filter'"
}
