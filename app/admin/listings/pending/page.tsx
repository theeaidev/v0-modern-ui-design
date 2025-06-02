import { createServerClient } from "@/lib/supabase-server"
import { PendingListingCard } from "@/components/admin/pending-listing-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { MainNav } from "@/components/main-nav"

// Prevent prerendering during build
export const dynamic = 'force-dynamic'

export default async function PendingListingsPage() {
  const supabase = await createServerClient()

  // Get all pending listings
  const { data: pendingListings, error } = await supabase
    .from("service_listings")
    .select(`
      *,
      images:service_images(*),
      category:categories(*),
      subcategory:subcategories(*),
      user:profiles(id, full_name, avatar_url)
    `)
    .eq("status", "pending_approval")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching pending listings:", error)
    return <div>Error loading pending listings</div>
  }

  return (
    <div className="space-y-6">
      <MainNav />
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Anuncios Pendientes de Aprobación</h1>
      </div>

      {pendingListings.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="mb-2 text-lg font-medium">No hay anuncios pendientes</h3>
          <p className="text-sm text-muted-foreground">Todos los anuncios han sido revisados.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingListings.map((listing) => (
            <PendingListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
