"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { PlusCircle, Briefcase } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { UserDropdown } from "@/components/user-dropdown"
import { useAuth } from "@/contexts/auth-context"

export function MainNav() {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Directorio Latinos Logo" width={40} height={40} className="rounded-sm" />
          <div className="flex flex-col">
            <span className="text-xl font-bold">Directorio Latinos</span>
            <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-medium text-gray-500">de</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500/10 to-yellow-500/10 border border-red-200/50 shadow-sm">
                      <span className="text-[10px] uppercase tracking-wide font-semibold text-red-700">España</span>
                      <div className="w-5 h-3.5 overflow-hidden rounded-sm shadow-sm">
                        <img src="https://flagcdn.com/es.svg" alt="Bandera de España" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
          </div>
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
            Precios
          </Link>
          <Link href="/#about" className="text-sm font-medium hover:text-primary">
            Quiénes somos
          </Link>
          <Link href="/#contact" className="text-sm font-medium hover:text-primary">
            Contacto
          </Link>
        </nav>
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <UserDropdown />
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          )}
          <Button variant="default" size="sm" className="gap-2" asChild>
            <Link href={user ? "/dashboard/servicios/nuevo" : "/login"}>
              <PlusCircle className="h-4 w-4" />
              Publicar anuncio gratis
            </Link>
          </Button>
        </div>

        {/* Menú móvil */}
        <MobileNav currentPath={pathname} />
      </div>
    </header>
  )
}
