# Schritt 2: Progression-Tuning

Ziel: Spielfluss spürbar druckvoller machen, ohne Frust. Keine UI-Änderungen, nur Balancing & Logik.

## Änderungen

### 1. Startkapital & Burn-Rate
- Startkapital von $5M → **$1.5M** (realistisch für 80er-Garagenfirma).
- Quartalsweise Fixkosten leicht erhöhen (Miete/Verwaltung skaliert mit Mitarbeiterzahl, Minimum-Overhead).
- Ergebnis: ~6–10 Quartale Runway ohne Verkäufe → echter Druck, Produkte zu launchen.

### 2. Marketing mit Diminishing Returns + Cap
- Aktuell: `sqrt(marketing)` skaliert unbegrenzt → Snowball.
- Neu: **Cap pro Quartal** relativ zum Marktsegment-Umsatz (z.B. max 15% des adressierbaren Segments wirksam).
- Zusätzlich **Sättigungskurve**: über $500k/Quartal nur noch log-Wachstum.
- Brand Awareness als persistenter Wert (0–100), der über Zeit zerfällt (−5/Quartal ohne Marketing).

### 3. Portfolio-Cap & Komplexitätskosten
- Max **8 aktive Modelle** gleichzeitig im Verkauf (mehr → Vertriebs-Malus −10% pro zusätzlichem Modell).
- Pro aktivem Modell: kleine Wartungskosten/Quartal (Support, Lagerhaltung).
- Verhindert "spam alle 12 Modelle gleichzeitig"-Strategie.

### 4. Mitarbeiter-Realismus
- Doppelte Verbuchung von Gehältern entfernen (Audit-Finding).
- Hire/Fire: **Abfindung = 1 Quartalsgehalt** bei Kündigung.
- Neueinstellungen brauchen 1 Quartal Einarbeitung (50% Produktivität im ersten Quartal).

### 5. Paradigm-Events (Markt-Schocks)
- Vordefinierte historische Events als deterministische Trigger:
  - 1983: Heimcomputer-Crash (Atari/Commodore-Preisschlacht) → Gamer-Segment −30% Preis-Toleranz.
  - 1985: PC-Clones-Welle → Business-Segment +50% Volumen, aber +Wettbewerbsdruck.
  - 1989: GUI-Erwartung (Mac/Windows) → Modelle ohne ausreichend RAM/GPU verlieren Appeal.
- Implementiert in `EconomyModel` als Event-Liste, angewandt in `calculateSegmentAppeal`.

### 6. Fallback-Sales-Pfad bereinigen
- `simulateMarketDemand` Fallback (wenn kein BOM) ignoriert aktuell Elastizität → entfernen, stattdessen warn-log + 0 Sales.
- Zwingt korrekte Modell-Definition.

## Nicht in Schritt 2
- Anti-Exploit (Save-Scumming-Härtung, Preis-Elastizität-Edges) → Schritt 3.
- UI/UX-Anpassungen.
- Tutorial/Onboarding für neue Härte.

## Technische Details
- Dateien: `EconomyModel.ts`, `GameMechanics.ts`, evtl. neue `src/lib/game/MarketEvents.ts`, `src/lib/game/BrandAwareness.ts`.
- Keine DB-Migrationen nötig (alles in GameState-Snapshot).
- Tests: Headless-Sim über 40 Quartale mit 3 Strategien vergleichen (vorher/nachher Bilanz, Marktanteil, Bankrott-Quote).

Warte auf Freigabe vor Code-Änderungen.
