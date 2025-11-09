<#
PowerShell script to scaffold a C# solution with MAUI Presentation, Shop.Core and Shop.Data projects.

Run this from the repo root (PowerShell):
    .\scripts\create_solution.ps1

This will call `dotnet` commands to create projects and add package references.
Make sure .NET SDK is installed and `dotnet` is on PATH.
#>

Set-StrictMode -Version Latest
Write-Host "Starting project scaffold..."

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $root

$slnName = "ShopSolution"

if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Error "dotnet CLI not found. Install .NET SDK first: https://dotnet.microsoft.com/download"
    exit 1
}

if (-not (Test-Path "$pwd\$slnName.sln")) {
    dotnet new sln -n $slnName
} else {
    Write-Host "Solution $slnName.sln already exists, skipping creation."
}

# Create Core and Data class libraries
if (-not (Test-Path "$pwd\Core\Shop.Core.csproj")) {
    dotnet new classlib -n Shop.Core -o Core
    dotnet sln add Core\Shop.Core.csproj
} else { Write-Host "Core project exists" }

if (-not (Test-Path "$pwd\Data\Shop.Data.csproj")) {
    dotnet new classlib -n Shop.Data -o Data
    dotnet sln add Data\Shop.Data.csproj
} else { Write-Host "Data project exists" }

# Create Presentation using MAUI template if not exists
if (-not (Test-Path "$pwd\Presentation\Shop.Presentation.csproj")) {
    Write-Host "Creating MAUI Presentation project (requires MAUI workload)..."
    dotnet new maui -n Shop.Presentation -o Presentation
    dotnet sln add Presentation\Shop.Presentation.csproj
} else { Write-Host "Presentation project exists" }

Write-Host "Adding package references to Data project (EF Core SQLite)..."
dotnet add Data\Shop.Data.csproj package Microsoft.EntityFrameworkCore.Sqlite --version 8.0.0
dotnet add Data\Shop.Data.csproj package Microsoft.EntityFrameworkCore.Design --version 8.0.0

Write-Host "Adding project references: Data -> Core, Presentation -> Core & Data"
dotnet add Data\Shop.Data.csproj reference Core\Shop.Core.csproj
dotnet add Presentation\Shop.Presentation.csproj reference Core\Shop.Core.csproj
dotnet add Presentation\Shop.Presentation.csproj reference Data\Shop.Data.csproj

Write-Host "Restore packages..."
dotnet restore

Write-Host "Scaffold complete. Next: open the solution in Visual Studio or run ./scripts/run.ps1 to build and run (Windows)."
