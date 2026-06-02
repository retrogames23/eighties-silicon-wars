# Faire & konsistente Testberichte

## Problem

1. **Widersprüchliches Fazit** (siehe Screenshot Amiga 500):
   - Satz 1: „weist deutliche Schwächen auf … nur für spezielle Anwendungen geeignet."
   - Satz 2: „Die ausgewogene Leistung macht ihn zum idealen Allrounder…"
   - Ursache: In `EnhancedTestReportGenerator.generateFinalVerdict` (und analog `TestReportGenerator`) werden zwei Sätze unabhängig voneinander aus zwei verschiedenen Schwellen gebaut. Der zweite Satz fällt in den „Allrounder"-Fallback, sobald Gaming- und Business-Score nahe beieinander liegen — unabhängig vom Gesamturteil.

2. **Unfaire Bewertung am Spielanfang**:
   - `TestScoringMatrix` bewertet Komponenten absolut auf einer Skala, die für 1988er High-End geeicht ist (Intel 80486 = 90+, VGA = 95). Ein 1983er Rechner mit damals **bester** verfügbarer Hardware (z. B. Z80, TMS9918, 16 KB) erreicht selbst bei optimaler Konfiguration nur 25–45 Punkte und wird als „Mangelhaft" eingestuft.
   - Tester der Spielwelt müssten 1983 aber mit den Erwartungen von 1983 messen, nicht mit denen von 1995.

## Lösung

### 1. Era-relative Bewertung (Kern-Fix)

In `TestScoringMatrix` einen **Era-Baseline** einführen, der die maximal verfügbare Tier-Stufe pro Komponente zum Testzeitpunkt kennt:

- Neue Funktion `getEraBaseline(year, quarter)` (nutzt vorhandene Hardware-Verfügbarkeitsdaten aus `HardwareAvailabilityService` bzw. den existierenden Component-Listen).
- Liefert pro Komponententyp die zum Zeitpunkt höchste verfügbare `tier`-Stufe.
- Score-Normalisierung: `relativeScore = absoluteScore + eraBonus`, wobei `eraBonus` so gewählt ist, dass eine Konfiguration aus der jeweils besten verfügbaren Komponente einen Score von ~85–92 erreicht (statt 25 in 1983 oder 95 in 1995).
- Formel: `relativeScore = clamp(absoluteScore * (maxTierEver / maxTierThisEra), 0, 100)` mit anschließendem Cap bei 98 — so dass eine wirklich „spitzen"-Konfiguration der Ära in ihrer Zeit als spitzen wahrgenommen wird, aber spätere Generationen die historischen Geräte noch immer relativ schlechter dastehen lassen, wenn man heutige Maßstäbe anlegt (zweiter Score für „aus heutiger Sicht").
- Penalisierung bleibt bestehen, wenn der Spieler **unter** dem zeitlich Verfügbaren bleibt (alte Komponenten in neuer Ära).

API-Signaturen bekommen optional `year`/`quarter` durchgereicht; bestehende Aufrufer in `TestReportGenerator`, `EnhancedTestReportGenerator` und ggf. `TestReport.tsx` werden angepasst.

### 2. Widerspruchsfreies Fazit

`generateFinalVerdict` in **beiden** Generatoren umbauen:

- Nur **ein** zusammenhängender Verdict-String, der aus Score-Bucket **und** Spezialisierung kombiniert wird (Lookup-Tabelle statt zwei unabhängige if-Ketten).
- „Allrounder"-Satz darf nur fallen, wenn `overallScore ≥ 70` **und** Gaming/Business nah beieinander liegen.
- Bei `overallScore < 60`: keine positiven Anschluss-Sätze; stattdessen konkrete Schwäche („CPU zu schwach für die Ära", „kein zeitgemäßer Sound") aus den Komponenten-Bewertungen ableiten.
- Score-Buckets werden mit den era-relativen Scores berechnet, damit Bewertung und Fazit dieselbe Skala nutzen.

### 3. Hardware-Verfügbarkeit als Quelle der Wahrheit

Existierende Listen in `HardwareAvailabilityService` / Hardware-Komponentendaten werden gelesen, um Tier-Maxima pro Quartal zu ermitteln (kein neues Datenmodell, nur Aggregation).

## Technische Details

Geänderte Dateien:
- `src/services/TestScoringMatrix.ts` — Era-Baseline + relative Scoring-Pipeline, Tier-Daten aus Hardware-Service ziehen.
- `src/components/EnhancedTestReportGenerator.ts` — `generateFinalVerdict` neu (eine Bucket-Lookup-Tabelle, keine doppelten Sätze), `year`/`quarter` durchreichen.
- `src/components/TestReportGenerator.ts` — analog (Legacy-Generator).
- `src/components/TestReport.tsx` — Aufrufstelle übergibt `currentYear`/`currentQuarter`.
- `src/services/HardwareAvailabilityService.ts` — kleine Helper-Funktion `getMaxAvailableTiers(year, quarter)` (read-only Aggregation).
- Locales (`public/locales/de/reviews.json`, `public/locales/en/reviews.json`) — falls neue Verdict-Phrasen i18n-pflichtig werden (bestehende Hardcoded-Strings bleiben sonst wie sie sind).

Keine Änderungen an Spielmechanik, Wirtschaftsmodell, Phase-1-LWS oder anderen Bereichen.

## Validierung

- Bestehender Regressionstest `validateTopConfiguration1988Q2` bleibt grün.
- Neue Sanity-Checks (manuell):
  - 1983 Q1 mit bester Hardware → Overall ≥ 80, Verdict positiv, konsistent.
  - 1988 Q2 Top-Config → unverändert ≥ 85.
  - 1995 mit 1983er-Hardware → Overall ≤ 35, Verdict eindeutig negativ ohne „Allrounder"-Satz.
- Optisch im Preview nach Implementierung: Amiga-500-Fall darf nicht mehr beide Sätze gleichzeitig zeigen.
