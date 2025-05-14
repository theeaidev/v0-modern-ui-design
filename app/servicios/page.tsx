"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Check, ChevronDown, Filter, MapPin, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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

// Reemplazar todo el header con el componente MainNav
// Primero, añadir este import
import { MainNav } from "@/components/main-nav"

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
  id: number
  title: string
  category: string
  subcategory: string
  description: string
  image: string
  badge: string | null
  price: string
  location: string
}

export default function ServiciosPage() {
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
    "Online"
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
    Otros: []
  }

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
                                  <Checkbox
                                    id={`mobile-${category.toLowerCase()}`}
                                    checked={filters.categorias.includes(category)}
                                    onCheckedChange={() => handleCategoriaChange(category)}
                                    className="transition-all"
                                  />
                                </div>
                                <label
                                  htmlFor={`mobile-${category.toLowerCase()}`}
                                  className="font-medium group-hover:text-primary transition-colors"
                                >
                                  {category}
                                </label>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 pl-6">
                                {subcategories.map((subcategory) => (
                                  <div key={subcategory} className="flex items-center space-x-2 group">
                                    <div className="w-5 h-5 flex items-center justify-center">
                                      <Checkbox
                                        id={`mobile-${subcategory.toLowerCase().replace(/\s+/g, "-")}`}
                                        checked={filters.subcategorias.includes(subcategory)}
                                        onCheckedChange={() => handleSubcategoriaChange(subcategory)}
                                        className="transition-all"
                                      />
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
                                <Checkbox
                                  id={category.toLowerCase()}
                                  checked={filters.categorias.includes(category)}
                                  onCheckedChange={() => handleCategoriaChange(category)}
                                  className="transition-all"
                                />
                              </div>
                              <label
                                htmlFor={category.toLowerCase()}
                                className="font-medium group-hover:text-primary transition-colors"
                              >
                                {category}
                              </label>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-6">
                              {subcategories.map((subcategory) => (
                                <div key={subcategory} className="flex items-center space-x-2 group">
                                  <div className="w-5 h-5 flex items-center justify-center">
                                    <Checkbox
                                      id={subcategory.toLowerCase().replace(/\s+/g, "-")}
                                      checked={filters.subcategorias.includes(subcategory)}
                                      onCheckedChange={() => handleSubcategoriaChange(subcategory)}
                                      className="transition-all"
                                    />
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
                      Ordenar por: Relevancia
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Relevancia</DropdownMenuItem>
                    <DropdownMenuItem>Más recientes</DropdownMenuItem>
                    <DropdownMenuItem>Precio: menor a mayor</DropdownMenuItem>
                    <DropdownMenuItem>Precio: mayor a menor</DropdownMenuItem>
                    <DropdownMenuItem>Mejor valorados</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Results Grid */}
              {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((servicio) => (
                    <Card
                      key={servicio.id}
                      className="overflow-hidden group transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={servicio.image || "/placeholder.svg"}
                          alt={servicio.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {servicio.badge && (
                          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                            {servicio.badge}
                          </Badge>
                        )}
                        {servicio.price && (
                          <div className="absolute bottom-3 right-3 bg-background/90 text-foreground px-3 py-1 rounded-md font-medium">
                            {servicio.price}
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{servicio.title}</CardTitle>
                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                              {servicio.location}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {servicio.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">{servicio.description}</p>
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

      {/* Footer - Reused from existing pages */}
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
                  <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/servicios" className="text-sm text-muted-foreground hover:text-foreground">
                    Servicios
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Tienda
                  </Link>
                </li>
                <li>
                  <Link href="/#about" className="text-sm text-muted-foreground hover:text-foreground">
                    Quiénes somos
                  </Link>
                </li>
                <li>
                  <Link href="/#contact" className="text-sm text-muted-foreground hover:text-foreground">
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
                    className="h-5 w-5 text-primary mt-0.5"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="text-sm text-muted-foreground">+34 123 456 789</span>
                </li>
                <li className="flex items-start gap-3">
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
                    className="h-5 w-5 text-primary mt-0.5"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="m22 5-10 7L2 5" />
                  </svg>
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
                  <ChevronDown className="h-4 w-4 rotate-270" />
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

// Sample data for services
const serviciosData = [
  {
    id: 1,
    title: "Restaurante El Sabor Latino",
    category: "Restaurantes",
    subcategory: "Comida colombiana",
    description:
      "Auténtica comida colombiana con los mejores sabores tradicionales. Arepas, bandeja paisa y mucho más.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Destacado",
    price: "Menú 12€",
    location: "Madrid",
  },
  {
    id: 2,
    title: "Peluquería Latina Style",
    category: "Servicios",
    subcategory: "Peluquería",
    description:
      "Cortes, peinados, tratamientos y coloración para todo tipo de cabello. Especialistas en cabello latino.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Desde 15€",
    location: "Barcelona",
  },
  {
    id: 3,
    title: "Asesoría de Extranjería",
    category: "Servicios",
    subcategory: "Extranjería",
    description: "Trámites de residencia, nacionalidad, reagrupación familiar y todo tipo de gestiones migratorias.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Verificado",
    price: "Consulta 40€",
    location: "Madrid",
  },
  {
    id: 4,
    title: "Empleo: Camarero/a",
    category: "Empleo",
    subcategory: "Tiempo completo",
    description: "Se busca camarero/a con experiencia para restaurante latino. Horario completo, contrato estable.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Urgente",
    price: "1.200€/mes",
    location: "Valencia",
  },
  {
    id: 5,
    title: "Curso de Cocina Dominicana",
    category: "Formación",
    subcategory: "Cursos",
    description: "Aprende a preparar los platos más tradicionales de la República Dominicana con chef profesional.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Nuevo",
    price: "120€",
    location: "Barcelona",
  },
  {
    id: 6,
    title: "Productos Típicos Mexicanos",
    category: "Productos",
    subcategory: "Alimentos",
    description: "Venta de productos importados de México: salsas, dulces, snacks y más. Envíos a toda España.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Varios",
    location: "Online",
  },
  {
    id: 7,
    title: "Masajes Terapéuticos",
    category: "Servicios",
    subcategory: "Masajes",
    description: "Masajes relajantes, descontracturantes y terapéuticos. Técnicas tradicionales latinoamericanas.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "35€/sesión",
    location: "Sevilla",
  },
  {
    id: 8,
    title: "Empleo: Limpieza de Hogar",
    category: "Empleo",
    subcategory: "Por horas",
    description: "Se busca persona para limpieza de hogar. 4 horas diarias, 3 días a la semana. Zona centro.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "10€/hora",
    location: "Madrid",
  },
  {
    id: 9,
    title: "Taller de Baile Latino",
    category: "Formación",
    subcategory: "Talleres",
    description: "Aprende salsa, bachata, merengue y más. Clases para todos los niveles. Primera clase gratis.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Popular",
    price: "50€/mes",
    location: "Barcelona",
  },
  {
    id: 10,
    title: "Artesanía Peruana",
    category: "Productos",
    subcategory: "Artesanía",
    description: "Productos artesanales importados de Perú: textiles, cerámica, joyería y decoración.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Varios",
    location: "Madrid",
  },
  {
    id: 11,
    title: "Restaurante Sabor Venezolano",
    category: "Restaurantes",
    subcategory: "Comida venezolana",
    description: "Auténticas arepas, tequeños, pabellón criollo y más especialidades venezolanas.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Menú 10€",
    location: "Valencia",
  },
  {
    id: 12,
    title: "Certificación de Español",
    category: "Formación",
    subcategory: "Certificaciones",
    description: "Preparación para exámenes DELE. Profesores nativos con amplia experiencia.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Certificado",
    price: "200€/curso",
    location: "Málaga",
  },
  {
    id: 13,
    title: "Restaurante Sabor Dominicano",
    category: "Restaurantes",
    subcategory: "Comida dominicana",
    description: "Auténtica comida dominicana. Mangú, sancocho, mofongo y más especialidades caribeñas.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Menú 15€",
    location: "Madrid",
  },
  {
    id: 14,
    title: "Taquería Mexicana",
    category: "Restaurantes",
    subcategory: "Comida mexicana",
    description: "Los mejores tacos, quesadillas, enchiladas y más. Sabor auténtico mexicano.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Popular",
    price: "Desde 8€",
    location: "Barcelona",
  },
  {
    id: 15,
    title: "Cevichería Peruana",
    category: "Restaurantes",
    subcategory: "Comida peruana",
    description: "Especialistas en ceviche, lomo saltado, ají de gallina y toda la gastronomía peruana.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Platos desde 12€",
    location: "Madrid",
  },
  {
    id: 16,
    title: "Servicio de Mudanzas",
    category: "Servicios",
    subcategory: "Mudanzas",
    description: "Mudanzas locales, nacionales e internacionales. Servicio rápido, seguro y económico.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Desde 50€",
    location: "Barcelona",
  },
  {
    id: 17,
    title: "Empleo: Recepcionista",
    category: "Empleo",
    subcategory: "Medio tiempo",
    description: "Se busca recepcionista bilingüe español-inglés para hotel. Horario de tarde, media jornada.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "800€/mes",
    location: "Málaga",
  },
  {
    id: 18,
    title: "Ropa Típica Latinoamericana",
    category: "Productos",
    subcategory: "Ropa",
    description: "Venta de ropa tradicional de diferentes países latinoamericanos. Envíos a toda España.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Nuevo",
    price: "Varios",
    location: "Online",
  },
  // Nuevos datos para la categoría Comunidad
  {
    id: 19,
    title: "Asociación Cultural Latinoamericana",
    category: "Comunidad",
    subcategory: "Asociación",
    description: "Asociación dedicada a promover la cultura latinoamericana en España. Eventos, talleres y networking.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Destacado",
    price: "Membresía: 30€/año",
    location: "Madrid",
  },
  {
    id: 20,
    title: "Compartir coche Madrid-Barcelona",
    category: "Comunidad",
    subcategory: "Compartir coche",
    description: "Viaje semanal Madrid-Barcelona. Salida viernes 18:00h, regreso domingo 20:00h. Precio a compartir.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Recurrente",
    price: "25€/trayecto",
    location: "Madrid",
  },
  {
    id: 21,
    title: "Habitación en piso compartido",
    category: "Comunidad",
    subcategory: "Compartir piso",
    description:
      "Habitación individual en piso compartido con 3 personas más. Zona bien comunicada, ambiente tranquilo.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "350€/mes",
    location: "Barcelona",
  },

  // Nuevos datos para la categoría Inmobiliaria (un ejemplo por país)
  {
    id: 22,
    title: "Apartamento en Buenos Aires",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Argentina",
    description: "Hermoso apartamento de 2 habitaciones en Palermo, Buenos Aires. Totalmente amueblado y equipado.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Consultar",
    location: "Online",
  },
  {
    id: 23,
    title: "Casa en La Paz",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Bolivia",
    description: "Casa familiar de 3 dormitorios en zona residencial de La Paz. Jardín y garaje incluidos.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Consultar",
    location: "Online",
  },
  {
    id: 24,
    title: "Apartamento en Río de Janeiro",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Brasil",
    description: "Apartamento con vista al mar en Copacabana. 1 dormitorio, cocina equipada y terraza.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Vista al mar",
    price: "Consultar",
    location: "Online",
  },
  {
    id: 25,
    title: "Casa en Santiago",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Chile",
    description: "Casa moderna en Las Condes, Santiago. 4 dormitorios, 3 baños, jardín y piscina.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Consultar",
    location: "Online",
  },
  {
    id: 26,
    title: "Apartamento en Medellín",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Colombia",
    description: "Apartamento en El Poblado, Medellín. 2 habitaciones, 2 baños, balcón con vista a la ciudad.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Consultar",
    location: "Online",
  },
  {
    id: 27,
    title: "Casa en San José",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Costa Rica",
    description: "Casa en condominio cerrado en Escazú, San José. 3 habitaciones, jardín y seguridad 24h.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Consultar",
    location: "Online",
  },
  {
    id: 28,
    title: "Apartamento en La Habana",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Cuba",
    description: "Apartamento colonial restaurado en La Habana Vieja. 2 habitaciones y balcón con vista a la plaza.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Colonial",
    price: "Consultar",
    location: "Online",
  },
  {
    id: 29,
    title: "Casa en Quito",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Ecuador",
    description: "Casa familiar en el Valle de los Chillos, Quito. 4 dormitorios, jardín amplio y área de barbacoa.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Consultar",
    location: "Online",
  },
  {
    id: 30,
    title: "Apartamento en San Salvador",
    category: "Inmobiliaria",
    subcategory: "Vivienda en El Salvador",
    description: "Apartamento moderno en Zona Rosa, San Salvador. 2 habitaciones, seguridad 24h y áreas comunes.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Consultar",
    location: "Online",
  },
  {
    id: 31,
    title: "Casa en Ciudad de Guatemala",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Guatemala",
    description: "Casa en zona 16, Ciudad de Guatemala. 3 habitaciones, jardín, garaje para 2 coches.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Consultar",
    location: "Online",
  },
  {
    id: 32,
    title: "Apartamento en Tegucigalpa",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Honduras",
    description: "Apartamento en Lomas del Guijarro, Tegucigalpa. 2 habitaciones, completamente amueblado.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Amueblado",
    price: "Consultar",
    location: "Online",
  },
  {
    id: 33,
    title: "Casa en Ciudad de México",
    category: "Inmobiliaria",
    subcategory: "Vivienda en México",
    description: "Casa en Condesa, CDMX. 3 habitaciones, terraza, estilo art déco restaurado.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Consultar",
    location: "Online",
  },
  {
    id: 34,
    title: "Casa en Managua",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Nicaragua",
    description: "Casa en Carretera a Masaya, Managua. 3 habitaciones, piscina, jardín y seguridad.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Consultar",
    location: "Online",
  },
  {
    id: 35,
    title: "Apartamento en Ciudad de Panamá",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Panamá",
    description: "Apartamento de lujo en Punta Pacífica, Ciudad de Panamá. 3 habitaciones, vista al mar, amenidades.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Lujo",
    price: "Consultar",
    location: "Online",
  },
  {
    id: 36,
    title: "Casa en Asunción",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Paraguay",
    description: "Casa en barrio Carmelitas, Asunción. 4 dormitorios, jardín amplio y piscina.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Consultar",
    location: "Online",
  },
  {
    id: 37,
    title: "Apartamento en Lima",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Perú",
    description: "Apartamento en Miraflores, Lima. 2 habitaciones, vista al parque, cerca de restaurantes y comercios.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Consultar",
    location: "Online",
  },
  {
    id: 38,
    title: "Casa en San Juan",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Puerto Rico",
    description: "Casa en Condado, San Juan. 3 habitaciones, a pasos de la playa, completamente renovada.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Cerca de playa",
    price: "Consultar",
    location: "Online",
  },
  {
    id: 39,
    title: "Villa en Punta Cana",
    category: "Inmobiliaria",
    subcategory: "Vivienda en República Dominicana",
    description: "Villa de lujo en complejo privado en Punta Cana. 4 habitaciones, piscina privada, acceso a la playa.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Lujo",
    price: "Consultar",
    location: "Online",
  },
  {
    id: 40,
    title: "Apartamento en Montevideo",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Uruguay",
    description: "Apartamento en Pocitos, Montevideo. 2 dormitorios, terraza, cerca de la rambla.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Consultar",
    location: "Online",
  },
  {
    id: 41,
    title: "Apartamento en Caracas",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Venezuela",
    description: "Apartamento en Los Palos Grandes, Caracas. 3 habitaciones, vistas panorámicas, seguridad 24h.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Consultar",
    location: "Online",
  },
  {
    id: 42,
    title: "Casa en Puerto Príncipe",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Haití",
    description: "Casa en Pétion-Ville, Puerto Príncipe. 3 habitaciones, jardín, seguridad privada.",
    image: "/placeholder.svg?height=300&width=400",
    badge: null,
    price: "Consultar",
    location: "Online",
  },
  {
    id: 43,
    title: "Apartamento en Cayena",
    category: "Inmobiliaria",
    subcategory: "Vivienda en Guayana Francesa",
    description: "Apartamento en el centro de Cayena. 2 habitaciones, balcón, completamente amueblado.",
    image: "/placeholder.svg?height=300&width=400",
    badge: "Amueblado",
    price: "Consultar",
    location: "Online",
  },
]
