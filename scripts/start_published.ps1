$exe = Join-Path $PSScriptRoot '..\publish\ShopApp\Shop.Presentation.exe'
$wd = Join-Path $PSScriptRoot '..\publish\ShopApp'
if (-Not (Test-Path $exe)) {
    Write-Error "EXE not found: $exe"
    exit 1
}
# If there is an existing DB at workspace root, copy it to publish folder so the published EXE uses the same data
$rootDb = Join-Path (Resolve-Path "$PSScriptRoot\..\") 'shop.db'
if ((Test-Path $rootDb) -and -Not (Test-Path (Join-Path $wd 'shop.db'))) {
    try {
        Copy-Item -Path $rootDb -Destination (Join-Path $wd 'shop.db') -Force
        Write-Output "Copied existing shop.db to publish folder"
    } catch {
        Write-Warning "Could not copy shop.db to publish folder: $_"
    }
}
$p = Start-Process -FilePath $exe -WorkingDirectory $wd -PassThru
Start-Sleep -Seconds 6
$logPath = Join-Path $wd 'app-error.log'
if (Test-Path $logPath) {
    Write-Output '=== app-error.log (last 200 lines) ==='
    Get-Content -Path $logPath -Tail 200
} else {
    Write-Output 'No app-error.log found in publish folder.'
}
Write-Output '=== publish folder listing ==='
Get-ChildItem -Path $wd | Select-Object -ExpandProperty Name
Write-Output ('PROCESS_PID:' + $p.Id)
