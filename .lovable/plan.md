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

## Phase 3 — Tiefe & Atmosphäre (geplant)

### 3a) Jahreshauptversammlung
Am Jahresende: zusammenfassender Report (Umsatz, Marktanteil, Reputation, Konkurrenz), Aktionärs-Bewertung, optionale strategische Weichenstellungen.

### 3b) Lebendes Bürogebäude (Banana-Pro / Gemini-Image)
Headquarters-Visualisierung wird dynamisch: Fenster leuchten je nach Aktivität, Erweiterungen bei R&D-Investitionen, jahreszeitliche/zeitalter-spezifische Stilanpassung. Bildgenerierung über `google/gemini-3.1-flash-image-preview`, cached.

### 3c) Weitere Berater-Trigger
Proaktive Berater-Pings bei kritischen Ereignissen (Cash < 30 Tage Runway, Konkurrent veröffentlicht überlegenes Modell, Reputation fällt > 20 %).

---

## Phase 4+ — Offen
Mitarbeiter-System, Lizenz-Deals, internationaler Markt, Spielende-Bedingungen. Definition erst nach Phase 3.

---

## Geänderte/erstellte Kern-Dateien (Stand jetzt)

- `src/services/TestScoringMatrix.ts`, `src/services/HardwareAvailabilityService.ts`
- `src/components/EnhancedTestReportGenerator.ts`, `TestReportGenerator.ts`, `TestReport.tsx`
- `src/components/AdvisorChat.tsx`
- `src/services/CompetitorsService.ts`
- `supabase/functions/advisor-chat/`, `competitor-turn/`, `press-write/`, `world-director/`
- `supabase/migrations/…_add_ai_competitors.sql`
- `src/pages/Index.tsx` (Integration)
