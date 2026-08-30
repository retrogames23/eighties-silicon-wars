# Werkbank statt Menü: Computerbau neu gedacht

Der Entwicklungs-Flow ist heute ein 5-Schritt-Assistent aus Listen und Buttons (Komponenten → Gehäuse → Name → Preis → Testbericht). Ziel: eine einzige visuelle "Werkbank", auf der der Rechner live zusammenwächst, mit sofort lesbaren Mini-Infografiken zu Kosten und Leistung.

## Das Kernbild

Ein dreigeteilter Screen (auf Mobile untereinander gestapelt):

```text
+------------------+---------------------------+----------------+
|  TEILE-REGAL     |     LIVE-RECHNER          |  KENNZAHLEN    |
|  (Icon-Kacheln)  |   (wächst mit jedem Teil) |  (Balken/Ring) |
|                  |                           |                |
|  [CPU] [GPU]     |    ___________            |  Leistung ▓▓▓░ |
|  [RAM] [Sound]   |   |  Monitor  |           |  Kosten  $412  |
|  [HDD] [Display] |   |___________|           |  Preis   $740  |
|                  |   [=== Case ===]          |  Marge   +80%  |
|                  |    ○ Floppy  ▪ LED        |  Zielgruppe:   |
|                  |                           |  Gamer 82%     |
+------------------+---------------------------+----------------+
```

- **Teile-Regal**: Kategorien als horizontale Reiter-Streifen (CPU, GPU, RAM, Sound, Speicher, Display, Gehäuse). Jede Komponente ist eine Kachel mit kleinem Pixel-Icon, Name, Kosten-Chip und einem 5-Segment-Leistungsbalken. Nicht verfügbare Teile bleiben sichtbar, aber ausgegraut mit Jahr-Badge ("ab 1986 Q2") — man sieht, worauf man hinarbeitet.
- **Live-Rechner**: eine gezeichnete 80er-Ansicht des Geräts, die sich bei jeder Auswahl sofort ändert: Gehäuseform/Farbe aus der Case-Wahl, Monitor erscheint erst mit Display-Komponente, Floppy-/Kassetten-/HDD-Schacht erscheint mit Speicher, Lautsprechergrill bei besserem Soundchip, LEDs/Lüftergitter bei High-End-CPU. Leere Slots werden als gestrichelte Umrisse angedeutet — der Spieler sieht sofort, was noch fehlt.
- **Kennzahlen-Panel**: keine Zahlenwüste, sondern vier Mini-Grafiken: Leistungsring (0–100), gestapelter Kostenbalken (jede Komponente ein Segment in ihrer Kategoriefarbe), Preis/Marge-Slider mit farbiger Zone (rot = unter Kosten, grün = gesunde Marge) und ein Zielgruppen-Match als zwei kleine Balken "Gamer / Business".

## Sofort-Feedback statt Klick-Bestätigung

- Beim **Hover/Antippen** einer Kachel zeigt das Kennzahlen-Panel eine Vorschau: Delta-Pfeile (Leistung +12, Kosten +$85) und der Live-Rechner blendet das Teil halbtransparent ein.
- Nach dem Setzen: kurzer "Klick"-Effekt am Slot, das Teil rastet ins Bild, Balken animieren auf den neuen Wert.
- Ein Teil wird durch Klick auf den Slot im Live-Rechner wieder entfernt — kein Zurücknavigieren.
- **Schnellbau-Presets**: drei Chips über dem Regal ("Budget", "Ausgewogen", "High-End") füllen alle Pflichtslots mit dem, was der Spieler sich leisten kann. Danach kann er einzeln nachjustieren. Das ersetzt den Assistenten für Spieler, die schnell iterieren wollen.

## Was aus dem alten Flow bleibt

- Name und Preis wandern in eine schmale Leiste unter den Live-Rechner (Name-Eingabe + Preis-Slider mit der bestehenden Empfehlungslogik inkl. dynamischem Margen-Label).
- Der Testbericht bleibt als Abschluss-Screen unverändert — er ist die Belohnung nach dem Bauen.
- Ein einziger Primär-Button "In Entwicklung geben" unten, aktiv sobald CPU + GPU + RAM + Gehäuse gesetzt sind; fehlende Pflichtteile werden als pulsierende leere Slots markiert statt als Fehlermeldung.

## Technische Umsetzung

- Neue Komponenten unter `src/components/development/`: `Workbench.tsx` (Layout + State), `PartsShelf.tsx`, `PartTile.tsx`, `MachinePreview.tsx`, `StatsPanel.tsx`, `QuickBuildPresets.tsx`.
- `ComputerDevelopment.tsx` behält Datenbeschaffung (`HardwareManager`, `HardwareAvailabilityService`, `PriceRecommendationManager`, `TestScoringMatrix`, Revisions-Logik) und rendert statt des Step-Wizards die Werkbank. Der Testbericht-Step bleibt erhalten.
- **Keine Änderung an Spiellogik**: Leistungs-, Kosten- und Preisformeln werden unverändert weiterverwendet; die Werkbank ruft dieselben Funktionen nur häufiger (live) auf.
- `MachinePreview` als SVG mit Layer-Komponenten (Case-Shape, Monitor, Laufwerksschacht, Tastatur, Details), gesteuert über die aktuelle Auswahl. Farben ausschließlich über semantische Tokens aus `index.css`; für die Kategoriefarben (CPU/GPU/RAM/…) neue Tokens ergänzen.
- Mobile: Regal wird zu einem horizontal scrollbaren Kategorie-Strip mit vertikaler Kachelliste, Live-Rechner klebt als kompakte Sticky-Karte oben. Kein horizontales Scrollen der Seite, Touch-Targets ≥ 44 px.
- i18n: alle neuen Texte in `ui.json` / `hardware.json` (DE + EN), keine hartkodierten Strings. Kategorie- und Preset-Namen als neue Keys.

## Reihenfolge

1. Werkbank-Layout + Regal + Kennzahlen-Panel (funktional, Preview noch Platzhalter).
2. `MachinePreview` in SVG mit allen Slot-Layern.
3. Hover-Deltas, Entfernen per Slot-Klick, Presets.
4. Name/Preis-Leiste integrieren, alten Wizard entfernen, i18n-Lauf, Mobile-Check.
