"use server"

import { cookies } from "next/headers"
import { createServerClient as createServerClientSupabase } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

// Create a server client directly in the action file to avoid import issues
async function createActionServerClient() {
  console.log("[SERVER ACTION] Creating server client")

  try {
    const cookieStore = await cookies()
    console.log("[SERVER ACTION] Cookie store created")

    // Log available cookies for debugging
    const allCookies = cookieStore.getAll()
    console.log(
      "[SERVER ACTION] Available cookies:",
      allCookies.map((c) => c.name),
    )

    const client = createServerClientSupabase<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name)
            console.log(`[SERVER ACTION] Getting cookie: ${name}, exists: ${!!cookie}`)
            return cookie?.value
          },
          set(name: string, value: string, options: any) {
            // Server actions can't set cookies directly
            console.log(`[SERVER ACTION] Attempted to set cookie: ${name} (not supported in server actions)`)
          },
          remove(name: string, options: any) {
            // Server actions can't remove cookies directly
            console.log(`[SERVER ACTION] Attempted to remove cookie: ${name} (not supported in server actions)`)
          },
        },
      },
    )

    console.log("[SERVER ACTION] Server client created successfully")
    return client
  } catch (error) {
    console.error("[SERVER ACTION] Error creating server client:", error)
    throw error
  }
}

// Get profile data - this is a server action
export async function getProfileData(userId: string) {
  console.log("[SERVER ACTION] getProfileData called with userId:", userId)

  if (!userId) {
    console.log("[SERVER ACTION] No userId provided")
    return { profile: null, error: "User ID is required" }
  }

  try {
    console.log("[SERVER ACTION] Creating Supabase client")
    const supabase = await createActionServerClient()
    console.log("[SERVER ACTION] Supabase client created")

    console.log("[SERVER ACTION] Fetching profile for user:", userId)
    // Get the user's profile
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()

    if (error) {
      console.error("[SERVER ACTION] Error fetching profile:", error)
      return { profile: null, error: error.message }
    }

    console.log("[SERVER ACTION] Profile fetched successfully:", !!data)
    return { profile: data, error: null }
  } catch (error) {
    console.error("[SERVER ACTION] Unexpected error in getProfileData:", error)
    return {
      profile: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Update profile data - this is a server action
export async function updateProfileData(userId: string, profileData: any) {
  console.log("[SERVER ACTION] updateProfileData called with userId:", userId)

  if (!userId) {
    console.log("[SERVER ACTION] No userId provided")
    return { success: false, error: "User ID is required" }
  }

  try {
    console.log("[SERVER ACTION] Creating Supabase client")
    const supabase = await createActionServerClient()
    console.log("[SERVER ACTION] Supabase client created")

    console.log("[SERVER ACTION] Updating profile for user:", userId)
    // Update the profile
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, ...profileData, updated_at: new Date().toISOString() })

    if (error) {
      console.error("[SERVER ACTION] Error updating profile:", error)
      return { success: false, error: error.message }
    }

    console.log("[SERVER ACTION] Profile updated successfully")
    return { success: true, error: null }
  } catch (error) {
    console.error("[SERVER ACTION] Unexpected error in updateProfileData:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
