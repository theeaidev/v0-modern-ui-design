"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, AlertCircle, UploadCloud, Trash2, FileText, Video as VideoIcon, Image as ImageIcon } from "lucide-react"
import NextImage from "next/image" // Renamed to avoid conflict with ImageIcon

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import supabase from "@/lib/client" // Assuming lib/client.ts or lib/supabase/client.ts
import { v4 as uuidv4 } from 'uuid';
import type { User } from '@supabase/supabase-js';

import type { ServiceListing, Category, Subcategory, ServiceListingFormData } from "@/types/service" // Ensure this type includes image_urls and video_urls
import {
  createServiceListing,
  updateServiceListing,
  getCategories,
  getSubcategories,
} from "@/app/actions/service-listings"

const MAX_IMAGE_SIZE_MB = 2;
const MAX_VIDEO_SIZE_MB = 10;
const MAX_IMAGE_FILES = 10;
const MAX_VIDEO_FILES = 1;

// Define the form schema with Zod
// File inputs will be handled separately, not directly in Zod for react-hook-form values
// The final image_urls and video_urls (string arrays) will be part of ServiceListingFormData sent to backend.
const formSchema = z.object({
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(50, "El título no puede exceder los 50 caracteres"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción no puede exceder los 500 caracteres"),
  long_description: z.string().max(1000, "La descripción larga no puede exceder los 1000 caracteres").optional(),
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
  contact_email: z.string().email("Introduce un email válido"),
  contact_whatsapp: z.string().optional(),
  contact_website: z.string().url("Introduce una URL válida").optional().or(z.literal("")),
  status: z.enum(["draft", "pending_approval", "active", "paused", "rejected", "expired"]),
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
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [activeTab, setActiveTab] = useState("basic")
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // File states
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [selectedVideoFiles, setSelectedVideoFiles] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<{ name: string; url: string }[]>([]); // Using object URLs for video previews
  const [existingVideoUrls, setExistingVideoUrls] = useState<string[]>([]);
  const [videosToDelete, setVideosToDelete] = useState<string[]>([]);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log("Current user:", user);
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Error de autenticación",
          description: "No se pudo obtener la información del usuario.",
          variant: "destructive",
        });
      }
    };
    fetchUser();
  }, [toast]);

  useEffect(() => {
    if (listing) {
      setExistingImageUrls(listing.image_urls || []);
      setExistingVideoUrls(listing.video_urls || []);
    }
  }, [listing]);

  // Initialize the form with default values or existing listing data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    async function loadCategories() {
      setIsLoadingCategories(true)
      try {
        const data = await getCategories()
        console.log("Categories loaded:", data)
        setCategories(data)

        // If we have a listing with a category, load its subcategories
        if (listing?.category_id) {
          loadSubcategoriesForCategory(listing.category_id)
        }
      } catch (error) {
        console.error("Error loading categories:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las categorías",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing]) // Keep toast out if it causes re-runs, or memoize it

  // Function to load subcategories for a specific category
  async function loadSubcategoriesForCategory(categoryId: number) {
    if (!categoryId) return

    setIsLoadingSubcategories(true)
    try {
      const data = await getSubcategories(categoryId)
      console.log(`Subcategories loaded for category ${categoryId}:`, data)
      setSubcategories(data)
    } catch (error) {
      console.error("Error loading subcategories:", error)
      setSubcategories([]) // Clear subcategories on error
    } finally {
      setIsLoadingSubcategories(false)
    }
  }

  // Load subcategories when category changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (watchedCategoryId) {
      loadSubcategoriesForCategory(watchedCategoryId)
    } else {
      setSubcategories([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCategoryId])

  // File handling functions
  const handleImageFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const newFiles = files.filter(file => file.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024);
    if (newFiles.length !== files.length) {
      toast({ title: "Archivo grande", description: `Algunas imágenes exceden el tamaño máximo de ${MAX_IMAGE_SIZE_MB}MB.`, variant: "warning" });
    }

    if (selectedImageFiles.length + newFiles.length > MAX_IMAGE_FILES) {
      toast({ title: "Límite alcanzado", description: `Puedes subir un máximo de ${MAX_IMAGE_FILES} imágenes.`, variant: "warning" });
      return;
    }

    setSelectedImageFiles(prev => [...prev, ...newFiles]);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    if (imageInputRef.current) imageInputRef.current.value = ""; // Reset input
  };

  const removeSelectedImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const markExistingImageForDeletion = (url: string) => {
    setImagesToDelete(prev => [...prev, url]);
    setExistingImageUrls(prev => prev.filter(u => u !== url));
  };

  const handleVideoFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const newFiles = files.filter(file => file.size <= MAX_VIDEO_SIZE_MB * 1024 * 1024);
    if (newFiles.length !== files.length) {
      toast({ title: "Archivo grande", description: `Algunos videos exceden el tamaño máximo de ${MAX_VIDEO_SIZE_MB}MB.`, variant: "warning" });
    }

    if (selectedVideoFiles.length + newFiles.length > MAX_VIDEO_FILES) {
      toast({ title: "Límite alcanzado", description: `Puedes subir un máximo de ${MAX_VIDEO_FILES} videos.`, variant: "warning" });
      return;
    }
    
    setSelectedVideoFiles(prev => [...prev, ...newFiles]);
    const newVidPreviews = newFiles.map(file => ({ name: file.name, url: URL.createObjectURL(file) }));
    setVideoPreviews(prev => [...prev, ...newVidPreviews]);
    if (videoInputRef.current) videoInputRef.current.value = ""; // Reset input
  };

  const removeSelectedVideo = (index: number) => {
    URL.revokeObjectURL(videoPreviews[index].url);
    setVideoPreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedVideoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const markExistingVideoForDeletion = (url: string) => {
    setVideosToDelete(prev => [...prev, url]);
    setExistingVideoUrls(prev => prev.filter(u => u !== url));
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      videoPreviews.forEach(item => URL.revokeObjectURL(item.url));
    };
  }, [imagePreviews, videoPreviews]);

  // Helper to upload a single file
  async function uploadSupabaseFile(file: File, userId: string, mediaType: 'images' | 'videos'): Promise<string> {
    const fileName = `${uuidv4()}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = `${userId}/${mediaType}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('service-listings')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.error('Error uploading file:', filePath, error);
      throw new Error(`Error al subir ${file.name}: ${error.message}`);
    }
    const { data: publicUrlData } = supabase.storage.from('service-listings').getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  }

  // Helper to delete a file from Supabase storage
  async function deleteSupabaseFile(fileUrl: string) {
    try {
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      // Path is typically /storage/v1/object/public/bucket-name/actual-path-to-file
      // We need to extract 'actual-path-to-file'
      const filePath = pathParts.slice(5).join('/'); 
      if (!filePath) {
        console.warn('Could not extract file path from URL for deletion:', fileUrl);
        return;
      }
      console.log('Deleting file path:', filePath);
      const { error } = await supabase.storage.from('service-listings').remove([filePath]);
      if (error) {
        console.error('Error deleting file from Supabase:', filePath, error);
        toast({ title: "Error al eliminar archivo", description: `No se pudo eliminar ${filePath}.`, variant: "destructive" });
      }
    } catch (e) {
      console.error('Error parsing URL for file deletion:', fileUrl, e);
    }
  }

  // Handle form submission
  async function onSubmit(values: FormValues) {
    // Double-check user authentication
    if (!currentUser) {
      // Try to get the user again in case the session was updated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error de autenticación", description: "Debes iniciar sesión para crear o editar anuncios.", variant: "destructive" });
        
        // Try to refresh the session
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.error("Error refreshing session:", error);
          return;
        }
        
        // Check if we got a user after refresh
        const { data: { user: refreshedUser } } = await supabase.auth.getUser();
        if (!refreshedUser) {
          router.push('/auth/login?redirect=/dashboard/servicios/crear');
          return;
        }
        
        setCurrentUser(refreshedUser);
      } else {
        setCurrentUser(user);
      }
    }
    
    // Final check - if still no user, abort
    if (!currentUser) {
      toast({ title: "Error de autenticación", description: "No se pudo verificar tu sesión. Por favor, inicia sesión nuevamente.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    setIsUploading(true);

    let finalImageUrls: string[] = [...existingImageUrls];
    let finalVideoUrls: string[] = [...existingVideoUrls];
    const userId = currentUser.id;
    
    console.log("Using user ID for uploads and form submission:", userId);

    try {
      // 1. Handle deletions from Supabase Storage
      for (const url of imagesToDelete) await deleteSupabaseFile(url);
      for (const url of videosToDelete) await deleteSupabaseFile(url);

      // 2. Handle uploads to Supabase Storage
      const uploadedImageUrls = await Promise.all(
        selectedImageFiles.map(file => uploadSupabaseFile(file, userId, 'images'))
      );
      finalImageUrls.push(...uploadedImageUrls);

      const uploadedVideoUrls = await Promise.all(
        selectedVideoFiles.map(file => uploadSupabaseFile(file, userId, 'videos'))
      );
      finalVideoUrls.push(...uploadedVideoUrls);

      // 3. Prepare data for backend
      let intendedUserFacingStatus = values.status;
      if (mode === "create" && values.status === "active") {
        intendedUserFacingStatus = "pending_approval";
      } else if (mode === "edit" && listing && listing.status === "draft" && values.status === "active") {
        intendedUserFacingStatus = "pending_approval";
      }

      // Make sure we're logged in - this should ensure the server-side function can access the user session
      await supabase.auth.refreshSession();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No hay sesión activa. Por favor, inicia sesión nuevamente.");
      }
      
      console.log("Active session confirmed before form submission");
      
      const dataForBackend: ServiceListingFormData = {
        ...values,
        category_id: Number(values.category_id),
        subcategory_id: values.subcategory_id ? Number(values.subcategory_id) : undefined,
        status:
          intendedUserFacingStatus === "active" || intendedUserFacingStatus === "pending_approval"
            ? "active"
            : intendedUserFacingStatus === "paused"
            ? "paused"
            : "draft",
        image_urls: finalImageUrls.filter(url => !!url), // Ensure no empty/null URLs
        video_urls: finalVideoUrls.filter(url => !!url),
      };

      // 4. Call backend actions
      if (mode === "create") {
        // If using pathPrefixId = uuidv4() for uploads before creation, the backend needs to know this ID
        // or the paths need to be updated by backend after real ID is known.
        // For now, assuming backend can handle URLs as provided.
        const result = await createServiceListing(dataForBackend);
        toast({
          title: "Anuncio creado",
          description: intendedUserFacingStatus === "pending_approval"
            ? "Tu anuncio ha sido enviado para revisión."
            : `Tu anuncio ha sido guardado como ${intendedUserFacingStatus === "draft" ? "borrador" : intendedUserFacingStatus}.`,
        });
        if (result && result.data && result.data.id) {
          router.push(`/dashboard/servicios/success?id=${result.data.id}`);
        } else {
          router.push("/dashboard/servicios");
          console.warn("Service listing created, but ID not found in response for redirection.");
        }
      } else if (mode === "edit" && listing) {
        await updateServiceListing(listing.id, dataForBackend);
        toast({
          title: "Anuncio actualizado",
          description: intendedUserFacingStatus === "pending_approval"
            ? "Tus cambios han sido enviados para revisión."
            : `Tu anuncio ha sido actualizado (estado: ${intendedUserFacingStatus}).`,
        });
        router.push(`/dashboard/servicios/${listing.id}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error al guardar",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al guardar el anuncio",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
      // Clear selections after submission attempt
      // setSelectedImageFiles([]); setImagePreviews([]);
      // setSelectedVideoFiles([]); setVideoPreviews([]);
      // setImagesToDelete([]); setVideosToDelete([]);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4"> {/* Updated to 4 columns */}
            <TabsTrigger value="basic">Información básica</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="multimedia">Multimedia</TabsTrigger> {/* New Multimedia Tab */}
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
                  <FormDescription>Un título claro y descriptivo para tu anuncio. Min 5 caracteres, Max 50 caracteres</FormDescription>
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
                  <FormDescription>Esta descripción aparecerá en los resultados de búsqueda. Min 10 caracteres, Max 500 caracteres</FormDescription>
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
                  <FormDescription>Puedes incluir más detalles, características y beneficios. Min 10 caracteres, Max 1000 caracteres.</FormDescription>
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
                      disabled={isLoadingCategories}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={isLoadingCategories ? "Cargando categorías..." : "Selecciona una categoría"}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingCategories ? (
                          <SelectItem value="loading" disabled>
                            Cargando categorías...
                          </SelectItem>
                        ) : categories.length > 0 ? (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No hay categorías disponibles
                          </SelectItem>
                        )}
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
                      disabled={!watchedCategoryId || isLoadingSubcategories}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !watchedCategoryId
                                ? "Primero selecciona una categoría"
                                : isLoadingSubcategories
                                  ? "Cargando subcategorías..."
                                  : "Selecciona una subcategoría"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {!watchedCategoryId ? (
                          <SelectItem value="none" disabled>
                            Primero selecciona una categoría
                          </SelectItem>
                        ) : isLoadingSubcategories ? (
                          <SelectItem value="loading" disabled>
                            Cargando subcategorías...
                          </SelectItem>
                        ) : subcategories.length > 0 ? (
                          subcategories.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                              {subcategory.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No hay subcategorías disponibles
                          </SelectItem>
                        )}
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

          {/* Details Tab Content - No changes shown, but ensure it exists */}
          <TabsContent value="details" className="space-y-6 pt-4"> 
            {/* ... existing fields for city, location, postal_code, country, address ... */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input placeholder="Ej: Madrid" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Ubicación</FormLabel><FormControl><Input placeholder="Ej: Centro" {...field} value={field.value || ""} /></FormControl><FormDescription>Barrio o zona dentro de la ciudad.</FormDescription><FormMessage /></FormItem>)} />
                </div>
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField control={form.control} name="postal_code" render={({ field }) => (<FormItem><FormLabel>Código postal</FormLabel><FormControl><Input placeholder="Ej: 28001" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>País</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="address" render={({ field }) => (<FormItem className="mt-6"><FormLabel>Dirección (opcional)</FormLabel><FormControl><Input placeholder="Ej: Calle Gran Vía 1" {...field} value={field.value || ""} /></FormControl><FormDescription>Esta información solo será visible si decides compartirla.</FormDescription><FormMessage /></FormItem>)} />
              </CardContent>
            </Card>
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                Anterior
              </Button>
              <Button type="button" onClick={() => setActiveTab("multimedia")}> {/* Changed to multimedia */}
                Siguiente
              </Button>
            </div>
          </TabsContent>

          {/* Multimedia Tab Content */}
          <TabsContent value="multimedia" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Archivos Multimedia</CardTitle>
                <FormDescription>
                  Sube hasta {MAX_IMAGE_FILES} imágenes (en la Tarifa Premium ) - (6 imagenes en la Tarifa Básica) (JPG, PNG, WEBP, max {MAX_IMAGE_SIZE_MB}MB cada una) y hasta {MAX_VIDEO_FILES} video (Solo Tarifa Premium) (MP4, MOV, max {MAX_VIDEO_SIZE_MB}MB).
                </FormDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Image Upload Section */}
                <div className="space-y-4">
                  <FormLabel htmlFor="image-upload">Imágenes del Anuncio</FormLabel>
                  <Input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageFilesChange}
                    ref={imageInputRef}
                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    disabled={isUploading || selectedImageFiles.length >= MAX_IMAGE_FILES}
                  />
                  {(imagePreviews.length > 0 || existingImageUrls.length > 0) && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {existingImageUrls.map((url) => (
                        <div key={url} className="relative group aspect-square">
                          <NextImage src={url} alt="Imagen existente" layout="fill" objectFit="cover" className="rounded-md border" />
                          <Button
                            type="button" variant="destructive" size="icon"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-7 w-7"
                            onClick={() => markExistingImageForDeletion(url)} disabled={isUploading}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {imagePreviews.map((previewUrl, index) => (
                        <div key={previewUrl} className="relative group aspect-square">
                          <NextImage src={previewUrl} alt={`Vista previa imagen ${index + 1}`} layout="fill" objectFit="cover" className="rounded-md border" />
                           <Button
                            type="button" variant="destructive" size="icon"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-7 w-7"
                            onClick={() => removeSelectedImage(index)} disabled={isUploading}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video Upload Section */}
                <div className="space-y-4">
                  <FormLabel htmlFor="video-upload">Videos del Anuncio (opcional)</FormLabel>
                  <Input
                    id="video-upload"
                    type="file"
                    multiple
                    accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                    onChange={handleVideoFilesChange}
                    ref={videoInputRef}
                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    disabled={isUploading || selectedVideoFiles.length >= MAX_VIDEO_FILES}
                  />
                  {(videoPreviews.length > 0 || existingVideoUrls.length > 0) && (
                    <div className="mt-4 space-y-3">
                      {existingVideoUrls.map((url) => (
                        <div key={url} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                          <div className="flex items-center gap-2 truncate">
                            <VideoIcon className="h-5 w-5 text-primary" />
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm truncate hover:underline">Ver video existente</a>
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => markExistingVideoForDeletion(url)} disabled={isUploading} className="text-destructive hover:text-destructive-foreground hover:bg-destructive/80 h-7 w-7">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {videoPreviews.map((file, index) => (
                        <div key={file.url} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                           <div className="flex items-center gap-2 truncate">
                            <VideoIcon className="h-5 w-5 text-primary" />
                            <span className="text-sm truncate" title={file.name}>{file.name}</span>
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeSelectedVideo(index)} disabled={isUploading} className="text-destructive hover:text-destructive-foreground hover:bg-destructive/80 h-7 w-7">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
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
                        <FormLabel>Teléfono de contacto (opcional)</FormLabel>
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
                          <Input placeholder="Ej: 34612345678" {...field} value={field.value || ""} />
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
              <Button type="button" variant="outline" onClick={() => setActiveTab("multimedia")}> {/* Changed to multimedia */}
                Anterior
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? 'Subiendo archivos...' : (mode === "create" ? "Crear anuncio" : "Actualizar anuncio")}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}
