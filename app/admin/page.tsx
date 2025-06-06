import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerClient } from "@/lib/supabase-server"
import { MainNav } from "@/components/main-nav"

// Prevent prerendering during build
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createServerClient()

  // Get counts for various items
  const { count: pendingListingsCount, error: pendingError } = await supabase
    .from("service_listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending_approval")

  const { count: activeListingsCount, error: activeError } = await supabase
    .from("service_listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")

  // Optional: Log errors for debugging
  if (pendingError) console.error("Error fetching pending listings count:", pendingError.message);
  if (activeError) console.error("Error fetching active listings count:", activeError.message);

  const { count: usersCount, error: usersError } = await supabase.from("profiles").select("id", { count: "exact", head: true });

  // Fetch counts for users by subscription plan
  const { count: basicTierUsersCount, error: basicTierError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("subscription_tier", "Basica"); // Assuming 'Basic' is the value in DB

  const { count: premiumTierUsersCount, error: premiumTierError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("subscription_tier", "Premium"); // Assuming 'Premium' is the value in DB

  const { count: premiumGoldTierUsersCount, error: premiumGoldTierError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("subscription_tier", "Premium Gold"); // Assuming 'Premium Gold' is the value in DB

  // Optional: Log errors for debugging
  if (usersError) console.error("Error fetching total users count:", usersError.message);
  if (basicTierError) console.error("Error fetching basic tier users count:", basicTierError.message);
  if (premiumTierError) console.error("Error fetching premium tier users count:", premiumTierError.message);
  if (premiumGoldTierError) console.error("Error fetching premium gold tier users count:", premiumGoldTierError.message);

  // Fetch counts for users with pending payment validation by subscription plan
  const { count: basicPendingPaymentCount, error: basicPendingPaymentError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("subscription_tier", "Basica") // Matches existing tier name
    .eq("payment_status", "pending_validation"); // Assumed payment status

  const { count: premiumPendingPaymentCount, error: premiumPendingPaymentError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("subscription_tier", "Premium")
    .eq("payment_status", "pending_validation");

  const { count: premiumGoldPendingPaymentCount, error: premiumGoldPendingPaymentError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("subscription_tier", "Premium Gold")
    .eq("payment_status", "pending_validation");

  if (basicPendingPaymentError) console.error("Error fetching basic pending payment count:", basicPendingPaymentError.message);
  if (premiumPendingPaymentError) console.error("Error fetching premium pending payment count:", premiumPendingPaymentError.message);
  if (premiumGoldPendingPaymentError) console.error("Error fetching premium gold pending payment count:", premiumGoldPendingPaymentError.message);

  return (
    <div className="space-y-6">
      <MainNav />
      <h1 className="text-3xl font-bold">Panel de Administración</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Anuncios Pendientes</CardTitle>
            <CardDescription>Anuncios que requieren aprobación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingListingsCount ?? 0}</div>
            <Link href="/admin/listings/pending" className="text-sm text-blue-600 hover:underline">
              Ver anuncios pendientes
            </Link>
          </CardContent>
        </Card>

        {/* Subscriptions Card */}
        <Card className="md:col-span-2"> {/* Make this card take up more space if needed, or adjust grid-cols */}
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">Subscripciones</CardTitle>
            <CardDescription>Usuarios por tipo de suscripcion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Basic Tier Section */}
              <div className="p-4 border rounded-lg shadow-sm bg-background flex flex-col justify-between">
                <div> {/* Top content */}
                  <h3 className="text-md font-semibold mb-2 text-muted-foreground min-h-[2.5rem] flex items-center">Usuarios con tarifa basica</h3>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 min-h-[3rem] flex items-center">{basicTierUsersCount ?? 0}</div>
                </div>
                <div className="space-y-1 text-sm my-2">
                  {/* Content for basic users can go here, e.g., a list. It will expand as needed. */}
                </div>
                <div> {/* Bottom content */}
                  <Link href={`/admin/user-overview`} className="text-sm text-blue-600 hover:underline block mb-1">
                    Ver Usuarios
                  </Link>
                  {(basicPendingPaymentCount ?? 0) > 0 ? (
                    <div className="text-xs text-yellow-700 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-500/20 p-2 rounded-md mt-1">
                      {basicPendingPaymentCount} usuario pendiente de validación.
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      No hay usuarios pendientes de validación.
                    </div>
                  )}
                </div>
              </div>

              {/* Premium Tier Section */}
              <div className="p-4 border rounded-lg shadow-sm bg-background flex flex-col justify-between">
                <div> {/* Top content */}
                  <h3 className="text-md font-semibold mb-2 text-muted-foreground min-h-[2.5rem] flex items-center">Usuarios con tarifa Premium</h3>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 min-h-[3rem] flex items-center">{premiumTierUsersCount ?? 0}</div>
                </div>
                <div className="space-y-1 text-sm my-2">
                  {/* Content for premium users. It will expand as needed. */}
                </div>
                <div> {/* Bottom content */}
                  <Link href={`/admin/user-overview`} className="text-sm text-blue-600 hover:underline block mb-1">
                    Ver Usuarios
                  </Link>
                  {(premiumPendingPaymentCount ?? 0) > 0 ? (
                    <div className="text-xs text-yellow-700 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-500/20 p-2 rounded-md mt-1">
                      {premiumPendingPaymentCount} usuario(s) pendiente(s) de validación.
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      No hay usuarios pendientes de validación.
                    </div>
                  )}
                </div>
              </div>

              {/* Premium Gold Tier Section */}
              <div className="p-4 border rounded-lg shadow-sm bg-background flex flex-col justify-between">
                <div> {/* Top content */}
                  <h3 className="text-md font-semibold mb-2 text-muted-foreground min-h-[2.5rem] flex items-center">Usuarios con Tarifa Premium gold</h3>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 min-h-[3rem] flex items-center">{premiumGoldTierUsersCount ?? 0}</div>
                </div>
                <div className="space-y-1 text-sm my-2">
                  {/* Content for premium gold users. It will expand as needed. */}
                </div>
                <div> {/* Bottom content */}
                  <Link href={`/admin/user-overview`} className="text-sm text-blue-600 hover:underline block mb-1">
                    Ver Usuarios
                  </Link>
                  {(premiumGoldPendingPaymentCount ?? 0) > 0 ? (
                    <div className="text-xs text-yellow-700 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-500/20 p-2 rounded-md mt-1">
                      {premiumGoldPendingPaymentCount} usuario(s) pendiente(s) de validación.
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      No hay usuarios pendientes de validación.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="pb-2">
            <CardTitle>Anuncios Activos</CardTitle>
            <CardDescription>Anuncios publicados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeListingsCount ?? 0}</div>
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
            <div className="text-3xl font-bold">{usersCount ?? 0}</div>
            <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">
              Gestionar usuarios
            </Link>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}
