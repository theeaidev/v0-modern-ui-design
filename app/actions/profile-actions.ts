"use server"

import { createServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

// Get profile data - this is a server action
export async function getProfileData(userId: string) {
  try {
    const supabase = createServerClient()

    // Get the user's profile
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()

    if (error) {
      console.error("Error fetching profile:", error)
      return { profile: null, error: error.message }
    }

    return { profile: data, error: null }
  } catch (error) {
    console.error("Unexpected error in getProfileData:", error)
    return {
      profile: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Update profile data - this is a server action
export async function updateProfileData(userId: string, profileData: any) {
  try {
    const supabase = createServerClient()

    // Update the profile
    const { error } = await supabase.from("profiles").upsert({ id: userId, ...profileData })

    if (error) {
      console.error("Error updating profile:", error)
      return { success: false, error: error.message }
    }

    // Revalidate the profile page
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/profile")

    return { success: true, error: null }
  } catch (error) {
    console.error("Unexpected error in updateProfileData:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
