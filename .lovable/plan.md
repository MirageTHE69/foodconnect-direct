

## Plan: Add Community Section + Remove Duplicate Pricing

### What's changing

1. **Remove the "ForSuppliers" section** — This section (`src/components/landing/ForSuppliers.tsx`) shows a single ₹5999 pricing card, duplicating the main Pricing section. It will be removed from `Index.tsx`. The Pricing section (showing 2 plan cards) will remain as the only pricing display.

2. **Create HORECA & Hotels Community section** (`src/components/landing/Community.tsx`)
   - Heading: "HORECA & Hotels Community"
   - Description about networking, exclusive deals, industry updates for hotels, restaurants, and catering businesses
   - Prominent green "Join Community on WhatsApp" button with WhatsApp icon, linking to a placeholder WhatsApp group invite URL (you can replace later)
   - Styled consistently with existing sections

3. **Update `src/pages/Index.tsx`**
   - Remove `ForSuppliers` import and usage
   - Add `Community` component between Testimonials and FAQ

### Final section order
Navbar → Hero → Stats → HowItWorks → Categories → ForBuyers → FeaturedSuppliers → Pricing → Testimonials → Community → FAQ → CTA → Footer

