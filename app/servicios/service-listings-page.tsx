"use client"

import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Check, ChevronDown, Filter, MapPin, Search, X } from "lucide-react"
import Image from "next/image";

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
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { ServiceListings } from "./service-listings"
import { serviciosData } from "./sample-data"

// Define types for our filters and services
type Ciudad = string
type Categoria = string
type Subcategoria = string

interface ServiceListingItem {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  imagePath?: string; // Path to image in Supabase bucket
  videoPath?: string; // Path to video in Supabase bucket
  badge: string | null; // Allow string or null for badge
  price: string;
  location: string;
  phone: string;
  whatsapp: string;
  website?: string; // Make website optional
  email: string;
  address?: string; // Make address optional
  coordinates?: { lat: number; lng: number }; // Make coordinates optional
  verified: boolean;
  isNew: boolean;
  publishedAt: Date;
  userId: string; // Ensure userId is present for AdCard
}

interface FilterState {
  ciudades: Ciudad[]
  categorias: Categoria[]
  subcategorias: Subcategoria[]
  searchTerm: string
}

export function ServiceListingsPage() {
  // Get initial data from server component
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)
  const [allServices, setAllServices] = useState<ServiceListingItem[]>([])
  const [totalListings, setTotalListings] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  // State for filters and search
  const [filters, setFilters] = useState<FilterState>({
    ciudades: [],
    categorias: [],
    subcategorias: [],
    searchTerm: "",
  })

  // State for filtered services
  const [filteredServices, setFilteredServices] = useState<ServiceListingItem[]>([])

  // State for active tab (mobile)
  const [activeTab, setActiveTab] = useState("todos")

  // State for sheet open (mobile filters)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // State for loading
  const [isLoading, setIsLoading] = useState(true)

  const searchParams = useSearchParams()
  const router = useRouter()

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true)
        const categoria = searchParams.get("categoria")
        const page = Number.parseInt(searchParams.get("page") || "1")

        // Fetch initial data
        const { listings, total, totalPages } = await ServiceListings({
          page,
          category_id: categoria ? getCategoryIdByName(categoria) : undefined,
        })

        setAllServices(
  listings.map(servicio => ({
    ...servicio,
    userId: servicio.userId || (servicio as any).user_id || 'unknown',
  })) as ServiceListingItem[]
)
setFilteredServices(
  listings.map(servicio => ({
    ...servicio,
    userId: servicio.userId || (servicio as any).user_id || 'unknown',
  })) as ServiceListingItem[]
)
        setTotalListings(total)
        setTotalPages(totalPages)
        setCurrentPage(page)
        setInitialDataLoaded(true)

        // Set initial filters based on URL
        if (categoria && !filters.categorias.includes(categoria)) {
          setFilters((prev) => ({
            ...prev,
            categorias: [categoria],
          }))
        }
      } catch (error) {
        console.error("Error loading initial data:", error)
        // Fallback to sample data
        setAllServices(serviciosData.map(servicio => ({ ...servicio })))
        setFilteredServices(serviciosData.map(servicio => ({ ...servicio })))
        setTotalListings(serviciosData.length)
        setTotalPages(Math.ceil(serviciosData.length / 12))
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [searchParams])

  // Helper function to get category ID by name (simplified)
  function getCategoryIdByName(name: string): number | undefined {
    const categoryMap: Record<string, number> = {
      Restaurantes: 1,
      Servicios: 2,
      Empleo: 3,
      Formación: 4,
      Productos: 5,
      Comunidad: 6,
      Inmobiliaria: 7,
    }

    return categoryMap[name]
  }

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
    if (!initialDataLoaded) return

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
  }, [filters.categorias, initialDataLoaded])

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

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    router.replace(`/servicios?page=${page}${filters.categorias.length ? `&categoria=${filters.categorias[0]}` : ""}`, {
      scroll: true,
    })
  }

  // Filter services based on filters and search term
  useEffect(() => {
    if (!initialDataLoaded) return

    let results = [...allServices]

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
  }, [filters, allServices, initialDataLoaded])

  // Get unique cities from data
  const uniqueCities = [
    "Baíña",
    "Figaredo",
    "Gallegos",
    "Loredo",
    "Mieres",
    "La Peña",
    "Rebollada",
    "Santa Cruz",
    "Santa Rosa",
    "Santullano",
    "Seana",
    "Turón",
    "Urbiés",
    "Ujo",
    "Valdecuna",
    "Online",
  ]

  // Get unique categories and subcategories
  const categoriesMap: Record<string, string[]> = {
    Restaurantes: ["Sidrería", "Asturiana", "Tradicional", "Tapas", "Parrilla"],
    Servicios: ["Peluquería", "Masajes", "Extranjería", "Limpieza", "Mudanzas"],
    Empleo: ["Tiempo completo", "Medio tiempo", "Por horas"],
    Formación: ["Cursos", "Talleres", "Certificaciones"],
    Productos: ["Alimentos", "Ropa", "Artesanía"],
    Comunidad: ["Asociación", "Compartir coche", "Compartir piso"],
    Inmobiliaria: [
      "Vivienda en Baíña",
      "Vivienda en Figaredo",
      "Vivienda en Gallegos",
      "Vivienda en Loredo",
      "Vivienda en Mieres",
      "Vivienda en La Peña",
      "Vivienda en Rebollada",
      "Vivienda en Santa Cruz",
      "Vivienda en Santa Rosa",
      "Vivienda en Santullano",
      "Vivienda en Seana",
      "Vivienda en Turón",
      "Vivienda en Urbiés",
      "Vivienda en Ujo",
      "Vivienda en Valdecuna",
    ],
    Otros: [],
  }

  // Contenido de la página
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <MainNav />

      <main className="flex-1">
      <div className="relative lg:flex lg:justify-center lg:gap-6 xl:gap-8 px-2 sm:px-4 lg:px-6">
        {/* START: Left Vertical Banner */}
        <aside className="hidden lg:block lg:w-40 xl:w-48 py-8 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar">
          <div className="space-y-6">
            <div className="aspect-[160/600] bg-muted/20 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <Image
                src="https://placehold.co/160x600/e2e8f0/a0aec0?text=Anuncio+Vertical+1"
                alt="Publicidad Vertical Izquierda"
                width={160}
                height={600}
                className="object-cover w-full h-full"
              />
            </div>
            {/* You can add more banners here if needed, e.g.: */}
            {/* <div className="aspect-[160/300] bg-muted/20 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 mt-6">
              <Image
                src="https://placehold.co/160x300/e2e8f0/a0aec0?text=Anuncio+Pequeño"
                alt="Publicidad Vertical Pequeña Izquierda"
                width={160}
                height={300}
                className="object-cover w-full h-full"
              />
            </div> */}
          </div>
        </aside>
        {/* END: Left Vertical Banner */}

        {/* START: Central Content Column */}
        <div className="flex-grow max-w-screen-xl w-full mx-auto">
        {/* Page Header */}
        <div className="bg-muted/30 border-b">
          <div className="container py-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Negocios Locales</h1>
            <p className="text-muted-foreground max-w-3xl">
             Encuentra negocios locales, oportunidades de empleo, formación y productos filtrando por ciudad y
              categoría.
            </p>
          </div>
        </div>
         {/* START: Added Menu and Banners */}
        <div className="container py-6">
          {/* Menu Section */}
          <nav className="mb-6 border-b pb-6">
            <ul className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4">
              <li><Button variant="ghost" asChild className="w-full sm:w-auto hover:bg-muted/50 px-4 py-2 text-sm font-medium"><a href="#" target="_blank" rel="noopener noreferrer">Amazon Local</a></Button></li>
              <li><Button variant="ghost" asChild className="w-full sm:w-auto hover:bg-muted/50 px-4 py-2 text-sm font-medium"><a href="#" target="_blank" rel="noopener noreferrer">Just Eat Local</a></Button></li>
              <li><Button variant="ghost" asChild className="w-full sm:w-auto hover:bg-muted/50 px-4 py-2 text-sm font-medium"><a href="#" target="_blank" rel="noopener noreferrer">Eventos en Mieres</a></Button></li>
              <li><Button variant="ghost" asChild className="w-full sm:w-auto hover:bg-muted/50 px-4 py-2 text-sm font-medium"><a href="#" target="_blank" rel="noopener noreferrer">Farmacias de Guardia</a></Button></li>
            </ul>
          </nav>

                  {/* Search and Filter Bar */}
        <div className="border-b sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar negocios locales, productos, empleos..."
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
                      <span>Parroquia</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto filter-scrollbar">
                    <DropdownMenuLabel className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      <span>Seleccionar parroquia</span>
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

          {/* Advertising Banners Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-3">
            {[1, 2, 3].map((num) => (
              <div key={num} className="aspect-[3/1] bg-muted/40 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <Image
                  src={`https://placehold.co/600x200/e2e8f0/a0aec0?text=Publicidad+${num}`}
                  alt={`Publicidad Banner ${num}`}
                  width={600}
                  height={200}
                  className="object-cover w-full h-full"
                  priority={num === 1}
                />
              </div>
            ))}
          </div>
        </div>
        {/* END: Added Menu and Banners */}

  

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
                      Parroquias
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
                    {/* <DropdownMenuItem>Relevancia</DropdownMenuItem> */}
                    <DropdownMenuItem>Más recientes</DropdownMenuItem>
                    <DropdownMenuItem>Precio: menor a mayor</DropdownMenuItem>
                    <DropdownMenuItem>Precio: mayor a menor</DropdownMenuItem>
                    {/* <DropdownMenuItem>Mejor valorados</DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Results Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-96 animate-pulse bg-muted rounded-lg" />
                  ))}
                </div>
              ) : filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((servicio) => {
                    // Ensure servicio.id is a valid non-empty string before rendering AdCard
                    if (typeof servicio.id !== 'string' || servicio.id.trim() === '') {
                      // Optionally log a warning or handle the error appropriately
                      // console.warn(`Service with title "${servicio.title}" has an invalid or empty ID (${servicio.id}). Skipping.`);
                      return null; // Skip rendering this AdCard
                    }
                    return (
                      <AdCard
                        key={servicio.id} // Use the validated servicio.id
                        id={servicio.id}   // Use the validated servicio.id
                        title={servicio.title}
                        category={servicio.category}
                        subcategory={servicio.subcategory}
                        description={servicio.description}
                        imagePath={servicio.imagePath} // Use imagePath
                        // videoPath={servicio.videoPath} // Uncomment if videoPath becomes available
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
                        userId={servicio.userId}
                      />
                    );
                  })}
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
              {filteredServices.length > 0 && totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <nav className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
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
                        className="h-4 w-4"
                      >
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      <span className="sr-only">Página anterior</span>
                    </Button>

                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      // Show pages around current page
                      let pageNum = i + 1
                      if (totalPages > 5) {
                        if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant="outline"
                          size="sm"
                          className={currentPage === pageNum ? "bg-primary text-primary-foreground" : ""}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}

                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
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
              </div>
        {/* END: Central Content Column */}

        {/* START: Right Vertical Banner */}
        <aside className="hidden lg:block lg:w-40 xl:w-48 py-8 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar">
          <div className="space-y-6">
            <div className="aspect-[160/600] bg-muted/20 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <Image
                src="https://placehold.co/160x600/edf2f7/718096?text=Anuncio+Vertical+2"
                alt="Publicidad Vertical Derecha"
                width={160}
                height={600}
                className="object-cover w-full h-full"
              />
            </div>
             {/* You can add more banners here if needed, e.g.: */}
            {/* <div className="aspect-[160/300] bg-muted/20 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 mt-6">
              <Image
                src="https://placehold.co/160x300/edf2f7/718096?text=Anuncio+Pequeño+2"
                alt="Publicidad Vertical Pequeña Derecha"
                width={160}
                height={300}
                className="object-cover w-full h-full"
              />
            </div> */}
          </div>
        </aside>
        {/* END: Right Vertical Banner */}
      </div>
    </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}

export default ServiceListingsPage
