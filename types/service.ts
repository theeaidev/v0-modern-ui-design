export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  created_at: string
  updated_at: string
}

export interface Subcategory {
  id: number
  category_id: number
  name: string
  slug: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface ServiceListing {
  id: string
  user_id: string
  title: string
  slug: string
  description: string
  long_description: string | null
  category_id: number
  subcategory_id: number | null
  price: string | null
  price_type: "fixed" | "hourly" | "daily" | "monthly" | "variable" | "free" | "contact"
  location: string | null
  city: string | null
  postal_code: string | null
  country: string
  address: string | null
  coordinates: string | null // Point data type from PostgreSQL
  contact_phone: string | null
  contact_email: string | null
  contact_whatsapp: string | null
  contact_website: string | null
  is_featured: boolean
  is_verified: boolean
  verification_date: string | null
  status: "draft" | "active" | "paused" | "expired" | "rejected"
  expiration_date: string | null
  views: number
  created_at: string
  updated_at: string
}

export interface ServiceImage {
  id: string
  service_id: string
  url: string
  alt_text: string | null
  is_primary: boolean
  display_order: number
  created_at: string
}

export interface ServiceTag {
  id: number
  name: string
  slug: string
  created_at: string
}

export interface Review {
  id: string
  service_id: string
  user_id: string
  rating: number
  comment: string | null
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface Favorite {
  user_id: string
  service_id: string
  created_at: string
}

export interface ServiceView {
  id: string
  service_id: string
  user_id: string | null
  ip_address: string | null
  user_agent: string | null
  viewed_at: string
}

export interface ServiceListingWithDetails extends ServiceListing {
  images: ServiceImage[]
  tags: ServiceTag[]
  category: Category
  subcategory: Subcategory | null
  user: {
    id: string
    full_name: string
    avatar_url: string | null
    is_verified: boolean
  }
  reviews_count: number
  average_rating: number
}

export interface ServiceListingFormData {
  title: string
  description: string
  long_description?: string
  category_id: number
  subcategory_id?: number
  price?: string
  price_type: "fixed" | "hourly" | "daily" | "monthly" | "variable" | "free" | "contact"
  location?: string
  city?: string
  postal_code?: string
  country: string
  address?: string
  contact_phone?: string
  contact_email?: string
  contact_whatsapp?: string
  contact_website?: string
  status: "draft" | "active" | "paused"
}
