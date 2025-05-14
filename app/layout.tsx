import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

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
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
