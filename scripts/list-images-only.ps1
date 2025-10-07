Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")

# file types to check
$filePatterns = '*.html','*.css','*.js','*.md','*.txt'

# regex to find image URLs (single-quoted)
$regex = [regex]'https?://[^\s"''()<>]+?\.(?:png|jpe?g|gif|svg)(?:\?[^\s"''()<>]*)?'

# collect files
$files = Get-ChildItem -Path $repoRoot -Recurse -File | Where-Object { $filePatterns -contains ('*' + $_.Extension) }

Write-Output "Scanning $($files.Count) files for external image URLs..."

$urls = [System.Collections.Generic.HashSet[string]]::new()

foreach ($f in $files) {
    try {
        $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $f.FullName
    } catch { continue }

    foreach ($m in $regex.Matches($text)) { $urls.Add($m.Value) | Out-Null }
}

if ($urls.Count -eq 0) {
    Write-Output "No external image URLs found."
    exit 0
}

Write-Output "Found $($urls.Count) unique image URLs:\n"
$i = 1
foreach ($u in $urls) { Write-Output ("[$i] " + $u); $i++ }
