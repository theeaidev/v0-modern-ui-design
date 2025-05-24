"use server"

import { createServerClient } from "@/lib/supabase-server";
import { ServiceListing } from '@/types/service';

// Import algoliasearch (will be dynamically imported in the functions)
// Using ESM imports as required by Algolia docs for Node versions below 22.10.0

// Initialize the Algolia client with server-side credentials
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const ALGOLIA_ADMIN_API_KEY = process.env.ALGOLIA_ADMIN_API_KEY || '';
const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'service_listings';

// Define the return type for the search function
export type AlgoliaSearchResult = {
  hits: Array<any>;
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  processingTimeMS: number;
  query: string;
  provider?: 'algolia' | 'supabase'; // Added to track which provider was used
};

/**
 * Helper function to safely import and initialize Algolia
 * We're using ESM imports as required by Algolia docs for Node versions below 22.10.0
 * We've set "type": "module" in package.json as per Algolia docs
 */
async function getAlgoliaClient() {
  try {
    // Import algoliasearch using the exact pattern from the Algolia documentation
    // "If you are using a Node version below 22.10.0, you must either specify type: "module" in package.json or use .mjs"
    const { algoliasearch } = await import('algoliasearch');
    
    // Initialize with credentials - exactly as in the official example
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);
    
    return client;
  } catch (error) {
    console.error('Failed to initialize Algolia:', error);
    throw error;
  }
}

/**
 * Server action to search for active service listings
 * PRIORITY: Always try Algolia first, only fallback to Supabase if Algolia fails
 */
export async function searchActiveListings(query: string, options: {
  page?: number;
  hitsPerPage?: number;
} = {}): Promise<AlgoliaSearchResult> {
  const { page = 0, hitsPerPage = 12 } = options;
  
  // Always try Algolia first
  try {
    console.log('🔍 Searching with Algolia:', query);
    
    // Check if Algolia is configured
    if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_API_KEY) {
      console.warn('⚠️ Algolia credentials not configured, falling back to Supabase');
      return await fallbackToSupabase(query, options);
    }
    
    // Initialize Algolia client using our new helper function
    const client = await getAlgoliaClient();
    
    if (!client) {
      console.error('❌ Failed to initialize Algolia client');
      return await fallbackToSupabase(query, options);
    }
    
    // Use the search method directly on the client
    // This follows the official example from Algolia
    const searchResults = await client.search([
      {
        indexName: ALGOLIA_INDEX_NAME,
        params: {
          query,
          page,
          hitsPerPage,
          filters: "status:active"
        }
      }
    ]);
    
    // Extract the first result from the results array and use type assertion
    const result = searchResults.results[0] as any;
    
    // Make sure we have a valid result
    if (!result) {
      console.error('No results returned from Algolia search');
      return await fallbackToSupabase(query, options);
    }
    
    console.log(`✅ Algolia search successful: ${result.nbHits || 0} results found in ${result.processingTimeMS || 0}ms`);
    
    return {
      hits: result.hits || [],
      nbHits: result.nbHits || 0,
      page: result.page || 0,
      nbPages: result.nbPages || 0,
      hitsPerPage: result.hitsPerPage || 12,
      processingTimeMS: result.processingTimeMS || 0,
      query,
      provider: 'algolia' as 'algolia' // Add provider info for debugging with explicit type
    };
  } catch (error) {
    console.error('❌ Error searching with Algolia:', error);
    console.log('⚠️ Falling back to Supabase search...');
    return await fallbackToSupabase(query, options);
  }
}

/**
 * Fallback to Supabase search when Algolia is unavailable
 */
async function fallbackToSupabase(query: string, options: {
  page?: number;
  hitsPerPage?: number;
} = {}) {
  const { page = 0, hitsPerPage = 12 } = options;
  
  try {
    const supabase = await createServerClient();
    
    // Create a base query for service listings
    let supabaseQuery = supabase
      .from("service_listings")
      .select(`
        *,
        images:service_images(*),
        category:categories(*)
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
    
    console.log(`✅ Supabase fallback search successful: ${count || 0} results found`);
    
    // Format the result to match Algolia's format
    return {
      hits: data.map(item => ({ ...item, objectID: item.id })),
      nbHits: count || 0,
      page,
      nbPages: count ? Math.ceil(count / hitsPerPage) : 0,
      hitsPerPage,
      processingTimeMS: 0,
      query,
      provider: 'supabase' as 'supabase' // Add provider info for debugging with explicit type
    };
  } catch (error) {
    console.error("Error in Supabase fallback search:", error);
    
    // Return empty result on error
    return {
      hits: [],
      nbHits: 0,
      page: 0,
      nbPages: 0,
      hitsPerPage,
      processingTimeMS: 0,
      query
    };
  }
}

/**
 * Server action to sync service listings to Algolia
 * This should be triggered from an admin page or a cron job
 */
export async function syncListingsToAlgolia() {
  try {
    if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_API_KEY) {
      throw new Error("Algolia credentials not configured");
    }
    
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from("service_listings")
      .select(`
        *,
        images:service_images(*),
        category:categories(id, name)
      `)
      .eq("status", "active");
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      return { success: true, message: "No listings to sync" };
    }
    
    // Format the data for Algolia
    const records = data.map(listing => ({
      ...listing,
      objectID: listing.id,
      _tags: [
        `category:${listing.category?.name || ''}`,
        `city:${listing.city || ''}`,
        `status:${listing.status}`,
        listing.is_featured ? 'featured' : '',
        listing.is_verified ? 'verified' : ''
      ].filter(Boolean)
    }));
    
    // Initialize Algolia client using our new helper function
    const client = await getAlgoliaClient();
    
    if (!client) {
      throw new Error('Failed to initialize Algolia client');
    }
    
    // Use the saveObjects method directly on the client
    await client.saveObjects({
      indexName: ALGOLIA_INDEX_NAME,
      objects: records
    });
    
    return { 
      success: true, 
      message: `Synced ${records.length} listings to Algolia` 
    };
  } catch (error) {
    console.error("Error syncing to Algolia:", error);
    return { 
      success: false, 
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}
