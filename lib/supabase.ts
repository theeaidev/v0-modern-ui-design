import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

// Create a single instance of the Supabase client for the browser
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseBrowserClient() {
  // For server-side rendering, create a new instance each time
  if (typeof window === "undefined") {
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }

  // For client-side, use singleton pattern
  if (!browserClient) {
    try {
      browserClient = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
    } catch (error) {
      console.error("Error creating Supabase browser client:", error)
      // Return a new instance as fallback
      return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
    }
  }

  return browserClient
}
