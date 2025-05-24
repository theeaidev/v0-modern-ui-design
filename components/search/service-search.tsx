"use client"

import { useState, useCallback, useEffect } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { debounce } from "lodash"
import { AdCard } from "@/components/ad-card"
import ErrorBoundary from "@/components/error-boundary"
import { AlgoliaSearchResult } from "@/lib/algolia-search"
import { ServiceListing, ServiceImage, Category } from "@/types/service"

interface ServiceSearchProps {
  onSearch: (query: string) => Promise<AlgoliaSearchResult>
  initialQuery?: string
  placeholder?: string
  className?: string
}

export function ServiceSearch({
  onSearch,
  initialQuery = "",
  placeholder = "¿Qué servicio buscas?",
  className = "",
}: ServiceSearchProps) {
  const [query, setQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState<AlgoliaSearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Debounced search function to avoid too many requests
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSearchResults(null)
        setIsSearching(false)
        return
      }

      try {
        setIsSearching(true)
        const results = await onSearch(searchQuery)
        setSearchResults(results)
        setError(null)
        setHasSearched(true)
      } catch (err) {
        console.error("Search error:", err)
        setError("Error al buscar servicios. Por favor, inténtalo de nuevo.")
      } finally {
        setIsSearching(false)
      }
    }, 300),
    [onSearch]
  )

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
  }

  // Handle search button click
  const handleSearch = () => {
    debouncedSearch(query)
  }

  // Handle enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      debouncedSearch(query)
    }
  }

  // Initial search on mount if initial query is provided
  useEffect(() => {
    if (initialQuery) {
      debouncedSearch(initialQuery)
    }
  }, [initialQuery, debouncedSearch])

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={placeholder}
            className="pl-10 pr-4 py-6 text-base"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button size="lg" className="py-6" onClick={handleSearch} disabled={isSearching}>
          {isSearching ? "Buscando..." : "Buscar"}
        </Button>
      </div>

      {error && <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">{error}</div>}

      {hasSearched && searchResults && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            {searchResults.nbHits} resultados para "{searchResults.query}"
          </h2>

          {searchResults.nbHits > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.hits.map((service) => {
                // Extract category information if available
                let categoryName = "";
                if ('category' in service && service.category && typeof service.category === 'object') {
                  categoryName = (service.category as Category).name || "";
                }
                
                // Extract first image URL if available
                let imageUrl = "/placeholder.svg?height=300&width=400";
                if ('images' in service && Array.isArray(service.images) && service.images.length > 0) {
                  imageUrl = (service.images as ServiceImage[])[0].url;
                }
                
                // Parse coordinates if needed
                let coordinates = { lat: 0, lng: 0 };
                if (service.coordinates) {
                  if (typeof service.coordinates === 'string') {
                    try {
                      // Attempt to parse coordinates string (e.g., "POINT(lng lat)")
                      const match = service.coordinates.match(/POINT\(([\d.-]+)\s+([\d.-]+)\)/i);
                      if (match) {
                        coordinates = { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
                      } else {
                        // Try to parse as JSON
                        const parsed = JSON.parse(service.coordinates);
                        if (parsed.lat && parsed.lng) {
                          coordinates = parsed;
                        }
                      }
                    } catch (e) {
                      console.error("Failed to parse coordinates:", e);
                    }
                  } else if (typeof service.coordinates === 'object') {
                    coordinates = service.coordinates as { lat: number, lng: number };
                  }
                }
                
                return (
                  <ErrorBoundary
                    key={service.id}
                    fallback={<div className="p-4 border rounded">Error rendering service card</div>}
                  >
                    <AdCard
                      id={service.id}
                      title={service.title}
                      category={categoryName}
                      description={service.description}
                      image={imageUrl}
                      badge={service.is_featured ? "Destacado" : null}
                      price={service.price ? `${service.price}€` : "Consultar"}
                      location={service.city || service.location || ""}
                      phone={service.contact_phone || ""}
                      whatsapp={service.contact_whatsapp || ""}
                      website={service.contact_website || ""}
                      email={service.contact_email || ""}
                      address={service.address || ""}
                      coordinates={coordinates}
                      verified={service.is_verified || false}
                      isNew={service.created_at ? new Date(service.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : false}
                      publishedAt={new Date(service.created_at)}
                    />
                  </ErrorBoundary>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-8 bg-muted/30 rounded-lg">
              <h3 className="text-xl font-medium mb-2">No se encontraron resultados</h3>
              <p className="text-muted-foreground">
                Intenta con otros términos o explora las categorías disponibles
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
