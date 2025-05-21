import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Create a response object
  const res = NextResponse.next()

  try {
    // Log all cookies for debugging
    console.log("[MIDDLEWARE] Cookies:", req.cookies ? Array.from(req.cookies.entries()) : "No cookies")
    // Create a Supabase client
    const supabase = createMiddlewareClient({ req, res })

    // Get the session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    console.log("[MIDDLEWARE] Session after getSession:", session)

    // Check if the route is protected
    const protectedRoutes = [
      "/dashboard",
      "/dashboard/profile",
      "/dashboard/publicar",
      "/dashboard/anuncios",
      "/dashboard/favoritos",
      "/dashboard/servicios",
      "/dashboard/ajustes",
    ]

    const isProtectedRoute = protectedRoutes.some(
      (route) => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(`${route}/`),
    )

    // If the route is protected and the user is not authenticated, redirect to login
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If the user is already authenticated and tries to access login/register pages, redirect to dashboard
    if ((req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") && session) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
  } catch (error) {
    console.error("Error in middleware:", error)
    // Return the original response to avoid breaking the application
    return res
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
