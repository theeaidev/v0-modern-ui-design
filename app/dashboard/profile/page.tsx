"use client"

import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import { ProfileForm } from "@/components/profile-form"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"

export default async function ProfilePage() {
  const supabase = createServerClient()

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
      .maybeSingle() // Use maybeSingle instead of single to avoid errors when no profile exists

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
            <ProfileForm profile={userProfile} />
          </div>
        </main>

        <SiteFooter />
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in profile page:", error)
    // Show a fallback UI instead of redirecting to avoid loops
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />

        <main className="flex-1 py-12">
          <div className="container">
            <h1 className="text-3xl font-bold mb-8">Error al cargar el perfil</h1>
            <p className="text-red-500">
              Ha ocurrido un error al cargar tu perfil. Por favor, intenta de nuevo más tarde.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
            >
              Reintentar
            </button>
          </div>
        </main>

        <SiteFooter />
      </div>
    )
  }
}
