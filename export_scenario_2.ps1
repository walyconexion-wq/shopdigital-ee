$headers = @{
    'Authorization' = 'Token 5f587b99-5372-40a0-be38-256e26a7eba0'
    'Content-Type' = 'application/json'
}

try {
    $blueprint = Invoke-RestMethod -Uri 'https://us2.make.com/api/v2/scenarios/4064964/blueprint' -Headers $headers -Method Get
    $blueprint.response.blueprint | ConvertTo-Json -Depth 20 | Out-File -FilePath "scenario_4064964.json" -Encoding utf8
    Write-Host "Successfully saved scenario blueprint to scenario_4064964.json"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
