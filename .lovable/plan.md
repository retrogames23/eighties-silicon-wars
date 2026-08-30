# Balance-Audit "Normal" und Verbesserungsplan

## Antwort auf deine vier Fragen

**a) Über die Zeit herausfordernd, aber schaffbar?** Teilweise. Die Difficulty-Werte sind über die ganze Partie konstant (Fixkosten 1,10x, KI-Deckel 40 %, Krisen-Faktor 1,4). Eskalation entsteht nur indirekt über Inflation, Obsoleszenz und linear wachsenden KI-Druck. Die vier statischen Konkurrenten (Apple, Commodore, IBM, Atari) bringen nie neue Modelle heraus und altern ab ~8 Quartalen auf einen festen Boden — der Spätdruck bricht also weg, statt zu steigen. Ergebnis: die Mitte ist spannend, das Endspiel wird zu leicht.

**b) Verzeiht Fehler am Anfang?** Ja, hier ist die Balance gut: 1 Mio. Startkapital, Bankrottschwelle bei -1 Mio., abgesenkte Gründergehälter, milder Marken-Malus, mehrstufiger Kreditausfall statt Sofort-Aus. Ein Problem: Der Notkredit ist starr 500k, unabhängig vom tatsächlichen Loch — wer tiefer im Minus ist, wird direkt danach erneut bankrott. Zudem prüft das Game-Over nur Cash, nicht offene Schulden.

**c) Mehrere Strategien tragfähig?** Ja, das ist die stärkste Säule. Segment-Fit-Matrix, tierabhängige Durchdringungs-Caps/Konversion und segmentabhängige Bauteil-Gewichtung belohnen konsequente Ausrichtung; ein Portfolio-Komplexitäts-Malus bestraft Beliebigkeit. Was fehlt: Reputation und Markenbekanntheit sind global — man kann sich keinen Ruf "bei Gamern" aufbauen oder verlieren.

**d) KI-Gegner nachvollziehbar?** Nur halb. Es existieren zwei unverbundene Systeme: statische Weltkonkurrenten (reiner Alterungs-/Druckfaktor) und LLM-Personas mit Marktanteil, Reputation und Quartalsaktion. Die Personas haben aber keine echten Produkte oder Preise; ihre Wirkung ist ein abstrakter Druck-Multiplikator. Marktanteile beider Systeme summieren sich außerdem potenziell über 100 %.

## Was verbessert werden soll

### 1. Echte Konkurrenzprodukte statt abstraktem Druck
Aus der Aktion "new_model_announce" entsteht ein reales Konkurrenzmodell mit Preis, Specs, Segment und Release-Quartal. Konkurrenzmodelle laufen durch dieselbe Appeal-/Preis-Bewertung wie Spielermodelle und altern über Obsoleszenz. Damit ersetzt echter Produktwettbewerb den Multiplikator.

### 2. Ein einziges Wettbewerbssystem
Die statischen Startkonkurrenten werden zu Personas mit Portfolio zusammengeführt. Marktanteile werden auf 100 % normalisiert (Spieler + alle KI), Doppelzählung entfällt.

### 3. Spätspiel-Eskalation
Konkurrenten veröffentlichen regelmäßig neue Modelle (Takt abhängig von Difficulty), statt eingefroren zu altern. Zusätzlich wachsen KI-Aggressivität und Marktreife über die Jahre bis zum Difficulty-Deckel.

### 4. Segmentspezifische Reputation
Reputation und Markenbekanntheit werden je Segment (Gamer, Business, Workstation) geführt; die globale Reputation bleibt als gewichteter Mittelwert erhalten. Erfolge/Flops wirken primär auf das betroffene Segment.

### 5. Fairere Insolvenzregeln
Der Notkredit deckt das tatsächliche Loch plus Puffer (gedeckelt), damit er nie in einen sofortigen Folge-Bankrott führt. Die Bankrottprüfung berücksichtigt Cash und ausstehende Schulden (Nettoposition).

### 6. Krisen aus einer Quelle
Der geplante Krisenkalender wird aus der Difficulty-Definition gespeist und sowohl vom Live-Spiel als auch vom Headless-Runner genutzt, damit Tests dasselbe Spiel prüfen, das gespielt wird.

### 7. Transparenz für den Spieler
Das Konkurrenz-Panel zeigt Produkte, Preise, Zielsegmente und Marktanteils-Trend über die Quartale — damit KI-Verhalten nachvollziehbar wird. Alle Texte über i18n (DE/EN).

## Technische Umsetzung

- `src/lib/game/Difficulty.ts`: neue Felder für Release-Takt der KI, Eskalationskurve über Jahre, Notkredit-Deckelung, Krisenkalender.
- `src/services/CompetitorsService.ts`: Persona-Portfolio (Modelle mit Preis/Spec/Segment/Release), Release-Logik, deterministische Effekte bleiben clientseitig.
- `src/components/EconomyModel.ts`: Konkurrenzmodelle gehen in Appeal- und Preisvergleich ein; `aiCompetitorPressure` entfällt bzw. wird nur noch Rest-Faktor; Marktanteilsnormalisierung.
- `src/lib/game/GameMechanics.ts`: `INITIAL_COMPETITORS` in Persona-Portfolios überführen, Reputation je Segment, Bankrott-/Notkreditregeln.
- `src/components/AiCompetitorsPanel.tsx`: Produkt- und Trenddarstellung.
- `public/locales/{de,en}/*.json`: alle neuen Strings.
- `scripts/sim/runBalanceMatrix.ts`, `tests/balance/*`: Krisenkalender aus Difficulty ziehen, neue Gates (Endspiel-Druck, Streuung der Gewinner-Strategien, Notkredit-Quote).

## Validierung

Headless-Matrix über alle Strategien und viele Seeds auf Normal mit Zielkorridor: keine Strategie unter ~20 % und keine über ~55 % Erfolgsquote, mindestens eine Bankrottgefährdung in der Frühphase, spürbarer Margendruck ab 1989. Danach Determinismus-Tests und ein UI-Durchlauf.
