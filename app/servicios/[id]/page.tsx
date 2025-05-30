import Link from "next/link";
import NextImage from "next/image";
import { ServiceMediaGallery } from "@/components/service-media-gallery";
import { ArrowLeft, Calendar, Clock, MapPin, Share2, Star, Heart, Flag, PlusCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteFooter } from "@/components/site-footer"
import { getServiceListingById, getRelatedServicesByCategory } from "@/app/actions/service-listings";
import { ServiceShareButton } from "@/components/service-share-button";
import { ServiceFavoriteButton } from "@/components/service-favorite-button"; // Add this import
import { MainNav } from "@/components/main-nav";
import { ServiceAdvertiserInfo } from "@/components/service-advertiser-info";

// Define type for advertiser data within MappedServiceData
interface MappedServiceAdvertiser {
  name: string;
  title: string;
  imagePath: string;
  memberSince: string;
  responseRate: string;
  responseTime: string;
  verified: boolean;
  otherAds: number;
}

// Define type for the main service object mapped from DB data
interface MappedServiceData {
  id: string;
  user_id: string;
  user?: {
    id: string;
    email?: string;
    full_name?: string;
  };
  user_email?: string; // Added user email field
  title: string;
  category: string;
  description: string;
  longDescription: string;
  imagePath: string | undefined; // Primary image URL for the service
  provider: string;
  location: string;
  rating: number;
  reviews: number;
  price: string;
  duration: string;
  availability: string[];
  features: string[];
  publishedAt: Date;
  isVerified: boolean;
  advertiser: MappedServiceAdvertiser;
  relatedServices: RelatedService[];
}

// Define type for related services
type RelatedService = {
  id: string | number;
  user_id: string; // Added user_id field for media fetching
  title: string;
  description: string;
  imagePath: string | null;
  price: string | null;
  location: string;
  category?: string;
};

// Helper function to fetch and map ad data
async function fetchAndMapAdById(id: string): Promise<MappedServiceData | null> {
  const dbAdData = await getServiceListingById(id);

  if (!dbAdData) {
    console.log(`Ad with ID "${id}" not found in database.`);
    return null;
  }

  // Log the raw data from Supabase for debugging purposes (server-side)
  // console.log("Raw dbAdData:", JSON.stringify(dbAdData, null, 2));

  // Default mock structures for parts that might not come from DB or are explicitly mock
  const mockLongDescription = `
    <p>La terapia emocional es un proceso de acompañamiento profesional que te ayuda a explorar y comprender tus emociones, pensamientos y comportamientos. A través de diferentes técnicas y enfoques, nuestros terapeutas te guiarán en un viaje de autodescubrimiento y crecimiento personal.</p>
    <p><strong>Información específica para '${dbAdData.title || "el servicio"}' cargada dinámicamente.</strong></p>
    <p>Beneficios de nuestras sesiones (ejemplo):</p>
    <ul>
      <li>Reducción de síntomas de ansiedad y depresión</li>
      <li>Mejora en las relaciones interpersonales</li>
      <li>Desarrollo de estrategias de afrontamiento saludables</li>
      <li>Aumento de la autoestima y confianza</li>
      <li>Mayor claridad mental y emocional</li>
    </ul>
    <p>Nuestro enfoque es personalizado, adaptándonos a tus necesidades específicas y respetando tu ritmo. Creemos en crear un espacio seguro y confidencial donde puedas expresarte libremente sin juicios.</p>
    <p>Las sesiones tienen una duración de ejemplo y se pueden realizar de forma presencial o en línea, según tu preferencia y disponibilidad (datos de ejemplo).</p>
  `;

  const mockAvailability = ["Lunes a Viernes: 9:00 - 20:00 (Mock)", "Sábados: 10:00 - 14:00 (Mock)"];
  const mockFeatures = ["Sesiones online disponibles (Mock)", "Primera consulta gratuita (Mock)", "Profesionales certificados (Mock)"];
  
  // Fetch related services from the same category
  let relatedServices: RelatedService[] = [];
  if (dbAdData && dbAdData.category_id) {
    relatedServices = await getRelatedServicesByCategory(dbAdData.category_id, dbAdData.id.toString());
  }
  
  // Fallback to default placeholder services if none found from DB
  if (relatedServices.length === 0) {
    // Fallback to similar services in case no related ones are found
    relatedServices = [
      {
        id: 'placeholder-1',
        user_id: dbAdData.user_id, // Use the current service's user_id for the placeholder
        title: "Servicio relacionado",
        description: "Este es un servicio de ejemplo que se muestra cuando no hay servicios relacionados disponibles.",
        imagePath: "/placeholder.svg",
        price: null,
        location: "España",
      }
    ];
  }

  const service = {
    id: dbAdData.id.toString(),
    user_id: dbAdData.user_id, // Added user_id mapping
        user: dbAdData.user,
    user_email: dbAdData.user?.email, // Added user email
    title: dbAdData.title || "Título no disponible",
    category: dbAdData.category?.name || "Categoría desconocida",
    description: dbAdData.description || "Descripción breve no disponible.",
    // Use dbAdData.long_description if it exists in your table, otherwise fallback to mock
    longDescription: (dbAdData as any).long_description || mockLongDescription,
    imagePath: dbAdData.images?.[0]?.url || "/placeholder.svg?height=600&width=1200&text=No+Image",
    provider: "Centro de Bienestar Ejemplo (Mock Provider)", // Kept as mock per previous state
    location: dbAdData.city || (dbAdData as any).address || "Ubicación no especificada", // (dbAdData as any).address assumes 'address' might be a field
    rating: dbAdData.average_rating || 0,
    reviews: dbAdData.reviews_count || 0,
    price: dbAdData.price ? `${dbAdData.price}€` : "Consultar", // Assuming price is numeric from DB
    // Use dbAdData.duration_minutes if it exists, otherwise fallback
    duration: (dbAdData as any).duration_minutes ? `${(dbAdData as any).duration_minutes} minutos` : "50 minutos (Mock Duration)", 
    // Use dbAdData.availability_details if it exists (might need parsing if JSON), otherwise fallback
    availability: (dbAdData as any).availability_details || mockAvailability,
    // Use dbAdData.features_list if it exists (might need parsing if JSON array), otherwise fallback
    features: (dbAdData as any).features_list || mockFeatures,
    
    publishedAt: dbAdData.created_at ? new Date(dbAdData.created_at) : new Date(),
    isVerified: dbAdData.is_verified ?? false, // Ad verification status

    advertiser: {
      // Use full_name from the fetched user (advertiser) profile data
      name: dbAdData.user?.full_name || (dbAdData.user?.email ? dbAdData.user.email.split("@")[0] : "Usuario"),
      title: "Especialista en el área (Mock Title)", // Placeholder, as not in user profile schema
      imagePath: dbAdData.user?.avatar_url || "/placeholder.svg?height=100&width=100&text=Advertiser",
      // Use profile_updated_at from the fetched user profile for 'member since'
      memberSince: dbAdData.user?.profile_updated_at ? dbAdData.user.profile_updated_at : "Fecha desconocida",
      responseRate: "98% (Mock)", // Placeholder
      responseTime: "En menos de 2 horas (Mock)", // Placeholder
      verified: dbAdData.user?.is_verified ?? false,
      otherAds: 3, // Placeholder, would require another query
      email: dbAdData.user?.email, // Email fetched via RPC in getServiceListingById
      // 'created_at' for the advertiser prop should be their profile's 'updated_at' or similar join date
      // The 'dbAdData.created_at' is the ad's creation date, not the user's join date.
      // We're using profile_updated_at for memberSince, which is more appropriate.
      created_at: dbAdData.user?.profile_updated_at, // Using profile_updated_at for consistency with memberSince
    },

    relatedServices: relatedServices, // Kept as mock per instructions
  };

  console.log("Final service object:", JSON.stringify(service, null, 2));
  return service;
}

export default async function ServicioDetailPage({ params }: { params: { id: string } }) {
  const service: MappedServiceData | null = await fetchAndMapAdById(params.id);
  

  if (!service) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Anuncio no encontrado</h1>
        <p className="text-muted-foreground">El anuncio con ID "{params.id}" no pudo ser encontrado o no está activo.</p>
        <Link href="/" className="mt-4">
          <Button variant="outline">Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <MainNav />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container py-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <Link href="/servicios" className="hover:text-foreground">
              Servicios
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/servicios?categoria=${service.category}`} className="hover:text-foreground">
              {service.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{service.title}</span>
          </div>
        </div>

        {/* Service Banner */}
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
          <ServiceMediaGallery listingId={service.id} userId={service.user_id} title={service.title} initialPrimaryImageUrl={service.imagePath || undefined} />
          {/* Gradient overlay only on desktop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none hidden sm:block" />
          {/* Overlay text only on desktop */}
          <div className="absolute bottom-0 left-0 right-0 container py-6 hidden sm:block">
            <Link href="/servicios" className="inline-flex items-center text-sm font-medium text-white mb-4 hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a servicios
            </Link>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-white">
                {service.category}
              </Badge>
{/*               <div className="flex items-center text-white">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{service.rating}</span>
                <span className="text-xs ml-1">({service.reviews} reseñas)</span>
              </div> */}
              {service.isVerified && (
                <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30">
                  Anuncio verificado
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">{service.title}</h1>
            <div className="flex items-center mt-2 text-white/80">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{service.location}</span>
              <span className="mx-2">•</span>
              <span>
                Publicado {formatDistanceToNow(service.publishedAt, { addSuffix: true, locale: es })}
              </span>
              <span className="mx-2">•</span>
              <span>ID: {service.id}</span>
            </div>
          </div>
        </div>
        {/* Overlay text only on mobile, below image, above consult */}
        <div className="block sm:hidden px-4 pt-4">
          <Link href="/servicios" className="inline-flex items-center text-sm font-medium text-foreground mb-4 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a servicios
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-white">
              {service.category}
            </Badge>
            {service.isVerified && (
              <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30">
                Anuncio verificado
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{service.title}</h1>
          <div className="flex items-center mt-1 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{service.location}</span>
            <span className="mx-2">•</span>
            <span>
              Publicado {formatDistanceToNow(service.publishedAt, { addSuffix: true, locale: es })}
            </span>
            <span className="mx-2">•</span>
            <span>ID: {service.id}</span>
          </div>
        </div>

        {/* Service Content */}
        <div className="container py-12">
          <div className="w-full overflow-visible">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold">{service.price}</h2>
                  <p className="text-muted-foreground">por sesión</p>
                </div>
                <div className="flex gap-2">
                   <ServiceFavoriteButton serviceId={service.id} />
                  <ServiceShareButton 
                    serviceId={service.id} 
                    serviceTitle={service.title} 
                    serviceDescription={service.description} 
                  />
                </div>
              </div>
              <Tabs defaultValue="descripcion" className="mb-8">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="descripcion">Descripción</TabsTrigger>
                  {/* <TabsTrigger value="detalles">Detalles</TabsTrigger> */}
                  <TabsTrigger value="anunciante">Anunciante</TabsTrigger>
                </TabsList>
                <TabsContent value="descripcion" className="pt-6">
                  <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: service.longDescription }} />
                </TabsContent>
                <TabsContent value="detalles" className="pt-6">
                  {/* Content for "detalles" tab */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Características</h3>
                      <ul className="space-y-2">
                        {service.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-primary"><polyline points="20 6 9 17 4 12" /></svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Disponibilidad</h3>
                      <ul className="space-y-2">
                        {service.availability.map((time: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-primary" />
                            <span>{time}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Ubicación</h3>
                    <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <MapPin className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    </div>
                    <p className="mt-4 flex items-center text-muted-foreground">
                      <MapPin className="h-5 w-5 mr-2 text-primary" />
                      {service.location}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="anunciante" className="pt-6">
                  <ServiceAdvertiserInfo 
                    advertiser={service.advertiser} 
                    advertiserUserId={service.user_id} 
                  />
                </TabsContent>
              </Tabs> {/* End of Tabs component */} 

              {/* Contact Form Section */} 
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Contactar con este anunciante</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-card-foreground">Nombre</label>
                      <Input id="name" placeholder="Tu nombre" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-card-foreground">Correo electrónico</label>
                      <Input id="email" type="email" placeholder="tu@email.com" />
                    </div>
                  </div>
                  <div className="space-y-2 overflow-visible">
                    <label htmlFor="message" className="block text-sm font-medium text-card-foreground">Mensaje</label>
                    <Textarea id="message" placeholder={`Me gustaría obtener más información sobre "${service.title}"...`} rows={5} />
                  </div>
                  <Button className="w-full sm:w-auto">Enviar mensaje</Button>
                </div>
              </div>
            </div> {/* End of lg:col-span-2 */} 

            {/* Related Services Section */} 
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Anuncios relacionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {service.relatedServices.map((relatedServiceItem: RelatedService) => (
                  <Card key={relatedServiceItem.id} className="overflow-hidden group transition-all duration-300 hover:shadow-lg">
                    <div className="relative aspect-[4/3] overflow-hidden">
                    <ServiceMediaGallery 
                      listingId={relatedServiceItem.id.toString()} 
                      userId={relatedServiceItem.user_id} 
                      title={relatedServiceItem.title} 
                      initialPrimaryImageUrl={relatedServiceItem.imagePath || undefined} 
                      variant="card"
                    />
                      {relatedServiceItem.price && (
                        <div className="absolute bottom-3 right-3 bg-background/90 text-foreground px-3 py-1 rounded-md font-medium text-sm">
                          {relatedServiceItem.price}
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg truncate" title={relatedServiceItem.title}>{relatedServiceItem.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1 text-sm">
                        
                        <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        {relatedServiceItem.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Link href={`/servicios?categoria=${service.category}`} className="hover:text-foreground">
              <Badge variant="secondary" className="text-white">
                {service.category}
              </Badge>
            </Link>
                      <p className="text-muted-foreground line-clamp-2 text-sm">{relatedServiceItem.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/servicios/${relatedServiceItem.id.toString()}`} className="w-full">
                        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                          Ver anuncio
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div> {/* Closes Related Services container <div className="mt-16"> */}
          </div> {/* Closes <div className="w-full overflow-visible"> */}
        </div> {/* Closes <div className="container py-12"> */}
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
