# Contributing to IronTrack

Thank you for considering contributing! Here's how to get started.

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

## Setup

```bash
git clone <repo-url>
cd GynProgressApp
npm install
```

## Development

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
```

## Testing

```bash
npm test             # Run Vitest in watch mode
npx vitest run       # Single run
```

## Linting & Formatting

```bash
npm run lint         # ESLint check
npm run format       # Prettier format
```

## TypeScript

```bash
npx tsc --noEmit     # Type-check without emitting
```

## Project Structure

```
src/
  components/       # React components (.tsx)
  domain/           # Business logic (workout, planning, data)
  state/            # AppContext + appReducer (useReducer pattern)
  storage/          # localStorage abstraction, crypto, notifications
  theme/            # Style tokens, fonts, global styles
  i18n/             # Internationalization (es/en)
  types.ts          # Shared TypeScript interfaces
```

## Conventions

- **TypeScript strict mode** — all files are `.ts`/`.tsx`
- **Inline styles** — using token-based theme via `S` from `theme/styles.ts`
- **State management** — Context + `useReducer` (see `state/AppContext.tsx`)
- **Routing** — React Router v6 with `<Routes>` in `GymProgressApp.tsx`
- **Validation** — Zod schemas with react-hook-form in Onboarding
- **Commits** — Use [Conventional Commits](https://www.conventionalcommits.org/) format

## Pull Requests

1. Fork and create a feature branch
2. Make sure `npx tsc --noEmit`, `npx vitest run`, and `npm run lint` all pass
3. Open a PR with a clear description of changes

## Code of Conduct

Be respectful, inclusive, and constructive.
