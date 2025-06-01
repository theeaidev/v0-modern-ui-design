// sync-algolia.mjs
// This script syncs service listings from Supabase to Algolia

// Import environment variables from .env.local (if it exists) or use process.env
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables - check if .env.local exists first
let env = {};
const envPath = join(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  // Load from .env.local if it exists (local development)
  console.log('Loading environment variables from .env.local');
  env = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        acc[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
      return acc;
    }, {});
} else {
  // Use process.env directly (CI/CD environments like GitHub Actions)
  console.log('Loading environment variables from process.env');
  env = process.env;
}

// Configure Algolia with credentials
const ALGOLIA_APP_ID = env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_API_KEY = env.ALGOLIA_ADMIN_API_KEY;
const ALGOLIA_INDEX_NAME = env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'service_listings';

// Configure Supabase
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
const requiredVars = {
  ALGOLIA_APP_ID,
  ALGOLIA_ADMIN_API_KEY,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
};

const missingVars = Object.entries(requiredVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

console.log('Starting Algolia sync with:');
console.log(`- App ID: ${ALGOLIA_APP_ID}`);
console.log(`- Index Name: ${ALGOLIA_INDEX_NAME}`);
console.log('- Admin Key: [hidden for security]');

async function syncToAlgolia() {
  try {
    console.log('\n1. Importing required modules...');
    const { createClient } = await import('@supabase/supabase-js');
    const { algoliasearch } = await import('algoliasearch');
    
    console.log('2. Initializing Supabase client...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    console.log('3. Fetching active service listings from Supabase...');
    // Get service listings without joins - using actual table structure from schema
    const { data: listings, error } = await supabase
      .from('service_listings')
      .select(`
        id,
        user_id,
        title,
        slug,
        description,
        long_description,
        category_id,
        subcategory_id,
        price,
        price_type,
        location,
        city,
        postal_code,
        country,
        address,
        is_featured,
        is_verified,
        status,
        views,
        created_at,
        updated_at
      `)
      .eq('status', 'active');
    
    if (error) {
      throw new Error(`Error fetching service listings: ${error.message}`);
    }
    
    if (!listings || listings.length === 0) {
      console.log('No active service listings found.');
      return;
    }
    
    // Fetch profile information separately for each listing
    console.log('4. Fetching profile information for listings...');
    
    // Get unique user IDs
    const userIds = [...new Set(listings.map(listing => listing.user_id))];
    
    // Fetch profiles in a single query - select all fields to avoid column missing errors
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
      
    if (profilesError) {
      console.warn(`Warning: Error fetching profiles: ${profilesError.message}`);
      // Continue without profile data
    }
    
    // Create a map of profiles by ID for easy lookup
    const profilesMap = {};
    if (profiles) {
      profiles.forEach(profile => {
        profilesMap[profile.id] = profile;
      });
    }
    
    // Fetch category information
    console.log('5. Fetching category information for listings...');
    
    // Get unique category IDs
    const categoryIds = [...new Set(listings.map(listing => listing.category_id).filter(id => id))];
    
    // Fetch categories in a single query
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .in('id', categoryIds);
      
    if (categoriesError) {
      console.warn(`Warning: Error fetching categories: ${categoriesError.message}`);
      // Continue without category data
    }
    
    // Create a map of categories by ID for easy lookup
    const categoriesMap = {};
    if (categories) {
      categories.forEach(category => {
        categoriesMap[category.id] = category;
      });
    }
    
    // Fetch subcategory information
    console.log('6. Fetching subcategory information for listings...');
    
    // Get unique subcategory IDs, filtering out null values
    const subcategoryIds = [...new Set(listings.map(listing => listing.subcategory_id).filter(id => id))];
    
    // Only fetch subcategories if there are any subcategory IDs
    let subcategoriesMap = {};
    if (subcategoryIds.length > 0) {
      // Fetch subcategories in a single query
      const { data: subcategories, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('id, name, slug, category_id')
        .in('id', subcategoryIds);
        
      if (subcategoriesError) {
        console.warn(`Warning: Error fetching subcategories: ${subcategoriesError.message}`);
        // Continue without subcategory data
      } else if (subcategories) {
        // Create a map of subcategories by ID for easy lookup
        subcategories.forEach(subcategory => {
          subcategoriesMap[subcategory.id] = subcategory;
        });
      }
    }
    
    console.log(`Found ${listings.length} active service listings.`);
    
    // Prepare records for Algolia using the profile, category, and subcategory information from our maps
    const records = listings.map(listing => {
      // Get the profile for this listing if available
      const profile = profilesMap[listing.user_id] || {};
      // Get the category for this listing if available
      const category = categoriesMap[listing.category_id] || {};
      // Get the subcategory for this listing if available
      const subcategory = listing.subcategory_id ? (subcategoriesMap[listing.subcategory_id] || {}) : {};
      
      return {
        objectID: listing.id,
        id: listing.id,
        user_id: listing.user_id,
        title: listing.title,
        slug: listing.slug,
        description: listing.description,
        long_description: listing.long_description,
        price: listing.price,
        price_type: listing.price_type,
        location: listing.location,
        city: listing.city,
        postal_code: listing.postal_code,
        country: listing.country,
        address: listing.address,
        is_featured: listing.is_featured,
        is_verified: listing.is_verified,
        status: listing.status,
        views: listing.views,
        created_at: listing.created_at,
        updated_at: listing.updated_at,
        
        // Include foreign key IDs
        category_id: listing.category_id,
        subcategory_id: listing.subcategory_id,
        
        // Include profile data if available
        profile_username: profile.username || null,
        profile_full_name: profile.full_name || null,
        profile_avatar_url: profile.avatar_url || null,
        
        // Include category data if available
        category_name: category.name || null,
        category_slug: category.slug || null,
        
        // Include subcategory data if available
        subcategory_name: subcategory.name || null,
        subcategory_slug: subcategory.slug || null,
        
        // Add searchable fields for Algolia
        _tags: [
          listing.status,
          listing.city,
          category.name,
          subcategory.name,
          listing.price_type
        ].filter(Boolean) // Filter out null/undefined values
      };
    });
    
    console.log('7. Initializing Algolia client...');
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);
    
    console.log('8. Uploading records to Algolia...');
    const result = await client.saveObjects({
      indexName: ALGOLIA_INDEX_NAME,
      objects: records
    });
    
    console.log(`✅ Successfully synced ${records.length} records to Algolia.`);
    console.log('Sync completed successfully.');
    
    return { success: true, count: records.length };
  } catch (error) {
    console.error('\n❌ Error syncing to Algolia:');
    console.error(error);
    return { success: false, error: error.message };
  }
}

// Run the sync
syncToAlgolia();