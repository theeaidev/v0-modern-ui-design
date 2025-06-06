"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { User, Phone, MapPin, Globe, Briefcase, Upload, AlertCircle, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

import { updateProfile, uploadAvatar, uploadBusinessLogo } from "@/app/actions/profile"
import type { Profile, ProfileFormData } from "@/types/profile"

interface ProfileFormProps {
  profile: Profile;
  onSubmit: (formData: ProfileFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function ProfileForm({ profile, onSubmit, isSubmitting }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url)
  const [logoPreview, setLogoPreview] = useState<string | null>(profile.business_logo_url)
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: profile.full_name || "",
    phone: profile.phone || "",
    address: profile.address || "",
    city: profile.city || "",
    postal_code: profile.postal_code || "",
    country: profile.country || "España",
    bio: profile.bio || "",
    website: profile.website || "",
    is_business: profile.is_business || false,
    business_name: profile.business_name || "",
    business_type: profile.business_type || "",
    business_description: profile.business_description || "",
    business_website: profile.business_website || "",
    business_phone: profile.business_phone || "",
    business_address: profile.business_address || "",
    business_city: profile.business_city || "",
    business_postal_code: profile.business_postal_code || "",
    business_country: profile.business_country || "España",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_business: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setError(null); // Error handling is now managed by the wrapper via its onSubmit
    // setSuccess(false); // Success handling is now managed by the wrapper

    // Delegate submission to the onSubmit prop from the wrapper
    await onSubmit(formData);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    setIsLoading(true)
    setError(null)

    // Show preview
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Supabase
    const formData = new FormData()
    formData.append("avatar", file)

    try {
      const { error, avatarUrl } = await uploadAvatar(formData)

      if (error) {
        setError(error)
        return
      }

      // Refresh the page to show updated avatar
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred while uploading the avatar.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    setIsLoading(true)
    setError(null)

    // Show preview
    const reader = new FileReader()
    reader.onload = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Supabase
    const formData = new FormData()
    formData.append("logo", file)

    try {
      const { error, logoUrl } = await uploadBusinessLogo(formData)

      if (error) {
        setError(error)
        return
      }

      // Refresh the page to show updated logo
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred while uploading the logo.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!formData.full_name) return "U"
    return formData.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Tu perfil ha sido actualizado correctamente.</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <Card className="w-full md:w-64 h-fit">
          <CardHeader>
            <CardTitle>Foto de perfil</CardTitle>
            <CardDescription>Sube una foto para tu perfil</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={avatarPreview || "/placeholder.svg"} alt="Avatar" />
                <AvatarFallback className="text-3xl">{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <Label
                  htmlFor="avatar"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  <Upload className="h-4 w-4" />
                  <span className="sr-only">Upload avatar</span>
                </Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Haz clic en el icono para subir una nueva foto. Recomendamos una imagen cuadrada de al menos 300x300px.
            </p>
          </CardContent>
        </Card>

        <div className="flex-1">
          <Tabs defaultValue="personal">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Información personal</TabsTrigger>
              <TabsTrigger value="business">Información de negocio</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="full_name"
                      name="full_name"
                      placeholder="Tu nombre completo"
                      className="pl-10"
                      value={formData.full_name}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Tu número de teléfono"
                      className="pl-10"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Cuéntanos un poco sobre ti..."
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Sitio web</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="website"
                      name="website"
                      placeholder="https://tu-sitio-web.com"
                      className="pl-10"
                      value={formData.website}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="address"
                      name="address"
                      placeholder="Tu dirección"
                      className="pl-10"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Tu ciudad"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Código postal</Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      placeholder="Tu código postal"
                      value={formData.postal_code}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="Tu país"
                    value={formData.country}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="business" className="space-y-6 pt-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_business"
                  checked={formData.is_business}
                  onCheckedChange={handleSwitchChange}
                  disabled={isLoading}
                />
                <Label htmlFor="is_business">Tengo un negocio</Label>
              </div>

              {formData.is_business && (
                <div className="space-y-6 pt-4">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Logo del negocio</CardTitle>
                      <CardDescription>Sube un logo para tu negocio</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <div className="h-32 w-32 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                          {logoPreview ? (
                            <Image
                              src={logoPreview || "/placeholder.svg"}
                              alt="Logo"
                              width={128}
                              height={128}
                              className="object-contain"
                            />
                          ) : (
                            <Briefcase className="h-12 w-12 text-muted-foreground" />
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-2">
                          <Label
                            htmlFor="logo"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                          >
                            <Upload className="h-4 w-4" />
                            <span className="sr-only">Upload logo</span>
                          </Label>
                          <Input
                            id="logo"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoChange}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Haz clic en el icono para subir un logo. Recomendamos una imagen cuadrada de al menos 300x300px.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="business_name">Nombre del negocio</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="business_name"
                          name="business_name"
                          placeholder="Nombre de tu negocio"
                          className="pl-10"
                          value={formData.business_name}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_type">Tipo de negocio</Label>
                      <Input
                        id="business_type"
                        name="business_type"
                        placeholder="Ej: Restaurante, Tienda, Servicios..."
                        value={formData.business_type}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_description">Descripción del negocio</Label>
                      <Textarea
                        id="business_description"
                        name="business_description"
                        placeholder="Describe tu negocio..."
                        rows={4}
                        value={formData.business_description}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_website">Sitio web del negocio</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="business_website"
                          name="business_website"
                          placeholder="https://tu-negocio.com"
                          className="pl-10"
                          value={formData.business_website}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_phone">Teléfono del negocio</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="business_phone"
                          name="business_phone"
                          placeholder="Teléfono de contacto del negocio"
                          className="pl-10"
                          value={formData.business_phone}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="business_address">Dirección del negocio</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="business_address"
                          name="business_address"
                          placeholder="Dirección del negocio"
                          className="pl-10"
                          value={formData.business_address}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="business_city">Ciudad</Label>
                        <Input
                          id="business_city"
                          name="business_city"
                          placeholder="Ciudad del negocio"
                          value={formData.business_city}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business_postal_code">Código postal</Label>
                        <Input
                          id="business_postal_code"
                          name="business_postal_code"
                          placeholder="Código postal del negocio"
                          value={formData.business_postal_code}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_country">País</Label>
                      <Input
                        id="business_country"
                        name="business_country"
                        placeholder="País del negocio"
                        value={formData.business_country}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}
