"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Calendar } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  // Format date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.email) return "U"
    return user.email.charAt(0).toUpperCase()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />

      <main className="flex-1 py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">Mi perfil</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage
                      src={user?.user_metadata?.avatar_url || "/placeholder.svg"}
                      alt={user?.email || "User"}
                    />
                    <AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <CardTitle>{user?.user_metadata?.name || "Usuario"}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {user.email}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Miembro desde {formatDate(user.created_at)}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <div
                        className={`h-2 w-2 rounded-full mr-2 ${user.email_confirmed_at ? "bg-green-500" : "bg-amber-500"}`}
                      ></div>
                      <span>{user.email_confirmed_at ? "Email verificado" : "Email no verificado"}</span>
                    </div>

                    <Button variant="outline" className="w-full mt-4" asChild>
                      <a href="/dashboard/ajustes">Editar perfil</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Actividad reciente</CardTitle>
                  <CardDescription>Resumen de tu actividad en la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Mis anuncios</h3>
                      <div className="bg-muted rounded-lg p-6 text-center">
                        <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No has publicado ningún anuncio todavía</p>
                        <Button className="mt-4" asChild>
                          <a href="/dashboard/publicar">Publicar anuncio</a>
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Favoritos</h3>
                      <div className="bg-muted rounded-lg p-6 text-center">
                        <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No has guardado ningún anuncio como favorito</p>
                        <Button variant="outline" className="mt-4" asChild>
                          <a href="/servicios">Explorar anuncios</a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
