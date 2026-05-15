# Run from project root after: gh auth login
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Write-Host "Checking GitHub login..."
gh auth status | Out-Null

$remoteUrl = "https://github.com/purnithaa/ColourLand.git"
if (-not (git remote get-url origin 2>$null)) {
  git remote add origin $remoteUrl
} else {
  git remote set-url origin $remoteUrl
}
Write-Host "Pushing to $remoteUrl ..."
git push -u origin main

Write-Host ""
Write-Host "GitHub push complete. Repo URL:"
gh repo view --web 2>$null
gh repo view --json url -q .url

Write-Host ""
Write-Host "Next: deploy on Vercel"
Write-Host "  1. Go to https://vercel.com/new"
Write-Host "  2. Import the GitHub repo above"
Write-Host "  3. Add env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY"
Write-Host "  4. Deploy"
Write-Host ""
Write-Host "Or run: npx vercel --prod  (after: npx vercel login)"
