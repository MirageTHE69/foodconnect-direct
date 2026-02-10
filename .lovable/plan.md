

# Color Theme Update

## New Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| Primary | #F4C400 | Main buttons, links, active states |
| Secondary | #121212 | Secondary buttons, dark elements |
| Background | #FFFBEA | Page background |
| Surface | #F2F2F2 | Cards, popovers, inputs |
| Text Primary | #1A1A1A | Headings, body text |
| Text Secondary | #6B6B6B | Muted text, descriptions |
| Success | #2ECC71 | Success states (replaces old secondary green) |
| Highlight/Accent | #FFB703 | Badges, highlights, accent elements |

## Files to Modify

### 1. `src/index.css` (Main changes)
Update all CSS custom properties in both `:root` (light) and `.dark` sections:
- `--primary` becomes golden yellow (#F4C400)
- `--secondary` becomes near-black (#121212)
- `--background` stays warm cream (#FFFBEA)
- `--card`, `--popover` use surface gray (#F2F2F2)
- `--foreground` uses text primary (#1A1A1A)
- `--muted-foreground` uses text secondary (#6B6B6B)
- `--accent` uses highlight amber (#FFB703)
- Update all gradient variables to use new primary/accent colors
- Update shadow colors to match new primary
- Update sidebar variables to match new palette
- Adjust `--primary-foreground` to dark (#1A1A1A) since primary is now a bright yellow (needs dark text on top)

### 2. `src/components/ui/button.tsx`
- Verify button text contrast -- since primary is now bright yellow, `primary-foreground` must be dark for readability
- No structural changes needed if CSS variables are updated correctly

### 3. `src/components/landing/Hero.tsx`
- Update any hardcoded color references if present (the gradient text classes should work via CSS variables)

### 4. `src/components/landing/CTA.tsx`
- The "secondary" button variant now uses near-black (#121212) with light text -- verify it reads well

## Technical Details

HSL conversions for CSS variables:
- Primary (#F4C400): `49 100% 48%`
- Secondary (#121212): `0 0% 7%`
- Background (#FFFBEA): `47 100% 96%`
- Surface (#F2F2F2): `0 0% 95%`
- Text Primary (#1A1A1A): `0 0% 10%`
- Text Secondary (#6B6B6B): `0 0% 42%`
- Success (#2ECC71): `145 63% 49%`
- Accent (#FFB703): `43 100% 51%`

Key contrast consideration: Since the new primary (#F4C400) is a bright yellow, all text placed on primary backgrounds must be dark (#1A1A1A) rather than white for accessibility.

## Dark Mode
The dark mode variables will be adjusted to complement the new palette with slightly brighter/saturated versions of primary and accent on a dark background.

