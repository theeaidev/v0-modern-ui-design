import { createServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Clock } from "lucide-react"

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Anuncio creado con éxito",
  description: "Tu anuncio ha sido creado y está pendiente de revisión.",
}

interface SuccessPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const supabase = await createServerClient() // Added await
  const id = searchParams.id

  if (!id) {
    redirect("/dashboard/servicios")
  }

  // Get the listing
  const { data: listing, error } = await supabase.from("service_listings").select("*").eq("id", id).single()

  if (error || !listing) {
    redirect("/dashboard/servicios")
  }

  const isPending = listing.status === "pending_approval"
  const isDraft = listing.status === "draft"

  return (
    <div className="container mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <div className="flex justify-center">
            {isPending ? (
              <Clock className="h-12 w-12 text-yellow-500" />
            ) : (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
          </div>
          <CardTitle className="text-center text-2xl">¡Anuncio creado con éxito!</CardTitle>
          <CardDescription className="text-center">
            {isPending
              ? "Tu anuncio ha sido enviado para revisión y será publicado una vez aprobado."
              : isDraft
                ? "Tu anuncio ha sido guardado como borrador."
                : "Tu anuncio ha sido publicado correctamente."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPending && (
            <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
              <p>
                <strong>Nota:</strong> Nuestro equipo revisará tu anuncio en las próximas 24 horas. Te notificaremos
                cuando sea aprobado.
              </p>
            </div>
          )}
          {isDraft && (
            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
              <p>
                <strong>Nota:</strong> Tu anuncio está guardado como borrador. Puedes editarlo y publicarlo cuando estés
                listo.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href={`/servicios/${id}`}>
              Ver mi anuncio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard/servicios">Ver todos mis anuncios</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
