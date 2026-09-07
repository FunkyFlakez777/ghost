@echo off
setlocal
cd /d "%~dp0"
title Ghost Demo

echo.
echo ==============================
echo   GHOST DEMO STARTER
echo ==============================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js ist auf diesem PC noch nicht installiert.
  echo Ich oeffne jetzt die offizielle Download-Seite.
  echo Installiere dort die LTS-Version und starte danach diese Datei erneut.
  start "" "https://nodejs.org/en/download"
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\express" (
  echo Erster Start: Ghost wird einmalig vorbereitet ...
  call npm install
  if errorlevel 1 (
    echo.
    echo Vorbereitung fehlgeschlagen. Bitte Internetverbindung pruefen.
    pause
    exit /b 1
  )
)

echo Ghost startet ...
start "" cmd /c "ping 127.0.0.1 -n 3 >nul & start \"\" http://localhost:3000"
echo.
echo Browser sollte gleich automatisch aufgehen.
echo Dieses schwarze Fenster offen lassen, solange Ghost laeuft.
echo Zum Beenden einfach dieses Fenster schliessen.
echo.
node server.js
