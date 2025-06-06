---
trigger: always_on
---

## ProjectSetup

- Continue using pnpm for package management as per project convention.
- Keep Next.js, TypeScript, and other key dependencies (Supabase, Tailwind CSS, shadcn/ui) updated to stable versions.
- Maintain the existing path alias `@/*` for cleaner and more consistent imports.

## Architecture

- Favor Server Components for data fetching and rendering to minimize client-side JavaScript. Use Client Components (`'use client'`) only when client-side interactivity (hooks, event listeners, browser APIs) is essential.
- Organize server-side logic (database interactions, business logic) within Server Components, Route Handlers (`app/api/...`), or dedicated Server Action files (e.g., `app/actions/...`).
- Place reusable UI components in the `components/` directory. Clearly distinguish between primitive UI elements (often from `shadcn/ui`) and composite/feature-specific components.
- Utilize `middleware.ts` for cross-cutting concerns like authentication checks and request/response modifications.
- Store utility functions in `lib/` and custom type definitions in `types/`.

## CodeStyleAndConventions

- Adhere to TypeScript best practices, including strong typing for all variables, function parameters, and return types. Maintain `strict: true` in `tsconfig.json`.
- Follow the default Next.js ESLint configuration for code style and linting. Strive to resolve all linting errors and warnings.
- Use `clsx` for conditionally applying CSS classes and `tailwind-merge` to resolve Tailwind CSS class conflicts, ensuring predictable styling.
- Adopt consistent naming conventions: `PascalCase` for React components and TypeScript types/interfaces, `camelCase` for functions and variables, and `kebab-case` for file and folder names.
- Write clear, concise, and JSDoc-style comments for complex logic, public APIs, and non-obvious code sections.
- Define explicit prop types for all React components using TypeScript interfaces or types.
- Prefer functional components with React Hooks over class components.

## SupabaseIntegration

- Use the Supabase client libraries (`@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`, `@supabase/ssr`) for all interactions with Supabase services (database, auth, storage).
- Implement Row Level Security (RLS) policies in Supabase to enforce data access control at the database level.
- Handle Supabase authentication flows securely, utilizing the helper functions for server-side and client-side auth state management.
- For server-side operations (Server Components, Route Handlers, Server Actions), use the appropriate server-side Supabase client initialization.
-Utilize AuthContext: When you need to access information about the currently logged-in user (e.g., their ID, email, or any other profile data), make use of your application's AuthContext. This provides a centralized and reactive way to obtain and use authentication data in your client components.

## Security

- Always validate user input on the server-side using Zod schemas, even if client-side validation is present, to prevent malicious data submission.
- Sanitize any user-generated content or HTML intended for rendering using libraries like `dompurify` or `isomorphic-dompurify` (already in dependencies) to prevent XSS attacks.
- Protect all sensitive API routes and Server Actions by robustly verifying user authentication and authorization using Supabase Auth.
- Never hardcode secrets in the codebase.
- Utilize parameterized queries or Supabase's query builders to prevent SQL injection vulnerabilities when interacting with the database.
- Regularly audit and update dependencies to patch known security vulnerabilities. Use `pnpm audit` to identify issues.

## Performance

- Optimize image delivery using `next/image`. 
- Leverage Next.js caching strategies (fetch memoization, Route Handler caching, `revalidatePath`, `revalidateTag`) to reduce data fetching overhead and improve response times.
- Use dynamic imports (`next/dynamic`) for components or libraries that are not critical for the initial page load to reduce bundle sizes and improve LCP.
- Memoize expensive computations in React components using `useMemo` and `useCallback` judiciously to prevent unnecessary re-renders.
- Optimize database queries by selecting only necessary columns, using appropriate filters, and ensuring relevant database indexes are in place.
- Minimize layout shifts by providing explicit dimensions for images, ads, and other asynchronously loaded content.

## MaintainabilityAndTesting

- Write modular and reusable code. Decompose complex components and functions into smaller, single-responsibility units.
- Strive to eliminate all TypeScript and ESLint build errors. 
- Implement unit tests (e.g., with Jest/React Testing Library) for critical utility functions, components, and business logic. Consider integration tests for user flows.
- Document significant architectural decisions, complex algorithms, and public API contracts within the codebase or a dedicated `docs/` folder.
- Proactively refactor code to improve clarity, reduce complexity, and address technical debt.
- Ensure consistent and robust error handling across the application. Log errors effectively for debugging and provide user-friendly feedback.
- Use environment variables for all configurations that vary between deployment environments (development, staging, production).

## UIAndUX

- Leverage shadcn/ui components for building the user interface, customizing them with Tailwind CSS as needed, following established project patterns.
- Ensure all UI components and user interactions are accessible (a11y compliant), using semantic HTML and ARIA attributes where necessary.
- Provide clear visual feedback for user actions, loading states, and errors using components like `Sonner` for toasts.

## AgentCollaboration

- When significant features, architectural changes, or new patterns are implemented, create a memory to document these for future reference and consistency.