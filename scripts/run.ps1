<#
Simple script to build and run the Presentation project.
For MAUI desktop, you may need the correct target framework and workloads installed.
Run from repo root:
    .\scripts\run.ps1
#>
Set-StrictMode -Version Latest
Write-Host "Building solution..."
dotnet build

Write-Host "Attempting to run Presentation project..."
try {
    dotnet run --project Presentation -c Debug
} catch {
    Write-Warning "dotnet run failed for MAUI Presentation. Try opening the solution in Visual Studio and run from there."
}
