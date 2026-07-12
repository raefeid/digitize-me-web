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
      auth_pages: {
        Row: {
          background_gradient_from: string | null
          background_gradient_to: string | null
          background_image_url: string | null
          background_overlay_opacity: number
          brand_badge: string | null
          brand_badge_ar: string | null
          brand_benefits: Json
          brand_benefits_ar: Json
          brand_footer_text: string | null
          brand_footer_text_ar: string | null
          brand_headline: string | null
          brand_headline_ar: string | null
          created_at: string
          divider_text: string | null
          divider_text_ar: string | null
          email_label: string | null
          email_label_ar: string | null
          email_placeholder: string | null
          email_placeholder_ar: string | null
          footer_link_enabled: boolean
          footer_link_label: string | null
          footer_link_label_ar: string | null
          footer_link_url: string | null
          footer_prefix: string | null
          footer_prefix_ar: string | null
          forgot_link_enabled: boolean
          forgot_link_label: string | null
          forgot_link_label_ar: string | null
          full_name_label: string | null
          full_name_label_ar: string | null
          full_name_placeholder: string | null
          full_name_placeholder_ar: string | null
          google_enabled: boolean
          google_label: string | null
          google_label_ar: string | null
          id: string
          illustration_alignment: string
          illustration_max_width: number
          illustration_url: string | null
          logo_position: string
          logo_url: string | null
          logo_visible: boolean
          page_key: string
          password_label: string | null
          password_label_ar: string | null
          password_placeholder: string | null
          password_placeholder_ar: string | null
          pattern_overlay: string
          pattern_overlay_opacity: number
          show_brand_panel: boolean
          show_terms_checkbox: boolean
          submit_bg_color: string | null
          submit_full_width: boolean
          submit_hover_bg_color: string | null
          submit_label: string
          submit_label_ar: string | null
          submit_loading_label: string | null
          submit_loading_label_ar: string | null
          submit_radius: string
          submit_shadow: string
          submit_size: string
          submit_text_color: string | null
          submit_variant: string
          subtitle: string | null
          subtitle_ar: string | null
          terms_text: string | null
          terms_text_ar: string | null
          title: string
          title_ar: string | null
          updated_at: string
        }
        Insert: {
          background_gradient_from?: string | null
          background_gradient_to?: string | null
          background_image_url?: string | null
          background_overlay_opacity?: number
          brand_badge?: string | null
          brand_badge_ar?: string | null
          brand_benefits?: Json
          brand_benefits_ar?: Json
          brand_footer_text?: string | null
          brand_footer_text_ar?: string | null
          brand_headline?: string | null
          brand_headline_ar?: string | null
          created_at?: string
          divider_text?: string | null
          divider_text_ar?: string | null
          email_label?: string | null
          email_label_ar?: string | null
          email_placeholder?: string | null
          email_placeholder_ar?: string | null
          footer_link_enabled?: boolean
          footer_link_label?: string | null
          footer_link_label_ar?: string | null
          footer_link_url?: string | null
          footer_prefix?: string | null
          footer_prefix_ar?: string | null
          forgot_link_enabled?: boolean
          forgot_link_label?: string | null
          forgot_link_label_ar?: string | null
          full_name_label?: string | null
          full_name_label_ar?: string | null
          full_name_placeholder?: string | null
          full_name_placeholder_ar?: string | null
          google_enabled?: boolean
          google_label?: string | null
          google_label_ar?: string | null
          id?: string
          illustration_alignment?: string
          illustration_max_width?: number
          illustration_url?: string | null
          logo_position?: string
          logo_url?: string | null
          logo_visible?: boolean
          page_key: string
          password_label?: string | null
          password_label_ar?: string | null
          password_placeholder?: string | null
          password_placeholder_ar?: string | null
          pattern_overlay?: string
          pattern_overlay_opacity?: number
          show_brand_panel?: boolean
          show_terms_checkbox?: boolean
          submit_bg_color?: string | null
          submit_full_width?: boolean
          submit_hover_bg_color?: string | null
          submit_label?: string
          submit_label_ar?: string | null
          submit_loading_label?: string | null
          submit_loading_label_ar?: string | null
          submit_radius?: string
          submit_shadow?: string
          submit_size?: string
          submit_text_color?: string | null
          submit_variant?: string
          subtitle?: string | null
          subtitle_ar?: string | null
          terms_text?: string | null
          terms_text_ar?: string | null
          title?: string
          title_ar?: string | null
          updated_at?: string
        }
        Update: {
          background_gradient_from?: string | null
          background_gradient_to?: string | null
          background_image_url?: string | null
          background_overlay_opacity?: number
          brand_badge?: string | null
          brand_badge_ar?: string | null
          brand_benefits?: Json
          brand_benefits_ar?: Json
          brand_footer_text?: string | null
          brand_footer_text_ar?: string | null
          brand_headline?: string | null
          brand_headline_ar?: string | null
          created_at?: string
          divider_text?: string | null
          divider_text_ar?: string | null
          email_label?: string | null
          email_label_ar?: string | null
          email_placeholder?: string | null
          email_placeholder_ar?: string | null
          footer_link_enabled?: boolean
          footer_link_label?: string | null
          footer_link_label_ar?: string | null
          footer_link_url?: string | null
          footer_prefix?: string | null
          footer_prefix_ar?: string | null
          forgot_link_enabled?: boolean
          forgot_link_label?: string | null
          forgot_link_label_ar?: string | null
          full_name_label?: string | null
          full_name_label_ar?: string | null
          full_name_placeholder?: string | null
          full_name_placeholder_ar?: string | null
          google_enabled?: boolean
          google_label?: string | null
          google_label_ar?: string | null
          id?: string
          illustration_alignment?: string
          illustration_max_width?: number
          illustration_url?: string | null
          logo_position?: string
          logo_url?: string | null
          logo_visible?: boolean
          page_key?: string
          password_label?: string | null
          password_label_ar?: string | null
          password_placeholder?: string | null
          password_placeholder_ar?: string | null
          pattern_overlay?: string
          pattern_overlay_opacity?: number
          show_brand_panel?: boolean
          show_terms_checkbox?: boolean
          submit_bg_color?: string | null
          submit_full_width?: boolean
          submit_hover_bg_color?: string | null
          submit_label?: string
          submit_label_ar?: string | null
          submit_loading_label?: string | null
          submit_loading_label_ar?: string | null
          submit_radius?: string
          submit_shadow?: string
          submit_size?: string
          submit_text_color?: string | null
          submit_variant?: string
          subtitle?: string | null
          subtitle_ar?: string | null
          terms_text?: string | null
          terms_text_ar?: string | null
          title?: string
          title_ar?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          description_ar: string | null
          id: string
          name: string
          name_ar: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          name: string
          name_ar?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          name?: string
          name_ar?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          content_ar: string | null
          created_at: string
          excerpt: string | null
          excerpt_ar: string | null
          featured_image_url: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          title_ar: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          content_ar?: string | null
          created_at?: string
          excerpt?: string | null
          excerpt_ar?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          title_ar?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          content_ar?: string | null
          created_at?: string
          excerpt?: string | null
          excerpt_ar?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          title_ar?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      client_logos: {
        Row: {
          company_name: string
          created_at: string
          id: string
          link_url: string | null
          logo_url: string
          published: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          id?: string
          link_url?: string | null
          logo_url: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          id?: string
          link_url?: string | null
          logo_url?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      custom_pages: {
        Row: {
          blocks: Json
          blocks_ar: Json
          created_at: string
          id: string
          published_at: string | null
          seo_description: string | null
          seo_description_ar: string | null
          seo_og_image: string | null
          seo_title: string | null
          seo_title_ar: string | null
          slug: string
          status: string
          title: string
          title_ar: string | null
          updated_at: string
        }
        Insert: {
          blocks?: Json
          blocks_ar?: Json
          created_at?: string
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_description_ar?: string | null
          seo_og_image?: string | null
          seo_title?: string | null
          seo_title_ar?: string | null
          slug: string
          status?: string
          title?: string
          title_ar?: string | null
          updated_at?: string
        }
        Update: {
          blocks?: Json
          blocks_ar?: Json
          created_at?: string
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_description_ar?: string | null
          seo_og_image?: string | null
          seo_title?: string | null
          seo_title_ar?: string | null
          slug?: string
          status?: string
          title?: string
          title_ar?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      features: {
        Row: {
          created_at: string
          cta_primary_label: string | null
          cta_primary_label_ar: string | null
          cta_primary_link: string | null
          cta_secondary_label: string | null
          cta_secondary_label_ar: string | null
          cta_secondary_link: string | null
          hero_badge: string | null
          hero_badge_ar: string | null
          hero_desc: string | null
          hero_desc_ar: string | null
          hero_image_url: string | null
          hero_title: string
          hero_title_ar: string | null
          icon: string | null
          id: string
          published: boolean
          sections: Json
          sections_ar: Json
          seo_description: string | null
          seo_description_ar: string | null
          seo_og_image: string | null
          seo_title: string | null
          seo_title_ar: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_primary_label?: string | null
          cta_primary_label_ar?: string | null
          cta_primary_link?: string | null
          cta_secondary_label?: string | null
          cta_secondary_label_ar?: string | null
          cta_secondary_link?: string | null
          hero_badge?: string | null
          hero_badge_ar?: string | null
          hero_desc?: string | null
          hero_desc_ar?: string | null
          hero_image_url?: string | null
          hero_title?: string
          hero_title_ar?: string | null
          icon?: string | null
          id?: string
          published?: boolean
          sections?: Json
          sections_ar?: Json
          seo_description?: string | null
          seo_description_ar?: string | null
          seo_og_image?: string | null
          seo_title?: string | null
          seo_title_ar?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_primary_label?: string | null
          cta_primary_label_ar?: string | null
          cta_primary_link?: string | null
          cta_secondary_label?: string | null
          cta_secondary_label_ar?: string | null
          cta_secondary_link?: string | null
          hero_badge?: string | null
          hero_badge_ar?: string | null
          hero_desc?: string | null
          hero_desc_ar?: string | null
          hero_image_url?: string | null
          hero_title?: string
          hero_title_ar?: string | null
          icon?: string | null
          id?: string
          published?: boolean
          sections?: Json
          sections_ar?: Json
          seo_description?: string | null
          seo_description_ar?: string | null
          seo_og_image?: string | null
          seo_title?: string | null
          seo_title_ar?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      industries: {
        Row: {
          after_text: string
          after_text_ar: string | null
          before_text: string
          before_text_ar: string | null
          created_at: string
          cta: string
          cta_ar: string | null
          description: string
          description_ar: string | null
          headline: string
          headline_ar: string | null
          icon: string
          id: string
          is_hardcoded: boolean
          name: string
          name_ar: string | null
          pain_points: Json
          pain_points_ar: Json
          published: boolean
          slug: string
          solutions: Json
          solutions_ar: Json
          sort_order: number
          updated_at: string
          use_cases: Json
          use_cases_ar: Json
        }
        Insert: {
          after_text?: string
          after_text_ar?: string | null
          before_text?: string
          before_text_ar?: string | null
          created_at?: string
          cta?: string
          cta_ar?: string | null
          description?: string
          description_ar?: string | null
          headline?: string
          headline_ar?: string | null
          icon?: string
          id?: string
          is_hardcoded?: boolean
          name: string
          name_ar?: string | null
          pain_points?: Json
          pain_points_ar?: Json
          published?: boolean
          slug: string
          solutions?: Json
          solutions_ar?: Json
          sort_order?: number
          updated_at?: string
          use_cases?: Json
          use_cases_ar?: Json
        }
        Update: {
          after_text?: string
          after_text_ar?: string | null
          before_text?: string
          before_text_ar?: string | null
          created_at?: string
          cta?: string
          cta_ar?: string | null
          description?: string
          description_ar?: string | null
          headline?: string
          headline_ar?: string | null
          icon?: string
          id?: string
          is_hardcoded?: boolean
          name?: string
          name_ar?: string | null
          pain_points?: Json
          pain_points_ar?: Json
          published?: boolean
          slug?: string
          solutions?: Json
          solutions_ar?: Json
          sort_order?: number
          updated_at?: string
          use_cases?: Json
          use_cases_ar?: Json
        }
        Relationships: []
      }
      industry_faqs: {
        Row: {
          answer: string
          answer_ar: string | null
          created_at: string
          id: string
          industry_slug: string
          published: boolean
          question: string
          question_ar: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          answer_ar?: string | null
          created_at?: string
          id?: string
          industry_slug: string
          published?: boolean
          question: string
          question_ar?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          answer_ar?: string | null
          created_at?: string
          id?: string
          industry_slug?: string
          published?: boolean
          question?: string
          question_ar?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      industry_seo_landing: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_label_ar: string | null
          cta_link: string | null
          enabled: boolean
          h1: string | null
          h1_ar: string | null
          id: string
          industry_slug: string
          intro: string | null
          intro_ar: string | null
          related_blog_slugs: string[]
          related_feature_slugs: string[]
          related_industry_slugs: string[]
          sections: Json
          seo_canonical_url: string | null
          seo_description: string | null
          seo_description_ar: string | null
          seo_keywords: string[]
          seo_og_image: string | null
          seo_title: string | null
          seo_title_ar: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_label_ar?: string | null
          cta_link?: string | null
          enabled?: boolean
          h1?: string | null
          h1_ar?: string | null
          id?: string
          industry_slug: string
          intro?: string | null
          intro_ar?: string | null
          related_blog_slugs?: string[]
          related_feature_slugs?: string[]
          related_industry_slugs?: string[]
          sections?: Json
          seo_canonical_url?: string | null
          seo_description?: string | null
          seo_description_ar?: string | null
          seo_keywords?: string[]
          seo_og_image?: string | null
          seo_title?: string | null
          seo_title_ar?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_label_ar?: string | null
          cta_link?: string | null
          enabled?: boolean
          h1?: string | null
          h1_ar?: string | null
          id?: string
          industry_slug?: string
          intro?: string | null
          intro_ar?: string | null
          related_blog_slugs?: string[]
          related_feature_slugs?: string[]
          related_industry_slugs?: string[]
          sections?: Json
          seo_canonical_url?: string | null
          seo_description?: string | null
          seo_description_ar?: string | null
          seo_keywords?: string[]
          seo_og_image?: string | null
          seo_title?: string | null
          seo_title_ar?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          category: Database["public"]["Enums"]["integration_category"]
          created_at: string
          cta_label: string | null
          cta_label_ar: string | null
          cta_link: string | null
          description: string | null
          description_ar: string | null
          id: string
          logo_url: string | null
          name: string
          name_ar: string | null
          published: boolean
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["integration_status"]
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["integration_category"]
          created_at?: string
          cta_label?: string | null
          cta_label_ar?: string | null
          cta_link?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string
          logo_url?: string | null
          name: string
          name_ar?: string | null
          published?: boolean
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["integration_status"]
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["integration_category"]
          created_at?: string
          cta_label?: string | null
          cta_label_ar?: string | null
          cta_link?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          name_ar?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["integration_status"]
          updated_at?: string
        }
        Relationships: []
      }
      invited_team_members: {
        Row: {
          accepted_at: string | null
          accepted_user_id: string | null
          email: string
          id: string
          invited_at: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          email: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          email?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      leads: {
        Row: {
          company: string | null
          company_size: string | null
          created_at: string
          cta_source: string | null
          full_name: string
          id: string
          industry: string | null
          message: string | null
          page_path: string | null
          phone: string | null
          status: string
          updated_at: string
          use_case: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          work_email: string
        }
        Insert: {
          company?: string | null
          company_size?: string | null
          created_at?: string
          cta_source?: string | null
          full_name: string
          id?: string
          industry?: string | null
          message?: string | null
          page_path?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          use_case?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          work_email: string
        }
        Update: {
          company?: string | null
          company_size?: string | null
          created_at?: string
          cta_source?: string | null
          full_name?: string
          id?: string
          industry?: string | null
          message?: string | null
          page_path?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          use_case?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          work_email?: string
        }
        Relationships: []
      }
      nav_auth_buttons: {
        Row: {
          button_key: string
          created_at: string
          custom_bg_color: string | null
          custom_text_color: string | null
          helper_caption: string | null
          helper_caption_ar: string | null
          id: string
          label: string
          label_ar: string | null
          link: string
          sort_order: number
          updated_at: string
          variant: string
          visible: boolean
        }
        Insert: {
          button_key: string
          created_at?: string
          custom_bg_color?: string | null
          custom_text_color?: string | null
          helper_caption?: string | null
          helper_caption_ar?: string | null
          id?: string
          label?: string
          label_ar?: string | null
          link?: string
          sort_order?: number
          updated_at?: string
          variant?: string
          visible?: boolean
        }
        Update: {
          button_key?: string
          created_at?: string
          custom_bg_color?: string | null
          custom_text_color?: string | null
          helper_caption?: string | null
          helper_caption_ar?: string | null
          id?: string
          label?: string
          label_ar?: string | null
          link?: string
          sort_order?: number
          updated_at?: string
          variant?: string
          visible?: boolean
        }
        Relationships: []
      }
      nav_items: {
        Row: {
          created_at: string
          custom_page_id: string | null
          external_url: string | null
          footer_column: string | null
          id: string
          label: string
          label_ar: string | null
          location: string
          open_in_new_tab: boolean
          parent_id: string | null
          published: boolean
          sort_order: number
          target_route: string | null
          target_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_page_id?: string | null
          external_url?: string | null
          footer_column?: string | null
          id?: string
          label: string
          label_ar?: string | null
          location?: string
          open_in_new_tab?: boolean
          parent_id?: string | null
          published?: boolean
          sort_order?: number
          target_route?: string | null
          target_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_page_id?: string | null
          external_url?: string | null
          footer_column?: string | null
          id?: string
          label?: string
          label_ar?: string | null
          location?: string
          open_in_new_tab?: boolean
          parent_id?: string | null
          published?: boolean
          sort_order?: number
          target_route?: string | null
          target_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nav_items_custom_page_id_fkey"
            columns: ["custom_page_id"]
            isOneToOne: false
            referencedRelation: "custom_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nav_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "nav_items"
            referencedColumns: ["id"]
          },
        ]
      }
      personas: {
        Row: {
          created_at: string
          hero_badge: string | null
          hero_badge_ar: string | null
          hero_cta_primary: string | null
          hero_cta_primary_ar: string | null
          hero_cta_secondary: string | null
          hero_cta_secondary_ar: string | null
          hero_desc: string | null
          hero_desc_ar: string | null
          hero_title: string | null
          hero_title_ar: string | null
          icon: string | null
          id: string
          is_default: boolean
          label: string
          label_ar: string | null
          pain_points: Json
          pain_points_ar: Json
          published: boolean
          slug: string
          sort_order: number
          updated_at: string
          value_props: Json
          value_props_ar: Json
        }
        Insert: {
          created_at?: string
          hero_badge?: string | null
          hero_badge_ar?: string | null
          hero_cta_primary?: string | null
          hero_cta_primary_ar?: string | null
          hero_cta_secondary?: string | null
          hero_cta_secondary_ar?: string | null
          hero_desc?: string | null
          hero_desc_ar?: string | null
          hero_title?: string | null
          hero_title_ar?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean
          label: string
          label_ar?: string | null
          pain_points?: Json
          pain_points_ar?: Json
          published?: boolean
          slug: string
          sort_order?: number
          updated_at?: string
          value_props?: Json
          value_props_ar?: Json
        }
        Update: {
          created_at?: string
          hero_badge?: string | null
          hero_badge_ar?: string | null
          hero_cta_primary?: string | null
          hero_cta_primary_ar?: string | null
          hero_cta_secondary?: string | null
          hero_cta_secondary_ar?: string | null
          hero_desc?: string | null
          hero_desc_ar?: string | null
          hero_title?: string | null
          hero_title_ar?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean
          label?: string
          label_ar?: string | null
          pain_points?: Json
          pain_points_ar?: Json
          published?: boolean
          slug?: string
          sort_order?: number
          updated_at?: string
          value_props?: Json
          value_props_ar?: Json
        }
        Relationships: []
      }
      pricing_highlights: {
        Row: {
          badge_label: string | null
          badge_label_ar: string | null
          created_at: string
          cta_label_override: string | null
          cta_label_override_ar: string | null
          cta_link_override: string | null
          id: string
          most_popular: boolean
          plan_key: string
          updated_at: string
        }
        Insert: {
          badge_label?: string | null
          badge_label_ar?: string | null
          created_at?: string
          cta_label_override?: string | null
          cta_label_override_ar?: string | null
          cta_link_override?: string | null
          id?: string
          most_popular?: boolean
          plan_key: string
          updated_at?: string
        }
        Update: {
          badge_label?: string | null
          badge_label_ar?: string | null
          created_at?: string
          cta_label_override?: string | null
          cta_label_override_ar?: string | null
          cta_link_override?: string | null
          id?: string
          most_popular?: boolean
          plan_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_audit_log: {
        Row: {
          actor_email: string | null
          actor_id: string | null
          after_values: Json
          before_values: Json
          created_at: string
          fields_changed: string[]
          id: string
          mode: string
          page_id: string
          source: string
        }
        Insert: {
          actor_email?: string | null
          actor_id?: string | null
          after_values?: Json
          before_values?: Json
          created_at?: string
          fields_changed?: string[]
          id?: string
          mode?: string
          page_id: string
          source?: string
        }
        Update: {
          actor_email?: string | null
          actor_id?: string | null
          after_values?: Json
          before_values?: Json
          created_at?: string
          fields_changed?: string[]
          id?: string
          mode?: string
          page_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_audit_log_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "custom_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_score_snapshots: {
        Row: {
          actor_email: string | null
          actor_id: string | null
          created_at: string
          desc_length_score: number
          duplicate_risk_score: number
          id: string
          keyword_count: number
          keyword_coverage_score: number
          lang: string
          meta_description_length: number
          meta_title_length: number
          page_key: string
          page_label: string
          score: number
          title_length_score: number
        }
        Insert: {
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          desc_length_score?: number
          duplicate_risk_score?: number
          id?: string
          keyword_count?: number
          keyword_coverage_score?: number
          lang: string
          meta_description_length?: number
          meta_title_length?: number
          page_key: string
          page_label: string
          score: number
          title_length_score?: number
        }
        Update: {
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          desc_length_score?: number
          duplicate_risk_score?: number
          id?: string
          keyword_count?: number
          keyword_coverage_score?: number
          lang?: string
          meta_description_length?: number
          meta_title_length?: number
          page_key?: string
          page_label?: string
          score?: number
          title_length_score?: number
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_key: string
          content_type: string
          created_at: string
          id: string
          page: string
          section: string
          sort_order: number
          updated_at: string
          value: string
          value_ar: string | null
          value_fr: string | null
        }
        Insert: {
          content_key: string
          content_type?: string
          created_at?: string
          id?: string
          page: string
          section: string
          sort_order?: number
          updated_at?: string
          value?: string
          value_ar?: string | null
          value_fr?: string | null
        }
        Update: {
          content_key?: string
          content_type?: string
          created_at?: string
          id?: string
          page?: string
          section?: string
          sort_order?: number
          updated_at?: string
          value?: string
          value_ar?: string | null
          value_fr?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_name: string
          author_name_ar: string | null
          avatar_url: string | null
          company: string | null
          company_ar: string | null
          company_logo_url: string | null
          created_at: string
          featured: boolean
          id: string
          published: boolean
          quote: string
          quote_ar: string | null
          rating: number
          role: string | null
          role_ar: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          author_name: string
          author_name_ar?: string | null
          avatar_url?: string | null
          company?: string | null
          company_ar?: string | null
          company_logo_url?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          published?: boolean
          quote: string
          quote_ar?: string | null
          rating?: number
          role?: string | null
          role_ar?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          author_name?: string
          author_name_ar?: string | null
          avatar_url?: string | null
          company?: string | null
          company_ar?: string | null
          company_logo_url?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          published?: boolean
          quote?: string
          quote_ar?: string | null
          rating?: number
          role?: string | null
          role_ar?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "editor"
        | "seo_manager"
        | "blog_author"
        | "customer"
      integration_category:
        | "erp"
        | "crm"
        | "cloud_storage"
        | "productivity"
        | "custom_api"
      integration_status: "available" | "coming_soon" | "custom"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "editor",
        "seo_manager",
        "blog_author",
        "customer",
      ],
      integration_category: [
        "erp",
        "crm",
        "cloud_storage",
        "productivity",
        "custom_api",
      ],
      integration_status: ["available", "coming_soon", "custom"],
    },
  },
} as const
