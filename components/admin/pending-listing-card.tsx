"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { moderateListing } from "@/app/actions/service-listings"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, ExternalLink } from "lucide-react"

interface PendingListingCardProps {
  listing: any
}

export function PendingListingCard({ listing }: PendingListingCardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectionForm, setShowRejectionForm] = useState(false)

  // Find the primary image or use the first one
  const primaryImage = listing.images?.find((img: any) => img.is_primary) || listing.images?.[0]
  const imageUrl = primaryImage?.url || "/placeholder.svg?height=300&width=400"

  const handleApprove = async () => {
    try {
      setIsLoading(true)
      await moderateListing(listing.id, "approve")
      toast({
        title: "Anuncio aprobado",
        description: "El anuncio ha sido aprobado y publicado correctamente.",
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al aprobar el anuncio.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason) {
      toast({
        title: "Error",
        description: "Debes proporcionar un motivo para rechazar el anuncio.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await moderateListing(listing.id, "reject", rejectionReason)
      toast({
        title: "Anuncio rechazado",
        description: "El anuncio ha sido rechazado correctamente.",
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al rechazar el anuncio.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{listing.title}</CardTitle>
            <div className="mt-1 text-sm text-muted-foreground">
              <span>Por: {listing.user.full_name}</span>
              <span className="mx-2">•</span>
              <span>Fecha de publicacion: {new Date(listing.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/servicios/${listing.id}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver anuncio
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
{/*           <div className="relative aspect-video overflow-hidden rounded-md">
            <Image src={imageUrl || "/placeholder.svg"} alt={listing.title} fill className="object-cover" />
          </div> */}
          <div className="md:col-span-2">
            <div className="mb-2 text-sm">
              <strong>Categoría:</strong> {listing.category?.name}
              {listing.subcategory && ` > ${listing.subcategory.name}`}
            </div>
            <div className="mb-2 text-sm">
              <strong>Precio:</strong> {listing.price || "No especificado"} ({listing.price_type})
            </div>
            <div className="mb-2 text-sm">
              <strong>Ubicación:</strong> {listing.city || "No especificada"}
            </div>
            <p className="text-sm text-muted-foreground">{listing.description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {showRejectionForm ? (
          <div className="w-full space-y-4">
            <Textarea
              placeholder="Motivo del rechazo"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleReject} disabled={isLoading}>
                Confirmar rechazo
              </Button>
              <Button variant="outline" onClick={() => setShowRejectionForm(false)} disabled={isLoading}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex w-full gap-2">
            <Button className="flex-1" onClick={handleApprove} disabled={isLoading}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Aprobar
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowRejectionForm(true)}
              disabled={isLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Rechazar
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
