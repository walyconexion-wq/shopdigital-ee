$headers = @{
    'Authorization' = 'Token 5f587b99-5372-40a0-be38-256e26a7eba0'
    'Content-Type' = 'application/json'
}

$flow = @(
    @{
        "id" = 1
        "module" = "gateway:CustomWebHook"
        "version" = 1
        "parameters" = @{
            "hook" = 2395810
            "maxResults" = 1
        }
        "metadata" = @{
            "designer" = @{
                "x" = 0
                "y" = 0
            }
        }
    },
    @{
        "id" = 6
        "module" = "gateway:WebhookRespond"
        "version" = 1
        "parameters" = @{}
        "mapper" = @{
            "status" = "200"
            "body" = '{{1.query."hub.challenge"}}'
        }
        "metadata" = @{
            "designer" = @{
                "x" = 250
                "y" = 0
            }
        }
    },
    @{
        "id" = 2
        "module" = "gemini-ai:createACompletionGeminiPro"
        "version" = 1
        "parameters" = @{
            "__IMTCONN__" = 7290067
        }
        "mapper" = @{
            "model" = "gemini-2.5-flash"
            "contents" = @(
                @{
                    "role" = "user"
                    "parts" = @(
                        @{
                            "text" = "{{1.entry[].changes[].value.messages[].text.body}}"
                            "type" = "text"
                        }
                    )
                }
            )
            "generationConfig" = @{}
            "system_instruction" = @{
                "parts" = @(
                    @{
                        "text" = "Sos Luz, el asistente oficial de ShopDigital. Eres un bot de atención al cliente útil, amable y eficiente."
                    }
                )
            }
        }
        "metadata" = @{
            "designer" = @{
                "x" = 500
                "y" = 0
            }
        }
    },
    @{
        "id" = 5
        "module" = "whatsapp-business-cloud:sendMessage"
        "version" = 1
        "parameters" = @{
            "__IMTCONN__" = 9201390
        }
        "mapper" = @{
            "to" = "{{1.entry[].changes[].value.messages[].from}}"
            "text" = @{
                "body" = "{{2.text}}"
                "preview_url" = $false
            }
            "type" = "text"
            "fromId" = "1059176120608663"
        }
        "metadata" = @{
            "designer" = @{
                "x" = 750
                "y" = 0
            }
        }
    }
)

$metadata = @{
    "instant" = $true
    "version" = 1
    "designer" = @{
        "orphans" = @()
    }
    "scenario" = @{
        "dlq" = $false
        "slots" = $null
        "dataloss" = $false
        "maxErrors" = 3
        "autoCommit" = $true
        "roundtrips" = 1
        "sequential" = $false
        "confidential" = $false
        "freshVariables" = $false
        "autoCommitTriggerLast" = $true
    }
}

$blueprintObj = @{
    "flow" = $flow
    "metadata" = $metadata
}

# Try method 1: blueprint as JSON object, scheduling as JSON object
$requestBody = @{
    "name" = "Integration WhatsApp Custom Webhook (Luz)"
    "teamId" = 1251448
    "scheduling" = @{
        "type" = "immediately"
    }
    "blueprint" = $blueprintObj
} | ConvertTo-Json -Depth 20

Write-Host "=== TRYING METHOD 1 (JSON Objects) ==="
try {
    $response = Invoke-RestMethod -Uri 'https://us2.make.com/api/v2/scenarios' -Headers $headers -Method Post -Body $requestBody
    Write-Host "Success!"
    Write-Host "Scenario ID: $($response.scenario.id)"
    return
} catch {
    Write-Host "Failed Method 1: $($_.Exception.Message)"
}

# Try method 2: blueprint as stringified JSON, scheduling as JSON object
$blueprintJson = $blueprintObj | ConvertTo-Json -Depth 20 -Compress
$requestBody2 = @{
    "name" = "Integration WhatsApp Custom Webhook (Luz)"
    "teamId" = 1251448
    "scheduling" = @{
        "type" = "immediately"
    }
    "blueprint" = $blueprintJson
} | ConvertTo-Json -Depth 20

Write-Host "`n=== TRYING METHOD 2 (blueprint as string) ==="
try {
    $response = Invoke-RestMethod -Uri 'https://us2.make.com/api/v2/scenarios' -Headers $headers -Method Post -Body $requestBody2
    Write-Host "Success!"
    Write-Host "Scenario ID: $($response.scenario.id)"
} catch {
    Write-Host "Failed Method 2: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        Write-Host "Response details: $($reader.ReadToEnd())"
    }
}
