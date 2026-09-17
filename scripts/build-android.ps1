$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

# Gradle 8 requires a compatible JDK; prefer Java 21 installed by Android Studio.
$jdkCandidates = @($env:JAVA_HOME)
$jdkDirectory = Join-Path $env:USERPROFILE '.jdks'
if (Test-Path -LiteralPath $jdkDirectory) {
    $jdkCandidates += Get-ChildItem -LiteralPath $jdkDirectory -Directory | Select-Object -ExpandProperty FullName
}
$jdkCandidates += 'C:\Program Files\Android\Android Studio\jbr'
$jdk21 = $jdkCandidates | Where-Object {
    $_ -and (Test-Path -LiteralPath (Join-Path $_ 'release')) -and
    ((Get-Content -LiteralPath (Join-Path $_ 'release') -Raw) -match 'JAVA_VERSION="21[.\"]')
} | Select-Object -First 1
if (-not $jdk21) {
    throw 'Install JDK 21 and set JAVA_HOME to its directory, then run npm run android:apk again.'
}
$env:JAVA_HOME = $jdk21

& npm.cmd run android:sync
if ($LASTEXITCODE -ne 0) { throw 'Android web build or Capacitor sync failed.' }

Push-Location android
try {
    & .\gradlew.bat assembleDebug --console=plain
    if ($LASTEXITCODE -ne 0) { throw 'Android APK build failed.' }
} finally {
    Pop-Location
}

New-Item -ItemType Directory -Path artifacts -Force | Out-Null
Copy-Item -LiteralPath 'android/app/build/outputs/apk/debug/app-debug.apk' -Destination 'artifacts/LittleLoop-debug.apk' -Force
Write-Output 'Installable debug APK: artifacts/LittleLoop-debug.apk'
