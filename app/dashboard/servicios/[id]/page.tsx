"use client"

import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getServiceListingById, deleteServiceListing } from "@/app/actions/service-listings"
import { createServerClient } from "@/lib/supabase-server"

export default async function ServiceListingDetailPage({ params }: { params: { id: string } }) {
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
      return <div>No tienes permiso para ver este anuncio</div>
    }

    // Find the primary image or use the first one
    const primaryImage = listing.images?.find((img) => img.is_primary) || listing.images?.[0]
    const imageUrl = primaryImage?.url || "/placeholder.svg?height=600&width=1200"

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/servicios/${listing.id}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Ver anuncio
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/servicios/${listing.id}/editar`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={listing.title}
                fill
                className="object-cover"
              />
            </div>
            
            <Tabs defaultValue="details" className="mt-6">
              <TabsList>
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="stats">Estadísticas</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 pt-6">
                <div>
                  <h3 className="text-lg font-medium">Descripción</h3>
                  <p className="mt-2 text-muted-foreground">{listing.description}</p>
                  
                  {listing.long_description && (
                    <div className="mt-4 prose max-w-none">
                      <p>{listing.long_description}</p>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-medium">Categoría</h3>
                    <p className="text-muted-foreground">{listing.category?.name}</p>
                    {listing.subcategory && (
                      <p className="text-muted-foreground">
                        {listing.subcategory.name}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Precio</h3>
                    <p className="text-muted-foreground">
                      {listing.price || 'No especificado'} 
                      {listing.price_type && (
                        <span className="ml-1">
                          ({listing.price_type === 'fixed' ? 'Precio fijo' : 
                            listing.price_type === 'hourly' ? 'Por hora' :
                            listing.price_type === 'daily' ? 'Por día' :
                            listing.price_type === 'monthly' ? 'Por mes' :
                            listing.price_type === 'variable' ? 'Variable' :
                            listing.price_type === 'free' ? 'Gratis' : 'Contactar'})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Ubicación</h3>
                  <p className="text-muted-foreground">
                    {listing.location || 'No especificado'}
                  </p>
                </div>
                
                {listing.phone && (
                  <div>
                    <h3 className="text-lg font-medium">Teléfono</h3>
                    <p className="text-muted-foreground">
                      {listing.phone}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4 pt-6">
              <div>
                <h3 className="text-lg font-medium">Estadísticas</h3>
                <p className="text-muted-foreground">
                    Aquí irán las estadísticas del anuncio.
                  </p>
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
                <Button variant="destructive" className="w-full" onClick={async () => {
                  if (window.confirm("¿Estás seguro de que quieres eliminar este anuncio?")) {
                    const result = await deleteServiceListing(listing.id);
                    if (result?.error) {
                      alert(result.error);
                    } else {
                      window.location.href = '/dashboard/servicios';
                    }
                  }
                }}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar anuncio
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
    
    )
  } catch (error) {
    notFound()
  }
}
