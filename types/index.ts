/**
 * Common type definitions for the application
 */

/**
 * Type for Next.js search/query parameters in App Router
 * This matches the Next.js expectation for page components
 */
export interface SearchParams {
  [key: string]: string | string[] | undefined
}

/**
 * Type for Next.js page props in App Router
 */
export interface PageProps {
  params: { [key: string]: string }
  searchParams: SearchParams
}
