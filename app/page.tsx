"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Mail, MapPin, Phone, Search, PlusCircle, ShoppingBag, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Primero, añadimos el estado para controlar el menú móvil
// Añadir este import en la parte superior del archivo
import { useState } from "react"

// Reemplazar todo el header con el componente MainNav
// Primero, añadir este import
import { MainNav } from "@/components/main-nav"

// Modificar la función del componente para incluir el estado
export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // El resto del código permanece igual...
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <MainNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-orange-500/20 z-0" />
          <div
            className="absolute inset-0 z-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-30"
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
              <div className="w-full max-w-2xl mt-8 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="search" placeholder="¿Qué servicio buscas?" className="pl-10 pr-4 py-6 text-base" />
                </div>
                <Button size="lg" className="py-6">
                  Buscar
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  Masajes
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  Terapia
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  Yoga
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  Nutrición
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  Coaching
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Post Ad CTA */}
        <section className="py-12 bg-primary/5">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">¿Ofreces algún servicio?</h2>
                <p className="text-muted-foreground">
                  Publica tu anuncio y llega a miles de clientes potenciales
                </p>
              </div>
              <Button size="lg" className="whitespace-nowrap gap-2">
                <PlusCircle className="h-5 w-5" />
                Publicar anuncio 
              </Button>
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
              {services.map((service) => (
                <Card key={service.id} className="overflow-hidden group transition-all duration-300 hover:shadow-lg">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={service.image || "/placeholder.svg"}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {service.badge && (
                      <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                        {service.badge}
                      </Badge>
                    )}
                    {service.price && (
                      <div className="absolute bottom-3 right-3 bg-background/90 text-foreground px-3 py-1 rounded-md font-medium">
                        {service.price}
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{service.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          {service.location}
                        </CardDescription>
                      </div>
                      {service.verified && (
                        <Badge variant="outline" className="border-green-500 text-green-600 flex items-center gap-1">
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
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2">{service.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
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
            <div className="flex justify-center mt-12">
              <Button variant="outline" size="lg" className="gap-2">
                Ver todos los anuncios
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
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
                  href="#"
                  className="flex flex-col items-center p-4 rounded-lg bg-background hover:bg-primary/5 border transition-colors"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                    <category.icon className="h-6 w-6" />
                  </div>
                  <span className="font-medium text-center">{category.name}</span>
                  <span className="text-xs text-muted-foreground mt-1">{category.count} anuncios</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
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
                <h3 className="text-xl font-bold mb-2">Publicación gratuita</h3>
                <p className="text-muted-foreground">
                  Publica tu anuncio de forma gratuita y solo paga por funciones premium si las necesitas.
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
              <Button size="lg" className="gap-2">
                <PlusCircle className="h-5 w-5" />
                Publicar mi anuncio
              </Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 md:py-24 bg-muted/50">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Quiénes somos</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  Somos la plataforma líder en publicación de anuncios de servicios profesionales. Nuestra misión es
                  conectar a proveedores de servicios con clientes potenciales de manera rápida y eficiente.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  Desde 2020, hemos ayudado a miles de profesionales a hacer crecer sus negocios y a clientes a
                  encontrar exactamente el servicio que necesitan, cuando lo necesitan.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button>Nuestra historia</Button>
                  <Button variant="outline">Únete a nosotros</Button>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative aspect-video lg:aspect-square">
                <Image
                  src="/placeholder.svg?height=600&width=600"
                  alt="Quiénes somos"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Lo que dicen nuestros usuarios</h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Descubre cómo nuestra plataforma ha ayudado a profesionales a hacer crecer sus negocios
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="p-6 rounded-lg border bg-background">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.avatar || "/placeholder.svg?height=48&width=48"}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill={i < testimonial.rating ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-yellow-500"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-muted-foreground">{testimonial.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 md:py-24 bg-muted/50">
          <div className="container">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Contacto</h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                ¿Tienes alguna pregunta sobre cómo publicar tu anuncio? Estamos aquí para ayudarte.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
              <div className="space-y-6">
                <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                  {/* Map placeholder */}
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Dirección</h3>
                      <p className="text-muted-foreground">Calle Principal 123, Ciudad, CP 12345</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Teléfono</h3>
                      <p className="text-muted-foreground">+34 123 456 789</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-muted-foreground">info@serviciosdirectorio.com</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" size="icon" className="rounded-full">
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
                      className="h-5 w-5"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                    <span className="sr-only">Facebook</span>
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
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
                      className="h-5 w-5"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                    <span className="sr-only">Twitter</span>
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
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
                      className="h-5 w-5"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span className="sr-only">Instagram</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">ServiciosDirectorio</h3>
              <p className="text-sm text-muted-foreground mb-4">
                La plataforma líder para publicar y encontrar anuncios de servicios profesionales desde 2020.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="h-8 w-8">
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
                    className="h-4 w-4"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  <span className="sr-only">Facebook</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
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
                    className="h-4 w-4"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                  <span className="sr-only">Twitter</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
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
                    className="h-4 w-4"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span className="sr-only">Instagram</span>
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="text-sm text-muted-foreground hover:text-foreground">
                    Servicios
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Tienda
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground">
                    Quiénes somos
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="text-sm text-muted-foreground hover:text-foreground">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Publicar anuncio
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Iniciar sesión
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <span className="text-sm text-muted-foreground">Calle Principal 123, Ciudad, CP 12345</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <span className="text-sm text-muted-foreground">+34 123 456 789</span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <span className="text-sm text-muted-foreground">info@serviciosdirectorio.com</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Suscríbete</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Suscríbete a nuestras novedades y recibe alertas sobre nuevos anuncios en tu área.
              </p>
              <div className="flex gap-2">
                <Input placeholder="Tu email" className="max-w-[220px]" />
                <Button>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ServiciosDirectorio. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Sample services data
const services = [
  {
    id: 1,
    title: "Terapia emocional",
    category: "Bienestar",
    description: "Sesiones personalizadas para mejorar tu bienestar emocional y mental.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Popular",
    price: "60€/sesión",
    location: "Madrid",
    verified: true,
  },
  {
    id: 2,
    title: "Masaje terapéutico",
    category: "Salud",
    description: "Técnicas profesionales para aliviar tensiones y mejorar la circulación.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "45€/hora",
    location: "Barcelona",
    verified: true,
  },
  {
    id: 3,
    title: "Yoga y meditación",
    category: "Bienestar",
    description: "Clases para todos los niveles enfocadas en el equilibrio cuerpo-mente.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Nuevo",
    price: "12€/clase",
    location: "Valencia",
    verified: false,
  },
  {
    id: 4,
    title: "Nutrición personalizada",
    category: "Salud",
    description: "Planes alimenticios adaptados a tus necesidades y objetivos.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "80€/consulta",
    location: "Sevilla",
    verified: true,
  },
  {
    id: 5,
    title: "Coaching personal",
    category: "Desarrollo",
    description: "Acompañamiento para alcanzar tus metas personales y profesionales.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "70€/sesión",
    location: "Bilbao",
    verified: false,
  },
  {
    id: 6,
    title: "Fisioterapia",
    category: "Salud",
    description: "Tratamientos especializados para lesiones y problemas musculares.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Destacado",
    price: "50€/sesión",
    location: "Málaga",
    verified: true,
  },
  {
    id: 7,
    title: "Mindfulness",
    category: "Bienestar",
    description: "Aprende a vivir el presente y reducir el estrés con técnicas de atención plena.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "15€/clase",
    location: "Zaragoza",
    verified: false,
  },
  {
    id: 8,
    title: "Acupuntura",
    category: "Medicina alternativa",
    description: "Técnica milenaria para aliviar dolores y mejorar la salud general.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "55€/sesión",
    location: "Alicante",
    verified: true,
  },
]

// Categories data
const categories = [
  {
    name: "Bienestar",
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
    ),
    count: 124,
  },
  {
    name: "Salud",
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
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
    count: 98,
  },
  {
    name: "Educación",
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
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    count: 76,
  },
  {
    name: "Hogar",
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
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    count: 112,
  },
  {
    name: "Tecnología",
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
        <rect width="14" height="8" x="5" y="2" rx="2" />
        <rect width="20" height="8" x="2" y="14" rx="2" />
        <path d="M6 18h2" />
        <path d="M12 18h6" />
      </svg>
    ),
    count: 65,
  },
  {
    name: "Belleza",
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
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z" />
        <path d="M13 2a2.5 2.5 0 0 0 0 5" />
        <path d="M13 8a2.5 2.5 0 1 0 0 5" />
        <path d="M13 14a2.5 2.5 0 1 0 0 5" />
      </svg>
    ),
    count: 87,
  },
  {
    name: "Legal",
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
        <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
      </svg>
    ),
    count: 43,
  },
  {
    name: "Finanzas",
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
        <circle cx="12" cy="12" r="10" />
        <path d="M16 8h-6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H6" />
        <path d="M12 18v2" />
        <path d="M12 6v2" />
      </svg>
    ),
    count: 56,
  },
  {
    name: "Mascotas",
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
        <circle cx="7" cy="15" r="1" />
        <circle cx="11" cy="11" r="1" />
        <path d="M8.6 11a10.5 10.5 0 0 1 3.4-7" />
        <path d="M2.5 15c1.5 0 3 .5 3 2s-2 3-2 3" />
        <path d="M10 17c.5 2 2.5 3 4 3s3-1 3-3c0-1.5-2-1.5-2-1.5h-1.5" />
        <path d="M17 12c1-1 2-1 2.5 0s-.5 2-1.5 2" />
        <path d="M10 11c.5-1 1.5-1 2-.5" />
      </svg>
    ),
    count: 34,
  },
  {
    name: "Eventos",
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
        <path d="M8 14h.01" />
        <path d="M12 14h.01" />
        <path d="M16 14h.01" />
        <path d="M8 18h.01" />
        <path d="M12 18h.01" />
        <path d="M16 18h.01" />
      </svg>
    ),
    count: 78,
  },
  {
    name: "Tienda",
    icon: () => <ShoppingBag className="h-6 w-6" />,
    count: 92,
  },
  {
    name: "Ver más",
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
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
    ),
    count: 150,
  },
]

// Testimonials data
const testimonials = [
  {
    name: "María García",
    role: "Terapeuta",
    avatar: "/placeholder.svg?height=48&width=48",
    rating: 5,
    text: "Desde que publiqué mi anuncio en esta plataforma, mi agenda está completa. La visibilidad que me ha dado es increíble y los clientes valoran mucho encontrarme aquí.",
  },
  {
    name: "Carlos Rodríguez",
    role: "Entrenador personal",
    avatar: "/placeholder.svg?height=48&width=48",
    rating: 4,
    text: "Excelente plataforma para dar a conocer mis servicios. La interfaz es intuitiva y el soporte al cliente es muy eficiente cuando lo he necesitado.",
  },
  {
    name: "Laura Martínez",
    role: "Nutricionista",
    avatar: "/placeholder.svg?height=48&width=48",
    rating: 5,
    text: "Gracias a esta plataforma he podido expandir mi negocio a nuevas áreas. El sistema de mensajería con los clientes potenciales funciona de maravilla.",
  },
]
