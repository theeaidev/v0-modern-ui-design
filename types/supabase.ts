export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at?: string
          full_name?: string
          phone?: string
          address?: string
          city?: string
          postal_code?: string
          country?: string
          bio?: string
          website?: string
          avatar_url?: string
          is_business?: boolean
          business_name?: string
          business_type?: string
          business_description?: string
          business_website?: string
          business_phone?: string
          business_address?: string
          business_city?: string
          business_postal_code?: string
          business_country?: string
          business_logo_url?: string
          is_verified?: boolean
          verification_date?: string
          preferences?: Json
        }
        Insert: {
          id: string
          updated_at?: string
          full_name?: string
          phone?: string
          address?: string
          city?: string
          postal_code?: string
          country?: string
          bio?: string
          website?: string
          avatar_url?: string
          is_business?: boolean
          business_name?: string
          business_type?: string
          business_description?: string
          business_website?: string
          business_phone?: string
          business_address?: string
          business_city?: string
          business_postal_code?: string
          business_country?: string
          business_logo_url?: string
          is_verified?: boolean
          verification_date?: string
          preferences?: Json
        }
        Update: {
          id?: string
          updated_at?: string
          full_name?: string
          phone?: string
          address?: string
          city?: string
          postal_code?: string
          country?: string
          bio?: string
          website?: string
          avatar_url?: string
          is_business?: boolean
          business_name?: string
          business_type?: string
          business_description?: string
          business_website?: string
          business_phone?: string
          business_address?: string
          business_city?: string
          business_postal_code?: string
          business_country?: string
          business_logo_url?: string
          is_verified?: boolean
          verification_date?: string
          preferences?: Json
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          created_at: string
          updated_at: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subcategories: {
        Row: {
          id: string
          category_id: number
          name: string
          slug: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          category_id: number
          name: string
          slug: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Update: {
          id?: string
          category_id?: number
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
