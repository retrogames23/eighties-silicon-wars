## Ziel

`HeadquartersTab` komplett neu als Pixel-Art-Büro im Stil von Sim Tower / Theme Hospital. Wachstum richtet sich allein nach der Anzahl der eingestellten Mitarbeitenden. Sprites bewegen sich liebevoll animiert durch die Räume; Deko, Pflanzen, Poster, Kicker und Arcade-Automaten geben dem Ganzen Charakter.

## Wachstums-Logik (mitarbeitergetrieben)

Jeder Mitarbeitende = 1 Sprite. Räume werden freigeschaltet, sobald genug Personal da ist (Richtwerte, im Code zentral und leicht justierbar):

```text
1–3   MA → 1 Etage:  Mini-Büro (2 Schreibtische), Empfang
4–8   MA → +Etage:   Open-Space Büro (4–6 Plätze) + Pflanze
9–15  MA → +Etage:   Meetingraum + Küche/Kaffeeecke
16–25 MA → +Etage:   Entwicklerraum mit Multi-Monitor + Serverrack
26–40 MA → +Etage:   Lounge mit Kicker
41–60 MA → +Etage:   Arcade-Raum (Pac-Man-/Donkey-Kong-artige Automaten)
61+   MA → +Etage:   Chef-Etage mit Aquarium + große Pflanze
```

Etagenzahl, Raum-Layout pro Etage und Sprite-Verteilung leiten sich direkt aus `employees` ab — kein Revenue/Time-Mix mehr. Modernität (Monitor-Stil, Wandfarbe, Poster-Set) richtet sich rein nach dem aktuellen Jahr.

## Visuelles Konzept

Echte Pixelgrafik, nicht Vektor:
- Festes Tile-Raster (z. B. 8 px / Tile), Canvas mit `imageSmoothingEnabled = false` und ganzzahliger Skalierung → knackige Pixel auch auf Retina.
- Procedural gezeichnete Sprites (kein externes Asset), aber konsequent im Pixel-Stil: 16×24 Mitarbeiter-Sprites mit 2-Frame-Walkcycle, klarem Outline-Pixel und begrenzter Palette pro Rolle.
- Räume aus wiederkehrenden Tiles: Boden, Wand, Fenster, Tür, Möbel-Sprites.
- Dekoration als kleine 8×8/16×16-Sprites: Topfpflanzen (3 Varianten), Kaffeemaschine, Wasserspender, Whiteboard, Aktenschrank, CRT-Monitor, Tower-PC, Telefon.
- Wand-Poster im 80er-Stil als kleine Pixel-Sprites: Synthwave-Sonnenuntergang, "I ♥ BASIC", Space-Invaders-Poster, Schachbrett-Grid, Tape-Recorder. Rotation pro Raum deterministisch über Seed (`floor*roomIdx`), damit sie nicht jeden Frame flackern.
- Hintergrund: Tag-/Nachtwechsel je nach Quartal (Q1/Q2 Tag, Q3 Sonnenuntergang, Q4 Sternenhimmel) — dezent, kein Gameplay-Effekt.
- Fassade außen mit kleinem Firmenschild (Firmenname) über dem Eingang.

## Sprites & Bewegung

- Pro Mitarbeitenden ein persistenter Sprite mit Rolle (worker/developer/manager) — Verteilung anhand vorhandener Personal-Aufteilung, falls verfügbar, sonst per Seed.
- Bewegung tile-basiert: Sprite wählt zufälliges Ziel-Tile im erlaubten Etagen-Bereich, läuft horizontal, kurze Idle-Pausen am Schreibtisch (Tipp-Animation: Kopf nickt, Hände wackeln).
- Etagenwechsel via Treppe rechts/Aufzug; Aufzug erscheint ab 3+ Etagen.
- Im Kicker-/Arcade-Raum spielen 1–2 Sprites eine Loop-Animation (Kicker-Stangen drehen, Joystick-Wackeln).
- Performance: max. ~60 sichtbare Sprites; bei mehr Mitarbeitenden werden zusätzliche als "im Außendienst" gewertet und nicht gezeichnet, Zähler zeigt Gesamtzahl.

## Komponenten-Struktur

```text
src/components/headquarters/
  HeadquartersTab.tsx          (Card-Wrapper + Stats, Mount-Punkt)
  HeadquartersCanvas.tsx       (Canvas + RAF-Loop, props: employees, year, quarter, companyName)
  pixel/
    palette.ts                 (Farbpaletten pro Ära)
    tiles.ts                   (Tile-Zeichenfunktionen: wall, floor, window, door)
    furniture.ts               (Schreibtisch, Kicker, Arcade, Pflanze, Poster …)
    sprites.ts                 (Mitarbeiter-Sprite + Walkcycle)
    layout.ts                  (employees → floors[] → rooms[] Mapping)
```

`HeadquartersTab.tsx` bleibt die einzige nach außen exportierte API; bestehende Props (`cash`, `employees`, `revenue`, `quarter`, `year`) bleiben kompatibel, damit `GameDashboard.tsx` unverändert bleibt.

## i18n

Neue Keys in `ui.json` (de/en), bestehende `headquarters.*` werden ersetzt:
- `headquarters.title`, `description`, `era`
- Stage-Namen: `garage`, `firstFloor`, `growing`, `established`, `corporation`, `empire`
- Raum-Labels (für Tooltip beim Hover über Raum, optional Phase 2): `office`, `meeting`, `dev`, `kitchen`, `lounge`, `arcade`, `executive`
- Sprite-Legende: `worker`, `developer`, `manager`

## Technische Details

- Canvas-Auflösung: logische 320×200 Pixel, hochskaliert per CSS `image-rendering: pixelated` auf Container-Breite → garantiert sauberes Pixel-Bild.
- Walkcycle: 2 Frames, Wechsel alle 180 ms gekoppelt an Bewegung (nicht an `Date.now` direkt, damit stehende Sprites still sind).
- Re-Render nur via `requestAnimationFrame`; State der Sprites in `useRef` statt `useState` (kein React-Rerender pro Frame). Gemäß Core-Memory: `useEffect` nur für Mount/Cleanup.
- Sprite-Liste wird beim Mitarbeiter-Wechsel diffed (neue hinzufügen, überzählige entfernen), Positionen bleiben für vorhandene erhalten.
- Keine horizontalen Scrollbars auf Mobile (Core-Memory): Canvas skaliert per `width: 100%`, Höhe per `aspect-ratio`.

## Memory-Update

`mem://features/headquarters-visualization` wird auf den neuen Pixel-Art-/Sim-Tower-Ansatz aktualisiert (Wachstum = Mitarbeiterzahl, Tile-Raster, Sprite-Ref-State).

## Nicht im Scope

- Klick-/Hover-Interaktion mit Räumen (kann später ergänzt werden).
- Sound-Effekte.
- Speicherung der individuellen Sprite-Positionen im Save-Game (Sprites werden beim Laden neu verteilt).
