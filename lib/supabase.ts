import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

// Create a single instance of the Supabase client for the browser
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseBrowserClient() {
  console.log("[SUPABASE CLIENT] getSupabaseBrowserClient called")

  // For server-side rendering, create a new instance each time
  if (typeof window === "undefined") {
    console.log("[SUPABASE CLIENT] Server-side rendering detected, creating new instance")
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }

  // For client-side, use singleton pattern
  if (!browserClient) {
    console.log("[SUPABASE CLIENT] Creating new browser client instance")
    try {
      browserClient = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

      )
      console.log("[SUPABASE CLIENT] Browser client created successfully")
    } catch (error) {
      console.error("[SUPABASE CLIENT] Error creating Supabase browser client:", error)
      // Return a new instance as fallback
      return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
    }
  } else {
    console.log("[SUPABASE CLIENT] Using existing browser client instance")
  }

  return browserClient
}

// Reset the client (useful for testing)
export function resetSupabaseBrowserClient() {
  console.log("[SUPABASE CLIENT] Resetting browser client")
  browserClient = null
}
