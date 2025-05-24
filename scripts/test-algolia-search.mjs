// test-algolia-search.mjs
// This script tests the Algolia search functionality

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
const ALGOLIA_SEARCH_API_KEY = env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
const ALGOLIA_INDEX_NAME = env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'service_listings';

console.log('Testing Algolia search with:');
console.log(`- App ID: ${ALGOLIA_APP_ID}`);
console.log(`- Index Name: ${ALGOLIA_INDEX_NAME}`);
console.log('- Search Key: [hidden for security]');

async function testAlgoliaSearch(searchQuery = '') {
  try {
    console.log(`\n1. Importing algoliasearch module...`);
    const { algoliasearch } = await import('algoliasearch');
    
    console.log('2. Initializing Algolia client with search API key...');
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);
    
    console.log(`3. Searching for "${searchQuery || '<empty query>'}"...`);
    // Use the newer API pattern: directly calling search on the client
    const { results } = await client.search([
      {
        indexName: ALGOLIA_INDEX_NAME,
        query: searchQuery,
        params: {
          hitsPerPage: 10,
          filters: "status:active"
        }
      }
    ]);
    
    // Extract the first (and only) result from the array
    const searchResult = results[0];
    
    console.log(`Found ${searchResult.nbHits} results in ${searchResult.processingTimeMS}ms`);
    
    if (searchResult.hits.length > 0) {
      console.log('\nFirst few results:');
      searchResult.hits.slice(0, 3).forEach((hit, index) => {
        console.log(`\n--- Result ${index + 1} ---`);
        console.log(`Title: ${hit.title}`);
        console.log(`Description: ${hit.description?.substring(0, 100)}...`);
        console.log(`Location: ${hit.city || hit.location || 'N/A'}`);
        console.log(`Category: ${hit.category_name || 'N/A'}`);
        console.log(`Price: ${hit.price || 'N/A'}`);
      });
    }
    
    console.log('\n✅ Algolia search test completed successfully!');
  } catch (error) {
    console.error('\n❌ Error testing Algolia search:');
    console.error(error);
  }
}

// Get the search query from command line arguments
const searchQuery = process.argv[2] || '';

// Run the test
testAlgoliaSearch(searchQuery);
