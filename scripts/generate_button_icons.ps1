<#
Generate small PNG icons used in the UI (add, refresh, sell, print, user)
Creates Presentation\Assets directory and writes 48x48 PNGs.
#>
Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$assetsDir = Join-Path $scriptDir "..\Presentation\Assets"
if (-not (Test-Path $assetsDir)) { New-Item -ItemType Directory -Path $assetsDir | Out-Null }

[Reflection.Assembly]::LoadWithPartialName("System.Drawing") | Out-Null

function Save-Icon($char, $bgcolor, $filename) {
    $size = 48
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::FromArgb(255, $bgcolor[0], $bgcolor[1], $bgcolor[2]))
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $font = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString($char, $font, $brush, [System.Drawing.RectangleF]::new(0,0,$size,$size), $sf)
    $path = Join-Path $assetsDir $filename
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose();
}

Save-Icon "+" @(46,204,113) "icon_add.png"
Save-Icon "R" @(52,152,219) "icon_refresh.png"
Save-Icon "S" @(255,193,7) "icon_sell.png"
Save-Icon "P" @(156,39,176) "icon_print.png"
Save-Icon "U" @(33,150,243) "icon_user.png"

Write-Host "Button icons generated in: $assetsDir"
