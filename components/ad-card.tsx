"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import supabase from "@/lib/client" // Import Supabase client
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Heart, Share2, MapPin, Phone, Globe, Mail, Map, Check, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toggleFavorite, isFavorited } from "@/app/actions/service-listings"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { isClient } from "@/debug-utils"
import { ServiceMediaGallery } from "@/components/service-media-gallery"

export interface AdCardProps {
  id: string
  title: string
  category: string
  subcategory?: string
  description: string
  imagePath?: string // Path to image in Supabase bucket
  videoPath?: string // Path to video in Supabase bucket
  badge?: string | null
  price?: string
  location: string
  phone?: string
  whatsapp?: string
  website?: string
  email?: string
  address?: string
  coordinates?: { lat: number; lng: number }
  verified?: boolean
  isNew?: boolean
  publishedAt: Date
  userId: string // <-- Added userId as required prop
  onClick?: () => void
}

export function AdCard({
  id,
  title,
  category,
  subcategory,
  description,
  imagePath,
  videoPath,
  badge,
  price,
  location,
  phone,
  whatsapp,
  website,
  email,
  address,
  coordinates,
  verified = false,
  isNew = false,
  publishedAt,
  userId,
  onClick,
}: AdCardProps) {
  const { toast } = useToast()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)


  // Enhanced media detection from Supabase storage
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        // Debug info
        console.log(`AdCard ${id}: Starting media fetch`, { imagePath, videoPath });
        
        // Try to extract user ID from the service ID
        // If that doesn't work, make a DB query to get user_id
        
      } catch (error) {
        console.error(`AdCard ${id}: Error fetching media:`, error);
      }
    };
    
    fetchMedia();
  }, [id, imagePath, videoPath]);
  
  // Check if the ad is favorited when component mounts
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const result = await isFavorited(id)
        setIsFavorite(result.favorited)
      } catch (error) {
        console.error("Error checking favorite status:", error)
      }
    }
    
    checkFavoriteStatus()
  }, [id])

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      setIsLoading(true)
      const result = await toggleFavorite(id)
      setIsFavorite(result.favorited)
      
      toast({
        title: result.favorited ? "Añadido a favoritos" : "Eliminado de favoritos",
        description: result.favorited
          ? "Este anuncio ha sido añadido a tus favoritos"
          : "Este anuncio ha sido eliminado de tus favoritos",
        variant: result.favorited ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsShareDialogOpen(true)
  }

  const timeSincePublication = formatDistanceToNow(publishedAt, {
    addSuffix: true,
    locale: es,
  })

  const whatsappMessage = encodeURIComponent(
    `Hola ${title}, he visto tu anuncio en Directorio Latino, necesito información.`,
  )

  // Safe way to get origin
  const getOrigin = () => {
    if (!isClient) return "https://example.com"
    return window.location.origin
  }

  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-lg h-full flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* ServiceMediaGallery replaces old media section */}
        <ServiceMediaGallery
          listingId={id}
          userId={userId}
          title={title}
          initialPrimaryImageUrl={imagePath ? (() => {
            // Try to get public URL for initial image
            const { data: imageData } = supabase.storage.from('service-listings').getPublicUrl(imagePath);
            return imageData?.publicUrl || undefined;
          })() : undefined}
          variant="card"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {badge && <Badge className="bg-primary text-primary-foreground">{badge}</Badge>}
          {isNew && <Badge className="bg-green-500 text-white">Nuevo</Badge>}
        </div>

        {/* Price badge */}
        {price && (
          <div className="absolute bottom-3 right-3 bg-background/90 text-foreground px-3 py-1 rounded-md font-medium">
            {price}
          </div>
        )}

        {/* Favorite button */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors ${
            isFavorite ? "text-red-500" : "text-muted-foreground"
          }`}
          onClick={handleFavoriteToggle}
          disabled={isLoading}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
          <span className="sr-only">Favorito</span>
        </Button>
      </div>

      <CardHeader className="p-4">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">{title}</CardTitle>
              {verified ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="border-green-500 text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Anuncio verificado</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="border-amber-500 text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Anuncio no verificado</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              {location}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Publicado {timeSincePublication}</div>
          </div>
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{description}</p>

        <div className="grid grid-cols-1 gap-2 text-sm">
          {phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${phone}`} className="hover:text-primary" onClick={(e) => e.stopPropagation()}>
                {phone}
              </a>
            </div>
          )}

          {email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${email}`} className="hover:text-primary truncate" onClick={(e) => e.stopPropagation()}>
                {email}
              </a>
            </div>
          )}

          {website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a
                href={website.startsWith("http") ? website : `https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}

          {address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{address}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
        <Button
          variant="default"
          className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground"
          onClick={onClick}
          asChild
        >
          <Link href={`/servicios/${id}`}>Ver anuncio</Link>
        </Button>

        <div className="flex gap-2">
          {whatsapp && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
                    asChild
                  >
                    <a
                      href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Contactar por WhatsApp</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {coordinates && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" asChild>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Map className="h-5 w-5" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver en Google Maps</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Compartir anuncio</DialogTitle>
                <DialogDescription>Comparte este anuncio con tus amigos y contactos</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <Button variant="outline" className="flex items-center gap-2" asChild>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      `${getOrigin()}/servicios/${id}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                    Facebook
                  </a>
                </Button>
                <Button variant="outline" className="flex items-center gap-2" asChild>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `¡Mira este anuncio en Directorio Latino! ${title} - ${getOrigin()}/servicios/${id}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                </Button>
                <Button variant="outline" className="flex items-center gap-2" asChild>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(
                      `Anuncio en Directorio Latino: ${title}`,
                    )}&body=${encodeURIComponent(
                      `¡Mira este anuncio en Directorio Latino!\n\n${title}\n\n${description}\n\n${getOrigin()}/servicios/${id}`,
                    )}`}
                  >
                    <Mail className="h-5 w-5" />
                    Email
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (isClient) {
                      navigator.clipboard.writeText(`${getOrigin()}/servicios/${id}`)
                    }
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  Copiar enlace
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  )
}
