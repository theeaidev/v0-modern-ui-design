import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerClient } from "@/lib/supabase-server"

// Prevent prerendering during build
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createServerClient()

  // Get counts for various items
  const { count: pendingListingsCount } = await supabase
    .from("service_listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_approval")

  const { count: activeListingsCount } = await supabase
    .from("service_listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Panel de Administración</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Anuncios Pendientes</CardTitle>
            <CardDescription>Anuncios que requieren aprobación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingListingsCount}</div>
            <Link href="/admin/listings/pending" className="text-sm text-blue-600 hover:underline">
              Ver anuncios pendientes
            </Link>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="pb-2">
            <CardTitle>Anuncios Activos</CardTitle>
            <CardDescription>Anuncios publicados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeListingsCount}</div>
            <Link href="/admin/listings" className="text-sm text-blue-600 hover:underline">
              Ver todos los anuncios
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>Total de usuarios registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{usersCount}</div>
            <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">
              Gestionar usuarios
            </Link>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}
