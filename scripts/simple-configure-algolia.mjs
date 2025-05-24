// simple-configure-algolia.mjs
// A simplified script to configure Algolia index settings

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

console.log('Configuring Algolia index settings:');
console.log(`- App ID: ${ALGOLIA_APP_ID}`);
console.log(`- Index Name: ${ALGOLIA_INDEX_NAME}`);

async function configureIndex() {
  try {
    // Import using ESM pattern
    const { algoliasearch } = await import('algoliasearch');
    
    // Initialize client with app ID and API key
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);
    
    // Prepare settings
    const settings = {
      // Define which attributes can be searched
      searchableAttributes: [
        'title',
        'description',
        'long_description',
        'city',
        'category_name',
        'subcategory_name',
        'location'
      ],
      
      // Define attributes that can be used for filtering/faceting
      attributesForFaceting: [
        'category_name',
        'subcategory_name',
        'city',
        'price_type',
        'status',
        'is_featured',
        'is_verified'
      ],
      
      // Custom ranking factors to sort results
      customRanking: [
        'desc(is_featured)',
        'desc(is_verified)',
        'desc(views)',
        'desc(created_at)'
      ]
    };
    
    // Apply settings using the new pattern
    const { results } = await client.search([
      {
        indexName: ALGOLIA_INDEX_NAME,
        query: '',
        params: { hitsPerPage: 1 }
      }
    ]);
    
    console.log(`Index exists with ${results[0].nbHits} records`);
    
    // Update settings through the REST API directly
    const url = `https://${ALGOLIA_APP_ID}.algolia.net/1/indexes/${ALGOLIA_INDEX_NAME}/settings`;
    
    console.log('Sending settings update request...');
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Algolia-API-Key': ALGOLIA_ADMIN_API_KEY,
        'X-Algolia-Application-Id': ALGOLIA_APP_ID
      },
      body: JSON.stringify(settings)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Settings updated successfully!');
      console.log(`Task ID: ${result.taskID}`);
      
      console.log('\nYour Algolia index has been configured with optimal settings:');
      console.log('- Searchable attributes: title, description, city, etc.');
      console.log('- Faceting attributes: category, city, price_type, status, etc.');
      console.log('- Custom ranking: featured, verified, views, created_at');
    } else {
      console.error('❌ Error updating settings:', result);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

configureIndex();
