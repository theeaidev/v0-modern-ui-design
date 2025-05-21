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
        {
          // Explicitly set the cookie options to avoid parsing issues
          cookies: {
            get(name) {
              console.log(`[SUPABASE CLIENT] Getting cookie: ${name}`)
              const cookies = document.cookie.split(";").map((cookie) => cookie.trim())
              const cookie = cookies.find((cookie) => cookie.startsWith(`${name}=`))
              if (!cookie) {
                console.log(`[SUPABASE CLIENT] Cookie not found: ${name}`)
                return undefined
              }
              const value = cookie.split("=")[1]
              console.log(`[SUPABASE CLIENT] Raw cookie value for ${name}:`, value)
              // If the value looks like base64, log a warning (Supabase session cookies are base64-encoded JSON)
              if (value && value.startsWith("eyJ")) {
                console.log(
                  `[SUPABASE CLIENT] Cookie value for ${name} looks like base64-encoded JSON. If you need to parse it, decode first.`,
                )
              }
              return value
            },
            set(name, value, options) {
              console.log(`[SUPABASE CLIENT] Setting cookie: ${name}`)
              let cookie = `${name}=${value}`
              if (options.expires) {
                cookie += `; expires=${options.expires.toUTCString()}`
              }
              if (options.path) {
                cookie += `; path=${options.path}`
              }
              if (options.domain) {
                cookie += `; domain=${options.domain}`
              }
              if (options.secure) {
                cookie += "; secure"
              }
              document.cookie = cookie
            },
            remove(name, options) {
              console.log(`[SUPABASE CLIENT] Removing cookie: ${name}`)
              const cookieOptions = {
                ...options,
                expires: new Date(0),
              }
              this.set(name, "", cookieOptions)
            },
          },
        },
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
