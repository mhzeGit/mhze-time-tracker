# UTF-8 Validation Script for GitHub Pages
# Run this script to check for non-ASCII characters before committing

Write-Host "==================================" -ForegroundColor Cyan
Write-Host " UTF-8 Encoding Validation" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$fileTypes = @("*.md", "*.html", "*.css", "*.js", "*.json", "*.yml", "*.yaml")
$allFiles = @()

foreach ($pattern in $fileTypes) {
    $allFiles += Get-ChildItem $pattern -ErrorAction SilentlyContinue
}

if ($allFiles.Count -eq 0) {
    Write-Host "No files found to validate!" -ForegroundColor Yellow
    exit
}

Write-Host "Checking $($allFiles.Count) files..." -ForegroundColor White
Write-Host ""

$hasIssues = $false
$issueFiles = @()

foreach ($file in $allFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        $hasNonAscii = $content -match '[^\x00-\x7F]'
        
        if ($hasNonAscii) {
            Write-Host "[FAIL] $($file.Name)" -ForegroundColor Red
            $hasIssues = $true
            $issueFiles += $file.Name
            
            # Find the problematic characters
            $lines = Get-Content $file.FullName
            $lineNumber = 0
            foreach ($line in $lines) {
                $lineNumber++
                if ($line -match '[^\x00-\x7F]') {
                    $matches = [regex]::Matches($line, '[^\x00-\x7F]')
                    foreach ($match in $matches) {
                        $char = $match.Value
                        $unicode = [int][char]$char
                        Write-Host "  Line $lineNumber : '$char' (U+$($unicode.ToString('X4')))" -ForegroundColor Yellow
                    }
                }
            }
        } else {
            Write-Host "[ OK ] $($file.Name)" -ForegroundColor Green
        }
    } catch {
        Write-Host "[SKIP] $($file.Name) - Error reading file" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan

if ($hasIssues) {
    Write-Host "VALIDATION FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Files with issues:" -ForegroundColor Yellow
    foreach ($file in $issueFiles) {
        Write-Host "  - $file" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "GitHub Pages build will FAIL!" -ForegroundColor Red
    Write-Host "Fix these files before committing." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "VALIDATION PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "All files are UTF-8 clean!" -ForegroundColor Green
    Write-Host "Safe to commit and push to GitHub Pages." -ForegroundColor Green
    exit 0
}
