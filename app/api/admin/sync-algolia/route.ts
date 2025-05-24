import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
// Use dynamic import in the route handler, not at the top level

// Simple admin secret for demo purposes
// In production, use a proper authentication mechanism
const ADMIN_SECRET = process.env.ADMIN_SECRET || "8e36025499a0e0ab15cb3192f781e985";

export async function POST(request: NextRequest) {
  try {
    // Check for admin secret in the request
    const authHeader = request.headers.get("authorization");
    const providedSecret = authHeader?.replace("Bearer ", "");
    
    if (!providedSecret || providedSecret !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
    const ALGOLIA_ADMIN_API_KEY = process.env.ALGOLIA_ADMIN_API_KEY || '';
    const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'service_listings';
    
    if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_API_KEY) {
      return NextResponse.json(
        { error: "Algolia credentials not configured" },
        { status: 500 }
      );
    }
    
    // Import algoliasearch using the exact pattern from the Algolia documentation
    // "If you are using a Node version below 22.10.0, you must either specify type: "module" in package.json or use .mjs"
    const { algoliasearch } = await import('algoliasearch');
    
    // Initialize with credentials - exactly as in the official example
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);
    
    // Get active service listings from Supabase
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
      return NextResponse.json({ 
        success: true, 
        message: "No listings to sync" 
      });
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
    
    // Upload records to Algolia - using the exact pattern from the official example
    const result = await client.saveObjects({
      indexName: ALGOLIA_INDEX_NAME,
      objects: records
    });
    
    console.log('Algolia sync completed successfully');
    
    return NextResponse.json({
      success: true,
      message: `Synced ${records.length} service listings to Algolia.`,
      count: records.length
    });
  } catch (error) {
    console.error("Error in sync-algolia API route:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to sync listings to Algolia",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// GET endpoint redirects to POST for consistency
export async function GET(request: NextRequest) {
  return POST(request);
}
