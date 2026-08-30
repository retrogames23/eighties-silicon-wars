# Pixel-Werkbank: Der Rechner als 16-Bit-Szene

Die Vorschau ist heute ein glattes SVG mit gestrichelten Platzhalter-Rechtecken. Ziel: eine liebevoll gepixelte 16-Bit-Ära-Darstellung, in der die Gehäuse wirklich als Geräte erkennbar sind und Bauteile beim Auswählen ins Bild fliegen und auf dem Mainboard einrasten.

## Das Bild

```text
+-----------------------------------------------+
|            [ Monitor mit Scanlines ]          |
|          Bootscreen-Text / Farbbalken         |
|-----------------------------------------------|
|   Gehäuse in Draufsicht = offenes Mainboard   |
|   +---------------------------------------+   |
|   | [CPU]  [RAM][RAM]   [ Laufwerk ]      |   |
|   | [GPU-Karte ]  [Soundkarte]   Grill    |   |
|   +---------------------------------------+   |
|            [ Tastatur, gepixelt ]             |
+-----------------------------------------------+
```

- **Gehäuse zuerst**: Jede der sechs Gehäusevarianten (Beige Tower, Black Desktop, RGB Gaming, Holz-Retro, Premium Metall, Compact Mini) bekommt eine eigene Pixel-Silhouette mit erkennbaren Merkmalen — Lüftungsschlitze, Typenschild, Frontblende, Holzmaserung, gebürstetes Metall, RGB-Streifen. Kein generisches graues Rechteck mehr.
- **Mainboard-Ebene**: Ist ein Gehäuse gewählt, klappt die Front auf und zeigt eine gepixelte Platine (dunkelgrün/dunkelblau je nach Gehäuse-Tier) mit Leiterbahnen, Sockeln und beschrifteten Slots. Leere Sockel sind als Pixel-Sockel gezeichnet (nicht als gestrichelte Kästen) und pulsieren leicht, wenn sie Pflicht sind.
- **Bauteile als Pixel-Sprites**: CPU-Chip mit Pins, RAM-Riegel, GPU-Karte mit Slotblende, Soundkarte, Floppy/Kassette/HDD/CD je nach Speichertyp, Monitor je nach Display-Typ (RF, Mono, RGB, EGA, VGA, Multisync). Jedes Sprite variiert leicht mit der Leistungsstufe (mehr Chips, größerer Kühlkörper, mehr Bänke).
- **Kein Anti-Aliasing-Look**: alles auf einem groben Pixelraster (z. B. 4-px-Einheiten in einem 160×128-Koordinatensystem, hochskaliert), `shape-rendering: crispEdges`, begrenzte Palette aus den bestehenden Tokens plus Shading-Abstufungen.

## Die Animation

- Auswahl einer Komponente → Sprite fliegt von der Regal-Seite ins Bild, mit leichtem Überschwingen, landet im Sockel, kurzer „Snap"-Blitz und ein 1-px-Staubring.
- Einrasten in Stufen (kein weiches Gleiten): Bewegung in Pixelschritten, damit es nach Sprite-Animation und nicht nach CSS-Transform aussieht.
- Entfernen: Sprite hebt ab und fliegt zurück zum Regal.
- Monitor: Beim Setzen einer Display-Komponente flackert der Bildschirm an, Scanlines laufen einmal durch, dann steht ein Bootscreen mit dem Modellnamen des Spielers.
- Ist der Rechner vollständig (CPU, GPU, RAM, Gehäuse), schließt sich die Frontblende in zwei Frames, Power-LED geht an, Laufwerk blinkt kurz.
- Hover über eine Regal-Kachel: Sprite erscheint halbtransparent an seinem Zielsockel (bestehendes Ghost-Verhalten, jetzt sichtbar als Sprite).
- Respektiert `prefers-reduced-motion`: dann kein Fliegen, Teile erscheinen direkt.

## Technische Umsetzung

- `MachinePreview.tsx` wird ersetzt durch einen Ordner `src/components/development/machine/`:
  - `PixelStage.tsx` — SVG-Bühne mit festem Pixelraster, `shape-rendering: crispEdges`, Layer-Reihenfolge.
  - `sprites/` — je eine reine Funktion pro Sprite (`CaseSprite`, `BoardSprite`, `CpuSprite`, `RamSprite`, `GpuSprite`, `SoundSprite`, `StorageSprite`, `MonitorSprite`, `KeyboardSprite`), die aus Pixelmatrizen (String-Arrays wie `"..XX..#"`) plus Palette gerendert werden. Pixelmatrizen liegen als Datenkonstanten daneben — dadurch bleibt das Zeichnen editierbar, ohne SVG-Pfade zu pflegen.
  - `pixelPalette.ts` — Ableitung heller/dunkler Shades aus den vorhandenen Tokens (`--part-*`, `--case-*`), keine hartkodierten Farben; neue Tokens für Platine, Lötpunkte, Bildschirm-Phosphor ergänzen wir in `index.css`.
  - `useFlyIn.ts` — kleiner Hook, der pro Slot einen Animationszustand (`idle | flying | landed`) mit gestuften Pixelpositionen führt (requestAnimationFrame, feste Frameschritte).
- **Keine Änderung an Spiellogik**: Auswahl, Kosten, Leistung, Preisempfehlung, Testbericht bleiben unverändert. Nur die Präsentation und der Slot-Klick zum Entfernen (bereits vorhanden) hängen dran.
- Sprite-Auswahl erfolgt über Komponenten-ID mit Fallback nach Typ + Leistungsstufe, damit neue Hardware nie ein leeres Bild erzeugt.
- Mobile: gleiche Bühne, `viewBox`-basiert skaliert; Sticky-Karte oben bleibt, kein horizontales Scrollen, Touch-Targets der Sockel ≥ 44 px.
- i18n: alle neuen sichtbaren Texte (Bootscreen-Zeilen, Sockel-Labels, Alt-Text) als Keys in `ui.json` DE + EN.

## Reihenfolge

1. Pixelraster-Bühne + Palette + Gehäuse-Sprites (6 Varianten) — statisch, ohne Animation.
2. Mainboard mit Sockeln und Bauteil-Sprites, gesteuert durch die aktuelle Auswahl.
3. Fly-in-/Snap-Animation inkl. Entfernen und Ghost-Vorschau.
4. Monitor-Boot-Sequenz, Frontblenden-Schluss, Power-LED, `prefers-reduced-motion`.
5. i18n-Lauf, Mobile-Check, visuelle Kontrolle im Browser.
