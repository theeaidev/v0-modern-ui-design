"use client"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { HomeClient } from "@/components/home-client"
import ErrorBoundary from "@/components/error-boundary"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <ErrorBoundary fallback={<div className="p-4">Error in MainNav component</div>}>
        <MainNav />
      </ErrorBoundary>

      <HomeClient />

      <ErrorBoundary fallback={<div className="p-4">Error in Footer component</div>}>
        <SiteFooter />
      </ErrorBoundary>
    </div>
  )
}
