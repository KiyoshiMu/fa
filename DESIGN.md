---
name: Modern Wealth Management
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#45464d'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002114'
  on-tertiary-container: '#069669'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  card-gap: 24px
---

## Brand & Style
The brand personality is anchored in **institutional trust** and **modern precision**. Designed specifically for the Canadian financial landscape, the aesthetic must balance the stability of traditional banking with the agility of modern fintech. 

This design system utilizes a **Corporate Modern** style with a focus on **Minimalism**. It prioritizes high data density without cognitive overload, using generous whitespace to separate complex financial instruments. The emotional response should be one of "controlled growth"—users should feel that their data is secure, their trajectory is clear, and the interface is an expert tool rather than a playground.

## Colors
The palette is built on a foundation of **Deep Navy (#0F172A)** and **Slate Blue (#1E293B)** to establish immediate authority and professionalism. 

**Vibrant Teal (#0D9488)** serves as the primary action color, representing growth and digital innovation. **Emerald (#059669)** is reserved strictly for positive financial health, such as portfolio gains or met budgets. Conversely, **Amber (#D97706)** is used sparingly for alerts, deficits, or areas requiring advisor intervention. The background uses a very subtle Slate tint (#F8FAFC) to reduce eye strain and provide contrast for white card elements.

## Typography
**Geist** is the sole typeface for this design system, chosen for its exceptional tabular lining and geometric clarity—essential for reading financial ledgers and market data. 

Headlines use a tighter letter-spacing to feel "locked-in" and authoritative. Labels utilize a slight tracking increase and uppercase transform to differentiate metadata from actual financial figures. For currency and percentage values, use the `data-mono` role to ensure that numerical digits align vertically in tables, facilitating easy comparison.

## Layout & Spacing
The design system employs a **Fixed Grid** philosophy for desktop dashboards to maintain a consistent reading scan-line for advisors, while transitioning to a **Fluid Grid** for mobile views. 

The layout is built on an **8px base grid**. Content is housed in a 12-column grid system on desktop with 24px gutters. Dashboard "widgets" (cards) should follow a modular scale, typically spanning 3, 4, 6, or 12 columns. Vertical rhythm is strictly enforced; spacing between card sections should consistently be 24px (3x base) to maintain a sense of organized "generous whitespace."

## Elevation & Depth
This design system uses **Tonal Layers** combined with **Ambient Shadows** to create a structured hierarchy. 

The base canvas is neutral (#F8FAFC). Primary content is housed in white cards (#FFFFFF). To create a "Modern FinTech" feel, depth is communicated through a `shadow-sm` approach: a very soft, diffused shadow (Blur: 4px, Y: 2px) with a low-opacity navy tint (#0F172A at 4-6%) rather than pure black. This prevents the UI from feeling "muddy." Hover states on interactive cards should subtly increase the elevation (Blur: 8px, Y: 4px) to provide tactile feedback without shifting the layout.

## Shapes
The shape language is defined by **Rounded (Level 2)** containers. Standard UI components like buttons and inputs use a 0.5rem (8px) radius. However, top-level dashboard cards and primary containers must use `rounded-xl` (1.5rem / 24px) to create a friendly, contemporary frame for the data. This high-radius outer boundary softens the "cold" nature of financial data, making the app feel more approachable for long-term planning sessions.

## Components
- **Buttons:** Primary buttons use the Teal (#0D9488) fill with white text. Secondary buttons use a Navy (#0F172A) outline with 1px stroke.
- **Charts:** Use a 2px stroke width for line charts. Use Teal for "Actuals" and a dashed Slate line for "Projections." 
- **Progress Bars:** Use a thick 8px track. The background track should be a 10% opacity version of the primary color. For budget compliance, the bar transitions from Teal to Amber if a threshold is exceeded.
- **Input Fields:** Use a 1px border (#E2E8F0) that thickens to 2px Teal on focus. Labels should always sit above the input, never as placeholders, to maintain accessibility.
- **Modern Data Tables:** No vertical borders. Use 1px horizontal dividers (#F1F5F9). The header row should be Slate (#1E293B) with white text or a very light gray background with Navy text to anchor the data.
- **Interactive Sliders:** Use a large, 24px circular Teal handle to ensure ease of use on both desktop and tablet for "what-if" scenario planning.