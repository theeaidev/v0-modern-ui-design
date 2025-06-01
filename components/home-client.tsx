"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Mail, Search, PlusCircle, ArrowRight, Briefcase, GraduationCap } from "lucide-react"
import { ServiceSearchClient } from "@/components/search/service-search-client"
import { Home as HomeIcon } from "@/components/home" // Import the Home component

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AdCard } from "@/components/ad-card"
import { TestimonialCard } from "@/components/testimonial-card"
import ErrorBoundary from "@/components/error-boundary"
import { debugLog } from "@/debug-utils"
import { getServiceListings } from "@/app/actions/service-listings"

// Sample services data
const services = [
  {
    id: 1,
    title: "Terapia emocional",
    category: "Bienestar",
    description: "Sesiones personalizadas para mejorar tu bienestar emocional y mental.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: "Popular",
    price: "60€/sesión",
    location: "Madrid",
    phone: "+34 612 345 678",
    whatsapp: "+34612345678",
    website: "www.terapiaemocional.es",
    email: "info@terapiaemocional.es",
    address: "Calle Serrano 41, Madrid",
    coordinates: { lat: 40.4256, lng: -3.6868 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 días atrás
    userId: 'sample-user',
  },
  {
    id: 2,
    title: "Masaje terapéutico",
    category: "Salud",
    description: "Técnicas profesionales para aliviar tensiones y mejorar la circulación.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "45€/hora",
    location: "Barcelona",
    phone: "+34 623 456 789",
    whatsapp: "+34623456789",
    website: "masajesterapeuticos.com",
    email: "contacto@masajesterapeuticos.com",
    address: "Av. Diagonal 405, Barcelona",
    coordinates: { lat: 41.3975, lng: 2.1702 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
    userId: 'sample-user',
  },
  {
    id: 3,
    title: "Yoga y meditación",
    category: "Bienestar",
    description: "Clases para todos los niveles enfocadas en el equilibrio cuerpo-mente.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: "Nuevo",
    price: "12€/clase",
    location: "Valencia",
    phone: "+34 634 567 890",
    whatsapp: "+34634567890",
    website: "yogavalencia.es",
    email: "hola@yogavalencia.es",
    address: "Calle de la Paz 15, Valencia",
    coordinates: { lat: 39.4702, lng: -0.3768 },
    verified: false,
    isNew: true,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
    userId: 'sample-user',
  },
  {
    id: 4,
    title: "Nutrición personalizada",
    category: "Salud",
    description: "Planes alimenticios adaptados a tus necesidades y objetivos.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "80€/consulta",
    location: "Sevilla",
    phone: "+34 645 678 901",
    whatsapp: "+34645678901",
    website: "nutricionpersonalizada.com",
    email: "info@nutricionpersonalizada.com",
    address: "Av. de la Constitución 20, Sevilla",
    coordinates: { lat: 37.3886, lng: -5.9953 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
    userId: 'sample-user',
  },
  {
    id: 5,
    title: "Coaching personal",
    category: "Desarrollo",
    description: "Acompañamiento para alcanzar tus metas personales y profesionales.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "70€/sesión",
    location: "Bilbao",
    phone: "+34 656 789 012",
    whatsapp: "+34656789012",
    website: "coachingpersonal.es",
    email: "contacto@coachingpersonal.es",
    address: "Gran Vía 30, Bilbao",
    coordinates: { lat: 43.263, lng: -2.935 },
    verified: false,
    isNew: false,
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 días atrás
    userId: 'sample-user',
  },
  {
    id: 6,
    title: "Fisioterapia",
    category: "Salud",
    description: "Tratamientos especializados para lesiones y problemas musculares.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: "Destacado",
    price: "50€/sesión",
    location: "Málaga",
    phone: "+34 667 890 123",
    whatsapp: "+34667890123",
    website: "fisioterapiamalaga.com",
    email: "info@fisioterapiamalaga.com",
    address: "Paseo Marítimo 25, Málaga",
    coordinates: { lat: 36.7213, lng: -4.4214 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
    userId: 'sample-user',
  },
  {
    id: 7,
    title: "Mindfulness",
    category: "Bienestar",
    description: "Aprende a vivir el presente y reducir el estrés con técnicas de atención plena.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "15€/clase",
    location: "Zaragoza",
    phone: "+34 678 901 234",
    whatsapp: "+34678901234",
    website: "mindfulnesszaragoza.es",
    email: "hola@mindfulnesszaragoza.es",
    address: "Calle Alfonso I 15, Zaragoza",
    coordinates: { lat: 41.6524, lng: -0.8807 },
    verified: false,
    isNew: true,
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
    userId: 'sample-user',
  },
  {
    id: 8,
    title: "Acupuntura",
    category: "Medicina alternativa",
    description: "Técnica milenaria para aliviar dolores y mejorar la salud general.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "55€/sesión",
    location: "Alicante",
    phone: "+34 689 012 345",
    whatsapp: "+34689012345",
    website: "acupunturaalicante.com",
    email: "info@acupunturaalicante.com",
    address: "Av. Federico Soto 12, Alicante",
    coordinates: { lat: 38.3453, lng: -0.4831 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 días atrás
    userId: 'sample-user',
  },
]

// Categories data
const categories = [
  {
    name: "Comunidad",
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6c0 7 6 13 6 13s6-6 6-13Z" />
        <circle cx="12" cy="8" r="2" />
      </svg>
    )
   /*  count: 124, */
  },
  {
    name: "Servicios",
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    /* count: 89, */
  },
  {
    name: "Inmobiliaria",
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    /* count: 67, */
  },
  {
    name: "Empleo",
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <polyline points="3 9 9 9 9 3" />
        <polyline points="21 15 15 15 15 21" />
        <line x1="9" x2="15" y1="15" y2="9" />
      </svg>
    ),
    /* count: 54, */
  },
  {
    name: "Otros",
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="13" height="13" x="4" y="9" rx="2" ry="2" />
        <path d="M9 22V12h6v10" />
        <path d="M8 9V2h8v7" />
      </svg>
    ),
    /* count: 42, */
  },
  {
    name: "Servicios",
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
    /* count: 31, */
  },
]

export default function HomeClient() {
  const [featuredListings, setFeaturedListings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedListings() {
      try {
        // Fetch featured ads from the database with limit=8 for the home page
        const { listings } = await getServiceListings({
          page: 1,
          limit: 8,
          sort: "newest",
          is_featured: true,
        })
        
        // Filter only featured listings
        const featuredDbListings = listings.filter((listing: any) => listing.is_featured)

        // Map database listings to AdCard props
        const dbListings = featuredDbListings.map((listing: any) => {
          // Defensive: handle id as string or number, ensure it's a string for the URL
          let id_processed: string | undefined;
          if (listing.id !== null && listing.id !== undefined) {
            id_processed = String(listing.id);
          } else {
            // Fallback or error handling if id is null/undefined
            // For now, let's log an error and skip this item or use a placeholder
            console.error('Listing found with null or undefined ID:', listing);
            id_processed = undefined; // Or some placeholder if you prefer not to filter out
          }

          // Defensive: handle missing category/subcategory
          const category = listing.category?.name || listing.category_id?.toString() || ""
          const subcategory = listing.subcategory?.name || listing.subcategory_id?.toString() || ""
          // Defensive: handle missing images
          const imageUrl =
            listing.images && listing.images.length > 0
              ? listing.images[0].url
              : "/placeholder.svg?height=300&width=400"

          return {
            id: id_processed, // Use the processed id
            title: listing.title || "",
            category,
            subcategory,
            description: listing.description || "",
            imagePath: imageUrl,
            badge: listing.is_featured ? "Destacado" : null,
            price: listing.price || "",
            location: listing.city || "Online",
            phone: listing.contact_phone || undefined,
            whatsapp: listing.contact_whatsapp || undefined,
            website: listing.contact_website || undefined,
            email: listing.contact_email || undefined,
            address: listing.address || undefined,
            verified: listing.is_verified,
            isNew: new Date(listing.created_at) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days
            publishedAt: new Date(listing.created_at),
            userId: listing.user_id || listing.userId || listing.owner_id || '',
          }
        })

        // Filter out listings that ended up with an undefined ID
        const validDbListings = dbListings.filter(item => item.id !== undefined && item.badge === "Destacado");

        // If we have enough featured listings from the database, use only those
        // Otherwise, supplement with sample data if needed
        // Ensure all sample data has a userId for consistency
        const sampleFeatured = services.filter(s => s.badge === "Destacado").map(s => ({
          ...s,
          userId: s.userId || 'sample-user',
        }));
        const combinedListings = validDbListings.length >= 8 
          ? validDbListings 
          : [...validDbListings, ...sampleFeatured.slice(0, 8 - validDbListings.length)];
        setFeaturedListings(combinedListings)
      } catch (error) {
        console.error("Error fetching featured listings:", error)
        // Use only featured sample data as fallback if there's an error
        setFeaturedListings(services.filter(service => service.badge === "Destacado"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedListings()
  }, [])

  useEffect(() => {
    debugLog("Home client component mounted")

    // Check if all required components are available
    debugLog("Component check", {
      hasAdCard: typeof AdCard === "function",
      hasTestimonialCard: typeof TestimonialCard === "function",
      hasHomeIcon: typeof HomeIcon === "function",
    })

    return () => {
      debugLog("Home client component unmounted")
    }
  }, [])

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-orange-500/20 z-0" />
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
          aria-hidden="true"
        />
        <div className="container relative z-10 py-24 md:py-32 lg:py-40">
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Publica y encuentra servicios cerca de ti
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              La plataforma líder para anunciar tus servicios profesionales o encontrar exactamente lo que necesitas
            </p>
            <div className="w-full max-w-2xl mt-8">
              <ServiceSearchClient />
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <Link href="/servicios?categoria=Restaurantes">
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  Restaurantes
                </Badge>
              </Link>
              <Link href="/servicios?categoria=Servicios">
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  Servicios
                </Badge>
              </Link>
              <Link href="/servicios?categoria=Formación">
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  Formación
                </Badge>
              </Link>
              <Link href="/servicios?categoria=Productos">
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  Productos
                </Badge>
              </Link>
              <Link href="/servicios?categoria=Comunidad">
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  Comunidad
                </Badge>
              </Link>
              <Link href="/servicios?categoria=Inmobiliaria">
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  Inmobiliaria
                </Badge>
              </Link>
              <Link href="/servicios?categoria=Otros">
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  Otros
                </Badge>
              </Link>
            </div>
            <Link href="https://www.innnova.es/" target="_blank" rel="noopener" aria-label="Innnova">
            <svg width="210" height="40" viewBox="0 0 210 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="INNNOVA logo">
                <text x="0" y="32" fontFamily="'Inter', 'Montserrat', Arial, sans-serif" fontWeight="bold" fontSize="32" letterSpacing="2">
                  <tspan fill="url(#barra-roja)">I</tspan><tspan fill="#fff">NNNOVA</tspan>
                </text>
                <defs>
                  <linearGradient id="barra-roja" x1="0" y1="5" x2="0" y2="35" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF1414"/>
                    <stop offset="1" stopColor="#FF4D4D"/>
                  </linearGradient>
                </defs>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Post Ad CTA */}
      <section className="py-12 bg-primary/5">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">¿Ofreces algún servicio?</h2>
              <p className="text-muted-foreground">Publica tu anuncio y llega a miles de clientes potenciales</p>
            </div>
            <Link href="/dashboard/servicios/nuevo">
            <Button size="lg" className="whitespace-nowrap gap-2">
              <PlusCircle className="h-5 w-5" />
              Publicar anuncio
            </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-16 md:py-24">
        <div className="container">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Anuncios destacados</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explora los servicios más populares publicados en nuestra plataforma
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading
              ? // Loading state - show skeleton cards
                Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[4/3] bg-muted"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-1/3 mt-4"></div>
                    </div>
                  </div>
                ))
              : // Loaded state - show real listings combined with sample data
                featuredListings.map((service) => {
  console.log('[HomeClient] service:', {
    id: service.id,
    userId: service.userId,
    imagePath: service.imagePath,
    service
  });
  return (
    <ErrorBoundary
                    key={service.id}
                    fallback={<div className="p-4 border rounded">Error rendering service card</div>}
                  >
                    <AdCard
                      key={service.id}
                      id={service.id}
                      title={service.title}
                      category={service.category}
                      description={service.description}
                      imagePath={service.imagePath}
                      badge={service.badge}
                      price={service.price}
                      location={service.location}
                      phone={service.phone}
                      whatsapp={service.whatsapp}
                      website={service.website}
                      email={service.email}
                      address={service.address}
                      coordinates={service.coordinates}
                      verified={service.verified}
                      isNew={service.isNew}
                      publishedAt={service.publishedAt}
                      userId={service.userId}
                    />
                  </ErrorBoundary>
                );
              })
            }
          </div>
          <div className="flex justify-center mt-12">
          <Link href="/servicios">
            <Button variant="outline" size="lg" className="gap-2">
              Ver todos los anuncios
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <ErrorBoundary fallback={<div className="p-4">Error in Categories Section</div>}>
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Categorías populares</h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Encuentra servicios por categoría o publica tu anuncio en la categoría adecuada
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.name} 
                  href={`/servicios?categoria=${category.name}`}
                  className="flex flex-col items-center p-4 rounded-lg bg-background hover:bg-primary/5 border transition-colors"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                    <category.icon />
                  </div>
                  <span className="font-medium text-center">{category.name}</span>
                  {/* <span className="text-xs text-muted-foreground mt-1">{category.count} anuncios</span> */}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </ErrorBoundary>

      {/* Benefits Section */}
      <ErrorBoundary fallback={<div className="p-4">Error in Benefits Section</div>}>
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">¿Por qué anunciarse con nosotros?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Descubre las ventajas de publicar tus servicios en nuestra plataforma
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-background">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" x2="22" y1="12" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Alcance global</h3>
                <p className="text-muted-foreground">
                  Llega a miles de clientes potenciales interesados en tus servicios desde cualquier lugar.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-background">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8"
                  >
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Publicaciones gratuita</h3>
                <p className="text-muted-foreground">
                Pública tu oferta de empleo, alquileres, etc. de forma gratuita.  (Solo pagas por funciones Premium si las necesitas).
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-background">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8"
                  >
                    <path d="M20 7h-9" />
                    <path d="M14 17H5" />
                    <circle cx="17" cy="17" r="3" />
                    <circle cx="7" cy="7" r="3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Gestión sencilla</h3>
                <p className="text-muted-foreground">
                  Administra tus anuncios fácilmente, actualiza información y responde a clientes desde un solo lugar.
                </p>
              </div>
            </div>
            <div className="flex justify-center mt-12">
              <Link href="/dashboard/servicios/nuevo">
                <Button size="lg" className="gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Publicar mi anuncio
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </ErrorBoundary>

      {/* About Section */}
      <ErrorBoundary fallback={<div className="p-4">Error in About Section</div>}>
        <section id="about" className="py-16 md:py-24 bg-muted/50">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Quiénes somos</h2>
                <p className="text-lg text-muted-foreground mb-4">
                Somos la plataforma líder en publicación de anuncios de servicios comerciales latinoamericanos en España. 
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                Nuestra misión es conectar a proveedores de servicios con clientes potenciales de manera rápida y eficiente. 
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                Hemos ayudado a miles de comerciantes a hacer crecer sus negocios y a clientes a encontrar exactamente el servicio que buscan.
                </p>
{/*                 <div className="flex flex-col sm:flex-row gap-4">
                  <Button>Nuestra historia</Button>
                  <Button variant="outline">Únete a nosotros</Button>
                </div> */}
              </div>
              <div className="order-1 lg:order-2 relative aspect-video lg:aspect-square">
                <Image
                  src="/logo.png"
                  alt="Quiénes somos"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>
      </ErrorBoundary>

      {/* Testimonials Section */}
      <ErrorBoundary fallback={<div className="p-4">Error in Testimonials Section</div>}>
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Lo que dicen nuestros usuarios</h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Descubre cómo nuestra plataforma ha ayudado a profesionales a hacer crecer sus negocios
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ErrorBoundary fallback={<div className="p-4 border rounded">Error rendering testimonial</div>}>
                <TestimonialCard
                  name="María García"
                  role="Terapeuta"
                  category="Empleo"
                  avatar="/terapeuta.jpg"
                  rating={5}
                  text="Desde que publiqué mi anuncio en esta plataforma, mi agenda está completa. La visibilidad que me ha dado es increíble y los clientes valoran mucho encontrarme aquí."
                  accentColor="bg-blue-500/20"
                  icon={<Briefcase className="h-16 w-16" />}
                />
              </ErrorBoundary>

              <ErrorBoundary fallback={<div className="p-4 border rounded">Error rendering testimonial</div>}>
                <TestimonialCard
                  name="Carlos Rodríguez"
                  role="Agente"
                  category="Inmobiliaria"
                  avatar="/man.jpg"
                  rating={5}
                  text="Excelente plataforma para dar a conocer mis propiedades. La interfaz es intuitiva y el soporte al cliente muy eficiente cuando lo he necesitado."
                  accentColor="bg-green-500/20"
                  icon={<HomeIcon className="h-16 w-16" />}
                />
              </ErrorBoundary>

              <ErrorBoundary fallback={<div className="p-4 border rounded">Error rendering testimonial</div>}>
                <TestimonialCard
                  name="Isabel Romero"
                  role="Profesora de yoga"
                  category="Formación"
                  avatar="/yoga.jpg"
                  rating={5}
                  text="He podido llegar a muchas más personas interesadas en mis clases. Esta plataforma me ha ayudado a ganar visibilidad y aumentar mi número de alumnos."
                  accentColor="bg-purple-500/20"
                  icon={<GraduationCap className="h-16 w-16" />}
                />
              </ErrorBoundary>
            </div>
          </div>
        </section>
      </ErrorBoundary>

      {/* Contact Section */}
      <ErrorBoundary fallback={<div className="p-4">Error in Contact Section</div>}>
        <section id="contact" className="py-16 md:py-24 bg-muted/50">
          <div className="container">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Contacto</h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                ¿Tienes alguna pregunta sobre cómo publicar tu anuncio? Estamos aquí para ayudarte.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <div className="space-y-6">
                <div className="space-y-4">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Nombre
                  </label>
                  <Input id="name" placeholder="Tu nombre" />
                </div>
                <div className="space-y-4">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Correo electrónico
                  </label>
                  <Input id="email" type="email" placeholder="tu@email.com" />
                </div>
                <div className="space-y-4">
                  <label htmlFor="message" className="block text-sm font-medium">
                    Mensaje
                  </label>
                  <Textarea id="message" placeholder="¿En qué podemos ayudarte?" rows={5} />
                </div>
                <Button className="w-full md:w-auto">Enviar mensaje</Button>
              </div>
              <div className="mt-8 text-center">
                <div className="flex items-center justify-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">info@directoriolatinos.com</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ErrorBoundary>
    </main>
  )
}
