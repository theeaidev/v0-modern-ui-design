import { createServerClient as createServerClientSupabase, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// This function should ONLY be used in Server Components, Server Actions, and Route Handlers
export async function createServerClient() { // Reverted to original name and made async
  const cookieStore = await cookies() // Must await cookies()

  return createServerClientSupabase<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // In Server Components/Actions, direct cookie setting to the browser response is not possible here.
          // Middleware handles setting cookies on the response.
          // This 'set' is for Supabase's internal use or if the underlying store was writable.
          // console.log(`Supabase server client: 'set' called for cookie ${name}. This is a no-op in this context.`);
        },
        remove(name: string, options: CookieOptions) {
          // Similar to 'set', this is a no-op in this context for browser response.
          // console.log(`Supabase server client: 'remove' called for cookie ${name}. This is a no-op in this context.`);
        },
      },
    }
  )
}

// Add a clear warning to prevent misuse
if (typeof window !== "undefined") {
  console.warn(
    "Warning: lib/supabase-server.ts should only be imported in Server Components. " +
      "Use lib/supabase.ts for Client Components.",
  )
}
