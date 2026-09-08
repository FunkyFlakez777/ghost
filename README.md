# MyGho

Ein flüchtiger Live-Messenger mit persönlichem Gho-Begleiter.

## Messenger

- Nutzer registrieren einen eindeutigen Namen mit Passwort und erhalten automatisch eine zufällige zwölfstellige MyGho-ID.
- Der Login funktioniert mit dem Namen oder der vollständigen MyGho-ID plus Passwort.
- Passwörter werden mit einem individuellen Salt und `scrypt` gehasht gespeichert; Klartext-Passwörter werden nicht abgelegt.
- Der eigene Browser erkennt den Account zusätzlich über einen privaten lokalen Schlüssel wieder.
- Kontakte lassen sich über ihren exakten Namen oder die vollständige MyGho-ID hinzufügen und bleiben gespeichert.
- Offline verblassen Namen; sichtbar bleiben nur „Schlafender Gho“ und die letzten vier Stellen der ID.
- Nachrichten werden nur zugestellt, wenn beide Kontakte online sind.
- Nach dem Lesen läuft ein 60-Sekunden-Timer; danach verschwindet die Nachricht auf beiden Seiten.
- Unterhaltungen werden pro Kontakt getrennt gehalten, damit parallele Chats nicht vermischt werden.
- Es gibt keine Offline-Speicherung und keinen Nachrichtenverlauf.
- Der Prototyp verwendet noch keine Ende-zu-Ende-Verschlüsselung.

Die Kontodaten enthalten bereits die Felder `email` und `emailVerified` als Grundlage für eine spätere E-Mail-Verifizierung. Der Versand von Verifizierungsmails ist in diesem lokalen Prototyp noch nicht aktiviert.

## Dein Gho

Dein Gho wertet keine Nachrichteninhalte aus. Seine Stimmung basiert nur auf Aktivität:

- **Happy:** 1–39 gesendete Nachrichten am aktuellen Tag
- **Sleepy:** ab 40 gesendeten Nachrichten am aktuellen Tag
- **Sad:** seit mindestens zwei Tagen nicht aktiv

Jede gesendete Nachricht gibt 1 XP. Der erste Chat eines neuen, aufeinanderfolgenden Tages erhöht die Streak. Pro 100 XP steigt das Level; ein Levelaufstieg gibt 25 MyGho-Coins.

Skins werden freigeschaltet auf Level 1 (Standard), 2 (Sakura), 4 (Neon), 7 (Kitsune) und 10 (Gold). Im Skin-Shop sind weitere Skins gegen MyGho-Coins erhältlich. Der einmalig einlösbare Code `dan1000xl` gibt 1.000 MyGho-Coins.

## Gho-Rituale

- morgens begrüßen
- einmal täglich die Aura antippen
- abends schlafen legen

Rituale sind vom aktivitätsbasierten Mood getrennt und geben eine kleine tägliche XP-Belohnung.

## Start

```bash
npm install
npm start
```

Danach läuft die App unter `http://localhost:3000`.
