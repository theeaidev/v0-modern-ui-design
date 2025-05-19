"use server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { ProfileFormData } from "@/types/profile"

// Get the authenticated user's profile
export async function getProfile() {
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
    return { error: "Not authenticated", profile: null }
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return { error: error.message, profile: null }
  }

  return { profile, error: null }
}

// Update the authenticated user's profile
export async function updateProfile(formData: ProfileFormData) {
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
    return { error: "Not authenticated", success: false }
  }

  // Update the profile
  const { error } = await supabase
    .from("profiles")
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating profile:", error)
    return { error: error.message, success: false }
  }

  // Revalidate the profile page to show updated data
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/profile")

  return { error: null, success: true }
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
