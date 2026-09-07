# Y-Chat

Ein flüchtiger Live-Messenger mit persönlichem Yōkai-Begleiter.

## Messenger

- Nutzer gehen mit einer Y-Chat-ID online.
- Nachrichten werden nur zugestellt, wenn beide Kontakte online sind.
- Nach dem Lesen läuft ein 60-Sekunden-Timer; danach verschwindet die Nachricht auf beiden Seiten.
- Es gibt keine Offline-Speicherung und keinen Nachrichtenverlauf.
- Der Prototyp verwendet noch keine Ende-zu-Ende-Verschlüsselung.

## Yōkai

Kage wertet keine Nachrichteninhalte aus. Seine Stimmung basiert nur auf Aktivität:

- **Happy:** 1–39 gesendete Nachrichten am aktuellen Tag
- **Sleepy:** ab 40 gesendeten Nachrichten am aktuellen Tag
- **Sad:** seit mindestens zwei Tagen nicht aktiv

Jede gesendete Nachricht gibt 1 XP. Der erste Chat eines neuen, aufeinanderfolgenden Tages erhöht die Streak. Pro 100 XP steigt das Level; ein Levelaufstieg gibt 25 Yōkai Coins.

Skins werden freigeschaltet auf Level 1 (Standard), 2 (Sakura), 4 (Neon), 7 (Kitsune) und 10 (Gold). Der Skin-Shop ist als Grundlage für später kaufbare Zusatz-Skins vorbereitet.

## Start

```bash
npm install
npm start
```

Danach läuft die App unter `http://localhost:3000`.
