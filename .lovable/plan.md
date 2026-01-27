

# Phase 3 Implementation Plan

## Overview
Phase 3 focuses on building the Admin control panel, advanced features (real-time chat, recipe management), and laying the groundwork for the payment system. This phase will complete the platform's core functionality.

---

## Current Status Summary

### Already Completed (Phase 1 & 2)
- 12 database tables fully configured with RLS
- Role-based authentication (buyer/supplier/admin)
- 4 storage buckets with RLS policies
- Complete Supplier features (profile, products, enquiries)
- Complete Buyer features (browse, detail pages, saved items)
- Landing page with 12 sections
- Basic dashboard placeholders for all roles

### Admin Dashboard Current State
- Only `/admin` route exists with placeholder stats (all showing 0)
- Quick action cards link to non-existent pages:
  - `/admin/users` (not built)
  - `/admin/suppliers` (not built)
  - `/admin/products` (not built)
  - `/admin/verification` (not built)

---

## Phase 3 Scope

### Part A: Admin Features (High Priority)

#### 1. Admin Dashboard Enhancement (`/admin`)
**Purpose:** Real analytics and quick overview

**Features:**
- Live stats from database (total users, suppliers, products, pending verifications)
- Recent activity feed
- Quick action cards with counts
- Use `DashboardLayout` with admin navigation

---

#### 2. User Management Page (`/admin/users`)
**Purpose:** View and manage all platform users

**Features:**
- Data table with all users from `profiles` + `user_roles`
- Columns: Name, Email, Role, Created Date, Status
- Search by name/email
- Filter by role (buyer/supplier/admin)
- View user details modal
- Ability to change user role (admin action)

**Security:**
- Admin-only access via `has_role()` function
- All actions server-validated

---

#### 3. Supplier Verification Page (`/admin/suppliers`)
**Purpose:** Review and verify supplier profiles

**Features:**
- Data table with all suppliers from `supplier_profiles`
- Columns: Company Name, Owner Email, Location, Status, Created Date
- Filter by verification status (pending/verified/rejected)
- View full profile details in side panel
- Approve/Reject actions with status update
- View uploaded documents (GST, FSSAI, certifications)

**Actions:**
- Verify supplier (status -> 'verified')
- Reject supplier (status -> 'rejected')
- Request more info (optional note field)

---

#### 4. Product Moderation Page (`/admin/products`)
**Purpose:** Review and approve/reject product listings

**Features:**
- Data table with all products from `products`
- Columns: Product Name, Supplier, Category, Status, Created Date
- Filter by status (pending/approved/rejected)
- View product details in side panel
- Approve/Reject actions
- Feature/Unfeature product toggle

**Actions:**
- Approve product (status -> 'approved')
- Reject product (status -> 'rejected')
- Toggle featured status

---

### Part B: Advanced Features

#### 5. Real-time Chat System
**Purpose:** Enable direct messaging between buyers and suppliers

**Database:** Already has `conversations` and `messages` tables

**Features:**
- Chat list page showing all conversations
- Real-time message updates using Supabase Realtime
- Message input with send functionality
- Read/unread status indicators
- Start new conversation from product/supplier detail pages

**Pages:**
- `/chat` - Conversation list
- `/chat/:conversationId` - Individual chat view

**Components:**
- `ChatList.tsx` - List of conversations
- `ChatWindow.tsx` - Message thread
- `MessageInput.tsx` - Compose message

---

#### 6. Recipe Management for Suppliers
**Purpose:** Allow suppliers to showcase recipes using their products

**Database:** Already has `recipes` and `recipe_ingredients` tables

**Features:**
- Recipe CRUD (create, read, update, delete)
- Image gallery upload
- Ingredient management (link to products)
- Instructions editor (rich text)
- Prep time, cook time, servings, difficulty

**Pages:**
- `/supplier/recipes` - Recipe list
- `/supplier/recipes/new` - Create recipe
- `/supplier/recipes/:id` - Edit recipe

**Public Pages:**
- `/recipes` - Browse all approved recipes
- `/recipes/:id` - Recipe detail page

---

### Part C: Payment System Foundation

#### 7. Database Schema for Packages & Subscriptions

**New Tables:**

```text
packages
- id (uuid)
- name (text) - e.g., "Basic", "Premium", "Enterprise"
- description (text)
- price_monthly (decimal)
- price_yearly (decimal)
- features (jsonb) - list of included features
- user_type (enum: buyer/supplier)
- is_active (boolean)
- created_at, updated_at

subscriptions
- id (uuid)
- user_id (uuid) -> auth.users
- package_id (uuid) -> packages
- status (enum: active/cancelled/expired/trial)
- current_period_start (timestamp)
- current_period_end (timestamp)
- payment_provider (text) - 'stripe' or 'razorpay'
- provider_subscription_id (text)
- created_at, updated_at
```

---

#### 8. Pricing Page (`/pricing`)
**Purpose:** Display subscription packages for buyers and suppliers

**Features:**
- Toggle between Buyer and Supplier plans
- Package comparison cards
- Feature list per package
- CTA buttons to start subscription
- FAQ section

---

#### 9. Checkout Flow (Placeholder)
**Purpose:** Prepare for payment gateway integration

**Features:**
- Package selection confirmation
- Billing cycle selection (monthly/yearly)
- Payment method placeholder (Stripe/Razorpay to be added)
- Success/failure handling

---

### Part D: Dashboard Analytics

#### 10. Enhanced Dashboards with Real Stats

**Supplier Dashboard:**
- Total products count (live)
- Total recipes count (live)
- Pending enquiries count (live)
- Profile views (future)
- Verification status indicator

**Buyer Dashboard:**
- Saved products count (live)
- Saved suppliers count (live)
- Recent enquiries sent
- Active conversations count

**Admin Dashboard:**
- Total users by role
- New signups (daily/weekly)
- Products by status
- Suppliers by verification status
- Platform activity trends

---

## Technical Implementation Details

### New Files to Create

```text
src/
├── pages/
│   ├── admin/
│   │   ├── Users.tsx              (user management)
│   │   ├── Suppliers.tsx          (supplier verification)
│   │   └── Products.tsx           (product moderation)
│   ├── supplier/
│   │   ├── Recipes.tsx            (recipe list)
│   │   └── RecipeEdit.tsx         (create/edit recipe)
│   ├── Chat.tsx                   (chat list)
│   ├── ChatRoom.tsx               (individual conversation)
│   ├── Recipes.tsx                (browse recipes)
│   ├── RecipeDetail.tsx           (recipe detail)
│   └── Pricing.tsx                (pricing page)
├── components/
│   ├── admin/
│   │   ├── UsersTable.tsx
│   │   ├── SuppliersTable.tsx
│   │   ├── ProductsTable.tsx
│   │   └── AdminStatsCards.tsx
│   ├── chat/
│   │   ├── ChatList.tsx
│   │   ├── ChatWindow.tsx
│   │   └── MessageInput.tsx
│   └── recipes/
│       ├── RecipeCard.tsx
│       └── RecipeForm.tsx
├── hooks/
│   ├── useAdminStats.ts           (admin analytics)
│   ├── useAdminUsers.ts           (user management)
│   ├── useAdminSuppliers.ts       (supplier moderation)
│   ├── useAdminProducts.ts        (product moderation)
│   ├── useChat.ts                 (real-time messaging)
│   ├── useRecipes.ts              (recipe CRUD)
│   └── useSubscription.ts         (subscription status)
```

### Database Changes Required
- Create `packages` table with seed data
- Create `subscriptions` table with RLS policies
- Enable Supabase Realtime on `messages` table
- Add admin RLS policies for user management

### Routes to Add

```text
/admin/users           -> AdminUsers
/admin/suppliers       -> AdminSuppliers
/admin/products        -> AdminProducts
/chat                  -> ChatList
/chat/:id              -> ChatRoom
/supplier/recipes      -> SupplierRecipes
/supplier/recipes/new  -> RecipeEdit
/supplier/recipes/:id  -> RecipeEdit
/recipes               -> BrowseRecipes
/recipes/:id           -> RecipeDetail
/pricing               -> Pricing
```

---

## Implementation Order

### Week 1: Admin Core
1. Admin Dashboard enhancement (live stats)
2. User Management page
3. Supplier Verification page
4. Product Moderation page

### Week 2: Chat & Recipes
5. Real-time Chat system
6. Recipe Management for suppliers
7. Public recipe browsing

### Week 3: Payment Foundation
8. Database schema for packages/subscriptions
9. Pricing page
10. Dashboard analytics enhancements

---

## Estimated Scope
- **8 new pages** to create
- **~12 new components** to create
- **~7 custom hooks** for data management
- **2 new database tables** (packages, subscriptions)
- **Realtime setup** for messages table
- **Route updates** in App.tsx

---

## Ready to Proceed?

This plan covers all remaining Phase 3 features. We can implement these in the order listed above, starting with the Admin features.

