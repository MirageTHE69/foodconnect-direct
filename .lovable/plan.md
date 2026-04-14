

## Plan: Vendor Directory Linked to Sub-Categories

### Overview
Create a vendor directory system where clicking a category shows sub-categories, and clicking a sub-category shows its vendors. Import Fresh Produce vendor data from the PDF.

### 1. Create `directory_vendors` Table (Migration)

New table to store vendor contact info linked to sub-categories:

```sql
CREATE TABLE public.directory_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_category_id UUID NOT NULL REFERENCES public.sub_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.directory_vendors ENABLE ROW LEVEL SECURITY;

-- Anyone can view
CREATE POLICY "Anyone can view vendors" ON public.directory_vendors
  FOR SELECT USING (true);

-- Admins can manage
CREATE POLICY "Admins can manage vendors" ON public.directory_vendors
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
```

### 2. Import Fresh Produce Vendors (Insert)

Insert ~20 vendors from the PDF into the correct sub-categories:
- **Domestic** sub-category: Prime Fresh Limited, Dhanlaxmi International, Greeble Agro Export, Elevex Ventures, Pisum Food Services
- **Imported** sub-category: Prime Fresh Limited, Dhanlaxmi International, Greeble Agro Export, Elevex Ventures, Aworld Export, Grow India Import Export
- **Seasonal & Exotic**: Fresh Fruit Alliances, Magnus Farm Fresh, Frrutto Fresh India, ESSAR EXPORTS
- **Vegetables** (mapped to existing sub-categories): Namdhari Exports, Green Earth Products, Bharat Fresh, ElWorld Agro, Geewin Exim, etc.
- **Root Vegetables**: Mehrotra Consumer Products

### 3. Create SubCategoryDetail Page

New page at `/categories/:categoryId/sub/:subId` that:
- Shows the sub-category name with breadcrumb navigation (All Categories → Category → Sub-category)
- Fetches vendors from `directory_vendors` where `sub_category_id` matches
- Displays vendor cards in a grid with name, address, email, phone
- Shows "No vendors listed yet" if empty

### 4. Update CategoryDetail Page

Make sub-category cards clickable links to `/categories/${id}/sub/${sub.id}` instead of being non-navigable cards.

### 5. Add Route in App.tsx

Add: `<Route path="/categories/:categoryId/sub/:subId" element={<SubCategoryDetail />} />`

### Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/new.sql` | Create `directory_vendors` table |
| Database insert | Import ~20 vendors from PDF |
| `src/pages/SubCategoryDetail.tsx` | New page showing vendors for a sub-category |
| `src/pages/CategoryDetail.tsx` | Make sub-category cards link to sub-category detail |
| `src/App.tsx` | Add new route |

