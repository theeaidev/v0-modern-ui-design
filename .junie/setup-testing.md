# Testing Setup Instructions

To set up testing for this Next.js project, follow these steps:

1. Install Jest, React Testing Library, and related dependencies:

```bash
pnpm add -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest
```

2. Create a Jest configuration file (jest.config.mjs) at the root of the project:

```javascript
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.mjs and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest',
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
```

3. Create a Jest setup file (jest.setup.js) at the root of the project:

```javascript
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
```

4. Update package.json with test scripts:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "sync-algolia": "node scripts/sync-algolia.mjs",
  "test": "jest",
  "test:watch": "jest --watch"
}
```

5. Create a __tests__ directory at the root of the project to store your tests:

```bash
mkdir __tests__
```