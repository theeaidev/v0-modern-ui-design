export interface Profile {
  id: string
  updated_at: string | null
  full_name: string | null
  phone: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  country: string | null
  bio: string | null
  website: string | null
  avatar_url: string | null
  is_business: boolean
  business_name: string | null
  business_type: string | null
  business_description: string | null
  business_website: string | null
  business_phone: string | null
  business_address: string | null
  business_city: string | null
  business_postal_code: string | null
  business_country: string | null
  business_logo_url: string | null
  is_verified: boolean
  verification_date: string | null
  preferences: Record<string, any> | null
}

export interface ProfileFormData {
  full_name: string
  phone: string
  address: string
  city: string
  postal_code: string
  country: string
  bio: string
  website: string
  is_business: boolean
  business_name?: string
  business_type?: string
  business_description?: string
  business_website?: string
  business_phone?: string
  business_address?: string
  business_city?: string
  business_postal_code?: string
  business_country?: string
}
