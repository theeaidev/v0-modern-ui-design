"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import type { ServiceListing, Category, Subcategory } from "@/types/service"
import {
  createServiceListing,
  updateServiceListing,
  getCategories,
  getSubcategories,
} from "@/app/actions/service-listings"

// Define the form schema with Zod
const formSchema = z.object({
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(100, "El título no puede exceder los 100 caracteres"),
  description: z
    .string()
    .min(20, "La descripción debe tener al menos 20 caracteres")
    .max(500, "La descripción no puede exceder los 500 caracteres"),
  long_description: z.string().max(5000, "La descripción larga no puede exceder los 5000 caracteres").optional(),
  category_id: z.coerce.number().min(1, "Debes seleccionar una categoría"),
  subcategory_id: z.coerce.number().optional(),
  price: z.string().optional(),
  price_type: z.enum(["fixed", "hourly", "daily", "monthly", "variable", "free", "contact"]),
  location: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default("España"),
  address: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email("Introduce un email válido").optional(),
  contact_whatsapp: z.string().optional(),
  contact_website: z.string().url("Introduce una URL válida").optional(),
  status: z.enum(["draft", "pending_approval", "active", "paused", "rejected"]),
})

type FormValues = z.infer<typeof formSchema>

interface ServiceListingFormProps {
  listing?: ServiceListing
  mode: "create" | "edit"
}

export function ServiceListingForm({ listing, mode }: ServiceListingFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [activeTab, setActiveTab] = useState("basic")

  // Initialize the form with default values or existing listing data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: listing?.title || "",
      description: listing?.description || "",
      long_description: listing?.long_description || "",
      category_id: listing?.category_id || 0,
      subcategory_id: listing?.subcategory_id || undefined,
      price: listing?.price || "",
      price_type: listing?.price_type || "fixed",
      location: listing?.location || "",
      city: listing?.city || "",
      postal_code: listing?.postal_code || "",
      country: listing?.country || "España",
      address: listing?.address || "",
      contact_phone: listing?.contact_phone || "",
      contact_email: listing?.contact_email || "",
      contact_whatsapp: listing?.contact_whatsapp || "",
      contact_website: listing?.contact_website || "",
      status: listing?.status || "draft",
    },
  })

  // Watch for category changes to load subcategories
  const watchedCategoryId = form.watch("category_id")
  const watchedStatus = form.watch("status")

  // Load categories on component mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Error loading categories:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las categorías",
          variant: "destructive",
        })
      }
    }

    loadCategories()
  }, [toast])

  // Load subcategories when category changes
  useEffect(() => {
    async function loadSubcategories() {
      if (watchedCategoryId) {
        try {
          const data = await getSubcategories(watchedCategoryId)
          setSubcategories(data)
        } catch (error) {
          console.error("Error loading subcategories:", error)
          setSubcategories([])
        }
      } else {
        setSubcategories([])
      }
    }

    loadSubcategories()
  }, [watchedCategoryId])

  // Handle form submission
  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    // If user selected "active", change it to "pending_approval" for new listings
    if (mode === "create" && values.status === "active") {
      values.status = "pending_approval"
    }

    try {
      if (mode === "create") {
        const result = await createServiceListing(values)
        toast({
          title: "Anuncio creado",
          description:
            values.status === "pending_approval"
              ? "Tu anuncio ha sido enviado para revisión y será publicado una vez aprobado."
              : "Tu anuncio ha sido guardado como borrador.",
        })
        router.push(`/dashboard/servicios/success?id=${result.data.id}`)
      } else if (mode === "edit" && listing) {
        // For edits, if changing from draft to active, set to pending_approval
        if (listing.status === "draft" && values.status === "active") {
          values.status = "pending_approval"
        }

        await updateServiceListing(listing.id, values)
        toast({
          title: "Anuncio actualizado",
          description:
            values.status === "pending_approval"
              ? "Tu anuncio ha sido enviado para revisión y será publicado una vez aprobado."
              : "Tu anuncio ha sido actualizado correctamente.",
        })
        router.push(`/dashboard/servicios/${listing.id}`)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al guardar el anuncio",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Información básica</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="contact">Contacto</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del anuncio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Clases de español para extranjeros" {...field} />
                  </FormControl>
                  <FormDescription>Un título claro y descriptivo para tu anuncio.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción corta</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Breve descripción de tu servicio o producto" {...field} rows={3} />
                  </FormControl>
                  <FormDescription>Esta descripción aparecerá en los resultados de búsqueda.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="long_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción detallada (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe en detalle tu servicio, producto o anuncio"
                      {...field}
                      rows={6}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Puedes incluir más detalles, características y beneficios.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseInt(value))}
                      value={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subcategory_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategoría (opcional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseInt(value))}
                      value={field.value ? field.value.toString() : undefined}
                      disabled={!watchedCategoryId || subcategories.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una subcategoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subcategories.map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 25€" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Puedes incluir el precio o un rango de precios.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de precio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo de precio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixed">Precio fijo</SelectItem>
                        <SelectItem value="hourly">Por hora</SelectItem>
                        <SelectItem value="daily">Por día</SelectItem>
                        <SelectItem value="monthly">Por mes</SelectItem>
                        <SelectItem value="variable">Variable</SelectItem>
                        <SelectItem value="free">Gratis</SelectItem>
                        <SelectItem value="contact">Contactar</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado del anuncio</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1 sm:flex-row sm:space-x-4 sm:space-y-0"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="active" />
                        </FormControl>
                        <FormLabel className="font-normal">Publicar</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="draft" />
                        </FormControl>
                        <FormLabel className="font-normal">Borrador</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="paused" />
                        </FormControl>
                        <FormLabel className="font-normal">Pausado</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>Los anuncios en borrador no serán visibles para otros usuarios.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedStatus === "active" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Información importante</AlertTitle>
                <AlertDescription>
                  Tu anuncio será revisado por nuestro equipo antes de ser publicado. Este proceso puede tardar hasta 24
                  horas.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="button" onClick={() => setActiveTab("details")}>
                Siguiente
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Madrid" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Centro" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>Barrio o zona dentro de la ciudad.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código postal</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: 28001" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="mt-6">
                      <FormLabel>Dirección (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Calle Gran Vía 1" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>Esta información solo será visible si decides compartirla.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                Anterior
              </Button>
              <Button type="button" onClick={() => setActiveTab("contact")}>
                Siguiente
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono de contacto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: +34 612 345 678" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de contacto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: contacto@ejemplo.com" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contact_whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: +34612345678" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>Número de WhatsApp sin espacios ni guiones.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sitio web (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: https://www.ejemplo.com" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                Anterior
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Crear anuncio" : "Actualizar anuncio"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}
