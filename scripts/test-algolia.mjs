// test-algolia.mjs
// This script tests the Algolia integration directly

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
const ALGOLIA_ADMIN_API_KEY = env.ALGOLIA_ADMIN_API_KEY;
const ALGOLIA_INDEX_NAME = env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'service_listings';

console.log('Testing Algolia integration with:');
console.log(`- App ID: ${ALGOLIA_APP_ID}`);
console.log(`- Index Name: ${ALGOLIA_INDEX_NAME}`);
console.log('- Admin Key: [hidden for security]');

async function testAlgolia() {
  try {
    console.log('\n1. Importing algoliasearch module...');
    const { algoliasearch } = await import('algoliasearch');
    
    console.log('2. Initializing Algolia client...');
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);
    
    console.log('3. Testing search functionality...');
    const searchResults = await client.search([
      {
        indexName: ALGOLIA_INDEX_NAME,
        params: {
          query: 'test',
          page: 0,
          hitsPerPage: 10,
          filters: "status:active"
        }
      }
    ]);
    
    console.log('Search results:', JSON.stringify(searchResults, null, 2));
    
    console.log('\n✅ Algolia integration test completed successfully!');
  } catch (error) {
    console.error('\n❌ Error testing Algolia integration:');
    console.error(error);
  }
}

// Run the test
testAlgolia();
