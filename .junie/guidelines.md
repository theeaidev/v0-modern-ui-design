# Project Development Guidelines

This document provides essential information for developers working on this Next.js project. It includes build/configuration instructions, testing information, and additional development details.

## Build/Configuration Instructions

### Prerequisites

- Node.js (v18 or later recommended)
- pnpm package manager

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   - Copy `.env.local` to create your own local environment file
   - Update the variables as needed for your development environment

### Development

Run the development server:

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

Build the application:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

### Algolia Integration

The project uses Algolia for search functionality. To sync data with Algolia:

```bash
pnpm sync-algolia
```

## Testing Information

### Setting Up Tests

The project uses Jest and React Testing Library for testing. If not already set up, follow these steps:

1. Install testing dependencies:
   ```bash
   pnpm add -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest next/jest ts-jest
   ```

2. Create Jest configuration file (`jest.config.mjs`) at the root:
   ```javascript
   import nextJest from 'next/jest.js'

   const createJestConfig = nextJest({
     dir: './',
   })

   /** @type {import('jest').Config} */
   const config = {
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
     testEnvironment: 'jest-environment-jsdom',
     preset: 'ts-jest',
     testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
   }

   export default createJestConfig(config)
   ```

3. Create Jest setup file (`jest.setup.js`):
   ```javascript
   import '@testing-library/jest-dom'
   ```

4. Update `package.json` with test scripts:
   ```json
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watch"
   }
   ```

### Running Tests

Run all tests:

```bash
pnpm test
```

Run tests in watch mode (for development):

```bash
pnpm test:watch
```

### Writing Tests

Tests should be placed in the `__tests__` directory or alongside the components they test with a `.test.tsx` or `.spec.tsx` extension.

Example test for a component:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import YourComponent from './YourComponent'

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />)
    // Add assertions here
  })

  it('handles user interaction', async () => {
    render(<YourComponent />)
    // Simulate user interaction and add assertions
  })
})
```

### Testing Best Practices

1. Test component behavior, not implementation details
2. Use data-testid attributes for test-specific element selection
3. Test user interactions using `userEvent` from `@testing-library/user-event`
4. Mock external dependencies and API calls

## Additional Development Information

### Project Structure

- `app/` - Next.js app router pages and layouts
- `components/` - Reusable UI components
- `contexts/` - React context providers
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and shared logic
- `public/` - Static assets
- `styles/` - Global styles and theme configuration

### Code Style

The project uses ESLint for code linting. Run linting with:

```bash
pnpm lint
```

### UI Components

The project uses a combination of custom components and Radix UI primitives for accessible UI components. When creating new UI components:

1. Follow the existing component structure
2. Ensure components are accessible
3. Use Tailwind CSS for styling
4. Consider creating variants using `class-variance-authority`

### Authentication

The project uses Supabase for authentication. Authentication logic is handled through the auth helpers and middleware.

### Deployment

The project is deployed on Vercel and is automatically synced with v0.dev deployments. Any changes made to the deployed app on v0.dev will be automatically pushed to the repository.

### Troubleshooting

If you encounter issues with the development server:

1. Clear the Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `pnpm install`
3. Restart the development server: `pnpm dev`