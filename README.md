# Computer Industry Simulation Game

Ein umfassendes Unternehmenssimulationsspiel für die Computerindustrie der 1980er Jahre.

## 🚀 Quick Start

```bash
# Entwicklung starten
npm run dev

# Build für Produktion
npm run build

# Tests und Qualität
npm run lint
npm run typecheck
npm run profile
```

## 🛠️ Entwicklungstools

### Linting & Formatierung
```bash
npm run lint          # ESLint prüfen
npm run lint:fix      # ESLint automatisch korrigieren
npm run prettier      # Code formatieren
npm run typecheck     # TypeScript prüfen
```

### Performance & Analyse
```bash
npm run analyze       # Bundle-Analyse (öffnet stats.html)
npm run profile       # Vollständige Qualitätsprüfung
npm run quality:baseline  # Baseline-Metriken sammeln
```

### Development Metriken

In development mode sind folgende Tools aktiv:

- **Render Counter**: Automatisches Tracking von Component-Renders
- **Performance Monitor**: Speicher- und Rendering-Überwachung  
- **Bundle Analyzer**: Chunk-Größen und Dependencies visualisieren

Zugriff via Browser DevTools:
```javascript
// Metriken abrufen
__METRICS__.collector().then(m => m.getBaselineReport())

// Baseline generieren
__METRICS__.baseline()

// Bundle analysieren  
__METRICS__.analyze()
```

## 📊 Baseline Metriken

Nach Installation Baseline erstellen:
```bash
bash scripts/generate-baseline.sh
```

Dies erstellt `.metrics/` Ordner mit:
- Bundle-Größe und Chunk-Aufteilung
- Code-Qualitäts-Metriken (ESLint, TypeScript)
- Datei- und Component-Anzahl

## 🏗️ Architektur

```
src/
├── components/          # React Components
├── lib/
│   ├── dev-tools/      # Development-only utilities
│   ├── game-engine/    # Core game logic
│   ├── cache/          # Performance caching
│   └── formatters.ts   # Shared utilities
├── services/           # Business logic
├── hooks/              # Custom React hooks  
└── types/              # TypeScript definitions
```

## 🔧 Konfiguration

- **ESLint**: Gentle Regeln für schrittweise Migration
- **Prettier**: Konsistente Code-Formatierung
- **TypeScript**: Graduelle Strict-Mode Migration
- **Vite**: Bundle-Optimierung und Dev-Server

## 📈 Performance Monitoring

### Render Tracking
Automatisches Tracking für kritische Components:
- GameDashboard
- CompanyManagement  
- Weitere bei Bedarf

### Memory Monitoring
Automatische Speicher-Überwachung alle 30s in development.

### Bundle Analysis
Detaillierte Bundle-Analyse mit:
- Chunk-Größen
- Dependency-Mapping
- Gzip/Brotli-Größen

## 🎯 Qualitätsziele

- **Bundle Size**: < 500KB gzipped
- **Render Performance**: < 16ms average
- **Code Quality**: 0 ESLint errors, < 10 warnings
- **TypeScript**: Graduelle Migration zu strict mode

---

## Original Lovable Project Info

**URL**: https://lovable.dev/projects/0ee1e412-4b5a-447c-9bc4-ffbad11fef2d

### Technologies
- Vite, TypeScript, React
- shadcn-ui, Tailwind CSS  
- Supabase (Backend)

### Deployment
Open [Lovable](https://lovable.dev/projects/0ee1e412-4b5a-447c-9bc4-ffbad11fef2d) and click Share → Publish
