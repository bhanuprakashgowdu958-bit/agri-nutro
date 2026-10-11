Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead((Join-Path (Get-Location) 'NutriAgro-Feeds-Website.zip'))
foreach ($e in $z.Entries) {
    if ($e.FullName -like "*.html" -or $e.FullName -like "*.css" -or $e.FullName -like "*.js") {
        Write-Output $e.FullName
    }
}
$z.Dispose()
