"use client"

import { useEffect, useState } from "react"
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
import { getSupabaseBrowserClient } from "@/lib/supabase"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [profileData, setProfileData] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return

      try {
        setProfileLoading(true)
        setProfileError(null)

        // Get the Supabase client
        const supabase = getSupabaseBrowserClient()

        // Fetch the profile with error handling
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

        if (error) {
          console.error("Error fetching profile:", error)
          setProfileError(error.message)
          // Continue with default profile data
        }

        // If we have data, use it. Otherwise, create a default profile object
        setProfileData(
          data || {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario",
            email: user.email,
          },
        )
      } catch (err) {
        console.error("Unexpected error fetching profile:", err)
        setProfileError(err instanceof Error ? err.message : "Unknown error")
        // Continue with default profile data
        setProfileData({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario",
          email: user.email,
        })
      } finally {
        setProfileLoading(false)
      }
    }

    if (user) {
      fetchProfileData()
    }
  }, [user])

  if (isLoading || profileLoading) {
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
    try {
      const date = new Date(timestamp)
      return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date)
    } catch (error) {
      return "Fecha desconocida"
    }
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (profileData?.full_name) {
      return profileData.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }

    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }

    return "U"
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

          {profileError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded mb-6">
              <p className="font-medium">Hubo un problema al cargar tu perfil</p>
              <p className="text-sm">
                Algunos datos pueden no mostrarse correctamente. Puedes intentar recargar la página.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage
                      src={profileData?.avatar_url || "/placeholder.svg"}
                      alt={profileData?.full_name || user?.email || "User"}
                    />
                    <AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <CardTitle>{profileData?.full_name || user?.email?.split("@")[0] || "Usuario"}</CardTitle>
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
                      <p className="text-sm text-muted-foreground">{profileData?.phone || "No especificado"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Dirección</p>
                      <p className="text-sm text-muted-foreground">
                        {profileData?.address
                          ? `${profileData.address}, ${profileData.city || ""} ${profileData.postal_code || ""}`
                          : "No especificada"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Sitio web</p>
                      <p className="text-sm text-muted-foreground">
                        {profileData?.website ? (
                          <a
                            href={profileData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {profileData.website.replace(/^https?:\/\//, "")}
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
                    {profileData?.bio && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Biografía</h3>
                        <p className="text-muted-foreground">{profileData.bio}</p>
                      </div>
                    )}

                    {profileData?.is_business && (
                      <div>
                        <h3 className="text-lg font-medium mb-2 flex items-center">
                          <Briefcase className="h-5 w-5 mr-2 text-primary" />
                          Información de negocio
                        </h3>
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle>{profileData.business_name || "Mi negocio"}</CardTitle>
                                <CardDescription>{profileData.business_type || "Negocio"}</CardDescription>
                              </div>
                              {profileData.is_verified && (
                                <Badge variant="outline" className="border-green-500 text-green-600">
                                  Verificado
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-0">
                            {profileData.business_description && (
                              <p className="text-sm text-muted-foreground">{profileData.business_description}</p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {profileData.business_phone && (
                                <div className="flex items-start gap-3">
                                  <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Teléfono</p>
                                    <p className="text-sm">{profileData.business_phone}</p>
                                  </div>
                                </div>
                              )}

                              {profileData.business_website && (
                                <div className="flex items-start gap-3">
                                  <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Sitio web</p>
                                    <a
                                      href={profileData.business_website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-primary hover:underline"
                                    >
                                      {profileData.business_website.replace(/^https?:\/\//, "")}
                                    </a>
                                  </div>
                                </div>
                              )}

                              {profileData.business_address && (
                                <div className="flex items-start gap-3 md:col-span-2">
                                  <Building className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Dirección</p>
                                    <p className="text-sm">
                                      {profileData.business_address}
                                      {profileData.business_city && `, ${profileData.business_city}`}
                                      {profileData.business_postal_code && ` ${profileData.business_postal_code}`}
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
                          <Link href="/dashboard/servicios/nuevo">Publicar anuncio</Link>
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
