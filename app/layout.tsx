import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import DebugApp from "./_debug-app"
import { debugLog } from "@/debug-utils"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Directorio Latinos: Un espacio para todos, con sabor latino",
  description: "La plataforma líder para publicar y encontrar anuncios de servicios profesionales latinos",
    generator: 'v0.dev'
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
        </AuthProvider>
      </body>
    </html>
  )
}
