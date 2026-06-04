$headers = @{
    'Authorization' = 'Token 5f587b99-5372-40a0-be38-256e26a7eba0'
    'Content-Type' = 'application/json'
}

Write-Host "=== LISTING CONNECTIONS ==="
try {
    $connections = Invoke-RestMethod -Uri 'https://us2.make.com/api/v2/connections?teamId=1251448' -Headers $headers -Method Get
    $connections.connections | ForEach-Object {
        [PSCustomObject]@{
            Id = $_.id
            Name = $_.name
            AccountName = $_.accountName
            AccountLabel = $_.accountLabel
            Uid = $_.uid
        }
    } | Format-Table -AutoSize
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
