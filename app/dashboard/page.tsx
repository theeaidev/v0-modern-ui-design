"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PencilIcon } from "lucide-react"
import { Trash2 } from "lucide-react"; // Assuming Eye icon is also imported from lucide-react, you might group them.
import { toast } from "sonner";
import { toggleFavorite } from "@/app/actions/service-listings";
import { User, Mail, Calendar, MapPin, Phone, Globe, Briefcase, Building, Edit, Heart, Eye } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { getFavoritedServiceListings } from "@/app/actions/service-listings"
import { updateProfileData } from "@/app/actions/profile-actions" // Added import

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Ensure favoritedAds and setFavoritedAds are defined in this component's state
  // e.g., const [favoritedAds, setFavoritedAds] = useState<Array<{id: string, title?: string}>>([]);

  const handleRemoveFavorite = async (adId: string, adTitle?: string) => {
    try {
      // Assuming toggleFavorite is designed to remove if already favorited and handles user context
      await toggleFavorite(adId);
      
      // Update UI optimistically
      setFavoritedAds((prevAds) => prevAds.filter(ad => ad.id !== adId));
      toast.success(`${adTitle ? `"${adTitle}"` : 'Anuncio'} eliminado de favoritos.`);
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("No se pudo eliminar de favoritos. Por favor, inténtalo de nuevo.");
    }
  };
  const [profileData, setProfileData] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [fetchAttempted, setFetchAttempted] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [fullName, setFullName] = useState<string>("") // Added for name
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false) // Renamed from isUpdatingAvatar
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [favoritedAds, setFavoritedAds] = useState<{ id: string; title: string | null }[]>([])
  const [favoritedAdsLoading, setFavoritedAdsLoading] = useState(true)
  const [favoritedAdsError, setFavoritedAdsError] = useState<string | null>(null)

  console.log("[DASHBOARD] Rendering dashboard, user:", !!user, "isLoading:", isLoading)

  // Redirect if not logged in
  useEffect(() => {
    console.log("[DASHBOARD] Auth check effect, user:", !!user, "isLoading:", isLoading)
    if (!isLoading && !user) {
      console.log("[DASHBOARD] No user, redirecting to login")
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Fetch profile data directly from Supabase (no server action)
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        console.log("[DASHBOARD] No user, skipping profile fetch")
        return
      }

      console.log("[DASHBOARD] Fetching profile data for user:", user.id)
      try {
        setProfileLoading(true)
        setProfileError(null)

        // Create a default profile with user data
        const defaultProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario",
          email: user.email,
        }

        console.log("[DASHBOARD] Default profile created:", defaultProfile)

        // Try to fetch profile directly from Supabase
        try {
          console.log("[DASHBOARD] Getting Supabase browser client")
          const supabase = getSupabaseBrowserClient()
          console.log("[DASHBOARD] Supabase browser client obtained")

          console.log("[DASHBOARD] Fetching profile from Supabase")
          const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
          console.log("[DASHBOARD] Profile fetch result:", !!data, "error:", !!error)

          if (error) {
            console.error("[DASHBOARD] Error fetching profile:", error)
            setProfileError(error.message)
            // Use default profile
            setProfileData(defaultProfile)
          } else {
            // Use fetched profile or default if null
            console.log("[DASHBOARD] Setting profile data:", data || defaultProfile)
            setProfileData(data || defaultProfile)
          }
        } catch (fetchError) {
          console.error("[DASHBOARD] Error fetching from Supabase:", fetchError)
          setProfileError(fetchError instanceof Error ? fetchError.message : "Failed to fetch profile")
          // Use default profile on error
          setProfileData(defaultProfile)
        }
      } catch (err) {
        console.error("[DASHBOARD] Unexpected error in dashboard:", err)
        setProfileError(err instanceof Error ? err.message : "Unknown error")
        // Set a minimal default profile
        setProfileData({
          id: user.id,
          full_name: user.email?.split("@")[0] || "Usuario",
          email: user.email,
        })
      } finally {
        setProfileLoading(false)
        setFetchAttempted(true)
        console.log("[DASHBOARD] Profile fetch completed")
      }
    }

    if (user && !fetchAttempted) {
      console.log("[DASHBOARD] Starting profile fetch")
      fetchProfileData()
    }

    const fetchFavoritedAds = async () => {
      if (!user) return
      try {
        setFavoritedAdsLoading(true)
        setFavoritedAdsError(null)
        const ads = await getFavoritedServiceListings()
        setFavoritedAds(ads)
      } catch (error) {
        console.error("[DASHBOARD] Error fetching favorited ads:", error)
        setFavoritedAdsError(error instanceof Error ? error.message : "Failed to load favorites")
      } finally {
        setFavoritedAdsLoading(false)
      }
    }

    if (user) {
      fetchFavoritedAds()
    }
  }, [user, fetchAttempted])

  // Handler to update profile (name and avatar)
  const handleUpdateProfile = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para actualizar tu perfil.")
      return
    }

    setIsUpdatingProfile(true)
    try {
      const updates = {
        full_name: fullName,
        avatar_url: avatarUrl,
      }

      const { success, error } = await updateProfileData(user.id, updates)

      if (error || !success) {
        throw new Error(error || "Error desconocido al actualizar el perfil.")
      }

      // Update local profile data optimistically
      setProfileData((prevProfile: any) => ({
        ...prevProfile,
        ...updates,
      }))
      // Also update the individual state for inputs if they are not directly bound to profileData
      setAvatarUrl(updates.avatar_url)
      setFullName(updates.full_name)

      toast.success("Perfil actualizado correctamente.")
      setIsDialogOpen(false) // Close dialog on success
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast.error(`Error al actualizar el perfil: ${error.message}`)
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // Show loading state
  if (isLoading || (profileLoading && !fetchAttempted)) {
    console.log("[DASHBOARD] Showing loading state")
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

  // Redirect if not logged in
  if (!user) {
    console.log("[DASHBOARD] No user, returning null (will redirect)")
    return null // Will redirect in useEffect
  }

  console.log("[DASHBOARD] Rendering dashboard content")

  // Format date safely
  const formatDate = (timestamp: string) => {
    if (!timestamp) return "Fecha desconocida"

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
{/*             <Button asChild>
              <Link href="/dashboard/profile" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editar perfil
              </Link>
            </Button> */}
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
                  <div className="relative">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage
                        src={profileData?.avatar_url || "/placeholder.svg"}
                        alt={profileData?.full_name || user?.email || "User"}
                      />
                      <AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border shadow hover:bg-muted"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Editar perfil</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar perfil</DialogTitle>
                          <DialogDescription>
                            Actualiza tu nombre y foto de perfil.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="full-name" className="text-right">
                              Nombre de Usuario
                            </Label>
                            <Input 
                              id="full-name" 
                              value={fullName} 
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Tu nombre de usuario"
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="avatar-url" className="text-right">
                              URL de imagen
                            </Label>
                            <Input 
                              id="avatar-url" 
                              value={avatarUrl} 
                              onChange={(e) => setAvatarUrl(e.target.value)}
                              placeholder="https://ejemplo.com/imagen.jpg"
                              className="col-span-3"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={handleUpdateProfile} 
                            disabled={isUpdatingProfile}
                          >
                            {isUpdatingProfile ? "Guardando..." : "Guardar cambios"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
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

{/*                     <Button variant="outline" className="w-full mt-4" asChild>
                      <Link href="/dashboard/profile">Editar perfil</Link>
                    </Button> */}
                  </div>
                </CardContent>
              </Card>

{/*               <Card className="mt-6">
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
              </Card> */}
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

{/*                     <div>
                      <h3 className="text-lg font-medium mb-2">Actividad reciente</h3>
                      <div className="bg-muted rounded-lg p-6 text-center">
                        <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No has publicado ningún anuncio todavía</p>
                        <Button className="mt-4" asChild>
                          <Link href="/dashboard/servicios/nuevo">Publicar anuncio</Link>
                        </Button>
                      </div>
                    </div> */}

                    <div>
                      <h3 className="text-lg font-medium mb-2">Favoritos</h3>
                      <Card>
                        <CardHeader>
                          <CardTitle>Favoritos</CardTitle>
                          <CardDescription>Anuncios que has guardado</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {favoritedAdsLoading ? (
                            <div className="flex justify-center items-center h-24">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                          ) : favoritedAdsError ? (
                            <div className="text-red-500 text-center">
                              <p>Error al cargar favoritos: {favoritedAdsError}</p>
                            </div>
                          ) : favoritedAds.length > 0 ? (
                            <ul className="space-y-4">
                              {favoritedAds.map(ad => (
                                <li key={ad.id} className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between p-3 bg-muted/50 rounded-md">
                                  <span className="font-medium truncate w-full mb-2 sm:mb-0 sm:flex-1 sm:min-w-0 sm:pr-2" title={ad.title || 'Anuncio sin título'}>{ad.title || "Anuncio sin título"}</span>
                                  <div className="flex items-center space-x-2 self-end sm:self-center">
                                    <Button variant="outline" size="sm" asChild>
                                      <Link href={`/servicios/${ad.id}`} className="flex items-center gap-1.5">
                                        <Eye className="h-4 w-4" />
                                        Ver Anuncio
                                      </Link>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveFavorite(ad.id, ad.title || undefined)}
                                      className="flex items-center gap-1.5 text-destructive hover:text-destructive/80"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Eliminar de favoritos
                                    </Button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="bg-muted rounded-lg p-6 text-center">
                              <Heart className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-muted-foreground">No has guardado ningún anuncio como favorito</p>
                              <Button variant="outline" className="mt-4" asChild>
                                <Link href="/servicios">Explorar anuncios</Link>
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
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
