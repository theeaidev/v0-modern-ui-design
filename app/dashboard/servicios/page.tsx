import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getServiceListings } from "@/app/actions/service-listings"
import { createServerClient } from "@/lib/supabase-server"
import { ServiceListingCard } from "@/components/service-listing-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

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

  const { listings: pendingListings } = await getServiceListings({
    user_id: session.user.id,
    status: "pending_approval",
  })

  return (
    <div className="space-y-6">
      <MainNav />
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
          <TabsTrigger value="pending">
            Pendientes ({pendingListings.length})
            {pendingListings.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                <Clock className="mr-1 h-3 w-3" />
                {pendingListings.length}
              </Badge>
            )}
          </TabsTrigger>
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

        <TabsContent value="pending" className="pt-6">
          {pendingListings.length > 0 ? (
            <div>
              <div className="mb-4 rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
                <p>
                  <strong>Nota:</strong> Tus anuncios están siendo revisados por nuestro equipo. Este proceso puede
                  tardar hasta 24 horas.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingListings.map((listing) => (
                  <div key={listing.id} className="relative">
                    <ServiceListingCard listing={listing} />
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                      <div className="rounded-md bg-white p-2 text-sm font-medium">
                        <Clock className="mr-1 inline-block h-4 w-4" />
                        Pendiente de aprobación
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-medium">No tienes anuncios pendientes</h3>
              <p className="text-sm text-muted-foreground">
                Los anuncios pendientes están siendo revisados por nuestro equipo.
              </p>
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
      <SiteFooter />
    </div>
  )
}
