"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteServiceListing } from "@/app/actions/service-listings"

interface DeleteServiceButtonProps {
  serviceId: string
}

export function DeleteServiceButton({ serviceId }: DeleteServiceButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este anuncio?")) {
      try {
        setIsDeleting(true)
        await deleteServiceListing(serviceId)
        router.push("/dashboard/servicios")
      } catch (error) {
        console.error("Error deleting service:", error)
        alert("Ha ocurrido un error al eliminar el anuncio")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <Button variant="destructive" className="w-full" onClick={handleDelete} disabled={isDeleting}>
      <Trash2 className="mr-2 h-4 w-4" />
      {isDeleting ? "Eliminando..." : "Eliminar anuncio"}
    </Button>
  )
}
