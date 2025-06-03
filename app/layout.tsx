import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import DebugApp from "./_debug-app"
import { debugLog } from "@/debug-utils"
import { AuthProvider } from "@/contexts/auth-context"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Directorio Local Mieres: Tu espacio para crecer",
  description: "La plataforma líder para publicar y encontrar anuncios de comercios, restaurantes y negocios locales en Mieres",  
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  debugLog("RootLayout rendering")

  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <DebugApp>{children}</DebugApp>
          <Toaster />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
