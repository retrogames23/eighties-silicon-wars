# Intro-Screen für 16:10-Desktops querformatig machen

Aktuell wirkt die Karte auf 16:10 hochkant, weil sie schmal ist und alle Inhalte zentriert untereinander stapelt. Lösung: Karte deutlich verbreitern und ab `lg` zweispaltig layouten — Text links, Terminal + Start-Button rechts.

## Änderungen in `src/components/GameIntro.tsx`

- **Karten-Breite**: `w-96 lg:w-[28rem] xl:w-[32rem] 2xl:w-[36rem]` → `w-full max-w-md lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl`
- **Padding**: ab `lg` von `p-8` auf `p-12` erhöht
- **Titel**: `text-2xl` → `lg:text-4xl xl:text-5xl` (Desktop nutzt mehr Höhe)
- **Layout**: Neue Grid-Struktur
  - Mobile/Tablet: einspaltig (unverändertes Verhalten)
  - Ab `lg`: `grid-cols-2` mit Intro-Text links und Terminal + Start-Button rechts
- **Text-Größe**: Intro-Text auf Desktop von `text-sm` → `lg:text-base`
- **Start-Button**: auf Desktop größer (`lg:py-6 lg:text-base`)
- **Sprach-Switcher und Copyright** bleiben oben/unten über die volle Breite

## Verhalten auf verschiedenen Bildschirmen

```text
Mobile / Tablet (< lg)              Desktop 16:10 (lg+)
┌──────────────────┐                ┌──────────────────────────────────┐
│   [EN/DE]        │                │                       [EN/DE]   │
│   COMPUTER TYCOON│                │       COMPUTER  TYCOON           │
│   ─────────────  │                │       ─────────────────          │
│   Intro-Text...  │                │  Intro-Text...   ┌─ Terminal ─┐  │
│   Frage...       │                │  Frage...        │ > SYSTEM... │  │
│   ┌─ Terminal ─┐ │                │                  └────────────┘  │
│   │ > SYSTEM   │ │                │                  [ Spiel start.] │
│   └────────────┘ │                │                                  │
│   [Spiel start.] │                │       © 1983 RETRO GAMES CORP.   │
│   © 1983         │                └──────────────────────────────────┘
└──────────────────┘
```

## Was unverändert bleibt

- Mobile-Layout (kein horizontales Scrollen)
- CRT-Effekte, Scanlines, Farben, Fonts, Übersetzungen
- Footer-Komponente (in vorheriger Iteration bereits angepasst)
- Spiel-Logik

## Risiko

Gering: nur Layout-CSS auf einer Komponente, keine Logikänderung.
