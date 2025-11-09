<#
Generate a simple ICO file programmatically using System.Drawing.
The script creates `Presentation\app.ico` and overwrites if exists.

Works on Windows with PowerShell 5.1 (uses System.Drawing).
#>
Set-StrictMode -Version Latest

$out = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "..\Presentation\app.ico"
# Ensure the Presentation directory exists and get the full path without requiring the file to exist
$dir = Split-Path $out -Parent
if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
}
$out = [System.IO.Path]::GetFullPath($out)

Write-Host "Generating icon at: $out"

[Reflection.Assembly]::LoadWithPartialName("System.Drawing") | Out-Null

$size = 256
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)

# Smooth and clear background
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::FromArgb(255, 33, 150, 243))

# Draw a white circle with shadow
$shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(64,0,0,0))
$g.FillEllipse($shadowBrush, 36,36,184,184)
$brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,255,255,255))
$g.FillEllipse($brush, 28,28,184,184)

# Draw letter S in center
$font = New-Object System.Drawing.Font("Segoe UI", 96, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,33,150,243))
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("S", $font, $textBrush, [System.Drawing.RectangleF]::new(0,0,$size,$size), $sf)

# Convert bitmap to icon and save
$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)

try {
    $fs = [System.IO.File]::Open($out, [System.IO.FileMode]::Create)
    $icon.Save($fs)
    $fs.Close()
    Write-Host "Icon saved successfully."
} finally {
    # release handles
    if ($icon -ne $null) { $icon.Dispose() }
    if ($bmp -ne $null) { $bmp.Dispose() }
    if ($g -ne $null) { $g.Dispose() }
}
