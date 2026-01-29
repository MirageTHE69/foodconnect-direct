
# Fix Authentication, Role-Based Access, and Profile Pages

## Issues Identified

After investigating the codebase and database, I found the following issues:

### 1. Role Fetching Bug
The `fetchUserRole` function in `useAuth.tsx` uses `.maybeSingle()` which only returns ONE role. However, users can have multiple roles (e.g., `m@gmail.com` has both `admin` and `supplier` roles). This causes inconsistent behavior where sometimes the user gets the wrong role.

**Current behavior:** Returns first matching role randomly
**Expected behavior:** Should prioritize roles (admin > supplier > buyer) or return all roles

### 2. Buyer Dashboard Missing DashboardLayout
The Buyer Dashboard (`src/pages/buyer/Dashboard.tsx`) has its own header and layout instead of using the shared `DashboardLayout` component like other pages.

### 3. Buyer Profile Page Missing
There's no profile page for buyers at `/buyer/profile`. Buyers need a place to manage their account settings.

### 4. Supplier Dashboard Missing DashboardLayout
Similarly, the Supplier Dashboard also has its own layout instead of using `DashboardLayout`.

### 5. Admin Account Request
You requested admin access for `admin@gmail.com` with password `1234`. However, this email doesn't exist in the system yet. You would need to:
- Sign up with `admin@gmail.com` and password `1234` through the auth page
- Then I can grant admin role to that account

**Note:** The user `m@gmail.com` already has admin access and can access `/admin`.

---

## Implementation Plan

### Step 1: Fix Role Fetching Logic

**File:** `src/hooks/useAuth.tsx`

Update `fetchUserRole` to handle multiple roles with priority:
- Fetch all roles for the user
- Return highest priority role: admin > supplier > buyer
- Also expose `allRoles` array for components that need to check multiple roles

```typescript
// Change from:
const { data } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId)
  .maybeSingle();

// To:
const { data } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId);

// Then determine primary role with priority
```

### Step 2: Update Buyer Dashboard to Use DashboardLayout

**File:** `src/pages/buyer/Dashboard.tsx`

- Remove custom header and layout
- Wrap content with `<DashboardLayout>`
- Add profile link in navigation

### Step 3: Create Buyer Profile Page

**New File:** `src/pages/buyer/Profile.tsx`

- User account information (name, email)
- Phone number field
- Avatar upload using existing `ImageUpload` component
- Connected to `profiles` table
- Uses `DashboardLayout`

### Step 4: Update Supplier Dashboard to Use DashboardLayout

**File:** `src/pages/supplier/Dashboard.tsx`

- Remove custom header and layout
- Wrap content with `<DashboardLayout>`

### Step 5: Add Buyer Routes and Navigation

**Files to update:**
- `src/App.tsx` - Add `/buyer/profile` route
- `src/components/shared/DashboardLayout.tsx` - Add Profile link for buyers

### Step 6: Update ProtectedRoute for Better Role Handling

**File:** `src/components/ProtectedRoute.tsx`

- Handle case when `userRole` is still loading
- Improve redirect logic for unauthorized access

### Step 7: Create Admin Account (Database)

After you sign up with `admin@gmail.com`, I will add the admin role via database insert.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/buyer/Profile.tsx` | Buyer profile management page |

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useAuth.tsx` | Fix role fetching to handle multiple roles with priority |
| `src/pages/buyer/Dashboard.tsx` | Use DashboardLayout instead of custom layout |
| `src/pages/supplier/Dashboard.tsx` | Use DashboardLayout instead of custom layout |
| `src/components/shared/DashboardLayout.tsx` | Add Profile link for buyers in navigation |
| `src/components/ProtectedRoute.tsx` | Improve role checking and redirect logic |
| `src/App.tsx` | Add `/buyer/profile` route |

---

## Technical Details

### Role Priority Logic
```text
Priority order (highest first):
1. admin - Full platform access
2. supplier - Supplier dashboard access
3. buyer - Buyer dashboard access
```

### Navigation Updates for Buyers
```text
Current:
- Dashboard
- Browse Products
- Browse Suppliers
- Browse Recipes
- Saved Items
- Messages

After:
- Dashboard
- Profile (NEW)
- Browse Products
- Browse Suppliers
- Browse Recipes
- Saved Items
- Messages
```

---

## Admin Credentials Note

Since `admin@gmail.com` doesn't exist yet, you have two options:

1. **Use existing admin:** Log in with `m@gmail.com` (already has admin role)
2. **Create new admin:** 
   - Sign up at `/auth` with email `admin@gmail.com` and password `1234`
   - After signup, I'll add the admin role to this account

Would you like me to proceed with this plan?
