import { createServerClient as createClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

export function createServerClient() {
  const cookieStore = cookies()

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        // This is only used for server components, which cannot set cookies
        // The actual cookie setting happens in the client
      },
      remove(name: string, options: any) {
        // This is only used for server components, which cannot remove cookies
        // The actual cookie removal happens in the client
      },
    },
  })
}
