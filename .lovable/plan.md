# Computer Tycoon — Gesamtplan

## Phase 1.5 — Faire & konsistente Testberichte ✅

**Problem:** Widersprüchliche Verdicts (z. B. Amiga 500: „deutliche Schwächen" + „idealer Allrounder") und unfaire absolute Skala (1983-Top-Hardware → „Mangelhaft").

**Lösung:**
- `TestScoringMatrix`: Era-relative Bewertung via `getEraBaseline(year, quarter)` aus `HardwareAvailabilityService`.
- `EnhancedTestReportGenerator` & `TestReportGenerator`: `generateFinalVerdict` als **eine** Bucket-Lookup-Tabelle. „Allrounder"-Satz nur bei `overallScore ≥ 70`.
- `TestReport.tsx` reicht `currentYear`/`currentQuarter` durch.

**Validierung:** 1983-Q1-Top-Hardware ≥ 80, 1988-Q2 ≥ 85, 1995 mit 1983er-Hardware ≤ 35.

---

## Phase 2 — Lebende Spielwelt ✅

### 2a) LLM-Berater (`AdvisorChat.tsx`, `advisor-chat` Edge Function)
Drei Personas mit eigenen System-Prompts:
- Dr. Helga Brandt (Marktforschung)
- K.J. Jordan (Head of Development)
- Margarete Vogel (Aktionärin)

Floating-Button auf Dashboard, kontext-aware (year, quarter, cash, reputation, marketShare, budget, activeModels). Modell: `google/gemini-3-flash-preview`.

### 2b) Lebende KI-Konkurrenten (`CompetitorsService.ts`, `competitor-turn` Edge Function)
- DB-Tabelle `ai_competitors` mit RLS (persona_key, market_share, reputation, relationship_score).
- Drei Personas: BlueChip Industries (konservativ), Pixel Garage (Hobbyist-Startup), Crimson Systems (aggressiv).
- Pro Quartal: LLM wählt aus 7 Aktionen (price_cut, new_model_announce, layoffs, …), deterministisches Effect-Mapping, deutsche Pressemeldungen in `ai_press_articles`.

---

## Phase 2.5 — Playtest & Balancing 🎯 (NÄCHSTER SCHRITT)

**Ziel:** Vor Aufbau weiterer Systeme prüfen, ob die Kern-Feedbackschleife (Entwickeln → Testen → Verkaufen → Konkurrenz reagiert) sich rund anfühlt.

**Vorgehen:** 1–2-Stunden-Session 1983 → ~1989, mit Fokus auf:
1. **Cash-Flow** der ersten 8 Quartale: nicht zu hart, nicht zu lasch.
2. **Test-Verdicts** über alle Ären konsistent (Phase-1.5-Regression).
3. **KI-Konkurrenz** spürbar, aber nicht überwältigend (Marktanteile, Pressestimmen).
4. **Berater-Nutzen**: liefern alle drei eigenständigen Mehrwert, oder sind sie redundant?
5. **UI-Pacing**: Quartalswechsel zu schnell/langsam? Newspaper informativ?

**Output:** Bug-/Balancing-Liste als Issues → kleine Fixes vor Phase 3.

---

## Phase 3 — Tiefe & Atmosphäre 🚧 (in Arbeit)

### 3a) Jahreshauptversammlung ✅
- Nach Q4 öffnet `AnnualMeeting`-Modal mit Jahresumsatz, Cash, Reputation, Marktanteil, Anzahl neu veröffentlichter Modelle und stärkstem Konkurrenten.
- Aktionärs-Verdikt (Margarete Vogel) abgeleitet aus Reputation, Marktanteil und Jahresumsatz.

### 3c) Proaktive Berater-Trigger ✅
- Cash-Runway < 3 Monate → Toast „Margarete Vogel klopft an" mit Direkt-Action zum Berater.
- KI-Konkurrent zieht in Reputation > Spieler + 15 → Toast „K.J. Jordan empfiehlt Strategie-Check".

### Lebende Konkurrenz im Dashboard ✅
- `AiCompetitorsPanel` auf dem Markt-Tab zeigt die 3 KI-Personas mit Marktanteil, Ruf und letzter Aktion.
- `CompetitorsService.runQuarter` wird jetzt **awaited**, damit Presseartikel direkt in der Newspaper desselben Quartals erscheinen.

### 3b) Lebendes Bürogebäude (offen)
Headquarters-Visualisierung wird dynamisch über `google/gemini-3.1-flash-image-preview`, cached. Folgt im nächsten Schritt.

---

## Phase 4 — Mitarbeiter, Lizenzen, Internationalisierung, Spielende

### 4a) Mitarbeiter-System ✅
- Tabelle `staff` (RLS, eigene Reihen pro Spielerin) mit Rolle, Skill, Gehalt, Moral, Spezialgebiet.
- `StaffService`: list / hire / fire, deterministischer Bewerber-Pool pro Quartal (Mulberry32-Seed aus user+year+quarter), Era-skalierte Gehälter, `runPayroll` mit Moral-Effekt bei Unterbezahlung.
- `EmployeesPanel` im Management-Tab: Aggregat-Stats (Dev-Speed, Vertrieb, Forschung, Reputation-Boni, Moral-Ø), Team-Liste, Bewerbungsmappe.
- Quartalsfluss in `Index.tsx`: Payroll zieht Cash, synchronisiert `company.employees` (Startteam 8 + Hires) → HQ-Visualisierung wächst sichtbar mit.

### 4b–d) Lizenz-Deals · Internationaler Markt · Spielende-Bedingungen
Offen — Definition folgt nach Spieltest von 4a.

### Phase 3b) Lebendes Bürogebäude
Weiterhin offen (Bildgenerierung via `gemini-3.1-flash-image-preview`).

### Sicherheit ✅
- Alle vier AI-Edge Functions (`advisor-chat`, `competitor-turn`, `press-write`, `world-director`) prüfen jetzt JWT via `supabase.auth.getClaims()` → keine Credit-Drainage durch anonyme Aufrufe.

---

## Geänderte/erstellte Kern-Dateien (Stand jetzt)

- `src/services/TestScoringMatrix.ts`, `src/services/HardwareAvailabilityService.ts`
- `src/components/EnhancedTestReportGenerator.ts`, `TestReportGenerator.ts`, `TestReport.tsx`
- `src/components/AdvisorChat.tsx`
- `src/services/CompetitorsService.ts`
- `supabase/functions/advisor-chat/`, `competitor-turn/`, `press-write/`, `world-director/`
- `supabase/migrations/…_add_ai_competitors.sql`
- `src/pages/Index.tsx` (Integration)
