"use client"

import type React from "react"

import { useEffect } from "react"
import { debugLog, logEnvironmentInfo } from "@/debug-utils"

export default function DebugApp({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    debugLog("App mounted")
    logEnvironmentInfo()

    // Log any unhandled errors
    const originalOnError = window.onerror
    window.onerror = (message, source, lineno, colno, error) => {
      debugLog("Unhandled error", { message, source, lineno, colno, error })
      return originalOnError ? originalOnError.call(window, message, source, lineno, colno, error) : false
    }

    // Log any unhandled promise rejections
    const originalOnUnhandledRejection = window.onunhandledrejection
    window.onunhandledrejection = (event) => {
      debugLog("Unhandled promise rejection", event.reason)
      return originalOnUnhandledRejection ? originalOnUnhandledRejection.call(window, event) : false
    }

    return () => {
      window.onerror = originalOnError
      window.onunhandledrejection = originalOnUnhandledRejection
    }
  }, [])

  return <>{children}</>
}
