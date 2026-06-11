# Plan: Deterministische Wirtschaftssim + lebendige LLM-Welt + headless Balance-Tests

## Ziel

Zwei Schichten sauber trennen:

1. **Sim-Core (deterministisch, regelbasiert, ohne LLM)** — entscheidet, was passiert. Reproduzierbar, testbar, fair.
2. **Narrative-Layer (LLM)** — entscheidet, *wie es sich anfühlt*. Welt-Events, Berater, VC-Pitches, Pressetexte. Wirkt auf den Core nur über ein eng definiertes, gedeckeltes Effekt-Budget.

Balance wird headless geprüft, fast komplett ohne LLM-Credits.

---

## Teil A — Sim-Core härten (deterministisch & fair)

### A1. Single Source of Truth
- `EconomyModel` bleibt einziger Ort für Sales-/Profit-Pipeline.
- `AdvancedSalesSimulation` und Reste in `GameMechanics` als Adapter markieren oder löschen. Keine zweite Formel.
- Alle Eingaben der Pipeline (Modelle, Markt, Events, Konkurrenten, Forschung) fließen über eine `QuarterContext`-Struktur rein, ein `QuarterResult` raus. Reine Funktion.

### A2. Determinismus durchziehen
- Pflicht: keine `Math.random()` im Sim-Pfad. Nur `quarterRng(userId, year, quarter, salt)` aus `src/lib/game/rng.ts`.
- Lint-Regel / Test, der `Math.random` unter `src/components/Economy*`, `src/services/*`, `src/lib/game/*` verbietet.
- Salts pro Subsystem (`"sales"`, `"competitor"`, `"events"`, `"reviews"`) damit Streams unabhängig sind.

### A3. Fairness-Invarianten (als Code-Assertions im Dev-Build)
- Kein Modell verliert >X% Appeal pro Quartal ohne dokumentierten Grund (Obsoleszenz, Event).
- Profit-Identität: `revenue == bom + dev + marketing + production + overhead + netProfit` (±1).
- Preis-Toleranz pro Segment hat harte Min/Max-Klammern; LLM-Effekte können sie nicht durchbrechen.
- Wettbewerber: gleicher Algorithmus wie Spieler (gleiche Formeln, keine versteckten Boni/Mali außer Schwierigkeitsgrad-Multiplikator).

### A4. Spielspaß-Hebel (regelbasiert, nicht LLM)
- **Kurzfrist-Feedback**: jedes Quartal Top-3 Treiber für Umsatz/Verlust sichtbar im `WhyPanel` (Daten kommen aus dem `QuarterResult`, kein LLM nötig).
- **Mittelfrist-Ziele**: Meilensteine (erste 10k Units, erste GUI-Maschine, erstes profitables Jahr) — deterministisch, triggern Events.
- **Langfrist-Druck**: Paradigmen-Events (`ParadigmEvents.ts`) ausbauen, damit Strategien altern und Pivots nötig sind.

---

## Teil B — LLM als Welt-Layer, nicht als Sim-Treiber

### B1. Effekt-Budget verbindlich machen
- `LivingWorldService` hat bereits Magnitude → Multiplikator + `applyBudget`. Hart festschreiben:
  - max. 1 LLM-Call pro Quartalswechsel
  - Summe |demand_delta| ≤ 0.20, Produkt der price_multiplier ∈ [0.8, 1.2] pro Segment
  - Caps werden im Core erzwungen, nicht im LLM-Prompt
- Fallback bei LLM-Ausfall: kuratierte historische Events (deterministisch aus `quarterRng`) springen ein, sodass die Welt nie „still" ist.

### B2. Rollenspiel-Module mit echten, aber begrenzten Auswirkungen
Jedes RP-Modul liefert dem Sim-Core ein **typisiertes, gedeckeltes Resultat**:

| Modul | LLM-Job | Sim-Effekt (deterministisch gemappt) | Cap |
|---|---|---|---|
| VC-Pitch (`VcPitchService`) | Bewertet Pitch-Argumente, Persönlichkeit | Bewertung 0–100 → Term-Sheet (Summe, Equity, Milestone-Klausel) | feste Tabelle, Score → Summe |
| Berater (`AdvisorChat`) | Erklärt Daten, schlägt Strategien vor | Nur Hinweise, keine direkten Stat-Änderungen | 0 |
| Welt-Events | Schlagzeile + Magnitude | über B1-Caps | siehe B1 |
| Presse | Rein narrativ | 0 | 0 |
| Annual Meeting | Bewertet Geschäftsjahr | Moral-Modifier ±5% Produktivität 1 Quartal | hart geclamped |

Regel: **Jeder LLM-Output, der in den Core fließt, durchläuft einen Validator** der ihn in das erlaubte numerische Korsett zwingt. Halluzinationen können nichts kaputtmachen.

### B3. Persistenz für Replay
- Alle LLM-Outputs mit `(user_id, year, quarter, seed)` speichern (teilweise vorhanden: `ai_world_events`, `ai_press_articles`).
- Beim Laden eines Saves werden gespeicherte Effekte angewendet, keine neuen LLM-Calls — Save-Scumming sinnlos.

---

## Teil C — Headless, credit-schonende Balance-Tests

Basis ist `scripts/sim/headlessEconomySim.ts`. Wir erweitern es zu einem Test-Harness.

### C1. LLM komplett mockbar
- Schnittstelle `WorldDirector` einführen mit zwei Implementierungen:
  - `LiveWorldDirector` → ruft `world-director` Edge Function (Produktion).
  - `ScriptedWorldDirector` → liest Events aus YAML/JSON-Fixture, deterministisch pro `(year, quarter)`.
- Headless-Sim nutzt **immer** den Scripted-Director → **0 LLM-Credits**.
- Genauso für VC-Pitch (Mock liefert fixe Score-Funktion).

### C2. Strategien & Personas
Min. 6 Strategien (jetzt 3): Cheap-Spam, Premium-Niche, Tech-Leader, Fast-Follower, Cashflow-King, Boom-Bust-Leverage. Jede läuft 40 Quartale × N seeds (z.B. N=20).

### C3. Metriken pro Lauf
- Endkapital, Peak-Kapital, Pleite-Quartal (falls)
- Marktanteil je Segment über Zeit
- Profit-Volatilität (σ)
- Anteil Quartale im Verlust
- „Comeback-Rate" nach ersten Verlustjahr

### C4. Balance-Kriterien (CI-tauglich)
Tests failen, wenn:
- Eine Strategie dominiert (>80% Win-Rate gegen alle anderen über alle Seeds)
- Eine Strategie chancenlos ist (<5% Überleben über 10 Jahre)
- Profit-Identität verletzt (siehe A3)
- Determinismus-Test: gleicher Seed → byte-identisches CSV
- LLM-Cap-Test: Scripted-Director feuert Extrem-Events → Sim bleibt in den Korsett-Grenzen (B1)

### C5. Reporting
- Markdown-Report mit Heatmap (Strategie × Seed → Endkapital)
- CSV pro Lauf für Tiefenanalyse
- GitHub Action: läuft bei jedem PR der Sim-Code anfasst (`src/components/Economy*`, `src/lib/game/*`, `src/services/LivingWorld*`)

### C6. Optionaler „LLM-Smoke-Test" (gezielt, selten)
- Einmal pro Woche / per Hand: 1 Strategie × 20 Quartale mit echtem LLM, prüft nur, dass Outputs den Validator passieren. Kosten minimal.

---

## Technische Details (für Entwickler)

- Neue Dateien: `src/lib/game/QuarterContext.ts` (Typen), `src/lib/game/WorldDirector.ts` (Interface), `scripts/sim/scriptedDirector.ts`, `scripts/sim/fixtures/events-1983-1995.json`, `scripts/sim/runBalanceMatrix.ts`, `tests/balance/*.test.ts`.
- ESLint-Regel `no-restricted-syntax` für `Math.random` in Sim-Pfaden.
- Validator-Helfer `clampLlmEffect(raw): AppliedEffect` zentral in `LivingWorldService`.
- `useGameState` ruft am Quartalsende: `simCore.advance(ctx) → applyLlmEffects(result, director) → persist`.
- Keine Änderung an UI-Komponenten in diesem Plan außer `WhyPanel` (zeigt Top-Treiber + aktive Welt-Events bereits, evtl. um „Cap erreicht"-Hinweis ergänzen).

## Reihenfolge

1. A1+A2 (SOT + RNG-Lint) — Fundament
2. A3 Invarianten + Determinismus-Test in CI
3. C1 ScriptedDirector + C2/C3 Matrix-Runner
4. B1 Caps hart im Code
5. C4 Balance-Kriterien als Test-Suite
6. B2 Rollenspiel-Validatoren konsolidieren
7. C5 Reporting + GitHub Action

## Nicht-Ziele

- Keine UI-Überarbeitung.
- Keine neuen Spielmechaniken (nur Härtung & Testbarkeit der bestehenden).
- Kein Wechsel des LLM-Providers.
