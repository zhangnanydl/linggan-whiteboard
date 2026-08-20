[CmdletBinding()]
param(
    [switch]$SkipInstall,
    [switch]$NoOpenFolder
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $ProjectRoot

function Assert-Command {
    param([Parameter(Mandatory)][string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name was not found. Install Node.js 20 or newer, then run this script again."
    }
}

try {
    Write-Host ''
    Write-Host '========================================' -ForegroundColor Cyan
    Write-Host '  Linggan Whiteboard Windows EXE Builder' -ForegroundColor Cyan
    Write-Host '========================================' -ForegroundColor Cyan
    Write-Host ''

    Assert-Command -Name 'node'
    Assert-Command -Name 'npm'

    $NodeMajor = [int]((node --version).TrimStart('v').Split('.')[0])
    if ($NodeMajor -lt 20) {
        throw "Node.js is too old: $(node --version). Install Node.js 20 or newer."
    }

    $env:ELECTRON_MIRROR = 'https://npmmirror.com/mirrors/electron/'
    $env:ELECTRON_BUILDER_BINARIES_MIRROR = 'https://npmmirror.com/mirrors/electron-builder-binaries/'

    if (-not $SkipInstall) {
        Write-Host '[1/3] Installing and validating dependencies...' -ForegroundColor Yellow
        npm install --registry=https://registry.npmmirror.com --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw 'npm install failed.' }
    } else {
        Write-Host '[1/3] Dependency installation skipped.' -ForegroundColor DarkGray
    }

    Write-Host '[2/3] Building the whiteboard frontend...' -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed.' }

    Write-Host '[3/3] Creating Windows executables...' -ForegroundColor Yellow

    $ElectronRuntime = Join-Path $ProjectRoot 'node_modules\electron\dist'
    if (-not (Test-Path -LiteralPath (Join-Path $ElectronRuntime 'electron.exe'))) {
        throw 'Electron runtime is incomplete. Run the script again without -SkipInstall.'
    }

    $PackageTempRoot = Join-Path ([System.IO.Path]::GetTempPath()) "linggan-whiteboard-package-$PID"
    $PrepackagedPath = Join-Path $PackageTempRoot 'prepackaged'
    $AppStagePath = Join-Path $PackageTempRoot 'app'
    New-Item -ItemType Directory -Force -Path $PrepackagedPath | Out-Null
    New-Item -ItemType Directory -Force -Path $AppStagePath | Out-Null

    Copy-Item -Path (Join-Path $ElectronRuntime '*') -Destination $PrepackagedPath -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $ProjectRoot 'package.json') -Destination $AppStagePath -Force
    Copy-Item -LiteralPath (Join-Path $ProjectRoot 'electron') -Destination $AppStagePath -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $ProjectRoot 'dist') -Destination $AppStagePath -Recurse -Force

    npx asar pack $AppStagePath (Join-Path $PrepackagedPath 'resources\app.asar')
    if ($LASTEXITCODE -ne 0) { throw 'ASAR packaging failed.' }

    $ProductName = (node -p "require('./package.json').build.productName").Trim()
    Rename-Item -LiteralPath (Join-Path $PrepackagedPath 'electron.exe') -NewName "$ProductName.exe"
    npx electron-builder --prepackaged $PrepackagedPath --win nsis portable --x64
    if ($LASTEXITCODE -ne 0) { throw 'Electron packaging failed.' }

    Remove-Item -LiteralPath $PackageTempRoot -Recurse -Force -ErrorAction SilentlyContinue

    $ReleasePath = Join-Path $ProjectRoot 'release'
    $PackageVersion = (node -p "require('./package.json').version").Trim()
    $Executables = Get-ChildItem -LiteralPath $ReleasePath -Filter "*-$PackageVersion-*.exe" -File |
        Where-Object { $_.Name -notlike '*uninstaller*' } |
        Sort-Object Name

    Write-Host ''
    Write-Host 'Build completed successfully:' -ForegroundColor Green
    foreach ($Executable in $Executables) {
        Write-Host "  $($Executable.FullName)" -ForegroundColor Green
    }
    Write-Host ''
    Write-Host 'The NSIS file is the installer; portable is the no-install edition.' -ForegroundColor Cyan

    if (-not $NoOpenFolder) {
        Start-Process explorer.exe -ArgumentList @($ReleasePath)
    }
}
catch {
    Write-Host ''
    Write-Host "Build failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'Check the network connection, Node.js version, and the error output above.' -ForegroundColor Yellow
    exit 1
}
