/* ============================================================
 * SSD COMMUNITIES — PORTAL DESIGN TOKENS + THEME (FY27)
 * Typed, dependency-free design tokens for React/SPFx web parts,
 * plus a Fluent UI v8-compatible palette.
 * Canonical values mirrored in tokens.css and tokens.scss.
 * ============================================================ */

/** Font stacks. Host "Segoe Sans Display" via @font-face (WOFF2) on the
 *  portal; never Aptos, Segoe UI, Calibri or Arial. `system-ui` is a
 *  last-resort fallback only. */
export const ssdFonts = {
  heading: '"Segoe Sans Display", "Segoe Sans", system-ui, sans-serif',
  body: '"Segoe Sans Display", "Segoe Sans", system-ui, sans-serif',
  weightRegular: 400,
  weightSemibold: 600,
} as const;

/** Complete design-token set. Use `ssdTokens.color.blue`, `ssdTokens.space[4]`, etc. */
export const ssdTokens = {
  color: {
    // Brand core
    navy: '#091F2E',
    blue: '#0078D4',
    slate: '#2A446F',
    // Accents (categorical / data-viz)
    teal: '#225B62',
    green: '#07641D',
    purple: '#463668',
    maroon: '#73262F',
    // Interactive blue ramp
    blueHover: '#106EBE',
    bluePressed: '#005A9E',
    blueTint: '#EAF3FB',
  },
  surface: {
    canvas: '#F4F4F4',
    subtle: '#EDEDED',
    card: '#FFFFFF',
    inverse: '#091F2E',
  },
  neutral: {
    900: '#091F2E',
    800: '#1B2C39',
    700: '#33434F',
    600: '#4C5A67',
    500: '#6B7883',
    400: '#97A1AA',
    300: '#C3CACF',
    200: '#DCE0E4',
    100: '#EDEDED',
    50: '#F4F4F4',
  },
  text: {
    primary: '#091F2E',
    secondary: '#4C5A67',
    tertiary: '#6B7883',
    disabled: '#97A1AA',
    onDark: '#FFFFFF',
    onAccent: '#FFFFFF',
  },
  border: {
    subtle: '#E7EAED',
    default: '#DCE0E4',
    strong: '#C3CACF',
  },
  semantic: {
    info: '#0078D4',
    infoSurface: '#EAF3FB',
    success: '#07641D',
    successSurface: '#E6F2E9',
    danger: '#73262F',
    dangerSurface: '#F6EAEB',
    // Deep amber — accent only (icon/border/text), never a surface fill.
    warning: '#8A5A00',
  },
  /** Categorical chart sequence — use in order. */
  dataViz: ['#0078D4', '#225B62', '#07641D', '#463668', '#2A446F', '#73262F'],
  fontSize: {
    display: '2.5rem',
    h1: '2rem',
    h2: '1.5rem',
    h3: '1.25rem',
    h4: '1rem',
    bodyLg: '1.125rem',
    body: '1rem',
    bodySm: '0.875rem',
    caption: '0.75rem',
  },
  lineHeight: { tight: 1.15, snug: 1.3, normal: 1.5 },
  letterSpacing: { tight: '-0.01em', overline: '0.08em' },
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 7: 48, 8: 64, 9: 96 },
  radius: { sm: 4, md: 8, lg: 12, xl: 16, pill: 999 },
  shadow: {
    1: '0 1px 2px rgba(9,31,46,.06), 0 1px 3px rgba(9,31,46,.08)',
    2: '0 2px 6px rgba(9,31,46,.08), 0 4px 12px rgba(9,31,46,.10)',
    3: '0 8px 24px rgba(9,31,46,.12), 0 2px 6px rgba(9,31,46,.08)',
    focusRing: '0 0 0 2px #FFFFFF, 0 0 0 4px #0078D4',
  },
  motion: {
    durationFast: '100ms',
    durationNormal: '200ms',
    durationSlow: '300ms',
    easeStandard: 'cubic-bezier(.33, 0, .2, 1)',
    easeEntrance: 'cubic-bezier(.16, 1, .3, 1)',
  },
  layout: { maxWidth: 1280, headerHeight: 60 },
} as const;

export type SsdTokens = typeof ssdTokens;

/**
 * Fluent UI v8 palette (structurally compatible with `Partial<IPalette>`).
 * The theme* ramp is the standard Fluent ramp for primary #0078D4; neutrals
 * are mapped to the navy-tinted grays above so the whole app stays on-brand.
 *
 * Usage in an SPFx/React web part:
 *   import { createTheme } from '@fluentui/react';
 *   import { ssdFluentPalette, ssdFonts } from '../../design-system/theme';
 *   export const ssdTheme = createTheme({
 *     palette: ssdFluentPalette,
 *     defaultFontStyle: { fontFamily: ssdFonts.body },
 *   });
 */
export const ssdFluentPalette = {
  themePrimary: '#0078D4',
  themeLighterAlt: '#EFF6FC',
  themeLighter: '#DEECF9',
  themeLight: '#C7E0F4',
  themeTertiary: '#71AFE5',
  themeSecondary: '#2B88D8',
  themeDarkAlt: '#106EBE',
  themeDark: '#005A9E',
  themeDarker: '#004578',

  neutralDark: '#1B2C39',
  neutralPrimary: '#091F2E',
  neutralPrimaryAlt: '#33434F',
  neutralSecondary: '#4C5A67',
  neutralTertiary: '#6B7883',
  neutralTertiaryAlt: '#97A1AA',
  neutralQuaternary: '#C3CACF',
  neutralQuaternaryAlt: '#DCE0E4',
  neutralLight: '#DCE0E4',
  neutralLighter: '#EDEDED',
  neutralLighterAlt: '#F4F4F4',
  black: '#091F2E',
  white: '#FFFFFF',
} as const;
