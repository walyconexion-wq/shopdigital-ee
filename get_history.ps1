$headers = @{
    'Authorization' = 'Token 5f587b99-5372-40a0-be38-256e26a7eba0'
    'Content-Type' = 'application/json'
}

Write-Host "=== HISTORY FOR SCENARIO 5260209 ==="
try {
    $hist = Invoke-RestMethod -Uri 'https://us2.make.com/api/v2/scenarios/5260209/history' -Headers $headers -Method Get
    $hist.history | ForEach-Object {
        [PSCustomObject]@{
            Id = $_.id
            Status = $_.status
            Created = $_.created
        }
    } | Format-Table -AutoSize
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
