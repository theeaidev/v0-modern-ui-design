"use server"

import { cookies } from "next/headers"
import { createServerClient as createServerClientSupabase } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

// Create a server client directly in the action file to avoid import issues
function createActionServerClient() {
  const cookieStore = cookies()

  return createServerClientSupabase<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // Server actions can't set cookies directly
        },
        remove(name: string, options: any) {
          // Server actions can't remove cookies directly
        },
      },
    },
  )
}

// Get profile data - this is a server action
export async function getProfileData(userId: string) {
  if (!userId) {
    return { profile: null, error: "User ID is required" }
  }

  try {
    const supabase = createActionServerClient()

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
  if (!userId) {
    return { success: false, error: "User ID is required" }
  }

  try {
    const supabase = createActionServerClient()

    // Update the profile
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, ...profileData, updated_at: new Date().toISOString() })

    if (error) {
      console.error("Error updating profile:", error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Unexpected error in updateProfileData:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
