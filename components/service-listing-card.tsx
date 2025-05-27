"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, MapPin, Star, CheckCircle2, Clock, Eye, Edit, ChevronLeft, ChevronRight, ImageIcon, Video } from "lucide-react"
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
    image_urls?: string[] | string
    video_urls?: string[] | string
  }
  showActions?: boolean
}

export function ServiceListingCard({ listing, showActions = true }: ServiceListingCardProps): React.ReactNode {
  const { toast } = useToast()
  const router = useRouter()
  const [isFavorited, setIsFavorited] = useState(listing.isFavorited || false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const mediaContainerRef = useRef<HTMLDivElement>(null)
  
  // More detailed debugging first
  console.log(`ServiceListingCard for ID ${listing.id} - FULL LISTING DATA:`, listing);
  
  // Find the primary image or use the first one (original approach)
  const primaryImage = listing.images?.find((img) => img.is_primary) || listing.images?.[0]
  const primaryImageUrl = primaryImage?.url
  
  // Process media URLs - prioritize image_urls field, then fall back to images array
  const dbImageUrls = listing.images?.filter(img => !!img.url).map(img => img.url) || []
  
  // CRITICAL: We need to ensure the URLs are processed correctly
  let rawImageUrls: string[] = [];
  let rawVideoUrls: string[] = [];
  
  // Check types for debugging
  const rawImageUrlsType = typeof listing.image_urls;
  const rawVideoUrlsType = typeof listing.video_urls;
  
  // Process image URLs
  if (!listing.image_urls) {
    // No image URLs
  } else if (Array.isArray(listing.image_urls)) {
    rawImageUrls = listing.image_urls;
  } else if (typeof listing.image_urls === 'string') {
    try {
      const parsed = JSON.parse(listing.image_urls);
      if (Array.isArray(parsed)) {
        rawImageUrls = parsed;
      } else {
        rawImageUrls = [listing.image_urls];
      }
    } catch (e) {
      console.error("Failed to parse image_urls as JSON string:", listing.image_urls);
      rawImageUrls = [listing.image_urls as string];
    }
  }
  
  // Process video URLs
  if (!listing.video_urls) {
    // No video URLs
  } else if (Array.isArray(listing.video_urls)) {
    rawVideoUrls = listing.video_urls;
  } else if (typeof listing.video_urls === 'string') {
    try {
      const parsed = JSON.parse(listing.video_urls);
      if (Array.isArray(parsed)) {
        rawVideoUrls = parsed;
      } else {
        rawVideoUrls = [listing.video_urls];
      }
    } catch (e) {
      console.error("Failed to parse video_urls as JSON string:", listing.video_urls);
      rawVideoUrls = [listing.video_urls as string];
    }
  }
  
  // Filter valid URLs
  const filteredImageUrls = rawImageUrls.filter((url: string) => !!url);
  const filteredVideoUrls = rawVideoUrls.filter((url: string) => !!url);
  
  // Use either image_urls array, database images array, or empty array
  const imageUrls = filteredImageUrls.length > 0 
    ? filteredImageUrls
    : dbImageUrls.length > 0 
      ? dbImageUrls 
      : []

  // Process video URLs
  const videoUrls = filteredVideoUrls.length > 0 ? filteredVideoUrls : []

  // Log media information for debugging
  console.log(`Listing ${listing.id} media:`, {
    rawImageUrlsType,
    rawVideoUrlsType,
    rawImageUrls,
    rawVideoUrls,
    filteredImageUrls,
    filteredVideoUrls,
    dbImageUrls,
    finalImageUrls: imageUrls,
    finalVideoUrls: videoUrls,
    primaryImageUrl
  })

  // Determine if we have any media
  const hasImages = imageUrls.length > 0
  const hasVideo = videoUrls.length > 0
  const hasMedia = hasImages || hasVideo
  
  // Force debug log to the console with the final decision
  console.log(`Media decision for listing ${listing.id}:`, {
    hasImages,
    hasVideo,
    mediaCount: imageUrls.length + videoUrls.length,
    firstImageUrl: imageUrls[0] || "none",
    firstVideoUrl: videoUrls[0] || "none"
  })
  
  // Default placeholder if no media
  const placeholderUrl = "/placeholder.svg?height=300&width=400"

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

  // Functions to navigate through images
  const goToPrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? imageUrls.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="group h-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden" ref={mediaContainerRef}>
          {/* Media Display */}
          {hasVideo && videoUrls[0] ? (
            // Video display takes precedence if available
            <div className="relative h-full w-full">
              {/* Debug Info */}
              <div className="absolute top-0 left-0 z-50 bg-black/80 text-white text-xs p-1">
                Video URL: {videoUrls[0].substring(0, 30)}...
              </div>
              
              <video 
                src={videoUrls[0]}
                className="h-full w-full object-cover"
                controls={false}
                autoPlay={false}
                muted
                loop
                poster={hasImages ? imageUrls[0] : placeholderUrl}
                onError={(e) => {
                  console.error(`Failed to load video: ${videoUrls[0]}`);
                  // If video fails, try to display an image instead
                  const videoElement = e.currentTarget as HTMLVideoElement;
                  videoElement.style.display = 'none';
                  // We'll let the next condition handle showing an image
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-background/60 p-3">
                  <Video className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
          ) : hasImages && imageUrls[currentImageIndex] ? (
            // Image display
            <div className="relative h-full w-full">
              {/* Debug Info */}
              <div className="absolute top-0 left-0 z-50 bg-black/80 text-white text-xs p-1">
                Image URL: {imageUrls[currentImageIndex].substring(0, 30)}...
              </div>
              
              <Image
                src={imageUrls[currentImageIndex]}
                alt={listing.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  console.error(`Failed to load image: ${imageUrls[currentImageIndex]}`);
                  const target = e.target as HTMLImageElement;
                  target.src = placeholderUrl;
                }}
              />
            </div>
          ) : primaryImageUrl ? (
            // Fallback to primary image from the database if available
            <div className="relative h-full w-full">
              {/* Debug Info */}
              <div className="absolute top-0 left-0 z-50 bg-black/80 text-white text-xs p-1">
                Primary URL: {primaryImageUrl.substring(0, 30)}...
              </div>
              
              <Image
                src={primaryImageUrl}
                alt={listing.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  console.error(`Failed to load primary image: ${primaryImageUrl}`);
                  const target = e.target as HTMLImageElement;
                  target.src = placeholderUrl;
                }}
              />
            </div>
          ) : (
            // Fallback placeholder
            <div className="relative h-full w-full">
              {/* Debug Info */}
              <div className="absolute top-0 left-0 z-50 bg-black/80 text-white text-xs p-1">
                Using placeholder (no media found)
              </div>
              
              <Image
                src={placeholderUrl}
                alt={listing.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}

          {/* Media type indicators */}
          {hasMedia && (
            <div className="absolute left-2 bottom-2 flex space-x-2">
              {hasImages && (
                <Badge variant="outline" className="bg-background/80 text-foreground">
                  <ImageIcon className="mr-1 h-3 w-3" />
                  {imageUrls.length}
                </Badge>
              )}
              {hasVideo && (
                <Badge variant="outline" className="bg-background/80 text-foreground">
                  <Video className="mr-1 h-3 w-3" />
                  {videoUrls.length}
                </Badge>
              )}
            </div>
          )}

          {/* Image navigation arrows */}
          {hasImages && imageUrls.length > 1 && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/60 text-foreground hover:bg-background/80"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToPrevImage();
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/60 text-foreground hover:bg-background/80"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToNextImage();
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Listing badges */}
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
                Ver anuncios
              </Link>
            </Button>
          </div>
        </div>
      </div>
  )
}
