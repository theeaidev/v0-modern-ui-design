// configure-algolia-index.mjs
// This script configures optimal settings for your Algolia index

// Import environment variables from .env.local
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '..', '.env.local');
const env = fs.readFileSync(envPath, 'utf8')
  .split('\n')
  .filter(line => line && !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      acc[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
    return acc;
  }, {});

// Configure Algolia with credentials from .env.local
const ALGOLIA_APP_ID = env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_API_KEY = env.ALGOLIA_ADMIN_API_KEY; // Using admin key for index configuration
const ALGOLIA_INDEX_NAME = env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'service_listings';

console.log('Configuring Algolia index settings:');
console.log(`- App ID: ${ALGOLIA_APP_ID}`);
console.log(`- Index Name: ${ALGOLIA_INDEX_NAME}`);
console.log('- Admin Key: [hidden for security]');

async function configureAlgoliaIndex() {
  try {
    console.log('\n1. Importing algoliasearch module...');
    const { algoliasearch } = await import('algoliasearch');
    
    console.log('2. Initializing Algolia client...');
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);
    
    console.log('3. Configuring searchable attributes...');
    // The order of attributes defines their importance in the search
    
    // For newer versions of the Algolia API, we use the following pattern:
    const settings = {
      // Define which attributes can be searched
      searchableAttributes: [
        'title',                 // Most important for search
        'description',           // Important for search
        'long_description',      // Less important but still searchable
        'city',                  // Location search
        'category_name',         // Category search
        'subcategory_name',      // Subcategory search
        'location',              // General location
        'profile_full_name'      // Provider name
      ],
      
      // Define attributes that can be used for filtering/faceting
      attributesForFaceting: [
        'searchable(category_name)',
        'searchable(subcategory_name)',
        'searchable(city)',
        'searchable(price_type)',
        'status',
        'is_featured',
        'is_verified'
      ],
      
      // Custom ranking factors to sort results
      customRanking: [
        'desc(is_featured)',     // Featured listings first
        'desc(is_verified)',     // Verified listings next
        'desc(views)',           // Popular listings next
        'desc(created_at)'       // Newer listings next
      ],
      
      // Typo tolerance settings
      typoTolerance: true,
      minWordSizefor1Typo: 4,
      minWordSizefor2Typos: 8,
      
      // Other settings
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
      snippetEllipsisText: '...',
      attributesToHighlight: ['title', 'description'],
      attributesToSnippet: ['description:50']
    };
    
    // Apply the settings to the index
    // First get the index reference
    console.log(`Creating index reference for ${ALGOLIA_INDEX_NAME}...`);
    
    // Using the search method to ensure the index exists
    await client.search([
      {
        indexName: ALGOLIA_INDEX_NAME,
        query: '',
        params: { hitsPerPage: 1 }
      }
    ]);
    
    // Then use the settings API
    console.log('Applying settings...');
    const response = await client.initIndex(ALGOLIA_INDEX_NAME).setSettings(settings);
    
    console.log('\n✅ Algolia index configured successfully with optimal settings!');
    console.log('Your search experience should now be greatly improved.');
    console.log('\nSettings configured:');
    console.log('- Searchable attributes prioritized correctly');
    console.log('- Faceting attributes set up for filtering');
    console.log('- Custom ranking to show the most relevant listings first');
    console.log('- Highlighting and snippet settings optimized');
    
    return { success: true };
  } catch (error) {
    console.error('\n❌ Error configuring Algolia index:');
    console.error(error);
    return { success: false, error: error.message };
  }
}

// Run the configuration
configureAlgoliaIndex();
