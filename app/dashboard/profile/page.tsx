import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import { ProfileFormWrapper } from "@/components/profile-form-wrapper"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"

// Prevent prerendering during build
export const dynamic = 'force-dynamic'

// This is a Server Component (no "use client" directive)
export default async function ProfilePage() {
  // Initialize the Supabase client
  const supabase = await createServerClient()

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("Error fetching user or user not found:", userError)
    redirect("/login")
  }

  try {
    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      // Continue with a default profile
    }

    // If profile doesn't exist, create a default one with the user ID
    const userProfile = profile || {
      id: user.id,
      full_name: user.user_metadata?.full_name || "",
      email: user.email,
      is_business: user.user_metadata?.is_business || false,
    }

    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />

        <main className="flex-1 py-12">
          <div className="container">
            <h1 className="text-3xl font-bold mb-8">Editar perfil</h1>
            <ProfileFormWrapper initialProfile={userProfile} userId={user.id} />
          </div>
        </main>

        <SiteFooter />
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in profile page:", error)
    // Show a fallback UI
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />

        <main className="flex-1 py-12">
          <div className="container">
            <h1 className="text-3xl font-bold mb-8">Error al cargar el perfil</h1>
            <p className="text-red-500">
              Ha ocurrido un error al cargar tu perfil. Por favor, intenta de nuevo más tarde.
            </p>
            <a href="/dashboard" className="mt-4 px-4 py-2 bg-primary text-white rounded-md inline-block">
              Volver al dashboard
            </a>
          </div>
        </main>

        <SiteFooter />
      </div>
    )
  }
}
