# InvestKea design system in code

Source of truth: Figma file `mR5F8K6PUAKbxg9w1vgNiV` and `InvestKea_Design_System.xlsx` (v0.1).

## Where things live

| Layer                         | File                                                                       |
| ----------------------------- | -------------------------------------------------------------------------- |
| Primitive + semantic tokens   | `src/styles/tokens.css` (CSS variable names match the spreadsheet)         |
| Tailwind mapping, type styles | `src/app/globals.css`                                                      |
| Components                    | `src/components/ui/*` (Button, Input, Badge, Alert, ProgressBar, GoalCard) |
| Token guard tests             | `src/styles/design-tokens.test.ts`                                         |

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

All are accessibility fixes (WCAG 2.2 AA) and are enforced by the token tests. Figma should be updated to
match.

| Token                   | Figma     | Code      | Reason                                    |
| ----------------------- | --------- | --------- | ----------------------------------------- |
| `text/tertiary` (light) | sand/500  | sand/600  | 3.91:1 on canvas; needs 4.5:1             |
| `text/accent` (light)   | peach/600 | peach/700 | 4.27:1 on accent-subtle; needs 4.5:1      |
| `border/strong` (light) | sand/300  | sand/500  | 1.70:1 on surface; input borders need 3:1 |
| `border/strong` (dark)  | sand/600  | sand/500  | 2.50:1 on surface; needs 3:1              |

## Other decisions

- **Letter spacing** is read as a percentage of font size (spreadsheet), converted to `em`.
- **Light theme only** in v1. Dark tokens exist under `[data-theme="dark"]` and pass the contrast tests,
  but nothing enables them until the dark palette is design-reviewed.
- **Fonts** are self-hosted from npm (`@fontsource-variable`), so users' browsers make no request to
  Google. Both fonts include the ₹ glyph (latin-ext subset, loaded on demand).
- **Icons**: Lucide (`lucide-react`). Alert uses an icon plus the coloured side bar.
- **Alert roles**: danger and warning use `role="alert"`; info and success use `role="status"`.
