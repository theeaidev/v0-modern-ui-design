"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

interface MobileNavProps {
  currentPath: string
}

export function MobileNav({ currentPath }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Abrir menú</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white shadow-lg">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <Image src="/logo.png" alt="Directorio Latinos Logo" width={40} height={40} className="rounded-sm" />
              <span className="text-xl font-bold">Directorio Latinos</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-6 w-6 text-gray-500" />
              <span className="sr-only">Cerrar menú</span>
            </Button>
          </div>
          <div className="container py-4">
            <nav className="flex flex-col space-y-6">
              <Link
                href="/"
                className={`text-lg font-medium ${
                  currentPath === "/" ? "text-emerald-400" : "text-gray-800 hover:text-emerald-400"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/servicios"
                className={`text-lg font-medium ${
                  currentPath === "/servicios" ? "text-emerald-400" : "text-gray-800 hover:text-emerald-400"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Servicios
              </Link>
              <Link
                href="/tienda"
                className={`text-lg font-medium ${
                  currentPath === "/tienda" ? "text-emerald-400" : "text-gray-800 hover:text-emerald-400"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Tienda
              </Link>
              <Link
                href="/#about"
                className={`text-lg font-medium ${
                  currentPath === "/#about" ? "text-emerald-400" : "text-gray-800 hover:text-emerald-400"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Quiénes somos
              </Link>
              <Link
                href="/#contact"
                className={`text-lg font-medium ${
                  currentPath === "/#contact" ? "text-emerald-400" : "text-gray-800 hover:text-emerald-400"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Contacto
              </Link>

              {user ? (
                <>
                  <div className="border-t my-4"></div>
                  <div className="flex flex-col space-y-1 mb-2">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Cuenta verificada</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="text-lg font-medium text-gray-800 hover:text-emerald-400"
                    onClick={() => setIsOpen(false)}
                  >
                    Mi perfil
                  </Link>
                  <Link
                    href="/dashboard/anuncios"
                    className="text-lg font-medium text-gray-800 hover:text-emerald-400"
                    onClick={() => setIsOpen(false)}
                  >
                    Mis anuncios
                  </Link>
                  <Link
                    href="/dashboard/favoritos"
                    className="text-lg font-medium text-gray-800 hover:text-emerald-400"
                    onClick={() => setIsOpen(false)}
                  >
                    Favoritos
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-center border-gray-300 text-gray-800 mt-2"
                    onClick={() => {
                      signOut()
                      setIsOpen(false)
                    }}
                  >
                    Cerrar sesión
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-center border-gray-300 text-gray-800"
                  onClick={() => setIsOpen(false)}
                  asChild
                >
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
              )}

              <Button
                className="w-full justify-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-white"
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link href={user ? "/dashboard/publicar" : "/login"}>
                  <PlusCircle className="h-4 w-4" />
                  Publicar anuncio gratis
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
