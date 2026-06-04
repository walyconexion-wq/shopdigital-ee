$headers = @{
    'Authorization' = 'Token 5f587b99-5372-40a0-be38-256e26a7eba0'
    'Content-Type' = 'application/json'
}

Write-Host "=== LISTING SCENARIOS ==="
try {
    $scenarios = Invoke-RestMethod -Uri 'https://us2.make.com/api/v2/scenarios?teamId=1251448' -Headers $headers -Method Get
    $scenarios.scenarios | ForEach-Object {
        [PSCustomObject]@{
            Id = $_.id
            Name = $_.name
            Active = $_.active
            WebhookId = $_.webhookId
        }
    } | Format-Table -AutoSize
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
