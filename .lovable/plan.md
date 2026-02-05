
# Product Scanner - AI-Powered Product Recognition Feature

## Overview

Create a new page where users can upload or capture a photo of a food product. The AI will analyze the image, identify the product, and then show matching products from suppliers in the system along with their contact information.

## User Flow

```text
1. User visits /scan page
2. User takes a photo or uploads an image
3. System sends image to AI for recognition
4. AI returns identified product name/description
5. System searches database for matching products
6. Display matching products with supplier contact info
7. User can click to view supplier or start a conversation
```

## Implementation Plan

### Step 1: Create Edge Function for AI Image Recognition

**New File:** `supabase/functions/scan-product/index.ts`

- Accept base64 image data from frontend
- Call Lovable AI Gateway with `google/gemini-3-flash-preview` (supports image analysis)
- Prompt AI to identify the food product in the image
- Return product name, description, and keywords for searching

### Step 2: Update Supabase Config

**File:** `supabase/config.toml`

- Add the new `scan-product` edge function configuration

### Step 3: Create Product Scanner Page

**New File:** `src/pages/ProductScanner.tsx`

- Camera capture button (for mobile users)
- Image upload option (for desktop users)  
- Preview of uploaded/captured image
- Loading state while AI processes
- Results section showing:
  - What the AI identified
  - Matching products from database
  - Supplier cards with contact info

### Step 4: Create Scanner Hook

**New File:** `src/hooks/useProductScanner.ts`

- Handle image upload/capture
- Call edge function with image data
- Search products table for matches using AI keywords
- Return results with supplier details

### Step 5: Add Route and Navigation

**Files to update:**
- `src/App.tsx` - Add `/scan` route (public access)
- `src/components/landing/Navbar.tsx` - Add "Scan Product" link
- `src/components/shared/DashboardLayout.tsx` - Add to buyer navigation

---

## Technical Details

### AI Image Recognition Flow

The edge function will use Lovable AI's vision capabilities:

```text
Request:
- Image (base64 encoded)
- System prompt asking to identify food products

Response:
- Product name (e.g., "Basmati Rice")
- Product description
- Keywords for search (e.g., ["rice", "basmati", "grain"])
- Confidence level
```

### Database Search Strategy

After AI identification, search products using:
1. Full-text search on product name
2. ILIKE pattern matching on description
3. Tag matching if products have tags

### Results Display

Each result will show:
- Product image and name
- Supplier company name and logo
- Location (city, state)
- Button to view supplier profile
- Button to start conversation (for logged-in buyers)

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/scan-product/index.ts` | Edge function for AI image analysis |
| `src/pages/ProductScanner.tsx` | Main scanner page with camera/upload |
| `src/hooks/useProductScanner.ts` | Hook for scanner logic |

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/config.toml` | Add scan-product function config |
| `src/App.tsx` | Add /scan route |
| `src/components/landing/Navbar.tsx` | Add Scan Product link |
| `src/components/shared/DashboardLayout.tsx` | Add to buyer nav |

---

## UI Components Used

The scanner page will use existing components:
- `Card`, `CardContent`, `CardHeader` - For layout
- `Button` - For actions (capture, upload, scan)
- `Input` (type="file") - For image upload
- `ProductCard` - For displaying matched products
- `SupplierCard` - For displaying supplier info
- Loading states with `Skeleton`

---

## Edge Function Details

### Request Format
```json
{
  "image": "base64_encoded_image_data"
}
```

### Response Format
```json
{
  "identified": true,
  "product": {
    "name": "Basmati Rice",
    "description": "Long grain aromatic rice",
    "keywords": ["rice", "basmati", "grain", "aromatic"]
  },
  "confidence": 0.92
}
```

### AI Model Selection

Using `google/gemini-3-flash-preview` because:
- Supports image/vision input
- Fast response times
- Good accuracy for product identification
- Cost-effective for this use case

