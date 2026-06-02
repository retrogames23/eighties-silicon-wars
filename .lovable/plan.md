## Ziel

Auf dem Startscreen (`GameIntro`) sollen für eingeloggte Benutzer neben "Start Game" zwei zusätzliche Optionen erscheinen:

1. **"Continue Game"** – lädt automatisch den zuletzt gespeicherten Spielstand und springt ins Dashboard.
2. **"Load Game"** – öffnet die bestehende `SaveGameManager`-Übersicht.

Beide Aktionen sollen nur sichtbar sein, wenn ein Benutzer eingeloggt ist. Die Texte werden i18n-konform in Deutsch und Englisch über `game.json` bereitgestellt.

---

## Änderungen im Detail

### 1. `src/components/GameIntro.tsx`
- Eingabe-Props erweitern um `onContinueGame` und `onLoadGame` Callbacks.
- Wenn `user` vorhanden ist:
  - Zeige drei Buttons untereinander (oder als Button-Gruppe):
    - **"Start Game"** (bestehend)
    - **"Continue Game"** (neu)
    - **"Load Game"** (neu)
  - Optische Hervorhebung: "Start Game" bleibt Primary-Button, "Continue" und "Load" als Secondary/Outline-Buttons.
- Wenn `user` nicht vorhanden ist: nur der bisherige "Start Game"-Button (keine Änderung).

### 2. `src/pages/Index.tsx`
- Neue Handler `handleContinueGame` und `handleOpenLoadManager` erstellen.
- `handleContinueGame`:
  - Query `save_games` Tabelle für den eingeloggten Benutzer, sortiert nach `updated_at DESC`, Limit 1.
  - Falls ein Spielstand existiert: `setGameState` + `onLoadGame`-Logik + `setCurrentScreen('dashboard')`.
  - Falls kein Spielstand: Toast-Fehlermeldung "No saved games found".
- `handleOpenLoadManager`:
  - Setzt `showSaveManager = true` (bereits vorhandener State).
- Props an `GameIntro` durchreichen.

### 3. i18n-Keys in `public/locales/{de,en}/game.json`
Neue Schlüssel unter `intro`:
```json
"continueGame": "Continue Game",
"loadGame": "Load Game",
"noSavedGames": "No saved games found."
```

### 4. UI-Schema in `public/locales/{de,en}/ui.json` (optional)
Falls `noSavedGames` besser im `toast`- oder `ui`-Namespace aufgehoben ist, wird der Toast-Key stattdessen dort ergänzt.

---

## Technische Details

- Datenbank-Zugriff für "Continue Game" via Supabase-Client direkt in `Index.tsx` (keine neue Tabelle).
- Keine neuen Dependencies.
- Der `SaveGameManager` wird unverändert wiederverwendet.
- Keine Änderungen an Spielmechanik oder Budget-System.