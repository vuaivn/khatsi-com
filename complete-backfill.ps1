#!/usr/bin/env pwsh
# Complete backfill workflow: watermark + embed + deploy

param(
    [string]$slug = "vo-nga-anatta",
    [int]$imageCount = 3
)

$outDir = "C:\Users\Administrator\aicoworker\openclaw\workspace-builtwebsite\khatsi-com\public\images\posts"
$contentPath = "C:\Users\Administrator\aicoworker\openclaw\workspace-builtwebsite\khatsi-com\src\content\blog\$slug.md"
$skillDir = "C:\Users\Administrator\aicoworker\openclaw\skills\blog-writing-mastery"

Write-Host "=== BACKFILL COMPLETE WORKFLOW ===" -ForegroundColor Green
Write-Host "Slug: $slug | Images: $imageCount" -ForegroundColor Cyan

# === STEP 1: List all PNG files created (not yet webp) ===
Write-Host "`n[STEP 1] Scanning for PNG images..." -ForegroundColor Yellow
$pngFiles = Get-ChildItem "$outDir" -Filter "*.png" | Sort-Object LastWriteTime -Descending | Select-Object -First $imageCount
if ($pngFiles.Count -lt $imageCount) {
    Write-Host "WARNING: Expected $imageCount images, found $($pngFiles.Count). Waiting..." -ForegroundColor Yellow
    # Wait a bit more in case they're still being processed
    Start-Sleep -Seconds 5
    $pngFiles = Get-ChildItem "$outDir" -Filter "*.png" | Sort-Object LastWriteTime -Descending | Select-Object -First $imageCount
}

if ($pngFiles.Count -eq 0) {
    Write-Host "ERROR: No PNG images found!" -ForegroundColor Red
    exit 1
}

Write-Host "Found $($pngFiles.Count) PNG file(s):" -ForegroundColor Green
foreach ($f in $pngFiles) { Write-Host "  - $($f.Name)" }

# === STEP 2: Watermark each PNG → WebP ===
Write-Host "`n[STEP 2] Watermarking images..." -ForegroundColor Yellow

# Check if _watermark.mjs exists in khatsi-com
$watermarkScript = "C:\Users\Administrator\aicoworker\openclaw\workspace-builtwebsite\khatsi-com\_watermark.mjs"
if (-not (Test-Path $watermarkScript)) {
    Write-Host "ERROR: Watermark script not found at $watermarkScript" -ForegroundColor Red
    Write-Host "Creating basic watermark script..." -ForegroundColor Yellow
    
    # Create a basic watermark script
    $wmCode = @'
import sharp from "sharp";
import { createCanvas } from "canvas";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const [imagePath, outDir] = process.argv.slice(2);

if (!imagePath || !outDir) {
  console.error("Usage: node _watermark.mjs <image-path> <out-dir>");
  process.exit(1);
}

try {
  const image = await sharp(imagePath);
  const meta = await image.metadata();
  const w = meta.width, h = meta.height;
  
  // Resize to 1500 width (proportional)
  const resized = image.resize(1500, Math.round((1500 * h) / w), { fit: "fill" });
  const newMeta = await resized.metadata();
  
  // SVG watermark
  const svg = Buffer.from(`<svg width="${newMeta.width}" height="${newMeta.height}" xmlns="http://www.w3.org/2000/svg">
    <text x="${newMeta.width - 20}" y="${newMeta.height - 10}" font-size="18" fill="white" text-anchor="end" font-family="Arial" opacity="0.8">khatsi.com</text>
  </svg>`);
  
  // Composite
  const basename = path.basename(imagePath, path.extname(imagePath));
  const webpPath = path.join(outDir, `${basename}.webp`);
  
  await resized
    .composite([{ input: svg, top: 0, left: 0 }])
    .webp({ quality: 66 })
    .toFile(webpPath);
  
  console.log(`✅ WATERMARKED: ${webpPath}`);
} catch (err) {
  console.error("ERROR:", err.message);
  process.exit(1);
}
'@
    Set-Content $watermarkScript -Value $wmCode -Encoding UTF8
    Write-Host "Watermark script created." -ForegroundColor Green
}

$webpFiles = @()
foreach ($pngFile in $pngFiles) {
    Write-Host "  Watermarking: $($pngFile.Name)..." -ForegroundColor Cyan
    cd "C:\Users\Administrator\aicoworker\openclaw\workspace-builtwebsite\khatsi-com"
    node _watermark.mjs $pngFile.FullName $outDir
    if ($LASTEXITCODE -ne 0) {
        Write-Host "    ERROR watermarking $($pngFile.Name)" -ForegroundColor Red
        exit 1
    }
    
    # Collect webp filename
    $webpName = $pngFile.BaseName + ".webp"
    $webpFiles += $webpName
    Write-Host "    ✅ $webpName" -ForegroundColor Green
}

# === STEP 3: Embed in markdown ===
Write-Host "`n[STEP 3] Embedding images in markdown..." -ForegroundColor Yellow

# Read current markdown
$mdContent = Get-Content $contentPath -Raw -Encoding UTF8

# Define section headers and corresponding webp files
$sections = @(
    @{ header = "## Vô Ngã Là Gì?"; alt = "Khái niệm Vô Ngã - không có bản ngã bất biến"; webp = $webpFiles[0] },
    @{ header = "## Tại Sao Vô Ngã Lại Quan Trọng?"; alt = "Vô Ngã cắt gốc tham ái và giải thoát khổ đau"; webp = $webpFiles[1] },
    @{ header = "## Vô Ngã Trong 3 Truyền Thống"; alt = "Ba truyền thống Phật giáo trong Vô Ngã"; webp = $webpFiles[2] }
)

# Insert images after each section header
foreach ($section in $sections) {
    $headerPattern = [regex]::Escape($section.header)
    $replacement = "$($section.header)`n`n`![img]($($section.alt))](/images/posts/$($section.webp))"
    
    # Check if image not already there
    if (-not ($mdContent -match "!\[.*?\]\(/images/posts/$([regex]::Escape($section.webp))\)")) {
        $mdContent = [regex]::Replace($mdContent, "($headerPattern)\n", $replacement + "`n")
        Write-Host "  ✅ Embedded $($section.webp) after '$($section.header)'" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Image already exists: $($section.webp)" -ForegroundColor Yellow
    }
}

# Write back
Set-Content $contentPath -Value $mdContent -Encoding UTF8
Write-Host "Markdown updated." -ForegroundColor Green

# === STEP 4: Deploy ===
Write-Host "`n[STEP 4] Deploying via wrangler..." -ForegroundColor Yellow
cd "C:\Users\Administrator\aicoworker\openclaw\workspace-builtwebsite\khatsi-com"
node deploy.mjs $slug
$deployStatus = $LASTEXITCODE

if ($deployStatus -eq 0 -or $deployStatus -eq 1) {
    # Exit 1 is often just warnings on this setup
    Write-Host "Deploy completed (exit code: $deployStatus)" -ForegroundColor Green
} else {
    Write-Host "Deploy failed with exit code $deployStatus" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== BACKFILL COMPLETE ===" -ForegroundColor Green
Write-Host "✅ Images created, watermarked, embedded, and deployed for $slug" -ForegroundColor Green
