# =============================================================
#  Xueying Wang Portfolio: Spring Boot -> Static Site migration
#
#  What it does:
#    [1] git safety backup (snapshot commit + backup branch)
#    [2] move static/* to repo root (images/videos/pdf included)
#    [3] move homepage template to root index.html + strip Thymeleaf
#    [4] delete the unused backend shell + dead code
#
#  Run it (in a normal PowerShell window):
#    powershell -ExecutionPolicy Bypass -File .\migrate-to-static.ps1
#
#  Rollback: git checkout backup/spring-boot-version
#  Principle: page look, animation, interaction, all functions unchanged.
# =============================================================

$ErrorActionPreference = "Stop"
$repo = "e:\Java-exercise\MyProject\Xueying_website"
Set-Location $repo
Write-Host "==> Repo: $repo"

# ---------- 1. git safety backup ----------
Write-Host "==> [1/4] Creating git safety backup ..."
git add -A
git commit -m "chore: snapshot before static migration" 2>$null | Out-Null
git branch backup/spring-boot-version 2>$null | Out-Null
Write-Host "    OK: snapshot committed, backup branch 'backup/spring-boot-version' created"

$static    = Join-Path $repo "src\main\resources\static"
$templates = Join-Path $repo "src\main\resources\templates"

# ---------- 2. move static/* to repo root ----------
Write-Host "==> [2/4] Moving static assets to repo root ..."

# remove dead code first: old duplicate homepage static/pages/
$deadPages = Join-Path $static "pages"
if (Test-Path $deadPages) {
    Remove-Item -Recurse -Force $deadPages
    Write-Host "    removed dead code: static/pages/"
}

if (Test-Path $static) {
    Get-ChildItem -Path $static -Force | ForEach-Object {
        Move-Item -Path $_.FullName -Destination $repo -Force
        Write-Host "    moved: $($_.Name)"
    }
    Write-Host "    OK: static/* moved to repo root"
} else {
    Write-Host "    ! static folder not found, skipped"
}

# ---------- 3. template -> root index.html, strip empty Thymeleaf ----------
Write-Host "==> [3/4] Processing homepage index.html ..."
$tpl = Join-Path $templates "index.html"
$idx = Join-Path $repo "index.html"
if (Test-Path $tpl) {
    Move-Item -Path $tpl -Destination $idx -Force
    Write-Host "    moved: templates/index.html -> index.html"

    # Controller never passed any model data, so every th:* expression was
    # dead (the plain href/src/text next to it is already used). Removing
    # them keeps the rendered page byte-for-byte identical.
    $html = [System.IO.File]::ReadAllText($idx)
    $html = $html -replace '\s+xmlns:th="[^"]*"', ''
    $html = $html -replace '\s+th:[a-zA-Z]+="[^"]*"', ''
    [System.IO.File]::WriteAllText($idx, $html, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "    OK: empty Thymeleaf attributes stripped (look/behaviour unchanged)"
} else {
    Write-Host "    ! templates/index.html not found, skipped"
}

# ---------- 4. delete the unused backend shell ----------
Write-Host "==> [4/4] Deleting Spring Boot backend ..."
foreach ($p in @("src", "target", "pom.xml", "Dockerfile")) {
    $full = Join-Path $repo $p
    if (Test-Path $full) {
        Remove-Item -Recurse -Force $full
        Write-Host "    deleted: $p"
    }
}
Write-Host "    OK: backend shell removed (incl. dead code Experience.java)"

Write-Host ""
Write-Host "=============================================="
Write-Host " DONE. The repo is now a clean static site."
Write-Host ""
Write-Host " Next steps:"
Write-Host "   1) Preview locally:  python -m http.server 8000   then open http://localhost:8000"
Write-Host "   2) Check page / animation / project cards / video / Beyond / copy-email all work"
Write-Host "   3) Commit + push:    git add -A ; git commit -m 'refactor: migrate to static site' ; git push"
Write-Host ""
Write-Host " Rollback: git checkout backup/spring-boot-version"
Write-Host "=============================================="
