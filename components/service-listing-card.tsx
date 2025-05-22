"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, MapPin, Star, CheckCircle2, Clock, Eye, Edit } from "lucide-react"
import type { ServiceListing, ServiceImage } from "@/types/service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toggleFavorite } from "@/app/actions/service-listings"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ServiceListingCardProps {
  listing: ServiceListing & {
    images: ServiceImage[]
    category?: { name: string }
    subcategory?: { name: string }
    isFavorited?: boolean
    average_rating?: number
    reviews_count?: number
  }
  showActions?: boolean
}

export function ServiceListingCard({ listing, showActions = true }: ServiceListingCardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isFavorited, setIsFavorited] = useState(listing.isFavorited || false)
  const [isLoading, setIsLoading] = useState(false)

  // Find the primary image or use the first one
  const primaryImage = listing.images?.find((img) => img.is_primary) || listing.images?.[0]
  const imageUrl = primaryImage?.url || "/placeholder.svg?height=300&width=400"

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      setIsLoading(true)
      const result = await toggleFavorite(listing.id)
      setIsFavorited(result.favorited)

      toast({
        title: result.favorited ? "Añadido a favoritos" : "Eliminado de favoritos",
        description: result.favorited
          ? "Este anuncio ha sido añadido a tus favoritos"
          : "Este anuncio ha sido eliminado de tus favoritos",
        variant: result.favorited ? "default" : "destructive",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="group h-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {listing.is_featured && (
            <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">Destacado</Badge>
          )}

          {listing.price && (
            <div className="absolute bottom-2 right-2 rounded-md bg-background/90 px-2 py-1 text-sm font-medium">
              {listing.price}
            </div>
          )}

          {showActions && (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 ${
                isFavorited ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={handleFavoriteToggle}
              disabled={isLoading}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
              <span className="sr-only">Favorito</span>
            </Button>
          )}
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {listing.category && (
                <Badge variant="outline" className="text-xs">
                  {listing.category.name}
                </Badge>
              )}
              {listing.status === "pending_approval" && (
                <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-600 text-xs">
                  <Clock className="mr-1 h-3 w-3" />
                  Pendiente
                </Badge>
              )}
              {listing.is_verified && (
                <Badge variant="outline" className="border-green-500 text-green-600 text-xs">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verificado
                </Badge>
              )}
            </div>

            {listing.average_rating && listing.average_rating > 0 && (
              <div className="flex items-center text-sm">
                <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{listing.average_rating.toFixed(1)}</span>
                {listing.reviews_count && (
                  <span className="ml-1 text-xs text-muted-foreground">({listing.reviews_count})</span>
                )}
              </div>
            )}
          </div>

          <h3 className="mb-1 line-clamp-2 font-semibold">{listing.title}</h3>

          {listing.city && (
            <div className="mb-2 flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1 h-3 w-3" />
              <span>{listing.city}</span>
            </div>
          )}

          <p className="line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
          
          <div className="mt-4 flex justify-between items-center">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/servicios/${listing.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </Link>
            </Button>
            
            <Button variant="default" size="sm" asChild>
              <Link href={`/servicios/${listing.id}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Ver anuncio
              </Link>
            </Button>
          </div>
        </div>
      </div>
  )
}
