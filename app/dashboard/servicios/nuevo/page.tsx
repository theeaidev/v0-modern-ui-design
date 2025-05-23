import { redirect } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { ServiceListingForm } from "@/components/service-listing-form"
import { SiteFooter } from "@/components/site-footer"
import { createServerClient } from "@/lib/supabase-server"

// Prevent prerendering during build
export const dynamic = 'force-dynamic'

export default async function NewServiceListingPage() {
  // Check if user is authenticated
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect to login page if not authenticated
  if (!session) {
    redirect("/login?redirect=/dashboard/servicios/nuevo")
  }

  return (
    <div className="space-y-6">
      <MainNav />
      <div className="container py-4">
        <h1 className="text-2xl font-bold">Crear nuevo anuncio</h1>
        <p className="text-muted-foreground">Completa el formulario para publicar un nuevo anuncio en el directorio.</p>
      </div>

      <div className="container pb-8">
        <ServiceListingForm mode="create" />
      </div>
      <SiteFooter />
    </div>
  )
}
