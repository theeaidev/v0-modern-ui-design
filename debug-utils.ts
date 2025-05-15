// Utility functions for debugging
export const debugLog = (location: string, data?: any) => {
  console.log(`[DEBUG][${location}]`, data !== undefined ? data : "")
}

export const debugError = (location: string, error: any) => {
  console.error(`[ERROR][${location}]`, error)

  // Extract more information from the error
  if (error instanceof Error) {
    console.error(`[ERROR][${location}][Message]`, error.message)
    console.error(`[ERROR][${location}][Stack]`, error.stack)
  }

  return error
}

// Helper to check if we're on client or server
export const isClient = typeof window !== "undefined"
export const isServer = !isClient

// Add a new utility function to safely get window location
export const getSafeWindowLocation = () => {
  if (typeof window === "undefined") {
    return {
      origin: "https://example.com", // Fallback for SSR
      pathname: "/",
      search: "",
      hash: "",
    }
  }
  return window.location
}

// Log environment information
export const logEnvironmentInfo = () => {
  debugLog("Environment", {
    isClient,
    isServer,
    nodeEnv: process.env.NODE_ENV,
    nextPublicVars: Object.keys(process.env)
      .filter((key) => key.startsWith("NEXT_PUBLIC_"))
      .reduce(
        (acc, key) => {
          acc[key] = process.env[key]
          return acc
        },
        {} as Record<string, string | undefined>,
      ),
  })
}
