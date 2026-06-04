$json = Get-Content -Raw -Path scenario_5260209.json | ConvertFrom-Json
$json.flow | ForEach-Object {
    Write-Host "Module $($_.id) ($($_.module)) keys:"
    $_ | Get-Member -MemberType NoteProperty | ForEach-Object {
        Write-Host "  - $($_.Name)"
    }
}
