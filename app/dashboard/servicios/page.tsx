import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getServiceListings } from "@/app/actions/service-listings"
import { createServerClient } from "@/lib/supabase-server"
import { ServiceListingCard } from "@/components/service-listing-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DashboardServiciosPage() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return <div>Debes iniciar sesión para ver esta página</div>
  }

  const { listings: activeListings } = await getServiceListings({
    user_id: session.user.id,
    status: "active",
  })

  const { listings: draftListings } = await getServiceListings({
    user_id: session.user.id,
    status: "draft",
  })

  const { listings: pausedListings } = await getServiceListings({
    user_id: session.user.id,
    status: "paused",
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis anuncios</h1>
        <Button asChild>
          <Link href="/dashboard/servicios/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear nuevo anuncio
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Publicados ({activeListings.length})</TabsTrigger>
          <TabsTrigger value="draft">Borradores ({draftListings.length})</TabsTrigger>
          <TabsTrigger value="paused">Pausados ({pausedListings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="pt-6">
          {activeListings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeListings.map((listing) => (
                <ServiceListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-medium">No tienes anuncios publicados</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Crea tu primer anuncio para que aparezca en el directorio.
              </p>
              <Button asChild>
                <Link href="/dashboard/servicios/nuevo">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear anuncio
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="draft" className="pt-6">
          {draftListings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {draftListings.map((listing) => (
                <ServiceListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-medium">No tienes borradores</h3>
              <p className="text-sm text-muted-foreground">
                Los borradores te permiten preparar anuncios antes de publicarlos.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="paused" className="pt-6">
          {pausedListings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pausedListings.map((listing) => (
                <ServiceListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-medium">No tienes anuncios pausados</h3>
              <p className="text-sm text-muted-foreground">
                Puedes pausar tus anuncios temporalmente si no deseas que sean visibles.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
