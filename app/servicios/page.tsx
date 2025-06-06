"use client"

import { useRouter } from "next/navigation"

import { useSearchParams } from "next/navigation"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { Check, ChevronDown, Filter, MapPin, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { AdCard } from "@/components/ad-card"

// Reemplazar todo el header con el componente MainNav
// Primero, añadir este import
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { ServiceListingsPage } from "./service-listings-page"
import ServiceListingsLoading from "@/app/servicios/service-listings-loading"

// Define types for our filters and services
type Ciudad = string
type Categoria = string
type Subcategoria = string

interface FilterState {
  ciudades: Ciudad[]
  categorias: Categoria[]
  subcategorias: Subcategoria[]
  searchTerm: string
}

interface Servicio {
  id: string
  userId: string; // Added userId
  title: string
  category: string
  subcategory: string
  description: string
  imagePath: string
  badge: string | null
  price: string
  location: string
  phone?: string
  whatsapp?: string
  website?: string
  email?: string
  address?: string
  coordinates?: { lat: number; lng: number }
  verified?: boolean
  isNew?: boolean
  publishedAt: Date
}

export default function ServiciosPage() {
  return (
    <Suspense fallback={<ServiceListingsLoading />}>
      <ServiceListingsPage />
    </Suspense>
  )
}

function ServiceListingsPageContent() {
  // State for filters and search
  const [filters, setFilters] = useState<FilterState>({
    ciudades: [],
    categorias: [],
    subcategorias: [],
    searchTerm: "",
  })

  // State for filtered services
  const [filteredServices, setFilteredServices] = useState<Servicio[]>(serviciosData)

  // State for active tab (mobile)
  const [activeTab, setActiveTab] = useState("todos")

  // State for sheet open (mobile filters)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Añadir estado para el menú móvil
  // Modificar la declaración de estados al inicio de la función del componente
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  // Add this useEffect to handle URL parameters
  useEffect(() => {
    const categoria = searchParams.get("categoria")
    if (categoria && !filters.categorias.includes(categoria)) {
      // Update filters based on URL parameter
      setFilters((prev) => ({
        ...prev,
        categorias: [categoria],
      }))

      // Update active tab for mobile view
      if (categoria.toLowerCase() === "empleo") {
        setActiveTab("empleo")
      } else {
        // Map other categories to their respective tabs
        const categoryToTabMap: Record<string, string> = {
          Restaurantes: "restaurantes",
          Servicios: "servicios",
          Formación: "formacion",
          Productos: "productos",
          Comunidad: "comunidad",
          Inmobiliaria: "inmobiliaria",
        }

        setActiveTab(categoryToTabMap[categoria] || "todos")
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("categoria")])

  // Update URL when categories change
  useEffect(() => {
    // Skip the initial render
    if (filters.categorias.length === 1) {
      // Use replace instead of push to avoid adding to history stack
      router.replace(`/servicios?categoria=${filters.categorias[0]}`, {
        scroll: false,
      })
    } else if (filters.categorias.length === 0 && searchParams.has("categoria")) {
      router.replace("/servicios", { scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.categorias])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      searchTerm: e.target.value,
    }))
  }

  // Handle city filter change
  const handleCiudadChange = (ciudad: Ciudad) => {
    setFilters((prev) => {
      // If "Todas" is selected, clear all city filters
      if (ciudad === "Todas") {
        return {
          ...prev,
          ciudades: [],
        }
      }

      // Toggle the selected city
      const newCiudades = prev.ciudades.includes(ciudad)
        ? prev.ciudades.filter((c) => c !== ciudad)
        : [...prev.ciudades, ciudad]

      return {
        ...prev,
        ciudades: newCiudades,
      }
    })
  }

  // Handle category filter change
  const handleCategoriaChange = (categoria: Categoria) => {
    setFilters((prev) => {
      const newCategorias = prev.categorias.includes(categoria)
        ? prev.categorias.filter((c) => c !== categoria)
        : [...prev.categorias, categoria]

      return {
        ...prev,
        categorias: newCategorias,
      }
    })

    // Update mobile tab if a category is selected
    if (!activeTab.includes(categoria.toLowerCase()) && categoria !== "") {
      setActiveTab(categoria.toLowerCase())
    }
  }

  // Handle subcategory filter change
  const handleSubcategoriaChange = (subcategoria: Subcategoria) => {
    setFilters((prev) => {
      const newSubcategorias = prev.subcategorias.includes(subcategoria)
        ? prev.subcategorias.filter((s) => s !== subcategoria)
        : [...prev.subcategorias, subcategoria]

      return {
        ...prev,
        subcategorias: newSubcategorias,
      }
    })
  }

  // Remove a specific filter
  const removeFilter = (type: "ciudad" | "categoria" | "subcategoria", value: string) => {
    setFilters((prev) => {
      if (type === "ciudad") {
        return {
          ...prev,
          ciudades: prev.ciudades.filter((c) => c !== value),
        }
      } else if (type === "categoria") {
        return {
          ...prev,
          categorias: prev.categorias.filter((c) => c !== value),
        }
      } else {
        return {
          ...prev,
          subcategorias: prev.subcategorias.filter((s) => s !== value),
        }
      }
    })
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      ciudades: [],
      categorias: [],
      subcategorias: [],
      searchTerm: "",
    })
    setActiveTab("todos")
  }

  // Handle tab change (mobile)
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Update category filters based on tab
    if (value === "todos") {
      setFilters((prev) => ({
        ...prev,
        categorias: [],
      }))
    } else {
      const categoryMap: Record<string, string> = {
        restaurantes: "Restaurantes",
        servicios: "Servicios",
        empleo: "Empleo",
        formacion: "Formación",
        productos: "Productos",
        comunidad: "Comunidad",
        inmobiliaria: "Inmobiliaria",
      }

      const category = categoryMap[value]
      if (category) {
        setFilters((prev) => ({
          ...prev,
          categorias: [category],
        }))
      }
    }
  }

  // Filter services based on filters and search term
  useEffect(() => {
    let results = [...serviciosData]

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      results = results.filter(
        (service) =>
          service.title.toLowerCase().includes(searchLower) ||
          service.description.toLowerCase().includes(searchLower) ||
          service.category.toLowerCase().includes(searchLower) ||
          service.subcategory.toLowerCase().includes(searchLower),
      )
    }

    // Filter by cities
    if (filters.ciudades.length > 0) {
      results = results.filter((service) => filters.ciudades.includes(service.location))
    }

    // Filter by categories
    if (filters.categorias.length > 0) {
      results = results.filter((service) => filters.categorias.includes(service.category))
    }

    // Filter by subcategories
    if (filters.subcategorias.length > 0) {
      results = results.filter((service) => filters.subcategorias.includes(service.subcategory))
    }

    setFilteredServices(results)
  }, [filters])

  // Get unique cities from data
  const uniqueCities = [
    "A Coruña",
    "Álava",
    "Albacete",
    "Alicante",
    "Almería",
    "Asturias",
    "Ávila",
    "Badajoz",
    "Barcelona",
    "Burgos",
    "Cáceres",
    "Cádiz",
    "Cantabria",
    "Castellón",
    "Ciudad Real",
    "Córdoba",
    "Cuenca",
    "Girona",
    "Granada",
    "Guadalajara",
    "Guipúzcoa",
    "Huelva",
    "Huesca",
    "Islas Baleares",
    "Jaén",
    "La Rioja",
    "Las Palmas",
    "León",
    "Lleida",
    "Lugo",
    "Madrid",
    "Málaga",
    "Murcia",
    "Navarra",
    "Ourense",
    "Palencia",
    "Pontevedra",
    "Salamanca",
    "Santa Cruz de Tenerife",
    "Segovia",
    "Sevilla",
    "Soria",
    "Tarragona",
    "Teruel",
    "Toledo",
    "Valencia",
    "Valladolid",
    "Vizcaya",
    "Zamora",
    "Zaragoza",
    "Online",
  ]

  // Get unique categories and subcategories
  const categoriesMap: Record<string, string[]> = {
    Restaurantes: ["Comida dominicana", "Comida colombiana", "Comida mexicana", "Comida peruana", "Comida venezolana"],
    Servicios: ["Peluquería", "Masajes", "Extranjería", "Limpieza", "Mudanzas"],
    Empleo: ["Tiempo completo", "Medio tiempo", "Por horas"],
    Formación: ["Cursos", "Talleres", "Certificaciones"],
    Productos: ["Alimentos", "Ropa", "Artesanía"],
    Comunidad: ["Asociación", "Compartir coche", "Compartir piso"],
    Inmobiliaria: [
      "Vivienda en Argentina",
      "Vivienda en Bolivia",
      "Vivienda en Brasil",
      "Vivienda en Chile",
      "Vivienda en Colombia",
      "Vivienda en Costa Rica",
      "Vivienda en Cuba",
      "Vivienda en Ecuador",
      "Vivienda en El Salvador",
      "Vivienda en Guatemala",
      "Vivienda en Honduras",
      "Vivienda en México",
      "Vivienda en Nicaragua",
      "Vivienda en Panamá",
      "Vivienda en Paraguay",
      "Vivienda en Perú",
      "Vivienda en Puerto Rico",
      "Vivienda en República Dominicana",
      "Vivienda en Uruguay",
      "Vivienda en Venezuela",
      "Vivienda en Haití",
      "Vivienda en Guayana Francesa",
    ],
    Otros: [],
  }

  // Contenido de la página

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <MainNav />

      <main className="flex-1">
        {/* Page Header */}
        <div className="bg-muted/30 border-b">
          <div className="container py-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Servicios</h1>
            <p className="text-muted-foreground max-w-3xl">
              Encuentra servicios latinos, oportunidades de empleo, formación y productos filtrando por ciudad y
              categoría.
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="border-b sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar servicios, productos, empleos..."
                  className="pl-10 pr-4"
                  value={filters.searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>Ciudad</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto filter-scrollbar">
                    <DropdownMenuLabel className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      <span>Seleccionar provincia</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => handleCiudadChange("Todas")}
                        className="flex items-center cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <div className="w-5 h-5 mr-2 flex items-center justify-center">
                          {filters.ciudades.length === 0 && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <span className="font-medium">Todas</span>
                      </DropdownMenuItem>
                      {uniqueCities.map((ciudad) => (
                        <DropdownMenuItem
                          key={ciudad}
                          onClick={() => handleCiudadChange(ciudad)}
                          className="flex items-center cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <div className="w-5 h-5 mr-2 flex items-center justify-center">
                            {filters.ciudades.includes(ciudad) && <Check className="h-4 w-4 text-primary" />}
                          </div>
                          <span className={filters.ciudades.includes(ciudad) ? "font-medium" : ""}>{ciudad}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Filter Button */}
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="md:hidden flex gap-2">
                      <Filter className="h-4 w-4" />
                      <span>Filtros</span>
                      {(filters.categorias.length > 0 || filters.subcategorias.length > 0) && (
                        <Badge
                          variant="secondary"
                          className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                        >
                          {filters.categorias.length + filters.subcategorias.length}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                      <SheetDescription>Filtra los resultados por categoría y subcategoría</SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                      <Accordion type="multiple" className="w-full">
                        {Object.entries(categoriesMap).map(([category, subcategories]) => (
                          <AccordionItem key={category} value={category.toLowerCase()}>
                            <AccordionTrigger className="flex items-center group">
                              <div className="flex items-center">
                                <div className="w-5 h-5 mr-2 flex items-center justify-center">
                                  <div
                                    className={`h-4 w-4 rounded-sm border border-primary ring-offset-background transition-colors 
                                    ${
                                      filters.categorias.includes(category)
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-transparent"
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCategoriaChange(category)
                                    }}
                                  >
                                    {filters.categorias.includes(category) && (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4"
                                      >
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                                <span className="font-medium group-hover:text-primary transition-colors">
                                  {category}
                                </span>
                              </div>
                            </AccordionTrigger>

                            <AccordionContent>
                              <div className="space-y-3 pl-6">
                                {subcategories.map((subcategory) => (
                                  <div key={subcategory} className="flex items-center space-x-2 group">
                                    <div className="w-5 h-5 flex items-center justify-center">
                                      <div
                                        className={`h-4 w-4 rounded-sm border border-primary ring-offset-background transition-colors cursor-pointer
                                        ${
                                          filters.subcategorias.includes(subcategory)
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-transparent"
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleSubcategoriaChange(subcategory)
                                        }}
                                      >
                                        {filters.subcategorias.includes(subcategory) && (
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-4 w-4"
                                          >
                                            <polyline points="20 6 9 17 4 12" />
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                    <label
                                      htmlFor={`mobile-${subcategory.toLowerCase().replace(/\s+/g, "-")}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 group-hover:text-primary transition-colors"
                                    >
                                      {subcategory}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                    <div className="flex justify-between mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          clearAllFilters()
                          setIsSheetOpen(false)
                        }}
                      >
                        Limpiar filtros
                      </Button>
                      <Button onClick={() => setIsSheetOpen(false)}>Aplicar filtros</Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Desktop Sidebar Filters */}
            <div className="hidden md:block w-64 shrink-0">
              <div className="sticky top-36">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Categorías</h3>
                    <Accordion
                      type="multiple"
                      className="w-full"
                      defaultValue={filters.categorias.map((c) => c.toLowerCase())}
                    >
                      {Object.entries(categoriesMap).map(([category, subcategories]) => (
                        <AccordionItem key={category} value={category.toLowerCase()}>
                          <AccordionTrigger className="text-sm py-2 group">
                            <div className="flex items-center">
                              <div className="w-5 h-5 mr-2 flex items-center justify-center">
                                <div
                                  className={`h-4 w-4 rounded-sm border border-primary ring-offset-background transition-colors cursor-pointer
                                  ${
                                    filters.categorias.includes(category)
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-transparent"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCategoriaChange(category)
                                  }}
                                >
                                  {filters.categorias.includes(category) && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="h-4 w-4"
                                    >
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <span className="font-medium group-hover:text-primary transition-colors">{category}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-6">
                              {subcategories.map((subcategory) => (
                                <div key={subcategory} className="flex items-center space-x-2 group">
                                  <div className="w-5 h-5 flex items-center justify-center">
                                    <div
                                      className={`h-4 w-4 rounded-sm border border-primary ring-offset-background transition-colors cursor-pointer
                                      ${
                                        filters.subcategorias.includes(subcategory)
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-transparent"
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleSubcategoriaChange(subcategory)
                                      }}
                                    >
                                      {filters.subcategorias.includes(subcategory) && (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="h-4 w-4"
                                        >
                                          <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                  <label
                                    htmlFor={subcategory.toLowerCase().replace(/\s+/g, "-")}
                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 group-hover:text-primary transition-colors"
                                  >
                                    {subcategory}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      Provincia
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 filter-scrollbar">
                      <div className="flex items-center space-x-2 group">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <Checkbox
                            id="ciudad-todas"
                            checked={filters.ciudades.length === 0}
                            onCheckedChange={() => handleCiudadChange("Todas")}
                            className="transition-all"
                          />
                        </div>
                        <label
                          htmlFor="ciudad-todas"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 group-hover:text-primary transition-colors font-medium"
                        >
                          Todas
                        </label>
                      </div>
                      {uniqueCities.map((ciudad) => (
                        <div key={ciudad} className="flex items-center space-x-2 group">
                          <div className="w-5 h-5 flex items-center justify-center">
                            <Checkbox
                              id={`ciudad-${ciudad.toLowerCase().replace(/\s+/g, "-")}`}
                              checked={filters.ciudades.includes(ciudad)}
                              onCheckedChange={() => handleCiudadChange(ciudad)}
                              className="transition-all"
                            />
                          </div>
                          <label
                            htmlFor={`ciudad-${ciudad.toLowerCase().replace(/\s+/g, "-")}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 group-hover:text-primary transition-colors"
                          >
                            {ciudad}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <Button variant="outline" className="w-full" onClick={clearAllFilters}>
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1">
              {/* Active Filters */}
              {(filters.ciudades.length > 0 ||
                filters.categorias.length > 0 ||
                filters.subcategorias.length > 0 ||
                filters.searchTerm) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {filters.searchTerm && (
                    <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      Búsqueda: {filters.searchTerm}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setFilters((prev) => ({ ...prev, searchTerm: "" }))}
                      />
                    </Badge>
                  )}
                  {filters.ciudades.map((ciudad) => (
                    <Badge key={ciudad} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      {ciudad}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("ciudad", ciudad)} />
                    </Badge>
                  ))}
                  {filters.categorias.map((categoria) => (
                    <Badge key={categoria} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      {categoria}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("categoria", categoria)} />
                    </Badge>
                  ))}
                  {filters.subcategorias.map((subcategoria) => (
                    <Badge key={subcategoria} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      {subcategoria}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFilter("subcategoria", subcategoria)}
                      />
                    </Badge>
                  ))}
                  {(filters.ciudades.length > 0 ||
                    filters.categorias.length > 0 ||
                    filters.subcategorias.length > 0 ||
                    filters.searchTerm) && (
                    <Button variant="link" className="text-xs h-auto p-0 ml-2" onClick={clearAllFilters}>
                      Limpiar todos
                    </Button>
                  )}
                </div>
              )}

              {/* Category Tabs (Mobile and Tablet) */}
              <div className="md:hidden mb-6">
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="w-full justify-start overflow-auto">
                    <TabsTrigger value="todos">Todos</TabsTrigger>
                    <TabsTrigger value="restaurantes">Restaurantes</TabsTrigger>
                    <TabsTrigger value="servicios">Servicios</TabsTrigger>
                    <TabsTrigger value="empleo">Empleo</TabsTrigger>
                    <TabsTrigger value="formacion">Formación</TabsTrigger>
                    <TabsTrigger value="productos">Productos</TabsTrigger>
                    <TabsTrigger value="comunidad">Comunidad</TabsTrigger>
                    <TabsTrigger value="inmobiliaria">Inmobiliaria</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Results Count and Sort */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-muted-foreground">
                  Mostrando {filteredServices.length} {filteredServices.length === 1 ? "resultado" : "resultados"}
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Ordenar por: Más recientes
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/*  <DropdownMenuItem>Relevancia</DropdownMenuItem> */}
                    <DropdownMenuItem>Más recientes</DropdownMenuItem>
                    <DropdownMenuItem>Precio: menor a mayor</DropdownMenuItem>
                    <DropdownMenuItem>Precio: mayor a menor</DropdownMenuItem>
                    {/* <DropdownMenuItem>Mejor valorados</DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Results Grid */}
              {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((servicio) => (
                    <AdCard
                      key={servicio.id}
                      id={servicio.id}
                      userId={servicio.userId} // Added userId
                      title={servicio.title}
                      category={servicio.category}
                      subcategory={servicio.subcategory}
                      description={servicio.description}
                      imagePath={servicio.imagePath}
                      badge={servicio.badge}
                      price={servicio.price}
                      location={servicio.location}
                      phone={servicio.phone}
                      whatsapp={servicio.whatsapp}
                      website={servicio.website}
                      email={servicio.email}
                      address={servicio.address}
                      coordinates={servicio.coordinates}
                      verified={servicio.verified}
                      isNew={servicio.isNew}
                      publishedAt={servicio.publishedAt}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No se encontraron resultados</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    No hemos encontrado resultados que coincidan con tu búsqueda. Intenta con otros términos o ajusta
                    los filtros.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
                    Limpiar filtros
                  </Button>
                </div>
              )}

              {/* Pagination - Only show if we have results */}
              {filteredServices.length > 0 && (
                <div className="flex justify-center mt-12">
                  <nav className="flex items-center gap-1">
                    <Button variant="outline" size="icon" disabled>
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
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      <span className="sr-only">Página anterior</span>
                    </Button>
                    <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                      1
                    </Button>
                    <Button variant="outline" size="sm">
                      2
                    </Button>
                    <Button variant="outline" size="sm">
                      3
                    </Button>
                    <Button variant="outline" size="sm">
                      4
                    </Button>
                    <Button variant="outline" size="sm">
                      5
                    </Button>
                    <Button variant="outline" size="icon">
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
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                      <span className="sr-only">Página siguiente</span>
                    </Button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}

// Sample data for services
const serviciosData: Servicio[] = [
  {
    id: "1",
    userId: "user-1-placeholder",
    title: "Restaurante El Sabor Latino",
    category: "Restaurantes",
    subcategory: "Comida colombiana",
    description:
      "Auténtica comida colombiana con los mejores sabores tradicionales. Arepas, bandeja paisa y mucho más.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: "Destacado",
    price: "Menú 12€",
    location: "Madrid",
    phone: "+34 612 345 678",
    whatsapp: "+34612345678",
    website: "www.saborlatino.es",
    email: "info@saborlatino.es",
    address: "Calle Gran Vía 41, Madrid",
    coordinates: { lat: 40.4256, lng: -3.6868 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 días atrás
  },
  {
    id: "2",
    userId: "user-2-placeholder",
    title: "Peluquería Latina Style",
    category: "Servicios",
    subcategory: "Peluquería",
    description:
      "Cortes, peinados, tratamientos y coloración para todo tipo de cabello. Especialistas en cabello latino.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Desde 15€",
    location: "Barcelona",
    phone: "+34 623 456 789",
    whatsapp: "+34623456789",
    website: "latinastyle.com",
    email: "contacto@latinastyle.com",
    address: "Av. Diagonal 405, Barcelona",
    coordinates: { lat: 41.3975, lng: 2.1702 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
  },
  {
    id: "3",
    userId: "user-3-placeholder",
    title: "Asesoría de Extranjería",
    category: "Servicios",
    subcategory: "Extranjería",
    description: "Trámites de residencia, nacionalidad, reagrupación familiar y todo tipo de gestiones migratorias.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: "Verificado",
    price: "Consulta 40€",
    location: "Madrid",
    phone: "+34 634 567 890",
    whatsapp: "+34634567890",
    website: "asesoriainmigracion.es",
    email: "info@asesoriainmigracion.es",
    address: "Calle Alcalá 120, Madrid",
    coordinates: { lat: 40.423, lng: -3.673 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 días atrás
  },
  {
    id: "4",
    userId: "user-4-placeholder",
    title: "Empleo: Camarero/a",
    category: "Empleo",
    subcategory: "Tiempo completo",
    description: "Se busca camarero/a con experiencia para restaurante latino. Horario completo, contrato estable.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: "Urgente",
    price: "1.200€/mes",
    location: "Valencia",
    phone: "+34 645 678 901",
    whatsapp: "+34645678901",
    email: "empleo@restaurantelatino.es",
    address: "Calle de la Paz 15, Valencia",
    coordinates: { lat: 39.4702, lng: -0.3768 },
    verified: false,
    isNew: true,
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
  },
  {
    id: "5",
    userId: "user-5-placeholder",
    title: "Curso de Cocina Dominicana",
    category: "Formación",
    subcategory: "Cursos",
    description: "Aprende a preparar los platos más tradicionales de la República Dominicana con chef profesional.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: "Nuevo",
    price: "120€",
    location: "Barcelona",
    phone: "+34 656 789 012",
    whatsapp: "+34656789012",
    website: "cocinadominicana.es",
    email: "cursos@cocinadominicana.es",
    address: "Rambla de Catalunya 60, Barcelona",
    coordinates: { lat: 41.392, lng: 2.165 },
    verified: false,
    isNew: true,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
  },
  {
    id: "6",
    userId: "user-6-placeholder",
    title: "Productos Típicos Mexicanos",
    category: "Productos",
    subcategory: "Alimentos",
    description: "Venta de productos importados de México: salsas, dulces, snacks y más. Envíos a toda España.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Varios",
    location: "Online",
    phone: "+34 667 890 123",
    whatsapp: "+34667890123",
    website: "productosmexicanos.es",
    email: "info@productosmexicanos.es",
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 días atrás
  },
  {
    id: "7",
    userId: "user-7-placeholder",
    title: "Masajes Terapéuticos",
    category: "Servicios",
    subcategory: "Masajes",
    description: "Masajes relajantes, descontracturantes y terapéuticos. Técnicas tradicionales latinoamericanas.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "35€/sesión",
    location: "Sevilla",
    phone: "+34 678 901 234",
    whatsapp: "+34678901234",
    website: "masajesterapeuticos.es",
    email: "citas@masajesterapeuticos.es",
    address: "Av. de la Constitución 20, Sevilla",
    coordinates: { lat: 37.3886, lng: -5.9953 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 días atrás
  },
  {
    id: "8",
    userId: "user-8-placeholder",
    title: "Empleo: Limpieza de Hogar",
    category: "Empleo",
    subcategory: "Por horas",
    description: "Se busca persona para limpieza de hogar. 4 horas diarias, 3 días a la semana. Zona centro.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "10€/hora",
    location: "Madrid",
    phone: "+34 689 012 345",
    whatsapp: "+34689012345",
    email: "empleo.limpieza@gmail.com",
    address: "Barrio Salamanca, Madrid",
    verified: false,
    isNew: false,
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 días atrás
  },
  {
    id: "9",
    userId: "user-9-placeholder",
    title: "Taller de Baile Latino",
    category: "Formación",
    subcategory: "Talleres",
    description: "Aprende salsa, bachata, merengue y más. Clases para todos los niveles. Primera clase gratis.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: "Popular",
    price: "50€/mes",
    location: "Barcelona",
    phone: "+34 690 123 456",
    whatsapp: "+34690123456",
    website: "bailelatino.es",
    email: "info@bailelatino.es",
    address: "Carrer de Balmes 150, Barcelona",
    coordinates: { lat: 41.395, lng: 2.1527 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 días atrás
  },
  {
    id: "10",
    userId: "user-10-placeholder",
    title: "Artesanía Peruana",
    category: "Productos",
    subcategory: "Artesanía",
    description: "Productos artesanales importados de Perú: textiles, cerámica, joyería y decoración.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Varios",
    location: "Madrid",
    phone: "+34 601 234 567",
    whatsapp: "+34601234567",
    website: "artesaniasperuanas.es",
    email: "ventas@artesaniasperuanas.es",
    address: "Calle Fuencarral 70, Madrid",
    coordinates: { lat: 40.426, lng: -3.702 },
    verified: false,
    isNew: true,
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
  },
  {
    id: "11",
    userId: "user-11-placeholder",
    title: "Restaurante Sabor Venezolano",
    category: "Restaurantes",
    subcategory: "Comida venezolana",
    description: "Auténticas arepas, tequeños, pabellón criollo y más especialidades venezolanas.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Menú 10€",
    location: "Valencia",
    phone: "+34 612 345 678",
    whatsapp: "+34612345678",
    website: "saborvenezolano.es",
    email: "info@saborvenezolano.es",
    address: "Av. del Puerto 45, Valencia",
    coordinates: { lat: 39.465, lng: -0.335 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 días atrás
  },
  {
    id: "12",
    userId: "user-12-placeholder",
    title: "Certificación de Español",
    category: "Formación",
    subcategory: "Certificaciones",
    description: "Preparación para exámenes DELE. Profesores nativos con amplia experiencia.",
    imagePath: "/placeholder.svg?height=300&width=400",
    badge: "Certificado",
    price: "200€/curso",
    location: "Málaga",
    phone: "+34 623 456 789",
    whatsapp: "+34623456789",
    website: "certificacionespanol.es",
    email: "info@certificacionespanol.es",
    address: "Paseo Marítimo 25, Málaga",
    coordinates: { lat: 36.7213, lng: -4.4214 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 días atrás
  },
]
