<#
download-images.ps1

Busca URLs de imágenes (png/jpg/jpeg/gif/svg) en archivos de texto del repo,
las descarga dentro de la carpeta `images/` y reemplaza las referencias por
`/images/<archivo>` en los archivos afectados.

Uso: Ejecutar desde PowerShell (Windows PowerShell 5.1 está soportado):
    powershell -ExecutionPolicy Bypass -File .\scripts\download-images.ps1

Notas:
- El script sólo procesa ficheros de texto comunes (*.html, *.css, *.js, *.md).
- Genera `scripts/downloaded-images.csv` con el mapeo URL -> archivo local.
- Si la descarga falla, el script continúa y deja un aviso en la salida.
#>

Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$imagesDir = Join-Path $repoRoot "images"
$mappingFile = Join-Path $scriptDir "downloaded-images.csv"

if (-not (Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir | Out-Null
}

# file types to check
$filePatterns = '*.html','*.css','*.js','*.md','*.txt'

# regex to find image URLs (single-quoted to avoid escaping issues)
$regex = [regex]'https?://[^\s"''()<>]+?\.(?:png|jpe?g|gif|svg)(?:\?[^\s"''()<>]*)?'

# collect files (match by extension pattern like '*.html')
$files = Get-ChildItem -Path $repoRoot -Recurse -File | Where-Object { $filePatterns -contains ('*' + $_.Extension) }

Write-Output "Scanning $($files.Count) files for external image URLs..."

$urls = [System.Collections.Generic.HashSet[string]]::new()

foreach ($f in $files) {
    try {
        $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $f.FullName
    } catch {
        # Skip files we can't read as text
        continue
    }

    foreach ($m in $regex.Matches($text)) {
        $urls.Add($m.Value) | Out-Null
    }
}

if ($urls.Count -eq 0) {
    Write-Output "No external image URLs found. Nothing to do."
    exit 0
}

Write-Output "Found $($urls.Count) unique image URLs."

# prepare mapping CSV
"URL,LocalPath,Status,Message" | Out-File -FilePath $mappingFile -Encoding UTF8

$counter = 1

foreach ($url in $urls) {
    Write-Output "[$counter/$($urls.Count)] Processing: $url"
    $counter++

    try {
        $uri = [System.Uri]::new($url)
    } catch {
        Write-Warning "Invalid URL: $url"
        "" | Out-Null
        continue
    }

    $baseName = [System.IO.Path]::GetFileName($uri.AbsolutePath)
    if ([string]::IsNullOrEmpty($baseName)) {
        # fallback name if URL ends with /
        $ext = if ($url -match '\.(png|jpe?g|gif|svg)(?:\?|$)') { $matches[1] } else { 'img' }
        $baseName = "image-$([Guid]::NewGuid().ToString())`.$ext"
    }

    # sanitize baseName
    $safeName = $baseName -replace '[^A-Za-z0-9_.-]', '_'

    # avoid name collision
    $destPath = Join-Path $imagesDir $safeName
    $i = 1
    while (Test-Path $destPath) {
        $nameOnly = [System.IO.Path]::GetFileNameWithoutExtension($safeName)
        $ext = [System.IO.Path]::GetExtension($safeName)
        $destPath = Join-Path $imagesDir ("{0}-{1}{2}" -f $nameOnly, $i, $ext)
        $i++
    }

    try {
        # Download the file (PowerShell 5.1 compatibility)
        Invoke-WebRequest -Uri $url -OutFile $destPath -UseBasicParsing -ErrorAction Stop
        $status = 'Downloaded'
        $message = ''
    } catch {
        Write-Warning "Failed to download $url : $($_.Exception.Message)"
        $status = 'Failed'
        $message = $_.Exception.Message -replace '"',''
        # still write mapping and continue
        "$url,$destPath,$status,$message" | Out-File -FilePath $mappingFile -Encoding UTF8 -Append
        continue
    }

    # Replace occurrences in files
    $pattern = [Regex]::Escape($url)
    $replacement = "/images/" + [System.IO.Path]::GetFileName($destPath)

    foreach ($f in $files) {
        try {
            $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $f.FullName
        } catch { continue }

        if ($text -like "*${url}*") {
            $newText = [regex]::Replace($text, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $replacement })
            if ($newText -ne $text) {
                # backup original
                Copy-Item -LiteralPath $f.FullName -Destination ($f.FullName + '.bak') -Force
                Set-Content -LiteralPath $f.FullName -Value $newText -Encoding UTF8
                Write-Output "  -> Updated: $($f.FullName)"
            }
        }
    }

    # write mapping
    "$url,/images/$([System.IO.Path]::GetFileName($destPath)),$status,$message" | Out-File -FilePath $mappingFile -Encoding UTF8 -Append
}

Write-Output "Done. Mapping written to: $mappingFile"
