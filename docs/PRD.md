# InvestKea v1 — Lean PRD

Status: draft · Owner: product · Last updated: 2026-11-10

## 1. Problem

People planning for goals (a home, children's education, retirement) rarely account for inflation, and
find it hard to get unbiased help without being sold a product. v1 gives them free planning tools and a
way to book a registered professional, without recommending or selling any financial product.

## 2. Success metrics (KPIs)

| Metric                                     | Source        |
| ------------------------------------------ | ------------- |
| Unique sessions per week                   | Analytics     |
| New accounts per week                      | `profiles`    |
| Goals created per active user              | `goals`       |
| Consultant bookings requested / confirmed  | `bookings`    |
| Users who grant data sharing to an advisor | `data_shares` |

Targets are not set yet. They need a baseline from the first weeks of usage.

## 3. Personas

- **Planner (end user):** an adult who wants to understand what their goals will cost and whether they are
  on track. _Open decision: v1 audience — general, affluent 25–45, or women-focused (see project docs)._
- **Advisor:** a credentialed consultant (registration number required) who receives booking requests and,
  with the client's consent, reviews that client's goals, cash flow and holdings.
- **Admin:** InvestKea staff who verify advisor registrations before advisors appear publicly.

## 4. Functional scope (MoSCoW)

### Must have

| ID  | Feature                                                                    | Role    |
| --- | -------------------------------------------------------------------------- | ------- |
| M1  | Sign up / log in with Google or email (magic link)                         | All     |
| M2  | 18+ confirmation and privacy consent at signup; delete account and data    | User    |
| M3  | Inflation-adjusted goal planner; save goals                                | User    |
| M4  | Income / expense tracker (manual entry)                                    | User    |
| M5  | Holdings tracker (user-entered values by asset class, no product names)    | User    |
| M6  | Advisor directory showing credential type and registration number          | User    |
| M7  | Request a booking with an advisor                                          | User    |
| M8  | Grant / revoke an advisor's read access to my data                         | User    |
| M9  | Advisor signup and profile; status stays `pending` until admin verifies    | Advisor |
| M10 | Advisor dashboard: requests inbox (accept / decline / complete)            | Advisor |
| M11 | Advisor client list: users with confirmed bookings                         | Advisor |
| M12 | Advisor client view: goals, cash flow, holdings — only with active consent | Advisor |
| M13 | Admin: verify / reject / suspend advisors                                  | Admin   |

### Should have

- Financial health questionnaire with a score (S1)
- CSV import for expenses (S2)
- Advisor availability slots and calendar invite on confirmation (S3)
- Email notifications for booking status (S4)

### Could have

- Expense insights (category trends) (C1)
- Advisor private notes per client (C2)

### Won't have (v1)

- Bank account linking (needs a regulated Account Aggregator FIU partner)
- Naming, recommending or selling any financial product; live market prices
- In-app payments to advisors (payment happens off-platform)
- Mobile apps (responsive web only)

## 5. Key user stories and acceptance criteria

**US-1 Goal planner** — As a planner, I want to see a goal's future cost so that I save the right amount.

- Given I enter ₹10,00,000, 10 years, 6% inflation, 0% growth, no savings
  When the results update
  Then the future cost shows ≈ ₹17,90,848 and monthly saving shows future cost ÷ 120.
- Given years = 0, When the results update, Then the years field shows "Enter a number of years above 0, up to 60." and no result.

**US-2 Consent** — As a planner, I want to control which advisor sees my data so that my information stays
private.

- Given I have not granted access, When advisor A opens my client page, Then no goals, entries or holdings
  are returned.
- Given I grant access to advisor A, When A opens my client page, Then A sees my data read-only.
- Given I revoke access, When A reloads, Then A no longer sees my data.

**US-3 Advisor verification** — As an admin, I want to verify registrations so that only credentialed
advisors are listed.

- Given an advisor signs up, When a planner browses the directory, Then that advisor is not listed.
- Given an admin marks the advisor `verified`, When a planner browses, Then the advisor is listed with
  credential type and registration number.

**US-4 Requests inbox** — As an advisor, I want to see booking requests so that I can respond.

- Given a planner requests a booking with me, When I open Requests, Then I see it with status
  `requested` and can confirm or decline it.

## 6. Compliance guardrails (product rules, not legal advice)

- No product names, product recommendations, or return/performance claims anywhere in the app or AI output.
- Personalized securities advice for a fee requires SEBI investment-adviser registration. Advisors list
  their credential and registration number; InvestKea verifies before listing.
- "CFA" is a professional qualification, not an Indian advisory licence. Confirm each advisor's actual
  registration.
- DPDP: consent notice at signup, data export and deletion, grievance contact, breach-response plan,
  18+ only.

## 7. Technical decisions

- Next.js (App Router) + TypeScript, Tailwind, hosted on Vercel (or equivalent).
- Supabase: Postgres, Auth (Google + email), row-level security enforcing the consent rule in the database.
- Schema: `supabase/migrations/0001_init.sql`.
- Design tokens: to be synced from the InvestKea Figma design system.
