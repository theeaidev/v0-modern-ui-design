"use server"

import { createServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import type { ServiceListingFormData } from "@/types/service"

// Get all service listings with pagination and filters
export async function getServiceListings({
  page = 1,
  limit = 12,
  category_id,
  subcategory_id,
  city,
  search,
  sort = "newest",
  user_id,
  status,
}: {
  page?: number
  limit?: number
  category_id?: number
  subcategory_id?: number
  city?: string
  search?: string
  sort?: "newest" | "oldest" | "price_low" | "price_high" | "popular"
  user_id?: string
  status?: "draft" | "active" | "paused" | "expired" | "rejected" | "pending_approval"
}) {
  try {
    const supabase = createServerClient()

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Start building the query
    let query = supabase.from("service_listings").select(
      `
        *,
        images:service_images(*),
        category:categories(*),
        subcategory:subcategories(*)
      `,
      { count: "exact" },
    )

    // Apply filters
    if (category_id) {
      query = query.eq("category_id", category_id)
    }

    if (subcategory_id) {
      query = query.eq("subcategory_id", subcategory_id)
    }

    if (city) {
      query = query.eq("city", city)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (user_id) {
      query = query.eq("user_id", user_id)
    }

    if (status) {
      query = query.eq("status", status)
    } else if (!user_id) {
      // If not filtering by user_id, only show active listings by default
      query = query.in("status", ["active"])
    }

    // Apply sorting
    switch (sort) {
      case "newest":
        query = query.order("created_at", { ascending: false })
        break
      case "oldest":
        query = query.order("created_at", { ascending: true })
        break
      case "price_low":
        query = query.order("price", { ascending: true })
        break
      case "price_high":
        query = query.order("price", { ascending: false })
        break
      case "popular":
        query = query.order("views", { ascending: false })
        break
      default:
        query = query.order("created_at", { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    // Minimal join test
    const minimalTest = await supabase
      .from("service_listings")
      .select("*, category:categories(*), subcategory:subcategories(*)")
    console.log("Minimal join test result:", JSON.stringify(minimalTest, null, 2))

    return {
      listings: data,
      total: count || 0,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    }
  } catch (error) {
    console.error("Error fetching service listings:", error)
    throw error
  }
}

// Get a single service listing by ID
export async function getServiceListingById(id: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("service_listings")
      .select(
        `
        *,
        images:service_images(*),
        category:categories(*),
        subcategory:subcategories(*),
        user:profiles(id, full_name, avatar_url, is_verified)
      `,
      )
      .eq("id", id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Get reviews count and average rating
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select("rating", { count: "exact" })
      .eq("service_id", id)
      .eq("is_approved", true)

    if (reviewsError) {
      throw new Error(reviewsError.message)
    }

    const reviews_count = reviewsData.length
    const average_rating =
      reviews_count > 0 ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviews_count : 0

    // Record a view
    await recordServiceView(id)

    return {
      ...data,
      reviews_count,
      average_rating,
    }
  } catch (error) {
    console.error("Error fetching service listing:", error)
    throw error
  }
}

// Record a view for a service listing
async function recordServiceView(serviceId: string) {
  try {
    const supabase = createServerClient()

    // Get the current user if logged in
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user?.id

    // Record the view
    await supabase.from("service_views").insert({
      service_id: serviceId,
      user_id: userId || null,
    })
  } catch (error) {
    // Silently fail if recording the view fails
    console.error("Error recording service view:", error)
  }
}

// Create a new service listing
export async function createServiceListing(formData: ServiceListingFormData) {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      throw new Error("Debes iniciar sesión para crear un anuncio")
    }

    // Generate a slug from the title
    const { data: slugData, error: slugError } = await supabase.rpc("generate_slug", { title: formData.title })

    if (slugError) {
      throw new Error(`Error al generar el slug: ${slugError.message}`)
    }

    const slug = slugData

    // Insert the service listing
    const { data, error } = await supabase
      .from("service_listings")
      .insert({
        user_id: session.user.id,
        title: formData.title,
        slug,
        description: formData.description,
        long_description: formData.long_description || null,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id || null,
        price: formData.price || null,
        price_type: formData.price_type,
        location: formData.location || null,
        city: formData.city || null,
        postal_code: formData.postal_code || null,
        country: formData.country,
        address: formData.address || null,
        contact_phone: formData.contact_phone || null,
        contact_email: formData.contact_email || null,
        contact_whatsapp: formData.contact_whatsapp || null,
        contact_website: formData.contact_website || null,
        status: formData.status,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear el anuncio: ${error.message}`)
    }

    revalidatePath("/servicios")
    revalidatePath("/dashboard/servicios")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating service listing:", error)
    throw error
  }
}

// Update an existing service listing
export async function updateServiceListing(id: string, formData: ServiceListingFormData) {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      throw new Error("You must be logged in to update a service listing")
    }

    // Check if the user owns the listing
    const { data: listing, error: listingError } = await supabase
      .from("service_listings")
      .select("user_id")
      .eq("id", id)
      .single()

    if (listingError) {
      throw new Error(listingError.message)
    }

    if (listing.user_id !== session.user.id) {
      throw new Error("You do not have permission to update this listing")
    }

    // Update the service listing
    const { data, error } = await supabase
      .from("service_listings")
      .update({
        title: formData.title,
        description: formData.description,
        long_description: formData.long_description || null,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id || null,
        price: formData.price || null,
        price_type: formData.price_type,
        location: formData.location || null,
        city: formData.city || null,
        postal_code: formData.postal_code || null,
        country: formData.country,
        address: formData.address || null,
        contact_phone: formData.contact_phone || null,
        contact_email: formData.contact_email || null,
        contact_whatsapp: formData.contact_whatsapp || null,
        contact_website: formData.contact_website || null,
        status: formData.status,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath("/servicios")
    revalidatePath(`/servicios/${id}`)
    revalidatePath("/dashboard/servicios")
    revalidatePath(`/dashboard/servicios/${id}`)

    return { success: true, data }
  } catch (error) {
    console.error("Error updating service listing:", error)
    throw error
  }
}

// Delete a service listing
export async function deleteServiceListing(id: string) {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      throw new Error("You must be logged in to delete a service listing")
    }

    // Check if the user owns the listing
    const { data: listing, error: listingError } = await supabase
      .from("service_listings")
      .select("user_id")
      .eq("id", id)
      .single()

    if (listingError) {
      throw new Error(listingError.message)
    }

    if (listing.user_id !== session.user.id) {
      throw new Error("You do not have permission to delete this listing")
    }

    // Delete the service listing
    const { error } = await supabase.from("service_listings").delete().eq("id", id)

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath("/servicios")
    revalidatePath("/dashboard/servicios")

    return { success: true }
  } catch (error) {
    console.error("Error deleting service listing:", error)
    throw error
  }
}

// Add or remove a service listing from favorites
export async function toggleFavorite(serviceId: string) {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      throw new Error("You must be logged in to favorite a listing")
    }

    // Check if the listing is already favorited
    const { data: favorite, error: favoriteError } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("service_id", serviceId)
      .maybeSingle()

    if (favoriteError) {
      throw new Error(favoriteError.message)
    }

    if (favorite) {
      // Remove from favorites
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", session.user.id)
        .eq("service_id", serviceId)

      if (error) {
        throw new Error(error.message)
      }

      return { success: true, favorited: false }
    } else {
      // Add to favorites
      const { error } = await supabase.from("favorites").insert({
        user_id: session.user.id,
        service_id: serviceId,
      })

      if (error) {
        throw new Error(error.message)
      }

      return { success: true, favorited: true }
    }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    throw error
  }
}

// Check if a service listing is favorited by the current user
export async function isFavorited(serviceId: string) {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return { favorited: false }
    }

    // Check if the listing is favorited
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("service_id", serviceId)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return { favorited: !!data }
  } catch (error) {
    console.error("Error checking if favorited:", error)
    throw error
  }
}

// Get all categories
export async function getCategories() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("categories").select("*").order("name")

    if (error) {
      console.error("Error fetching categories:", error)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      console.warn("No categories found in the database")
    }

    return data || []
  } catch (error) {
    console.error("Error fetching categories:", error)
    throw error
  }
}

// Get subcategories for a category
export async function getSubcategories(categoryId: number) {
  try {
    const supabase = createServerClient()

    if (!categoryId) {
      return []
    }

    const { data, error } = await supabase.from("subcategories").select("*").eq("category_id", categoryId).order("name")

    if (error) {
      console.error("Error fetching subcategories:", error)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      console.warn(`No subcategories found for category ID ${categoryId}`)
    }

    return data || []
  } catch (error) {
    console.error("Error fetching subcategories:", error)
    throw error
  }
}

// Add a review to a service listing
export async function addReview(serviceId: string, rating: number, comment: string) {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      throw new Error("You must be logged in to review a listing")
    }

    // Check if the user has already reviewed this listing
    const { data: existingReview, error: existingReviewError } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("service_id", serviceId)
      .maybeSingle()

    if (existingReviewError) {
      throw new Error(existingReviewError.message)
    }

    if (existingReview) {
      // Update the existing review
      const { error } = await supabase
        .from("reviews")
        .update({
          rating,
          comment,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingReview.id)

      if (error) {
        throw new Error(error.message)
      }
    } else {
      // Add a new review
      const { error } = await supabase.from("reviews").insert({
        service_id: serviceId,
        user_id: session.user.id,
        rating,
        comment,
      })

      if (error) {
        throw new Error(error.message)
      }
    }

    revalidatePath(`/servicios/${serviceId}`)

    return { success: true }
  } catch (error) {
    console.error("Error adding review:", error)
    throw error
  }
}

// Get reviews for a service listing
export async function getReviews(serviceId: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        user:profiles(id, full_name, avatar_url)
      `,
      )
      .eq("service_id", serviceId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error("Error fetching reviews:", error)
    throw error
  }
}

// Approve or reject a service listing (admin only)
export async function moderateListing(id: string, action: "approve" | "reject", rejectionReason?: string) {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      throw new Error("Debes iniciar sesión para moderar anuncios")
    }

    // Check if the user is an admin
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      throw new Error(profileError.message)
    }

    if (!userProfile.is_admin) {
      throw new Error("No tienes permisos para moderar anuncios")
    }

    // Update the listing status
    const updateData =
      action === "approve"
        ? { status: "active", rejection_reason: null }
        : { status: "rejected", rejection_reason: rejectionReason || "No cumple con nuestras políticas" }

    const { data, error } = await supabase.from("service_listings").update(updateData).eq("id", id).select().single()

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath("/servicios")
    revalidatePath(`/servicios/${id}`)
    revalidatePath("/dashboard/servicios")
    revalidatePath(`/dashboard/servicios/${id}`)
    revalidatePath("/admin/listings/pending")

    return { success: true, data }
  } catch (error) {
    console.error("Error moderating listing:", error)
    throw error
  }
}
