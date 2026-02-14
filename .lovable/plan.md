

# Unified User Experience + Hero Redesign

## Overview
Two major changes: (1) Merge buyer and supplier dashboards into one unified dashboard where all users can both post and buy products, while keeping buyer/supplier tags for identity, and (2) Replace the phone mockup in the hero section with an illustration-style design.

## What Changes

### 1. Unified Dashboard
Currently there are separate `/buyer/dashboard` and `/supplier/dashboard` routes with different features. These will be merged into a single `/dashboard` route that gives every logged-in user access to:
- Browse & search products and suppliers
- Post their own products and recipes
- Save items, send enquiries, chat
- Manage their profile (personal + optional business profile)
- A visible "Supplier" or "Buyer" badge/tag next to their name

### 2. Auth Page
- Keep the buyer/supplier role selection at signup (used as a tag, not a restriction)
- Update the signup button text to say "Create Account" instead of "Sign up as Buyer/Supplier"
- The tag will appear as a badge in the dashboard sidebar

### 3. Routing Changes
- Create a new unified `/dashboard` route that all authenticated users go to
- Keep `/supplier/products`, `/supplier/products/new`, `/supplier/recipes`, etc. accessible to ALL authenticated users (remove role restrictions)
- Remove the separate `/buyer/dashboard` and `/supplier/dashboard` routes (redirect them to `/dashboard`)
- Update `ProtectedRoute` usage to allow any authenticated user for most routes

### 4. Sidebar Navigation (DashboardLayout)
Replace the role-based navigation with a single unified menu:
- Dashboard (home)
- My Profile
- My Products (post/manage)
- My Recipes (post/manage)
- Browse Products
- Browse Suppliers
- Browse Recipes
- Saved Items
- Messages
- Scan Product
- Show user's tag (Buyer/Supplier badge) in the sidebar header

### 5. Hero Section Redesign
Replace the phone mockup with an illustration-style right section:
- Abstract food industry icons arranged in a creative layout
- Floating geometric shapes (circles, rounded squares) with food-related icons inside
- Icons like wheat, coffee, milk, package, flame arranged in an organic pattern
- Yellow accent shapes and dotted decorative elements
- Keeps the left side content (headline, search bar, trust indicators) as-is

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | No change needed |
| `src/components/landing/Hero.tsx` | Replace phone mockup with illustration-style design |
| `src/pages/Dashboard.tsx` | New unified dashboard page |
| `src/App.tsx` | Update routes: add `/dashboard`, redirect old buyer/supplier dashboard routes |
| `src/components/shared/DashboardLayout.tsx` | Single nav menu for all users, show role badge |
| `src/components/ProtectedRoute.tsx` | Relax role checks for most routes |
| `src/pages/Auth.tsx` | Keep role selection but update messaging |
| `src/hooks/useAuth.tsx` | Minor: update redirect logic |

## Technical Details

### Route Changes
```text
BEFORE:
  /buyer/dashboard    --> BuyerDashboard (buyer only)
  /supplier/dashboard --> SupplierDashboard (supplier only)
  /supplier/products  --> SupplierProducts (supplier only)
  /supplier/recipes   --> SupplierRecipes (supplier only)

AFTER:
  /dashboard          --> UnifiedDashboard (any authenticated user)
  /buyer/dashboard    --> Redirect to /dashboard
  /supplier/dashboard --> Redirect to /dashboard
  /supplier/products  --> SupplierProducts (any authenticated user)
  /supplier/recipes   --> SupplierRecipes (any authenticated user)
  /supplier/products/new --> ProductEdit (any authenticated user)
  /supplier/recipes/new  --> RecipeEdit (any authenticated user)
```

### Unified Sidebar Nav Items
```text
- Dashboard        /dashboard
- Profile          /profile (merged buyer/supplier profile)
- My Products      /supplier/products
- My Recipes       /supplier/recipes
- Browse Products  /products
- Browse Suppliers /suppliers
- Browse Recipes   /recipes
- Saved Items      /saved
- Messages         /chat
- Scan Product     /scan
```

### Database Consideration
- The `supplier_profiles` table and `user_roles` table remain as-is
- When a "buyer"-tagged user tries to post a product, they'll need a supplier_profile created automatically (the system already creates one for supplier-tagged users at signup)
- Add logic: if no supplier_profile exists when accessing "My Products", auto-create one using the user's name

### Hero Illustration Design
The right side will feature a grid of floating icon cards with food industry icons (Wheat, Coffee, Fish, Apple, Milk, Flame, etc.) arranged in an asymmetric, visually appealing layout with:
- Rounded cards with subtle shadows
- Primary/accent colored backgrounds on some cards
- Decorative dots and geometric accents
- Smooth hover animations

