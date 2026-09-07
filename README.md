# Y-Chat v0.6.0 — Exact Artwork Rig + Chat

Diese Version ändert die Rendering-Strategie.

## Was jetzt anders ist

Der Standard-Yōkai wird im Profil nicht mehr per SVG "nachgezeichnet".
Das tatsächlich gelieferte Referenz-Artwork wird als Pixel-Asset genutzt und in zwei Ebenen aufgeteilt:

- `reference-scene-clean.jpg` — Szene / Hintergrund
- `yokai-standard-exact.png` — transparenter Character-Layer aus derselben Vorlage

Der Character-Layer kann unabhängig schweben und auf Klick bouncen. Dadurch bleibt der visuelle
Standard-Yōkai tatsächlich das Referenz-Artwork und nicht eine angenäherte Code-Zeichnung.

Happy nutzt das Artwork unverändert. Andere Moods werden als separate Expressions-/Effect-Layer
darübergelegt, ohne die bestehende Mood-State-Logik zu ändern.

## Chat ist wieder Hauptansicht

`#chat` öffnet den Chat, `#yokai` das Profil.

Der Button **zurück zum Chat** ist wieder funktional. Zusätzlich öffnen der Profil-Chip im Chat
und **Yōkai ansehen** wieder das Profil.

Der Chat enthält:

- lokale Demo-Nachrichten
- Mood-Erkennung aus der bestehenden `YChatMood`-Logik
- sichtbare Yōkai-Reaktionen
- weiterhin Socket.IO-Anbindung an das vorhandene Backend

## Bestehende APIs

```js
Yokai.setMood('sad')
Yokai.setSkin('sakura')
Yokai.blink()
Yokai.bounce()
YChatMood.react('mir geht es gerade echt nicht gut')
```

## Start

```bash
npm install
npm start
```

Danach `http://localhost:3000`.
