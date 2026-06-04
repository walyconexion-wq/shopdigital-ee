$headers = @{
    'Authorization' = 'Token 5f587b99-5372-40a0-be38-256e26a7eba0'
    'Content-Type' = 'application/json'
}

$requestBody = @{
    "name" = "Test Minimal Scenario"
    "teamId" = 1251448
} | ConvertTo-Json

Write-Host "=== CREATING MINIMAL SCENARIO ==="
try {
    $response = Invoke-RestMethod -Uri 'https://us2.make.com/api/v2/scenarios' -Headers $headers -Method Post -Body $requestBody
    Write-Host "Success!"
    Write-Host "Scenario ID: $($response.scenario.id)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        Write-Host "Response body: $($reader.ReadToEnd())"
    }
}
