# Y-Chat v0.4.0 — Mood Skins UI

Komplette Demo im Stil der gelieferten Y-Chat-Designvorlage.

## Enthalten

- responsive Dark-UI mit Profil-/Phone-Panel
- animierter SVG-Yōkai ohne externe Bilddateien
- 6 Moods: `happy`, `calm`, `sleepy`, `sad`, `hyped`, `curious`
- 5 Skins: Standard, Sakura, Neon, Kitsune, Gold
- Skin-Shop mit YC-Guthaben, Freischalten und Ausrüsten
- Speicherung in `localStorage`
- Mood-Tabs, Reaktionsbeispiele, Stats und Einstellungen
- vorhandenes Express + Socket.IO Backend bleibt kompatibel
- Render-Konfiguration enthalten

## Start lokal

```bash
npm install
npm start
```

Danach `http://localhost:3000` öffnen.

## Browser API

```js
Yokai.setMood('sad')
Yokai.setSkin('sakura')
Yokai.blink()
Yokai.bounce()
Yokai.sleep()
Yokai.lookLeft()
Yokai.lookRight()
Yokai.lookCenter()

YChatMood.react('mir geht es gerade echt nicht gut')
```

Nicht freigeschaltete Skins öffnen beim Aufruf von `Yokai.setSkin(...)` automatisch den Shop.

## GitHub austauschen

Die Dateien aus diesem Ordner können den Inhalt deines bisherigen Repositories ersetzen. `server.js`,
`package.json` und `render.yaml` liegen wieder im Root; alle Frontend-Dateien liegen unter `public/`.

Wenn Render bereits mit dem GitHub-Repository verbunden ist, genügt nach dem Commit/Push der normale
Auto-Deploy.
