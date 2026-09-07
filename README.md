# MyGho

Ein flüchtiger Live-Messenger mit persönlichem Gho-Begleiter.

## Messenger

- Nutzer gehen mit einer MyGho-ID online.
- Nachrichten werden nur zugestellt, wenn beide Kontakte online sind.
- Nach dem Lesen läuft ein 60-Sekunden-Timer; danach verschwindet die Nachricht auf beiden Seiten.
- Es gibt keine Offline-Speicherung und keinen Nachrichtenverlauf.
- Der Prototyp verwendet noch keine Ende-zu-Ende-Verschlüsselung.

## Dein Gho

Dein Gho wertet keine Nachrichteninhalte aus. Seine Stimmung basiert nur auf Aktivität:

- **Happy:** 1–39 gesendete Nachrichten am aktuellen Tag
- **Sleepy:** ab 40 gesendeten Nachrichten am aktuellen Tag
- **Sad:** seit mindestens zwei Tagen nicht aktiv

Jede gesendete Nachricht gibt 1 XP. Der erste Chat eines neuen, aufeinanderfolgenden Tages erhöht die Streak. Pro 100 XP steigt das Level; ein Levelaufstieg gibt 25 MyGho-Coins.

Skins werden freigeschaltet auf Level 1 (Standard), 2 (Sakura), 4 (Neon), 7 (Kitsune) und 10 (Gold). Im Skin-Shop sind weitere Skins gegen MyGho-Coins erhältlich. Der einmalig einlösbare Code `dan1000xl` gibt 1.000 MyGho-Coins.

## Start

```bash
npm install
npm start
```

Danach läuft die App unter `http://localhost:3000`.
