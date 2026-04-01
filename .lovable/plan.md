

## Plan: Replace All Logos + Add 2 Categories + Remove Lovable Branding

### 1. Replace All Logo Assets

**Uploaded images:**
- `user-uploads://output-onlinepngtools_2.png` — "FOOD ADDA" text logo (for navbar, favicon)
- `user-uploads://Group_2-3.png` — Icon-only logo (for footer)

**Actions:**
- Copy first image to `src/assets/logo-nav.png` (replaces navbar logo) AND `public/favicon.png` (replaces favicon)
- Copy second image to `src/assets/logo-footer.png` (replaces footer logo)
- Update `index.html`: remove Lovable opengraph/twitter image URLs, replace with `/favicon.png` or remove them

### 2. Remove Lovable Branding from OG/Twitter Meta Tags

In `index.html`, replace the `og:image` and `twitter:image` URLs (currently pointing to `lovable.dev`) with `/favicon.png` so search results and social shares show the FoodAdda logo instead of Lovable branding.

### 3. Add 2 New Categories via Database Migration

Insert into `categories` table:
- **Private Label** — type: `service`, icon: `Palette`, display_order after existing categories
- **Consultants, Contractors & Solution Providers** — type: `service`, icon: `Cog`, display_order after Private Label

### Files Changed

| File | Change |
|------|--------|
| `src/assets/logo-nav.png` | Replaced with uploaded text logo |
| `src/assets/logo-footer.png` | Replaced with uploaded icon logo |
| `public/favicon.png` | Replaced with uploaded text logo |
| `index.html` | Update og:image and twitter:image to `/favicon.png` |
| `supabase/migrations/new.sql` | Insert 2 new categories |

