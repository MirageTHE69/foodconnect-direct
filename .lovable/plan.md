## Plan: Recruitment / Jobs Module

### Overview
Public Jobs section: admins post jobs (with category from master list), users browse → view detail → apply via simple form **without login** (name, email, phone, resume). Admins see all applicants per job.

### 1. Database (migration)

**`job_categories`** — seeded from your PDF (14 main categories with sub-roles)
- name, parent_id (nullable for hierarchy), display_order

**`jobs`**
- title, company, location, job_type (full-time/part-time/contract/internship), category_id, experience_required, salary_range, description, requirements, responsibilities, is_active, expires_at
- RLS: anyone can view active jobs; only admins manage

**`job_applications`**
- job_id, full_name, email, phone, resume_url, cover_note (optional), status (new/reviewed/shortlisted/rejected), created_at
- **No user_id** — public/anonymous applies allowed
- RLS: anyone can INSERT; only admins can SELECT/UPDATE/DELETE

**Storage bucket** `resumes` (public read) — anyone can upload (PDF/DOC/DOCX, ≤5MB).

### 2. Public Pages (no auth, no subscription gate)

**`/jobs`** — Listing
- Search bar + filters (category, location, job_type)
- Card grid: title, company, location, type, posted date → "View Details"

**`/jobs/:id`** — Detail
- Full description, requirements, responsibilities, meta
- "Apply Now" button → opens dialog form:
  - Full name, email, phone, resume upload, optional cover note
  - Submit → uploads resume to `resumes` bucket → inserts `job_applications` row → success toast "Our team will contact you"

### 3. Admin Pages

**`/admin/jobs`** — list jobs, applicant counts, edit/delete, toggle active, "+ New Job"
**`/admin/jobs/new`** & **`/admin/jobs/:id/edit`** — create/edit job (category dropdown from master list)
**`/admin/jobs/:id/applications`** — table of applicants (name, email, phone, resume download, status dropdown, applied date)

### 4. Navigation
- Add "Jobs" / "Careers" link to landing Navbar (public, free)
- Add "Jobs" link to Admin sidebar

### 5. Routes (App.tsx)
```
/jobs                              public
/jobs/:id                          public
/admin/jobs                        admin
/admin/jobs/new                    admin
/admin/jobs/:id/edit               admin
/admin/jobs/:id/applications       admin
```

### Files
| File | Purpose |
|------|---------|
| `supabase/migrations/*_jobs.sql` | tables, bucket, RLS, seed 14 categories + sub-roles |
| `src/pages/Jobs.tsx` | Public listing |
| `src/pages/JobDetail.tsx` | Detail + apply dialog |
| `src/components/jobs/ApplyJobDialog.tsx` | Application form |
| `src/pages/admin/Jobs.tsx` | Admin manage |
| `src/pages/admin/JobEdit.tsx` | Create/edit |
| `src/pages/admin/JobApplications.tsx` | Applicants list |
| `src/App.tsx` | Routes |
| `src/components/landing/Navbar.tsx` | "Jobs" link |
| Admin sidebar | "Jobs" link |

### Categories seeded (from your PDF)
1. Culinary & Kitchen Operations · 2. Restaurant & Hospitality Staff · 3. Food Production & Processing · 4. Food Technology & R&D · 5. Quality Control & Assurance · 6. Packaging & Design · 7. Supply Chain, Logistics & Warehouse · 8. Sales, Marketing & Business Development · 9. Retail & Store Operations · 10. Maintenance & Engineering · 11. Agriculture & Raw Material Sourcing · 12. Compliance, Certifications & Regulatory · 13. Corporate & Support Functions · 14. Gig & Blue-Collar Roles

(All sub-roles from PDF stored as child rows so admin can pick specific role too.)

Reply "go ahead" to implement.
