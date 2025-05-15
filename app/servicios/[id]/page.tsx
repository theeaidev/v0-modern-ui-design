import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Clock, MapPin, Share2, Star, Heart, Flag, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteFooter } from "@/components/site-footer"

export default function ServicioDetailPage({ params }: { params: { id: string } }) {
  // This would normally fetch the service based on the ID
  // For this example, we'll use a mock service
  const service = {
    id: params.id,
    title: "Terapia emocional",
    category: "Bienestar",
    description:
      "Sesiones personalizadas para mejorar tu bienestar emocional y mental. Nuestros terapeutas profesionales te ayudarán a superar obstáculos, gestionar el estrés y desarrollar herramientas para una vida más plena y satisfactoria.",
    longDescription: `
      <p>La terapia emocional es un proceso de acompañamiento profesional que te ayuda a explorar y comprender tus emociones, pensamientos y comportamientos. A través de diferentes técnicas y enfoques, nuestros terapeutas te guiarán en un viaje de autodescubrimiento y crecimiento personal.</p>
      
      <p>Beneficios de nuestras sesiones:</p>
      <ul>
        <li>Reducción de síntomas de ansiedad y depresión</li>
        <li>Mejora en las relaciones interpersonales</li>
        <li>Desarrollo de estrategias de afrontamiento saludables</li>
        <li>Aumento de la autoestima y confianza</li>
        <li>Mayor claridad mental y emocional</li>
      </ul>
      
      <p>Nuestro enfoque es personalizado, adaptándonos a tus necesidades específicas y respetando tu ritmo. Creemos en crear un espacio seguro y confidencial donde puedas expresarte libremente sin juicios.</p>
      
      <p>Las sesiones tienen una duración de 50 minutos y se pueden realizar de forma presencial o en línea, según tu preferencia y disponibilidad.</p>
    `,
    image: "/placeholder.svg?height=600&width=1200",
    provider: "Centro de Bienestar Integral",
    location: "Calle Principal 123, Madrid",
    rating: 4.8,
    reviews: 24,
    price: "60€",
    duration: "50 minutos",
    availability: ["Lunes a Viernes: 9:00 - 20:00", "Sábados: 10:00 - 14:00"],
    features: ["Sesiones online disponibles", "Primera consulta gratuita", "Profesionales certificados"],
    relatedServices: [
      {
        id: 3,
        title: "Yoga y meditación",
        category: "Bienestar",
        description: "Clases para todos los niveles enfocadas en el equilibrio cuerpo-mente.",
        image: "/placeholder.svg?height=300&width=400",
        price: "12€/clase",
        location: "Valencia",
      },
      {
        id: 7,
        title: "Mindfulness",
        category: "Bienestar",
        description: "Aprende a vivir el presente y reducir el estrés con técnicas de atención plena.",
        image: "/placeholder.svg?height=300&width=400",
        price: "15€/clase",
        location: "Zaragoza",
      },
      {
        id: 5,
        title: "Coaching personal",
        category: "Desarrollo",
        description: "Acompañamiento para alcanzar tus metas personales y profesionales.",
        image: "/placeholder.svg?height=300&width=400",
        price: "70€/sesión",
        location: "Bilbao",
      },
    ],
    advertiser: {
      name: "Elena Sánchez",
      title: "Psicóloga especialista en terapia emocional",
      image: "/placeholder.svg?height=100&width=100",
      memberSince: "Marzo 2021",
      responseRate: "98%",
      responseTime: "En menos de 2 horas",
      verified: true,
      otherAds: 3,
    },
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Directorio Latinos Logo" width={32} height={32} className="rounded-sm" />
            <span className="text-xl font-bold">Directorio Latinos</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Inicio
            </Link>
            <Link href="/#services" className="text-sm font-medium hover:text-primary">
              Servicios
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-primary">
              Tienda
            </Link>
            <Link href="/#about" className="text-sm font-medium hover:text-primary">
              Quiénes somos
            </Link>
            <Link href="/#contact" className="text-sm font-medium hover:text-primary">
              Contacto
            </Link>
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Iniciar sesión
            </Button>
            <Button variant="default" size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Publicar anuncio gratis
            </Button>
          </div>
          <Button variant="outline" size="icon" className="md:hidden">
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
              className="h-6 w-6"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container py-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <Link href="/#services" className="hover:text-foreground">
              Servicios
            </Link>
            <span className="mx-2">/</span>
            <Link href="#" className="hover:text-foreground">
              {service.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{service.title}</span>
          </div>
        </div>

        {/* Service Banner */}
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
          <Image src={service.image || "/placeholder.svg"} alt={service.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container py-6">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-white mb-4 hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a servicios
            </Link>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                {service.category}
              </Badge>
              <div className="flex items-center text-white">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{service.rating}</span>
                <span className="text-xs ml-1">({service.reviews} reseñas)</span>
              </div>
              <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30">
                Anuncio verificado
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">{service.title}</h1>
            <div className="flex items-center mt-2 text-white/80">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{service.location}</span>
              <span className="mx-2">•</span>
              <span>Publicado hace 3 días</span>
              <span className="mx-2">•</span>
              <span>ID: {service.id}</span>
            </div>
          </div>
        </div>

        {/* Service Content */}
        <div className="container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold">{service.price}</h2>
                  <p className="text-muted-foreground">por sesión</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Heart className="h-5 w-5" />
                    <span className="sr-only">Guardar</span>
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Share2 className="h-5 w-5" />
                    <span className="sr-only">Compartir</span>
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Flag className="h-5 w-5" />
                    <span className="sr-only">Reportar</span>
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="descripcion" className="mb-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="descripcion">Descripción</TabsTrigger>
                  <TabsTrigger value="detalles">Detalles</TabsTrigger>
                  <TabsTrigger value="anunciante">Anunciante</TabsTrigger>
                </TabsList>
                <TabsContent value="descripcion" className="pt-6">
                  <div className="prose prose-lg max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: service.longDescription }} />
                  </div>
                </TabsContent>
                <TabsContent value="detalles" className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Características</h3>
                      <ul className="space-y-2">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
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
                              className="h-5 w-5 mr-2 text-primary"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Disponibilidad</h3>
                      <ul className="space-y-2">
                        {service.availability.map((time, index) => (
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
                      {/* Map placeholder */}
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
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden">
                      <Image
                        src={service.advertiser.image || "/placeholder.svg"}
                        alt={service.advertiser.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{service.advertiser.name}</h3>
                      <p className="text-muted-foreground">{service.advertiser.title}</p>
                      <div className="flex items-center mt-2">
                        {service.advertiser.verified && (
                          <Badge
                            variant="outline"
                            className="border-green-500 text-green-600 flex items-center gap-1 mr-3"
                          >
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
                              className="h-3.5 w-3.5"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Verificado
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          Miembro desde {service.advertiser.memberSince}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Tasa de respuesta</p>
                          <p className="font-medium">{service.advertiser.responseRate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Tiempo de respuesta</p>
                          <p className="font-medium">{service.advertiser.responseTime}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Otros anuncios</p>
                          <p className="font-medium">{service.advertiser.otherAds} anuncios activos</p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button variant="outline" className="w-full sm:w-auto">
                          Ver perfil completo
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Contactar con este anunciante</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium">
                        Nombre
                      </label>
                      <Input id="name" placeholder="Tu nombre" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium">
                        Correo electrónico
                      </label>
                      <Input id="email" type="email" placeholder="tu@email.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium">
                      Mensaje
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Me gustaría obtener más información sobre este servicio..."
                      rows={5}
                    />
                  </div>
                  <Button className="w-full sm:w-auto">Enviar mensaje</Button>
                </div>
              </div>
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Información del anuncio</CardTitle>
                  <CardDescription>Detalles sobre {service.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Precio:</span>
                    <span className="font-medium">{service.price} / sesión</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Duración:</span>
                    <span className="font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-muted-foreground">Disponibilidad:</span>
                    <ul className="space-y-1">
                      {service.availability.map((time, index) => (
                        <li key={index} className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm">{time}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <span className="text-muted-foreground">Características:</span>
                    <ul className="space-y-1">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
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
                            className="h-4 w-4 mr-2 text-primary"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Proveedor:</span>
                    <span className="font-medium">{service.provider}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button className="w-full">Contactar ahora</Button>
                  <Button variant="outline" className="w-full flex items-center">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir anuncio
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Related Services */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Anuncios relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.relatedServices.map((relatedService) => (
                <Card
                  key={relatedService.id}
                  className="overflow-hidden group transition-all duration-300 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={relatedService.image || "/placeholder.svg"}
                      alt={relatedService.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {relatedService.price && (
                      <div className="absolute bottom-3 right-3 bg-background/90 text-foreground px-3 py-1 rounded-md font-medium">
                        {relatedService.price}
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{relatedService.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          {relatedService.location}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2">{relatedService.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      Ver anuncio
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
