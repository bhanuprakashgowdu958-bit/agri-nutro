Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = (Get-Location).Path
$dist = Join-Path $root "dist"

if (Test-Path $dist) {
    Remove-Item $dist -Recurse -Force
}
New-Item -ItemType Directory -Path $dist | Out-Null

# Copy assets, css, js, orders.json, users.json, api, vercel.json
Copy-Item -Path (Join-Path $root "assets") -Destination $dist -Recurse
Copy-Item -Path (Join-Path $root "css") -Destination $dist -Recurse
Copy-Item -Path (Join-Path $root "js") -Destination $dist -Recurse
if (Test-Path (Join-Path $root "admin.html")) { Copy-Item -Path (Join-Path $root "admin.html") -Destination $dist }
if (Test-Path (Join-Path $root "signup.html")) { Copy-Item -Path (Join-Path $root "signup.html") -Destination $dist }
if (Test-Path (Join-Path $root "terms.html")) { Copy-Item -Path (Join-Path $root "terms.html") -Destination $dist }
if (Test-Path (Join-Path $root "orders.json")) { Copy-Item -Path (Join-Path $root "orders.json") -Destination $dist }
if (Test-Path (Join-Path $root "users.json")) { Copy-Item -Path (Join-Path $root "users.json") -Destination $dist }
if (Test-Path (Join-Path $root "api")) { Copy-Item -Path (Join-Path $root "api") -Destination $dist -Recurse }
if (Test-Path (Join-Path $root "vercel.json")) { Copy-Item -Path (Join-Path $root "vercel.json") -Destination $dist }

# Read CSS files
$cssMain = [System.IO.File]::ReadAllText((Join-Path $root "css\main.css"))
$cssComp = [System.IO.File]::ReadAllText((Join-Path $root "css\components.css"))
$cssResp = [System.IO.File]::ReadAllText((Join-Path $root "css\responsive.css"))

$inlineStyle = "<style>`n/* Inlined Main CSS */`n$cssMain`n/* Inlined Components CSS */`n$cssComp`n/* Inlined Responsive CSS */`n$cssResp`n</style>"

# Read index.html
$html = [System.IO.File]::ReadAllText((Join-Path $root "index.html"))

# Replace stylesheet link tags with inlined style
$searchPattern = '(?s)<link rel="stylesheet" href="css/main.css" />\s*<link rel="stylesheet" href="css/components.css" />\s*<link rel="stylesheet" href="css/responsive.css" />'
$html = [System.Text.RegularExpressions.Regex]::Replace($html, $searchPattern, $inlineStyle)

# Write to dist/index.html
[System.IO.File]::WriteAllText((Join-Path $dist "index.html"), $html)

# Create proper ZIP with forward slashes
$zipPath = Join-Path $root "NutriAgro-Feeds-Website.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
Get-ChildItem -Path $dist -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($dist.Length + 1).Replace("\", "/")
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel, [System.IO.Compression.CompressionLevel]::Optimal)
}
$zip.Dispose()

Write-Output "SUCCESS: dist folder built with inlined CSS and proper zip created!"
