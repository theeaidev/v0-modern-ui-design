"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Mail, Calendar, MapPin, Phone, Globe, Briefcase, Building, Edit } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold">Mi perfil</h1>
            <Button asChild>
              <Link href="/dashboard/profile" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editar perfil
              </Link>
            </Button>
          </div>

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
                      <Link href="/dashboard/profile">Editar perfil</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Información de contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Teléfono</p>
                      <p className="text-sm text-muted-foreground">{user.user_metadata?.phone || "No especificado"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Dirección</p>
                      <p className="text-sm text-muted-foreground">
                        {user.user_metadata?.address
                          ? `${user.user_metadata.address}, ${user.user_metadata.city || ""} ${
                              user.user_metadata.postal_code || ""
                            }`
                          : "No especificada"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Sitio web</p>
                      <p className="text-sm text-muted-foreground">
                        {user.user_metadata?.website ? (
                          <a
                            href={user.user_metadata.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {user.user_metadata.website.replace(/^https?:\/\//, "")}
                          </a>
                        ) : (
                          "No especificado"
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Información personal</CardTitle>
                  <CardDescription>Detalles de tu perfil personal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {user.user_metadata?.bio && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Biografía</h3>
                        <p className="text-muted-foreground">{user.user_metadata.bio}</p>
                      </div>
                    )}

                    {user.user_metadata?.is_business && (
                      <div>
                        <h3 className="text-lg font-medium mb-2 flex items-center">
                          <Briefcase className="h-5 w-5 mr-2 text-primary" />
                          Información de negocio
                        </h3>
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle>{user.user_metadata.business_name || "Mi negocio"}</CardTitle>
                                <CardDescription>{user.user_metadata.business_type || "Negocio"}</CardDescription>
                              </div>
                              {user.user_metadata.is_verified && (
                                <Badge variant="outline" className="border-green-500 text-green-600">
                                  Verificado
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-0">
                            {user.user_metadata.business_description && (
                              <p className="text-sm text-muted-foreground">{user.user_metadata.business_description}</p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {user.user_metadata.business_phone && (
                                <div className="flex items-start gap-3">
                                  <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Teléfono</p>
                                    <p className="text-sm">{user.user_metadata.business_phone}</p>
                                  </div>
                                </div>
                              )}

                              {user.user_metadata.business_website && (
                                <div className="flex items-start gap-3">
                                  <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Sitio web</p>
                                    <a
                                      href={user.user_metadata.business_website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-primary hover:underline"
                                    >
                                      {user.user_metadata.business_website.replace(/^https?:\/\//, "")}
                                    </a>
                                  </div>
                                </div>
                              )}

                              {user.user_metadata.business_address && (
                                <div className="flex items-start gap-3 md:col-span-2">
                                  <Building className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Dirección</p>
                                    <p className="text-sm">
                                      {user.user_metadata.business_address}
                                      {user.user_metadata.business_city && `, ${user.user_metadata.business_city}`}
                                      {user.user_metadata.business_postal_code &&
                                        ` ${user.user_metadata.business_postal_code}`}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="border-t pt-4">
                            <Button variant="outline" size="sm" className="ml-auto" asChild>
                              <Link href="/dashboard/profile">Editar información de negocio</Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-medium mb-2">Actividad reciente</h3>
                      <div className="bg-muted rounded-lg p-6 text-center">
                        <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No has publicado ningún anuncio todavía</p>
                        <Button className="mt-4" asChild>
                          <Link href="/dashboard/publicar">Publicar anuncio</Link>
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Favoritos</h3>
                      <div className="bg-muted rounded-lg p-6 text-center">
                        <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No has guardado ningún anuncio como favorito</p>
                        <Button variant="outline" className="mt-4" asChild>
                          <Link href="/servicios">Explorar anuncios</Link>
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
