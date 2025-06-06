import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

export async function middleware(request: NextRequest) {
  // Create a Supabase client
  const supabase = await createServerClient()

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If the user is not authenticated, redirect to the login page
  if (!session) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
