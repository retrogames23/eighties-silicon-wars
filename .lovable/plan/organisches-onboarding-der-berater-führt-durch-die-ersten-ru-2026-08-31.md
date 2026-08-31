# Organisches Onboarding: Der Berater führt durch die ersten Runden

## Ziel

Neue Spieler sollen das Spiel Schritt für Schritt lernen, ohne in den ersten Quartalen fundamentale Fehler zu machen. Statt einer wirkungslos wirkenden "Nächste Runde" bekommt der Spieler klar gesagt, was mindestens noch zu tun ist — über den Business-Berater Norm.

## 1. Runden-Bereitschaftsprüfung ("Readiness Check")

Vor dem Rundenabschluss wird geprüft, ob Mindestvoraussetzungen erfüllt sind. Es gibt zwei Stufen:

**Blocker (Runde wird nicht abgeschlossen, nur in der Lernphase = erste 4 Quartale):**
- Kein Mitarbeitender eingestellt
- Kein Computer in Entwicklung und kein Modell im Verkauf

**Warnungen (Runde ist möglich, Berater fragt vorher nach):**
- Marketing-Budget bei 0, obwohl ein Modell im Verkauf ist
- Entwicklungsbudget bei 0, obwohl ein Modell in Entwicklung ist
- Budget in einem Bereich ohne passende Rolle im Team (nutzt bestehende BudgetRules-Gates)
- Kein Support-Budget/Support-Personal trotz Verkäufen
- Cash reicht nicht für die laufenden Quartalskosten

Nach der Lernphase (ab Q1 des zweiten Jahres) werden auch Blocker zu Warnungen — erfahrene Spieler sollen bewusst Risiken eingehen dürfen.

## 2. Berater-Dialog statt stiller Klick

Klickt der Spieler "Nächste Runde" und es liegen Blocker/Warnungen vor, öffnet sich der Berater unten rechts mit einer Sprechblase:

- Überschrift: "Bevor du das Quartal beendest…"
- Liste der offenen Punkte mit je einem Direkt-Link, der auf den passenden Tab springt (Personal, Entwicklung, Budgets)
- Bei Blockern: nur "Verstanden" — kein Weiter
- Bei reinen Warnungen: zusätzlich "Trotzdem beenden"

Damit wird der Berater zum aktiven Coach statt nur zur passiven Tippliste.

## 3. Geführter Einstieg (erste Runde)

Die bestehende Tour bleibt, wird aber an den Readiness-Check gekoppelt: Der Berater zeigt in Q1 immer den nächsten sinnvollen Schritt an (Team → erster Computer → Budgets → Runde beenden) und hakt Schritte automatisch ab, sobald der Spieler sie erledigt hat. Der "Nächste Runde"-Button zeigt in der Lernphase einen kleinen Hinweis-Punkt, solange offene Pflichtschritte bestehen.

## 4. Warum aktuell "nichts passiert"

Der Rundenabschluss (`handleNextTurn` in `src/pages/Index.tsx`) hat heute keine Vorabprüfung und keine sichtbare Zwischenmeldung; er läuft direkt durch mehrere asynchrone Schritte (Simulation, Welt-Events, Konkurrenz-Aktionen), bevor der Quartalsbericht erscheint. Zwei Ursachen sind zu prüfen und zu beheben:
- Fehlendes Feedback während der asynchronen Verarbeitung (Button ohne Lade-/Deaktiviert-Zustand, Doppelklicks möglich)
- Ein Fehler in einem der asynchronen Schritte, der die Verarbeitung ohne Meldung abbricht

Beides wird abgesichert: Button mit Lade-Zustand und Deaktivierung, `try/catch` um den gesamten Ablauf mit verständlicher Fehlermeldung.

## Technische Umsetzung

- Neu: `src/lib/game/TurnReadiness.ts` — reine Funktion `evaluateTurnReadiness(gameState)` liefert `{ blockers: Issue[], warnings: Issue[] }` mit i18n-Key, Parametern und Ziel-Tab. Nutzt vorhandene `BudgetRules`-Auswertung, keine neue Spiellogik.
- `src/pages/Index.tsx`: `handleNextTurn` ruft zuerst die Prüfung auf; bei Blockern/Warnungen wird der Berater geöffnet statt simuliert. Ablauf in `try/catch` mit `isProcessingTurn`-State.
- `src/components/GameDashboard.tsx`: "Nächste Runde"-Button erhält `disabled`/Spinner und Hinweis-Punkt bei offenen Pflichtschritten (Desktop und Mobile).
- `src/components/AdvisorCompanion.tsx`: neuer Modus `checklist` — zeigt die Issues, Tab-Sprünge und die Aktionen "Verstanden" / "Trotzdem beenden". Steuerung über ein leichtgewichtiges Event bzw. Prop von `Index.tsx`.
- i18n: neue Keys in `public/locales/{de,en}/advisor.json` (Checklist-Titel, ein Text je Issue, Buttons) und ggf. `ui.json` für den Button-Zustand. DE und EN vollständig.
- Keine Änderung an Wirtschaftssimulation, Balance oder Difficulty-Werten.

## Validierung

- Typecheck
- Browser-Durchlauf: Neues Spiel in 1983 — "Nächste Runde" ohne Team/Modell zeigt Berater-Checkliste und beendet nicht; nach Einstellung + Modell in Entwicklung läuft die Runde durch.
- Zweiter Durchlauf mit Warnung (Marketing 0) — "Trotzdem beenden" funktioniert.
- Sprachwechsel DE/EN prüfen.
