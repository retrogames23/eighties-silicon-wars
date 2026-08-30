# Eine Maschine, eine Optik: Werkbank-Vorschau vereinheitlichen

## Das Problem

Die Werkbank zeigt aktuell zwei verschiedene Rechner untereinander:

1. Oben das hochauflösende Pixel-Artwork des gewählten Gehäuses (All-in-One mit Bildschirm, Tastatur, Maus, Holztisch).
2. Darunter die selbst gezeichnete SVG-Innenansicht (grobes 160x120-Raster, separater Monitor, Desktop-Gehäuse, andere Palette und Perspektive).

Beide behaupten, „deine Maschine" zu sein, sehen aber unterschiedlich aus. Zusätzlich erscheint der Untertitel als roher Schlüssel `DEVELOPMENT.WORKBENCH.INSIDETITLE` statt als übersetzter Text.

## Ziel

Eine einzige Bühne, die durchgängig wie das obere Artwork aussieht: hochauflösende 16-Bit-Pixelgrafik, gleiche Perspektive, gleiche Lichtstimmung. Die Bauteile bleiben interaktiv (anklickbar zum Entfernen, Fly-in beim Einbauen).

## Lösung

**Eine Bühne mit zwei Zuständen statt zwei Bildern.**

- Das gewählte Gehäuse-Artwork ist die Bühne. Kein zweiter Rechner mehr darunter.
- Ein kleiner Umschalter (Außenansicht / Innenansicht) über der Bühne wechselt zwischen geschlossenem Gehäuse und geöffnetem Gehäuse. Beide Zustände sind Artwork im gleichen Stil, in identischem Bildausschnitt, sodass der Wechsel wie ein Aufklappen wirkt und nicht wie ein Bildwechsel.
- Für jedes der sechs Gehäuse wird zusätzlich ein Innenansicht-Artwork erzeugt: dieselbe Maschine, dieselbe Perspektive und Beleuchtung, Seitenwand entfernt, leeres Mainboard mit freien Sockeln sichtbar.
- Die Bauteile (CPU, RAM, GPU, Sound, Speicher) werden als eigene, ebenfalls hochauflösende Pixel-Sprites auf definierte Positionen des Innenansicht-Artworks gelegt. Sie fliegen weiterhin ein, rasten ein und lassen sich anklicken.
- Der Monitor ist Teil des Gehäuse-Artworks. Wenn ein Bildschirm-Bauteil gewählt ist, leuchtet der Screen (Bootscreen mit Modellnamen) als Overlay; ohne Bildschirm bleibt er dunkel. Damit verschwindet der Widerspruch „mal mit, mal ohne Monitor".
- Bei noch nicht gewähltem Gehäuse: stilgleiche leere Werkbank-Platte mit Hinweistext statt der bisherigen groben SVG.

## Technische Umsetzung

- `src/components/development/MachinePreview.tsx` wird auf die neue Bühne umgebaut: Artwork als Hintergrundebene, darüber ein prozentual positioniertes Overlay-Layer für Bauteile, Bootscreen und Klickflächen. Die alte 160x120-SVG-Gesamtszene (Monitor, Gehäuse, Tastatur, Maus, Schatten) entfällt.
- `src/components/development/machine/CaseArtwork.tsx` verwaltet pro Gehäuse-ID beide Artworks (`closed`, `open`) und den aktiven Zustand.
- Neue Assets unter `src/assets/workbench/`: `inside-<case-id>.png` für alle sechs Gehäuse, erzeugt mit dem Premium-Bildmodell und einem gemeinsamen Stil-Prompt (identische Kameraperspektive, Lichtquelle, Palette, transparent/dunkler Hintergrund).
- Neue Sprite-Assets bzw. beibehaltene, aber hochskalierte Pixel-Sprites für die fünf einbaubaren Komponenten; Positionen pro Gehäuse als normalisierte Koordinaten-Tabelle (`slotLayouts.ts`), damit dasselbe Overlay auf jedes Innen-Artwork passt.
- `useFlyIn` und die Klick-zum-Entfernen-Logik bleiben unverändert und werden auf das Overlay angewendet.
- `prefers-reduced-motion` wird weiter respektiert; Bühne skaliert responsiv, kein horizontales Scrollen auf Mobil.

## i18n

- Fehlanzeige `DEVELOPMENT.WORKBENCH.INSIDETITLE` beheben (Schlüssel existiert in `de/ui.json` und `en/ui.json`, wird zur Laufzeit nicht aufgelöst — Namespace-/Ladepfad prüfen).
- Neue Schlüssel in DE und EN: Umschalter „Außenansicht"/„Innenansicht", Alt-Texte für Innen-Artwork, Hinweistext für leere Werkbank.

## Nicht Teil dieser Änderung

Spiellogik, Kosten-/Leistungsberechnung, Preisempfehlung, Auswahl-Regeln und Panels bleiben unangetastet — reine Präsentationsschicht.
