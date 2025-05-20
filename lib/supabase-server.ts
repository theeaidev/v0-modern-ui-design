import { createServerClient as createServerClientSupabase } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// This function should ONLY be used in Server Components
export function createServerClient() {
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
          // This is only used for server components, which cannot set cookies
        },
        remove(name: string, options: any) {
          // This is only used for server components, which cannot remove cookies
        },
      },
    },
  )
}

// Add a clear warning to prevent misuse
if (typeof window !== "undefined") {
  console.warn(
    "Warning: lib/supabase-server.ts should only be imported in Server Components. " +
      "Use lib/supabase.ts for Client Components.",
  )
}
