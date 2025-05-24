// list-algolia-objects.mjs
// This script lists all objects in the Algolia index without filtering

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
const ALGOLIA_ADMIN_API_KEY = env.ALGOLIA_ADMIN_API_KEY; // Using admin key to browse all objects
const ALGOLIA_INDEX_NAME = env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'service_listings';

console.log('Listing all objects in Algolia index:');
console.log(`- App ID: ${ALGOLIA_APP_ID}`);
console.log(`- Index Name: ${ALGOLIA_INDEX_NAME}`);
console.log('- Admin Key: [hidden for security]');

async function listAllObjects() {
  try {
    console.log('\n1. Importing algoliasearch module...');
    const { algoliasearch } = await import('algoliasearch');
    
    console.log('2. Initializing Algolia client...');
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);
    
    console.log('3. Browsing all objects in the index...');
    // Use the search method to list all objects without a query
    const { results } = await client.search([
      {
        indexName: ALGOLIA_INDEX_NAME,
        query: '',
        params: {
          hitsPerPage: 100,
          filters: "" // Empty filter to get all objects
        }
      }
    ]);
    
    const searchResults = results[0];
    
    console.log(`\nFound ${searchResults.nbHits} objects in the index:`);
    
    if (searchResults.hits.length > 0) {
      searchResults.hits.forEach((hit, index) => {
        console.log(`\n--- Object ${index + 1} ---`);
        console.log(`Object ID: ${hit.objectID}`);
        console.log(`Title: ${hit.title || 'N/A'}`);
        console.log(`Status: ${hit.status || 'N/A'}`);
        console.log(`Description: ${hit.description ? hit.description.substring(0, 50) + '...' : 'N/A'}`);
        console.log(`Category: ${hit.category_name || 'N/A'}`);
        console.log(`Location: ${hit.city || hit.location || 'N/A'}`);
      });
      
      console.log('\n4. Configure optimal index settings');
      console.log('To optimize your Algolia search, you should configure:');
      console.log('- Searchable attributes: title, description, city, category_name');
      console.log('- Faceting attributes: category_name, city, price_type, status');
      console.log('- Custom ranking: is_featured, is_verified, views, created_at');
      console.log('This can be done via the Algolia dashboard or using the setSettings API.');
    } else {
      console.log('No objects found in the index. Please run sync-algolia.mjs first.');
    }
    
    console.log('\n✅ Listing operation completed successfully!');
  } catch (error) {
    console.error('\n❌ Error listing Algolia objects:');
    console.error(error);
  }
}

// Run the operation
listAllObjects();
