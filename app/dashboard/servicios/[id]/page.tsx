import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Edit, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getServiceListingById } from "@/app/actions/service-listings"
import { createServerClient } from "@/lib/supabase-server"
import { DeleteServiceButton } from "@/components/delete-service-button"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"

export default async function ServiceListingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return <div>Debes iniciar sesión para ver esta página</div>
  }

  let listingData;
  try {
    listingData = await getServiceListingById(params.id)
  } catch (error) {
    console.error(`Failed to fetch service listing with ID ${params.id}:`, error)
    listingData = null;
  }

  if (!listingData) {
    return (
      <div className="space-y-6 text-center py-10">
        <h1 className="text-3xl font-bold">Anuncio no encontrado</h1>
        <p className="text-muted-foreground text-lg">
          El anuncio que estás buscando no existe o ha sido eliminado.
        </p>
        <Button asChild size="lg">
          <Link href="/dashboard/servicios">Volver a Mis Anuncios</Link>
        </Button>
      </div>
    );
  }

  if (listingData.user_id !== session.user.id) {
    return (
      <div className="space-y-6 text-center py-10">
        <h1 className="text-3xl font-bold">Acceso denegado</h1>
        <p className="text-muted-foreground text-lg">
          No tienes permiso para ver este anuncio.
        </p>
        <Button asChild size="lg">
          <Link href="/dashboard/servicios">Volver a Mis Anuncios</Link>
        </Button>
      </div>
    );
  }

  const primaryImage = listingData.images?.find((img) => img.is_primary) || listingData.images?.[0]
  const imageUrl = primaryImage?.url || "/placeholder.svg?height=600&width=1200"

  return (
    <div className="space-y-6">
      <MainNav />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{listingData.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/servicios/${listingData.id}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Ver anuncio
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/servicios/${listingData.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image src={imageUrl || "/placeholder.svg"} alt={listingData.title} fill className="object-cover" />
          </div>

          <Tabs defaultValue="details" className="mt-6">
            <TabsList>
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-6">
              <div>
                <h3 className="text-lg font-medium">Descripción</h3>
                <p className="mt-2 text-muted-foreground">{listingData.description}</p>

                {listingData.long_description && (
                  <div className="mt-4 prose max-w-none">
                    <p>{listingData.long_description}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium">Categoría</h3>
                  <p className="text-muted-foreground">{listingData.category?.name}</p>
                  {listingData.subcategory && <p className="text-muted-foreground">{listingData.subcategory.name}</p>}
                </div>

                <div>
                  <h3 className="text-lg font-medium">Precio</h3>
                  <p className="text-muted-foreground">
                    {listingData.price || "No especificado"}
                    {listingData.price_type && (
                      <span className="ml-1">
                        (
                        {listingData.price_type === "fixed"
                          ? "Precio fijo"
                          : listingData.price_type === "hourly"
                            ? "Por hora"
                            : listingData.price_type === "daily"
                              ? "Por día"
                              : listingData.price_type === "monthly"
                                ? "Por mes"
                                : listingData.price_type === "variable"
                                  ? "Variable"
                                  : listingData.price_type === "free"
                                    ? "Gratis"
                                    : "Contactar"}
                        )
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Ubicación</h3>
                <p className="text-muted-foreground">{listingData.location || "No especificado"}</p>
              </div>

              {listingData.phone && (
                <div>
                  <h3 className="text-lg font-medium">Teléfono</h3>
                  <p className="text-muted-foreground">{listingData.phone}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats" className="space-y-4 pt-6">
              <div>
                <h3 className="text-lg font-medium">Estadísticas</h3>
                <p className="text-muted-foreground">Aquí irán las estadísticas del anuncio.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
              <CardDescription>Gestiona tu anuncio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DeleteServiceButton serviceId={listingData.id} />
            </CardContent>
          </Card>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
