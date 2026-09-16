---
name: Obsidian & Ivory Luxury
colors:
  surface: '#fff8f1'
  surface-dim: '#e1d9cc'
  surface-bright: '#fff8f1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf3e5'
  surface-container: '#f5eddf'
  surface-container-high: '#f0e7da'
  surface-container-highest: '#eae1d4'
  on-surface: '#1f1b13'
  on-surface-variant: '#4d4635'
  inverse-surface: '#343027'
  inverse-on-surface: '#f8f0e2'
  outline: '#7f7663'
  outline-variant: '#d0c5af'
  surface-tint: '#745b00'
  primary: '#745b00'
  on-primary: '#ffffff'
  primary-container: '#f2ca50'
  on-primary-container: '#6b5500'
  inverse-primary: '#eac249'
  secondary: '#77591c'
  on-secondary: '#ffffff'
  secondary-container: '#fed48a'
  on-secondary-container: '#785a1c'
  tertiary: '#006684'
  on-tertiary: '#ffffff'
  tertiary-container: '#82d9ff'
  on-tertiary-container: '#005f7a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe08a'
  primary-fixed-dim: '#eac249'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574400'
  secondary-fixed: '#ffdea6'
  secondary-fixed-dim: '#e9c179'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5d4204'
  tertiary-fixed: '#bde9ff'
  tertiary-fixed-dim: '#7ad1f7'
  on-tertiary-fixed: '#001f2a'
  on-tertiary-fixed-variant: '#004d64'
  background: '#fff8f1'
  on-background: '#1f1b13'
  surface-variant: '#eae1d4'
typography:
  headline-lg:
    fontFamily: Bebas Neue
    fontSize: 44px
    fontWeight: '400'
    lineHeight: 48px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter-sm: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
---

## Brand & Style

This design system crafts an aura of restrained prestige, modern architectural rigor, and sovereign polish. Built for high-tier financial terminals, luxury private marketplaces, elite concierge platforms, and editorial commerce, it rejects decorative frivolity in favor of structural precision and exquisite material finishes.

### Visual Aesthetic & Philosophy
- **Modern Architectural Luxury & Pure Minimalism:** Generous structural breathing room, strict proportional geometry, and surgical attention to micro-details.
- **Atmospheric Depth:** Frosted glass planar layers with subtle edge refraction, translucent micro-borders, and diffused ambient lighting.
- **Editorial Gothic Gravity:** High-impact, vertical, condensed Gothic display moments balanced against hyper-legible, crystalline modern geometric typography.

## Colors

The palette delivers seamless parity across two distinct atmospheres, defaulting by configuration to a warm alabaster gallery aesthetic, while fully supporting a dark obsidian midnight environment with champagne luminescence.

### Light Mode ("Alabaster Gallery" - Default)
- **Base Background:** `#FAF8F5` (Warm Ivory / Alabaster)
- **Surface Level 1:** `#FFFFFF` (Pure Alabaster Surface)
- **Surface Level 2 (Elevated):** `#F3EFEA` (Platinum Warm Tint)
- **Surface Glass:** `rgba(255, 255, 255, 0.72)` with 20px backdrop blur
- **Text Primary:** `#121316` (Deep Obsidian Ink)
- **Text Secondary:** `#5E6068` (Muted Slate)
- **Text Muted / Tertiary:** `#9496A1` (Subtle Ash)
- **Border Subtle:** `rgba(18, 19, 22, 0.06)`
- **Border Structural:** `rgba(18, 19, 22, 0.12)`
- **Border Highlight:** `rgba(242, 202, 80, 0.35)`
- **Accent Primary (Champagne Gold):** `#B38F4D`
- **Accent Hover:** `#9C7A3C`
- **Accent Subtle Wash:** `rgba(179, 143, 77, 0.08)`

### Dark Mode ("Obsidian Midnight")
- **Base Background:** `#0B0D13` (Deep Midnight Charcoal)
- **Surface Level 1:** `#12151E` (Velvet Onyx)
- **Surface Level 2 (Elevated):** `#181C27` (Polished Hematite)
- **Surface Glass:** `rgba(18, 21, 30, 0.68)` with 24px backdrop blur
- **Text Primary:** `#F8F9FA` (Luminous Platinum)
- **Text Secondary:** `#A5A9B4` (Burnished Silver)
- **Text Muted / Tertiary:** `#656A76` (Deep Muted Slate)
- **Border Subtle:** `rgba(248, 249, 250, 0.07)`
- **Border Structural:** `rgba(248, 249, 250, 0.14)`
- **Border Highlight:** `rgba(242, 202, 80, 0.45)`
- **Accent Primary (Champagne Gold):** `#F2CA50`
- **Accent Hover:** `#E5C358`
- **Accent Subtle Wash:** `rgba(242, 202, 80, 0.10)`

### Semantic Tokens (Both Themes)
- **Success:** `#2E7D5E` (Emerald) | Dark Wash: `rgba(46, 125, 94, 0.16)`
- **Warning:** `#C4842D` (Amber) | Dark Wash: `rgba(196, 132, 45, 0.16)`
- **Error:** `#BD3A3A` (Crimson) | Dark Wash: `rgba(189, 58, 58, 0.16)`
- **Info:** `#3B7097` (Steel Azure) | Dark Wash: `rgba(59, 112, 151, 0.16)`

## Typography

The typographic hierarchy pairs the high-stature, condensed drama of Contemporary Gothic display with architectural geometric clarity for reading and technical data:

- **Display Tiers (`Bebas Neue`):** Used for commanding lead statements, hero metrics, monetary totals, and curated editorial headlines. Always set in uppercase with deliberate tracking to preserve legibility and presence.
- **Editorial Subheadings & Body (`Outfit`):** Balances geometric precision with a warm, open posture. Set at lighter weights (`300` and `400`) to evoke spacious high-end publication qualities.
- **Data, Metadata, & Controls (`Space Grotesk`):** Applied to badges, inputs, tabs, table cells, and status indicators. Always paired with expanded uppercase tracking (`0.08em` to `0.16em`) to echo Swiss luxury watch typography.

## Layout & Spacing

This design system uses a mathematical 8pt grid system. Micro-adjustments utilize half-steps (4px and 2px) strictly for border stroke alignment, tag vertical centering, and compact icon offsets.

### Breakpoints & Grid Architecture
- **Desktop Wide (≥1440px):** 12-column grid, `max-width: 1360px`, `gutter: 32px`, outer page margins `80px`.
- **Desktop (1024px – 1439px):** 12-column grid, fluid width, `gutter: 24px`, outer page margins `48px`.
- **Tablet (768px – 1023px):** 8-column grid, fluid width, `gutter: 20px`, outer page margins `32px`.
- **Mobile (≤767px):** 4-column grid, fluid width, `gutter: 16px`, outer page margins `20px`.

### Spacing Rules
- Sections on marketing or high-tier landing views separate at `space-96` (desktop) and `space-64` (mobile).
- Card interiors enforce an asymmetric padding rule: `space-24` horizontal by `space-24` vertical for standard density, expanding to `space-32` horizontal by `space-36` vertical on hero showcase tiles.

## Elevation & Depth

Visual depth is achieved through translucent planar layering, luminous micro-borders, and deep tinted ambient occlusion rather than heavy drop shadows.

### Light Mode Stratification (Default)
- **Level 0 (Floor):** Base `#FAF8F5`.
- **Level 1 (Panels & Cards):** Flat `#FFFFFF` bound by a 1px micro-border `rgba(18, 19, 22, 0.07)`. Ambient shadow: `0 4px 20px -2px rgba(18, 19, 22, 0.04)`.
- **Level 2 (Floating Modals & Flyouts):** `rgba(255, 255, 255, 0.92)` with `backdrop-filter: blur(20px)`, border `rgba(18, 19, 22, 0.09)`. Ambient shadow: `0 16px 40px -4px rgba(18, 19, 22, 0.08), 0 0 1px rgba(18, 19, 22, 0.12)`.
- **Active / Accent Glow:** `0 0 24px -4px rgba(179, 143, 77, 0.22)`.

### Dark Mode Stratification
- **Level 0 (Floor):** Base `#0B0D13`.
- **Level 1 (Panels & Cards):** `#12151E` bound by a 1px translucent highlight stroke `rgba(248, 249, 250, 0.08)`. Ambient shadow: `0 8px 32px -4px rgba(0, 0, 0, 0.65)`.
- **Level 2 (Floating Modals & Menus):** `rgba(24, 28, 39, 0.88)` with `backdrop-filter: blur(28px)`, border `rgba(248, 249, 250, 0.14)`. Ambient shadow: `0 24px 64px -8px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.1)`.
- **Luminous Accent Glow:** `0 0 32px -6px rgba(242, 202, 80, 0.35)`.

## Shapes

The geometric personality balances sleek contemporary curvature with architectural poise:

- **Cards & Primary Containers:** Standard `14px` radius (`rounded-lg` token variant calibrated between `12px` and `16px`). This prevents harsh brutalism while avoiding bubbly consumer softness.
- **Interactive Buttons & Inputs:** `8px` corner radius for tactile precision.
- **Pill Tags & Status Chips:** Full pill geometry (`9999px`) to create clear contrast against structured card silhouettes.
- **Modal Viewports:** `20px` corner radius on desktop, transitioning to `16px 16px 0 0` for mobile bottom sheets.

## Components

### Buttons
- **Primary:** Solid metallic champagne fill (Light: `#B38F4D`, Dark: `#F2CA50`) with high-contrast text (Light: `#FFFFFF`, Dark: `#241A00`). Subtle inner highlight `inset 0 1px 0 rgba(255, 255, 255, 0.35)`. Hover triggers a brightness shift and a subtle metallic aura glow (`0 0 20px rgba(242, 202, 80, 0.35)`). Active state scales to `0.985`.
- **Secondary (Ghost Glass):** Transparent base with 1px border (`border-subtle`). On hover: background shifts to `surface-elevated` and border brightens to `border-highlight`.
- **Tertiary (Minimalist Text):** Space Grotesk uppercase with tracked label, underlined by a 1px hairline that transitions from 40% width to 100% width on hover.

### Input Fields & Controls
- **Text Inputs:** Height `48px`. Subtle translucent background (`#FFFFFF` on light, `rgba(255, 255, 255, 0.03)` on dark) surrounded by `border-subtle`. On focus: 1px border transitions to solid `#F2CA50` with an ambient glow of `0 0 0 3px rgba(242, 202, 80, 0.12)`. Floating labels utilize `Space Grotesk` uppercase at `9px`.
- **Checkboxes & Radios:** Unchecked states feature sharp 1.5px outlines in `border-structural`. Checked states fill with the champagne accent and display a crisp obsidian interior mark.

### Chips, Tags & Badges
- **Pill Architecture:** Full border-radius (`9999px`), `Space Grotesk` font, `label-sm` sizing, uppercase with `0.14em` letter-spacing.
- **VIP / Status Badges:** Translucent backing (`rgba(242, 202, 80, 0.08)`) with a hairline border (`rgba(242, 202, 80, 0.3)`) and primary accent text.

### Cards & Surfaces
- Layered with 1px micro-borders. Premium showcase cards feature a faint top-edge gradient border (`linear-gradient(90deg, rgba(242,202,80,0.4) 0%, rgba(242,202,80,0.05) 100%)`).
- Interior separation lines must use `1px solid` border tokens, never drop shadows alone.

### Data Tables & Spec Lists
- Strict `48px` cell rows. Headers set in `Space Grotesk` label tokens with uppercase tracking.
- Row dividers use hairline `rgba(18, 19, 22, 0.05)` (light) or `rgba(255, 255, 255, 0.05)` (dark) with a subtle horizontal highlight on row hover.

---
name: Obsidian & Ivory Luxury
colors:
  surface: '#16130b'
  surface-dim: '#16130b'
  surface-bright: '#3d392f'
  surface-container-lowest: '#110e07'
  surface-container-low: '#1f1b13'
  surface-container: '#231f17'
  surface-container-high: '#2d2a21'
  surface-container-highest: '#38342b'
  on-surface: '#eae1d4'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#eae1d4'
  inverse-on-surface: '#343027'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#eac249'
  primary: '#ffe9b0'
  on-primary: '#3d2f00'
  primary-container: '#f2ca50'
  on-primary-container: '#6b5500'
  inverse-primary: '#745b00'
  secondary: '#e9c179'
  on-secondary: '#412d00'
  secondary-container: '#604406'
  on-secondary-container: '#dab36c'
  tertiary: '#d1efff'
  on-tertiary: '#003546'
  tertiary-container: '#82d9ff'
  on-tertiary-container: '#005f7a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe08a'
  primary-fixed-dim: '#eac249'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574400'
  secondary-fixed: '#ffdea6'
  secondary-fixed-dim: '#e9c179'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5d4204'
  tertiary-fixed: '#bde9ff'
  tertiary-fixed-dim: '#7ad1f7'
  on-tertiary-fixed: '#001f2a'
  on-tertiary-fixed-variant: '#004d64'
  background: '#16130b'
  on-background: '#eae1d4'
  surface-variant: '#38342b'
typography:
  headline-lg:
    fontFamily: Bebas Neue
    fontSize: 44px
    fontWeight: '400'
    lineHeight: 48px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter-sm: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
---

## Brand & Style

This design system crafts an aura of restrained prestige, modern architectural rigor, and sovereign polish. Built for high-tier financial terminals, luxury private marketplaces, elite concierge platforms, and editorial commerce, it rejects decorative frivolity in favor of structural precision and exquisite material finishes.

### Visual Aesthetic & Philosophy
- **Modern Architectural Luxury & Pure Minimalism:** Generous structural breathing room, strict proportional geometry, and surgical attention to micro-details.
- **Atmospheric Depth:** Frosted glass planar layers with subtle edge refraction, translucent micro-borders, and diffused ambient lighting.
- **Editorial Gothic Gravity:** High-impact, vertical, condensed Gothic display moments balanced against hyper-legible, crystalline modern geometric typography.

## Colors

The palette delivers seamless parity across two distinct atmospheres, defaulting by configuration to a dark obsidian midnight environment with champagne luminescence, while fully supporting a warm alabaster gallery aesthetic.

### Light Mode ("Alabaster Gallery")
- **Base Background:** `#FAF8F5` (Warm Ivory / Alabaster)
- **Surface Level 1:** `#FFFFFF` (Pure Alabaster Surface)
- **Surface Level 2 (Elevated):** `#F3EFEA` (Platinum Warm Tint)
- **Surface Glass:** `rgba(255, 255, 255, 0.72)` with 20px backdrop blur
- **Text Primary:** `#121316` (Deep Obsidian Ink)
- **Text Secondary:** `#5E6068` (Muted Slate)
- **Text Muted / Tertiary:** `#9496A1` (Subtle Ash)
- **Border Subtle:** `rgba(18, 19, 22, 0.06)`
- **Border Structural:** `rgba(18, 19, 22, 0.12)`
- **Border Highlight:** `rgba(242, 202, 80, 0.35)`
- **Accent Primary (Champagne Gold):** `#B38F4D`
- **Accent Hover:** `#9C7A3C`
- **Accent Subtle Wash:** `rgba(179, 143, 77, 0.08)`

### Dark Mode ("Obsidian Midnight" - Default)
- **Base Background:** `#0B0D13` (Deep Midnight Charcoal)
- **Surface Level 1:** `#12151E` (Velvet Onyx)
- **Surface Level 2 (Elevated):** `#181C27` (Polished Hematite)
- **Surface Glass:** `rgba(18, 21, 30, 0.68)` with 24px backdrop blur
- **Text Primary:** `#F8F9FA` (Luminous Platinum)
- **Text Secondary:** `#A5A9B4` (Burnished Silver)
- **Text Muted / Tertiary:** `#656A76` (Deep Muted Slate)
- **Border Subtle:** `rgba(248, 249, 250, 0.07)`
- **Border Structural:** `rgba(248, 249, 250, 0.14)`
- **Border Highlight:** `rgba(242, 202, 80, 0.45)`
- **Accent Primary (Champagne Gold):** `#F2CA50`
- **Accent Hover:** `#E5C358`
- **Accent Subtle Wash:** `rgba(242, 202, 80, 0.10)`

### Semantic Tokens (Both Themes)
- **Success:** `#2E7D5E` (Emerald) | Dark Wash: `rgba(46, 125, 94, 0.16)`
- **Warning:** `#C4842D` (Amber) | Dark Wash: `rgba(196, 132, 45, 0.16)`
- **Error:** `#BD3A3A` (Crimson) | Dark Wash: `rgba(189, 58, 58, 0.16)`
- **Info:** `#3B7097` (Steel Azure) | Dark Wash: `rgba(59, 112, 151, 0.16)`

## Typography

The typographic hierarchy pairs the high-stature, condensed drama of Contemporary Gothic display with architectural geometric clarity for reading and technical data:

- **Display Tiers (`Bebas Neue`):** Used for commanding lead statements, hero metrics, monetary totals, and curated editorial headlines. Always set in uppercase with deliberate tracking to preserve legibility and presence.
- **Editorial Subheadings & Body (`Outfit`):** Balances geometric precision with a warm, open posture. Set at lighter weights (`300` and `400`) to evoke spacious high-end publication qualities.
- **Data, Metadata, & Controls (`Space Grotesk`):** Applied to badges, inputs, tabs, table cells, and status indicators. Always paired with expanded uppercase tracking (`0.08em` to `0.16em`) to echo Swiss luxury watch typography.

## Layout & Spacing

This design system uses a mathematical 8pt grid system. Micro-adjustments utilize half-steps (4px and 2px) strictly for border stroke alignment, tag vertical centering, and compact icon offsets.

### Breakpoints & Grid Architecture
- **Desktop Wide (≥1440px):** 12-column grid, `max-width: 1360px`, `gutter: 32px`, outer page margins `80px`.
- **Desktop (1024px – 1439px):** 12-column grid, fluid width, `gutter: 24px`, outer page margins `48px`.
- **Tablet (768px – 1023px):** 8-column grid, fluid width, `gutter: 20px`, outer page margins `32px`.
- **Mobile (≤767px):** 4-column grid, fluid width, `gutter: 16px`, outer page margins `20px`.

### Spacing Rules
- Sections on marketing or high-tier landing views separate at `space-96` (desktop) and `space-64` (mobile).
- Card interiors enforce an asymmetric padding rule: `space-24` horizontal by `space-24` vertical for standard density, expanding to `space-32` horizontal by `space-36` vertical on hero showcase tiles.

## Elevation & Depth

Visual depth is achieved through translucent planar layering, luminous micro-borders, and deep tinted ambient occlusion rather than heavy drop shadows.

### Light Mode Stratification
- **Level 0 (Floor):** Base `#FAF8F5`.
- **Level 1 (Panels & Cards):** Flat `#FFFFFF` bound by a 1px micro-border `rgba(18, 19, 22, 0.07)`. Ambient shadow: `0 4px 20px -2px rgba(18, 19, 22, 0.04)`.
- **Level 2 (Floating Modals & Flyouts):** `rgba(255, 255, 255, 0.92)` with `backdrop-filter: blur(20px)`, border `rgba(18, 19, 22, 0.09)`. Ambient shadow: `0 16px 40px -4px rgba(18, 19, 22, 0.08), 0 0 1px rgba(18, 19, 22, 0.12)`.
- **Active / Accent Glow:** `0 0 24px -4px rgba(179, 143, 77, 0.22)`.

### Dark Mode Stratification (Default)
- **Level 0 (Floor):** Base `#0B0D13`.
- **Level 1 (Panels & Cards):** `#12151E` bound by a 1px translucent highlight stroke `rgba(248, 249, 250, 0.08)`. Ambient shadow: `0 8px 32px -4px rgba(0, 0, 0, 0.65)`.
- **Level 2 (Floating Modals & Menus):** `rgba(24, 28, 39, 0.88)` with `backdrop-filter: blur(28px)`, border `rgba(248, 249, 250, 0.14)`. Ambient shadow: `0 24px 64px -8px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.1)`.
- **Luminous Accent Glow:** `0 0 32px -6px rgba(242, 202, 80, 0.35)`.

## Shapes

The geometric personality balances sleek contemporary curvature with architectural poise:

- **Cards & Primary Containers:** Standard `14px` radius (`rounded-lg` token variant calibrated between `12px` and `16px`). This prevents harsh brutalism while avoiding bubbly consumer softness.
- **Interactive Buttons & Inputs:** `8px` corner radius for tactile precision.
- **Pill Tags & Status Chips:** Full pill geometry (`9999px`) to create clear contrast against structured card silhouettes.
- **Modal Viewports:** `20px` corner radius on desktop, transitioning to `16px 16px 0 0` for mobile bottom sheets.

## Components

### Buttons
- **Primary:** Solid metallic champagne fill (Light: `#B38F4D`, Dark: `#F2CA50`) with high-contrast text (Light: `#FFFFFF`, Dark: `#241A00`). Subtle inner highlight `inset 0 1px 0 rgba(255, 255, 255, 0.35)`. Hover triggers a brightness shift and a subtle metallic aura glow (`0 0 20px rgba(242, 202, 80, 0.35)`). Active state scales to `0.985`.
- **Secondary (Ghost Glass):** Transparent base with 1px border (`border-subtle`). On hover: background shifts to `surface-elevated` and border brightens to `border-highlight`.
- **Tertiary (Minimalist Text):** Space Grotesk uppercase with tracked label, underlined by a 1px hairline that transitions from 40% width to 100% width on hover.

### Input Fields & Controls
- **Text Inputs:** Height `48px`. Subtle translucent background (`#FFFFFF` on light, `rgba(255, 255, 255, 0.03)` on dark) surrounded by `border-subtle`. On focus: 1px border transitions to solid `#F2CA50` with an ambient glow of `0 0 0 3px rgba(242, 202, 80, 0.12)`. Floating labels utilize `Space Grotesk` uppercase at `9px`.
- **Checkboxes & Radios:** Unchecked states feature sharp 1.5px outlines in `border-structural`. Checked states fill with the champagne accent and display a crisp obsidian interior mark.

### Chips, Tags & Badges
- **Pill Architecture:** Full border-radius (`9999px`), `Space Grotesk` font, `label-sm` sizing, uppercase with `0.14em` letter-spacing.
- **VIP / Status Badges:** Translucent backing (`rgba(242, 202, 80, 0.08)`) with a hairline border (`rgba(242, 202, 80, 0.3)`) and primary accent text.

### Cards & Surfaces
- Layered with 1px micro-borders. Premium showcase cards feature a faint top-edge gradient border (`linear-gradient(90deg, rgba(242,202,80,0.4) 0%, rgba(242,202,80,0.05) 100%)`).
- Interior separation lines must use `1px solid` border tokens, never drop shadows alone.

### Data Tables & Spec Lists
- Strict `48px` cell rows. Headers set in `Space Grotesk` label tokens with uppercase tracking.
- Row dividers use hairline `rgba(18, 19, 22, 0.05)` (light) or `rgba(255, 255, 255, 0.05)` (dark) with a subtle horizontal highlight on row hover.

