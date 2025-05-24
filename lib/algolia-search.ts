import { createServerClient } from "@/lib/supabase-server";
import { ServiceListing } from '@/types/service';

// Initialize the Algolia client
// Note: In a real application, these would be stored in environment variables
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'your_algolia_app_id';
const ALGOLIA_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || 'your_algolia_search_api_key';
const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'service_listings';

// Create a function to get the Algolia client to avoid initialization errors
async function getAlgoliaClient() {
  try {
    // Use the same import pattern as the official example
    const { algoliasearch } = await import('algoliasearch');
    return algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
  } catch (error) {
    console.error('Failed to initialize Algolia client:', error);
    throw error;
  }
}

// Create a function to get the index
async function getAlgoliaIndex() {
  try {
    const client = await getAlgoliaClient();
    // Use type assertion to avoid TypeScript errors
    return (client as any).initIndex(ALGOLIA_INDEX_NAME);
  } catch (error) {
    console.error('Failed to get Algolia index:', error);
    throw error;
  }
}

export type AlgoliaSearchResult = {
  hits: Array<ServiceListing & { objectID: string }>;
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  processingTimeMS: number;
  query: string;
};

/**
 * Search for service listings using Algolia as primary method
 * Falls back to Supabase if Algolia fails
 */
export async function searchServiceListings(query: string, options: {
  page?: number;
  hitsPerPage?: number;
  filters?: string;
} = {}): Promise<AlgoliaSearchResult> {
  try {
    const { page = 0, hitsPerPage = 12, filters = "status:active" } = options;
    
    console.log('Searching with Algolia:', query);
    // Get the index and await it (it's now an async function)
    const index = await getAlgoliaIndex();
    const result = await index.search(query, {
      page,
      hitsPerPage,
      filters
    });
    
    console.log('Algolia search successful:', result.nbHits, 'results found');
    return result as AlgoliaSearchResult;
  } catch (error) {
    console.error("Error searching with Algolia - falling back to Supabase:", error);
    
    // Fallback to Supabase if Algolia fails or is not configured
    return fallbackToSupabase(query, options);
  }
}

/**
 * Fallback to Supabase search if Algolia is not available
 */
async function fallbackToSupabase(query: string, options: {
  page?: number;
  hitsPerPage?: number;
  filters?: string;
} = {}): Promise<AlgoliaSearchResult> {
  try {
    const { page = 0, hitsPerPage = 12 } = options;
    const supabase = await createServerClient();
    
    // Create a base query for service listings
    let supabaseQuery = supabase
      .from("service_listings")
      .select(`
        *,
        images:service_images(*),
        category:categories(*),
        subcategory:subcategories(*)
      `, { count: 'exact' })
      .eq("status", "active");
    
    // Add search functionality if query exists
    if (query) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }
    
    // Apply pagination
    const offset = page * hitsPerPage;
    supabaseQuery = supabaseQuery.range(offset, offset + hitsPerPage - 1);
    
    // Execute the query
    const { data, error, count } = await supabaseQuery;
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Format the result to match Algolia's format
    return {
      hits: data.map(item => ({ ...item, objectID: item.id })),
      nbHits: count || 0,
      page,
      nbPages: count ? Math.ceil(count / hitsPerPage) : 0,
      hitsPerPage,
      processingTimeMS: 0,
      query
    };
  } catch (error) {
    console.error("Error in Supabase fallback search:", error);
    
    // Return empty result on error
    return {
      hits: [],
      nbHits: 0,
      page: 0,
      nbPages: 0,
      hitsPerPage: options.hitsPerPage || 12,
      processingTimeMS: 0,
      query
    };
  }
}

/**
 * Helper function to sync Supabase service listings to Algolia
 * This would typically be called from an admin panel or scheduled job
 */
export async function syncServiceListingsToAlgolia(): Promise<void> {
  try {
    const supabase = await createServerClient();
    
    // Get all active service listings
    const { data, error } = await supabase
      .from("service_listings")
      .select(`
        *,
        images:service_images(*),
        category:categories(id, name),
        subcategory:subcategories(id, name)
      `)
      .eq("status", "active");
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      console.log("No listings to sync to Algolia");
      return;
    }
    
    // Format the data for Algolia
    const records = data.map(listing => ({
      ...listing,
      objectID: listing.id,
      _tags: [
        `category:${listing.category?.name || ''}`,
        `city:${listing.city || ''}`,
        `status:${listing.status}`
      ]
    }));
    
    // Send to Algolia - await the async getAlgoliaIndex function
    const index = await getAlgoliaIndex();
    await index.saveObjects(records);
    console.log(`Synced ${records.length} listings to Algolia`);
  } catch (error) {
    console.error("Error syncing to Algolia:", error);
    throw error;
  }
}
