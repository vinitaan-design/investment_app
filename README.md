# InvestKea

Calm, clear money planning: inflation-adjusted goal planning, cash-flow tracking, and booking time with a
verified consultant. Product spec: [`docs/PRD.md`](docs/PRD.md).

## Repository layout

| Path          | What                                                                         |
| ------------- | ---------------------------------------------------------------------------- |
| `apps/web`    | Next.js web app (deploy this folder: set it as the root directory on Vercel) |
| `packages/ui` | `@investkea/ui` design system: tokens, components, Storybook                 |
| `supabase`    | Database schema and row-level security                                       |
| `docs`        | PRD and design system notes                                                  |

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase · Storybook · Vitest · axe-core · GitHub Actions

## Run locally

```bash
npm install
cp apps/web/.env.example apps/web/.env.local   # fill in Supabase URL and anon key
npm run dev          # web app on http://localhost:3000
npm run storybook    # design system docs on http://localhost:6006
```

## Checks (same as CI)

```bash
npm run format:check
npm run lint
npm run typecheck
npm test              # unit, component, token-contrast and axe tests
npm run build && npm run check:css
npm run build-storybook
```

## Database

Schema and row-level security live in `supabase/migrations/`. Apply `0001_init.sql` in the Supabase SQL
editor (or with the Supabase CLI) on a new project.

## Workflow

Trunk-based: short-lived feature branches, pull request into `main`, CI must pass before merge.
