## Ziel

Drei Schwierigkeitsgrade — **Leicht (aktueller Stand), Normal, Schwer** — als zentrales, deterministisch testbares Profil. Auswahl beim Spielstart, sichtbar in HUD, headless validierbar.

## Difficulty-Profile

Ein einziger Konfigurations-Block pro Stufe, der alle relevanten Stellschrauben kapselt. Keine verstreuten if-Abfragen.

| Hebel | Leicht | Normal | Schwer |
|---|---|---|---|
| Startkapital | $1.5M | $1.0M | $750k |
| Bankrott-Schwelle | −$2.0M | −$1.0M | −$500k |
| Bankrott-Folge | Game Over | Game Over | **Game Over (perma-loss)** |
| Zwangs-Notkredit | — | Einmal $500k @ 12 % Zins | — (kein Rettungsnetz) |
| KI-Druck (Ceiling) | 0 | bis 0.40 in 1992 | bis 0.70 in 1992 |
| Fixkosten-Multiplikator | 1.00 | 1.10 | 1.25 |
| Rezessions-Nachfrage | −15 % | −22 % | −30 % |
| RAM-Knappheit BOM | ×1.25 | ×1.40 | ×1.60 |
| Krisen-Anzahl 10 J | 4 | 5 | 7 (zusätzlich: Patentstreit 1989, Zinsschock 1991) |
| Reputations-Schaden bei Verlust | normal | ×1.5 | ×2.0 |
| Marketing-Sättigung | unverändert | bei $400k statt $500k | bei $300k |

„Beides je nach Tiefe": Normal hat einen einmaligen Notkredit (12 % Zins, 8 Quartale Tilgung) als Rettungsnetz, Schwer bekommt **kein** Notkredit-Sicherheitsnetz → echte Perma-Loss.

## Architektur

### Neuer Single-Source-of-Truth

```text
src/lib/game/Difficulty.ts
  ├─ type DifficultyId = "easy" | "normal" | "hard"
  ├─ interface DifficultyProfile { ... alle Hebel oben ... }
  └─ DIFFICULTY_PROFILES: Record<DifficultyId, DifficultyProfile>
```

Profile sind reine Daten, kein Code. Damit kann der Headless-Runner direkt jedes Profil als zusätzliches Szenario laden.

### Integration in bestehende Systeme

```text
EconomyModel        ← liest fixedCostMultiplier, marketingSaturationPoint,
                       aiCompetitorPressure (bereits vorhanden, jetzt aus Profil gespeist)
GameMechanics       ← Bankrott-Schwelle, Reputations-Multiplikator
LivingWorldService  ← Krisen-Häufigkeit (mehr forced shocks pro Quartal-Window)
LoanService         ← Notkredit-Trigger nur in Normal, Zinssatz aus Profil
CompanySetup        ← Auswahl-Tile (3 Karten), schreibt difficulty in gameState
useGameState        ← persistiert difficulty im Save-Game (kein Mid-Game-Wechsel)
GameDashboard       ← Badge im Header, Tooltip mit aktiven Modifikatoren
```

### UI: Auswahl im CompanySetup

Drei nebeneinander stehende Karten direkt nach Firmenname/Logo, vor dem „Spiel starten"-Button:

```text
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   LEICHT    │ │   NORMAL    │ │   SCHWER    │
│ Entspannt   │ │ Klassisch   │ │ Hardcore    │
│ $1.5M       │ │ $1.0M       │ │ $750k       │
│ Keine KI    │ │ KI mittel   │ │ KI stark    │
│ Wenig Krisen│ │ Normale Welt│ │ Viele Krisen│
└─────────────┘ └─────────────┘ └─────────────┘
```

Default: **Normal** (anders als heute).

## Headless-Balance-Validierung

`runBalanceMatrix.ts` lädt jetzt 3 Profile statt fest verdrahteter „baseline/stress":

- **Leicht** — 100 % Survive bei allen, top/bottom Median ≤ 3×
- **Normal** — ≥ 70 % Survive bei allen, top/bottom Median ≤ 2.5×, mind. 1 Strategie geht in ≥ 10 % der Seeds pleite (sonst zu leicht)
- **Schwer** — ≥ 20 % Survive bei mind. 4 Strategien, weniger als 50 % bei den schlechtesten 2 (echtes Aussieben), kein 100-%-Winner

Damit haben wir messbare Gates statt Bauchgefühl.

## Save-Game-Kompatibilität

`difficulty` wird optional gelesen, Default `"easy"` für alte Saves → keine Migration nötig, kein Bruch.

## Out of Scope

- Achievement-System für „auf Schwer gewonnen" (eigenes Feature).
- Dynamische Difficulty (Anpassung während Partie).
- Cosmetic-Belohnungen.

## Umsetzungs-Reihenfolge

1. `Difficulty.ts` mit Profilen und Reader-Helfern.
2. `EconomyModel` und `GameMechanics` lesen aus dem aktiven Profil.
3. `useGameState` / Save-Game-Persistenz.
4. CompanySetup-UI mit drei Karten.
5. `LoanService`-Notkredit-Hook für Normal.
6. `runBalanceMatrix.ts` auf 3 Profile umstellen, Gates anpassen.
7. HUD-Badge in `GameDashboard`.
8. i18n-Strings in `game.json` / `ui.json` (DE + EN).
