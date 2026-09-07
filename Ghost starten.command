#!/bin/bash
cd "$(dirname "$0")"
clear
printf '\n👻 Ghost Demo startet …\n\n'
if ! command -v node >/dev/null 2>&1; then
  echo 'Node.js ist noch nicht installiert.'
  echo 'Ich öffne die offizielle Download-Seite. Bitte die LTS-Version installieren.'
  open 'https://nodejs.org/en/download'
  echo
  read -n 1 -s -r -p 'Danach diese Datei erneut doppelklicken. Taste drücken zum Schließen …'
  exit 1
fi
if [ ! -d node_modules ]; then
  echo 'Erster Start: Ghost richtet sich einmalig ein …'
  npm install || { echo 'Installation fehlgeschlagen.'; read -n 1 -s -r -p 'Taste drücken …'; exit 1; }
fi
(sleep 2; open 'http://localhost:3000') &
echo 'Ghost läuft. Dieses Fenster offen lassen.'
echo 'Zum Beenden: Ctrl+C'
echo
npm start
