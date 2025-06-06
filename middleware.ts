import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // If the cookie is set, update the request cookies and response cookies
            req.cookies.set({
              name,
              value,
              ...options,
            })
            res = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            res.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            // If the cookie is removed, update the request cookies and response cookies
            req.cookies.set({
              name,
              value: "",
              ...options,
            })
            res = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            res.cookies.set({
              name,
              value: "",
              ...options,
            })
          },
        },
      }
    )

    // Log all cookies for debugging
    console.log("[MIDDLEWARE] Cookies:", req.cookies.getAll().length > 0 ? req.cookies.getAll() : "No cookies")

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
      // Preserve the response with updated cookies during redirect
      const redirectResponse = NextResponse.redirect(redirectUrl, { headers: res.headers })
      res.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }

    // If the user is already authenticated and tries to access login/register pages, redirect to dashboard
    if ((req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") && session) {
      // Preserve the response with updated cookies during redirect
      const redirectResponse = NextResponse.redirect(new URL("/dashboard", req.url), { headers: res.headers })
      res.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }

    return res
  } catch (error) {
    console.error("Error in middleware:", error)
    // Return the original response to avoid breaking the application, but ensure it's the potentially modified 'res'
    return res
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
