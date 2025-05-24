// Direct script to sync service listings to Algolia
// Based on the official Algolia example
const { createClient } = require('@supabase/supabase-js');
const algoliasearch = require('algoliasearch');

// Get environment variables
require('dotenv').config({ path: './.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_API_KEY = process.env.ALGOLIA_ADMIN_API_KEY;
const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'service_listings';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Initialize Algolia client (using the approach from the example)
const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);
const index = algoliaClient.initIndex(ALGOLIA_INDEX_NAME);

async function syncServiceListingsToAlgolia() {
  console.log('Starting Algolia sync...');
  
  try {
    // Get active service listings from Supabase
    console.log('Fetching active service listings from Supabase...');
    const { data: listings, error } = await supabase
      .from('service_listings')
      .select(`
        id,
        title,
        description,
        created_at,
        updated_at,
        price,
        location,
        category,
        subcategory,
        status,
        profile_id,
        profiles (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('status', 'active');
    
    if (error) {
      throw new Error(`Error fetching service listings: ${error.message}`);
    }
    
    if (!listings || listings.length === 0) {
      console.log('No active service listings found.');
      return;
    }
    
    console.log(`Found ${listings.length} active service listings.`);
    
    // Prepare records for Algolia
    const records = listings.map(listing => ({
      objectID: listing.id,
      id: listing.id,
      title: listing.title,
      description: listing.description,
      created_at: listing.created_at,
      updated_at: listing.updated_at,
      price: listing.price,
      location: listing.location,
      category: listing.category,
      subcategory: listing.subcategory,
      status: listing.status,
      profile_id: listing.profile_id,
      // Include profile data if available
      profile_username: listing.profiles?.username || null,
      profile_full_name: listing.profiles?.full_name || null,
      profile_avatar_url: listing.profiles?.avatar_url || null
    }));
    
    // Upload records to Algolia
    console.log('Uploading records to Algolia...');
    const result = await index.saveObjects(records);
    
    console.log(`Successfully synced ${result.objectIDs.length} records to Algolia.`);
    console.log('Sync completed successfully.');
    
    return { success: true, message: `Synced ${result.objectIDs.length} service listings to Algolia.` };
  } catch (error) {
    console.error('Error syncing to Algolia:', error);
    return { success: false, error: error.message };
  }
}

// Execute the sync
syncServiceListingsToAlgolia()
  .then((result) => {
    if (result.success) {
      console.log(result.message);
      process.exit(0);
    } else {
      console.error(result.error);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
