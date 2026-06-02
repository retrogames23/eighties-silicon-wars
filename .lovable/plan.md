
# Budget Allocation Redesign

## 1. Goals

- Budgetentscheidungen sollen sich **spürbar** auf Spielverlauf auswirken (Verkäufe, Entwicklungstempo, Forschungs-Durchbrüche, Reputation).
- **Freie Budgets** pro Bereich statt eines starren Gesamttopfs.
- **Personalkosten** als eigener Posten, getrennt von strategischen Budgets.
- **Team als Gate**: ohne passenden Experten kein Budget in einem Bereich nutzbar.
- Spieler soll **organisch** verstehen, welche Budgethöhe zum aktuellen Geschäft passt — über einen kleinen Berater-Avatar unten rechts ("Karl-Klammer-Funktion", eigene Optik).

---

## 2. Neues Budget-Modell

### 2.1 Bereiche (alle unabhängig wählbar, Default 0 außer Personal)

| Bereich | Wirkung im Spiel | Team-Gate (mind. 1 aktiver Mitarbeiter) |
|---|---|---|
| Personal (Salaries) | Pflicht-Auszahlung pro Quartal, summiert aus Staff | — (automatisch) |
| Entwicklung | Geschwindigkeit aktiver Modell-Entwicklungen, Qualitäts-Bonus | Engineer / Developer |
| Forschung | Fortschritt aktiver Research-Projekte, Chance auf exklusive Komponenten | Researcher |
| Marketing | Absatzmultiplikator, Reputation, Markenbekanntheit | Marketer |
| Support | Kundenzufriedenheit, Wiederkaufrate, Reputations-Schutz bei Defekten | Support |
| (optional später) Produktion | Stückzahl-Kapazität, Stückkostensenkung | Operations |

Start einer neuen Firma: **alle strategischen Budgets = $0**, nur Personalkosten laufen. Damit erlebt der Spieler sofort, dass _nichts_ passiert, solange er nicht aktiv investiert — der Avatar führt ihn zur ersten Investition.

### 2.2 Personalkosten

- Eigener Posten in der Quartalsabrechnung, abgeleitet aus `staff[].salary_per_quarter`.
- Im Budget-UI als **Read-only Karte** ("Gehälter: $X — basierend auf N Mitarbeitern").
- Klick führt zum Personal-Tab.

### 2.3 Team ↔ Budget Logik (fair und nachvollziehbar)

Regeln, die der Spieler in einer kurzen Tooltip-Zeile pro Bereich sieht:

1. **Gate**: Ohne mindestens 1 Mitarbeiter der passenden Rolle ist der Slider gesperrt und zeigt "Stelle zuerst einen [Marketer] ein".
2. **Effektivität**: Jeder Mitarbeiter über dem ersten hebt die _nutzbare Obergrenze_ pro Bereich. Formel (Vorschlag):

   ```
   capPerArea = baseCap * (1 + 0.5 * (countInRole - 1)) * avgSkillFactor
   ```

   - `baseCap` = z. B. $50k/Quartal pro Bereich.
   - `avgSkillFactor` = `0.6 + 0.8 * (avgSkill/100)` (Skill 50 ≈ 1.0).
3. **Sättigung**: Budget über `capPerArea` wird mit abnehmendem Ertrag verrechnet (z. B. √-Skalierung), damit "Geld reinkippen" allein nicht reicht — Team-Aufbau bleibt sinnvoll.
4. **Moral**: Sinkt Moral < 40, sinkt `avgSkillFactor` temporär → klare Konsequenz, klare Lösung.

Das ergibt eine konsistente Geschichte: _Team eröffnet Möglichkeiten, Budget realisiert sie, Skill und Moral bestimmen wie effizient._

### 2.4 Spielmechanische Auswirkungen (konkret)

- **Entwicklung**: aktueller `budgetSpeedMultiplier` (GameMechanics.ts:337) wird auf die neue `effectiveSpend = min(budget, capPerArea) + diminishing(budget - cap)` umgestellt.
- **Forschung**: gleicher Mechanismus auf Research-Projekte; ohne Researcher = 0 Fortschritt, auch bei Budget > 0 (Gate).
- **Marketing**: Absatz-Multiplikator pro Segment, zusätzlich Reputation +X pro Quartal proportional zu `effectiveSpend / revenue`.
- **Support**: Reduziert Reputationsverlust durch negative Events; erhöht Wiederkaufrate.
- **Personal**: unverändert als Cash-Out.

---

## 3. Advisor-Avatar ("Companion")

Kleiner persistenter Avatar unten rechts (eigene Optik — z. B. Retro-CRT-Maskottchen passend zum 80er-Look). Funktion analog zu Karl Klammer, aber dezent und abschaltbar.

### 3.1 Wann er spricht

- **Onboarding-Tour** (einmal): erklärt Personal, dann Entwicklung, dann Marketing, dann Forschung — jeweils mit einer **konkreten Budget-Empfehlung** ("Für den Anfang schlage ich $15k Marketing vor.").
- **Kontextuell** (max. 1× pro Quartal pro Thema, mit Cooldown):
  - "Dein Umsatz ist auf $X gestiegen — typisch wären jetzt ~8 % Marketing, also ~$Y."
  - "Du hast keinen Researcher, dein Forschungsbudget verpufft."
  - "Moral im Team bei 32 % — überlege Boni oder Pause."
- **Auf Knopfdruck**: Button "Frag den Berater" am Budget-Panel öffnet Chat.

### 3.2 UI

- Avatar-Bubble unten rechts, klein, animiert (Blink/Idle), nicht-blockierend.
- Klick → Sprechblase mit 1–2 Sätzen + Aktion ("Budget übernehmen", "Später erinnern", "Nicht mehr zu diesem Thema").
- Settings: "Berater-Hinweise" an/aus.

---

## 4. Aufteilung Spielmechanik ↔ LLM

Klare Trennung — deterministische Berechnungen lokal, qualitative Sprache via LLM.

### 4.1 Lokale Spielmechanik (deterministisch, kein LLM)

- Budget-Caps, Effektivitäts-/Sättigungsformeln.
- Anwendung auf Entwicklung, Forschung, Verkäufe, Reputation.
- Personalkosten-Aggregation, Moral-Update.
- **Empfehlungs-Heuristik** für Default-Werte:
  - Marketing ≈ `clamp(6 %–12 % des letzten Quartalsumsatzes, $5k, cash * 0.1)`
  - Entwicklung ≈ `40 %` der freien Cash-Reserve, wenn aktive Modelle vorhanden
  - Forschung ≈ `15 %` davon, wenn Researcher vorhanden
  - Diese Zahlen sind die **Vorschlagswerte**, die der Avatar nennt.

### 4.2 LLM (Lovable AI Gateway, bestehender `advisor-chat`)

- **Formuliert** die Empfehlung in Charakter-Sprache ("Boss, in der Werbung gärt's…").
- **Erklärt** auf Nachfrage, _warum_ ein Wert vorgeschlagen wird (liest die heuristischen Inputs als Kontext).
- **Beantwortet** freie Fragen ("Lohnt sich noch ein zweiter Engineer?") — bekommt dazu ein kompaktes State-Snippet (Cash, Umsatz, Team-Counts, Moral, aktuelle Budgets, Caps).
- **Generiert nie** Zahlen, die direkt das Budget setzen — der Spieler bestätigt; oder die Heuristik liefert die Zahl, der LLM nur den Text.

→ Vorteil: Spielbalance bleibt reproduzierbar, LLM-Kosten klein, Charme bleibt erhalten.

---

## 5. UX-Änderungen `CompanyManagement.tsx`

- Entfernen: "Verfügbares Gesamtbudget", "Auslastung %", "Budget überschritten".
- Neu pro Bereich-Karte:
  - Slider 0 … `dynamischer Max` (10× empfohlener Wert oder Cash/Quartal, je kleiner).
  - Badge "Empfohlen: $X" (Heuristik) mit Klick → übernimmt Wert.
  - Status-Chip: `Gate erfüllt` / `Kein [Rolle] im Team` (Slider disabled, CTA "Personal anheuern").
  - Mini-Bar zeigt _wo_ der aktuelle Wert auf der Kurve liegt: `unter Cap | im Cap | Sättigung`.
- Neue Karte "Personal" (read-only, Summe + Anzahl, Link zu Personal-Tab).
- Footer-Zeile: "Gesamt-Cashflow nächstes Quartal: +/– $X" — Live-Berechnung Einnahmen − (alle Budgets + Gehälter).

---

## 6. Initialer State / Migration

- Neue Firmen: `budget = { marketing: 0, development: 0, research: 0, support: 0 }`. (Index.tsx:140 anpassen.)
- Bestehende Spielstände: Default-Mapping; fehlende Felder mit 0 auffüllen, kein Datenverlust.

---

## 7. Technische Umsetzung (Kurzfassung)

- `Budget` Type erweitern (+`support`), `BudgetCaps` Helper in `src/lib/game/BudgetRules.ts` neu.
- `GameMechanics.updateModelDevelopment` & Forschungsfunktion: `effectiveSpend()` einsetzen.
- `staff` aus DB lesen für Gate-Check (Counts per Role) — bereits vorhanden via `StaffService`.
- `RecommendationEngine` (lokal, pure functions) in `src/services/BudgetAdvisor.ts`.
- Avatar-Komponente `src/components/AdvisorCompanion.tsx` (Bubble + Tour-State in localStorage).
- LLM-Aufrufe weiter über `supabase/functions/advisor-chat` — Prompt erweitert um aktuellen State + Empfehlungs-Zahlen.
- i18n-Keys unter `economy:budget.*` und neuer Namespace `advisor:*` (de + en).

---

## 8. Offene Entscheidungen für dich

1. **Support als 4. Bereich** mit aufnehmen — oder erst später?
2. **Avatar-Optik**: Retro-Maskottchen (Pixel-Art), Roboter-Kopf, oder sprechende CRT-Monitor-Ikone?
3. **Hard-Gate vs. Soft-Gate**: Slider komplett gesperrt ohne Experte (klarer, aber strenger) — oder zugelassen mit 20 % Effizienz (sanfter, lernfreundlicher)?
4. **Empfehlungs-Aggressivität**: nur on-demand vs. proaktive Quartals-Hinweise?
