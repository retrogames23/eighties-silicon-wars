## Audit-Ergebnis (Kurzfassung)

Die Codebase ist mechanisch reich, hat aber **drei strukturelle Probleme**, die alle drei Ziele (Realismus, Progression, Fairness) gleichzeitig untergraben.

### Kritische Befunde

| # | Befund | Datei | Schwere |
|---|---|---|---|
| 1 | `calculateSegmentAppeal` ignoriert **CPU/RAM/GPU vollständig** — ein Z80 in 1990 ist genauso attraktiv wie ein 80486 | `src/components/EconomyModel.ts:353–356` | Kritisch |
| 2 | Zwei **getrennte Konkurrenz-Systeme** (`CompetitorsService` ↔ `INITIAL_COMPETITORS`) — KI-Aktionen haben keinerlei Effekt auf Spieler-Verkäufe | `CompetitorsService.ts` vs `GameMechanics.ts:134–207` | Kritisch |
| 3 | Kein **Generationen-Sprung** (8-bit → 16-bit → 32-bit). Nur Modell-Alter zählt, nicht Technologie-Generation | `EconomyModel.ts:259–267` | Hoch |
| 4 | `PriceDecayManager.applyQuarterlyPriceDecay` ist ein **`console.log`-Stub** — der Aufruf in `processQuarterTurn` ist wirkungslos | `GameMechanics.ts:509–513` | Hoch |
| 5 | **Save-Scumming**: `handleLoadGame` lädt ohne Validierung; 15–30 % Verkaufs-Varianz lässt sich beliebig würfeln | `Index.tsx:567` | Hoch |

### Weitere Befunde (Mittel/Niedrig)

- **$5 M Startkapital** = ~83 Quartale Burn ohne jede Aktivität → kein Druck im Early Game.
- **Marketing-Cap 3.0×** mit `√(budget)` Skalierung wird ab Q1 mit $225 K/Quartal erreicht → Marketing-Snowball.
- **Kein Portfolio-Cap**: Spieler kann mit 3 Modellen 24 % je Segment greifen, addiert >70 % Gesamtmarkt.
- **Fallback-Sales-Pfad** in `GameMechanics.ts:641` ignoriert BOM und Elastizität → frei profitabel bei Import-Fehler.
- **Staff-Gehälter doppelt geführt**: hartkodierte $60 K vs echte `staff`-Tabelle — Hire/Fire kostet nichts.
- **Keine Paradigmen-Events** (IBM-Klone, GUI, Workstation-Boom) — keine Mid-/Late-Game-Disruption.
- **Marktgröße-Formeln inkonsistent** (Einheiten vs. Dollar) zwischen `EconomyModel` und `GameMechanics`.

### Was bereits gut ist

- Komponenten-Preisverfall korrekt exponentiell mit Inflation-Gegendruck (`EconomyModel.ts:138–168`).
- Historisches Unlock-Timing der CPUs/Sound-Chips ist authentisch.
- Marketing-Effektivität nutzt `sqrt` (statt linear) → grundsätzlich richtige Dämpfung.
- Preis-Elastizität oberhalb `maxPrice` ist exponentiell.
- Saisonalität (Q4 ×1.4, Q1 ×0.8) ist implementiert.

---

## Plan für Schritt 1 — "Realismus-Fundament reparieren"

Fokus auf die fünf kritischen/hohen Befunde, **bevor** wir an Balancing-Feinheiten gehen. Keine Änderung an UI oder Spielgefühl der bestehenden Buttons — nur Simulations-Backend.

### 1.1 Hardware-Specs müssen Nachfrage beeinflussen
- `calculateSegmentAppeal(model, segment, year, quarter)` umschreiben:
  - Berechnet **Spec-Score** aus CPU-Performance, RAM, GPU, Sound, Storage (alle 0–100 normalisiert).
  - **Segment-Gewichtung**: Gamer = GPU/Sound stark, Business = CPU/RAM/Display, Workstation = CPU/RAM/Storage.
  - Vergleich gegen **„Stand der Technik" im aktuellen Jahr** (Median verfügbarer Komponenten via `HardwareManager`), nicht gegen fixen Baseline-Wert.
  - Ergebnis: 30 % statisch (Marken-Appeal) + 70 % spec-getrieben.

### 1.2 Generationen-Obsoleszenz (8/16/32-bit)
- Neue Funktion `getTechGeneration(cpu, year)` → `8bit | 16bit | 32bit`.
- In `calculateObsolescenceFactor` zusätzlich zur Quartals-Abnutzung einen **Generationen-Malus** (z. B. −25 % pro abgehängter Generation) anwenden, sobald die nächste Generation am Markt verfügbar ist.
- Schwellen historisch korrekt: 16-bit ab Q2/1984 (68000), 32-bit ab Q1/1986 (80386).

### 1.3 Konkurrenz-Systeme zusammenführen
- `EconomyModel.calculateCompetitionImpact` liest jetzt die **aktive `AiCompetitor`-Liste** aus dem GameState (statt der toten `INITIAL_COMPETITORS`).
- KI-Marktanteils-Bewegungen aus `CompetitorsService.applyActionEffects` reduzieren den verfügbaren Markt für Spieler-Modelle im jeweiligen Segment.
- Keine doppelte Datenhaltung — `INITIAL_COMPETITORS` wird nur noch als Seed für neue Spiele verwendet.

### 1.4 Preis-Decay-Stub durch echte Anwendung ersetzen
- `PriceDecayManager.applyQuarterlyPriceDecay` entfernen oder zur reinen Telemetrie-Funktion machen.
- Korrekt-Pfad: `EconomyModel.calculateBOMCostsWithDecay` bleibt die Single Source of Truth — der unwirksame Call in `GameMechanics.ts:511` wird gelöscht, damit keine falsche „funktioniert"-Suggestion entsteht.

### 1.5 Save-Scumming entschärfen (minimal-invasiv, kein Multiplayer-Zwang)
- **Deterministisches RNG pro Quartal**: Seed = `hash(userId + year*4 + quarter)`. Re-Load reproduziert exakt dieselben Sales-Würfe → Save-Scum bringt nichts mehr.
- Implementierung: kleiner Mulberry32-Seeded-RNG in `src/lib/game/rng.ts`, in `simulateMarketDemand` statt `Math.random()` verwenden.

### Test-Strategie
- Headless-Simulation: `npm run test:sim` Skript, das 40 Quartale (1983 Q1 – 1992 Q4) mit drei festen Strategien (Billig-Z80-Spam, Mid-Tech-Premium, R&D-Heavy) durchspielt und Kennzahlen ausgibt (Cash-Verlauf, Marktanteil, Modell-Lebenszyklus).
- Vorher/Nachher-Vergleich derselben Strategien → bestätigt, dass Z80-Spam in 1990 nicht mehr profitabel ist und 32-bit-Investitionen sich auszahlen.

### Bewusst NICHT in Schritt 1

Folgendes kommt in Schritt 2/3 (Progression-Tuning & Anti-Exploit), nach Freigabe von Schritt 1:
- Startkapital-Reduktion / dynamische Anfangs-Loans
- Marketing-Cap absenken + diminishing returns verschärfen
- Portfolio-Marktanteils-Cap
- Paradigmen-Events (IBM-Klone 1985, GUI 1989, Multimedia 1991)
- Hire/Fire-Severance + Reconnect der staff-Tabelle an Quartals-Kosten
- Fallback-Sales-Pfad härten oder entfernen
- Marktgröße-Formeln vereinheitlichen

---

## Erwartetes Ergebnis nach Schritt 1

- Ein Spieler, der 1990 noch Z80-Maschinen verkauft, sieht den Umsatz einbrechen — wie historisch.
- KI-Konkurrenten werden mechanisch spürbar (nicht nur narrativ in den News).
- Save-Scumming verliert seinen Nutzen für RNG-Optimierung.
- Code-Basis hat **eine** Wahrheit für Preisverfall und **eine** Wahrheit für Konkurrenz — Fundament für alle weiteren Balancing-Schritte.

**Warte auf deine Freigabe, bevor ich Code ändere.**