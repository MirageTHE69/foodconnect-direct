

# Vendor Reputation & Data Migration Plan

## Overview

This plan addresses two key requirements:
1. **Feature suppliers on landing page based on their specialty/market reputation**
2. **Migrate 10,000 vendors from Excel/CSV into the database**

---

## Part 1: Reputation-Based Featured Suppliers

### Current Situation
- The landing page uses **hardcoded mock data** for featured suppliers
- The database already has `is_featured` (boolean) flag but no specialty/reputation fields
- We need to add reputation/specialty fields and make the featured section dynamic

### Proposed Database Changes

Add new columns to `supplier_profiles` table:

| Column | Type | Purpose |
|--------|------|---------|
| `specialty` | text | Primary specialty (e.g., "Basmati Rice", "Premium Spices") |
| `specialty_tags` | text[] | Array of product specialties for filtering |
| `market_reputation` | text | Reputation tier: 'premium', 'established', 'emerging' |
| `reputation_score` | integer | Numeric score (1-100) for sorting featured suppliers |
| `years_in_business` | integer | Experience in the market |

### How Featured Suppliers Will Work

```text
Landing Page Featured Section:
1. Query supplier_profiles WHERE is_featured = true
2. Order by reputation_score DESC
3. Limit to top 6 suppliers
4. Display their specialty, location, and product count
```

### UI Changes

**FeaturedSuppliers component will:**
- Fetch real data from database instead of mock data
- Show specialty prominently for each supplier
- Display reputation tier badges (Premium, Established, etc.)
- Link to actual supplier profiles

---

## Part 2: Bulk Data Migration (10k Vendors)

### Migration Strategy

Since you have 10,000 vendors in Excel/CSV, here are your options:

#### Option A: Admin Bulk Upload Feature (Recommended)

Create an admin page where you can:
1. Upload CSV file directly in the browser
2. Preview data before importing
3. Map CSV columns to database fields
4. Import in batches (500 at a time to avoid timeouts)
5. See progress and handle errors

**This is ideal because:**
- No technical setup required
- Can be reused for future imports
- Shows progress and error handling
- Works entirely within the app

#### Option B: Direct Database Import

For one-time import, you can:
1. Open Lovable Cloud backend view
2. Use the SQL editor to run insert statements
3. I can generate the SQL from your CSV structure

**Limitation:** Supabase has query limits, so you'd need to split into batches

#### Option C: Edge Function for CSV Processing

Create an edge function that:
1. Accepts CSV file upload
2. Parses and validates data
3. Inserts into database in batches
4. Returns success/error report

---

## Implementation Steps

### Step 1: Database Schema Update
Add new columns to `supplier_profiles` for reputation data:
- `specialty` (text)
- `specialty_tags` (text array)
- `market_reputation` (enum: premium/established/emerging)
- `reputation_score` (integer 1-100)
- `years_in_business` (integer)

### Step 2: Update FeaturedSuppliers Component
- Replace mock data with real database query
- Fetch featured suppliers ordered by reputation_score
- Display specialty and reputation badges
- Show real product counts

### Step 3: Create Admin Bulk Import Page
New page at `/admin/import-suppliers`:
- CSV file upload interface
- Column mapping preview
- Batch import with progress indicator
- Error handling and reporting
- Option to mark all as verified or pending

### Step 4: Admin Supplier Management Enhancement
Update existing admin suppliers page to:
- Edit specialty and reputation fields
- Bulk update featured status
- Filter by reputation tier

---

## CSV Format Expected

Your Excel/CSV should have columns like:

| company_name | specialty | city | state | phone | email | gst_number | fssai_number | reputation |
|--------------|-----------|------|-------|-------|-------|------------|--------------|------------|
| Fresh Farms | Basmati Rice | Mumbai | Maharashtra | 9876543210 | contact@freshfarms.in | 27AAACM3025E1ZZ | 12345678901234 | premium |

Any missing columns will get default values.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/admin/ImportSuppliers.tsx` | Bulk CSV import UI for admin |
| `src/hooks/useBulkImport.ts` | Handle CSV parsing and batch import |
| `supabase/functions/bulk-import-suppliers/index.ts` | Edge function for large imports |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/landing/FeaturedSuppliers.tsx` | Fetch real data, show specialty/reputation |
| `src/pages/admin/Suppliers.tsx` | Add specialty/reputation editing |
| `src/App.tsx` | Add import suppliers route |
| `src/components/shared/DashboardLayout.tsx` | Add import link in admin nav |

---

## Technical Notes

### For 10k Records
- Import will be done in batches of 500 records
- Each batch takes ~2-3 seconds
- Full import: approximately 1-2 minutes
- Progress bar will show completion percentage

### Vendor User Accounts
Since these are bulk-imported vendors (not self-registered), they will:
- NOT have user accounts initially
- Use a placeholder `user_id` (admin's ID or a system ID)
- Vendors can later "claim" their profiles by signing up

### Search & Discovery
With specialty tags, buyers can:
- Search for "Rice suppliers"
- Filter by reputation tier
- Find specialists in specific products

