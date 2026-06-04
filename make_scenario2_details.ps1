$headers = @{
    'Authorization' = 'Token 5f587b99-5372-40a0-be38-256e26a7eba0'
    'Content-Type' = 'application/json'
}

try {
    $s2 = Invoke-RestMethod -Uri 'https://us2.make.com/api/v2/scenarios/4064964' -Headers $headers -Method Get
    Write-Host "=== Scenario 4064964 Details ==="
    $s2.scenario | ConvertTo-Json -Depth 3
    
    $bp = Invoke-RestMethod -Uri 'https://us2.make.com/api/v2/scenarios/4064964/blueprint' -Headers $headers -Method Get
    Write-Host "`n=== Blueprint Modules ==="
    $flow = $bp.response.blueprint.flow
    foreach ($m in $flow) {
        Write-Host "Module $($m.id) | App: $($m.module) | Label: $($m.metadata.label)"
        if ($m.mapper) {
            $m.mapper | ConvertTo-Json -Depth 5 | Write-Host
        }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
