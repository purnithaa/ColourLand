# Run from project root after: gh auth login
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Write-Host "Checking GitHub login..."
gh auth status | Out-Null

$repoName = "colour-land-clothing-llp"
$exists = gh repo view $repoName 2>$null
if (-not $exists) {
  Write-Host "Creating GitHub repo: $repoName"
  gh repo create $repoName --public --source=. --remote=origin --push
} else {
  Write-Host "Pushing to existing repo..."
  git push -u origin main
}

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
