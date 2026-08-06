# 06 · Design System Integration

> **Spec suite:** Community Governance Portal (SSD Technical Communities · FY27 · v1.0)
> **Status:** Draft · **Related:** [Spec index](../README.md) · [Architecture](01-architecture.md) · [NFRs & Quality](07-nfr-and-quality.md)
> **Asset:** [`design-system/`](../../design-system/) — living style guide + CSS/SCSS/TS tokens

The portal's visual language is the **FY27 SSD design system**, delivered in [`design-system/`](../../design-system/): a living style guide ([`index.html`](../../design-system/index.html)) plus tokens in [`tokens.css`](../../design-system/tokens.css), [`tokens.scss`](../../design-system/tokens.scss) and a typed Fluent theme in [`theme.ts`](../../design-system/theme.ts).

## Reconciling brand with "inherit the SharePoint theme"

The technical spec says use **Fluent UI unmodified** and inherit the site theme; the brand asks for a distinct FY27 identity. Both are satisfied by **theming, not forking**:

| Do | Don't |
|---|---|
| Apply FY27 tokens as a **Fluent theme** (`ssdFluentPalette` + `ssdFonts`) | Build a bespoke component library |
| Brand the portal's **own surfaces** (directory cards, KPI tiles, section dividers, dashboards, timelines) with tokens | Restyle Fluent controls' internals |
| Keep **Fluent controls unmodified** for contrast, focus and keyboard behaviour | Override Fluent focus/contrast |
| Host the **Segoe Sans Display** webfont | Fall back silently to a forbidden face |

## Token application

- **SCSS surfaces** — import [`tokens.scss`](../../design-system/tokens.scss) in `*.module.scss`; use `$color-navy`, `$space-4`, `$radius-lg`, `$shadow-1`, etc.
- **React theme** — build the Fluent theme once from [`theme.ts`](../../design-system/theme.ts):

  ```ts
  import { createTheme } from '@fluentui/react';
  import { ssdFluentPalette, ssdFonts } from '../../design-system/theme';

  export const ssdTheme = createTheme({
    palette: ssdFluentPalette,
    defaultFontStyle: { fontFamily: ssdFonts.body },
  });
  ```

- **Runtime CSS variables** — [`tokens.css`](../../design-system/tokens.css) on `:root` for any non-Fluent markup.

## Brand rules that bind the portal

- **Color:** Navy `#091F2E`, Blue `#0078D4`, Slate `#2A446F`; accents Teal/Green/Purple/Maroon; **surfaces light gray `#F4F4F4`/`#EDEDED` or white** — never cream/beige or Office defaults.
- **Type:** Segoe Sans Display (Semibold headings / Regular body) — never Aptos, Segoe UI, Calibri or Arial.
- **Visuals over tables:** dense content becomes KPI tiles, cards, timelines, process flows or charts; tables only for genuine data grids.
- **Accessibility:** WCAG 2.1 AA — brand tones are deep enough to pass on light surfaces (see [NFRs & Quality](07-nfr-and-quality.md)).

> **Note:** the FY27 palette has no caution hue; a flagged deep amber `#8A5A00` is used as a **warning accent only** (icon/border/text), never as a surface fill.
