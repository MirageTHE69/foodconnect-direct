

## Plan: Dynamic Categories System + Hot Requirements Section

### Part 1: Categories with Sub-Categories

**Database: Create `categories` and `sub_categories` tables**

`categories` table:
- id, name, icon (lucide icon name), type (enum: 'product' | 'service'), display_order, is_active, item_count (integer, admin-managed), created_at

`sub_categories` table:
- id, category_id (FK), name, description, display_order, is_active, created_at

Seed all 15 categories from the PDF:
- **Product categories (1-12):** Fresh Produce, Grains/Pulses/Cereals, Dairy & Alternatives, Meat/Poultry/Seafood, Beverages, Oils/Fats/Spices, Bakery/Confectionery/Snacks, Packaged & Processed Foods, Health/Organic/Specialty, Food Ingredients & Additives, Packaging & Allied, Cold Chain & Logistics
- **Service categories (13-15):** Food Processing & Machinery, Branding/Marketing/Design, HoReCa & Institutional Supplies

Each with their sub-categories from the PDF. RLS: public read, admin write.

**Frontend:**

1. **Update `src/components/landing/Categories.tsx`** — Fetch from `categories` table, show all categories in a grid with icons and item counts. Service categories get a distinct badge/color (e.g., "Service" tag). Each card links to `/categories/:id`.

2. **Create `src/pages/CategoryDetail.tsx`** — New page at `/categories/:id` showing the category name, type badge, and a grid of all its sub-categories. Each sub-category displayed as a card. No auth required (public page).

3. **Add route** in `App.tsx`: `/categories/:id` → `CategoryDetail`

### Part 2: Hot Requirements Section

**Database: Create `hot_requirements` table**
- id, title, description, category (text), location (text), quantity (text), budget_range (text), posted_by_admin (uuid, FK profiles), contact_user_id (uuid, nullable — the buyer/hotel on whose behalf it's posted), is_active, expires_at, created_at

RLS: Anyone can view active requirements. Admins can manage all.

**Frontend:**

1. **Create `src/components/landing/HotRequirements.tsx`** — Landing page section showing active hot requirements as cards with title, category, location, quantity. Each card has a "Respond" button.
   - If user is not logged in → redirect to `/auth`
   - If logged in but no subscription → redirect to `/subscribe`
   - If logged in + subscribed → open chat with the contact user

2. **Create admin page `src/pages/admin/HotRequirements.tsx`** — CRUD for hot requirements. Admin can create/edit/delete requirements, set expiry dates, assign a contact user.

3. **Add to `Index.tsx`** — Place `HotRequirements` section after `FeaturedSuppliers` (before Pricing).

4. **Add routes** in `App.tsx`:
   - `/categories/:id` (public)
   - `/admin/hot-requirements` (admin protected)

### Section Order After Changes
Navbar → Hero → Stats → HowItWorks → **Categories** (dynamic) → ForBuyers → FeaturedSuppliers → **HotRequirements** → Pricing → GrowthSolutions → Testimonials → Community → FAQ → CTA → Footer

### Technical Notes
- Categories use lucide icon names stored as strings, rendered dynamically
- Service vs product distinction shown via colored badges on category cards
- Hot requirements "Respond" button checks auth + subscription status before initiating chat
- All data seeded via migration SQL

