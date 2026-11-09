# InvestKea

Calm, clear money planning: inflation-adjusted goal planning, cash-flow tracking, and booking time with a
verified consultant. Product spec: [`docs/PRD.md`](docs/PRD.md).

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth) · Vitest · GitHub Actions

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL and anon key
npm run dev                  # http://localhost:3000
```

## Checks (same as CI)

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

## Database

Schema and row-level security live in `supabase/migrations/`. Apply `0001_init.sql` in the Supabase SQL
editor (or with the Supabase CLI) on a new project.

## Workflow

Trunk-based: short-lived feature branches, pull request into `main`, CI must pass before merge.
