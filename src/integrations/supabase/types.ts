export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blogs: {
        Row: {
          author_id: string | null
          content: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          display_order: number
          icon: string
          id: string
          is_active: boolean
          item_count: number
          name: string
          slug: string
          type: Database["public"]["Enums"]["category_type"]
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon?: string
          id?: string
          is_active?: boolean
          item_count?: number
          name: string
          slug: string
          type?: Database["public"]["Enums"]["category_type"]
        }
        Update: {
          created_at?: string
          display_order?: number
          icon?: string
          id?: string
          is_active?: boolean
          item_count?: number
          name?: string
          slug?: string
          type?: Database["public"]["Enums"]["category_type"]
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          last_message_at: string | null
          supplier_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          supplier_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      directory_vendors: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          sub_category_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          sub_category_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          sub_category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "directory_vendors_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "sub_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiries: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          message: string
          product_id: string | null
          status: string
          subject: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          message: string
          product_id?: string | null
          status?: string
          subject: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          message?: string
          product_id?: string | null
          status?: string
          subject?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hot_requirements: {
        Row: {
          budget_range: string | null
          category: string | null
          contact_user_id: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          location: string | null
          posted_by_admin: string | null
          quantity: string | null
          title: string
        }
        Insert: {
          budget_range?: string | null
          category?: string | null
          contact_user_id?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          posted_by_admin?: string | null
          quantity?: string | null
          title: string
        }
        Update: {
          budget_range?: string | null
          category?: string | null
          contact_user_id?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          posted_by_admin?: string | null
          quantity?: string | null
          title?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          cover_note: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          job_id: string
          phone: string
          resume_url: string | null
          status: string
        }
        Insert: {
          cover_note?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          job_id: string
          phone: string
          resume_url?: string | null
          status?: string
        }
        Update: {
          cover_note?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          job_id?: string
          phone?: string
          resume_url?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_categories: {
        Row: {
          created_at: string
          display_order: number
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "job_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          category_id: string | null
          company: string
          created_at: string
          description: string | null
          experience_required: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          job_type: string
          location: string | null
          requirements: string | null
          responsibilities: string | null
          salary_range: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          company: string
          created_at?: string
          description?: string | null
          experience_required?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          job_type?: string
          location?: string | null
          requirements?: string | null
          responsibilities?: string | null
          salary_range?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          company?: string
          created_at?: string
          description?: string | null
          experience_required?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          job_type?: string
          location?: string | null
          requirements?: string | null
          responsibilities?: string | null
          salary_range?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "job_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          name: string
          specifications: Json | null
          status: Database["public"]["Enums"]["product_status"]
          supplier_id: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          name: string
          specifications?: Json | null
          status?: Database["public"]["Enums"]["product_status"]
          supplier_id: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          name?: string
          specifications?: Json | null
          status?: Database["public"]["Enums"]["product_status"]
          supplier_id?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          created_at: string
          id: string
          ingredient_name: string
          product_id: string | null
          quantity: string | null
          recipe_id: string
          unit: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_name: string
          product_id?: string | null
          quantity?: string | null
          recipe_id: string
          unit?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_name?: string
          product_id?: string | null
          quantity?: string | null
          recipe_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          cook_time: number | null
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          images: string[] | null
          instructions: string | null
          pdf_url: string | null
          prep_time: number | null
          servings: number | null
          status: Database["public"]["Enums"]["product_status"]
          supplier_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          cook_time?: number | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          images?: string[] | null
          instructions?: string | null
          pdf_url?: string | null
          prep_time?: number | null
          servings?: number | null
          status?: Database["public"]["Enums"]["product_status"]
          supplier_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          cook_time?: number | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          images?: string[] | null
          instructions?: string | null
          pdf_url?: string | null
          prep_time?: number | null
          servings?: number | null
          status?: Database["public"]["Enums"]["product_status"]
          supplier_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_profiles: {
        Row: {
          aadhar_back_url: string | null
          aadhar_front_url: string | null
          address: string | null
          b2b_category: string | null
          certifications_text: string | null
          city: string | null
          company_name: string | null
          contact_designation: string | null
          contact_person_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          cv_url: string | null
          email: string | null
          export_capability: string | null
          franchise_category: string | null
          fssai_number: string | null
          full_name: string | null
          google_location: string | null
          gst_number: string | null
          gst_verified: boolean | null
          horeca_category: string | null
          id: string
          job_category: string | null
          logistics_support: string | null
          menu_description: string | null
          menu_upload_url: string | null
          moq: string | null
          passport_photo_url: string | null
          phone: string | null
          preferred_city: string | null
          preferred_franchise_location: string | null
          pricing_tier: string | null
          private_label: string | null
          product_description: string | null
          qualification: string | null
          state: string | null
          terms_accepted: boolean | null
          updated_at: string
          uploaded_photos: string[] | null
          user_id: string | null
          user_type: Database["public"]["Enums"]["user_type"]
          website: string | null
          whatsapp: string | null
          years_experience: string | null
        }
        Insert: {
          aadhar_back_url?: string | null
          aadhar_front_url?: string | null
          address?: string | null
          b2b_category?: string | null
          certifications_text?: string | null
          city?: string | null
          company_name?: string | null
          contact_designation?: string | null
          contact_person_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          cv_url?: string | null
          email?: string | null
          export_capability?: string | null
          franchise_category?: string | null
          fssai_number?: string | null
          full_name?: string | null
          google_location?: string | null
          gst_number?: string | null
          gst_verified?: boolean | null
          horeca_category?: string | null
          id?: string
          job_category?: string | null
          logistics_support?: string | null
          menu_description?: string | null
          menu_upload_url?: string | null
          moq?: string | null
          passport_photo_url?: string | null
          phone?: string | null
          preferred_city?: string | null
          preferred_franchise_location?: string | null
          pricing_tier?: string | null
          private_label?: string | null
          product_description?: string | null
          qualification?: string | null
          state?: string | null
          terms_accepted?: boolean | null
          updated_at?: string
          uploaded_photos?: string[] | null
          user_id?: string | null
          user_type: Database["public"]["Enums"]["user_type"]
          website?: string | null
          whatsapp?: string | null
          years_experience?: string | null
        }
        Update: {
          aadhar_back_url?: string | null
          aadhar_front_url?: string | null
          address?: string | null
          b2b_category?: string | null
          certifications_text?: string | null
          city?: string | null
          company_name?: string | null
          contact_designation?: string | null
          contact_person_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          cv_url?: string | null
          email?: string | null
          export_capability?: string | null
          franchise_category?: string | null
          fssai_number?: string | null
          full_name?: string | null
          google_location?: string | null
          gst_number?: string | null
          gst_verified?: boolean | null
          horeca_category?: string | null
          id?: string
          job_category?: string | null
          logistics_support?: string | null
          menu_description?: string | null
          menu_upload_url?: string | null
          moq?: string | null
          passport_photo_url?: string | null
          phone?: string | null
          preferred_city?: string | null
          preferred_franchise_location?: string | null
          pricing_tier?: string | null
          private_label?: string | null
          product_description?: string | null
          qualification?: string | null
          state?: string | null
          terms_accepted?: boolean | null
          updated_at?: string
          uploaded_photos?: string[] | null
          user_id?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
          website?: string | null
          whatsapp?: string | null
          years_experience?: string | null
        }
        Relationships: []
      }
      saved_products: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_suppliers: {
        Row: {
          created_at: string
          id: string
          supplier_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          supplier_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          supplier_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_suppliers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_categories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          business_category:
            | Database["public"]["Enums"]["business_category"]
            | null
          code: string
          created_at: string
          credits_per_month: number | null
          description: string | null
          features: string[] | null
          gst_percent: number
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          price_annual: number
          price_monthly: number
          sort_order: number | null
        }
        Insert: {
          business_category?:
            | Database["public"]["Enums"]["business_category"]
            | null
          code: string
          created_at?: string
          credits_per_month?: number | null
          description?: string | null
          features?: string[] | null
          gst_percent?: number
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          price_annual?: number
          price_monthly?: number
          sort_order?: number | null
        }
        Update: {
          business_category?:
            | Database["public"]["Enums"]["business_category"]
            | null
          code?: string
          created_at?: string
          credits_per_month?: number | null
          description?: string | null
          features?: string[] | null
          gst_percent?: number
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          price_annual?: number
          price_monthly?: number
          sort_order?: number | null
        }
        Relationships: []
      }
      supplier_profiles: {
        Row: {
          address: string | null
          business_category:
            | Database["public"]["Enums"]["business_category"]
            | null
          business_description: string | null
          certifications: string[] | null
          city: string | null
          company_name: string
          contact_person_name: string | null
          cover_image_url: string | null
          created_at: string
          email: string | null
          export_capability: string | null
          fssai_number: string | null
          gst_number: string | null
          id: string
          is_featured: boolean | null
          logo_url: string | null
          manufacturing_capability: string | null
          market_reputation: string | null
          moq: string | null
          phone: string | null
          pincode: string | null
          reputation_score: number | null
          specialty: string | null
          specialty_tags: string[] | null
          state: string | null
          updated_at: string
          user_id: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          website: string | null
          years_in_business: number | null
        }
        Insert: {
          address?: string | null
          business_category?:
            | Database["public"]["Enums"]["business_category"]
            | null
          business_description?: string | null
          certifications?: string[] | null
          city?: string | null
          company_name: string
          contact_person_name?: string | null
          cover_image_url?: string | null
          created_at?: string
          email?: string | null
          export_capability?: string | null
          fssai_number?: string | null
          gst_number?: string | null
          id?: string
          is_featured?: boolean | null
          logo_url?: string | null
          manufacturing_capability?: string | null
          market_reputation?: string | null
          moq?: string | null
          phone?: string | null
          pincode?: string | null
          reputation_score?: number | null
          specialty?: string | null
          specialty_tags?: string[] | null
          state?: string | null
          updated_at?: string
          user_id: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
          years_in_business?: number | null
        }
        Update: {
          address?: string | null
          business_category?:
            | Database["public"]["Enums"]["business_category"]
            | null
          business_description?: string | null
          certifications?: string[] | null
          city?: string | null
          company_name?: string
          contact_person_name?: string | null
          cover_image_url?: string | null
          created_at?: string
          email?: string | null
          export_capability?: string | null
          fssai_number?: string | null
          gst_number?: string | null
          id?: string
          is_featured?: boolean | null
          logo_url?: string | null
          manufacturing_capability?: string | null
          market_reputation?: string | null
          moq?: string | null
          phone?: string | null
          pincode?: string | null
          reputation_score?: number | null
          specialty?: string | null
          specialty_tags?: string[] | null
          state?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      supplier_unlocks: {
        Row: {
          billing_period_start: string
          buyer_user_id: string
          id: string
          subscription_id: string | null
          supplier_id: string
          unlocked_at: string
        }
        Insert: {
          billing_period_start: string
          buyer_user_id: string
          id?: string
          subscription_id?: string | null
          supplier_id: string
          unlocked_at?: string
        }
        Update: {
          billing_period_start?: string
          buyer_user_id?: string
          id?: string
          subscription_id?: string | null
          supplier_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_unlocks_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_unlocks_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          notes: string | null
          phone: string
          resume_url: string
          skills: string[]
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          notes?: string | null
          phone: string
          resume_url: string
          skills?: string[]
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string
          resume_url?: string
          skills?: string[]
          status?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          company: string | null
          content: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          rating: number | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          content: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          rating?: number | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          content?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          rating?: number | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          admin_notes: string | null
          amount_paid: number | null
          billing_cycle: string
          billing_state: string | null
          cgst_amount: number
          created_at: string
          expires_at: string | null
          gateway_order_id: string | null
          gst_rate: number
          id: string
          igst_amount: number
          invoice_number: string | null
          payment_provider: string
          payment_reference: string | null
          payment_status: string
          plan_id: string
          sgst_amount: number
          starts_at: string | null
          status: string
          taxable_value: number | null
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          admin_notes?: string | null
          amount_paid?: number | null
          billing_cycle?: string
          billing_state?: string | null
          cgst_amount?: number
          created_at?: string
          expires_at?: string | null
          gateway_order_id?: string | null
          gst_rate?: number
          id?: string
          igst_amount?: number
          invoice_number?: string | null
          payment_provider?: string
          payment_reference?: string | null
          payment_status?: string
          plan_id: string
          sgst_amount?: number
          starts_at?: string | null
          status?: string
          taxable_value?: number | null
          user_id: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          admin_notes?: string | null
          amount_paid?: number | null
          billing_cycle?: string
          billing_state?: string | null
          cgst_amount?: number
          created_at?: string
          expires_at?: string | null
          gateway_order_id?: string | null
          gst_rate?: number
          id?: string
          igst_amount?: number
          invoice_number?: string | null
          payment_provider?: string
          payment_reference?: string | null
          payment_status?: string
          plan_id?: string
          sgst_amount?: number
          starts_at?: string | null
          status?: string
          taxable_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      unlock_supplier: {
        Args: { _supplier_id: string }
        Returns: {
          credits_remaining: number
          reason: string
          unlocked: boolean
        }[]
      }
    }
    Enums: {
      app_role: "buyer" | "supplier" | "admin"
      business_category:
        | "founders"
        | "women_enterprise"
        | "north_east_startups"
        | "micro_first_time"
        | "small_homemade_food"
      category_type: "product" | "service"
      plan_type: "free" | "category_credit" | "universal_tier"
      product_status: "pending" | "approved" | "rejected"
      user_type: "b2b" | "b2c" | "horeca" | "franchise" | "recruitment"
      verification_status: "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["buyer", "supplier", "admin"],
      business_category: [
        "founders",
        "women_enterprise",
        "north_east_startups",
        "micro_first_time",
        "small_homemade_food",
      ],
      category_type: ["product", "service"],
      plan_type: ["free", "category_credit", "universal_tier"],
      product_status: ["pending", "approved", "rejected"],
      user_type: ["b2b", "b2c", "horeca", "franchise", "recruitment"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
