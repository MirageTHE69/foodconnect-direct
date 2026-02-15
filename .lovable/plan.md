

# Blog System: Pages, Admin Panel, and Pre-loaded Blog Content

## Overview
Build a complete blog system with a database-backed `blogs` table, public blog pages, admin management panel, and pre-load 5 blog articles from the provided PDF into the database.

## The 5 Blogs to Seed

| # | Title | Tag |
|---|-------|-----|
| 1 | Supply Chain Management and QA/QC Checks in the Food Processing Industry | Industry |
| 2 | Understanding HACCP, HALAL, FDA, FSSAI, KOSHER, and ISO: Key Certifications and Audit Procedures | Guide |
| 3 | Large-Scale Manufacturing of Milk-Based Indian Mithai: Ensuring Quality with GMP and QA/QC | Industry |
| 4 | Culinary Practices of Indian States: A Journey Through Regional Flavors and Tropical Traditions | Guide |
| 5 | Developing a Food Recipe for Large Scale Manufacturing | Guide |

Each blog will be stored with its full content (formatted as HTML), an excerpt, tag, and published status.

## What Gets Built

### 1. Database: `blogs` Table
- id, title, slug (unique), excerpt, content (HTML), cover_image_url, tag, status (draft/published), author_id, published_at, created_at, updated_at
- RLS: Anyone can view published blogs, admins can CRUD all
- Seed all 5 blogs as published posts via the data insert tool

### 2. Landing Page Blog Section
Update `src/components/landing/CTA.tsx` to fetch the latest 2 published blogs from the database instead of hardcoded data. Each card links to `/blog/:slug`.

### 3. Public Blog Pages

**Blog Listing (`/blog`)**: Grid of blog cards with cover image, tag, title, excerpt, and date. Search bar and tag filter. No login required.

**Blog Detail (`/blog/:slug`)**: Full article view with title, tag badge, published date, and rich HTML content. Back to blogs navigation. No login required.

### 4. Admin Blog Management

**Blog List (`/admin/blogs`)**: Table of all blogs (drafts + published) with title, tag, status, date. Create/edit/delete actions.

**Blog Editor (`/admin/blogs/new` and `/admin/blogs/:id`)**: Form with title (auto-generates slug), slug field, excerpt, content textarea, tag dropdown (Industry, Guide, News, Recipe, Update), cover image upload, status toggle (draft/published). Save button.

### 5. Navigation Updates
- Add "Blogs" to admin sidebar in DashboardLayout
- Add public routes `/blog` and `/blog/:slug`
- Add admin routes `/admin/blogs` and `/admin/blogs/:id`

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/Blog.tsx` | Public blog listing page |
| `src/pages/BlogDetail.tsx` | Public blog detail page |
| `src/pages/admin/Blogs.tsx` | Admin blog list and management |
| `src/pages/admin/BlogEdit.tsx` | Admin blog create/edit form |
| `src/hooks/useBlogs.ts` | Hook for fetching and managing blog posts |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/landing/CTA.tsx` | Fetch real blogs from database, link to `/blog/:slug` |
| `src/components/shared/DashboardLayout.tsx` | Add "Blogs" to admin sidebar nav |
| `src/App.tsx` | Add `/blog`, `/blog/:slug`, `/admin/blogs`, `/admin/blogs/:id` routes |

## Database Changes

### Migration: Create `blogs` table
```text
blogs table:
  id            uuid PK
  title         text NOT NULL
  slug          text UNIQUE NOT NULL
  excerpt       text
  content       text (full HTML content)
  cover_image_url  text
  tag           text (e.g. "Industry", "Guide")
  status        text DEFAULT 'draft'
  author_id     uuid
  published_at  timestamptz
  created_at    timestamptz DEFAULT now()
  updated_at    timestamptz DEFAULT now()

RLS:
  - "Anyone can view published blogs" SELECT where status = 'published'
  - "Admins can manage all blogs" ALL using has_role(auth.uid(), 'admin')

Trigger: update_updated_at on UPDATE
```

### Data Insert: Seed 5 blogs
After creating the table, insert all 5 blog posts with:
- Full HTML-formatted content from the PDF
- Auto-generated slugs (e.g. "supply-chain-management-qaqc-food-processing")
- Appropriate tags (Industry/Guide)
- Status set to "published"
- published_at set to current timestamp

## Technical Details

### Slug Generation
Auto-generate from title on the admin form. Example: "Supply Chain Management and QA/QC Checks" becomes "supply-chain-management-and-qaqc-checks"

### Content Format
Blog content will be stored as HTML with proper heading tags, lists, and paragraphs. The BlogDetail page will render this using `dangerouslySetInnerHTML` with appropriate styling via Tailwind's `prose` class.

### Admin Blog Editor
- Title input with auto-slug generation
- Slug field (editable)
- Excerpt textarea (short summary for cards)
- Content textarea (large, full article in HTML/markdown)
- Tag dropdown: Industry, Guide, News, Recipe, Update
- Cover image upload (uses existing storage buckets)
- Status toggle: Draft / Published
- Save button

### Landing Page CTA Update
- Query latest 2 published blogs ordered by published_at DESC
- Each card shows tag badge, title, excerpt
- Links to `/blog/{slug}`
- Falls back to placeholder if no blogs exist

