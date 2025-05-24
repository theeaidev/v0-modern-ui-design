"use client"

import { useState } from "react"
import { ServiceSearch } from "./service-search"
import { AlgoliaSearchResult } from "@/lib/algolia-search"
import { searchActiveListings } from "@/lib/algolia-server"

interface ServiceSearchClientProps {
  className?: string
}

export function ServiceSearchClient({ className = "" }: ServiceSearchClientProps) {
  const [isSearching, setIsSearching] = useState(false)

  // Handle search execution and connect to server action
  const handleSearch = async (query: string): Promise<AlgoliaSearchResult> => {
    setIsSearching(true)
    try {
      // Execute the search using the server action
      const results = await searchActiveListings(query, {
        hitsPerPage: 12
      })
      
      return results
    } catch (error) {
      console.error("Search error:", error)
      // Return empty results on error
      return {
        hits: [],
        nbHits: 0,
        page: 0,
        nbPages: 0,
        hitsPerPage: 12,
        processingTimeMS: 0,
        query
      }
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <ServiceSearch
      onSearch={handleSearch}
      className={className}
      placeholder="¿Qué servicio buscas?"
    />
  )
}
