"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { debugError } from "@/debug-utils"

interface ErrorBoundaryProps {
  fallback?: ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    debugError("ErrorBoundary", { error, errorInfo })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 m-4 border border-red-500 bg-red-50 rounded-md">
            <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h2>
            <details className="text-sm text-red-600">
              <summary>Error details</summary>
              <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto">{this.state.error?.toString()}</pre>
            </details>
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
