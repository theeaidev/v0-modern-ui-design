"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toggleFavorite, isFavorited } from "@/app/actions/service-listings"
import { useToast } from "@/hooks/use-toast"

interface ServiceFavoriteButtonProps {
  serviceId: string
  className?: string
}

export function ServiceFavoriteButton({ serviceId, className }: ServiceFavoriteButtonProps) {
  const { toast } = useToast()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // Only true during the toggle action

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!serviceId) {
        // console.warn("ServiceFavoriteButton: serviceId is missing.")
        return
      }
      try {
        const result = await isFavorited(serviceId)
        setIsFavorite(result.favorited)
      } catch (error) {
        console.error("Error checking favorite status in ServiceFavoriteButton:", error)
      }
    }

    checkFavoriteStatus()
  }, [serviceId])

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!serviceId) {
      toast({
        title: "Error",
        description: "ID de servicio no válido.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await toggleFavorite(serviceId)
      setIsFavorite(result.favorited)

      toast({
        title: result.favorited ? "Añadido a favoritos" : "Eliminado de favoritos",
        description: result.favorited
          ? "Este anuncio ha sido añadido a tus favoritos."
          : "Este anuncio ha sido eliminado de tus favoritos.",
        variant: result.favorited ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error toggling favorite in ServiceFavoriteButton:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error al actualizar tus favoritos. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={`rounded-full ${
        isFavorite ? "border-red-500 text-red-500 hover:text-red-500 hover:bg-red-500/10" : "text-muted-foreground"
      } ${className || ""}`}
      onClick={handleFavoriteToggle}
      disabled={isLoading}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Eliminar de favoritos" : "Guardar en favoritos"}
    >
      <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
      <span className="sr-only">{isFavorite ? "Eliminar de favoritos" : "Guardar"}</span>
    </Button>
  )
}
