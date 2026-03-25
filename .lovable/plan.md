

## Plan: Favicon Update + Signup Flow Fix + B2B Form Fields

### 1. Update Favicon
Copy the uploaded logo (`user-uploads://Group_2-2.png`) to `public/favicon.png` and update `index.html` to reference it.

### 2. Fix Signup Redirect Bug
**Problem:** After completing all 4 signup steps, `handleActivateSubscription` navigates to `/dashboard`. But `ProtectedRoute` loads with `hasActiveSubscription = false` (stale data from `useSubscription`) and redirects to `/subscribe`, which loops back.

**Fix:**
- In `Auth.tsx` line 199: Pass `{ state: { freshSubscription: true } }` with the navigate call
- In `ProtectedRoute.tsx` line 59: Check `location.state?.freshSubscription` — if true, skip the subscription redirect

### 3. Add B2B Form Fields
**Database migration** — Add columns to `registration_profiles`:
- `b2b_category` (text)
- `private_label` (text) 
- `export_capability` (text)
- `logistics_support` (text)
- `pricing_tier` (text)
- `certifications` (text)

**Update `RegistrationForm.tsx`** — Add to B2B section:
- Category (text input)
- Certifications (text input)
- Private Label (Yes/No select)
- Export Capability (Yes/No select)
- Logistics Support (Yes/No select)
- Pricing Tier (Budget/Mid-Range/Premium select)

Existing fields already cover: Company Name, Location, Contact Person, Phone/Email, MOQ.

**Update `Auth.tsx`** — Include new fields when saving to `registration_profiles`.

### Files Changed
| File | Change |
|------|--------|
| `public/favicon.png` | New file (uploaded logo) |
| `index.html` | Update favicon link |
| `supabase/migrations/new.sql` | Add 6 columns to registration_profiles |
| `src/components/registration/RegistrationForm.tsx` | Add B2B fields |
| `src/pages/Auth.tsx` | Save new fields + pass freshSubscription state |
| `src/components/ProtectedRoute.tsx` | Check freshSubscription state to bypass sub check |

