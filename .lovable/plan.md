# Konzept: Lebendige LLM-Welt für Computer Tycoon

Vom rundenbasierten Tycoon zu einer simulierten Computer-Industrie 1975–2010, in der eine LLM-gestützte Welt-Engine Ereignisse, Konkurrenten, Presse und NPC-Dialoge erzeugt — eingebettet in deterministische, balancierte Spielmechaniken.

## Designprinzip: "Deterministischer Kern, narrative Schale"

Das LLM bestimmt **niemals direkt** Zahlen, die das Spiel balancieren (Preise, Marktanteile, Geld). Es erzeugt **Narrative, Begründungen und Auswahlmöglichkeiten**, die anschließend von deterministischer Spiellogik in numerische Effekte übersetzt werden. So bleibt das Spiel nachvollziehbar, ausbalanciert und reproduzierbar — fühlt sich aber jedes Mal anders an.

```text
┌──────────────────┐    Trigger    ┌──────────────────┐
│  Simulation Core │ ────────────► │  LLM Director    │
│ (deterministisch)│               │ (Narrativ/Wahl)  │
│                  │ ◄──────────── │                  │
└──────────────────┘  strukturierte└──────────────────┘
                       JSON-Effekte
```

## Die fünf Säulen

### 1. Welt-Director (Event Engine)
Eine LLM-gesteuerte "Regie", die quartalsweise die Welt bewegt:
- Kontext: Jahr, Quartal, aktueller Tech-Stand, große Spieler, Wirtschaftslage, vorherige Ereignisse.
- Erzeugt 1–3 **Welt-Events** pro Quartal aus festen Kategorien (Tech-Durchbruch, Politik, Konjunktur, Kulturtrend, Lieferkette, Patentstreit).
- Output ist strukturiertes JSON mit `category`, `headline`, `body`, `affectedSegments`, `magnitude` (1–5), `durationQuarters`. Der Sim-Core übersetzt `magnitude` in vordefinierte Modifikatoren — das LLM erfindet keine Zahlen.
- Historische Anker: ein leichtgewichtiger "Zeitstrahl" verhindert Unsinn (kein Smartphone-Boom 1978). Anker werden als Constraints in den Prompt geschoben.

### 2. KI-Mitbewerber als Persona-Agenten
3–5 Konkurrenzfirmen, jede mit persistenter Persona (z. B. "konservativer Bürofirmen-Riese", "wagemutiges Garagen-Startup", "japanischer Hardware-Spezialist"):
- Jede Firma hat einen deterministischen Strategie-State (Cash, Modelle, R&D-Schwerpunkt, Risikoprofil).
- Einmal pro Quartal entscheidet ein LLM-Aufruf pro Firma: "Welche der erlaubten Aktionen passt zu meiner Persona angesichts der Lage?" Aktionen sind eine geschlossene Liste (Preis senken, neues Modell ankündigen, Marketing-Push, R&D-Wechsel, Übernahme-Angebot, FUD-Kampagne).
- Das Spiel führt die Aktion deterministisch aus. Die Persona erzeugt **Tonfall** in Pressemitteilungen, nicht die Effektgröße.
- Rivalitäten und Allianzen entstehen emergent über einen "Beziehungs-Score" zwischen Firmen.

### 3. Dynamische Presse & Nachrichten
Die bestehende `Newspaper`-Komponente wird zur Schnittstelle der lebendigen Welt:
- Jedes Welt-Event und jede bedeutende Firmenaktion wird vom LLM in einen Zeitungsartikel im Stil der Ära übersetzt (Fachpresse 1985 ≠ Tech-Blog 2005).
- Reviews der eigenen Produkte werden vom LLM als Fließtext geschrieben — auf Basis der deterministischen Test-Scores aus `TestScoringMatrix`. Das LLM **interpretiert** den Score, es erfindet ihn nicht.
- Gerüchte-System: Presse kann zukünftige Tech-Trends mit Unsicherheit andeuten ("Analysten erwarten…"), was dem Spieler erlaubt zu wetten.

### 4. Beraterdialoge (Rollenspiel-Schicht)
Der Spieler kann jederzeit mit NPCs sprechen — als Chat-Interface, das wie ein internes Meeting wirkt:
- **Marktforscher**: liefert Analysen über echten Sim-State (Segmente, Konkurrenten). LLM formuliert, Daten kommen aus der Sim.
- **Chefentwickler**: schlägt R&D-Prioritäten vor, warnt vor technischen Risiken aus `ResearchPathsService`.
- **CFO**: erklärt Cashflow, warnt vor Insolvenz.
- **Aktionärsversammlung**: einmal pro Jahr, bewertet die Performance, stellt Forderungen, die zu **Soft-Zielen** werden (kein Game-Over, aber Reputation-Effekt).
- Jeder Berater ist ein Persona-Prompt mit Zugriff auf einen begrenzten Read-only Snapshot des Sim-State. Tools (im AI-SDK-Sinn): `getMarketReport`, `getCompetitorPublicInfo`, `getMyFinancials`, `proposeAction`.

### 5. Echte Handlungsfreiheit: "Freitext-Aktionen"
Über vordefinierte Buttons hinaus kann der Spieler eine **freie Aktion** pro Quartal vorschlagen ("Ich kaufe eine kleine Software-Firma aus England auf", "Wir sponsoren ein Schachturnier"):
- Das LLM klassifiziert den Vorschlag in eine **bekannte Aktionsklasse** mit Parametern (Akquisition, Marketing-Stunt, Partnerschaft, R&D-Wette, PR-Aktion).
- Kosten und Effekte berechnet der Sim-Core aus festen Formeln je Klasse + LLM-vorgeschlagenem `scale` (small/medium/large).
- Verworfene oder absurde Vorschläge erhalten eine in-character Antwort vom CFO ("Das können wir uns nicht leisten").

## Balance & "Fühlt sich an wie ein Spiel"

- **Determinismus pro Seed**: Jede Partie hat einen Seed. Welt-Director, Konkurrenz-KI und Freitext-Aktionen werden mit Seed + Quartal als Teil des Prompts gerufen → Replays sind möglich, Bugs reproduzierbar.
- **Effekt-Budget**: Pro Quartal gibt es ein festes Gesamt-"Magnitude-Budget" für alle LLM-Ereignisse zusammen. Verhindert Eskalation und Power-Creep.
- **Sichtbare Kausalität**: Jedes Quartalsende zeigt eine "Warum ist das passiert"-Liste — Spieler sehen, welches Event welchen Marktanteil bewegt hat. Vertrauen ist Pflicht.
- **Kreativitäts-Bonus**: Freitext-Aktionen mit hoher Originalität (gemessen über LLM-Klassifikator + Nicht-Wiederholung) bekommen einen kleinen Reputations-Bonus, aber keinen Geld-Cheat-Pfad.
- **Schwierigkeit**: Drei Stufen (Hobbyist / Profi / Wallstreet) skalieren KI-Konkurrenz-Aggressivität und Event-Härte — nicht den LLM-Einsatz.

## Technische Umsetzung

**Stack-Fit (bereits vorhanden):**
- Lovable Cloud + Edge Functions → Server-Side LLM-Aufrufe via Lovable AI Gateway.
- AI SDK mit `streamText`/`generateText` und `Output.object` für strukturierte Effekte (zwingend, damit Sim-Core nie freien Text parst).
- Tool-Calling für Berater-Dialoge (read-only Sim-Snapshots).

**Modellwahl:**
- Welt-Director, Konkurrenten, Presse: `google/gemini-3-flash-preview` (schnell, billig, einmal pro Quartal × wenige Aufrufe).
- Berater-Dialoge: gleiches Modell, streaming.
- Freitext-Aktions-Klassifikation: `google/gemini-3.1-flash-lite-preview`.
- Kein Bildmodell nötig in Phase 1.

**Neue Edge Functions:**
```text
supabase/functions/
  world-director/     # erzeugt Quartals-Events (JSON)
  competitor-turn/    # eine Firma pro Aufruf
  press-write/        # Artikel-Generierung aus Event/Action
  advisor-chat/       # streaming Chat mit Tools
  freeform-action/    # Klassifikation + Effekt-Vorschlag
```

**Datenmodell-Erweiterungen (Lovable Cloud):**
- `world_events` (seed, quarter, payload, applied_effects)
- `competitor_personas` (firma_id, persona_prompt, beziehungs_scores)
- `press_articles` (quarter, tone, body, refs)
- `advisor_conversations` (rolle, messages[])
- `freeform_actions` (quarter, raw_text, classified_action, outcome)
- Alle mit RLS pro `user_id` + `save_game_id`.

**Kosten-Deckel:**
- Hartes Limit: max. ~6–8 LLM-Aufrufe pro Spielquartal (1 Director, 3–5 Konkurrenten, optional 1 Presse-Bündel). Berater-Chats sind on-demand.
- Caching: Persona-Prompts pro Spielstand 1× generieren und wiederverwenden.

## Phasenplan (umsetzbar)

**Phase 1 — Lebendige Welt (MVP, ~1 Iteration):**
1. Edge Function `world-director` + Schema, Anbindung an `MarketEventsService`.
2. Erweiterte `Newspaper` mit LLM-generierten Artikeln für bestehende Events.
3. LLM-formulierte Reviews auf Basis bestehender `TestScoringMatrix`-Scores.
4. Determinismus + Effekt-Budget + "Warum-ist-das-passiert"-Panel.

**Phase 2 — Lebende Konkurrenz:**
5. Persona-System für bestehende KI-Firmen, geschlossene Aktionsliste.
6. Beziehungs-Scores + emergente Rivalitäten in der Presse.

**Phase 3 — Berater & Rollenspiel:**
7. Berater-Chat-UI (Markforscher, Chefentwickler, CFO) mit Tool-Calls.
8. Jährliche Aktionärsversammlung als geführter Dialog mit Soft-Zielen.

**Phase 4 — Echte Freiheit:**
9. Freitext-Aktions-Klassifikator + Aktionsklassen-Katalog.
10. Kreativitäts-Bonus, Anti-Exploit-Heuristiken.

**Phase 5 — Politur:**
11. Schwierigkeitsstufen, Seed-Replays, Telemetrie zur Balance-Justierung.

## Risiken und Gegenmaßnahmen

| Risiko | Gegenmaßnahme |
|---|---|
| LLM erfindet falsche Zahlen | Strukturierter Output mit Zod-Schema; Zahlen nur aus festen Magnitude-Tabellen |
| Historische Unstimmigkeiten | Tech-Anker im Prompt; harte Whitelist erlaubter Technologien je Jahr |
| Kosten explodieren | Aufruf-Budget pro Quartal; Flash-/Lite-Modelle; serverseitiges Caching |
| Spieler-Exploits via Freitext | Geschlossene Aktionsklassen; CFO-Veto bei Cash-Mangel; Kreativitäts-Score begrenzt |
| Spiel fühlt sich "zufällig" an | "Warum-Panel" + sichtbarer Zeitstrahl + Seed-Anzeige |
| LLM-Latenz stört Rundenfluss | Welt-Director läuft asynchron im Hintergrund während Spieler im Quartal handelt |

## Was bewusst NICHT KI macht

- Preisberechnung, Marktanteile, Verkaufszahlen, Cashflow → bleibt in `EconomyModel`/`AdvancedSalesSimulation`.
- Forschungsbäume, Hardware-Verfügbarkeit → bleibt in `ResearchService`/`HardwareAvailabilityService`.
- Kern-Game-Loop (Quartalswechsel, Sieg/Niederlage) → bleibt deterministisch.

So bleibt das Spiel ein **Spiel** — die KI macht es lebendig, nicht beliebig.

---

Sag mir, ob die Richtung passt — dann starten wir mit Phase 1 (Welt-Director + lebendige Presse) als ersten greifbaren Schritt.
