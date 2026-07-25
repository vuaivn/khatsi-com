#!/usr/bin/env pwsh
# Backfill ảnh section cho bài vo-nga-anatta.md
# 3 ảnh tương ứng 3 section

$scriptDir = "C:\Users\Administrator\aicoworker\openclaw\skills\blog-writing-mastery\scripts"
$outDir = "C:\Users\Administrator\aicoworker\openclaw\workspace-builtwebsite\khatsi-com\public\images\posts"
$slug = "vo-nga-anatta"

# Section 1: "Vô Ngã Là Gì?" — Khái niệm "tôi" không bất biến / năm tính thể
$prompt1 = "Illustration of the concept of 'no self' - a figure made of flowing, constantly changing elements (form, sensation, thought, impulse, consciousness) dissolving and reforming, Buddhist spiritual art with saffron gold (#c8912e) tones, serene atmosphere, 16:9, no text, no signs, no signboards, no lettering, no watermark, no logos"

# Section 2: "Tại Sao Vô Ngã Lại Quan Trọng?" — Cắt gốc tham ái / giải thoát khổ đau
$prompt2 = "Buddhist meditation scene showing release from attachment and suffering, a figure breaking free from chains of grasping and fear, luminous transformation, saffron gold (#c8912e) tones, spiritual enlightenment imagery, 16:9, no text, no signs, no signboards, no lettering, no watermark, no logos"

# Section 3: "Vô Ngã Trong 3 Truyền Thống" — 3 truyền thống Phật giáo
$prompt3 = "Three Buddhist traditions represented through visual metaphors - Theravada path of individual awakening, Mahayana compassion for all beings, Vajrayana transformation of mind - united by the central concept of emptiness and no-self, saffron gold (#c8912e), traditional Buddhist art style, 16:9, no text, no signs, no signboards, no lettering, no watermark, no logos"

Write-Host "=== Starting image generation for $slug (3 sections) ===" -ForegroundColor Green

# Tạo ảnh 1
Write-Host "`n[1/3] Creating image for section 1 (Vô Ngã Là Gì?)"
cd $scriptDir
node gemini-image.mjs "$prompt1" $outDir
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Image 1 failed" -ForegroundColor Red; exit 1 }
Start-Sleep -Seconds 5

# Tạo ảnh 2
Write-Host "`n[2/3] Creating image for section 2 (Tại Sao Quan Trọng?)"
node gemini-image.mjs "$prompt2" $outDir
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Image 2 failed" -ForegroundColor Red; exit 1 }
Start-Sleep -Seconds 5

# Tạo ảnh 3
Write-Host "`n[3/3] Creating image for section 3 (3 Truyền Thống)"
node gemini-image.mjs "$prompt3" $outDir
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Image 3 failed" -ForegroundColor Red; exit 1 }

Write-Host "`n=== All 3 images created successfully ===" -ForegroundColor Green
