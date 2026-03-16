

## Plan: Dynamic User Registration Form (Join FoodAdda)

This is a large feature. The signup flow will become: **Step 1: Choose Plan → Step 2: Select User Type & Fill Registration Form → Step 3: Create Account (email/password) → Step 4: Confirm Subscription**.

### Database Changes

**1. Create `registration_profiles` table** to store the detailed form data per user type:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users, nullable initially (set after account creation) |
| user_type | enum (b2b, b2c, horeca, franchise, recruitment) | Required |
| company_name | text | nullable |
| full_name | text | For recruitment |
| address, city, state, country | text | Common fields |
| google_location | text | Map link |
| phone, whatsapp | text | |
| email | text | |
| website | text | |
| gst_number | text | nullable |
| gst_verified | boolean | default false |
| fssai_number | text | nullable |
| product_description | text | B2B/B2C/Franchise |
| contact_person_name, contact_designation, contact_phone | text | |
| moq | text | B2B/B2C only |
| horeca_category | text | Hotel/Restaurant/Café/Catering |
| menu_description | text | HoReCa |
| preferred_franchise_location | text | Franchise |
| franchise_category | text | Franchise |
| qualification | text | Recruitment |
| years_experience | text | Recruitment |
| job_category | text | Recruitment |
| preferred_city | text | Recruitment |
| uploaded_photos | text[] | URLs |
| menu_upload_url | text | HoReCa |
| cv_url | text | Recruitment |
| passport_photo_url | text | Recruitment |
| aadhar_front_url, aadhar_back_url | text | Recruitment |
| terms_accepted | boolean | default false |
| created_at, updated_at | timestamptz | |

RLS: Users can insert/view/update their own records. Admins can view all.

**2. Create `registration_files` storage bucket** (public) for uploaded documents.

### Frontend Changes

**3. Create `src/components/registration/UserTypeSelector.tsx`**
- 5 selectable cards: B2B, B2C, HoReCa, Franchise, Recruitment
- Each with icon and short description

**4. Create `src/components/registration/RegistrationForm.tsx`**
- Dynamic form that renders different field sets based on selected user type
- Organized into logical sections (Business Info, Contact Info, Documents)
- File upload fields using existing `MultiImageUpload` pattern for photos, and single file uploads for CV/Aadhar/menu
- GST validation: client-side format check (15-char alphanumeric pattern `\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}`). Full API validation can be added later when a GST API key is available.
- Terms & Conditions checkbox at bottom
- Submit button disabled until T&C accepted
- Responsive grid layout (1 col mobile, 2 col desktop)

**5. Update `src/pages/Auth.tsx`**
- Change signup flow to 4 steps: Plan → Registration Form → Account Creation → Confirm Subscription
- Step 2 becomes the new registration form (user type selection + dynamic fields)
- Step 3 becomes email/password account creation
- Step 4 becomes subscription confirmation
- On final submission, save registration data to `registration_profiles` table linked to the new user

### Flow Summary

```text
Step 1: Choose Plan
Step 2: Select User Type → Fill Registration Form → Accept T&C
Step 3: Create Account (email + password)
Step 4: Confirm & Activate Subscription
```

### Notes
- GST validation will use regex pattern matching for now. A full GST API integration can be added later with a connector or API key.
- All file uploads go to a `registration_files` storage bucket.
- Form data is saved to `registration_profiles` after account creation in Step 3.

