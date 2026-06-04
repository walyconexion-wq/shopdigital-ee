$headers = @{
    'Authorization' = 'Token 5f587b99-5372-40a0-be38-256e26a7eba0'
    'Content-Type' = 'application/json'
}

Write-Host "=== EXECUTION LOGS FOR SCENARIO 5260209 ==="
try {
    $logs = Invoke-RestMethod -Uri 'https://us2.make.com/api/v2/scenarios/5260209/logs' -Headers $headers -Method Get
    $logs.logs | ForEach-Object {
        [PSCustomObject]@{
            Id = $_.id
            Status = $_.status
            Created = $_.created
            Duration = $_.duration
            Operations = $_.operations
        }
    } | Format-Table -AutoSize
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
