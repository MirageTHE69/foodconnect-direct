

# Subscription System: Packages, Signup Flow & Testing Setup

## Overview
Build a subscription system with a `subscription_plans` table, a `user_subscriptions` table, display pricing cards on the landing page, enforce mandatory subscription during signup, and grant all existing users (10 users) a free testing subscription.

## What Gets Built

### 1. Database: Two New Tables

**`subscription_plans`** - Stores the plan definitions
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name | text | "Starter Plan", "Annual Plan" |
| price | integer | 500, 5999 (in INR) |
| duration_months | integer | 2, 14 |
| description | text | Plan details |
| features | text[] | List of included features |
| is_popular | boolean | Highlight badge for Annual Plan |
| is_active | boolean | Whether plan is available |
| created_at | timestamptz | |

**`user_subscriptions`** - Tracks each user's subscription
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid | References auth.users |
| plan_id | uuid | References subscription_plans |
| status | text | 'active', 'expired', 'cancelled' |
| starts_at | timestamptz | When subscription begins |
| expires_at | timestamptz | When subscription ends |
| payment_id | text | For future Cashfree integration (nullable for now) |
| payment_status | text | 'free_trial', 'paid', 'pending' |
| created_at | timestamptz | |

**RLS Policies:**
- Users can view their own subscriptions
- Users can insert their own subscriptions (for the signup flow)
- Admins can view and manage all subscriptions
- Anyone can view active subscription plans (public)

### 2. Seed Data
- Insert 2 plans: Starter (Rs.500/2 months), Annual (Rs.5,999/14 months)
- Grant all 10 existing users an active "Annual Plan" subscription valid for 14 months (for testing)

### 3. Landing Page: Pricing Section
A new `Pricing` component displayed on the landing page between the existing sections, showing:
- Two pricing cards side by side
- Plan name, price, duration, feature list
- "Popular" badge on Annual Plan
- "Get Started" button linking to `/auth?plan={plan_id}`
- Savings callout on Annual Plan ("2 months free!")

### 4. Updated Signup Flow
Modify the Auth page to support a mandatory subscription step:

**Step 1: Choose Plan** (if not pre-selected via URL)
- Show both plan cards
- User must select one to proceed

**Step 2: Create Account** (existing form)
- Role selection (Buyer/Supplier)
- Name, email, password fields

**Step 3: Confirmation** (placeholder for payment)
- Show selected plan summary
- For now: "Start Free Trial" button that creates the subscription with `payment_status: 'free_trial'`
- Later: This step will integrate Cashfree payment gateway

### 5. Subscription Guard
- Create a `useSubscription` hook to check if the current user has an active subscription
- Update `ProtectedRoute` to redirect users without an active subscription to a `/subscribe` page
- Admin users bypass subscription checks entirely
- The `/subscribe` page shows plan cards and lets users pick a plan (placeholder for payment)

### 6. Admin Subscription View
- Add a "Subscriptions" section to the admin sidebar
- Simple table showing all user subscriptions with status, plan, and expiry date

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useSubscription.ts` | Hook to check user's active subscription status |
| `src/components/landing/Pricing.tsx` | Pricing cards section for landing page |
| `src/pages/Subscribe.tsx` | Subscription selection page for users without active sub |
| `src/pages/admin/Subscriptions.tsx` | Admin view of all subscriptions |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Add Pricing section to landing page |
| `src/pages/Auth.tsx` | Add plan selection step to signup flow |
| `src/hooks/useAuth.tsx` | Insert subscription record after signup |
| `src/components/ProtectedRoute.tsx` | Add subscription check, redirect to /subscribe if no active sub |
| `src/components/shared/DashboardLayout.tsx` | Add "Subscriptions" to admin sidebar |
| `src/App.tsx` | Add /subscribe and /admin/subscriptions routes |

## Signup Flow Diagram

```text
Landing Page [Get Started] --> Auth Page
                                  |
                          Step 1: Select Plan
                          (Starter or Annual)
                                  |
                          Step 2: Create Account
                          (Name, Email, Password, Role)
                                  |
                          Step 3: Confirm Plan
                          ("Start Free Trial" button)
                                  |
                      Creates user + role + subscription
                                  |
                          Redirect to Dashboard
```

## What Needs to Happen Later for Cashfree

Once this flow is built and tested, to add real payments you will need to provide:
1. **Cashfree App ID** and **Secret Key** (from your Cashfree dashboard)
2. The "Start Free Trial" button in Step 3 will be replaced with actual Cashfree payment initiation
3. A backend function will be created to verify payment and activate the subscription
4. A webhook endpoint will handle payment confirmations from Cashfree

## Technical Details

### Subscription Check Logic
```text
1. User logs in
2. ProtectedRoute checks: does user have a row in user_subscriptions
   where status = 'active' AND expires_at > now()?
3. If YES -> allow access
4. If NO -> redirect to /subscribe
5. Admin role users -> always allowed (bypass check)
```

### Existing Users (Testing)
All 10 current users will receive an Annual Plan subscription starting today, expiring in 14 months, with `payment_status: 'free_trial'`.

