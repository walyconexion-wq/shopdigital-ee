$appId = '198551957566823'
$appSecret = 'bbb024a39e9a6406e27613e6a1efed0d'

# Method 1: Try client_credentials grant
Write-Host "=== METHOD 1: OAuth client_credentials ==="
try {
    $uri = "https://graph.facebook.com/oauth/access_token?client_id=$appId&client_secret=$appSecret&grant_type=client_credentials"
    $response = Invoke-WebRequest -Uri $uri -Method Get -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Body: $($response.Content)"
    $tokenData = $response.Content | ConvertFrom-Json
    $token = $tokenData.access_token
    Write-Host "Token obtained: $($token.Substring(0, 30))..."
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    try {
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = [System.IO.StreamReader]::new($stream)
            $errBody = $reader.ReadToEnd()
            Write-Host "Error body: $errBody"
        }
    } catch { Write-Host "No error body" }
}

# Method 2: Use curl if available
Write-Host "`n=== METHOD 2: curl ==="
$curlResult = & curl.exe -s "https://graph.facebook.com/oauth/access_token?client_id=$appId&client_secret=$appSecret&grant_type=client_credentials" 2>&1
Write-Host $curlResult

# If we got a token from curl, use it
if ($curlResult -match '"access_token":"([^"]+)"') {
    $token = $Matches[1]
    Write-Host "`nExtracted token: $($token.Substring(0, 30))..."
    
    # Check webhook subscriptions
    Write-Host "`n=== WEBHOOK SUBSCRIPTIONS ==="
    $subsResult = & curl.exe -s "https://graph.facebook.com/v21.0/$appId/subscriptions?access_token=$token" 2>&1
    Write-Host $subsResult

    # Check app details
    Write-Host "`n=== APP DETAILS ==="
    $appResult = & curl.exe -s "https://graph.facebook.com/v21.0/$appId`?fields=name&access_token=$token" 2>&1
    Write-Host $appResult
} else {
    Write-Host "`nCouldn't extract token from curl response"
}
