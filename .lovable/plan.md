
# Phase 3A: Communication & Content Features - Implementation Plan

## Overview
This plan details the implementation of the **Real-time Chat System** and **Recipe Management** features. I will follow existing codebase patterns strictly to ensure consistency and avoid bugs.

---

## Part 1: Real-time Chat System

### Database Setup

**Enable Realtime on Messages Table**
```sql
-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
```

No new tables needed - `conversations` and `messages` tables already exist with proper RLS policies.

---

### New Hook: `src/hooks/useChat.ts`

**Purpose:** Manage all chat-related logic including conversations, messages, and realtime subscriptions.

**Features:**
- Fetch user's conversations with last message preview
- Fetch messages for a specific conversation
- Send new messages
- Create new conversations (or find existing)
- Mark messages as read
- Real-time subscription for new messages
- Unread message count

**Pattern:** Follow existing `useEnquiries.ts` and `useSavedItems.ts` patterns with proper error handling and toast notifications.

---

### New Pages

#### 1. Chat List Page: `src/pages/Chat.tsx`

**Route:** `/chat`

**Access:** Both buyers and suppliers (protected route)

**Features:**
- List all conversations with:
  - Other party's name (supplier company name or buyer name)
  - Last message preview (truncated)
  - Timestamp of last message
  - Unread indicator
- Search/filter conversations
- Click to navigate to individual chat
- Empty state when no conversations
- Loading state

**UI Pattern:** Follow `SavedItems.tsx` list pattern with cards.

---

#### 2. Chat Room Page: `src/pages/ChatRoom.tsx`

**Route:** `/chat/:id`

**Access:** Only participants of the conversation

**Features:**
- Header with other party's info and back button
- Message list with:
  - Messages grouped by date
  - Sender avatar/initial
  - Message content
  - Timestamp
  - Read indicator
- Message input at bottom with send button
- Auto-scroll to latest message
- Real-time updates when new messages arrive
- Loading skeleton while fetching

**UI Pattern:** Modern chat interface with ScrollArea for messages.

---

### New Components

#### 1. `src/components/chat/ChatListItem.tsx`
- Avatar, name, last message preview, timestamp
- Unread badge indicator
- Click handler for navigation

#### 2. `src/components/chat/MessageBubble.tsx`
- Different styling for sent vs received
- Timestamp display
- Read indicator (checkmarks)

#### 3. `src/components/chat/MessageInput.tsx`
- Textarea for message
- Send button (disabled when empty)
- Loading state while sending
- Keyboard shortcut (Enter to send, Shift+Enter for newline)

---

### Integration Points

**Start Conversation Button:**
Add "Start Chat" button to `SupplierDetail.tsx` and `ProductDetail.tsx` alongside existing "Contact Supplier" button.

**Navigation Updates:**
- Add Chat link to `DashboardLayout.tsx` for both buyer and supplier navItems
- Already exists in dashboards as placeholder - just needs working route

---

## Part 2: Recipe Management

### New Hook: `src/hooks/useRecipes.ts`

**Purpose:** CRUD operations for recipes and ingredients.

**Features:**
- Fetch all recipes (public approved OR supplier's own)
- Fetch single recipe with ingredients
- Create recipe with ingredients
- Update recipe with ingredients
- Delete recipe (cascades to ingredients)
- Fetch supplier's products (for ingredient linking)

**Pattern:** Follow `useProducts.ts` pattern exactly.

---

### Supplier Pages

#### 1. Recipe List: `src/pages/supplier/Recipes.tsx`

**Route:** `/supplier/recipes`

**Features:**
- Table view of supplier's recipes (same pattern as `supplier/Products.tsx`)
- Columns: Image, Title, Status, Prep Time, Cook Time, Updated
- Search and filter by status
- Add/Edit/Delete/View actions
- Stats cards (Total, Approved, Pending)

---

#### 2. Recipe Edit: `src/pages/supplier/RecipeEdit.tsx`

**Route:** `/supplier/recipes/new` and `/supplier/recipes/:id`

**Features:**
- Form sections (same pattern as `ProductEdit.tsx`):
  1. **Basic Info:** Title, Description
  2. **Details:** Prep Time, Cook Time, Servings, Difficulty dropdown
  3. **Images:** MultiImageUpload (max 5, using `recipes` bucket)
  4. **Instructions:** Textarea for step-by-step
  5. **Ingredients:** Dynamic list with:
     - Ingredient name (text input)
     - Quantity (text input)
     - Unit (text input)
     - Link to Product (optional Select dropdown from supplier's products)
  6. **Tags:** Same tag input pattern as products
- Save/Cancel buttons with loading states

---

### Public Pages

#### 1. Browse Recipes: `src/pages/Recipes.tsx`

**Route:** `/recipes`

**Features:**
- Grid of RecipeCards (approved recipes only)
- Search by title
- Filter by difficulty, cook time ranges
- Pagination or load more
- Link to individual recipe

---

#### 2. Recipe Detail: `src/pages/RecipeDetail.tsx`

**Route:** `/recipes/:id`

**Features:**
- Hero image with recipe title
- Info pills: Prep Time, Cook Time, Servings, Difficulty
- Description
- Ingredients list with:
  - Quantity and unit
  - Ingredient name
  - Link to product if linked
- Instructions (formatted)
- Supplier card with link
- Related recipes (same supplier or similar tags)

---

### New Components

#### 1. `src/components/recipes/RecipeCard.tsx`

**Props:** id, title, description, images, prepTime, cookTime, difficulty, supplierName, supplierId

**UI:** Similar to ProductCard with cooking info badges.

---

#### 2. `src/components/recipes/IngredientInput.tsx`

**Purpose:** Single ingredient row with name, quantity, unit, product link

**Features:**
- Text inputs for name/quantity/unit
- Select dropdown for product linking (optional)
- Remove button

---

## Technical Implementation Details

### Files to Create

```text
src/
├── hooks/
│   └── useChat.ts                 (chat logic + realtime)
│   └── useRecipes.ts              (recipe CRUD)
├── pages/
│   ├── Chat.tsx                   (conversation list)
│   ├── ChatRoom.tsx               (individual chat)
│   ├── Recipes.tsx                (public browse)
│   ├── RecipeDetail.tsx           (public detail)
│   └── supplier/
│       ├── Recipes.tsx            (supplier list)
│       └── RecipeEdit.tsx         (create/edit)
├── components/
│   ├── chat/
│   │   ├── ChatListItem.tsx
│   │   ├── MessageBubble.tsx
│   │   └── MessageInput.tsx
│   └── recipes/
│       ├── RecipeCard.tsx
│       └── IngredientInput.tsx
```

### Files to Modify

```text
src/App.tsx                        (add new routes)
src/components/shared/DashboardLayout.tsx (add Chat nav item)
src/pages/SupplierDetail.tsx       (add Start Chat button)
src/pages/ProductDetail.tsx        (add Start Chat button)
```

---

### Route Configuration

```text
/chat                    -> Chat.tsx (buyer + supplier)
/chat/:id                -> ChatRoom.tsx (buyer + supplier)
/supplier/recipes        -> supplier/Recipes.tsx (supplier only)
/supplier/recipes/new    -> supplier/RecipeEdit.tsx (supplier only)
/supplier/recipes/:id    -> supplier/RecipeEdit.tsx (supplier only)
/recipes                 -> Recipes.tsx (public)
/recipes/:id             -> RecipeDetail.tsx (public)
```

---

### Database Migration Required

```sql
-- Enable realtime for instant message updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
```

---

## Implementation Order

To ensure a bug-free implementation, I will build in this sequence:

### Step 1: Database Setup
- Enable Supabase Realtime on messages table

### Step 2: Chat Hook
- Create `useChat.ts` with all chat logic
- Include realtime subscription setup

### Step 3: Chat Components
- `MessageBubble.tsx`
- `MessageInput.tsx`
- `ChatListItem.tsx`

### Step 4: Chat Pages
- `Chat.tsx` (conversation list)
- `ChatRoom.tsx` (chat window)

### Step 5: Chat Integration
- Update `DashboardLayout.tsx` with Chat nav
- Update `App.tsx` with chat routes
- Add "Start Chat" buttons to detail pages

### Step 6: Recipe Hook
- Create `useRecipes.ts` with CRUD operations

### Step 7: Recipe Components
- `RecipeCard.tsx`
- `IngredientInput.tsx`

### Step 8: Supplier Recipe Pages
- `supplier/Recipes.tsx`
- `supplier/RecipeEdit.tsx`

### Step 9: Public Recipe Pages
- `Recipes.tsx`
- `RecipeDetail.tsx`

### Step 10: Final Route Updates
- Add all recipe routes to `App.tsx`

---

## Quality Assurance Checklist

Each component will include:
- Loading states with Loader2 spinner
- Empty states with appropriate icons/messages
- Error handling with toast notifications
- Proper TypeScript types
- Consistent styling with existing components
- Mobile-responsive design
- Proper cleanup of realtime subscriptions

---

## Estimated Deliverables

- **2 custom hooks** (useChat, useRecipes)
- **6 new pages** (Chat, ChatRoom, Recipes public, RecipeDetail, supplier/Recipes, supplier/RecipeEdit)
- **5 new components** (ChatListItem, MessageBubble, MessageInput, RecipeCard, IngredientInput)
- **1 database migration** (enable realtime)
- **~4 file modifications** (routes, navigation, detail pages)
