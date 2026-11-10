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
npm run build && npm run check:build   # design system CSS present; signed-in routes not static
npm run build-storybook
```

## Database

Supabase project **investkea** (region: Mumbai, `ap-south-1`). Migrations in `supabase/migrations/` are
applied in order; `0001` and `0002` are live.

- **Access model:** signed-out visitors get no table access. Users own their data. A verified advisor can
  read a client's goals, cash flow and holdings only while that client's data-sharing consent is active.
  Roles and advisor verification can't be changed from the app.
- **Tests:** `supabase/tests/rls_smoke.sql` (access rules) and `supabase/tests/app_access.sql` (paths the
  screens use) roll everything back. Run them in the SQL editor; success is the "PASSED (rolled back)" message.
- **Verifying an advisor** (admin, in the SQL editor):
  `update public.advisors set status = 'verified', verified_at = now() where id = '<advisor id>';`

## Workflow

Trunk-based: short-lived feature branches, pull request into `main`, CI must pass before merge.

## Sign-in and roles

- Sign-in: Google or an emailed one-time link (`/login`). New accounts confirm they are 18+ and accept the
  privacy notice (`/onboarding`) before using the app.
- Users: `/app` (overview, consultants, bookings, data sharing). Consultants apply at
  `/app/become-a-consultant` and use `/advisor` once verified.
- Guardrails: identity is always verified with `getClaims()` on the server; roles come from the database;
  after-login redirects only accept in-app paths; signed-in pages are never cached (lint rule + build check).
