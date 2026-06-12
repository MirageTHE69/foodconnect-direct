## Fixes & Additions

### 1. Footer links — make all work
- Convert all `<a href="#">` to working routes/anchors using `Link`.
- Platform: "How It Works", "For Buyers", "For Suppliers", "Pricing" → smooth-scroll to landing sections (`#how-it-works`, `#for-buyers`, `#for-suppliers`, `#pricing`). If clicked from another page, navigate to `/` first then scroll.
- Services: keep `/suppliers`, `/products`, `/recipes`; "Categories" → `/#categories`. Add **Jobs → `/jobs`**.
- Company: "About Us" → `/#about` (or scroll to Hero/Stats), "Contact" → `/#contact` (or scroll to CTA section).
- Legal: already routed — convert to `Link`.
- Social icons: wire **Instagram → `https://www.instagram.com/about_foodadda/`** (`target=_blank`, `rel=noopener`). Leave other socials with `#` for now.

### 2. Login/signup flow + 2 test users + dashboard
- Verify `/dashboard` loads for buyer (subscription gate respects 2-month free trial). Check `useSubscription` to ensure trial logic works; if it auto-expired, extend test users manually.
- Create two test users via admin insert (auth.users + user_roles + profile + active `user_subscriptions` row valid for 60 days):
  - **Buyer** — email: `buyer.test@foodadda.in`  / password: `Buyer@12345`
  - **Admin** — email: `admin.test@foodadda.in`  / password: `Admin@12345`
- Confirm both can log in, admin lands on `/admin`, buyer lands on `/dashboard` with active subscription.

### 3. End-to-end site check
- Smoke-test: signup → email auto-confirmed (if enabled) → onboarding → dashboard → browse products/suppliers/recipes → apply to a job → admin sees applications. Fix any broken routes or null states surfaced.

### 4. Instagram in footer
- Wire Instagram icon to `https://www.instagram.com/about_foodadda/`.

### 5. Subscription card — add GST note
- Below price line in `Pricing.tsx` and `Subscribe.tsx` cards, add small caption: **"*Including 18% GST*"** (single line, muted text).

### 6. "Follow us on Instagram" — embed real reels
- Locate the existing Instagram/reels section (likely in `Community.tsx` or a dedicated section on Index). Replace placeholders with the 6 provided reel URLs using Instagram's official embed:
  - `https://www.instagram.com/p/DY36sykDbjE/`
  - `https://www.instagram.com/p/DYwKOapDUv4/`
  - `https://www.instagram.com/p/DXTQpJsiA-s/`
  - `https://www.instagram.com/p/DXyP-NhkebE/`
  - `https://www.instagram.com/p/DX6HS_gAPCS/`
  - `https://www.instagram.com/p/DYB0eivCD1a/`
- Use `<blockquote class="instagram-media">…</blockquote>` per reel + load `https://www.instagram.com/embed.js` once. Keep current grid sizing/aspect-ratio (9:16 reel container) so layout stays identical.

### Files to touch
- `src/components/landing/Footer.tsx` — fix links, Instagram URL, add Jobs.
- `src/components/landing/Pricing.tsx`, `src/pages/Subscribe.tsx` — GST note.
- `src/components/landing/Community.tsx` (or Instagram reels component) — embed real reels.
- Migration / insert: seed 2 test users + active subscriptions.
- Quick verify: Dashboard route, subscription hook, navigation.

### Quick clarifications
- For Instagram reels section: is it inside `Community.tsx` or do you have a separate "Follow us on Instagram" component? I'll locate it and keep current sizing — just confirm if you want all 6 in one row, 2x3, or 3x2 grid (currently I'll keep whatever exists).
- Confirm test user emails/passwords above are OK, or give me your preferred values.
