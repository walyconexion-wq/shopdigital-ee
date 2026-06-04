$headers = @{
    'Authorization' = 'Token 5f587b99-5372-40a0-be38-256e26a7eba0'
    'Content-Type' = 'application/json'
}

# Check the WhatsApp Business Cloud connection details
Write-Host "=== WHATSAPP CONNECTION (ID: 9201390) ==="
try {
    $conn = Invoke-RestMethod -Uri 'https://us2.make.com/api/v2/connections/9201390' -Headers $headers -Method Get
    $conn | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        Write-Host "Response: $($reader.ReadToEnd())"
    } catch {}
}

# Try to verify/test the connection
Write-Host "`n=== VERIFY CONNECTION ==="
try {
    $result = Invoke-RestMethod -Uri 'https://us2.make.com/api/v2/connections/9201390/test' -Headers $headers -Method Post
    Write-Host "Connection test result:"
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error testing connection: $($_.Exception.Message)"
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        Write-Host "Response: $($reader.ReadToEnd())"
    } catch {}
}

# Check the WhatsApp webhook and try to get its real URL
Write-Host "`n=== WHATSAPP WEBHOOK (ID: 2401501) FULL DETAILS ==="
try {
    $hook = Invoke-RestMethod -Uri 'https://us2.make.com/api/v2/hooks/2401501' -Headers $headers -Method Get
    $hook | ConvertTo-Json -Depth 15
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

# Also check if the other WA webhook (2396138) has a URL
Write-Host "`n=== OTHER WA WEBHOOK (ID: 2396138) ==="
try {
    $hook2 = Invoke-RestMethod -Uri 'https://us2.make.com/api/v2/hooks/2396138' -Headers $headers -Method Get
    $hook2 | ConvertTo-Json -Depth 15
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

# List all hooks with more details
Write-Host "`n=== ALL HOOKS WITH PING STATUS ==="
try {
    $hooks = Invoke-RestMethod -Uri 'https://us2.make.com/api/v2/hooks?teamId=1251448' -Headers $headers -Method Get
    foreach ($h in $hooks.hooks) {
        Write-Host "Hook $($h.id) '$($h.name)' | type=$($h.type) | typeName=$($h.typeName) | url='$($h.url)' | scenarioActive=$($h.scenarioIsActive) | enabled=$($h.enabled)"
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

# Try to ping/refresh the webhook
Write-Host "`n=== PING WEBHOOK 2401501 ==="
try {
    $result = Invoke-RestMethod -Uri 'https://us2.make.com/api/v2/hooks/2401501/ping' -Headers $headers -Method Post
    Write-Host "Ping result:"
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Ping error: $($_.Exception.Message)"
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        Write-Host "Response: $($reader.ReadToEnd())"
    } catch {}
}
