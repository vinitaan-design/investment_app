# InvestKea design system in code

Source of truth: Figma file `mR5F8K6PUAKbxg9w1vgNiV` and `InvestKea_Design_System.xlsx` (v0.1).

## Where things live

The design system is the `@investkea/ui` package in `packages/ui`. The web app (`apps/web`) imports it.

| Layer                         | File                                                                 |
| ----------------------------- | -------------------------------------------------------------------- |
| Primitive + semantic tokens   | `packages/ui/src/tokens/tokens.css` (names match the spreadsheet)    |
| Token metadata for JS/docs    | `packages/ui/src/tokens/tokens.ts` (`readToken()` for charts)        |
| Tailwind mapping, type styles | `packages/ui/src/styles.css`                                         |
| Components                    | `packages/ui/src/components/*`                                       |
| Stories (live docs)           | `packages/ui/src/**/*.stories.tsx`; run `npm run storybook`          |
| Token guard tests             | `packages/ui/src/tokens/tokens.test.ts`                              |
| Accessibility tests           | `packages/ui/src/stories/stories-a11y.test.tsx` (axe on every story) |

## Using it in an app

```css
/* app CSS entry */
@import "tailwindcss";
@import "@investkea/ui/styles.css";
@source "<relative path>/packages/ui/src"; /* so Tailwind generates the components' classes */
```

```tsx
import { Button, Input, GoalCard, formatINR } from "@investkea/ui";
```

The package ships TypeScript source; Next.js compiles it via `transpilePackages`. React is a peer
dependency, so the app's single copy is used.

## Components

| Group      | Components                                                      | In Figma?  |
| ---------- | --------------------------------------------------------------- | ---------- |
| Actions    | Button (Primary, Secondary, Ghost, Danger × L/M; loading, icon) | Yes        |
| Form       | Input                                                           | Yes        |
| Form       | Select, Checkbox, RadioGroup, Switch                            | Code-first |
| Feedback   | Alert (icon slot), Badge, ProgressBar                           | Yes        |
| Feedback   | BookingStatusBadge, Skeleton, EmptyState                        | Code-first |
| Overlays   | Dialog (native `<dialog>`: focus trap, Esc, focus return)       | Code-first |
| Layout/nav | Card, Tabs (arrow keys, Home/End)                               | Code-first |
| Display    | GoalCard                                                        | Yes        |
| Display    | Avatar, StatCard                                                | Code-first |

"Code-first" components follow the roadmap sheet's accessibility requirements and use only existing
tokens. Design should add them to Figma.

Still to build from the roadmap (phase 2): top app bar, bottom and side navigation, list/transaction
row, consultant card, date and time-slot pickers, toast, data table, stepper, search field,
pagination, chart styles.

## Using tokens in Tailwind

Tailwind's default colours, radii and shadows are removed. Only design tokens exist.

| Figma token                        | Tailwind class                                                                                                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bg/canvas`                        | `bg-canvas`                                                                                                                                                                                 |
| `bg/surface`                       | `bg-surface`                                                                                                                                                                                |
| `bg/brand`                         | `bg-brand`                                                                                                                                                                                  |
| `bg/*-subtle`                      | `bg-*-subtle`                                                                                                                                                                               |
| `text/primary`                     | `text-fg`                                                                                                                                                                                   |
| `text/secondary`                   | `text-fg-secondary`                                                                                                                                                                         |
| `text/brand`, `text/danger`, …     | `text-fg-brand`, `text-fg-danger`, …                                                                                                                                                        |
| `border/default`                   | `border-line`                                                                                                                                                                               |
| `border/strong`, `border/focus`, … | `border-line-strong`, `border-line-focus`, …                                                                                                                                                |
| `radius/sm…full`                   | `rounded-sm` … `rounded-full`                                                                                                                                                               |
| `Elevation/1–3`                    | `shadow-1` … `shadow-3`                                                                                                                                                                     |
| `Focus/Ring`                       | `shadow-focus`                                                                                                                                                                              |
| Text styles                        | `type-display-lg`, `type-h1`…`type-h4`, `type-numeric-hero`, `type-numeric`, `type-body-lg`, `type-body`, `type-body-strong`, `type-body-sm`, `type-label`, `type-label-sm`, `type-caption` |

Spacing uses Tailwind's default 4px grid (`p-4` = 16px), which matches `spacing/*`.

## Deviations from Figma

All come from the spreadsheet's "WCAG Audit" sheet and are enforced by the token tests. Figma should be
updated to match.

| Token                    | Figma               | Code                         | Reason                                    |
| ------------------------ | ------------------- | ---------------------------- | ----------------------------------------- |
| `text/tertiary` (light)  | sand/500            | sand/600                     | 3.91:1 on canvas; needs 4.5:1             |
| `text/accent` (light)    | peach/600           | peach/700                    | 4.27:1 on accent-subtle; needs 4.5:1      |
| `border/strong` (light)  | sand/300            | sand/500                     | 1.70:1 on surface; input borders need 3:1 |
| `border/strong` (dark)   | sand/600            | sand/500                     | 2.50:1 on surface; needs 3:1              |
| `text/secondary` (light) | sand/600            | sand/700                     | Stays darker than tertiary after its fix  |
| Focus/Ring               | teal/500 @ 30% glow | 2px gap + 3px solid teal/500 | Glow failed 3:1 focus visibility          |

## Other decisions

- **Letter spacing** is read as a percentage of font size (spreadsheet), converted to `em`.
- **Light theme only** in v1. Dark tokens exist under `[data-theme="dark"]` and pass the contrast tests,
  but nothing enables them until the dark palette is design-reviewed.
- **Fonts** are self-hosted from npm (`@fontsource-variable`), so users' browsers make no request to
  Google. Both fonts include the ₹ glyph (latin-ext subset, loaded on demand).
- **Icons**: Lucide (`lucide-react`). The roadmap proposes Material Symbols Rounded; Lucide was kept
  because it ships tree-shakeable React components. Button and Alert have icon slots, so switching later
  is a contained change.
- **Alert roles**: danger and warning use `role="alert"`; info and success use `role="status"`.
