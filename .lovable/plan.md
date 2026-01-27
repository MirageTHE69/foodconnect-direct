

# Phase 2 Implementation Plan

## Overview
Build the core functionality for Suppliers and Buyers, including profile management, product CRUD, discovery pages, and file storage infrastructure.

---

## What We'll Build

### Part A: Infrastructure Setup

#### 1. Storage Buckets (Supabase Storage)
Create 4 storage buckets for file uploads:
- `avatars` - User profile pictures
- `suppliers` - Supplier logos and cover images
- `products` - Product images
- `recipes` - Recipe images

Each bucket will have proper RLS policies for secure uploads.

#### 2. Reusable Components
- `ImageUpload.tsx` - Single image upload with preview
- `MultiImageUpload.tsx` - Multiple images for galleries
- `DashboardLayout.tsx` - Shared layout for all dashboard pages
- `DataTable.tsx` - Reusable table with sorting/filtering

---

### Part B: Supplier Features (3 Pages)

#### 1. Supplier Profile Page (`/supplier/profile`)
**Purpose:** Allow suppliers to complete and edit their business profile

**Features:**
- Business details form (company name, description, address, city, state, pincode)
- Logo and cover image upload
- GST and FSSAI number fields
- Certifications multi-select
- Website URL
- Verification status display (read-only)
- Auto-save or manual save

**Form Fields:**
```text
- Company Name (required)
- Business Description (textarea)
- Logo Upload (image)
- Cover Image Upload (image)
- Address, City, State, Pincode
- GST Number, FSSAI Number
- Website URL
- Certifications (multi-select checkboxes)
```

---

#### 2. Product Management Page (`/supplier/products`)
**Purpose:** Full CRUD for supplier's product listings

**Features:**
- Product listing table with search/filter
- Add New Product modal/page
- Edit Product modal/page
- Delete Product with confirmation
- Image gallery upload (up to 5 images)
- Category selection dropdown
- Tags input
- Status indicator (pending/approved/rejected)

**Product Form Fields:**
```text
- Product Name (required)
- Description (textarea)
- Category (dropdown from product_categories)
- Images (multi-upload, max 5)
- Tags (comma-separated or tag input)
- Specifications (key-value pairs, JSON)
```

---

#### 3. Enquiries Page (`/supplier/enquiries`)
**Purpose:** View and respond to buyer enquiries

**Features:**
- List of all enquiries with status filters
- Enquiry detail view
- Status update (pending → responded → closed)
- Link to start conversation with buyer
- Product reference display

---

### Part C: Buyer Features (5 Pages)

#### 4. Browse Products Page (`/products`)
**Purpose:** Product discovery for buyers

**Features:**
- Product grid with cards
- Search by product name
- Filter by category (dropdown/sidebar)
- Filter by location (city/state)
- Pagination (12 products per page)
- Save/Unsave product (heart icon)
- Click to view product detail

**Product Card Shows:**
- Product image
- Product name
- Supplier name
- Category badge
- Save button

---

#### 5. Browse Suppliers Page (`/suppliers`)
**Purpose:** Supplier discovery for buyers

**Features:**
- Supplier cards grid
- Search by company name
- Filter by category/products they offer
- Filter by location
- Verification badge display
- Save/Unsave supplier
- Click to view supplier detail

**Supplier Card Shows:**
- Logo or placeholder
- Company name
- Location (City, State)
- Verification badge
- Product count
- Save button

---

#### 6. Supplier Detail Page (`/suppliers/:id`)
**Purpose:** Full supplier profile view for buyers

**Features:**
- Cover image banner
- Logo, company name, verification status
- Business description
- Contact information
- Certifications display
- Products tab (grid of their products)
- Recipes tab (if any)
- "Contact Supplier" button → starts enquiry/conversation
- Save supplier button

---

#### 7. Product Detail Page (`/products/:id`)
**Purpose:** Full product information for buyers

**Features:**
- Image gallery/carousel
- Product name and description
- Specifications table
- Category and tags
- Supplier info card (mini profile)
- "Contact Supplier" button
- Save product button
- Related products section (same category)

---

#### 8. Saved Items Page (`/saved`)
**Purpose:** View saved/favorited products and suppliers

**Features:**
- Tabs: "Saved Products" | "Saved Suppliers"
- Grid display of saved items
- Remove from saved functionality
- Empty state if nothing saved

---

## Technical Implementation Details

### New Files to Create

```text
src/
├── components/
│   ├── shared/
│   │   ├── DashboardLayout.tsx      (shared layout)
│   │   ├── ImageUpload.tsx          (single image upload)
│   │   ├── MultiImageUpload.tsx     (gallery upload)
│   │   ├── ProductCard.tsx          (reusable product card)
│   │   ├── SupplierCard.tsx         (reusable supplier card)
│   │   ├── SearchFilters.tsx        (search + filter sidebar)
│   │   └── Pagination.tsx           (pagination component)
│   ├── supplier/
│   │   ├── ProfileForm.tsx          (profile edit form)
│   │   ├── ProductForm.tsx          (add/edit product form)
│   │   └── EnquiryList.tsx          (enquiries table)
│   └── buyer/
│       └── SaveButton.tsx           (heart save/unsave)
├── pages/
│   ├── supplier/
│   │   ├── Profile.tsx              (profile management)
│   │   ├── Products.tsx             (product listing)
│   │   ├── ProductEdit.tsx          (add/edit product)
│   │   └── Enquiries.tsx            (enquiries list)
│   ├── buyer/
│   │   └── SavedItems.tsx           (favorites page)
│   ├── Products.tsx                 (browse products)
│   ├── ProductDetail.tsx            (single product)
│   ├── Suppliers.tsx                (browse suppliers)
│   └── SupplierDetail.tsx           (single supplier)
└── hooks/
    ├── useSupplierProfile.ts        (profile CRUD hook)
    ├── useProducts.ts               (products CRUD hook)
    ├── useSavedItems.ts             (save/unsave hook)
    └── useEnquiries.ts              (enquiries hook)
```

### Database Changes Required
- Create storage buckets (SQL migration)
- Add RLS policies for storage buckets

### Routes to Add (App.tsx)
```text
/supplier/profile      → SupplierProfile
/supplier/products     → SupplierProducts
/supplier/products/new → ProductEdit (create)
/supplier/products/:id → ProductEdit (edit)
/supplier/enquiries    → SupplierEnquiries
/products              → BrowseProducts
/products/:id          → ProductDetail
/suppliers             → BrowseSuppliers
/suppliers/:id         → SupplierDetail
/saved                 → SavedItems
```

---

## Implementation Order

1. **Storage Setup** (SQL migration for buckets)
2. **Shared Components** (DashboardLayout, ImageUpload, Cards)
3. **Supplier Profile Page** (form + image upload)
4. **Product Management** (CRUD + images)
5. **Browse Products + Product Detail**
6. **Browse Suppliers + Supplier Detail**
7. **Saved Items Page**
8. **Enquiries Page**
9. **Route Updates + Dashboard Stats**

---

## Estimated Scope
- **10 new pages** to create
- **~15 new components** to create
- **4 storage buckets** to set up
- **~4 custom hooks** for data management
- **Route updates** in App.tsx

