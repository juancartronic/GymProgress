# Changelog

All notable changes to this project will be documented in this file.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- **TypeScript** — Full migration from JSX to TSX/TS with strict mode
- **React Router v6** — SPA routing with `BrowserRouter`, `Routes`, `NavLink`
- **Export/Import** — JSON export and import of all app data
- **ESLint + Prettier** — Code linting and formatting configuration
- **CI/CD** — GitHub Actions pipeline (type-check, test, build)
- **Component Tests** — NavBar, Onboarding, ProgressBar tests with Testing Library
- **State Refactor** — Context + `useReducer` replacing prop-drilling `useState`
- **Toast Notifications** — react-hot-toast for user feedback
- **i18n Infrastructure** — i18next with Spanish and English translations
- **Recharts** — BarChart replacing custom bar chart in History view
- **Framer Motion** — Page transition animations with `AnimatePresence`
- **React Hook Form + Zod** — Form validation in Onboarding with Zod 4 schema
- **Loading Skeletons** — Skeleton components displayed during initial load
- **Storage Error Handling** — Graceful handling of `QuotaExceededError` and save failures
- **PWA Push Notifications** — Local notification reminders for daily workouts
- **CSP Headers** — Content Security Policy meta tag for XSS protection
- **Encrypted Export** — Optional AES-256-GCM encryption for data export/import
- **JSDoc** — Documentation on all major exported functions and types
- **CONTRIBUTING.md** — Contributor guide with setup, conventions, and process
- **CHANGELOG.md** — This file
