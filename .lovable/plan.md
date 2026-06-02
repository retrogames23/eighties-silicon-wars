# Mitarbeitende als Wirtschaftssimulation

## Befund

Heute koppelt `BudgetRules.ts` Budgets an Rollen (Gate + Soft-Cap), aber:

- **Cap pro Kopf ist fix (50.000 $/Quartal)** und wächst pro zusätzlicher Person nur um +50 %. Skalierung läuft zu schnell aus.
- **Recommendation skaliert nur an Cash/Revenue**, nicht an Teamgröße. Wer wächst, bekommt keinen Push, größer einzustellen.
- **Berater warnt nur bei** (a) Budget ohne passende Rolle, (b) `saturated`-Cap, (c) Marketing < 50 % Empfehlung, (d) Cash, (e) Moral. **Es fehlt:** „Du bist nah am Cap → noch ein Engineer würde X $ zusätzlich produktiv machen", „Konkurrenz hat größeres Team", „Mehrere Modelle, nur 1 Engineer", „Support fehlt trotz aktiver Reputation-Verluste".
- **Wachstumsdruck** durch Konkurrenz wird nirgends sichtbar — der Spieler weiß nicht, dass er einstellen *muss*, um Marktanteil zu halten.

## Zieländerungen

### 1) `BudgetRules.ts` — bessere Headcount-Mathematik

- Cap-Formel umstellen, damit zusätzliche Mitarbeitende spürbarer skalieren und ein einzelner Senior nicht alles abdeckt:
  - `cap = BASE * sum_skill_factor(role)` mit `sum_skill_factor = Σ(0.5 + skill/100)` über alle Personen der Rolle.
  - Moral wirkt linear (0.5–1.1) statt harter Schwelle.
- Neue Felder in `AreaState`:
  - `utilizationPct` = `currentBudget / cap` (auch ohne Sättigung sichtbar).
  - `hireWouldUnlock` (in $): geschätzter zusätzlicher *effective spend*, wenn ein zweiter Engineer/Marketer/… mit Median-Skill dazukäme. Wird genutzt, um den Tipp „jetzt einstellen" zu rechtfertigen.
- `recommendBudget` zusätzlich an Headcount skalieren (mehr Team → höhere Empfehlung), nicht nur an Cash.
- Neue Hilfsfunktion `recommendHiring(summary, agg, ctx)` liefert pro Rolle `{ shouldHire: bool, reason: 'gate'|'utilization'|'growth'|'multi-model', priority }`.

### 2) `StaffService.ts` — Wachstums-Signal & Senior-Profile

- Candidate-Pool: ab Jahr ≥ 1986 gelegentlich „Senior"-Bewerber (Skill 70–95) zu höherem Gehalt einstreuen, damit späte Phasen sinnvolle Skalierungs-Hires bieten.
- Era-Salary-Factor leicht steiler (1.0 → 2.0 bis 1995) — passt zur Inflation und macht Wachstum zu einer Entscheidung, nicht zu einer Selbstverständlichkeit.
- `aggregate` zusätzlich `byRoleSumSkill` mitliefern, damit BudgetRules ohne Inverse-Heuristik arbeiten kann.

### 3) `AdvisorCompanion.tsx` — Hiring-Tipps

Neue Tipps in Prioritätsreihenfolge:

| Trigger | Tipp |
|---|---|
| `utilizationPct ≥ 80 %` und `hireWouldUnlock ≥ 10k` | „Dein {Bereich}-Budget läuft am Limit. Ein weiterer {Rolle} würde ca. {X} $ zusätzlich produktiv machen." |
| Aktive Modelle ≥ 2, Engineers ≤ 1 | „Du hast {N} aktive Modelle, aber nur einen Engineer. Wartung und Weiterentwicklung leiden." |
| Marketing-Budget > 0, keine Marketer | bereits vorhanden (gate) — Text präzisieren |
| Reputation < 50 oder Verkäufe gefallen, kein Support | „Reputation rutscht — ohne Support-Team kommen die Kunden nicht zurück." |
| Eigener Marktanteil < Median der KI-Konkurrenten und Headcount < `avgCompetitorTeamProxy` | „Konkurrenz wächst schneller als du. Zeit für ein größeres Team." |

Tipps zeigen konkrete Zahlen (Cap, hireWouldUnlock, ungefähres Gehaltsfenster aus Candidate-Pool).

### 4) Übersetzungen

Neue Keys in `advisor.json` (DE/EN): `tips.nearCap`, `tips.multiModelUnderstaffed`, `tips.supportMissing`, `tips.competitionGrowing`. Bestehende `needRole`-Texte um konkretes Hire-Beispiel ergänzen.

### 5) Sichtbarkeit im UI

- `EmployeesPanel`: oberhalb des Bewerber-Pools eine kompakte Hinweiszeile „Empfohlen jetzt: +1 Engineer, +1 Marketer" (kommt aus `recommendHiring`). Kein Pflicht-Modal — nur Information.
- Keine Änderungen am Spielablauf außerhalb dieser Bereiche.

## Out of Scope

- Keine Änderung an Verkaufs-/Preisformel, Cash-Buchhaltung, Loan-Flow oder Tutorial.
- Keine DB-Migrationen — alles ableitbar aus bestehenden Tabellen.

## Betroffene Dateien

- `src/lib/game/BudgetRules.ts` (Cap-Formel, neue Felder, `recommendHiring`)
- `src/services/StaffService.ts` (Senior-Pool, Era-Skalierung, `byRoleSumSkill`)
- `src/components/AdvisorCompanion.tsx` (neue Tipps + Daten)
- `src/components/EmployeesPanel.tsx` (Hinweiszeile)
- `public/locales/de/advisor.json`, `public/locales/en/advisor.json`
