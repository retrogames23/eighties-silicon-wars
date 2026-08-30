# Zeitgemäße Gehäuse: Epochen-Logik für die Werkbank

Das aktuelle Bild zeigt einen modernen ATX-Midi-Tower mit Flachbildschirm und RGB-Setup — das gehört nicht ins Jahr 1983. Lösung: Gehäuse bekommen eine Verfügbarkeit ab Jahr/Quartal, und die Artworks werden pro Ära stimmig neu erstellt.

## 1. Gehäuse-Katalog nach Ära

Der Katalog wird erweitert und mit `availableFrom` (Jahr) versehen. Nur Gehäuse, deren Jahr erreicht ist, erscheinen in der Auswahl; spätere Gehäuse werden entweder ausgeblendet oder gesperrt mit Hinweis "ab 19XX".

| Gehäuse | ab | Stil |
| --- | --- | --- |
| Breadbox All-in-One (Beige) | 1983 | Keyboard-Gehäuse mit separatem CRT, C64/Apple-II-Ära |
| Beige Desktop (Flachgehäuse) | 1983 | Flaches Pizzabox-Gehäuse, CRT obendrauf |
| All-in-One Compact | 1984 | Monitor im Gehäuse integriert (Mac-Stil) |
| Holz-/Retro-Variante | 1983 | Holzoptik der frühen Heimcomputer |
| Beige Mini-Tower | 1988 | Erste Türme, 286/386-Ära |
| Business Midi-Tower | 1991 | Grauer Büroturm mit CRT |
| Premium-Metall-Tower | 1994 | Hochwertiges Metallgehäuse |
| Gamer-Tower mit Fenster/LED | 1997+ | Erst hier ist die "Gamer-Optik" plausibel |

Preise/Qualität/Design werden pro Gehäuse an die Ära angepasst (frühe Gehäuse günstiger, spätere teurer), bestehende Werte der beibehaltenen Gehäuse bleiben unverändert.

## 2. Verfügbarkeitslogik

- Filterfunktion analog zur bestehenden Hardware-Verfügbarkeit: Gehäuse werden mit `currentYear`/`currentQuarter` gefiltert.
- Gesperrte Gehäuse erscheinen in der Leiste ausgegraut mit Schloss-Symbol und Text "verfügbar ab 1988" (statt komplett zu verschwinden) — das zeigt dem Spieler die Fortschritts-Perspektive.
- Beim Laden eines Modells mit inzwischen nicht mehr passendem Gehäuse bleibt die bestehende Auswahl erhalten (keine Datenverluste bei Revisionen).

## 3. Artwork

Für jedes Gehäuse werden zwei zueinander passende 16-Bit-Pixel-Artworks erzeugt (geschlossen / offen), im gleichen Stil, gleicher Perspektive und Lichtsetzung wie bisher, aber jeweils historisch korrekt:
- 1983–1987: beige/cremefarbene Kunststoffgehäuse, dicker CRT mit Wölbung, Diskettenlaufwerke, keine Maus bei den frühesten Modellen.
- 1988–1993: graue Türme, VGA-CRT, 3,5"-Laufwerk.
- 1994+: dunklere/metallische Gehäuse, größerer CRT.
- 1997+: erst hier Fenster, Neon, RGB-Anmutung.

Die Innenansichten zeigen zeitgemäße Platinen (früh: große DIP-Chips und ISA-Slots; später: mehr Slots, größere Karten).

## 4. Technisches

- Gehäusedaten aus `ComputerDevelopment.tsx` in ein eigenes Datenmodul auslagern (`src/data/computerCases.ts`) mit Feld `availableFromYear`/`availableFromQuarter`; `CaseSelection.tsx` und die Werkbank nutzen dieselbe Quelle.
- `caseLayouts.ts` wird um die neuen Gehäuse-IDs samt Slot-Positionen und Screen-Rect erweitert.
- Die Teile-Leiste unter dem Bild bekommt einen Sperr-Zustand (ausgegraut, Schloss, Tooltip).
- Vollständige DE/EN-i18n für alle neuen Gehäusenamen, Beschreibungen, Alt-Texte und den Sperrhinweis.
- Keine Änderung an Spiel-/Wirtschaftslogik: Kosten, Qualität, Design fließen wie bisher in die bestehenden Berechnungen ein; nur der Auswahlumfang ist zeitabhängig.
