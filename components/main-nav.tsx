"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { PlusCircle, Briefcase } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"

export function MainNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Directorio Latinos Logo" width={40} height={40} className="rounded-sm" />
          <span className="text-xl font-bold">Directorio Latinos</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/" className={`text-sm font-medium ${pathname === "/" ? "text-primary" : "hover:text-primary"}`}>
            Inicio
          </Link>
          <Link
            href="/servicios"
            className={`text-sm font-medium ${pathname === "/servicios" ? "text-primary" : "hover:text-primary"}`}
          >
            Servicios
          </Link>
          <Link
            href="/servicios?categoria=Empleo"
            className={`text-sm font-medium relative group flex items-center gap-1 ${
              pathname.includes("categoria=Empleo") ? "text-primary" : "hover:text-primary"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Empleo</span>
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                pathname.includes("categoria=Empleo") ? "w-full" : "w-0 group-hover:w-full"
              }`}
            ></span>
          </Link>
          <Link href="/tienda" className="text-sm font-medium hover:text-primary">
            Tienda
          </Link>
          <Link href="/#about" className="text-sm font-medium hover:text-primary">
            Quiénes somos
          </Link>
          <Link href="/#contact" className="text-sm font-medium hover:text-primary">
            Contacto
          </Link>
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm">
            Iniciar sesión
          </Button>
          <Button variant="default" size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Publicar anuncio gratis
          </Button>
        </div>

        {/* Menú móvil */}
        <MobileNav currentPath={pathname} />
      </div>
    </header>
  )
}
