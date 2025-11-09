<#
Start the full application: scaffold (optional), build, publish, and run.

Usage (PowerShell, from repo root):
    .\scripts\start_full.ps1

This script will:
- verify `dotnet` is available
- run `create_solution.ps1` to ensure projects exist
- restore, build (Release) and publish the Presentation project for win-x64
- run the published exe if publish succeeds; otherwise fallback to `dotnet run`

Note: publishing as framework-dependent (no runtime bundled). If you want a self-contained EXE, change the --self-contained flag.
#>

Set-StrictMode -Version Latest
Write-Host "Starting full app runner..."

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $repoRoot

if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Error "dotnet CLI not found. Please install .NET SDK: https://dotnet.microsoft.com/download"
    exit 1
}

Write-Host "Running scaffold (create_solution.ps1) to ensure projects exist..."
try {
    & "$scriptDir\create_solution.ps1"
} catch {
    Write-Warning "create_solution.ps1 failed or returned errors. Continuing if projects already exist. Error: $_"
}

Write-Host "Generating application icon..."
try {
    & "$scriptDir\generate_icon.ps1"
} catch {
    Write-Warning "generate_icon.ps1 failed: $_"
}
Write-Host "Generating small button icons..."
try {
    & "$scriptDir\generate_button_icons.ps1"
} catch {
    Write-Warning "generate_button_icons.ps1 failed: $_"
}

Write-Host "Restoring and building solution (Release)..."
dotnet restore
dotnet build -c Release

$publishDir = Join-Path $repoRoot "publish\ShopApp"
if (Test-Path $publishDir) { Remove-Item $publishDir -Recurse -Force }

Write-Host "Publishing Presentation project (win-x64, framework-dependent)..."
dotnet publish .\Presentation\Shop.Presentation.csproj -c Release -r win-x64 --self-contained false -o $publishDir

if (Test-Path (Join-Path $publishDir "Shop.Presentation.exe")) {
    $exe = Join-Path $publishDir "Shop.Presentation.exe"
    Write-Host "Starting published app: $exe"
    Start-Process -FilePath $exe
    exit 0
} else {
    Write-Warning "Published executable not found. Falling back to 'dotnet run' for Presentation project."
    try {
        dotnet run --project .\Presentation\Shop.Presentation.csproj -c Release
    } catch {
        Write-Error "Failed to run Presentation project: $_"
        exit 1
    }
}
