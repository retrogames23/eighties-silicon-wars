# Computer Tycoon

A turn-based business simulation set in the early home-computer era. Found a hardware company in 1983, design and manufacture machines, hire and grow a team, react to market events, raise capital, and try to outlast the AI competitors as the industry evolves through the 80s and 90s.

Live: https://computertycoon.app

## Game Overview

You play the founder and CEO of a young computer manufacturer. Each quarter you:

- **Design hardware** — pick CPU, RAM, storage, display, sound and case; balance specs against BOM cost and target price.
- **Run the company** — set R&D, marketing and support budgets; hire engineers, marketers and support staff; manage morale and salaries.
- **Sell into the market** — products are scored by a deterministic economy model against current era expectations and competitor pressure, then converted into unit sales and revenue.
- **React to the world** — quarterly news, paradigm shifts (8-bit → 16-bit → GUI → multimedia), hardware-component availability, and AI competitor moves.
- **Finance growth** — take annuity bank loans or pitch to LLM-driven venture capitalists.
- **Get advice** — an in-game advisor flags low utilization, missing roles, budget waste, and when the competition is pulling away.

The goal: stay solvent, grow market share, and survive long enough to become an industry icon.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite 5, Tailwind CSS, shadcn/ui
- **Routing:** React Router (HashRouter)
- **i18n:** i18next with ICU MessageFormat (German fallback, English supported)
- **State:** Local React state + `useGameState` hook, persisted via Lovable Cloud save games
- **Backend (Lovable Cloud / Supabase):**
  - Postgres with Row-Level Security for save games, competitors, loans, news
  - Edge Functions: `advisor-chat`, `vc-pitch`, `competitor-turn`, `world-director`, `press-write`, `auth-email-hook`, `process-email-queue`
  - Lovable AI Gateway for LLM features (advisor, VC pitches, generated news)
- **Audio:** Global singleton store for consistent music playback across navigation

## Key Systems

### Economy & Sales
A single source of truth in `EconomyModel` scores each active product per quarter against era expectations, competitor average, and market events. Sales use a seeded RNG (`rngSeed`) — no `Math.random` in the sales pipeline — so results are reproducible and testable via the headless sim in `scripts/sim/headlessEconomySim.ts`.

### Budgets & Staff
Effective budget throughput scales with the total skill points per role (`BudgetRules.ts`). Spending in an area with no staff is gated; spending above team capacity is capped. The advisor surfaces concrete hire recommendations (e.g. "+1 Engineer unlocks ~€120k effective R&D").

### Financing
- **Bank loans:** annuity model with interest, term, default risk on missed payments.
- **VC pitches:** LLM-driven character interactions with offer terms (equity, valuation, conditions).

### AI Competitors
Seeded per user. A `competitor-turn` edge function advances rival companies each quarter — they ship new models, adjust pricing, and apply market-share pressure.

### Internationalization
- Two locales: `de` (fallback) and `en`, organized by namespace under `public/locales/`.
- Language priority: URL parameter > LocalStorage > Browser.
- Tooling under `scripts/` for coverage, linting, glossary validation, and pseudo-locale layout testing.
- CI check via `.github/workflows/i18n-check.yml`.

## Project Structure

```
src/
├── components/        UI + game screens (Dashboard, Development, Employees, Reports, …)
├── pages/             Route entry points (Index, Auth, ResetPassword)
├── lib/
│   ├── game/          Core mechanics: BudgetRules, GameMechanics, ParadigmEvents, rng
│   ├── i18n.ts        i18next configuration
│   └── formatters.ts  Shared utilities
├── services/          StaffService, CompetitorsService, LoanService, MarketEventsService, …
├── hooks/             useGameState, useAudioManager, useMobileNavigation, …
├── contexts/          LanguageContext
├── integrations/      Auto-generated Supabase client and types
└── types/             Shared TypeScript definitions

supabase/functions/    Edge functions (advisor-chat, vc-pitch, competitor-turn, …)
public/locales/        i18n resources (de, en, glossaries)
scripts/               i18n tooling, baselines, headless economy sim
docs/                  i18n reports, style guide, commit summaries
```

## Quick Start

```bash
# Install
npm install

# Dev server
npm run dev

# Production build
npm run build

# Quality checks
npm run lint
npm run typecheck
npm run profile
```

## i18n Tooling

```bash
node scripts/i18n-coverage.js          # Translation coverage report
node scripts/i18n-lint.js              # Lint translation files
node scripts/i18n-glossary-validator.js # Glossary consistency
node scripts/i18n-pseudo.js            # Generate pseudo-locale for layout testing
```

## Backend

The project runs on **Lovable Cloud** (managed Supabase). The database schema, auth, storage, and edge functions are deployed automatically as the project changes. AI features use the Lovable AI Gateway — no separate API keys needed.

## Conventions

- **Routing:** HashRouter only (avoids deep-link 404s on static hosting).
- **React:** `useEffect` for side effects only — never for derived state.
- **TypeScript:** `any` is disallowed unless explicitly documented.
- **Mobile:** No horizontal scrolling; touch targets sized for thumb use.
- **Design system:** Semantic tokens in `index.css` and `tailwind.config.ts`; no raw color classes in components.
- **Refactoring:** Never change game logic or UI design during a refactor pass.

## Development

This project is built and maintained with [Lovable](https://lovable.dev). Changes pushed to GitHub sync back to Lovable automatically; edits in Lovable push to GitHub.

- **Lovable project:** https://lovable.dev/projects/0ee1e412-4b5a-447c-9bc4-ffbad11fef2d
- **Publish:** Open the project in Lovable → Share → Publish

## License

See [LICENSE](LICENSE).
