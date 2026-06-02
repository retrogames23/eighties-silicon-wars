# Finanzierung: Kredit & VC-Pitch

Zwei neue Finanzierungswege, beide an die bestehende Economy-Sim angedockt. Vorher-Freigabe nötig.

## 1. Kreditfinanzierung (Bank)

**Voraussetzungen** (Bonitätsprüfung beim Klick):
- Mindestens 2 abgeschlossene Quartale mit positivem Umsatz (`quarterlyRevenue > 0`).
- Schuldenstand < 50 % des durchschnittlichen Quartalsumsatzes der letzten 4 Q.
- Reputation ≥ 30.
- Maximaler Kredit = 4 × Ø-Quartalsumsatz letzter 4 Q.

**Konditionen** (historisch 80er, dynamisch):
- Leitzins ab Jahr: 1983 = 11 %, 1984–86 = 9 %, 1987–88 = 7 %, 1989+ = 8 % p.a.
- Aufschlag nach Reputation: Rep ≥ 70 → +1 %; Rep < 50 → +3 %; sonst +2 %.
- Laufzeit: 8, 12 oder 16 Quartale (Spielerwahl).
- Quartalsweise Annuität (Tilgung + Zins), abgezogen in `processQuarterTurn`.

**Default-Mechanik:**
- Zahlungsausfall (Cash < Annuität): Reputation −15, Strafzinsen 5 % aufs Restdarlehen.
- Bei 3 aufeinanderfolgenden Ausfällen: Reputation −30, Kredit gekündigt (alles fällig). Wenn nicht zahlbar → Game-Over-Pfad oder Insolvenz-Trigger (vorerst nur Warnung + Reputation-Schaden).

**Daten:** neue Tabelle `loans` (user_id, principal, rate, quartersTotal, quartersPaid, status). Plus `loan_payments` Log.

## 2. VC-Pitch (LLM-gesteuert)

**Ablauf im UI:**
1. Spieler öffnet "VC-Pitch" → wählt Pitch-Setup:
   - Angebotener Anteil (1–40 %)
   - Verwendung der Mittel (Freitext: "R&D", "Marketing", "Neue Modellreihe")
   - Bewertungs-Vorschlag des Spielers (post-money valuation in $)
2. LLM bekommt: Firmen-KPIs (Cash, Reputation, MarketShare, Modelle, Brand, Quartal/Jahr, Schulden) + Pitch.
3. LLM stellt 3 kritische Nachfragen, eine nach der anderen — Spieler antwortet jeweils per Textinput.
4. LLM bewertet (server-seitig, hidden Reasoning) Antworten anhand:
   - Konsistenz mit den Zahlen
   - Realismus für 80er-Jahre-Markt
   - Klarheit der Wachstumsstory
5. LLM gibt zurück: `accepted: bool`, `negotiatedValuationMultiplier ∈ [0.4, 1.3]`, `feedback: string`.
6. **Ergebnis:** Falls accepted → Cash += `valuation × angebotenerAnteil`, `equityGivenAwayPct += angebotenerAnteil`. Falls abgelehnt → Reputation −5 (Markt erfährt davon), 4 Quartale Cooldown.

**LLM-Integration:**
- Edge Function `vc-pitch` mit Lovable AI Gateway (`google/gemini-3-flash-preview`).
- Strukturierte Outputs (Zod-Schema): `questions[]` für Phase 1, dann `evaluation` für Phase 2.
- System-Prompt definiert VC-Persona (skeptisch, branchenkundig, 80er-Kontext).
- Anti-Prompt-Injection: User-Antworten klar markiert; LLM-Bewertungs-Regeln im System-Prompt fest.

**Konsequenzen für Sim:**
- `equityGivenAwayPct` reduziert späteren Player-Profit-Ausschüttungs-Anteil (vorerst nur als Display-Wert; bei Game-End wirkt es auf Final-Score: `finalScore *= (1 − equity)`).
- Max 3 VC-Runden möglich (Verwässerungs-Schutz).
- VCs werden über Quartale "skeptischer": wiederholte Pitches werden härter bewertet.

**Daten:** neue Tabelle `vc_rounds` (user_id, round_no, offered_pct, proposed_valuation, accepted, negotiated_valuation, cash_received, created_at). Pitch-Transkript in `vc_pitch_messages`.

## UI

Neuer Tab/Modal "Finanzierung" im Dashboard, zwei Karten:
- **Bankkredit**: aktueller Kreditstatus, neuer Antrag (Slider Betrag/Laufzeit, Live-Anzeige der Annuität).
- **VC-Pitch**: Equity-Übersicht, "Neuen Pitch starten"-Button, In-Modal-Chat für die 3 Fragen.

Beide Wege im `CompanyAccount`-Header gespiegelt: "Kredit: $X / Equity-frei: Y %".

## Schritt-Reihenfolge

1. **DB-Migration**: `loans`, `loan_payments`, `vc_rounds`, `vc_pitch_messages` (alle user-scoped, RLS).
2. **GameMechanics**: Annuitäten-Abzug in `processQuarterTurn` + Cash-Aufschlag bei Kredit-/VC-Vergabe; Persistenz von `equityGivenAwayPct` und `outstandingDebt` auf `gameState.company`.
3. **Edge Function `vc-pitch`** mit zwei Endpoints (Phase 1 Fragen, Phase 2 Evaluation).
4. **Services**: `LoanService` (apply/repay), `VcPitchService` (LLM-Calls).
5. **UI**: Finanzierungs-Modal mit Tabs, integriert in `GameDashboard`.

## Nicht im ersten Wurf

- Bond-Issuance, Re-Finanzierung bestehender Kredite.
- VC-Anteile als handelbares Asset (Sekundärmarkt).
- IPO als Game-End-Win-Bedingung (separates Feature).
- Wechsel von Equity-Anteilen auf laufende Profit-Ausschüttung (vereinfacht: Final-Score-Multiplikator).

## Technische Details

- Zinsformeln deterministisch (kein RNG); keine Math.random im Loan-Pfad.
- VC-LLM-Antworten werden roh persistiert für Audit/Replay.
- Reputation-Effekte gehen über die bestehenden Hooks (kein neuer Reputation-SOT).
- TypeScript-Types in `src/types/financing.ts`.

Warte auf Freigabe.
