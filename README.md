# Y-Chat v0.5.0 — Scene + Character Rig

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


## v0.5.0 Rendering-Upgrade

Die Darstellung wurde unterhalb der bestehenden API neu aufgebaut:

- `Yokai.createScene(...)` rendert die komplette Profil-Szene als ein responsives SVG (`viewBox 0 0 400 520`)
- Torii, Wald, Berge, Mond, Nebel, Ground-Glow und Spirit-Flames sind Teil derselben Szene
- der Character-Core besitzt jetzt Füße, Arme, eine schlankere Flame-Silhouette und mehrere Glow-Layer
- Skins bleiben reine Styling-/Extra-Layer
- Moods ändern weiterhin nur Gesicht/Effekte und funktionieren auf jedem Skin
- bestehende Shop-, LocalStorage-, Mood-Detection- und Socket.IO-Logik bleibt erhalten

Damit bleibt die Logik:

```txt
State (skin + mood)
        ↓
     Yokai API
        ↓
 Character Rig + Skin + Mood
        ↓
      Scene
```
