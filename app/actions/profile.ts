"use server"

import { createServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function getProfile() {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Error fetching user or user not found:", userError)
      return { profile: null, error: userError || new Error("User not found") }
    }

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching profile:", profileError)
      return { profile: null, error: profileError }
    }

    // If profile doesn't exist, return a default profile with the user ID
    return {
      profile: profile || { id: user.id },
      error: null,
    }
  } catch (error) {
    console.error("Unexpected error in getProfile:", error)
    return { profile: null, error }
  }
}

export async function updateProfile(formData: FormData) {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Error fetching user or user not found:", userError)
      return { success: false, error: userError || "User not found" }
    }

    // Extract profile data from form
    const profileData = {
      id: user.id,
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      postal_code: formData.get("postal_code") as string,
      country: (formData.get("country") as string) || "España",
      bio: formData.get("bio") as string,
      website: formData.get("website") as string,
      is_business: formData.get("is_business") === "true",
    }

    // Add business data if is_business is true
    if (profileData.is_business) {
      Object.assign(profileData, {
        business_name: formData.get("business_name") as string,
        business_type: formData.get("business_type") as string,
        business_description: formData.get("business_description") as string,
        business_website: formData.get("business_website") as string,
        business_phone: formData.get("business_phone") as string,
        business_address: formData.get("business_address") as string,
        business_city: formData.get("business_city") as string,
        business_postal_code: formData.get("business_postal_code") as string,
        business_country: (formData.get("business_country") as string) || "España",
      })
    }

    // Update the profile
    const { error: updateError } = await supabase.from("profiles").upsert(profileData, { onConflict: "id" })

    if (updateError) {
      console.error("Error updating profile:", updateError)
      return { success: false, error: updateError }
    }

    // Update user metadata in auth
    const { error: updateUserError } = await supabase.auth.updateUser({
      data: {
        full_name: profileData.full_name,
        is_business: profileData.is_business,
      },
    })

    if (updateUserError) {
      console.error("Error updating user metadata:", updateUserError)
      // Continue anyway as the profile was updated successfully
    }

    // Revalidate the profile page
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/profile")

    return { success: true, error: null }
  } catch (error) {
    console.error("Unexpected error in updateProfile:", error)
    return { success: false, error }
  }
}

// Upload avatar image
export async function uploadAvatar(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated", avatarUrl: null }
  }

  const file = formData.get("avatar") as File

  if (!file) {
    return { error: "No file provided", avatarUrl: null }
  }

  // Create a unique file name
  const fileExt = file.name.split(".").pop()
  const fileName = `${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
  const filePath = `avatars/${fileName}`

  // Upload the file to Supabase Storage
  const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError)
    return { error: uploadError.message, avatarUrl: null }
  }

  // Get the public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath)

  // Update the user's profile with the new avatar URL
  const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id)

  if (updateError) {
    console.error("Error updating profile with avatar:", updateError)
    return { error: updateError.message, avatarUrl: null }
  }

  // Revalidate the profile page to show updated avatar
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/profile")

  return { error: null, avatarUrl: publicUrl }
}

// Upload business logo
export async function uploadBusinessLogo(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated", logoUrl: null }
  }

  const file = formData.get("logo") as File

  if (!file) {
    return { error: "No file provided", logoUrl: null }
  }

  // Create a unique file name
  const fileExt = file.name.split(".").pop()
  const fileName = `business-${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
  const filePath = `logos/${fileName}`

  // Upload the file to Supabase Storage
  const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

  if (uploadError) {
    console.error("Error uploading logo:", uploadError)
    return { error: uploadError.message, logoUrl: null }
  }

  // Get the public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath)

  // Update the user's profile with the new logo URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ business_logo_url: publicUrl })
    .eq("id", user.id)

  if (updateError) {
    console.error("Error updating profile with logo:", updateError)
    return { error: updateError.message, logoUrl: null }
  }

  // Revalidate the profile page to show updated logo
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/profile")

  return { error: null, logoUrl: publicUrl }
}
