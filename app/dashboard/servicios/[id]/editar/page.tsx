import { notFound } from "next/navigation"
import { ServiceListingForm } from "@/components/service-listing-form"
import { getServiceListingById } from "@/app/actions/service-listings"
import { createServerClient } from "@/lib/supabase-server"

export default async function EditServiceListingPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return <div>Debes iniciar sesión para ver esta página</div>
  }

  try {
    const listing = await getServiceListingById(params.id)

    // Check if the user owns this listing
    if (listing.user_id !== session.user.id) {
      return <div>No tienes permiso para editar este anuncio</div>
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Editar anuncio</h1>
          <p className="text-muted-foreground">Actualiza la información de tu anuncio.</p>
        </div>

        <ServiceListingForm mode="edit" listing={listing} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching service listing:", error)
    return notFound()
  }
}
