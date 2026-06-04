$headers = @{
    'Authorization' = 'Token 5f587b99-5372-40a0-be38-256e26a7eba0'
    'Content-Type' = 'application/json'
}

$blueprint = Invoke-RestMethod -Uri 'https://us2.make.com/api/v2/scenarios/5260209/blueprint' -Headers $headers -Method Get
$flow = $blueprint.response.blueprint.flow
foreach ($m in $flow) {
    Write-Host "Module $($m.id) | App: $($m.module) | Label: $($m.metadata.label)"
    if ($m.mapper) {
        Write-Host "  Mapper details:"
        $m.mapper | ConvertTo-Json -Depth 5 | Write-Host
    }
}
